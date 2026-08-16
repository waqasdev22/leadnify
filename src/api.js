// Data layer for the dashboard.
// - If a backend is reachable (VITE_API_URL or local Express+MongoDB), it is used
//   AND mirrored to localStorage.
// - If no backend is reachable (e.g. the static Firebase site with no hosted API),
//   everything falls back to localStorage so create/edit/delete still persist
//   across reloads in that browser.
import { auth, db } from './firebase'
import { ref as dbRef, get as dbGet, set as dbSet } from 'firebase/database'
import { EMAILJS, emailReady } from './emailConfig'

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
  }
  return arr
}

// ---- Cloud file store (per user, cross-device) ------------------------------
// Small/medium files (OM/Flyer, confidential docs) are stored as a data URL under
// /data/<uid>/files/<key> so the SAME account can open them on any device. Large
// files stay device-local (IndexedDB) — see MAX_CLOUD_FILE.
export const MAX_CLOUD_FILE = 9 * 1024 * 1024 // 9 MB original file (~12 MB base64)
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
export const putFile = async (key, obj) => {
  const uid = currentUid()
  if (!uid) throw new Error('not signed in')
  await dbSet(dbRef(db, `data/${uid}/files/${key}`), clean(obj))
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
  await dbSet(dbRef(db, `public/packages/${id}`), clean(obj))
}
export const getPublicPackage = async (id) => {
  try { const snap = await dbGet(dbRef(db, `public/packages/${id}`)); return snap.val() || null } catch { return null }
}
export const delPublicPackage = async (id) => {
  try { await dbSet(dbRef(db, `public/packages/${id}`), null) } catch { /* ignore */ }
}

// ---- Auto-captured leads (from the public microsite "Request Information" form) ----
// Visitors POST leads to /public/leads/<ownerUid>; the owner drains them into My Leads.
export const drainPublicLeads = async () => {
  const uid = currentUid()
  if (!uid) return []
  try {
    const snap = await dbGet(dbRef(db, `public/leads/${uid}`))
    const val = snap.val()
    if (!val || typeof val !== 'object') return []
    const leads = Object.keys(val).map((k) => ({ _key: k, ...val[k] }))
    await dbSet(dbRef(db, `public/leads/${uid}`), null) // consume them so they aren't re-added
    return leads
  } catch {
    return []
  }
}

// Send a real email. Uses EmailJS (no server needed) once the 3 IDs are set in
// emailConfig.js; otherwise falls back to the local backend (only works when it runs).
// payload: { to, subject, message, name }
export const sendEmail = async (payload = {}) => {
  const to = payload.to || payload.email || ''
  const subject = payload.subject || 'MyCREBlueprint'
  const message = payload.message || payload.body || payload.text || ''
  if (emailReady()) {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS.SERVICE_ID,
        template_id: EMAILJS.TEMPLATE_ID,
        user_id: EMAILJS.PUBLIC_KEY,
        template_params: { to_email: to, subject, message, name: payload.name || 'MyCREBlueprint', email: to },
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
