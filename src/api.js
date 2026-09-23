// Data layer for the dashboard.
// - If a backend is reachable (VITE_API_URL or local Express+MongoDB), it is used
//   AND mirrored to localStorage.
// - If no backend is reachable (e.g. the static Firebase site with no hosted API),
//   everything falls back to localStorage so create/edit/delete still persist
//   across reloads in that browser.
import { auth, db, fdb } from './firebase'
import { ref as dbRef, get as dbGet, set as dbSet } from 'firebase/database'
import { doc as fsDoc, setDoc as fsSetDoc } from 'firebase/firestore'
import { EMAILJS, emailReady } from './emailConfig'

// Mirror a collection into Cloud Firestore (in addition to Realtime Database) so the data
// is visible there too. One document per collection; skipped if it's over ~900 KB (Firestore's
// 1 MB doc limit) — heavy image/file data stays in RTDB.
const mirrorToFirestore = async (uid, col, arr) => {
  try {
    const json = JSON.stringify(arr ?? [])
    if (json.length > 900 * 1024) return
    await fsSetDoc(fsDoc(fdb, 'appdata', uid, 'collections', col), { items: JSON.parse(json) })
  } catch {
    /* ignore — RTDB remains the source of truth */
  }
}

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// ---- Firebase Realtime Database (cloud sync, per user) ----------------------
// Primary store: each signed-in user's data lives under /data/<uid>/<col> in the
// cloud, so the SAME account sees the SAME data on every device (PC, phone, ...).
// localStorage stays as an offline cache. Firebase is already wired (Auth + Hosting).
const currentUid = () => {
  try { return auth.currentUser ? auth.currentUser.uid : '' } catch { return '' }
}
const dataPath = (uid, col) => `data/${uid}/${col}`
// RTDB rejects `undefined` values — strip them (and normalise) via a JSON round-trip.
const clean = (arr) => JSON.parse(JSON.stringify(arr ?? []))
// RTDB returns a contiguous array as an array, but a sparse/keyed one as an object.
const toArray = (val) => (val == null ? null : Array.isArray(val) ? val.filter((x) => x != null) : Object.values(val))

// Attach the signed-in user's Firebase ID token so the backend can verify each request.
// Waits for Firebase to restore the session first (so the very first load is authenticated).
async function authHeader() {
  try {
    if (auth.authStateReady) await auth.authStateReady()
    const u = auth.currentUser
    if (u) return { Authorization: `Bearer ${await u.getIdToken()}` }
  } catch {
    /* not signed in / offline — request goes without a token */
  }
  return {}
}

// ---- localStorage cache (per-user) ------------------------------------------
// Namespaced by the logged-in user so one account's cached data never leaks to another.
let API_NS = ''
export const setApiNamespace = (ns) => { API_NS = ns || '' }
const LS_KEY = (col) => `crebuilder_db_${API_NS}_${col}`
const lsGet = (col) => {
  try {
    const v = localStorage.getItem(LS_KEY(col))
    return v ? JSON.parse(v) : null
  } catch {
    return null
  }
}
const lsSet = (col, arr) => {
  try {
    localStorage.setItem(LS_KEY(col), JSON.stringify(arr))
  } catch {
    /* storage full / disabled — ignore */
  }
}

