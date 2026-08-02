// Tiny fetch wrapper for the Express + MongoDB backend.
// - Local dev: falls back to http://localhost:4000/api (your local server).
// - Production (Vercel): set VITE_API_URL to your deployed backend, e.g.
//   https://your-backend.onrender.com/api
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function request(path, options) {
  const res = await fetch(BASE + path, options)
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

// GET all documents in a collection ('packages' | 'listings' | 'dealrooms')
export const getCol = (col) => request(`/${col}`)

// Replace the whole collection with `arr` (persists create/edit/delete/toggle)
export const putCol = (col, arr) =>
  request(`/${col}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arr),
  })

// Save the logged-in user to MongoDB (users collection)
export const saveUser = (user) =>
  request('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
