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

// Clean per-property URL: leadnify.io/<slug> or leadnify.io/<hub>/<slug> (no query string). There's
// one shared team hub, so the LAST path segment (that isn't a real file) is treated as a property
// slug to open inside that hub; a segment matching no property simply shows the full listings.
const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '')
const pathSegs = rawPath && !rawPath.includes('.') ? rawPath.split('/').filter(Boolean) : []
const cleanSlug = pathSegs.length ? decodeURIComponent(pathSegs[pathSegs.length - 1]) : ''

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
    // Draft/unlisted preview (#13): merge the previewed listing (saved to localStorage by the
    // dashboard's Preview button) so its detail renders even though it isn't in the published hub.
    // This happens with ?pv=1 OR when the clean path points at that exact preview (its slug/id
    // matches) — so a draft opens at its clean URL for the owner, while a visitor (no saved preview)
    // still can't see it. Merging only when the path matches keeps stale previews out of the grid.
    try {
      const pv = JSON.parse(localStorage.getItem('cre_preview') || 'null')
      if (pv && pv.id != null) {
        const matchesPath = cleanSlug && (String(pv.slug || '') === cleanSlug || String(pv.id) === cleanSlug)
        if (params.get('pv') !== null || matchesPath) {
          items = [pv, ...items.filter((it) => String(it.id) !== String(pv.id))]
        }
      }
    } catch { /* ignore */ }
    // Explicit URL params (?t= theme, ?c= colour) win; else the owner's saved choice, then default.
    const template = params.get('t') || (saved && saved.template) || 'Modern'
    const primary =
      (params.get('c') ? '#' + params.get('c') : null) ||
      (saved && saved.primary) ||
      '#F97316'
    // Map + Grid is the default public view (client request); an explicit ?v= in the link still wins.
    const defaultView = params.get('v') || 'mapgrid'
    let savedUid = ''
    try { savedUid = localStorage.getItem('crebuilder_owner_uid') || '' } catch { savedUid = '' }
    const ownerUid = (saved && saved.ownerUid) || savedUid || ''
    const ownerEmail = (saved && saved.ownerEmail) || ''
    const ownerEmails = (saved && Array.isArray(saved.ownerEmails) && saved.ownerEmails.length) ? saved.ownerEmails : (ownerEmail ? [ownerEmail] : [])
    const logoUrl = (saved && saved.logoUrl) || ''
    // Start downloading the opened property's banner BEFORE we rewrite the document, so it's already
    // in-flight (warm cache) by the time the new page's <img> parses — no "banner appears late".
    try {
      const openItem = cleanSlug ? items.find((it) => String(it.slug || '') === cleanSlug || String(it.id) === cleanSlug) : null
      if (openItem && openItem.image && !/^data:/i.test(openItem.image)) { const im = new Image(); im.src = openItem.image }
    } catch { /* ignore */ }
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
