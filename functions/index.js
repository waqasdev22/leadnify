/**
 * Leadnify.io — backend Cloud Functions.
 *
 * adminSetPassword: an Owner/Admin sets a team member's password directly (so the member can then
 * sign in with the password chosen for them — no reset email needed). Setting another user's
 * password can only be done server-side with the Admin SDK, and only by an Owner/Admin.
 *
 * (The LinkedIn/Instagram social-connect function was removed from deployment: it required
 * Secret Manager secrets that are not configured, which blocked deploying anything in this
 * codebase. Social connect is a future feature and can be re-added with its secrets set.)
 */
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const archiver = require('archiver')

admin.initializeApp()
const db = admin.database()

const STORAGE_BUCKET = 'cre-dashboard-ba596.firebasestorage.app'

exports.adminSetPassword = onCall({ cors: true }, async (request) => {
  const callerUid = request.auth && request.auth.uid
  if (!callerUid) throw new HttpsError('unauthenticated', 'Sign in first.')

  const roleSnap = await db.ref(`users/${callerUid}/role`).get()
  const callerRole = roleSnap.val()
  if (callerRole !== 'Owner' && callerRole !== 'Admin') {
    throw new HttpsError('permission-denied', 'Only an Owner or Admin can set a member’s password.')
  }

  const { uid, password } = request.data || {}
  if (!uid || typeof uid !== 'string') throw new HttpsError('invalid-argument', 'A target user uid is required.')
  if (uid === callerUid) throw new HttpsError('failed-precondition', 'Use Settings → Change Password to change your own password.')
  if (!password || String(password).length < 6) {
    throw new HttpsError('invalid-argument', 'Password must be at least 6 characters.')
  }

  await admin.auth().updateUser(uid, { password: String(password) })
  return { ok: true }
})

/* -------------------------------------------------------------------------- */
/*  Secure one-time download link  (GET /d/<token>)                            */
/*                                                                            */
/*  An approved NDA visitor is emailed a link like https://leadnify.io/d/<t>. */
/*  This function is the ONLY way that file is served. It enforces:           */
/*    - the approval is still 'approved' (revoke kills the link),             */
/*    - the link has not expired (24h from approval),                         */
/*    - the link has not already been used (atomic one-time via transaction). */
/*  Files are streamed straight from Storage with the Admin SDK, so the raw   */
/*  Storage URLs are never handed to the visitor and cannot be re-shared.     */
/* -------------------------------------------------------------------------- */