async function request(path, options = {}) {
  const authH = await authHeader()
  const res = await fetch(BASE + path, { ...options, headers: { ...(options.headers || {}), ...authH } })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

// GET all documents in a collection ('packages' | 'listings' | 'dealrooms' | ...).
// Reads the signed-in user's cloud data (Firebase RTDB) so it's the same on every
// device; falls back to the local cache when signed out or offline.
export const getCol = async (col) => {
  const uid = currentUid()
  if (uid) {
    try {
      const snap = await dbGet(dbRef(db, dataPath(uid, col)))
      const arr = toArray(snap.val())
      if (arr != null) {
        lsSet(col, arr) // refresh the offline cache
        return arr
      }
      // No cloud data yet for this account — use the local cache if any (first sync).
      return lsGet(col)
    } catch {
      return lsGet(col) // cloud unreachable — serve the local cache
    }
  }
  return lsGet(col)
}

// Replace the whole collection with `arr` (persists create/edit/delete/toggle).
// Writes to the local cache first (instant, offline-safe), then to the cloud so the
// same account sees it on other devices.
export const putCol = async (col, arr) => {
  lsSet(col, arr)
  const uid = currentUid()
  if (uid) {
    try {
      await dbSet(dbRef(db, dataPath(uid, col)), clean(arr))
    } catch {
      /* offline / rules — the local save above already succeeded */
    }
    mirrorToFirestore(uid, col, arr) // also mirror into Cloud Firestore (best-effort)
  }
  return arr
}

// ---- Key/value cloud store (per user) ---------------------------------------
// Everything the app keeps in "persistent state" (settings, per-room data, etc.) is
// mirrored to /data/<uid>/kv/<key> so the WHOLE dashboard syncs across devices.
const KV_MAX = 700 * 1024 // skip very large values (keep them local only)
const kvKey = (k) => String(k).replace(/[.#$/[\]]/g, '_')
export const kvGet = async (key) => {
  const uid = currentUid()
  if (!uid) return undefined
  try {
    const snap = await dbGet(dbRef(db, `data/${uid}/kv/${kvKey(key)}`))
    const v = snap.val()
    return v === null ? undefined : v
  } catch {
    return undefined
  }
}
export const kvSet = async (key, value) => {
  const uid = currentUid()
  if (!uid) return
  try {
    const json = JSON.stringify(value)
    if (json && json.length > KV_MAX) return // too big for the cloud — stays in localStorage
    await dbSet(dbRef(db, `data/${uid}/kv/${kvKey(key)}`), value === undefined ? null : JSON.parse(json))
  } catch {
    /* ignore */
  }
}

// ---- Cloud file store (per user, cross-device) ------------------------------
// Small/medium files (OM/Flyer, confidential docs) are stored as a data URL under
// /data/<uid>/files/<key> so the SAME account can open them on any device. Large
// files stay device-local (IndexedDB) — see MAX_CLOUD_FILE.
export const MAX_CLOUD_FILE = 25 * 1024 * 1024 // 25 MB original file (~33 MB base64) — OMs run 15 MB+
export const getFile = async (key) => {
  const uid = currentUid()
  if (!uid) return null
  try {
    const snap = await dbGet(dbRef(db, `data/${uid}/files/${key}`))
    return snap.val() || null
  } catch {
    return null
  }
}
// Big files (15 MB+ OMs) are written via the RTDB REST API, which allows up to 256 MB per write.
// The JS SDK caps a single write at ~16 MB, which fails once a 15 MB PDF is base64-encoded (~20 MB)
// — that was the "Upload failed" on large OMs. REST needs the signed-in user's ID token.
const RTDB_REST = 'https://cre-dashboard-ba596-default-rtdb.firebaseio.com'
const restSet = async (path, value) => {
  const u = auth.currentUser
  const token = u ? await u.getIdToken() : ''
  const res = await fetch(`${RTDB_REST}/${path}.json${token ? `?auth=${token}` : ''}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value === undefined ? null : value),
  })
  if (!res.ok) throw new Error(`RTDB REST ${res.status}`)
  return res.json()
}

export const putFile = async (key, obj) => {
  const uid = currentUid()
  if (!uid) throw new Error('not signed in')
  await restSet(`data/${uid}/files/${key}`, clean(obj))
}
export const delFile = async (key) => {
  const uid = currentUid()
  if (!uid) return
  try { await dbSet(dbRef(db, `data/${uid}/files/${key}`), null) } catch { /* ignore */ }
}

// ---- Public marketing package (readable by the anonymous public microsite) --
// Stored at /public/packages/<listingId> so the "Download Package" button works on
// ANY device/visitor. The microsite reads it via the RTDB REST API (no SDK/auth).
export const putPublicPackage = async (id, obj) => {
  const uid = currentUid()
  if (!uid) throw new Error('not signed in')
  await restSet(`public/packages/${id}`, clean(obj)) // REST → supports 15 MB+ OMs (SDK caps at ~16 MB/write)
}
export const getPublicPackage = async (id) => {
  try { const snap = await dbGet(dbRef(db, `public/packages/${id}`)); return snap.val() || null } catch { return null }
}
export const delPublicPackage = async (id) => {
  try { await dbSet(dbRef(db, `public/packages/${id}`), null) } catch { /* ignore */ }
}

// Publish the public microsite data (listings + brand) so the ?hub=<slug> link works on
// ANY device/browser, not just the one that saved it. The microsite fetches it via REST.
export const putPublicHub = async (slug, data) => {
  if (!slug) return
  try { await dbSet(dbRef(db, `public/hub/${slug}`), clean(data)) } catch { /* ignore */ }
}

// A listing's gallery images live separately at /public/gallery/<id> (not in the hub) so
// the hub stays small; the microsite fetches them on demand when the Gallery is shown.
export const putGallery = async (id, images) => {
  const uid = currentUid()
  if (!uid || !id) return
  try { await dbSet(dbRef(db, `public/gallery/${id}`), { images: clean(images || []) }) } catch { /* ignore */ }
}

// ---- Auto-captured leads (from the public microsite "Request Information" form) ----
// Visitors POST leads to a shared team bucket (public/leads/vaziamts) AND to the hub owner's uid
// bucket. Every signed-in team member reads BOTH — WITHOUT deleting them — so a lead is never
// missed and never "consumed" by whichever session happened to poll first. The caller de-dupes on
// the stable per-lead key (bucket + push id), so each lead is added to My Leads exactly once.
const SHARED_LEADS_KEY = 'vaziamts'
export const drainPublicLeads = async () => {
  const uid = currentUid()
  if (!uid) return []
  const out = []
  for (const key of [SHARED_LEADS_KEY, uid]) {
    try {
      const snap = await dbGet(dbRef(db, `public/leads/${key}`))
      const val = snap.val()
      if (val && typeof val === 'object') {
        Object.keys(val).forEach((k) => out.push({ _key: key + '::' + k, ...val[k] }))
      }
    } catch { /* ignore this bucket */ }
  }
  return out
}

// Send a real email. Uses EmailJS (no server needed) once the 3 IDs are set in
// emailConfig.js; otherwise falls back to the local backend (only works when it runs).
// payload: { to, subject, message, name }
export const sendEmail = async (payload = {}) => {
  const to = payload.to || payload.email || ''
  const subject = payload.subject || 'Leadnify.io'
  const message = payload.message || payload.body || payload.text || ''
  if (emailReady()) {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS.SERVICE_ID,
        template_id: EMAILJS.TEMPLATE_ID,
        user_id: EMAILJS.PUBLIC_KEY,
        template_params: { to_email: to, subject, message, name: payload.name || 'Leadnify.io', email: to },
      }),
    })
    if (!res.ok) throw new Error(`EmailJS ${res.status}`)
    return true
  }
  return request('/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

// Save the logged-in user (best-effort; ignored when the backend is offline).
export const saveUser = async (user) => {
  lsSet('user', user)
  try {
    return await request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
  } catch {
    return user
  }
}
