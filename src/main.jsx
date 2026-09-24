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

// Clean per-property URL: leadnify.io/<slug> (no query string). There's one shared team hub, so a
// single path segment that isn't a real file is treated as a property slug to open inside that hub.
const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '')
const cleanSlug = rawPath && !rawPath.includes('/') && !rawPath.includes('.') ? decodeURIComponent(rawPath) : ''

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
} else if (params.get('hub') !== null || cleanSlug) {
  const slug = params.get('hub') || 'vaziamts'
  const RTDB = 'https://cre-dashboard-ba596-default-rtdb.firebaseio.com'
  const renderHub = (saved) => {
    let items =
      saved && Array.isArray(saved.items) && saved.items.length
        ? saved.items
        : toMicrositeItems(INITIAL_LISTINGS)
    // Draft/unlisted preview (#13): when opened with ?pv=1, merge the previewed listing (saved to
    // localStorage by the dashboard's Preview button) so its detail page renders even though it isn't
    // in the published hub.
    if (params.get('pv') !== null) {
      try {
        const pv = JSON.parse(localStorage.getItem('cre_preview') || 'null')
        if (pv && pv.id != null) {
          items = [pv, ...items.filter((it) => String(it.id) !== String(pv.id))]
        }
      } catch { /* ignore */ }
    }
    // Explicit URL params (?t= theme, ?c= colour) win; else the owner's saved choice, then default.
    const template = params.get('t') || (saved && saved.template) || 'Modern'
    const primary =
      (params.get('c') ? '#' + params.get('c') : null) ||
      (saved && saved.primary) ||
      '#F97316'
    const defaultView = params.get('v') || (saved && saved.defaultView) || 'mapgrid'
    let savedUid = ''
    try { savedUid = localStorage.getItem('crebuilder_owner_uid') || '' } catch { savedUid = '' }
    const ownerUid = (saved && saved.ownerUid) || savedUid || ''
    const ownerEmail = (saved && saved.ownerEmail) || ''
    const ownerEmails = (saved && Array.isArray(saved.ownerEmails) && saved.ownerEmails.length) ? saved.ownerEmails : (ownerEmail ? [ownerEmail] : [])
    const logoUrl = (saved && saved.logoUrl) || ''
    document.open()
    document.write(buildMicrositeHtml(items, primary, template, defaultView, ownerUid, ownerEmail, logoUrl, ownerEmails, cleanSlug))
    document.close()
  }
  const fromLocal = () => {
    let saved = null
    try { saved = JSON.parse(localStorage.getItem('crebuilder_hub') || 'null') } catch { saved = null }
    renderHub(saved)
  }
  // Prefer the cloud copy so the link works on ANY device/browser; fall back to local.
  fetch(RTDB + '/public/hub/' + encodeURIComponent(slug) + '.json')
    .then((r) => r.json())
    .then((cloud) => {
      if (cloud && Array.isArray(cloud.items) && cloud.items.length) renderHub(cloud)
      else fromLocal()
    })
    .catch(fromLocal)
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