// Turn a stored file URL into a Storage object path (or a data: URL passthrough).
function urlToObjectPath(url) {
  const s = String(url || '')
  if (s.indexOf('data:') === 0) return null // handled separately
  let m = s.match(/\/o\/([^?]+)/) // firebasestorage.googleapis.com/v0/b/<bucket>/o/<ENCODED>
  if (m) { try { return decodeURIComponent(m[1]) } catch { return m[1] } }
  m = s.match(/storage\.googleapis\.com\/[^/]+\/(.+?)(\?|$)/) // storage.googleapis.com/<bucket>/<path>
  if (m) { try { return decodeURIComponent(m[1]) } catch { return m[1] } }
  return null
}
function safeName(name, fallback) {
  const n = String(name || fallback || 'download').replace(/[\\/:*?"<>|\r\n]+/g, '_').trim()
  return n || fallback || 'download'
}
function dataUrlToBuffer(url) {
  const m = String(url || '').match(/^data:([^;,]+)?(;base64)?,(.*)$/)
  if (!m) return null
  const isB64 = !!m[2]
  const data = m[3] || ''
  try { return Buffer.from(isB64 ? data : decodeURIComponent(data), isB64 ? 'base64' : 'utf8') } catch { return null }
}
function noticePage(title, message) {
  const t = String(title).replace(/</g, '&lt;')
  const m = String(message).replace(/</g, '&lt;')
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + t +
    '</title></head><body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;color:#0f172a">' +
    '<div style="max-width:460px;margin:12vh auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">' +
    '<div style="border-bottom:2px solid #0f172a;padding:16px 24px"><span style="font-size:18px;font-weight:700">Leadnify.io</span>' +
    '<span style="display:block;font-size:10px;letter-spacing:2px;color:#94a3b8;margin-top:2px">COMMERCIAL REAL ESTATE</span></div>' +
    '<div style="padding:28px 24px"><h1 style="margin:0 0 8px;font-size:20px">' + t + '</h1>' +
    '<p style="margin:0;font-size:14px;color:#475569;line-height:1.6">' + m + '</p></div></div></body></html>'
}

exports.dl = onRequest({ cors: true, timeoutSeconds: 300, memory: '512MiB' }, async (req, res) => {
  try {
    // Token can arrive as /d/<token> (hosting rewrite) or ?t=<token>.
    let token = (req.query.t || req.query.token || '').toString().trim()
    if (!token) {
      const segs = String(req.path || '').split('/').filter(Boolean)
      if (segs.length) token = decodeURIComponent(segs[segs.length - 1])
    }
    if (!token || !/^[A-Za-z0-9_-]{8,128}$/.test(token)) {
      res.status(400).set('Content-Type', 'text/html').send(noticePage('Invalid link', 'This download link is missing or malformed.'))
      return
    }

    const ref = db.ref('public/dl_tokens/' + token)
    const snap = await ref.get()
    const t = snap.val()
    if (!t) {
      res.status(404).set('Content-Type', 'text/html').send(noticePage('Link not found', 'This download link is invalid or has already been removed.'))
      return
    }
    if (t.expiresAt && Date.now() > Number(t.expiresAt)) {
      res.status(410).set('Content-Type', 'text/html').send(noticePage('Link expired', 'This download link has expired. Links are valid for 24 hours. Please contact the listing broker to request access again.'))
      return
    }
    if (t.used === true) {
      res.status(410).set('Content-Type', 'text/html').send(noticePage('Already used', 'This download link has already been used. For security, each link works only once. Please contact the listing broker if you need access again.'))
      return
    }

    // The approval must still be active (a revoke disables the link immediately).
    if (t.uid && t.key) {
      const aSnap = await db.ref('public/approvals/' + t.uid + '/' + t.key + '/status').get()
      if (aSnap.val() !== 'approved') {
        res.status(410).set('Content-Type', 'text/html').send(noticePage('Access unavailable', 'Your access to these materials is no longer active. Please contact the listing broker.'))
        return
      }
    }

    // Atomically claim the link (one-time). If another request already claimed it, abort.
    const txn = await ref.child('used').transaction((cur) => (cur === true ? undefined : true))
    if (!txn.committed || txn.snapshot.val() !== true) {
      res.status(410).set('Content-Type', 'text/html').send(noticePage('Already used', 'This download link has already been used. For security, each link works only once.'))
      return
    }
    ref.update({ usedAt: admin.database.ServerValue.TIMESTAMP }).catch(() => {})

    const files = Array.isArray(t.files) ? t.files.filter((f) => f && f.url) : []
    if (!files.length) {
      res.status(404).set('Content-Type', 'text/html').send(noticePage('No documents', 'No documents are attached to this listing yet. Please contact the listing broker.'))
      return
    }

    const bucket = admin.storage().bucket(STORAGE_BUCKET)

    // Single file → stream it directly as an attachment.
    if (files.length === 1) {
      const f = files[0]
      const buf = dataUrlToBuffer(f.url)
      if (buf) {
        res.setHeader('Content-Disposition', 'attachment; filename="' + safeName(f.name, 'document.pdf') + '"')
        res.setHeader('Content-Type', 'application/octet-stream')
        res.status(200).send(buf)
        return
      }
      const path = urlToObjectPath(f.url)
      if (!path) { res.status(500).set('Content-Type', 'text/html').send(noticePage('Unavailable', 'The document could not be located. Please contact the listing broker.')); return }
      const gf = bucket.file(path)
      const [exists] = await gf.exists()
      if (!exists) { res.status(404).set('Content-Type', 'text/html').send(noticePage('Unavailable', 'The document could not be found. Please contact the listing broker.')); return }
      res.setHeader('Content-Disposition', 'attachment; filename="' + safeName(f.name, 'document.pdf') + '"')
      res.setHeader('Content-Type', 'application/octet-stream')
      gf.createReadStream().on('error', () => { try { res.status(500).end() } catch { /* ignore */ } }).pipe(res)
      return
    }

    // Multiple files → stream a single zip so one click delivers everything (one token use).
    res.setHeader('Content-Disposition', 'attachment; filename="' + safeName((t.prop || 'listing') + '-documents', 'documents') + '.zip"')
    res.setHeader('Content-Type', 'application/zip')
    const archive = archiver('zip', { zlib: { level: 9 } })
    archive.on('error', () => { try { res.status(500).end() } catch { /* ignore */ } })
    archive.pipe(res)
    const seen = {}
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      let nm = safeName(f.name, 'document-' + (i + 1))
      if (seen[nm]) { nm = (i + 1) + '-' + nm } seen[nm] = true
      const buf = dataUrlToBuffer(f.url)
      if (buf) { archive.append(buf, { name: nm }); continue }
      const path = urlToObjectPath(f.url)
      if (!path) continue
      const gf = bucket.file(path)
      try { const [exists] = await gf.exists(); if (!exists) continue } catch { continue }
      archive.append(gf.createReadStream(), { name: nm })
    }
    await archive.finalize()
  } catch (err) {
    try { res.status(500).set('Content-Type', 'text/html').send(noticePage('Something went wrong', 'We could not process this download right now. Please try again later or contact the listing broker.')) } catch { /* ignore */ }
  }
})
