// Data layer for the dashboard.
// - If a backend is reachable (VITE_API_URL or local Express+MongoDB), it is used
//   AND mirrored to localStorage.
// - If no backend is reachable (e.g. the static Firebase site with no hosted API),
//   everything falls back to localStorage so create/edit/delete still persist
//   across reloads in that browser.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

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

async function request(path, options) {
  const res = await fetch(BASE + path, options)
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
