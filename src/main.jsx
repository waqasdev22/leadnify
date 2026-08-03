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

if (params.get('hub') !== null) {
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
  const primary =
    (saved && saved.primary) ||
    (params.get('c') ? '#' + params.get('c') : '#F97316')
  const template = (saved && saved.template) || params.get('t') || 'Modern'

  document.open()
  document.write(buildMicrositeHtml(items, primary, template))
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
