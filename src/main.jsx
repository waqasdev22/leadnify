import React from 'react'
import ReactDOM from 'react-dom/client'
import App, {
  buildMicrositeHtml,
  buildDealRoomHtml,
  toMicrositeItems,
  INITIAL_LISTINGS,
} from './App.jsx'
import './index.css'

// Public routes: "?hub=<slug>" renders the listings microsite; "?room=<id>" renders
// a deal room's gated NDA landing page. Both are opened from Copy Link / Preview and
// work in any new tab.
const params = new URLSearchParams(window.location.search)

// OAuth popup callback: when a "Connect" popup returns here with ?code&state and it was
// opened by the dashboard, hand the code back to the opener and close — the main window
// never reloads. (Only runs inside the popup, i.e. when window.opener exists.)
if (params.get('code') !== null && params.get('state') !== null && window.opener && !window.opener.closed) {
  try {
    window.opener.postMessage(
      { type: 'oauth-connect', code: params.get('code'), state: params.get('state') },
      window.location.origin,
    )
  } catch (e) {
    /* ignore */
  }
  document.body.style.cssText = 'display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;color:#64748b'
  document.body.textContent = 'Connected — you can close this window.'
  window.close()
} else if (params.get('hub') !== null) {
  let saved = null
  try {
    saved = JSON.parse(localStorage.getItem('crebuilder_hub') || 'null')
  } catch {
    saved = null
  }
  const items =
    saved && Array.isArray(saved.items) && saved.items.length
      ? saved.items
      : toMicrositeItems(INITIAL_LISTINGS)
  // Explicit URL params (?t= theme, ?c= colour) win — they carry the theme into
  // embeds/shared links where localStorage isn't available; otherwise fall back
  // to the owner's saved selection, then the default.
  const template = params.get('t') || (saved && saved.template) || 'Modern'
  const primary =
    (params.get('c') ? '#' + params.get('c') : null) ||
    (saved && saved.primary) ||
    '#F97316'
  // ?v= view wins (for embeds); else the owner's saved Default View, then the default.
  const defaultView = params.get('v') || (saved && saved.defaultView) || 'mapgrid'

  let savedUid = ''
  try { savedUid = localStorage.getItem('crebuilder_owner_uid') || '' } catch { savedUid = '' }
  const ownerUid = (saved && saved.ownerUid) || savedUid || ''
  document.open()
  document.write(buildMicrositeHtml(items, primary, template, defaultView, ownerUid))
  document.close()
} else if (params.get('room') !== null) {
  const id = params.get('room')
  let room = null
  try {
    room = JSON.parse(localStorage.getItem('crebuilder_room_' + id) || 'null')
  } catch {
    room = null
  }
  if (!room) room = { id, name: 'Confidential Listing', address: '', image: '' }
  const agent = { name: 'Neil Naran', email: 'Neil@valuereis.com' }

  document.open()
  document.write(buildDealRoomHtml(room, agent))
  document.close()
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
