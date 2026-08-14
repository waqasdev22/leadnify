// Data layer for the dashboard.
// - If a backend is reachable (VITE_API_URL or local Express+MongoDB), it is used
//   AND mirrored to localStorage.
// - If no backend is reachable (e.g. the static Firebase site with no hosted API),
//   everything falls back to localStorage so create/edit/delete still persist
//   across reloads in that browser.
import { auth } from './firebase'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

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

// ---- localStorage cache -----------------------------------------------------
const LS_KEY = (col) => `crebuilder_db_${col}`
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

// GET all documents in a collection ('packages' | 'listings' | 'dealrooms').
// Prefers the backend; falls back to the local cache when the backend is offline.
export const getCol = async (col) => {
  try {
    const data = await request(`/${col}`)
    if (Array.isArray(data) && data.length) {
      lsSet(col, data)
      return data
    }
    // Backend reachable but empty — use local cache if we have richer data.
    return lsGet(col) || data
  } catch {
    // Backend unreachable — serve whatever is cached locally.
    return lsGet(col)
  }
}

// Replace the whole collection with `arr` (persists create/edit/delete/toggle).
// Always writes to localStorage first so data survives even with no backend.
export const putCol = async (col, arr) => {
  lsSet(col, arr)
  try {
    return await request(`/${col}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(arr),
    })
  } catch {
    return arr // offline — the local save above already succeeded
  }
}

// Send a real email through the backend (SMTP). Throws if the backend rejects it.
export const sendEmail = (payload) =>
  request('/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

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
