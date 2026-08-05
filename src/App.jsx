import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { jsPDF } from 'jspdf'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getCol, putCol, saveUser } from './api'
import { auth, googleProvider, db, createMemberAccount, uploadToStorage } from './firebase'
import { ref as dbRef, get as dbGet, set as dbSet, update as dbUpdate, onValue } from 'firebase/database'
import { PERMISSION_GROUPS, ROLE_PRESETS, ROLES, ROLE_INFO, resolvePerms, decodeOverrides, encodeOverrides } from './permissions'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import {
  Menu,
  Home,
  Box,
  Globe,
  FolderLock,
  Contact,
  Wand2,
  Building2,
  FileText,
  Mail,
  BookOpen,
  Search,
  Plus,
  GripVertical,
  LogOut,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Grid2X2,
  List,
  Pencil,
  FileDown,
  Send,
  Copy,
  Repeat2,
  Share2,
  AtSign,
  Share,
  Trash2,
  MapPin,
  CheckCircle2,
  Clock,
  BadgeCheck,
  DollarSign,
  Building,
  Eye,
  EyeOff,
  MoreHorizontal,
  Target,
  ArrowUpDown,
  User,
  Check,
  X,
  AlertTriangle,
  Info,
  Zap,
  ClipboardList,
  TrendingUp,
  BarChart3,
  Camera,
  Image as ImageIcon,
  ImagePlus,
  Type,
  Save,
  FilePlus,
  Columns2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  ShoppingCart,
  Utensils,
  GraduationCap,
  Landmark,
  Fuel,
  Hotel,
  Pill,
  ListChecks,
  Crown,
  UserCircle,
  UserPlus,
  Settings,
  ShieldCheck,
  PieChart,
  Scale,
  Users,
  Store,
  Factory,
  Trees,
  HeartPulse,
  ArrowLeft,
  ArrowRight,
  Palette,
  LayoutList,
  ShoppingBag,
  Warehouse,
  Mountain,
  BedDouble,
  Container,
  Layers,
  FileSignature,
  Star,
  Map,
  ExternalLink,
  Link2,
  Download,
  LayoutGrid,
  Rows3,
  Maximize2,
  Code2,
  HelpCircle,
  Upload,
  Bold,
  Italic,
  Underline,
  ListOrdered,
  Undo2,
  Redo2,
  Lightbulb,
  ChevronUp,
  Percent,
  Calendar,
  Library,
  Car,
  Navigation,
  RefreshCw,
  Train,
  Plane,
  Frame,
  Video,
  Route,
  Calculator,
  Lock,
} from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*  Mock Data (initial seed — everything below is live, editable state)       */
/* -------------------------------------------------------------------------- */

const CURRENT_USER = {
  name: 'Waqas',
  email: 'waqasdev@gmail.com',
  role: 'Broker',
  initials: 'W',
}

// Team members you can create a document on behalf of.
const TEAM_MEMBERS = [
  { id: 'm1', name: 'Maya Chen', email: 'maya@valuereis.com', initials: 'MC' },
  { id: 'm2', name: 'Devon Park', email: 'devon@valuereis.com', initials: 'DP' },
  { id: 'm3', name: 'Sam Rivera', email: 'sam@valuereis.com', initials: 'SR' },
]

const propertyImage = (seed) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=800&q=60`

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=60'

const INITIAL_PACKAGES = [
  {
    id: 1,
    title: 'Riverside Business Park',
    address: '1200 Riverside Dr, Austin, TX 78701',
    status: 'Complete',
    owner: 'my',
    image: propertyImage('1486406146926-c627a92ad1ab'),
    tags: ['Net Lease'],
    docType: 'Offering Memorandum',
    propertyType: 'Office / Medical',
    updated: '2d ago',
  },
  {
    id: 2,
    title: 'Summit Retail Center',
    address: '455 Market St, Dallas, TX 75201',
    status: 'Draft',
    owner: 'my',
    image: '',
    tags: ['Retail'],
    docType: 'Offering Memorandum',
    propertyType: 'Retail',
    progress: 61,
    updated: '5h ago',
  },
  {
    id: 3,
    title: 'Northgate Logistics Hub',
    address: '8900 Industrial Pkwy, Houston, TX 77002',
    status: 'In Progress',
    owner: 'team',
    image: propertyImage('1553413077-190dd305871c'),
    tags: ['Industrial'],
    docType: 'Brochure',
    propertyType: 'Industrial',
    progress: 40,
    updated: '1d ago',
  },
  {
    id: 4,
    title: 'Lakeview Medical Plaza',
    address: '77 Wellness Ave, San Antonio, TX 78205',
    status: 'Complete',
    owner: 'team',
    image: propertyImage('1519494026892-80bbd2d6fd0d'),
    tags: ['Medical'],
    docType: 'Offering Memorandum',
    propertyType: 'Office / Medical',
    updated: '3d ago',
  },
  {
    id: 5,
    title: 'The Foundry Lofts',
    address: '210 Warehouse Row, Austin, TX 78702',
    status: 'Draft',
    owner: 'my',
    image: '',
    tags: ['Multifamily'],
    docType: 'Brochure',
    propertyType: 'Multifamily',
    progress: 28,
    updated: '6h ago',
  },
  {
    id: 6,
    title: 'Cypress Corporate Tower',
    address: '500 Congress Ave, Austin, TX 78701',
    status: 'Complete',
    owner: 'my',
    image: propertyImage('1497366216548-37526070297c'),
    tags: ['Net Lease'],
    docType: 'Offering Memorandum',
    propertyType: 'Office / Medical',
    updated: '4d ago',
  },
]

export const INITIAL_LISTINGS = [
  {
    id: 1,
    name: 'Riverside Business Park',
    address: '1200 Riverside Dr, Austin, TX',
    price: 8450000,
    type: 'Office / Medical',
    size: '42,000 SF',
    status: 'Active',
    image: propertyImage('1486406146926-c627a92ad1ab'),
  },
  {
    id: 2,
    name: 'Summit Retail Center',
    address: '455 Market St, Dallas, TX',
    price: 5200000,
    type: 'Retail',
    size: '18,500 SF',
    status: 'Active',
    image: propertyImage('1560518883-ce09059eeffa'),
  },
  {
    id: 3,
    name: 'Northgate Logistics Hub',
    address: '8900 Industrial Pkwy, Houston, TX',
    price: 12750000,
    type: 'Industrial',
    size: '110,000 SF',
    status: 'Pending',
    image: propertyImage('1553413077-190dd305871c'),
  },
  {
    id: 4,
    name: 'Lakeview Medical Plaza',
    address: '77 Wellness Ave, San Antonio, TX',
    price: 6900000,
    type: 'Office / Medical',
    size: '31,200 SF',
    status: 'Sold',
    image: propertyImage('1519494026892-80bbd2d6fd0d'),
  },
  {
    id: 5,
    name: 'Cypress Corporate Tower',
    address: '500 Congress Ave, Austin, TX',
    price: 21400000,
    type: 'Office / Medical',
    size: '96,000 SF',
    status: 'Active',
    image: propertyImage('1497366216548-37526070297c'),
  },
  {
    id: 6,
    name: 'The Foundry Lofts',
    address: '210 Warehouse Row, Austin, TX',
    price: 4300000,
    type: 'Multifamily',
    size: '24 Units',
    status: 'Pending',
    image: propertyImage('1522708323590-d24dbb6b0267'),
  },
]

const DEAL_COLUMNS = [
  { key: 'Lead', accent: 'bg-slate-400', progress: 20 },
  { key: 'Under Review', accent: 'bg-blue-500', progress: 45 },
  { key: 'Due Diligence', accent: 'bg-amber-500', progress: 70 },
  { key: 'Closed', accent: 'bg-emerald-500', progress: 100 },
]

const INITIAL_DEALS = [
  { id: 1, stage: 'Lead', property: 'Riverside Business Park', value: 8450000, agent: 'Maya Chen', progress: 20 },
  { id: 2, stage: 'Lead', property: 'The Foundry Lofts', value: 4300000, agent: 'Devon Park', progress: 15 },
  { id: 3, stage: 'Under Review', property: 'Summit Retail Center', value: 5200000, agent: 'Maya Chen', progress: 45 },
  { id: 4, stage: 'Due Diligence', property: 'Northgate Logistics Hub', value: 12750000, agent: 'Sam Rivera', progress: 70 },
  { id: 5, stage: 'Due Diligence', property: 'Cypress Corporate Tower', value: 21400000, agent: 'Devon Park', progress: 65 },
  { id: 6, stage: 'Closed', property: 'Lakeview Medical Plaza', value: 6900000, agent: 'Sam Rivera', progress: 100 },
]

// Deal Rooms = confidential data rooms behind a listing's access gate.
const INITIAL_DEAL_ROOMS = [
  { id: 1, name: 'Riverside Business Park', address: '1200 Riverside Dr, Austin, TX', image: propertyImage('1486406146926-c627a92ad1ab'), status: 'Active', access: 'Password', files: 8, members: 5, updated: '2h ago' },
  { id: 2, name: 'Summit Retail Center', address: '455 Market St, Dallas, TX', image: propertyImage('1560518883-ce09059eeffa'), status: 'Active', access: 'Free Access', files: 4, members: 2, updated: '1d ago' },
  { id: 3, name: 'Northgate Logistics Hub', address: '8900 Industrial Pkwy, Houston, TX', image: propertyImage('1553413077-190dd305871c'), status: 'Archived', access: 'Free Access', files: 12, members: 9, updated: '3d ago' },
  { id: 4, name: 'Cypress Corporate Tower', address: '', image: '', status: 'Active', access: 'Password', files: 1, members: 0, updated: '3d ago' },
]

/* -------------------------------------------------------------------------- */
/*  Utilities                                                                 */
/* -------------------------------------------------------------------------- */

const currency = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0)

const uid = () => Date.now() + Math.floor(Math.random() * 1000)

// Relative "time ago" from a millisecond timestamp — updates as time passes.
const timeAgo = (ts) => {
  if (!ts) return ''
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (s < 45) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min${m === 1 ? '' : 's'} ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`
  const w = Math.floor(d / 7)
  if (w < 5) return `${w} week${w === 1 ? '' : 's'} ago`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo} month${mo === 1 ? '' : 's'} ago`
  const y = Math.floor(d / 365)
  return `${y} year${y === 1 ? '' : 's'} ago`
}

/* --- Real action helpers (share / email / social / pdf) ------------------- */

const shareUrlFor = (item) =>
  `${window.location.origin}/p/${item.id}`

// Robust clipboard copy: Clipboard API first, legacy execCommand fallback.
const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.top = '-1000px'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

// Native share sheet where available, otherwise copy link to clipboard.
const shareItem = async (item, notify) => {
  const title = item.title || item.name
  const url = shareUrlFor(item)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `MyCREBlueprint — ${title}`,
        text: `Check out ${title} — ${item.address}`,
        url,
      })
      notify('Shared successfully')
      return
    } catch (err) {
      if (err && err.name === 'AbortError') return // user closed the share sheet
      // otherwise fall back to copying the link
    }
  }
  const ok = await copyToClipboard(url)
  notify(ok ? 'Share link copied to clipboard' : 'Unable to copy link', ok ? 'success' : 'error')
}

// Opens the user's email client with a pre-filled message.
const emailItem = (item, notify) => {
  const title = item.title || item.name
  const subject = encodeURIComponent(`CRE Marketing Package: ${title}`)
  const body = encodeURIComponent(
    `Hi,\n\nI'd like to share this property with you:\n\n` +
      `${title}\n${item.address}\n\n` +
      `View online: ${shareUrlFor(item)}\n\nBest regards,\nWaqas`,
  )
  window.location.href = `mailto:?subject=${subject}&body=${body}`
  notify('Opening email client…')
}

// Opens a LinkedIn share window for the property link.
const socialShare = (item, notify) => {
  const url = shareUrlFor(item)
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=680,height=640')
  notify('Opening LinkedIn share…')
}

// Generates and downloads a real, formatted PDF one-pager.
const downloadPdf = (item, notify) => {
  const title = item.title || item.name
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 48

  // Orange header band
  doc.setFillColor(249, 115, 22)
  doc.rect(0, 0, W, 96, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('MyCREBlueprint', M, 46)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('Commercial Real Estate Marketing Package', M, 68)

  // Title + address
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(title, M, 150)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(100, 116, 139)
  doc.text(item.address || '', M, 172)

  // Detail rows
  const rows = [
    ['Document Type', item.docType || '—'],
    ['Property Type', item.propertyType || item.type || '—'],
    ['Status', item.status || '—'],
    ['Tags', Array.isArray(item.tags) ? item.tags.join(', ') : '—'],
    ['Reference', shareUrlFor(item)],
  ]
  let y = 220
  doc.setFontSize(11)
  rows.forEach(([label, value]) => {
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'bold')
    doc.text(label.toUpperCase(), M, y)
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'normal')
    doc.text(String(value), M + 130, y, { maxWidth: W - M - 130 - M })
    y += 34
  })

  // Footer
  doc.setDrawColor(226, 232, 240)
  doc.line(M, 760, W - M, 760)
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(9)
  doc.text('Generated by MyCREBlueprint · Demo build', M, 778)

  const safe = title.replace(/[^a-z0-9]+/gi, '_')
  doc.save(`${safe}.pdf`)
  notify('PDF downloaded')
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'listings', label: 'Listing Hub', icon: Globe },
  { key: 'deals', label: 'Deal Rooms', icon: FolderLock },
]

/* -------------------------------------------------------------------------- */
/*  Toast system                                                              */
/* -------------------------------------------------------------------------- */

const ToastContext = createContext(() => {})
const useToast = () => useContext(ToastContext)

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const notify = (message, type = 'success') => {
    const id = uid()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 2600)
  }

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
              t.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
            }`}
          >
            {t.type === 'error' ? (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/*  Shared UI                                                                 */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }) {
  const map = {
    Complete: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'In Progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    Draft: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Sold: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  }
  const Icon =
    {
      Complete: CheckCircle2,
      Active: CheckCircle2,
      'In Progress': Clock,
      Pending: Clock,
      Draft: Pencil,
      Sold: BadgeCheck,
    }[status] || CheckCircle2
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        map[status] || map.Draft
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  )
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/10">
      {children}
    </span>
  )
}

function IconButton({ icon: Icon, label, onClick, tone = 'default' }) {
  const tones = {
    default: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
    danger: 'text-rose-500 hover:bg-rose-50 hover:text-rose-700',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${tones[tone]}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function Select({ value, onChange, options, label, icon: Icon }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${
          Icon ? 'pl-9' : 'pl-3'
        }`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

function PrimaryButton({ children, onClick, icon: Icon, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-orange-300 active:scale-[0.98]"
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Modal + form field primitives                                            */
/* -------------------------------------------------------------------------- */

function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100'

function TextInput(props) {
  return <input {...props} className={inputCls} />
}

function SelectInput({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`${inputCls} appearance-none pr-9`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          Delete
        </button>
      </div>
    </Modal>
  )
}

/* -------------------------------------------------------------------------- */
/*  Login Page                                                                */
/* -------------------------------------------------------------------------- */

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [busy, setBusy] = useState(false)

  const friendly = (code) => ({
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/invalid-email': 'That email address looks invalid.',
    'auth/user-not-found': 'No account found for that email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account already exists for that email.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts — please try again later.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Console.',
  })[code] || 'Something went wrong. Please try again.'

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { setError('Please enter both email and password.'); return }
    setError(''); setBusy(true)
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
        try { await updateProfile(cred.user, { displayName: email.trim().split('@')[0] }) } catch { /* non-fatal */ }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      }
      onLogin?.()
    } catch (err) { setError(friendly(err.code)) } finally { setBusy(false) }
  }

  const google = async () => {
    setError(''); setBusy(true)
    try { await signInWithPopup(auth, googleProvider); onLogin?.() }
    catch (err) { setError(friendly(err.code)) } finally { setBusy(false) }
  }

  const forgot = async () => {
    if (!email.trim()) { setError('Enter your email above first, then click “Forgot password”.'); return }
    try { await sendPasswordResetEmail(auth, email.trim()); setError('Password reset email sent — check your inbox.') }
    catch (err) { setError(friendly(err.code)) }
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${propertyImage('1486406146926-c627a92ad1ab')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-orange-900/40" />
        <div className="relative flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">MyCREBlueprint</span>
        </div>
        <div className="relative max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight">
            Build winning commercial real estate marketing.
          </h1>
          <p className="mt-4 text-slate-300">
            Offering memorandums, listing hubs, and deal rooms — all in one
            beautifully organized workspace.
          </p>
        </div>
        <div className="relative text-sm text-slate-400">
          © 2026 MyCREBlueprint. All rights reserved.
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-slate-50 p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              MyCREBlueprint
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'signup' ? 'Set up your workspace to get started.' : 'Sign in to your workspace to continue.'}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <Field label="Email address">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-orange-300"
                />
                Remember me
              </label>
              {mode === 'signin' && (
                <button type="button" onClick={forgot} className="font-semibold text-brand hover:underline">
                  Forgot password?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-orange-300 active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            onClick={google}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.6 40.6 16.2 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C39.9 36.2 45 31 45 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError('') }} className="font-semibold text-brand hover:underline">
              {mode === 'signup' ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sidebar + Top Bar                                                         */
/* -------------------------------------------------------------------------- */

function Logo({ collapsed }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-sm">
        <Box className="h-5 w-5" />
      </div>
      {!collapsed && (
        <span className="text-lg font-extrabold tracking-tight text-slate-900">
          My<span className="text-brand">CRE</span>Blueprint
        </span>
      )}
    </div>
  )
}

function UpgradeCard({ onDismiss }) {
  return (
    <div className="mx-3 mb-3 rounded-xl border border-orange-100 bg-orange-50 p-4">
      <p className="text-sm font-bold text-slate-900">Save $240/yr</p>
      <p className="text-xs text-slate-500">Switch to annual billing</p>
      <div className="mt-2 flex items-center gap-3 text-xs font-semibold">
        <button className="inline-flex items-center gap-1 text-brand hover:underline">
          Upgrade <span aria-hidden>→</span>
        </button>
        <button className="text-slate-400 hover:text-slate-600">Remind me later</button>
      </div>
      <button
        onClick={onDismiss}
        className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600"
      >
        <EyeOff className="h-3 w-3" />
        Don&apos;t show again
      </button>
    </div>
  )
}

const NAV_PERM = { dashboard: 'dashboard.view', listings: 'listings.view', deals: 'dealrooms.view' }

function Sidebar({ active, onNavigate, onSignOut, user, forceCollapsed, responsiveCollapse, onClose, can }) {
  const [collapsed, setCollapsed] = useState(
    () => !!forceCollapsed || (!!responsiveCollapse && typeof window !== 'undefined' && window.innerWidth < 1024),
  )
  // On tablet/iPad widths (below desktop lg) keep the sidebar as an icon rail.
  // Re-evaluated on mount and resize so it's correct immediately — no refresh
  // needed — and adapts when the device is rotated.
  useEffect(() => {
    if (forceCollapsed || !responsiveCollapse) return
    const apply = () => setCollapsed(window.innerWidth < 1024)
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [forceCollapsed, responsiveCollapse])
  const [showPromo, setShowPromo] = useState(true)

  // Filter nav by page permissions (when a `can` gate is provided), and add the
  // admin-only Team & Permissions entry.
  const navItems = can
    ? [
        ...NAV_ITEMS.filter((n) => !NAV_PERM[n.key] || can(NAV_PERM[n.key])),
        ...(can('team.manage_permissions') ? [{ key: 'team', label: 'Team & Permissions', icon: Users, dividerBefore: true }] : []),
      ]
    : NAV_ITEMS

  return (
    <aside
      className={`relative flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between gap-4 border-b border-slate-100 px-5">
        <Logo collapsed={collapsed} />
        {onClose && (
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Collapse toggle (desktop only — the drawer uses the close button instead) */}
      {!forceCollapsed && !onClose && (
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-14 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:text-brand"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ key, label, icon: Icon, dot, dividerBefore }) => {
          const isActive = active === key
          return (
            <React.Fragment key={key}>
              {dividerBefore && <div className="my-2 border-t border-slate-100" />}
              <button
                onClick={() => onNavigate(key)}
                title={collapsed ? label : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-orange-50 text-brand'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-brand' : 'text-slate-400'}`} />
                  {dot && (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand ring-2 ring-white" />
                  )}
                </span>
                {!collapsed && label}
              </button>
            </React.Fragment>
          )
        })}
      </nav>

      {/* Upgrade promo */}

      {/* Sign out + profile */}
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={onSignOut}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && 'Sign Out'}
        </button>
        <div className={`mt-1 flex items-center gap-3 rounded-lg px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-white">
            {user.initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

function TopBar({ title, user, query, onQuery, onMenu }) {
  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Mobile: hamburger + title */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={onMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-base font-bold text-slate-900">{title}</h1>
      </div>

      {/* Desktop: search */}
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search properties, deals, contacts…"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand ring-2 ring-white" />
        </button>
        <div className="hidden items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-3 hover:bg-slate-50 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-xs font-bold text-white">
            {user.initials}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight text-slate-800">{user.name}</p>
            <p className="text-xs leading-tight text-slate-400">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  Package form (create / edit)                                             */
/* -------------------------------------------------------------------------- */

const DOC_TYPES = [
  'Offering Memorandum',
  'Sales Teaser / Summary',
  'Leasing Package',
  'For Sale Flyer',
  'For Lease Flyer',
  'Brokers Opinion of Value',
]
const PROP_TYPES = [
  'Retail',
  'Office / Medical',
  'Multifamily',
  'Industrial',
  'Land',
  'Hospitality',
  'Self-Storage',
  'Mobile Home Parks',
  'Mixed-Use',
  'Net Lease',
]
const PKG_STATUSES = ['Complete', 'In Progress', 'Draft']

function PackageForm({ initial, defaults, ownerTab, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      title: '',
      address: '',
      docType: 'Offering Memorandum',
      propertyType: 'Office / Medical',
      status: 'Draft',
      tags: '',
      ...(defaults || {}),
    },
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.address.trim()) return
    const tags =
      typeof form.tags === 'string'
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : form.tags
    onSubmit({ ...form, tags: tags.length ? tags : ['General'], owner: ownerTab })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Property Title">
        <TextInput value={form.title} onChange={set('title')} placeholder="e.g. Riverside Business Park" />
      </Field>
      <Field label="Address">
        <TextInput value={form.address} onChange={set('address')} placeholder="123 Main St, City, State" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Doc Type">
          <SelectInput value={form.docType} onChange={set('docType')} options={DOC_TYPES} />
        </Field>
        <Field label="Property Type">
          <SelectInput value={form.propertyType} onChange={set('propertyType')} options={PROP_TYPES} />
        </Field>
      </div>
      <Field label="Status">
        <SelectInput value={form.status} onChange={set('status')} options={PKG_STATUSES} />
      </Field>
      <Field label="Tags (comma separated)">
        <TextInput
          value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
          onChange={set('tags')}
          placeholder="Sales Lease, Net Lease"
        />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <PrimaryButton type="submit">{initial ? 'Save Changes' : 'Create Package'}</PrimaryButton>
      </div>
    </form>
  )
}

/* -------------------------------------------------------------------------- */
/*  Screen 1: Dashboard                                                       */
/* -------------------------------------------------------------------------- */

function DraftBadge({ progress = 0 }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur">
      Draft
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200">
        <span className="block h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
      </span>
      <span className="text-slate-500">{progress}%</span>
    </span>
  )
}

// Text + icon action link used on package cards.
function CardAction({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold transition ${
        danger ? 'text-rose-500 hover:text-rose-600' : 'text-slate-600 hover:text-brand'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label && <span>{label}</span>}
    </button>
  )
}

function PackageCard({
  pkg,
  onEdit,
  onDuplicate,
  onDelete,
  onTransfer,
  onConvert,
  selectMode,
  selected,
  onToggleSelect,
}) {
  const notify = useToast()
  const isDraft = pkg.status === 'Draft'

  // Drafts only expose Edit + Transfer; completed docs get the full toolset.
  const actions = isDraft
    ? [
        { icon: Pencil, label: 'Edit', run: () => onEdit(pkg) },
        { icon: Send, label: 'Transfer', run: () => onTransfer(pkg) },
      ]
    : [
        { icon: Pencil, label: 'Edit', run: () => onEdit(pkg) },
        { icon: FileDown, label: 'PDF', run: () => downloadPdf(pkg, notify) },
        { icon: Send, label: 'Transfer', run: () => onTransfer(pkg) },
        { icon: Copy, label: 'Duplicate', run: () => onDuplicate(pkg) },
        { icon: Repeat2, label: 'Convert', run: () => onConvert(pkg) },
        { icon: Share2, label: 'Share', run: () => shareItem(pkg, notify) },
        { icon: AtSign, label: 'Email', run: () => emailItem(pkg, notify) },
        { icon: Share, label: 'Social', run: () => socialShare(pkg, notify) },
      ]

  return (
    <div
      className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
        selected ? 'border-brand ring-2 ring-orange-200' : 'border-slate-200'
      }`}
    >
      {/* Preview / image */}
      <div className="relative h-44 overflow-hidden">
        {pkg.image ? (
          <img
            src={pkg.image}
            alt={pkg.title}
            onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-slate-100 to-slate-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-slate-500">{pkg.propertyType}</span>
          </div>
        )}

        {selectMode && (
          <label className="absolute left-3 top-3 z-10 cursor-pointer">
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              className="h-5 w-5 rounded border-slate-300 text-brand focus:ring-orange-300"
            />
          </label>
        )}

        <div className="absolute right-3 top-3">
          {isDraft ? <DraftBadge progress={pkg.progress} /> : <StatusBadge status={pkg.status} />}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-base font-bold text-slate-900">{pkg.title}</h3>
        <p className="mt-1 flex items-start gap-1 text-sm text-slate-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{pkg.address}</span>
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/10">
            {pkg.docType}
          </span>
          {pkg.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
            >
              <Building className="h-3 w-3" />
              {t}
            </span>
          ))}
          {(pkg.ts || pkg.updated) && (
            <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              {pkg.ts ? timeAgo(pkg.ts) : pkg.updated}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3">
          {actions.map((a) => (
            <CardAction key={a.label} icon={a.icon} label={a.label} onClick={a.run} />
          ))}
          <span className="ml-auto">
            <CardAction icon={Trash2} onClick={() => onDelete(pkg)} danger />
          </span>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  "Create Document For" chooser (step 1 of creating a package)             */
/* -------------------------------------------------------------------------- */

function CreateForModal({ open, onClose, onContinue, members }) {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState('myself')

  // Reset each time the modal opens.
  useEffect(() => {
    if (open) {
      setQ('')
      setSelected('myself')
    }
  }, [open])

  const filtered = members.filter((m) =>
    (m.name + m.email).toLowerCase().includes(q.toLowerCase()),
  )

  const proceed = () => {
    if (selected === 'myself') {
      onContinue({ owner: 'my', assignee: null })
    } else {
      const m = members.find((x) => x.id === selected)
      onContinue({ owner: 'team', assignee: m?.name || null })
    }
  }

  const Row = ({ active, onClick, icon, title, subtitle }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
        active
          ? 'border-orange-200 bg-orange-50'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-brand">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="truncate text-xs text-slate-500">{subtitle}</p>
      </div>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${
          active ? 'bg-brand text-white' : 'border border-slate-300 text-transparent'
        }`}
      >
        <Check className="h-4 w-4" />
      </span>
    </button>
  )

  return (
    <Modal open={open} onClose={onClose} title="Create Document For">
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search team members..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <Row
          active={selected === 'myself'}
          onClick={() => setSelected('myself')}
          icon={<User className="h-5 w-5" />}
          title="Create for myself"
          subtitle="You will be the document owner"
        />

        {filtered.length ? (
          <div className="space-y-2">
            {filtered.map((m) => (
              <Row
                key={m.id}
                active={selected === m.id}
                onClick={() => setSelected(m.id)}
                icon={<span className="text-sm font-bold">{m.initials}</span>}
                title={m.name}
                subtitle={m.email}
              />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-slate-400">
            No team members available
          </p>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <PrimaryButton onClick={proceed}>Continue</PrimaryButton>
        </div>
      </div>
    </Modal>
  )
}

/* -------------------------------------------------------------------------- */
/*  Create Wizard (full-screen: Document Type -> Property Type -> Template)   */
/* -------------------------------------------------------------------------- */

const TONES = {
  blue: { chip: 'text-sky-600', tile: 'bg-sky-50 text-sky-500', item: 'text-sky-500' },
  amber: { chip: 'text-amber-600', tile: 'bg-amber-50 text-amber-500', item: 'text-amber-500' },
  teal: { chip: 'text-teal-600', tile: 'bg-teal-50 text-teal-500', item: 'text-teal-500' },
  rose: { chip: 'text-rose-600', tile: 'bg-rose-50 text-rose-500', item: 'text-rose-500' },
  indigo: { chip: 'text-indigo-600', tile: 'bg-indigo-50 text-indigo-500', item: 'text-indigo-500' },
}

const DOC_TYPE_CARDS = [
  {
    key: 'Offering Memorandum',
    tag: 'FOR INVESTMENT SALES',
    tone: 'blue',
    askScope: true,
    icon: BookOpen,
    desc: 'The gold standard in commercial real estate marketing. A comprehensive document that tells the full story of your property with detailed financials, market analysis, and professional photography.',
    included: [
      { icon: TrendingUp, text: 'Financial analysis & cash flow projections' },
      { icon: BarChart3, text: 'Executive summary & investment highlights' },
      { icon: Camera, text: 'Property photos, aerials & floor plans' },
      { icon: PieChart, text: 'Market demographics & area overview' },
      { icon: MapPin, text: 'Location maps & comparable sales' },
      { icon: Users, text: 'Rent roll & tenant information' },
    ],
  },
  {
    key: 'Sales Teaser / Summary',
    tag: 'FOR QUICK OUTREACH',
    tone: 'amber',
    askScope: true,
    icon: Zap,
    desc: 'A concise, high-impact summary designed to generate interest fast. Perfect for email campaigns, initial buyer outreach, or confidential marketing before a full offering memorandum.',
    included: [
      { icon: FileText, text: 'Property overview & key highlights' },
      { icon: TrendingUp, text: 'Essential financial metrics' },
      { icon: Camera, text: 'Featured property photos' },
      { icon: MapPin, text: 'Location summary & contact info' },
    ],
  },
  {
    key: 'Leasing Package',
    tag: 'FOR LEASING & TENANT MARKETING',
    tone: 'teal',
    icon: ClipboardList,
    desc: 'Showcase your available spaces and attract quality tenants. Includes detailed space specifications, site plans, and area demographics to help prospective tenants make informed decisions.',
    included: [
      { icon: ClipboardList, text: 'Available spaces & specifications' },
      { icon: FileText, text: 'Property details & site plan' },
      { icon: Users, text: 'Current tenant roster & occupancy' },
      { icon: PieChart, text: 'Area demographics & traffic counts' },
      { icon: Camera, text: 'Property & space photography' },
      { icon: MapPin, text: 'Location map & area highlights' },
    ],
  },
  {
    key: 'For Sale Flyer',
    tag: 'ONE-PAGE SALE SHEET',
    tone: 'rose',
    icon: FileText,
    desc: 'A quick, eye-catching one-page flyer for properties on the market. Perfect for email blasts, broker-to-broker outreach, and print distribution.',
    included: [
      { icon: Camera, text: 'Hero property photo' },
      { icon: DollarSign, text: 'Key financial metrics' },
      { icon: FileText, text: 'Property highlights' },
      { icon: Users, text: 'Broker contact info' },
    ],
  },
  {
    key: 'For Lease Flyer',
    tag: 'ONE-PAGE LEASE SHEET',
    tone: 'teal',
    icon: ClipboardList,
    desc: 'A compact flyer showcasing available spaces for lease. Ideal for tenant canvassing, broker networks, and posting to listing sites.',
    included: [
      { icon: Camera, text: 'Hero property photo' },
      { icon: ClipboardList, text: 'Available spaces & rates' },
      { icon: FileText, text: 'Property highlights' },
      { icon: Users, text: 'Broker contact info' },
    ],
  },
  {
    key: 'Brokers Opinion of Value',
    tag: 'FOR PROPERTY VALUATION',
    tone: 'indigo',
    icon: Scale,
    desc: 'A professional broker opinion of value with comparable analysis, market insights, and a supportable opinion of market value. Ideal for hold/sell decisions, loan sizing, and internal valuations.',
    included: [
      { icon: TrendingUp, text: 'Value opinion with range estimate' },
      { icon: BarChart3, text: 'Sales & rental comparables' },
      { icon: PieChart, text: 'Market analysis & demographics' },
      { icon: Camera, text: 'Property photos & maps' },
      { icon: MapPin, text: 'Location overview' },
      { icon: Users, text: 'Broker credentials & contact' },
    ],
  },
]

const PT_TONES = {
  rose: 'bg-rose-50 text-rose-500',
  blue: 'bg-sky-50 text-sky-500',
  green: 'bg-emerald-50 text-emerald-500',
  amber: 'bg-amber-50 text-amber-500',
  purple: 'bg-purple-50 text-purple-500',
  orange: 'bg-orange-50 text-orange-500',
  teal: 'bg-teal-50 text-teal-500',
  indigo: 'bg-indigo-50 text-indigo-500',
  slate: 'bg-slate-100 text-slate-500',
}

const PROPERTY_TYPE_CARDS = [
  { key: 'Retail', label: 'RETAIL', tone: 'rose', icon: ShoppingBag, desc: 'Shopping centers, strip malls, net lease retail, standalone storefronts' },
  { key: 'Office / Medical', label: 'OFFICE / MEDICAL', tone: 'blue', icon: Building2, desc: 'Class A/B offices, medical buildings, professional centers' },
  { key: 'Multifamily', label: 'MULTIFAMILY', tone: 'green', icon: Building, desc: 'Apartments, condos, townhomes, student & senior housing' },
  { key: 'Industrial', label: 'INDUSTRIAL', tone: 'amber', icon: Warehouse, desc: 'Warehouses, distribution centers, manufacturing, flex space' },
  { key: 'Land', label: 'Land', tone: 'green', icon: Mountain, desc: 'Vacant land, development sites, agricultural, development-ready parcels' },
  { key: 'Hospitality', label: 'Hospitality', tone: 'purple', icon: BedDouble, desc: 'Hotels, motels, resorts, extended stay, boutique properties' },
  { key: 'Self-Storage', label: 'Self-Storage', tone: 'orange', icon: Container, desc: 'Self-storage facilities, climate-controlled, vehicle storage' },
  { key: 'Mobile Home Parks', label: 'Mobile Home Parks', tone: 'teal', icon: Home, desc: 'Manufactured housing, RV parks, mobile home communities' },
  { key: 'Mixed-Use', label: 'Mixed-Use', tone: 'indigo', icon: Layers, desc: 'Retail + office, live/work, urban mixed-use developments' },
  { key: 'Net Lease', label: 'Net Lease', tone: 'slate', icon: FileSignature, desc: 'Single-tenant net lease, absolute net, ground leases, sale-leaseback' },
]

// Brand-color swatches for the template gallery.
const BRAND_COLORS = [
  '#1e3a8a', '#2563eb', '#0ea5e9', '#0891b2', '#059669', '#16a34a',
  '#ca8a04', '#ea580c', '#dc2626', '#db2777', '#7c3aed', '#4f46e5',
  '#0f172a', '#334155', '#b45309', '#0d9488', '#be123c', '#6d28d9',
]

// Brokerage-branded two-tone palettes ("Match Your Brokerage").
const BROKERAGES = [
  { label: 'KW3D', colors: ['#b91c1c', '#1f2937'] },
  { label: 'R Williams', colors: ['#7c2d12', '#111827'] },
  { label: 'ColdBan', colors: ['#1e3a8a', '#0f172a'] },
  { label: 'Old Cent', colors: ['#111827', '#ca8a04'] },
  { label: 'PhilP', colors: ['#0f766e', '#334155'] },
  { label: 'CBRon', colors: ['#065f46', '#111827'] },
  { label: 'JL', colors: ['#dc2626', '#7f1d1d'] },
  { label: 'Cush Wm', colors: ['#1e3a8a', '#059669'] },
  { label: 'Sperry Van', colors: ['#0369a1', '#1e293b'] },
  { label: 'Colher', colors: ['#1d4ed8', '#93c5fd'] },
  { label: 'Nt Global', colors: ['#b91c1c', '#1e293b'] },
  { label: 'Lee Asso', colors: ['#b45309', '#78350f'] },
  { label: 'Berkad', colors: ['#4f46e5', '#1e1b4b'] },
  { label: 'Compas', colors: ['#111827', '#6b7280'] },
  { label: 'eXplore', colors: ['#7c3aed', '#2563eb'] },
  { label: 'Sotheby', colors: ['#1e293b', '#b8860b'] },
]

// Named single-color palettes ("Color Palettes").
const COLOR_PALETTES = [
  { label: 'Navy Clas', color: '#1e3a8a' },
  { label: 'Modern S', color: '#2563eb' },
  { label: 'Forest', color: '#166534' },
  { label: 'Charcoal', color: '#334155' },
  { label: 'Burgundy', color: '#7f1d1d' },
  { label: 'Royal Blue', color: '#1d4ed8' },
  { label: 'Sunset', color: '#ea580c' },
  { label: 'Slate', color: '#475569' },
  { label: 'Plum', color: '#6b21a8' },
  { label: 'Emerald', color: '#059669' },
  { label: 'Midnight', color: '#0f172a' },
  { label: 'Copper', color: '#b45309' },
  { label: 'Ocean', color: '#0891b2' },
  { label: 'Wine', color: '#9f1239' },
  { label: 'Olive', color: '#4d7c0f' },
  { label: 'Steel Blue', color: '#0369a1' },
  { label: 'Terracotta', color: '#c2410c' },
]

// Template designs shown in the "Choose a Template" gallery.
const TEMPLATE_GALLERY = [
  { name: 'Classic', style: 'bottom-bar' },
  { name: 'Modern', style: 'left-panel' },
  { name: 'Professional', style: 'top-bar' },
  { name: 'Executive', style: 'bottom-bar' },
  { name: 'Premium', style: 'card' },
  { name: 'Heritage', style: 'bottom-band' },
  { name: 'Apex', style: 'diagonal' },
  { name: 'Meridian', style: 'top-bar' },
  { name: 'Monolith', style: 'left-panel' },
  { name: 'Vantage', style: 'bottom-bar' },
  { name: 'Estate', style: 'minimal' },
  { name: 'Sandstone', style: 'top-bar' },
  { name: 'Atlas', style: 'ribbon' },
  { name: 'Marquee', style: 'big-number' },
  { name: 'Metro', style: 'diagonal' },
  { name: 'Lumen', style: 'corner' },
  { name: 'Anchor', style: 'card' },
  { name: 'Axis', style: 'left-panel' },
]

// A distinct preview image per template, so switching tabs shows a different
// picture. Uses known-good Unsplash IDs cycled by the template's position.
const PREVIEW_IMG_POOL = [
  'photo-1613490493576-7fde63acd811',
  'photo-1486406146926-c627a92ad1ab',
  'photo-1560518883-ce09059eeffa',
  'photo-1512917774080-9991f1c4c750',
  'photo-1553413077-190dd305871c',
  'photo-1519494026892-80bbd2d6fd0d',
  'photo-1497366216548-37526070297c',
  'photo-1522708323590-d24dbb6b0267',
].map((s) => `https://images.unsplash.com/${s}?auto=format&fit=crop&w=800&q=60`)

const templateImage = (name) => {
  const i = TEMPLATE_GALLERY.findIndex((t) => t.name === name)
  return PREVIEW_IMG_POOL[(i < 0 ? 0 : i) % PREVIEW_IMG_POOL.length]
}

// A miniature *document* preview — the property details (badge, address,
// buildings/SF, tagline) are baked into each template's own layout.
function TemplateThumb({ style, color, docType }) {
  const ADDR = '123 Main Street'
  const SUB = '3 buildings · 6,600 SF'
  const TAG = 'Premier Investment Opportunity'
  const Img = (props) => (
    <img src={FALLBACK_IMG} alt="" loading="lazy" className="h-full w-full object-cover" {...props} />
  )
  const Badge = () => (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-white"
      style={{ background: color }}
    >
      {docType || 'Offering Memorandum'}
    </span>
  )

  return (
    <div className="relative h-48 w-full overflow-hidden bg-white">
      {/* Classic-style: image on top, white detail block below */}
      {style === 'bottom-bar' && (
        <div className="flex h-full flex-col">
          <div className="h-[56%]"><Img /></div>
          <div className="flex flex-1 flex-col justify-center px-3">
            <Badge />
            <p className="mt-1 text-[11px] font-bold leading-tight text-slate-900">{ADDR}</p>
            <p className="text-[8px] text-slate-500">{SUB}</p>
            <p className="text-[7px] font-semibold uppercase tracking-wide text-slate-400">{TAG}</p>
          </div>
        </div>
      )}

      {/* Modern-style: colored left panel with details, image on right */}
      {style === 'left-panel' && (
        <div className="flex h-full">
          <div className="flex w-[46%] flex-col justify-center px-3" style={{ background: color }}>
            <p className="text-[11px] font-bold leading-tight text-white">{ADDR}</p>
            <p className="mt-0.5 text-[7px] text-white/80">{SUB}</p>
          </div>
          <div className="w-[54%]"><Img /></div>
        </div>
      )}

      {/* Professional-style: white header with details, image below */}
      {style === 'top-bar' && (
        <div className="flex h-full flex-col">
          <div className="px-3 py-2">
            <p className="text-[11px] font-bold leading-tight text-slate-900">{ADDR}</p>
            <p className="text-[8px] text-slate-500">{SUB}</p>
            <p className="text-[6px] font-semibold uppercase tracking-wide text-slate-400">{TAG}</p>
          </div>
          <div className="flex-1"><Img /></div>
        </div>
      )}

      {/* Premium-style: mostly white, small image + details */}
      {style === 'card' && (
        <div className="relative h-full p-3">
          <div className="absolute right-2 top-2 h-16 w-24 overflow-hidden rounded shadow"><Img /></div>
          <div className="absolute bottom-3 left-3">
            <div className="mb-1 h-1 w-6 rounded" style={{ background: color }} />
            <p className="text-[11px] font-bold text-slate-900">{ADDR}</p>
            <p className="text-[8px] text-slate-500">{SUB}</p>
            <p className="text-[6px] font-semibold uppercase tracking-wide text-slate-400">{TAG}</p>
          </div>
        </div>
      )}

      {/* Heritage-style: image, colored band with address, white below */}
      {style === 'bottom-band' && (
        <div className="flex h-full flex-col">
          <div className="h-1/2"><Img /></div>
          <div className="flex items-center px-3 py-1.5" style={{ background: color }}>
            <p className="text-[10px] font-bold text-white">{ADDR}</p>
          </div>
          <div className="flex flex-1 flex-col justify-center px-3">
            <p className="text-[8px] text-slate-500">{SUB}</p>
            <p className="text-[6px] font-semibold uppercase tracking-wide text-slate-400">{TAG}</p>
          </div>
        </div>
      )}

      {/* Apex/Metro: diagonal colored split with details */}
      {style === 'diagonal' && (
        <div className="relative h-full">
          <Img className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: color, clipPath: 'polygon(0 0, 62% 0, 40% 100%, 0 100%)' }} />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <p className="text-[11px] font-bold text-white">{ADDR}</p>
            <p className="text-[7px] text-white/80">{SUB}</p>
          </div>
        </div>
      )}

      {/* Atlas: colored top bar with address, image below */}
      {style === 'ribbon' && (
        <div className="flex h-full flex-col">
          <div className="flex items-center px-3 py-1.5" style={{ background: color }}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white">{ADDR}</p>
          </div>
          <div className="flex-1"><Img /></div>
        </div>
      )}

      {/* Marquee: colored left panel with big number + address */}
      {style === 'big-number' && (
        <div className="flex h-full">
          <div className="flex w-[46%] flex-col justify-center px-3" style={{ background: color }}>
            <span className="text-2xl font-black leading-none text-white">3</span>
            <p className="mt-1 text-[10px] font-bold text-white">{ADDR}</p>
            <p className="text-[7px] text-white/80">{SUB}</p>
          </div>
          <div className="w-[54%]"><Img /></div>
        </div>
      )}

      {/* Lumen: image with colored corner + white address tag */}
      {style === 'corner' && (
        <div className="relative h-full">
          <Img className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute right-0 top-0 h-0 w-0 border-l-[48px] border-t-[48px] border-l-transparent" style={{ borderTopColor: color }} />
          <div className="absolute bottom-3 left-3 rounded bg-white/90 px-2 py-1 shadow">
            <p className="text-[10px] font-bold text-slate-900">{ADDR}</p>
            <p className="text-[7px] text-slate-500">{SUB}</p>
          </div>
        </div>
      )}

      {/* Estate: image with centered address card */}
      {style === 'minimal' && (
        <div className="relative h-full">
          <Img className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-white/45" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-[11px] font-bold text-slate-900">{ADDR}</p>
            <div className="mx-auto my-1 h-0.5 w-10" style={{ background: color }} />
            <p className="text-[7px] text-slate-600">{SUB}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Full-screen template Preview modal (pages + tabs + filmstrip)            */
/* -------------------------------------------------------------------------- */

const PREVIEW_PROPERTY = {
  name: 'Olive Grove Plaza',
  addr: '5080 W Olive Ave',
  cityState: 'Phoenix, AZ 85004',
  price: '$10.9M',
  cap: '6.52%',
  noi: '$711.1K',
  size: '3 buildings · 73,700 SF',
  broker: {
    name: 'Michael Torres',
    title: 'Senior Vice President',
    phone: '(602) 555-8100 (Direct)',
    email: 'mtorres@apexcre.com',
  },
  company: {
    name: 'Apex Commercial Real Estate',
    lines: ['2727 N Central Ave', 'Suite 400, Phoenix, AZ 85004', '(602) 555-8100', 'www.apexcre.com', 'Lic# BR-0654321'],
  },
}

// Sample copy used to make the template preview pages look real (not skeletons).
const PREVIEW_FIN_ROWS = [
  ['Gross Scheduled Income', '$1,284,000', '$17.42'],
  ['Vacancy & Credit Loss', '($64,200)', '($0.87)'],
  ['Effective Gross Income', '$1,219,800', '$16.55'],
  ['Operating Expenses', '($508,700)', '($6.90)'],
  ['Net Operating Income', '$711,100', '$9.65'],
]
const PREVIEW_HIGHLIGHTS = [
  { t: 'Prime Location', d: 'Positioned in a high-growth corridor with strong visibility and regional access.' },
  { t: 'Creditworthy Tenancy', d: 'Stabilized rent roll with staggered lease expirations and durable income.' },
  { t: 'Value-Add Upside', d: 'Below-market rents provide a clear mark-to-market growth path.' },
  { t: 'Stable Cash Flow', d: 'Contractual annual escalations hedge income against inflation.' },
]
const PREVIEW_BULLETS = [
  '6.52% going-in cap rate on stable, in-place income',
  '73,700 SF across three well-maintained buildings',
  'Strong demographics with a growing daytime population',
  'Contractual rent escalations that hedge against inflation',
  'Prominent frontage along a major thoroughfare',
  'Diversified tenant base that reduces rollover risk',
]

const PAGE_TITLES = [
  'Cover', 'Executive Summary', 'Investment Highlights', 'Property Overview',
  'Financial Overview', 'Cash Flow Analysis', 'Rent Roll', 'Operating Statement',
  'Tenant Profiles', 'Lease Abstracts', 'Location Overview', 'Regional Map',
  'Aerial Photography', 'Site Plan', 'Floor Plans', 'Demographics',
  'Traffic Counts', 'Comparable Sales', 'Sale Comparables', 'Market Overview',
  'Area Amenities', 'Broker Contact', 'Disclaimer',
]

function Metric({ value, label, color }) {
  return (
    <div className="text-right">
      <p className="text-lg font-extrabold" style={{ color }}>{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  )
}

// One full document page rendered inside the preview.
function PreviewPage({ index, brandColor, docType, template }) {
  const p = PREVIEW_PROPERTY
  const img = template ? templateImage(template) : FALLBACK_IMG
  if (index === 0) {
    return (
      <div className="flex h-[72vh] flex-col">
        <div className="relative h-[52%] shrink-0">
          <img src={img} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: brandColor }} />
        </div>
        <div className="flex flex-1 flex-col p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className="inline-block rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ background: brandColor }}
              >
                {docType || 'Offering Memorandum'}
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">{p.name}</h2>
            </div>
            <div className="flex gap-6">
              <Metric value={p.price} label="Price" color={brandColor} />
              <Metric value={p.cap} label="Cap Rate" color={brandColor} />
              <Metric value={p.noi} label="NOI" color={brandColor} />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">{p.addr}</p>
          <p className="text-sm text-slate-600">{p.size}</p>
          <hr className="my-4 border-slate-200" />
          <div className="mt-auto flex items-end justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">{p.broker.name}</p>
              <p className="text-xs text-slate-500">{p.broker.title}</p>
              <p className="text-xs text-slate-500">{p.broker.phone}</p>
              <p className="text-xs text-slate-500">{p.broker.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">{p.company.name}</p>
              {p.company.lines.map((l) => (
                <p key={l} className="text-[10px] text-slate-400">{l}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const variant = index % 4
  return (
    <div className="flex h-[72vh] flex-col">
      <div className="flex items-center justify-between px-8 py-5" style={{ background: brandColor }}>
        <span className="text-lg font-bold uppercase tracking-wide text-white">{PAGE_TITLES[index]}</span>
        <span className="text-xs font-semibold text-white/80">{p.name}</span>
      </div>
      <div className="flex-1 space-y-4 overflow-hidden p-8">
        {variant === 0 && (
          <>
            <img src={img} alt="" className="h-56 w-full rounded-lg object-cover" />
            <h3 className="text-lg font-bold text-slate-900">{PAGE_TITLES[index]}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{p.name} represents a rare opportunity to acquire a fully-stabilized asset in one of the region&apos;s strongest submarkets, combining durable in-place income with a clear path to long-term value creation.</p>
            <p className="text-sm leading-relaxed text-slate-600">Priced at {p.price} — a {p.cap} cap rate on {p.noi} of net operating income — the offering delivers both stability and meaningful upside for discerning investors.</p>
          </>
        )}
        {variant === 1 && (
          <>
            <img src={img} alt="" className="h-40 w-full rounded-lg object-cover" />
            <div className="overflow-hidden rounded-lg border border-slate-200 text-sm">
              <div className="flex items-center justify-between px-4 py-2.5 font-semibold text-white" style={{ background: brandColor }}>
                <span className="w-1/2">Line Item</span><span className="w-1/4 text-right">Annual</span><span className="w-1/4 text-right">Per SF</span>
              </div>
              {PREVIEW_FIN_ROWS.map((r, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${i % 2 ? 'bg-slate-50' : 'bg-white'}`}>
                  <span className="w-1/2 text-slate-700">{r[0]}</span>
                  <span className="w-1/4 text-right font-medium text-slate-800">{r[1]}</span>
                  <span className="w-1/4 text-right text-slate-500">{r[2]}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {variant === 2 && (
          <>
            <img src={img} alt="" className="h-40 w-full rounded-lg object-cover" />
            <div className="grid grid-cols-2 gap-4">
              {PREVIEW_HIGHLIGHTS.map((c, i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-bold" style={{ color: brandColor }}>{c.t}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{c.d}</p>
                </div>
              ))}
            </div>
          </>
        )}
        {variant === 3 && (
          <div className="flex gap-6">
            <img src={img} alt="" className="h-56 w-1/2 shrink-0 rounded-lg object-cover" />
            <ul className="flex-1 space-y-2.5">
              {PREVIEW_BULLETS.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: brandColor }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="px-8 py-3 text-center text-[11px] text-slate-400">
        Page {index + 1} of {PAGE_TITLES.length}
      </div>
    </div>
  )
}

// A tiny thumbnail of a page for the bottom filmstrip.
function MiniPage({ index, brandColor, template }) {
  const img = template ? templateImage(template) : FALLBACK_IMG
  if (index === 0) {
    return (
      <div className="h-full w-full">
        <img src={img} alt="" className="h-2/3 w-full object-cover" />
        <div className="h-1/3 bg-white" style={{ borderTop: `2px solid ${brandColor}` }} />
      </div>
    )
  }
  return (
    <div className="h-full w-full bg-white">
      <div className="h-2" style={{ background: brandColor }} />
      <div className="flex gap-1 p-1.5">
        <img src={img} alt="" className="h-8 w-10 shrink-0 rounded object-cover" />
        <div className="flex-1 space-y-1 pt-0.5">
          <div className="h-1 w-3/4 rounded bg-slate-200" />
          <div className="h-1 w-1/2 rounded bg-slate-100" />
          <div className="h-1 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  )
}

function TemplatePreviewModal({ open, onClose, template, onTemplateChange, brandColor, docType, propertyType }) {
  const [page, setPage] = useState(0)
  const TOTAL = PAGE_TITLES.length

  useEffect(() => {
    if (open) setPage(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') setPage((x) => Math.min(TOTAL - 1, x + 1))
      else if (e.key === 'ArrowLeft') setPage((x) => Math.max(0, x - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, TOTAL])

  if (!open) return null
  const tabs = TEMPLATE_GALLERY.slice(0, 6).map((t) => t.name)

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-900/95 backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-lg font-extrabold">{PREVIEW_PROPERTY.name}</span>
          <span className="hidden rounded bg-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide sm:inline">
            {docType}
          </span>
          <span className="hidden rounded bg-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide sm:inline">
            {propertyType}
          </span>
        </div>
        <div className="hidden items-center gap-1 lg:flex">
          {tabs.map((name) => (
            <button
              key={name}
              onClick={() => onTemplateChange(name)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                template === name ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10"
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Page viewer */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 md:px-16">
        <button
          onClick={() => setPage((x) => Math.max(0, x - 1))}
          disabled={page === 0}
          className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="relative w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl">
          <PreviewPage index={page} brandColor={brandColor} docType={docType} template={template} />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white">
            Page {page + 1} of {TOTAL}
          </span>
        </div>

        <button
          onClick={() => setPage((x) => Math.min(TOTAL - 1, x + 1))}
          disabled={page === TOTAL - 1}
          className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Filmstrip slider */}
      <div className="scrollbar-slim flex gap-2 overflow-x-auto border-t border-white/10 bg-slate-900/80 px-4 py-3">
        {PAGE_TITLES.map((t, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            title={t}
            className={`h-16 w-24 shrink-0 overflow-hidden rounded border-2 transition ${
              page === i ? 'border-orange-400' : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <MiniPage index={i} brandColor={brandColor} template={template} />
          </button>
        ))}
      </div>
    </div>
  )
}

const WIZARD_STEPS = [
  { n: 1, label: 'Document Type' },
  { n: 2, label: 'Property Type' },
  { n: 3, label: 'Template' },
]

function StepHeader({ step, onExit }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white">
          <Box className="h-4 w-4" />
        </div>
        <span className="text-base font-extrabold tracking-tight text-slate-900">
          My<span className="text-brand">CRE</span>Blueprint
        </span>
      </div>

      <div className="hidden items-center gap-3 md:flex">
        {WIZARD_STEPS.map((s, i) => {
          const active = step === s.n
          const done = step > s.n
          return (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    active
                      ? 'bg-brand text-white'
                      : done
                        ? 'bg-orange-100 text-brand'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : s.n}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    active ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < WIZARD_STEPS.length - 1 && <span className="h-px w-8 bg-slate-200" />}
            </React.Fragment>
          )
        })}
      </div>

      <button
        onClick={onExit}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Dashboard
      </button>
    </header>
  )
}

function DocTypeCard({ card, onSelect }) {
  const tone = TONES[card.tone]
  const Icon = card.icon
  return (
    <button
      type="button"
      onClick={() => onSelect(card)}
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.tile}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{card.key}</h3>
          <p className={`text-xs font-bold tracking-wide ${tone.chip}`}>{card.tag}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-500">{card.desc}</p>

      <div className="mt-4">
        <span className="inline-block rounded bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400">
          WHAT&apos;S INCLUDED
        </span>
        <ul className="mt-3 space-y-2">
          {card.included.map((item) => {
            const ItemIcon = item.icon
            return (
              <li key={item.text} className="flex items-center gap-2 text-sm text-slate-600">
                <ItemIcon className={`h-4 w-4 shrink-0 ${tone.item}`} />
                {item.text}
              </li>
            )
          })}
        </ul>
      </div>
    </button>
  )
}

function ChoiceCard({ icon: Icon, title, desc, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
    </button>
  )
}

// Centered card used on the "Select Property Type" step.
function PropertyTypeCard({ tone, icon: Icon, label, desc, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${PT_TONES[tone]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-900">{label}</h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{desc}</p>
    </button>
  )
}

// A large, centered choice card (used on the Single/Multiple & location steps).
function ScopeCard({ icon: Icon, tone, title, desc, onSelect }) {
  const tile = PT_TONES[tone] || PT_TONES.blue
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
    >
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tile}`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-slate-500">{desc}</p>
    </button>
  )
}

function CreateWizard({ open, onExit, onComplete, assignee }) {
  // phase: 'doc' -> ['scope' -> ['multi']] -> 'property' -> 'template'
  const [phase, setPhase] = useState('doc')
  const [docCard, setDocCard] = useState(null)
  const [scope, setScope] = useState(null)
  const [locationKind, setLocationKind] = useState(null)
  const [propType, setPropType] = useState(null)
  const [brandColor, setBrandColor] = useState(BRAND_COLORS[1])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)

  useEffect(() => {
    if (open) {
      setPhase('doc')
      setDocCard(null)
      setScope(null)
      setLocationKind(null)
      setPropType(null)
      setBrandColor(BRAND_COLORS[1])
      setSelectedTemplate(null)
      setPreviewOpen(false)
      setPreviewTemplate(null)
    }
  }, [open])

  if (!open) return null

  // Header shows 3 top-level steps; 'scope' & 'multi' live under "Document Type".
  const headerStep =
    phase === 'doc' || phase === 'scope' || phase === 'multi'
      ? 1
      : phase === 'property'
        ? 2
        : 3

  const back = () => {
    if (phase === 'template') setPhase(scope === 'multiple' ? 'multi' : 'property')
    else if (phase === 'property') setPhase(docCard?.askScope ? 'scope' : 'doc')
    else if (phase === 'multi') setPhase('scope')
    else if (phase === 'scope') setPhase('doc')
    else onExit()
  }

  const pickDoc = (card) => {
    setDocCard(card)
    if (card.askScope) setPhase('scope')
    else {
      setScope('single')
      setPhase('property')
    }
  }

  const heading = {
    doc: { title: 'Select a Marketing Package', sub: 'What type of document would you like to create?' },
    scope: { title: 'Single Property or Multiple?', sub: 'Is this document for a single property/parcel or multiple?' },
    multi: { title: 'Same Site or Different Locations?', sub: 'Are all properties/parcels at the same site, or scattered across different locations?' },
    property: { title: 'Select Property Type', sub: 'What type of property is this marketing package for?' },
    template: { title: 'Choose a Template', sub: 'Pick a color and template for your document.' },
  }[phase]

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      <StepHeader step={headerStep} onExit={onExit} />

      <div className="scrollbar-slim flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-2xl font-extrabold text-slate-900">
            {heading.title}
            {phase === 'template' && (
              <span className="ml-3 align-middle text-xs font-medium text-slate-400">
                {TEMPLATE_GALLERY.length} styles available
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{heading.sub}</p>
          {assignee && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-brand">
              <User className="h-3.5 w-3.5" />
              Creating for {assignee}
            </p>
          )}

          {phase === 'doc' && (
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {DOC_TYPE_CARDS.map((card) => (
                <DocTypeCard key={card.key} card={card} onSelect={pickDoc} />
              ))}
            </div>
          )}

          {phase === 'scope' && (
            <>
              <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
                <ScopeCard
                  icon={Building2}
                  tone="blue"
                  title="Single Property"
                  desc="One property or parcel at one address"
                  onSelect={() => {
                    setScope('single')
                    setPhase('property')
                  }}
                />
                <ScopeCard
                  icon={LayoutList}
                  tone="amber"
                  title="Multiple Properties"
                  desc="A campus / multi-building site, a land assemblage, or a scattered portfolio"
                  onSelect={() => {
                    setScope('multiple')
                    setPhase('multi')
                  }}
                />
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setPhase('doc')}
                  className="text-sm font-medium text-slate-400 transition hover:text-slate-600"
                >
                  Back to document types
                </button>
              </div>
            </>
          )}

          {phase === 'multi' && (
            <>
              <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
                <ScopeCard
                  icon={Building2}
                  tone="green"
                  title="Multi-Building / Assemblage"
                  desc="Same site — e.g., corporate office park, apartment complex, mixed-use development, or a contiguous land assemblage (multiple parcels offered together)"
                  onSelect={() => {
                    setLocationKind('multi-building')
                    setPropType('Mixed-Use')
                    setPhase('template')
                  }}
                />
                <ScopeCard
                  icon={LayoutList}
                  tone="purple"
                  title="Portfolio"
                  desc="Different locations — e.g., 3 shopping centers across a metro, scattered land holdings in different submarkets, multi-state portfolio sold together"
                  onSelect={() => {
                    setLocationKind('portfolio')
                    setPropType('Mixed-Use')
                    setPhase('template')
                  }}
                />
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setPhase('scope')}
                  className="text-sm font-medium text-slate-400 transition hover:text-slate-600"
                >
                  Back
                </button>
              </div>
            </>
          )}

          {phase === 'property' && (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {PROPERTY_TYPE_CARDS.map((c) => (
                <PropertyTypeCard
                  key={c.key}
                  tone={c.tone}
                  icon={c.icon}
                  label={c.label}
                  desc={c.desc}
                  onSelect={() => {
                    setPropType(c.key)
                    setPhase('template')
                  }}
                />
              ))}
            </div>
          )}

          {phase === 'template' && (
            <div className="mt-8 flex flex-col gap-6 lg:flex-row">
              {/* Brand color panel */}
              <div className="w-full shrink-0 lg:w-64">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">Brand Color</p>
                    <button type="button" className="text-xs font-semibold text-brand hover:underline">
                      Custom
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {BRAND_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBrandColor(c)}
                        style={{ background: c }}
                        title={c}
                        className={`h-6 w-6 rounded-full ring-2 ring-offset-1 transition ${
                          brandColor === c ? 'ring-slate-900' : 'ring-transparent hover:ring-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Match Your Brokerage
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {BROKERAGES.map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() => setBrandColor(b.colors[0])}
                        title={b.label}
                        className="overflow-hidden rounded-md border border-slate-200 transition hover:ring-2 hover:ring-orange-200"
                      >
                        <div className="flex h-6">
                          <div className="flex-1" style={{ background: b.colors[0] }} />
                          <div className="flex-1" style={{ background: b.colors[1] }} />
                        </div>
                        <div className="truncate px-1 py-0.5 text-center text-[7px] font-semibold text-slate-500">
                          {b.label}
                        </div>
                      </button>
                    ))}
                  </div>

                  <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Color Palettes
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {COLOR_PALETTES.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setBrandColor(p.color)}
                        title={p.label}
                        className="overflow-hidden rounded-md border border-slate-200 transition hover:ring-2 hover:ring-orange-200"
                      >
                        <div className="h-6" style={{ background: p.color }} />
                        <div className="truncate px-1 py-0.5 text-center text-[7px] font-semibold text-slate-500">
                          {p.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Template grid */}
              <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {TEMPLATE_GALLERY.map((t) => {
                  const selected = selectedTemplate === t.name
                  return (
                    <div
                      key={t.name}
                      onClick={() => setSelectedTemplate(t.name)}
                      className={`cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
                      }`}
                    >
                      <div className="relative">
                        <TemplateThumb style={t.style} color={brandColor} docType={docCard?.key} />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewTemplate(t.name)
                            setPreviewOpen(true)
                          }}
                          className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-700 shadow backdrop-blur transition hover:bg-white"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </button>
                        {selected && (
                          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 border-t border-slate-100 p-3">
                        <span className="h-4 w-1 rounded-full" style={{ background: brandColor }} />
                        <span className="text-sm font-bold text-slate-900">{t.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-[850px] items-center justify-between">
          <button
            onClick={back}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {phase === 'template' ? (
            <PrimaryButton
              onClick={() =>
                onComplete({
                  docType: docCard.key,
                  propertyType: propType,
                  template: selectedTemplate || TEMPLATE_GALLERY[0].name,
                  scope,
                  locationKind,
                  brandColor,
                })
              }
            >
              Get Started
            </PrimaryButton>
          ) : (
            <span className="text-sm text-slate-400">Select an option to continue</span>
          )}
        </div>
      </div>

      <TemplatePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={previewTemplate}
        onTemplateChange={setPreviewTemplate}
        brandColor={brandColor}
        docType={docCard?.key}
        propertyType={propType}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Document Builder (opens after "Get Started" — Property Details + sections) */
/* -------------------------------------------------------------------------- */

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
const US_STATE_ABBR = { Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY' }

// Standard offering-memorandum confidentiality boilerplate (read-only, admin-managed).
const CONFIDENTIALITY_TEXT = [
  'The information contained in the following offering memorandum is proprietary and strictly confidential. It is intended to be reviewed only by the party receiving it from [COMPANY_NAME] and it should not be made available to any other person or entity without the written consent of [COMPANY_NAME].',
  'By taking possession of and reviewing the information contained herein the recipient agrees to hold and treat all such information in the strictest confidence. The recipient further agrees that recipient will not photocopy or duplicate any part of the offering memorandum. If you have no interest in the subject property, please promptly return this offering memorandum to [COMPANY_NAME]. This offering memorandum has been prepared to provide summary, unverified financial and physical information to prospective purchasers, and to establish only a preliminary level of interest in the subject property. The information contained herein is not a substitute for a thorough due diligence investigation. [COMPANY_NAME] has not made any investigation, and makes no warranty or representation with respect to the income or expenses for the subject property, the future projected financial performance of the property, the size and square footage of the property and improvements, the presence or absence of contaminating substances, PCBs or asbestos, the compliance with local, state and federal regulations, the physical condition of the improvements thereon, or financial condition or business prospects of any tenant, or any tenant\'s plans or intentions to continue its occupancy of the subject property. The information contained in this offering memorandum has been obtained from sources we believe reliable; however, [COMPANY_NAME] has not verified, and will not verify, any of the information contained herein, nor has [COMPANY_NAME] conducted any investigation regarding these matters and makes no warranty or representation whatsoever regarding the accuracy or completeness of the information provided. All potential buyers must take appropriate measures to verify all of the information set forth herein. Prospective buyers shall be responsible for their costs and expenses of investigating the subject property.',
  'PROPERTY SHOWINGS ARE BY APPOINTMENT ONLY.\nPLEASE CONTACT THE [COMPANY_NAME] ADVISOR FOR MORE DETAILS.',
]

const BUILDER_SECTIONS = [
  'Property Details', 'Property Data', 'Executive Summary', 'Investment Highlights',
  'Location Highlights', 'Images & Media', 'Financials', 'Rent Roll',
  'Income & Expenses', 'Valuation', 'Tenant Profiles', 'Sales Comparables', 'Rental Comparables', 'Market Overview', 'Contact Information', 'Confidentiality Statement', 'Maps',
]

// Curated set shown in the Document Sections panel while EDITING an existing
// document (review + jump-back) — the core content sections, not every step.
const EDIT_SECTIONS = [
  { label: 'Property Details', i: 0 },
  { label: 'Property Data', i: 1 },
  { label: 'Contact Info', i: 14 },
  { label: 'Executive Summary', i: 2 },
  { label: 'Property Highlights', i: 3 },
  { label: 'Market Overview', i: 13 },
  { label: 'Images & Media', i: 5 },
  { label: 'Maps', i: 16 },
  { label: 'Confidentiality', i: 15 },
]

// Suggested "Property Data" fields per property type (shown as one-tap pills).
const DATA_SUGGESTIONS = {
  Retail: ['Traffic Count (VPD)', 'Parking Ratio', 'Frontage', 'Anchor Tenants', 'GLA'],
  'Office / Medical': ['Rentable SF', 'Parking Ratio', 'Number of Floors', 'Year Built', 'Occupancy %'],
  Multifamily: ['Number of Units', 'Avg Unit SF', 'Year Built', 'Occupancy %', 'Parking Spaces'],
  Industrial: ['Clear Height', 'Dock Doors', 'Building SF', 'Power (Amps)', 'Column Spacing'],
  Land: ['Acreage', 'Zoning', 'Topography', 'Utilities', 'Road Frontage'],
  Hospitality: ['Number of Keys', 'ADR', 'Occupancy %', 'RevPAR', 'Year Built'],
  'Self-Storage': ['Number of Units', 'Net Rentable SF', 'Climate-Controlled %', 'Occupancy %', 'Year Built'],
  'Mobile Home Parks': ['Number of Pads', 'Occupancy %', 'Avg Lot Rent', 'Utilities', 'Acreage'],
  'Mixed-Use': ['Total SF', 'Retail SF', 'Residential Units', 'Parking Spaces', 'Year Built'],
  'Net Lease': ['Lease Term', 'Cap Rate', 'Rent Escalations', 'Tenant Credit', 'NOI'],
}

// One-line description shown under each content-section title in the editor.
const SECTION_DESC = {
  'Executive Summary': 'Provide an overview of the investment opportunity. This section appears at the beginning of your document.',
  'Investment Highlights': 'Call out the strongest reasons to buy — the bullet points buyers remember.',
  'Location Highlights': 'Describe the market, access, demographics, and nearby demand drivers.',
  'Images & Media': 'Add captions and context for the photos and media in your document.',
  'Financials': 'Summarize the income, expenses, and returns of the property.',
  'Rent Roll': 'Detail each tenant, their space, rent, and lease terms.',
  'Income & Expenses': 'Break down the operating income and expenses line by line.',
  'Valuation': 'Explain the pricing basis, cap rate, and value conclusion.',
  'Maps': 'Add context for the maps and aerials included in your document.',
  'Tenant Profiles': 'Introduce the tenants and their business strength.',
  'Sales Comparables': 'Summarize comparable sales that support your pricing.',
  'Rental Comparables': 'Summarize comparable rents that support your lease assumptions.',
}

// Suggested-copy library: per content section, a set of sub-topics each with
// ready-made paragraphs. [Tokens] are auto-filled from the property when known,
// otherwise shown as fill-in placeholder chips.
const COPY_LIBRARY = {
  'Executive Summary': [
    { title: 'Opening Statement', cards: [
      'We are pleased to present [Property Name], a premier [Property Type] asset strategically positioned at [Street] in [City], [State]. This exceptional property offers investors a rare opportunity to acquire a well-located asset in one of the region’s most dynamic trade areas.',
      '[Property Name] presents a rare opportunity to acquire a fully-stabilized [Property Type] asset in the heart of [City], [State], offering durable income and meaningful long-term upside.',
      'Offered to the market for the first time in years, [Property Name] is a landmark [Property Type] property located at [Street], [City]. The offering combines strong in-place cash flow with a clear path to future appreciation.',
      'Positioned in the thriving [City], [State] market, [Property Name] is a well-maintained [Property Type] asset that delivers stable returns and standout visibility.',
      '[Property Name] is offered to qualified investors as a stabilized [Property Type] asset in [City], [State], combining dependable cash flow with a compelling long-term growth story.',
      'We are proud to bring [Property Name] to market — a [Property Type] property at [Street] in [City] that stands out for its location, income durability, and upside potential.',
      'It is our pleasure to introduce [Property Name], an exceptional [Property Type] opportunity in [City], [State] that pairs stable, in-place income with a clear path to long-term value creation.',
    ] },
    { title: 'Property Description', cards: [
      '[Property Name] encompasses [Building SF] square feet of leasable [Property Type] space situated on a [Lot Size]-acre parcel. Originally constructed in [Year Built], the property features [Construction] construction with [Parking] parking spaces, providing ample convenience for tenants and customers alike.',
      'Built in [Year Built], [Property Name] offers [Building SF] square feet across a [Lot Size]-acre site, with quality [Construction] construction and [Parking] dedicated parking spaces.',
      '[Property Name] is a [Building SF]-square-foot [Property Type] property featuring durable [Construction] construction, ample [Parking] parking, and excellent frontage along [Street].',
      'Spanning [Building SF] square feet on a [Lot Size]-acre site, [Property Name] was thoughtfully designed for [Property Type] use, with [Parking] parking spaces and efficient, low-maintenance systems.',
      'The improvements at [Property Name] total [Building SF] square feet of [Property Type] space, constructed in [Year Built] with quality materials and generous [Parking] parking.',
      'Featuring strong frontage along [Street], [Property Name] offers [Building SF] square feet of well-configured [Property Type] space that appeals to a broad range of tenants.',
    ] },
    { title: 'Location & Access', cards: [
      'Strategically positioned in [City], [State], [Property Name] enjoys strong visibility along [Street] with convenient regional access and proximity to major demand drivers.',
      '[Property Name] benefits from a prime [City] location, with excellent access via [Street] and a surrounding trade area of [Population] residents within a [Radius]-mile radius.',
      'Located at [Street] in [City], [State], the property sits within an established trade area supported by strong daytime population and [Traffic Count] vehicles per day.',
      'The property sits at [Street] in [City], [State], offering seamless access to [Highway] and proximity to key employment and retail nodes.',
      '[Property Name] commands excellent visibility along [Street], with [Traffic Count] vehicles per day and convenient ingress and egress for tenants and customers.',
      'Set within a growing [City] corridor, [Property Name] is surrounded by strong demand drivers and a trade-area population of [Population] within a [Radius]-mile radius.',
    ] },
    { title: 'Investment Thesis', cards: [
      'This offering represents a compelling opportunity to acquire [Property Name] at an attractive [Cap Rate] cap rate, with [Lease Term] remaining and built-in [Escalations] escalations driving predictable cash flow.',
      'With durable in-place income and below-market rents, [Property Name] offers investors both stability and upside in the growing [City], [State] market.',
      '[Property Name] presents an attractive risk-adjusted return, combining a well-located [Property Type] asset with a clear value-creation strategy and long-term appreciation potential.',
      'Backed by [Occupancy] occupancy and contractual rent growth, [Property Name] offers investors a durable income stream with a clear path to value creation.',
      'At the [Price] asking price, [Property Name] delivers a [Cap Rate] going-in cap rate on stable, in-place income with meaningful upside as rents mark to market.',
      '[Property Name] combines the security of a well-located [Property Type] asset with the growth potential of the expanding [City], [State] market.',
    ] },
    { title: 'Closing Statement', cards: [
      'In summary, [Property Name] combines a prime [City], [State] location, [Occupancy] occupancy, and [Cap Rate] returns into a single institutional-quality offering.',
      '[Property Name] is an institutional-quality [Property Type] offering in [City], [State] that merits serious consideration from discerning investors.',
      'We welcome the opportunity to discuss [Property Name] further and to arrange a private tour of this well-positioned [City] asset.',
      '[Property Name] represents a rare chance to own a well-positioned [Property Type] asset in [City] — one built for durable income and long-term appreciation.',
      'We invite qualified investors to review the details of [Property Name] and to schedule a private tour of this [Occupancy]-leased [City], [State] offering.',
      'For the discerning investor seeking stability and upside, [Property Name] offers a compelling, institutional-quality opportunity in [City], [State].',
    ] },
  ],
  'Investment Highlights': [
    { title: 'Property Features', cards: [
      '[Property Name] offers [Building SF] square feet of quality [Property Type] space built in [Year Built], featuring durable [Construction] construction and [Parking] parking spaces.',
      'The asset combines modern building systems, excellent [Street] frontage, and [Parking] parking spaces, making [Property Name] highly functional for tenants and customers.',
      'Well-maintained and strategically configured, [Property Name] delivers [Building SF] square feet of leasable area on a [Lot Size]-acre parcel with strong curb appeal.',
      'The building at [Property Name] features an efficient [Property Type] layout, quality [Construction] construction, and [Parking] parking spaces that support strong tenant operations.',
      'With [Building SF] square feet of flexible space and prominent [Street] frontage, [Property Name] is well-suited to a wide range of [Property Type] users.',
      'Recent capital improvements and low deferred maintenance make [Property Name] a turnkey [Property Type] asset requiring minimal near-term investment.',
    ] },
    { title: 'Location & Demographics', cards: [
      'Situated in [City], [State], [Property Name] serves a trade area of [Population] residents with an average household income of [Income] within a [Radius]-mile radius.',
      '[Property Name] benefits from [Traffic Count] vehicles per day along [Street] and a growing, affluent population base that supports durable tenant demand.',
      'Favorable demographics and a daytime population of [Daytime Population] reinforce the long-term stability of income at [Property Name].',
      'The trade area surrounding [Property Name] features growing household incomes and a population of [Population], creating durable demand for tenants.',
      '[Property Name] sits in a high-visibility [City], [State] location with [Traffic Count] vehicles per day and easy access from [Street].',
      'Strong daytime population and a [Radius]-mile trade area of [Population] residents position [Property Name] to benefit from consistent customer traffic.',
    ] },
    { title: 'Financial Performance', cards: [
      '[Property Name] generates [NOI] in net operating income at a [Cap Rate] cap rate on the [Price] asking price, with [Escalations] annual escalations driving future growth.',
      'In-place rents produce [GSI] in gross scheduled income and [NOI] of stable net operating income, backed by [Occupancy] occupancy.',
      'With efficient operating expenses of [OpEx] and contractual rent growth, [Property Name] offers investors predictable, growing cash flow.',
      'Backed by [Occupancy] occupancy, [Property Name] produces [NOI] in net operating income with [Escalations] annual rent escalations that support future growth.',
      'At [Price], [Property Name] offers a [Cap Rate] cap rate on durable in-place income, with below-market rents providing additional upside.',
      'Efficient operations and a largely net-lease structure limit expenses to [OpEx], preserving strong margins and predictable cash flow at [Property Name].',
    ] },
    { title: 'Tenant Mix', cards: [
      '[Property Name] is [Occupancy] leased to [Anchor Tenants], providing a creditworthy, diversified rent roll with staggered lease expirations.',
      'A complementary mix of national and regional tenants at [Property Name] limits rollover risk and supports consistent foot traffic.',
      'Anchored by [Anchor Tenants] with [Lease Term] of weighted average lease term remaining, [Property Name] delivers a resilient income stream.',
      'The rent roll at [Property Name] blends established anchor tenants with complementary in-line tenants, reducing risk and stabilizing income.',
      'With staggered lease expirations and [Lease Term] of weighted average term remaining, [Property Name] minimizes rollover exposure.',
      '[Anchor Tenants] anchor [Property Name], driving foot traffic that benefits the broader tenant base and supports renewals at market rents.',
    ] },
    { title: 'Market Position', cards: [
      'Positioned in the supply-constrained [City], [State] submarket, [Property Name] benefits from limited competition and steady tenant demand.',
      '[Property Name] holds a dominant location within one of [City]’s most sought-after corridors, supported by strong population and job growth.',
      'As a landmark [Property Type] asset in [City], [Property Name] enjoys premier visibility and a durable competitive advantage in its trade area.',
      'Supported by population and job growth, the [City], [State] submarket gives [Property Name] a durable competitive advantage over surrounding assets.',
      'Limited new supply and strong tenant demand in the corridor reinforce [Property Name]’s position as a preferred [Property Type] location.',
      '[Property Name] enjoys standout visibility and a strategic location that positions it ahead of competing properties in the [City] market.',
    ] },
  ],
  'Location Highlights': [
    { title: 'Strategic Position', cards: [
      'Strategically positioned in [City], [State], [Property Name] sits within a supply-constrained corridor with excellent frontage along [Street] and strong regional connectivity.',
      '[Property Name] commands a dominant location in one of [City]’s most active [Property Type] submarkets, benefiting from established demand drivers and limited competition.',
      'Located at the crossroads of [Street] and major thoroughfares, [Property Name] enjoys premier visibility and accessibility in a high-growth trade area.',
      '[Property Name] anchors a prime position along [Street] in [City], [State], with strong regional connectivity and proximity to major demand drivers.',
      'Set in a supply-constrained corridor, [Property Name] benefits from limited competition and a durable, established tenant base.',
      'The strategic [City] location of [Property Name] places it in the path of growth, with excellent visibility and access from surrounding thoroughfares.',
    ] },
    { title: 'Transportation & Access', cards: [
      '[Property Name] offers convenient access via [Street] and [Highway], with [Traffic Count] vehicles per day passing the site and direct routes to regional employment centers.',
      'The property benefits from multiple ingress and egress points along [Street], ensuring seamless access for tenants, customers, and delivery traffic.',
      'Well-served by nearby transit and highway networks, [Property Name] provides exceptional connectivity throughout the [City], [State] market.',
      '[Property Name] is easily reached via [Highway] and [Street], with [Traffic Count] vehicles per day and convenient connections to regional employment centers.',
      'Multiple access points and nearby transit make [Property Name] highly convenient for tenants, customers, and delivery traffic alike.',
      'Positioned along [Street], [Property Name] offers seamless ingress and egress and direct routes throughout the [City], [State] market.',
    ] },
    { title: 'Demographics & Economy', cards: [
      'Within a [Radius]-mile radius, [Property Name] serves [Population] residents with an average household income of [Income], underpinning strong and durable consumer demand.',
      'The surrounding [City], [State] economy continues to expand, supported by job growth, rising incomes, and a daytime population of [Daytime Population].',
      'Favorable demographic trends and a deep, affluent customer base reinforce the long-term stability of income at [Property Name].',
      'A [Radius]-mile trade area of [Population] residents with an average income of [Income] gives [Property Name] a deep, affluent customer base.',
      'The [City], [State] economy continues to expand through job growth and rising incomes, supporting durable demand at [Property Name].',
      'Strong daytime population and favorable demographic trends around [Property Name] reinforce long-term income stability.',
    ] },
    { title: 'Nearby Amenities', cards: [
      '[Property Name] is surrounded by complementary retail, dining, and service amenities that generate consistent foot traffic and support tenant performance.',
      'Anchored by major demand drivers within the trade area, [Property Name] benefits from proximity to shopping centers, employers, and residential neighborhoods.',
      'The immediate area around [Property Name] offers a robust mix of national and regional amenities that enhance its appeal to tenants and customers.',
      'Surrounding retail, dining, and services near [Property Name] generate steady foot traffic that benefits tenants and reinforces the location.',
      '[Property Name] sits near major employers, shopping centers, and residential neighborhoods that anchor demand within the trade area.',
      'A robust mix of national and regional amenities around [Property Name] enhances its appeal to tenants and their customers.',
    ] },
    { title: 'Growth & Development', cards: [
      'The [City], [State] submarket is experiencing significant new development and population growth, positioning [Property Name] to benefit from rising demand.',
      'Ongoing infrastructure investment and commercial expansion in the corridor surrounding [Property Name] support long-term appreciation potential.',
      'As the [City] trade area continues to grow, [Property Name] is well-positioned to capture increasing tenant demand and value creation over the hold period.',
      'New development and rising population in the [City], [State] submarket position [Property Name] to capture growing tenant demand.',
      'Ongoing infrastructure and commercial investment in the corridor around [Property Name] support long-term value appreciation.',
      'As the [City] trade area expands, [Property Name] is well-positioned to benefit from increasing demand and rents over the hold period.',
    ] },
  ],
  'Financials': [
    { title: 'Income Summary', cards: [
      '[Property Name] generates [GSI] in gross scheduled income and [NOI] in net operating income, reflecting a [Cap Rate] capitalization rate on the asking price of [Price].',
      'In-place rents at [Property Name] produce [NOI] of net operating income, with contractual escalations supporting future growth.',
      'At the [Price] asking price, [Property Name] offers investors a [Cap Rate] going-in cap rate on stable, in-place income.',
    ] },
    { title: 'Expense Overview', cards: [
      'Operating expenses total [OpEx] annually, or [Expense Ratio] of effective gross income, covering taxes, insurance, CAM, and management.',
      '[Property Name] operates efficiently with expenses of [OpEx], leaving significant net income for ownership.',
      'A largely net-lease structure limits landlord expenses at [Property Name] to [OpEx] per year.',
    ] },
  ],
}
const GENERIC_COPY = (section, docType) => [
  { title: 'Overview', cards: [
    `This ${section.toLowerCase()} section highlights the defining details of [Property Name], a [Property Type] asset located at [Street] in [City], [State].`,
    `[Property Name] stands out in the [City], [State] market as a well-positioned [Property Type] property with strong fundamentals.`,
    `An overview of [Property Name] underscores its prime [City] location and appeal to ${docType || 'investors'}.`,
  ] },
  { title: 'Key Points', cards: [
    `[Property Name] offers [Building SF] square feet with [Occupancy] occupancy, positioning it as a standout ${docType || 'offering'} in the [City] market.`,
    `Key metrics for [Property Name] include [Building SF] of space, [Parking] parking spaces, and [Occupancy] occupancy.`,
    `Investors will note [Property Name]’s [Cap Rate] cap rate, [NOI] in net operating income, and durable tenant base.`,
  ] },
  { title: 'Summary', cards: [
    `In conclusion, [Property Name] combines strong fundamentals and a prime [City], [State] location into a compelling investment.`,
    `[Property Name] represents a rare chance to acquire a quality [Property Type] asset in [City], [State].`,
    `We invite qualified parties to review the details of [Property Name] and schedule a tour.`,
  ] },
]
const copyGroups = (section, docType) => COPY_LIBRARY[section] || GENERIC_COPY(section, docType)
const tokenCount = (text) => (text.match(/\[[^\]]+\]/g) || []).length
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const CHIP_FILLED = 'background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;border-radius:5px;padding:0 5px;font-weight:600;'
const CHIP_EMPTY = 'background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;border-radius:5px;padding:0 5px;font-style:italic;'
const copyToHtml = (text, fill) =>
  escapeHtml(text).replace(/\[([^\]]+)\]/g, (m, k) => {
    const v = fill[k]
    return v ? `<span style="${CHIP_FILLED}">${escapeHtml(v)}</span>` : `<span style="${CHIP_EMPTY}">[${escapeHtml(k)}]</span>`
  })
function CopyText({ text, fill }) {
  return text.split(/(\[[^\]]+\])/g).map((p, i) => {
    const m = p.match(/^\[([^\]]+)\]$/)
    if (!m) return <span key={i}>{p}</span>
    const v = fill[m[1]]
    return v
      ? <span key={i} className="rounded border border-orange-200 bg-orange-50 px-1 font-semibold text-orange-700">{v}</span>
      : <span key={i} className="rounded border border-slate-200 bg-slate-100 px-1 italic text-slate-500">[{m[1]}]</span>
  })
}

// Icon library the user can pick from when creating a custom Key Metric.
const ICON_LIBRARY = {
  DollarSign, Percent, Scale, TrendingUp, BarChart3, PieChart,
  Building2, Home, Warehouse, Store, Factory, Container,
  MapPin, Map, Users, Calendar, Clock, Star,
  Zap, Target, BadgeCheck, Globe, Layers, Camera, Car,
}

// Metric library, grouped by category (shown in the "Add from Library" picker).
const METRIC_CATALOG = {
  FINANCIAL: [
    { name: 'DSCR', desc: 'Debt Service Coverage Ratio', icon: 'Scale' },
    { name: 'Cap Rate', desc: 'Capitalization rate', icon: 'Percent' },
    { name: 'NOI', desc: 'Net operating income', icon: 'TrendingUp' },
    { name: 'Cash-on-Cash', desc: 'Cash-on-cash return', icon: 'Percent' },
    { name: 'Gross Income', desc: 'Gross scheduled income', icon: 'DollarSign' },
    { name: 'Operating Expenses', desc: 'Total annual operating expenses', icon: 'DollarSign' },
    { name: 'Loan-to-Value', desc: 'LTV ratio', icon: 'Percent' },
    { name: 'Debt Yield', desc: 'NOI ÷ loan amount', icon: 'Percent' },
  ],
  PROPERTY: [
    { name: 'Units', desc: 'Total unit count', icon: 'Layers' },
    { name: 'Parking', desc: 'Parking spaces or ratio', icon: 'Car' },
    { name: 'Stories', desc: 'Number of stories/floors', icon: 'Building2' },
    { name: 'Tenants', desc: 'Number of tenants', icon: 'Users' },
    { name: 'Total SF', desc: 'Total leasable square footage', icon: 'Scale' },
    { name: 'Year Built', desc: 'Year the property was built', icon: 'Calendar' },
    { name: 'Lot Size', desc: 'Parcel size in acres', icon: 'Map' },
  ],
  OCCUPANCY: [
    { name: 'Occupancy', desc: 'Current occupancy rate', icon: 'Percent' },
    { name: 'Vacancy', desc: 'Current vacancy rate', icon: 'Percent' },
    { name: 'Physical Occupancy', desc: 'Physically occupied units', icon: 'Home' },
    { name: 'Economic Occupancy', desc: 'Rent-paying occupancy', icon: 'DollarSign' },
    { name: 'WALT', desc: 'Weighted average lease term', icon: 'Clock' },
  ],
  RETURNS: [],
  HOTEL: [
    { name: 'GOPPAR', desc: 'Gross operating profit per available room', icon: 'TrendingUp' },
    { name: 'Room Revenue', desc: 'Total annual room revenue', icon: 'DollarSign' },
    { name: 'ADR', desc: 'Average daily rate', icon: 'DollarSign' },
    { name: 'RevPAR', desc: 'Revenue per available room', icon: 'BarChart3' },
    { name: 'Keys', desc: 'Number of guest rooms', icon: 'Home' },
  ],
}
const METRIC_CATS = Object.keys(METRIC_CATALOG)

// Financials step: what to include
const FIN_TYPES = [
  { key: 'Full Financials', icon: BarChart3, desc: 'Rent roll, income & expenses, and cash flow projections' },
  { key: 'Rent Roll Only', icon: LayoutGrid, desc: 'Tenant and vacancy data only' },
  { key: 'Cap Rate & NOI', icon: Percent, desc: 'Simple valuation triangle' },
  { key: 'Skip Financials', icon: EyeOff, desc: 'No financial pages in document' },
]

// Rent Roll step: type selector (families × modes)
const RR_FAMILIES = [
  {
    family: 'Multi-Year Cash Flow', tone: 'emerald', icon: TrendingUp,
    blurb: 'Projects income & expenses for up to 10 years with annual growth rates.',
    modes: [
      { mode: 'Unit-by-Unit', desc: 'Lists each tenant individually with lease terms, rent, and expense reimbursements. Generates an up to 10-year cash flow projection showing how income grows annually.', bestFor: 'Office, retail, and industrial with named tenants', points: ['Individual tenant rows with lease details', 'Up to 10-year income & expense projection', 'Per-tenant growth rate overrides'] },
      { mode: 'Unit Mix', desc: 'Groups units by type (e.g., Studio, 1BR, 2BR) with unit counts and average rents. Generates an up to 10-year cash flow projection with aggregate income growth.', bestFor: 'Multifamily, student housing, and large unit counts', points: ['Units grouped by type with counts', 'Up to 10-year income & expense projection', 'Aggregate totals per unit type'] },
    ],
  },
  {
    family: 'Pro Forma', tone: 'violet', icon: Layers,
    blurb: 'Compares in-place rents with projected stabilized rents side by side.',
    modes: [
      { mode: 'Unit-by-Unit', desc: "Shows each unit's current in-place rent side by side with projected stabilized rents. Highlights income upside from renovations, lease-ups, or rent bumps.", bestFor: 'Value-add properties with rent increase potential', points: ['In-place vs projected rent comparison', 'Per-unit upside visibility', 'Expense reimbursement detail'] },
      { mode: 'Unit Mix', desc: 'Groups units by type with both current and projected rent columns. Shows aggregate income upside at a glance for large portfolios.', bestFor: 'Value-add multifamily or large mixed-use properties', points: ['In-place vs projected by unit type', 'Aggregate totals & upside', 'Concise format for many units'] },
    ],
  },
]
const RR_COLUMNS = ['Unit', 'Tenant', 'SF', 'Rent/SF', 'Monthly', 'Annual', 'Incr %', 'Reimb/SF', 'Ann. Reimb.', 'Start', 'End', 'Notes']
const RR_KEYS = ['unit', 'tenant', 'sf', 'rentSf', 'monthly', 'annual', 'incr', 'reimbSf', 'annReimb', 'start', 'end', 'notes']
// Pro Forma layout swaps "Incr %" for in-place vs projected columns.
const RR_COLUMNS_PF = ['Unit', 'Tenant', 'SF', 'Rent/SF', 'Monthly', 'Annual', 'Reimb/SF', 'Ann. Reimb.', 'Start', 'End', 'Pro-Forma / SF', 'Pro-Forma / Yr', 'Pro-Forma Exp. Reimb.', 'Notes']
const RR_KEYS_PF = ['unit', 'tenant', 'sf', 'rentSf', 'monthly', 'annual', 'reimbSf', 'annReimb', 'start', 'end', 'pfSf', 'pfYr', 'pfReimb', 'notes']
// Unit Mix groups units by type instead of listing each tenant.
const RR_COLUMNS_MIX = ['Unit', 'Unit Type', '# Units', 'Avg SF', 'Rent/SF', 'Annual', 'Total Annual', 'Incr %', 'Reimb/SF', 'Ann. Reimb.', 'Notes']
const RR_KEYS_MIX = ['unit', 'unitType', 'numUnits', 'avgSf', 'rentSf', 'annual', 'totalAnnual', 'incr', 'reimbSf', 'annReimb', 'notes']
const RR_COLUMNS_MIX_PF = ['Unit', 'Unit Type', '# Units', 'Avg SF', 'Rent/SF', 'Annual', 'Total Annual', 'Reimb/SF', 'Ann. Reimb.', 'Pro-Forma / SF', 'Pro-Forma / Yr', 'Pro-Forma Exp. Reimb.', 'Notes']
const RR_KEYS_MIX_PF = ['unit', 'unitType', 'numUnits', 'avgSf', 'rentSf', 'annual', 'totalAnnual', 'reimbSf', 'annReimb', 'pfSf', 'pfYr', 'pfReimb', 'notes']
const RR_LAYOUTS = {
  'Multi-Year Cash Flow|Unit-by-Unit': { cols: RR_COLUMNS, keys: RR_KEYS },
  'Multi-Year Cash Flow|Unit Mix': { cols: RR_COLUMNS_MIX, keys: RR_KEYS_MIX },
  'Pro Forma|Unit-by-Unit': { cols: RR_COLUMNS_PF, keys: RR_KEYS_PF },
  'Pro Forma|Unit Mix': { cols: RR_COLUMNS_MIX_PF, keys: RR_KEYS_MIX_PF },
}
const ICON_NAMES = Object.keys(ICON_LIBRARY)
const MetricIcon = ({ name, className }) => {
  const I = ICON_LIBRARY[name] || DollarSign
  return <I className={className} />
}

// ── Live-preview document pages ──────────────────────────────────────────────
// Every page renders at a fixed 640×828 "sheet" so thumbnails and the full-size
// popup share exactly the same layout (just scaled with a CSS transform).
const PAGES = [
  { key: 'cover', title: 'Cover Page' },
  { key: 'exec', title: 'Executive Summary', section: 2 },
  { key: 'invest', title: 'Investment Highlights', section: 3 },
  { key: 'location', title: 'Location Highlights', section: 4 },
  { key: 'valuation', title: 'Valuation Summary', section: 9 },
  { key: 'demographics', title: 'Demographics' },
  { key: 'financials', title: 'Financials', section: 8 },
  { key: 'contact', title: 'Contact', section: 13 },
]

const PLine = ({ w = '100%', c = '#e2e8f0', h = 8 }) => (
  <div style={{ width: w, height: h, background: c, borderRadius: 4 }} />
)

function ScaledPage({ scale, children }) {
  return (
    <div style={{ width: 640 * scale, height: 828 * scale, overflow: 'hidden' }} className="shrink-0 bg-white">
      <div style={{ width: 640, height: 828, transform: `scale(${scale})`, transformOrigin: 'top left' }} className="bg-white">
        {children}
      </div>
    </div>
  )
}

function BuilderPage({ pageKey, data }) {
  const { name, docType, price, priceVis, location, owner, ownerEmail, dataPoints, brand, sections, lat, lng, cover } = data
  const initials = (owner || 'W').split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()
  const showPrice = priceVis === 'Show' && price
  const hasLoc = typeof lat === 'number' && !Number.isNaN(lat)
  const mapBlock = hasLoc ? (
    <GMapThumb lat={lat} lng={lng} zoom={13} className="h-full w-full overflow-hidden rounded-lg" />
  ) : (
    <div className="relative h-full w-full overflow-hidden rounded-lg" style={{ background: 'radial-gradient(circle at 52% 46%, #d1fae5, #bbf7d0 38%, #dcfce7 70%)' }}>
      <span className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/40" />
      <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/50" />
      <span className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-600/60" />
      <MapPin className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-full text-rose-500" />
    </div>
  )
  const header = (
    <div>
      <h2 className="text-2xl font-extrabold text-slate-900">{name}</h2>
      <p className="mt-0.5 text-sm text-slate-400">{[docType, location].filter(Boolean).join(' · ')}</p>
      <div className="mt-3 h-1.5 w-20 rounded" style={{ background: brand }} />
    </div>
  )
  const rows = (dataPoints && dataPoints.length ? dataPoints : [
    { label: 'Cap Rate', value: '6.25%' }, { label: 'NOI', value: '$182,400' },
    { label: 'Price / SF', value: '$412' }, { label: 'Occupancy', value: '95%' },
    { label: 'Year Built', value: '2016' }, { label: 'Building Size', value: '12,400 SF' },
  ]).filter((r) => r.label)

  if (pageKey === 'cover') {
    return (
      <div className="flex h-full flex-col">
        <div className="relative flex-1 overflow-hidden" style={cover ? undefined : { background: 'repeating-linear-gradient(45deg,#eef2f7,#eef2f7 14px,#e8eef6 14px,#e8eef6 28px)' }}>
          {cover && <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute bottom-4 right-5 flex items-center gap-2 rounded-md bg-white/80 px-3 py-1.5">
            <Building2 className="h-4 w-4" style={{ color: brand }} />
            <span className="text-xs font-extrabold tracking-tight text-slate-700">MyCREBlueprint</span>
          </div>
        </div>
        <div className="px-10 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-block rounded px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: brand }}>{docType}</span>
              <h1 className="mt-4 truncate text-4xl font-extrabold text-slate-900">{name}</h1>
              <p className="mt-2 text-lg text-slate-500">{location || '—'}</p>
            </div>
            {showPrice && (
              <div className="shrink-0 text-right">
                <p className="text-3xl font-extrabold" style={{ color: brand }}>{currency(price)}</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Price</p>
              </div>
            )}
          </div>
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-base font-bold text-slate-900">{owner}</p>
            <p className="text-sm text-slate-500">Agent</p>
            <p className="text-sm text-slate-500">{ownerEmail}</p>
          </div>
        </div>
      </div>
    )
  }

  if (pageKey === 'exec') {
    const txt = sections?.[2]
    return (
      <div className="flex h-full flex-col p-10">
        {header}
        <h3 className="mt-7 text-lg font-bold" style={{ color: brand }}>Executive Summary</h3>
        {txt ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{txt}</p>
        ) : (
          <div className="mt-4 space-y-2.5">
            {['96%', '88%', '92%', '80%', '94%', '70%', '90%', '84%', '60%'].map((w, i) => (
              <PLine key={i} w={w} />
            ))}
          </div>
        )}
        <div className="mt-auto grid grid-cols-3 gap-3">
          {[['Asking Price', showPrice ? currency(price) : '—'], ['Property Type', docType], ['Location', location || '—']].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-slate-200 p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">{k}</p>
              <p className="mt-1 truncate text-sm font-bold text-slate-800">{v}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (pageKey === 'invest') {
    const txt = sections?.[3]
    return (
      <div className="h-full p-10">
        {header}
        <h3 className="mt-7 text-lg font-bold" style={{ color: brand }}>Investment Highlights</h3>
        <div className="mt-4 rounded-xl p-5 text-white" style={{ background: brand }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80">Net Lease Status</p>
          <p className="mt-1 text-2xl font-extrabold">Absolute NNN · Zero Landlord Responsibilities</p>
        </div>
        {txt ? (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{txt}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {['Corporate-guaranteed lease with 10+ years remaining', 'Scheduled rent escalations every 5 years', 'Positioned in a high-growth retail corridor', 'Strong tenant credit and proven store performance'].map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: brand }} /> {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  if (pageKey === 'location') {
    return (
      <div className="flex h-full flex-col p-10">
        {header}
        <h3 className="mt-6 text-lg font-bold" style={{ color: brand }}>Location Highlights</h3>
        <div className="mt-3 h-52">{mapBlock}</div>
        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3">
          {[['Population (3 mi)', '128,400'], ['Median HH Income', '$92,100'], ['Daytime Population', '54,900'], ['Traffic Count (VPD)', '38,500']].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-sm text-slate-500">{k}</span>
              <span className="text-sm font-bold text-slate-800">{v}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (pageKey === 'valuation') {
    return (
      <div className="h-full p-10">
        <div className="rounded-md px-4 py-2.5 text-white" style={{ background: brand }}>
          <p className="text-base font-bold">Valuation Summary</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
          {rows.slice(0, 8).map((r, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">{r.label}</p>
              <p className="mt-1 text-base font-extrabold" style={{ color: brand }}>{r.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (pageKey === 'demographics') {
    return (
      <div className="flex h-full flex-col p-10">
        {header}
        <h3 className="mt-6 text-lg font-bold" style={{ color: brand }}>Demographics</h3>
        <div className="mt-3 h-44">{mapBlock}</div>
        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="pb-2 font-semibold">Metric</th><th className="pb-2 text-right font-semibold">1 mi</th><th className="pb-2 text-right font-semibold">3 mi</th><th className="pb-2 text-right font-semibold">5 mi</th>
            </tr>
          </thead>
          <tbody>
            {[['Population', '18,200', '128,400', '312,900'], ['Households', '7,100', '49,600', '121,400'], ['Avg. Income', '$88k', '$92k', '$97k']].map((r) => (
              <tr key={r[0]} className="border-t border-slate-100">
                <td className="py-2 font-medium text-slate-700">{r[0]}</td><td className="py-2 text-right text-slate-600">{r[1]}</td><td className="py-2 text-right text-slate-600">{r[2]}</td><td className="py-2 text-right text-slate-600">{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (pageKey === 'financials') {
    const txt = sections?.[8]
    return (
      <div className="h-full p-10">
        {header}
        <h3 className="mt-7 text-lg font-bold" style={{ color: brand }}>Financials</h3>
        {txt ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{txt}</p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {[['Gross Scheduled Income', '$214,000'], ['Vacancy Loss (5%)', '-$10,700'], ['Effective Gross Income', '$203,300'], ['Operating Expenses', '-$20,900'], ['Net Operating Income', '$182,400']].map(([k, v], i, a) => (
              <div key={k} className={`flex items-center justify-between py-3 ${i === a.length - 1 ? 'font-extrabold text-slate-900' : 'text-slate-600'}`}>
                <span className="text-sm">{k}</span><span className="text-sm" style={i === a.length - 1 ? { color: brand } : undefined}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // contact
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-extrabold text-white" style={{ background: brand }}>{initials}</div>
      <p className="mt-2 text-2xl font-extrabold text-slate-900">{owner}</p>
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Agent · MyCREBlueprint</p>
      <div className="mt-2 space-y-1 text-sm text-slate-500">
        <p>{ownerEmail}</p>
        <p>{location || '—'}</p>
      </div>
    </div>
  )
}

// Full-size page viewer with prev/next paging (opens from a Live-Preview thumbnail).
function PageViewerModal({ index, data, onClose, onIndex }) {
  if (index == null) return null
  const page = PAGES[index]
  const prev = () => onIndex((index - 1 + PAGES.length) % PAGES.length)
  const next = () => onIndex((index + 1) % PAGES.length)
  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <p className="mb-3 text-sm font-semibold text-white">{page.title} — Page {index + 1} of {PAGES.length}</p>
      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <button onClick={prev} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/10">
          <ScaledPage scale={0.82}>
            <BuilderPage pageKey={page.key} data={data} />
          </ScaledPage>
        </div>
        <button onClick={next} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      <div className="mt-4 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {PAGES.map((p, i) => (
          <button key={p.key} onClick={() => onIndex(i)} className={`h-1.5 rounded-full transition ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
        ))}
      </div>
      <button onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white">
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

// Read-only mini map preview (used on the Maps step).
function MiniMap({ lat, lng, zoom, className }) {
  const elRef = useRef(null)
  useEffect(() => {
    if (!elRef.current) return
    const has = typeof lat === 'number' && !Number.isNaN(lat)
    const map = L.map(elRef.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false }).setView(has ? [lat, lng] : [39.8, -98.5], has ? (zoom || 14) : 4)
    // CARTO Voyager — labeled streets/POIs with a reliable app-friendly CDN
    // (OSM's own tile server blocks bulk app usage, which leaves the map blank).
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 20 }).addTo(map)
    if (has) {
      const pin = L.divIcon({ className: '', html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="1.5"><path d="M12 2C8 2 5 5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/></svg>`, iconSize: [30, 30], iconAnchor: [15, 30] })
      L.marker([lat, lng], { icon: pin }).addTo(map)
    }
    const t1 = setTimeout(() => map.invalidateSize(), 150)
    const t2 = setTimeout(() => map.invalidateSize(), 500)
    return () => { clearTimeout(t1); clearTimeout(t2); map.remove() }
  }, [lat, lng, zoom])
  // `isolate` (isolation: isolate) contains Leaflet's internal z-index stack
  // (panes/controls up to z-800) so the map can never paint over app modals.
  return <div ref={elRef} className={`relative isolate ${className || 'h-40 w-full overflow-hidden rounded-lg bg-slate-100'}`} />
}

// Static Google-map thumbnail — a plain <img>, so it always renders (no Leaflet
// sizing/timing/z-index issues). Falls back to a pin placeholder if it can't load.
function GMapThumb({ lat, lng, zoom, className }) {
  const [failed, setFailed] = useState(false)
  const has = typeof lat === 'number' && !Number.isNaN(lat)
  const c = has ? `${lat},${lng}` : '22.5937,78.9629'
  const z = zoom || (has ? 14 : 5)
  const url = GMAPS_KEY
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${c}&zoom=${z}&size=400x280&scale=2&maptype=roadmap&markers=color:red%7C${c}&style=feature:poi%7Cvisibility:off&style=feature:transit%7Cvisibility:off&key=${GMAPS_KEY}`
    : null
  return (
    <div className={`relative isolate flex items-center justify-center bg-slate-100 ${className || 'h-40 w-full overflow-hidden rounded-lg'}`}>
      {url && !failed ? (
        <img src={url} alt="Map preview" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : (
        <MapPin className="h-8 w-8 text-rose-400" />
      )}
    </div>
  )
}

// Interactive editor for a single map slide — pan/zoom/drag the pin, then save.
// ---- Google Maps loader (uses the gitignored VITE_GOOGLE_MAPS_API_KEY) -------
const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
let gmapsPromise = null
function loadGoogleMaps() {
  if (typeof window !== 'undefined' && window.google?.maps) return Promise.resolve(window.google.maps)
  if (gmapsPromise) return gmapsPromise
  gmapsPromise = new Promise((resolve, reject) => {
    if (!GMAPS_KEY) { reject(new Error('missing-key')); return }
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places,drawing,marker&v=weekly`
    s.async = true
    s.defer = true
    s.onload = () => resolve(window.google.maps)
    s.onerror = () => reject(new Error('load-failed'))
    document.head.appendChild(s)
  })
  return gmapsPromise
}

// Map style presets (matches the reference's clean, label-dimmed look).
const GMAP_STYLES = {
  Clean: [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  ],
  Standard: [],
  Silver: [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
  ],
  Dark: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#a5b3c9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ],
}

const GMAP_TOOLS = [
  { key: 'property', icon: MapPin, label: 'Property', desc: 'Edit subject property marker' },
  { key: 'nearby', icon: Search, label: 'Nearby Places', desc: 'Search & add nearby businesses' },
  { key: 'logo', icon: ImagePlus, label: 'Brand Logo', desc: "Find any company's logo" },
  { key: 'label', icon: Type, label: 'Label', desc: 'Add text to the map' },
  { key: 'upload', icon: Upload, label: 'Upload', desc: 'Upload a custom image' },
  { key: 'draw', icon: Pencil, label: 'Draw', desc: 'Draw shapes on the map' },
  { key: 'style', icon: Map, label: 'Map Style', desc: 'Change map appearance' },
  { key: 'center', icon: Target, label: 'Center Map', desc: '' },
]

const NEARBY_CATEGORIES = [
  { label: 'Grocery', term: 'grocery store', icon: ShoppingCart, cls: 'text-emerald-600 ring-emerald-200' },
  { label: 'Retail', term: 'retail store', icon: Store, cls: 'text-blue-600 ring-blue-200' },
  { label: 'Restaurants', term: 'restaurant', icon: Utensils, cls: 'text-orange-600 ring-orange-200' },
  { label: 'Schools', term: 'school', icon: GraduationCap, cls: 'text-violet-600 ring-violet-200' },
  { label: 'Banks', term: 'bank', icon: Landmark, cls: 'text-slate-600 ring-slate-200' },
  { label: 'Gas Stations', term: 'gas station', icon: Fuel, cls: 'text-red-600 ring-red-200' },
  { label: 'Government', term: 'government office', icon: Building2, cls: 'text-indigo-600 ring-indigo-200' },
  { label: 'Medical', term: 'hospital clinic', icon: HeartPulse, cls: 'text-rose-600 ring-rose-200' },
  { label: 'Hotels', term: 'hotel', icon: Hotel, cls: 'text-amber-600 ring-amber-200' },
  { label: 'Pharmacies', term: 'pharmacy', icon: Pill, cls: 'text-teal-600 ring-teal-200' },
]

// Full-screen Google-Maps-based map editor (Phase 1: map, property marker,
// draggable labels, center, map style, save).
function GoogleMapEditor({ open, map, onSave, onClose, notify }) {
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const overlaysRef = useRef([])
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState(null)
  const [title, setTitle] = useState('')
  const [style, setStyle] = useState('Clean')
  const [styleOpen, setStyleOpen] = useState(false)
  const [panel, setPanel] = useState(null) // 'nearby' | 'logo'
  const [q, setQ] = useState('')
  const [drawing, setDrawing] = useState(false)
  const fileRef = useRef(null)
  const drawMgrRef = useRef(null)

  useEffect(() => {
    if (!open || !map) return
    setTitle(map.title || '')
    setReady(false)
    setErr(null)
    let cancelled = false
    loadGoogleMaps().then((g) => {
      if (cancelled || !elRef.current) return
      const has = typeof map.lat === 'number' && !Number.isNaN(map.lat)
      const center = has ? { lat: map.lat, lng: map.lng } : { lat: 22.5937, lng: 78.9629 }
      const gmap = new g.Map(elRef.current, {
        center,
        zoom: map.zoom || (has ? 14 : 5),
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: GMAP_STYLES[map.style || 'Clean'] || [],
      })
      mapRef.current = gmap
      setStyle(map.style || 'Clean')
      // Draggable property marker
      const marker = new g.Marker({ position: center, map: gmap, draggable: true })
      markerRef.current = marker
      // Restore saved label overlays
      overlaysRef.current = []
      ;(map.overlays || []).forEach((ov) => (ov.type === 'image' ? addImage(g, gmap, ov) : addLabel(g, gmap, ov)))
      setReady(true)
    }).catch((e) => { if (!cancelled) setErr(e.message === 'missing-key' ? 'no-key' : 'load-failed') })
    return () => { cancelled = true; mapRef.current = null; markerRef.current = null; overlaysRef.current = [] }
  }, [open, map])

  // A draggable, editable text label rendered as a Google Maps OverlayView.
  const addLabel = (g, gmap, data) => {
    const d = { id: data.id || uid(), text: data.text || 'Label', lat: data.lat, lng: data.lng }
    if (typeof d.lat !== 'number') { const c = gmap.getCenter(); d.lat = c.lat(); d.lng = c.lng() }
    class LabelOverlay extends g.OverlayView {
      onAdd() {
        const div = document.createElement('div')
        div.className = 'gm-label'
        div.style.cssText = 'position:absolute;transform:translate(-50%,-50%);background:rgba(255,255,255,.9);border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;font:600 13px Arial;color:#0f172a;cursor:move;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.12);user-select:none'
        div.textContent = d.text
        div.title = 'Double-click to edit, drag to move'
        div.addEventListener('dblclick', (e) => {
          e.stopPropagation()
          const t = window.prompt('Label text', d.text)
          if (t != null) { d.text = t; div.textContent = t }
        })
        let dragging = false
        div.addEventListener('mousedown', (e) => { e.stopPropagation(); dragging = true; gmap.setOptions({ draggable: false }) })
        const move = (e) => {
          if (!dragging) return
          const proj = this.getProjection(); if (!proj) return
          const box = elRef.current.getBoundingClientRect()
          const pt = new g.Point(e.clientX - box.left, e.clientY - box.top)
          const ll = proj.fromContainerPixelToLatLng(pt)
          d.lat = ll.lat(); d.lng = ll.lng(); this.draw()
        }
        const up = () => { if (dragging) { dragging = false; gmap.setOptions({ draggable: true }) } }
        window.addEventListener('mousemove', move)
        window.addEventListener('mouseup', up)
        this._cleanup = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
        this._div = div
        this.getPanes().overlayMouseTarget.appendChild(div)
      }
      draw() {
        const proj = this.getProjection(); if (!proj || !this._div) return
        const p = proj.fromLatLngToDivPixel(new g.LatLng(d.lat, d.lng))
        this._div.style.left = p.x + 'px'; this._div.style.top = p.y + 'px'
      }
      onRemove() { this._cleanup?.(); this._div?.remove(); this._div = null }
    }
    const o = new LabelOverlay(); o.setMap(gmap); o._data = d
    overlaysRef.current.push(o)
  }

  // A draggable image (logo or custom upload) rendered as an OverlayView.
  const addImage = (g, gmap, data) => {
    const d = { id: data.id || uid(), type: 'image', url: data.url, lat: data.lat, lng: data.lng, w: data.w || 90 }
    if (typeof d.lat !== 'number') { const c = gmap.getCenter(); d.lat = c.lat(); d.lng = c.lng() }
    const self = { }
    class ImgOverlay extends g.OverlayView {
      onAdd() {
        const div = document.createElement('div')
        div.style.cssText = 'position:absolute;transform:translate(-50%,-50%);cursor:move;user-select:none'
        div.title = 'Drag to move · double-click to remove'
        const img = document.createElement('img')
        img.src = d.url; img.referrerPolicy = 'no-referrer'
        img.style.cssText = `width:${d.w}px;height:auto;display:block;pointer-events:none;border-radius:6px;filter:drop-shadow(0 1px 4px rgba(0,0,0,.3))`
        img.onerror = () => { div.style.cssText += ';background:#fee2e2;padding:6px;border-radius:6px;font:600 11px Arial;color:#b91c1c'; div.textContent = 'logo not found' }
        div.appendChild(img)
        div.addEventListener('dblclick', (e) => { e.stopPropagation(); this.setMap(null); overlaysRef.current = overlaysRef.current.filter((o) => o !== this); notify?.('Image removed') })
        let dragging = false
        div.addEventListener('mousedown', (e) => { e.stopPropagation(); dragging = true; gmap.setOptions({ draggable: false }) })
        const move = (e) => { if (!dragging) return; const proj = this.getProjection(); if (!proj) return; const box = elRef.current.getBoundingClientRect(); const pt = new g.Point(e.clientX - box.left, e.clientY - box.top); const ll = proj.fromContainerPixelToLatLng(pt); d.lat = ll.lat(); d.lng = ll.lng(); this.draw() }
        const up = () => { if (dragging) { dragging = false; gmap.setOptions({ draggable: true }) } }
        window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
        this._cleanup = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
        this._div = div
        this.getPanes().overlayMouseTarget.appendChild(div)
      }
      draw() { const proj = this.getProjection(); if (!proj || !this._div) return; const p = proj.fromLatLngToDivPixel(new g.LatLng(d.lat, d.lng)); this._div.style.left = p.x + 'px'; this._div.style.top = p.y + 'px' }
      onRemove() { this._cleanup?.(); this._div?.remove(); this._div = null }
    }
    const o = new ImgOverlay(); o.setMap(gmap); o._data = d
    overlaysRef.current.push(o)
  }

  const applyStyle = (name) => { setStyle(name); setStyleOpen(false); mapRef.current?.setOptions({ styles: GMAP_STYLES[name] || [] }) }

  // Nearby Places — Google Places text search within the current view.
  const searchNearby = (term) => {
    const query = (term || q).trim()
    const g = window.google?.maps; const gmap = mapRef.current
    if (!g || !gmap || !query) return
    if (!g.places) { notify?.('Places library not loaded'); return }
    const svc = new g.places.PlacesService(gmap)
    svc.textSearch({ query, bounds: gmap.getBounds() }, (res, status) => {
      if (status === g.places.PlacesServiceStatus.OK && res?.[0]) {
        const p = res[0]; const loc = p.geometry.location
        new g.Marker({ position: loc, map: gmap, title: p.name })
        const off = 0.12 / Math.pow(2, gmap.getZoom() - 12)
        addLabel(g, gmap, { text: p.name, lat: loc.lat() + off, lng: loc.lng() })
        gmap.panTo(loc); notify?.(`Added ${p.name}`); setQ('')
      } else notify?.('No place found', 'error')
    })
  }

  // Brand Logo — Clearbit logo for a company/domain, added as a draggable image.
  const addLogo = () => {
    const g = window.google?.maps; const gmap = mapRef.current
    if (!g || !gmap || !q.trim()) return
    const clean = q.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\s+/g, '')
    const dom = clean.includes('.') ? clean : `${clean}.com`
    addImage(g, gmap, { url: `https://logo.clearbit.com/${dom}`, w: 70 })
    notify?.(`Added logo for ${dom}`); setPanel(null); setQ('')
  }

  const onUpload = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    const [img] = await readFiles([f])
    const g = window.google?.maps; const gmap = mapRef.current
    if (g && gmap) addImage(g, gmap, { url: img.url, w: 120 })
    e.target.value = ''
    notify?.('Image added — drag to position, double-click to remove')
  }

  const toggleDraw = () => {
    const g = window.google?.maps; const gmap = mapRef.current
    if (!g || !gmap) return
    if (!g.drawing) { notify?.('Drawing library not loaded'); return }
    if (drawing) { drawMgrRef.current?.setMap(null); drawMgrRef.current = null; setDrawing(false); notify?.('Draw mode off'); return }
    const shape = { fillColor: '#F97316', fillOpacity: 0.18, strokeColor: '#F97316', strokeWeight: 2, editable: true, draggable: true }
    const dm = new g.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: { position: g.ControlPosition.TOP_CENTER, drawingModes: ['marker', 'polyline', 'polygon', 'rectangle', 'circle'] },
      polygonOptions: shape, rectangleOptions: shape, circleOptions: shape, polylineOptions: { strokeColor: '#F97316', strokeWeight: 3, editable: true, draggable: true },
    })
    dm.setMap(gmap); drawMgrRef.current = dm; setDrawing(true); notify?.('Draw mode on — pick a shape and draw on the map')
  }

  const handleTool = (key) => {
    const g = window.google?.maps; const gmap = mapRef.current
    if (!g || !gmap) return
    setPanel(null)
    if (key === 'center') { if (markerRef.current) gmap.panTo(markerRef.current.getPosition()) }
    else if (key === 'style') { setStyleOpen((v) => !v) }
    else if (key === 'label') { addLabel(g, gmap, { text: 'New Label' }); notify?.('Label added — double-click to edit') }
    else if (key === 'property') { if (markerRef.current) { gmap.panTo(markerRef.current.getPosition()); notify?.('Drag the pin to reposition the property') } }
    else if (key === 'nearby') { setPanel((p) => (p === 'nearby' ? null : 'nearby')); setQ('') }
    else if (key === 'logo') { setPanel((p) => (p === 'logo' ? null : 'logo')); setQ('') }
    else if (key === 'upload') { fileRef.current?.click() }
    else if (key === 'draw') { toggleDraw() }
  }

  const save = () => {
    const gmap = mapRef.current, mk = markerRef.current
    if (!gmap || !mk) { onClose?.(); return }
    const c = mk.getPosition()
    const overlays = overlaysRef.current.map((o) => ({ id: o._data.id, type: o._data.type || 'label', text: o._data.text, url: o._data.url, lat: o._data.lat, lng: o._data.lng, w: o._data.w }))
    onSave({ ...map, lat: c.lat(), lng: c.lng(), zoom: gmap.getZoom(), style, title, overlays })
  }

  if (!open || !map) return null
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
      <div className="flex flex-1 overflow-hidden">
        {/* Left tool panel */}
        <div className="w-56 shrink-0 space-y-1 overflow-y-auto border-r border-neutral-800 bg-neutral-900 p-3">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
          {GMAP_TOOLS.map((t) => {
            const active = (t.key === 'style' && styleOpen) || (t.key === panel) || (t.key === 'draw' && drawing)
            return (
              <div key={t.key}>
                <button onClick={() => handleTool(t.key)} className={`flex w-full items-center gap-2.5 rounded-md p-2 text-left transition ${active ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'}`}>
                  <t.icon className="h-4 w-4 shrink-0" />
                  <span><span className="block text-sm font-medium leading-tight">{t.label}</span>{t.desc && <span className="block text-xs leading-snug text-neutral-400">{t.desc}</span>}</span>
                </button>
                {t.key === 'style' && styleOpen && (
                  <div className="mt-1 space-y-1 rounded-md bg-neutral-800 p-2">
                    {Object.keys(GMAP_STYLES).map((s) => (
                      <button key={s} onClick={() => applyStyle(s)} className={`block w-full rounded px-2 py-1.5 text-left text-sm ${style === s ? 'bg-brand text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}>{s}</button>
                    ))}
                  </div>
                )}
                {t.key === 'logo' && panel === 'logo' && (
                  <div className="mt-1 rounded-md bg-neutral-800 p-2">
                    <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addLogo() }} placeholder="e.g. apple.com" className="w-full rounded bg-neutral-900 px-2 py-1.5 text-sm text-white outline-none ring-1 ring-neutral-700 placeholder:text-neutral-500" />
                    <button onClick={addLogo} className="mt-2 w-full rounded bg-brand px-2 py-1.5 text-sm font-semibold text-white transition hover:bg-orange-600">Add logo</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Nearby Places panel */}
        {panel === 'nearby' && (
          <div className="flex w-96 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-extrabold text-slate-900">Nearby Places</h3>
              <button onClick={() => setPanel(null)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-500">Search for nearby businesses, restaurants, retail stores, schools, or any point of interest to add to your map.</p>
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') searchNearby() }} placeholder="Search by business name or type…" className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
              <p className="mb-2 mt-4 text-xs font-semibold text-slate-400">Quick categories</p>
              <div className="flex flex-wrap gap-2">
                {NEARBY_CATEGORIES.map((c) => (
                  <button key={c.label} onClick={() => searchNearby(c.term)} className={`inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium ring-1 transition hover:bg-slate-50 ${c.cls}`}>
                    <c.icon className="h-4 w-4" /> {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Map canvas */}
        <div className="relative flex-1 bg-neutral-800 p-3">
          <div className="relative h-full w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
            {/* Top toolbar */}
            <div className="pointer-events-none absolute left-1/2 top-3 z-[5] flex -translate-x-1/2 flex-col items-center gap-1">
              <span className="rounded-full bg-slate-800/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-300">Map Editor</span>
            </div>
            <div ref={elRef} className="h-full w-full" />
            {!ready && !err && <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-sm text-slate-500">Loading map…</div>}
            {err === 'no-key' && <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 p-6 text-center text-sm text-slate-600">Google Maps key missing. Add <code className="mx-1 rounded bg-slate-200 px-1">VITE_GOOGLE_MAPS_API_KEY</code> to .env.local and rebuild.</div>}
            {err === 'load-failed' && <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 p-6 text-center text-sm text-slate-600">Map failed to load — check the key's enabled APIs, billing, and that this domain is an allowed referrer.</div>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-3">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100"><ArrowLeft className="h-4 w-4" /> Back</button>
        <button onClick={save} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"><Save className="h-4 w-4" /> Save Map</button>
      </div>
    </div>
  )
}

function MapEditorModal({ open, map, onSave, onClose }) {
  const elRef = useRef(null)
  const stateRef = useRef(null)
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!open || !elRef.current || !map) return
    setTitle(map.title || '')
    const has = typeof map.lat === 'number' && !Number.isNaN(map.lat)
    const start = has ? [map.lat, map.lng] : [22.5937, 78.9629]
    const startZoom = map.zoom || (has ? 14 : 5)
    stateRef.current = { lat: start[0], lng: start[1], zoom: startZoom }
    const lm = L.map(elRef.current, { scrollWheelZoom: true }).setView(start, startZoom)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 20, attribution: '&copy; OpenStreetMap contributors &copy; CARTO' }).addTo(lm)
    const pinIcon = L.divIcon({ className: '', html: `<svg width="34" height="34" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="1.5"><path d="M12 2C8 2 5 5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/></svg>`, iconSize: [34, 34], iconAnchor: [17, 34] })
    const marker = L.marker(start, { draggable: true, icon: pinIcon }).addTo(lm)
    marker.on('dragend', () => { const p = marker.getLatLng(); stateRef.current.lat = p.lat; stateRef.current.lng = p.lng })
    lm.on('click', (e) => { marker.setLatLng(e.latlng); stateRef.current.lat = e.latlng.lat; stateRef.current.lng = e.latlng.lng })
    lm.on('zoomend', () => { stateRef.current.zoom = lm.getZoom() })
    const t = setTimeout(() => lm.invalidateSize(), 120)
    return () => { clearTimeout(t); lm.remove() }
  }, [open, map])

  if (!open || !map) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-extrabold text-slate-900">Edit Map</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">
          <label className="mb-1 block text-sm font-semibold text-slate-700">Map Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Regional Overview" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
          <p className="mb-2 mt-4 text-xs text-slate-400">Drag the map to pan, scroll to zoom, and click to move the pin. Set it exactly how you want it to appear.</p>
          <div ref={elRef} className="h-80 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100" />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900">Cancel</button>
          <button onClick={() => onSave({ ...map, ...stateRef.current, title })} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">Save Map</button>
        </div>
      </div>
    </div>
  )
}

// Confirm-location modal: draggable Leaflet pin, opens after Property Details.
function LocationPickerModal({ open, initial, address, sub, query, onConfirm, onClose }) {
  const elRef = useRef(null)
  const posRef = useRef(null)

  useEffect(() => {
    if (!open || !elRef.current) return
    const hasInit = initial && typeof initial[0] === 'number'
    const start = hasInit ? initial : [39.8283, -98.5795] // fallback: geographic center of the United States
    posRef.current = start
    const map = L.map(elRef.current, { scrollWheelZoom: true }).setView(start, hasInit ? 15 : 4)
    // CARTO Voyager — clean tiles with English/Latin place labels, reliable CDN.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map)
    const pinIcon = L.divIcon({
      className: '',
      html: `<svg width="34" height="34" viewBox="0 0 24 24" fill="#F97316" stroke="white" stroke-width="1.5"><path d="M12 2C8 2 5 5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/></svg>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    })
    const marker = L.marker(start, { draggable: true, icon: pinIcon }).addTo(map)
    marker.on('dragend', () => {
      const p = marker.getLatLng()
      posRef.current = [p.lat, p.lng]
    })
    map.on('click', (e) => {
      marker.setLatLng(e.latlng)
      posRef.current = [e.latlng.lat, e.latlng.lng]
    })
    // No exact coordinates yet? Geocode the typed text (e.g. a country or city
    // entered as the display address) and recenter the map on it.
    if (!hasInit && query && query.trim()) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data) => {
          const hit = Array.isArray(data) && data[0]
          if (!hit) return
          const p = [parseFloat(hit.lat), parseFloat(hit.lon)]
          posRef.current = p
          marker.setLatLng(p)
          const bb = (hit.boundingbox || []).map(parseFloat)
          // Some results (e.g. "France" with overseas territories) have a
          // near-global bounding box — fitBounds would zoom the whole world out.
          // Only fitBounds for sanely-sized areas; otherwise center with a
          // sensible zoom based on the result type.
          const latSpan = bb.length === 4 ? Math.abs(bb[1] - bb[0]) : 999
          const lonSpan = bb.length === 4 ? Math.abs(bb[3] - bb[2]) : 999
          if (bb.length === 4 && latSpan < 40 && lonSpan < 40) {
            map.fitBounds([[bb[0], bb[2]], [bb[1], bb[3]]], { maxZoom: 15 })
          } else {
            const isCountry = hit.type === 'country' || hit.addresstype === 'country' || latSpan >= 8
            map.setView(p, isCountry ? 5 : 10)
          }
        })
        .catch(() => {})
    }
    const t = setTimeout(() => map.invalidateSize(), 120)
    return () => {
      clearTimeout(t)
      map.remove()
    }
  }, [open, initial, query])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <MapPin className="h-5 w-5 text-brand" /> Pin the property location
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              We couldn&apos;t pinpoint this parcel automatically{sub ? ` in ${sub}` : ''}. Drag the pin to where the property actually is, or click anywhere on the map.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div ref={elRef} className="h-80 w-full bg-slate-100" />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
          <p className="text-xs text-slate-500">Drag the pin or click on the map to set the location.</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
            <button onClick={() => onConfirm(posRef.current)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">
              <Check className="h-4 w-4" /> Save Location
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const BUILDER_SESSION_KEY = 'crebuilder_builder_session'
function DocumentBuilder({ config, initial, draftId, onExit, onChangeType, onSave, notify, onNavigate, onSignOut, user }) {
  // Clicking a nav icon in the builder rail exits the builder and jumps to that section.
  const navFromBuilder = (key) => { if (onExit) onExit(); if (onNavigate) onNavigate(key) }
  const [step, setStep] = useState(initial?.reviewMode ? BUILDER_SECTIONS.length - 1 : initial?.step || 0)
  // Mark every step before the resume point as completed (all, when editing a
  // finished document straight into Review & Customize).
  const [done, setDone] = useState(() => {
    const d = {}
    const upto = initial?.reviewMode ? BUILDER_SECTIONS.length : initial?.step || 0
    for (let i = 0; i < upto; i++) d[i] = true
    return d
  })
  const [mapOpen, setMapOpen] = useState(false)
  const [addrPopupOpen, setAddrPopupOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(true)
  const [viewerIdx, setViewerIdx] = useState(null)
  // Rich-text draft editor (content sections, step >= 2)
  const draftRef = useRef(null)
  const moRef = useRef(null)
  const [charCount, setCharCount] = useState(0)
  const [copyCat, setCopyCat] = useState(0)
  const [catOpen, setCatOpen] = useState(false)
  const [libOpen, setLibOpen] = useState(false)
  const [form, setForm] = useState(
    initial?.form || {
      name: '', price: '', priceVis: 'Show', country: 'US', searchMode: 'address',
      street: '', city: '', state: '', zip: '', county: '', apn: '', customDisplay: false, displayAddress: '',
      lat: null, lng: null, dataPoints: [], metrics: [], sections: {},
    },
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target?.value ?? e }))

  // Street-address autocomplete (OpenStreetMap Nominatim — free, no key)
  const [sug, setSug] = useState([])
  const [showSug, setShowSug] = useState(false)
  const sugTimer = useRef(null)
  const onStreet = (e) => {
    const v = e.target.value
    setForm((f) => ({ ...f, street: v }))
    clearTimeout(sugTimer.current)
    if (v.trim().length < 3) {
      setSug([])
      setShowSug(false)
      return
    }
    sugTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(v)}`,
        )
        const data = await r.json()
        setSug(Array.isArray(data) ? data : [])
        setShowSug(true)
      } catch {
        setSug([])
      }
    }, 350)
  }
  const pickSug = (s) => {
    const a = s.address || {}
    const road = [a.house_number, a.road].filter(Boolean).join(' ')
    setForm((f) => ({
      ...f,
      street: road || (s.display_name || '').split(',')[0],
      city: a.city || a.town || a.village || a.suburb || f.city,
      zip: a.postcode || f.zip,
      state: US_STATE_ABBR[a.state] || f.state,
      countryName: a.country || f.countryName,
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lon),
    }))
    setShowSug(false)
    setSug([])
  }
  const total = BUILDER_SECTIONS.length
  const last = step === total - 1

  const goNext = () => {
    // Edit mode: Continue hops through the curated edit sections only, then
    // lands on Review & Customize — never the hidden (financial/comparable) steps.
    if (initial?.reviewMode) {
      setDone((d) => ({ ...d, [step]: true }))
      const order = EDIT_SECTIONS.map((s) => s.i)
      const pos = order.indexOf(step)
      if (pos >= 0 && pos < order.length - 1) setStep(order[pos + 1])
      else setReviewMode(true)
      return
    }
    // After Property Details, confirm the map location before moving on.
    if (step === 0) {
      // Require the "Use Custom Display Address" checkbox before leaving step 1.
      if (!form.customDisplay) {
        notify?.('Please tick "Use Custom Display Address" to continue', 'error')
        return
      }
      // Show the "New Property" confirmation popup first; the map opens only
      // after the user clicks "Continue with this address".
      setAddrPopupOpen(true)
      return
    }
    setDone((d) => ({ ...d, [step]: true }))
    // Cap Rate & NOI / Skip scopes skip the Rent Roll step from Financials (6).
    if (step === 6 && form.finType === 'Cap Rate & NOI') { setStep(8); return }
    if (step === 6 && form.finType === 'Skip Financials') { setStep(9); return }
    if (last) setReviewMode(true)
    else setStep(step + 1)
  }

  const confirmLocation = (coords) => {
    if (coords) setForm((f) => ({ ...f, lat: coords[0], lng: coords[1] }))
    setMapOpen(false)
    setDone((d) => ({ ...d, 0: true }))
    setStep(1)
    notify('Location confirmed')
  }

  // Property Data helpers
  const suggestions = DATA_SUGGESTIONS[config.propertyType] || []
  const addPoint = (label) =>
    setForm((f) => ({ ...f, dataPoints: [...f.dataPoints, { id: uid(), label, value: '' }] }))
  const updatePoint = (id, key, val) =>
    setForm((f) => ({ ...f, dataPoints: f.dataPoints.map((p) => (p.id === id ? { ...p, [key]: val } : p)) }))
  const removePoint = (id) =>
    setForm((f) => ({ ...f, dataPoints: f.dataPoints.filter((p) => p.id !== id) }))
  const autoPopulate = () => {
    const have = new Set(form.dataPoints.map((p) => p.label))
    const add = suggestions.filter((s) => !have.has(s)).map((label) => ({ id: uid(), label, value: '' }))
    if (!add.length) {
      notify('All suggested fields already added')
      return
    }
    setForm((f) => ({ ...f, dataPoints: [...f.dataPoints, ...add] }))
    notify('No public records found — added suggested fields to fill in')
  }

  // Key Metrics helpers (Investment Highlights sidebar)
  const metrics = form.metrics || []
  const addMetric = (label = '', value = '', icon = 'DollarSign', editing = false) =>
    setForm((f) => ({ ...f, metrics: [...(f.metrics || []), { id: uid(), label, value, icon, hidden: false, editing }] }))
  const updMetric = (id, key, val) =>
    setForm((f) => ({ ...f, metrics: f.metrics.map((m) => (m.id === id ? { ...m, [key]: val } : m)) }))
  const delMetric = (id) =>
    setForm((f) => ({ ...f, metrics: f.metrics.filter((m) => m.id !== id) }))
  const moveMetric = (id, dir) =>
    setForm((f) => {
      const arr = [...f.metrics]
      const i = arr.findIndex((m) => m.id === id)
      const j = i + dir
      if (j < 0 || j >= arr.length) return f
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return { ...f, metrics: arr }
    })
  // "Add from Library" picker state
  const [libCat, setLibCat] = useState('FINANCIAL')
  const [libSearch, setLibSearch] = useState('')
  const tabStripRef = useRef(null)
  const scrollTabs = (dir) => tabStripRef.current?.scrollBy({ left: dir * 120, behavior: 'smooth' })
  const addedNames = new Set(metrics.map((m) => m.label))
  const libResults = (libSearch.trim() ? METRIC_CATS.flatMap((c) => METRIC_CATALOG[c]) : METRIC_CATALOG[libCat] || [])
    .filter((m) => !addedNames.has(m.name) && `${m.name} ${m.desc}`.toLowerCase().includes(libSearch.toLowerCase()))

  // Calculated-metric visibility + ordering (persisted in the draft).
  const toggleCalcHidden = (label) =>
    setForm((f) => ({ ...f, calcHidden: { ...(f.calcHidden || {}), [label]: !(f.calcHidden?.[label]) } }))

  // "Create Custom Metric" form
  const [metricForm, setMetricForm] = useState({ open: false, icon: 'DollarSign', name: '', value: '' })
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [editIconFor, setEditIconFor] = useState(null) // id of the metric whose icon picker is open
  const openMetricForm = () => {
    setLibOpen(false)
    setIconPickerOpen(false)
    setMetricForm({ open: true, icon: 'DollarSign', name: '', value: '' })
  }
  const submitMetricForm = () => {
    if (!metricForm.name.trim()) return
    addMetric(metricForm.name.trim(), metricForm.value.trim(), metricForm.icon)
    setMetricForm({ open: false, icon: 'DollarSign', name: '', value: '' })
    setIconPickerOpen(false)
  }

  // Accessibility helpers (Location Highlights sidebar)
  const [accessLoading, setAccessLoading] = useState(false)
  const accessItems = form.accessItems || { transit: [], airports: [], highways: [] }
  const [addForm, setAddForm] = useState({ cat: null, name: '', dist: '' })
  const openAdd = (cat) => setAddForm({ cat, name: '', dist: '' })
  const submitAdd = () => {
    if (!addForm.name.trim()) return
    const cat = addForm.cat
    setForm((f) => {
      const base = f.accessItems || { transit: [], airports: [], highways: [] }
      return { ...f, accessItems: { ...base, [cat]: [...(base[cat] || []), { id: uid(), name: addForm.name.trim(), dist: parseFloat(addForm.dist) || null, manual: true }] } }
    })
    setAddForm({ cat: null, name: '', dist: '' })
  }
  const delAccessItem = (cat, id) =>
    setForm((f) => ({ ...f, accessItems: { ...f.accessItems, [cat]: (f.accessItems[cat] || []).filter((x) => x.id !== id) } }))
  const haversineMi = (a1, o1, a2, o2) => {
    const R = 6371
    const toRad = (d) => (d * Math.PI) / 180
    const dLat = toRad(a2 - a1)
    const dLon = toRad(o2 - o1)
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a1)) * Math.cos(toRad(a2)) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) * 0.621371
  }
  const refreshAccess = async () => {
    if (!form.lat) {
      notify('Add the property address first', 'error')
      return
    }
    setAccessLoading(true)
    try {
      const { lat, lng } = form
      const q = `[out:json][timeout:25];(node["aeroway"="aerodrome"](around:70000,${lat},${lng});way["aeroway"="aerodrome"](around:70000,${lat},${lng});node["railway"="station"](around:9000,${lat},${lng});node["public_transport"="station"](around:9000,${lat},${lng});way["highway"~"^(motorway|trunk|primary)$"](around:9000,${lat},${lng}););out center 80;`
      // Try the main Overpass server plus mirrors (handles rate-limits/outages).
      const endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass.openstreetmap.fr/api/interpreter',
      ]
      let data = null
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { method: 'POST', body: q })
          if (!res.ok) continue
          const json = await res.json()
          if (json && Array.isArray(json.elements) && json.elements.length) { data = json; break }
        } catch { /* try next mirror */ }
      }
      if (!data) throw new Error('no data')
      const airports = []
      const transit = []
      const highways = []
      const seen = { a: new Set(), t: new Set(), h: new Set() }
      for (const el of data.elements || []) {
        const elat = el.lat ?? el.center?.lat
        const elng = el.lon ?? el.center?.lon
        if (elat == null) continue
        const tags = el.tags || {}
        const dist = haversineMi(lat, lng, elat, elng)
        if (tags.aeroway === 'aerodrome') {
          const n = tags.name
          if (n && !seen.a.has(n)) { seen.a.add(n); airports.push({ id: uid(), name: n, dist }) }
        } else if (tags.railway === 'station' || tags.public_transport === 'station') {
          const n = tags.name
          if (n && !seen.t.has(n)) { seen.t.add(n); transit.push({ id: uid(), name: n, dist }) }
        } else if (tags.highway) {
          const n = tags.ref || tags.name
          if (n && !seen.h.has(n)) { seen.h.add(n); highways.push({ id: uid(), name: n, dist }) }
        }
      }
      ;[airports, transit, highways].forEach((arr) => arr.sort((a, b) => a.dist - b.dist))
      setForm((f) => {
        const manual = (cat) => ((f.accessItems?.[cat]) || []).filter((x) => x.manual)
        return {
          ...f,
          accessItems: {
            transit: [...transit.slice(0, 8), ...manual('transit')],
            airports: [...airports.slice(0, 8), ...manual('airports')],
            highways: [...highways.slice(0, 8), ...manual('highways')],
          },
        }
      })
      notify('Accessibility refreshed')
    } catch {
      notify('Lookup is busy right now — tap Refresh again in a moment', 'error')
    }
    setAccessLoading(false)
  }
  const ACCESS_SECTIONS = [
    { cat: 'transit', label: 'Transit', icon: Train, add: 'Add transit stop', tone: 'emerald' },
    { cat: 'airports', label: 'Airports', icon: Plane, add: 'Add airport', tone: 'blue' },
    { cat: 'highways', label: 'Highways', icon: Route, add: 'Add highway', tone: 'amber' },
  ]
  const updLc = (key, val) => setForm((f) => ({ ...f, locCard: { ...(f.locCard || {}), [key]: val } }))

  // Images & Media helpers
  const media = form.media || { cover: null, singles: [], galleries: [], video: '' }
  const setMedia = (fn) => setForm((f) => ({ ...f, media: fn(f.media || { cover: null, singles: [], galleries: [], video: '' }) }))
  // Upload each file to Firebase Storage (small URL persists cleanly). If Storage
  // is unavailable, fall back to an inline base64 data URL so uploads still work.
  const readFiles = (files) =>
    Promise.all(
      [...files].map(async (file) => {
        try {
          const url = await uploadToStorage(file)
          return { id: uid(), name: file.name, url }
        } catch {
          const url = await new Promise((resolve) => {
            const r = new FileReader()
            r.onload = () => resolve(r.result)
            r.readAsDataURL(file)
          })
          return { id: uid(), name: file.name, url }
        }
      }),
    )
  const uploadCover = async (files) => {
    if (!files?.length) return
    const [img] = await readFiles([files[0]])
    setMedia((m) => ({ ...m, cover: img }))
    notify('Cover image added')
  }
  const uploadSingles = async (files) => {
    if (!files?.length) return
    const imgs = await readFiles(files)
    setMedia((m) => ({ ...m, singles: [...m.singles, ...imgs] }))
    notify(`${imgs.length} image${imgs.length > 1 ? 's' : ''} added`)
  }
  const removeCover = () => setMedia((m) => ({ ...m, cover: null }))
  const removeSingle = (id) => setMedia((m) => ({ ...m, singles: m.singles.filter((s) => s.id !== id) }))
  const removeGallery = (id) => setMedia((m) => ({ ...m, galleries: m.galleries.filter((g) => g.id !== id) }))

  // Gallery + video modals
  const [galleryModal, setGalleryModal] = useState({ open: false, title: '', layout: 'Grid', images: [] })
  const addGalleryImages = async (files) => {
    if (!files?.length) return
    const imgs = await readFiles(files)
    setGalleryModal((g) => ({ ...g, images: [...g.images, ...imgs].slice(0, 8) }))
  }
  const createGallery = () => {
    if (galleryModal.images.length < 2) return
    setMedia((m) => ({ ...m, galleries: [...m.galleries, { id: uid(), title: galleryModal.title.trim(), layout: galleryModal.layout, images: galleryModal.images }] }))
    setGalleryModal({ open: false, title: '', layout: 'Grid', images: [] })
    notify('Gallery page created')
  }
  const [videoModal, setVideoModal] = useState(false)
  const [videoDraft, setVideoDraft] = useState('')

  // New Tenant / Vacancy modal (Rent Roll)
  const [tenantModal, setTenantModal] = useState(null)
  const openTenantModal = (mode) =>
    setTenantModal({ mode, unit: '', tenant: '', unitType: '', sf: '', rent: '', rentPer: 'Per SF / Year', incMode: 'Annual increase', incPerYear: '', reimbAmount: '', reimbPer: 'Per SF / Year', reimbInc: '', inPlace: '', proForma: '', reimbInPlace: '', reimbProForma: '', leaseType: '', leaseStart: '', leaseEnd: '', notes: '' })
  const setTM = (k, v) => setTenantModal((t) => ({ ...t, [k]: v }))
  const computeRent = (rent, per, sf) => {
    const r = parseFloat(rent) || 0
    const s = parseFloat(sf) || 0
    let annual = 0
    if (per === 'Per SF / Year') annual = r * s
    else if (per === 'Per SF / Month') annual = r * s * 12
    else if (per === 'Monthly') annual = r * 12
    else annual = r // Annual
    const monthly = annual / 12
    const perSf = s ? annual / s : per.startsWith('Per SF') ? r : 0
    return { annual, monthly, perSf }
  }
  const money = (n) => `$${(Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const openEditTenant = (row) =>
    setTenantModal({
      mode: row.kind, editId: row.id,
      unit: row.unit || '', tenant: row.kind === 'vacancy' ? '' : row.tenant || '', unitType: '', sf: row.sf || '',
      rent: '', rentPer: 'Per SF / Year', incMode: 'Annual increase', incPerYear: (row.incr || '').replace('%', ''),
      reimbAmount: '', reimbPer: 'Per SF / Year', reimbInc: '', inPlace: '', proForma: '', reimbInPlace: '', reimbProForma: '',
      leaseType: '', leaseStart: row.start || '', leaseEnd: row.end || '', notes: row.notes || '',
      ...(row._src || {}),
    })
  const submitTenant = () => {
    const t = tenantModal
    let row
    if (t.mode === 'vacancy') {
      const ip = computeRent(t.inPlace, t.rentPer, t.sf)
      const reimb = computeRent(t.reimbInPlace, t.reimbPer, t.sf)
      row = {
        kind: 'vacancy', unit: t.unit, tenant: 'VACANT', sf: t.sf,
        rentSf: ip.perSf ? money(ip.perSf) : '', monthly: ip.monthly ? money(ip.monthly) : '', annual: ip.annual ? money(ip.annual) : '',
        incr: '', reimbSf: t.reimbInPlace ? money(reimb.perSf) : '', annReimb: reimb.annual ? money(reimb.annual) : '',
        start: '', end: '', notes: [t.unitType && `Type: ${t.unitType}`, t.proForma && `Pro Forma: ${t.proForma}`, t.notes].filter(Boolean).join(' · '),
        nSf: parseFloat(t.sf) || 0, nMonthly: ip.monthly, nAnnual: ip.annual, nReimb: reimb.annual,
      }
    } else {
      const rent = computeRent(t.rent, t.rentPer, t.sf)
      const reimb = computeRent(t.reimbAmount, t.reimbPer, t.sf)
      row = {
        kind: 'tenant', unit: t.unit, tenant: t.tenant, sf: t.sf,
        rentSf: rent.perSf ? money(rent.perSf) : '', monthly: rent.monthly ? money(rent.monthly) : '', annual: rent.annual ? money(rent.annual) : '',
        incr: t.incPerYear ? `${t.incPerYear}%` : '', reimbSf: t.reimbAmount ? money(reimb.perSf) : '', annReimb: reimb.annual ? money(reimb.annual) : '',
        start: t.leaseStart, end: t.leaseEnd, notes: t.notes,
        nSf: parseFloat(t.sf) || 0, nMonthly: rent.monthly, nAnnual: rent.annual, nReimb: reimb.annual,
      }
    }
    row._src = t // keep raw inputs so Edit re-populates the form
    if (t.editId) {
      setForm((f) => ({ ...f, rentRoll: f.rentRoll.map((r) => (r.id === t.editId ? { ...row, id: t.editId } : r)) }))
      notify('Changes saved')
    } else {
      row.id = uid()
      setForm((f) => ({ ...f, rentRoll: [...(f.rentRoll || []), row] }))
      notify(t.mode === 'vacancy' ? 'Vacancy added' : 'Tenant added')
    }
    setTenantModal(null)
  }
  const [deleteRow, setDeleteRow] = useState(null)

  const locLabel = [form.countryName || (form.country === 'CA' ? 'Canada' : 'United States'), form.city, form.state].filter(Boolean).join(', ')
  const fullAddress = [form.street, form.city, form.state, form.zip].filter(Boolean).join(', ')
  const brand = config.brandColor || '#0f172a'
  const docName = form.name.trim() || 'Untitled Document'
  const previewData = {
    name: docName,
    docType: config.docType,
    price: form.price,
    priceVis: form.priceVis,
    location: locLabel,
    address: fullAddress,
    owner: CURRENT_USER.name,
    ownerEmail: CURRENT_USER.email,
    dataPoints: form.dataPoints,
    brand,
    sections: form.sections,
    lat: form.lat,
    lng: form.lng,
    cover: form.media?.cover?.url || null,
    moAbout: form.moAbout,
    moFacts: form.moFacts,
    agent: (form.coAgents && form.coAgents[0]) || { name: CURRENT_USER.name, role: 'Agent', email: CURRENT_USER.email, initials: CURRENT_USER.initials },
  }

  // Token values available to auto-fill suggested copy.
  const copyFill = {
    'Property Name': docName,
    City: form.city,
    State: form.state,
    Street: form.street,
    'Property Type': config.propertyType,
    Price: form.priceVis === 'Show' && form.price ? currency(form.price) : '',
    Address: fullAddress,
  }
  const groups = copyGroups(BUILDER_SECTIONS[step], config.docType)
  const curGroup = groups[Math.min(copyCat, groups.length - 1)] || groups[0]
  const isInvest = BUILDER_SECTIONS[step] === 'Investment Highlights'
  const isLocation = BUILDER_SECTIONS[step] === 'Location Highlights'
  const isMedia = BUILDER_SECTIONS[step] === 'Images & Media'
  const isFinancials = BUILDER_SECTIONS[step] === 'Financials'
  const isRentRoll = BUILDER_SECTIONS[step] === 'Rent Roll'
  // Cap Rate & NOI lives on step 9 (index 8); Skip Financials on step 10 (index 9).
  const isCapRate = step === 8 && form.finType === 'Cap Rate & NOI'
  const isSkipFin = step === 9 && form.finType === 'Skip Financials'
  const isMaps = BUILDER_SECTIONS[step] === 'Maps'
  const isTenantProfiles = BUILDER_SECTIONS[step] === 'Tenant Profiles'
  const tenantProfiles = form.tenantProfiles || []
  const EMPTY_PROFILE = { tradeName: '', industry: '', description: '', logo: null, yearFounded: '', hq: '', locations: '', website: '', credit: 'Not specified', sf: '', leaseExp: '' }
  const [profileModal, setProfileModal] = useState(null)
  const openProfileModal = (p) => setProfileModal(p ? { ...EMPTY_PROFILE, ...p } : { ...EMPTY_PROFILE })
  const setPM = (k, v) => setProfileModal((x) => ({ ...x, [k]: v }))
  const submitProfile = () => {
    const p = profileModal
    if (p.id) setForm((f) => ({ ...f, tenantProfiles: f.tenantProfiles.map((x) => (x.id === p.id ? p : x)) }))
    else setForm((f) => ({ ...f, tenantProfiles: [...(f.tenantProfiles || []), { ...p, id: uid() }] }))
    setProfileModal(null)
    notify(p.id ? 'Tenant updated' : 'Tenant added')
  }
  const delProfile = (id) => setForm((f) => ({ ...f, tenantProfiles: f.tenantProfiles.filter((p) => p.id !== id) }))

  // Sales Comparables
  const isSalesComps = BUILDER_SECTIONS[step] === 'Sales Comparables'
  const salesComps = form.salesComps || []
  const EMPTY_COMP = { photo: null, propertyName: '', street: '', city: '', state: '', zip: '', yearBuilt: '', description: '', salePrice: '', saleDate: '', capRate: '', noi: '', buildingSf: '', tenants: '', bedrooms: '', occupancy: '', unitMix: '', hideSaleDate: false, active: true }
  const [compModal, setCompModal] = useState(null)
  const [compDel, setCompDel] = useState(null)
  const openCompModal = (c) => setCompModal(c ? { ...EMPTY_COMP, ...c } : { ...EMPTY_COMP })
  const setCM = (k, v) => setCompModal((x) => ({ ...x, [k]: v }))
  const submitComp = () => {
    const c = compModal
    if (c.id) setForm((f) => ({ ...f, salesComps: f.salesComps.map((x) => (x.id === c.id ? c : x)) }))
    else setForm((f) => ({ ...f, salesComps: [...(f.salesComps || []), { ...c, id: uid() }] }))
    setCompModal(null)
    notify(c.id ? 'Comparable updated' : 'Comparable added')
  }
  const delComp = (id) => setForm((f) => ({ ...f, salesComps: f.salesComps.filter((x) => x.id !== id) }))
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const soldLabel = (d) => { if (!d) return '—'; const [y, m] = String(d).split('-'); return `${MONTHS[Number(m) - 1] || ''} ${y}` }
  const compYears = [...new Set(salesComps.map((c) => (c.saleDate ? String(c.saleDate).slice(0, 4) : null)).filter(Boolean))].sort()
  // Rental Comparables
  const isRentalComps = BUILDER_SECTIONS[step] === 'Rental Comparables'
  const rentComps = form.rentComps || []
  const EMPTY_RENT = { photo: null, propertyName: '', street: '', city: '', state: '', zip: '', yearBuilt: '', description: '', marketRent: '', buildingSf: '', tenants: '', bedrooms: '', occupancy: '', unitMix: '', active: true }
  const [rentModal, setRentModal] = useState(null)
  const [rentDel, setRentDel] = useState(null)
  const openRentModal = (c) => setRentModal(c ? { ...EMPTY_RENT, ...c } : { ...EMPTY_RENT })
  const setRM = (k, v) => setRentModal((x) => ({ ...x, [k]: v }))
  const submitRent = () => {
    const c = rentModal
    if (c.id) setForm((f) => ({ ...f, rentComps: f.rentComps.map((x) => (x.id === c.id ? c : x)) }))
    else setForm((f) => ({ ...f, rentComps: [...(f.rentComps || []), { ...c, id: uid() }] }))
    setRentModal(null)
    notify(c.id ? 'Comparable updated' : 'Comparable added')
  }
  const delRent = (id) => setForm((f) => ({ ...f, rentComps: f.rentComps.filter((x) => x.id !== id) }))
  // Market Overview
  const isMarket = BUILDER_SECTIONS[step] === 'Market Overview'
  const moFacts = form.moFacts || []
  const moExec = (cmd, val) => { moRef.current?.focus(); document.execCommand(cmd, false, val); setForm((f) => ({ ...f, moAbout: moRef.current?.innerHTML || '' })) }
  const moLink = () => { const url = window.prompt('Link URL'); if (url) moExec('createLink', url) }
  const addFact = () => setForm((f) => ({ ...f, moFacts: [...(f.moFacts || []), { id: uid(), label: '', value: '' }] }))
  const updFact = (id, k, v) => setForm((f) => ({ ...f, moFacts: f.moFacts.map((x) => (x.id === id ? { ...x, [k]: v } : x)) }))
  const delFact = (id) => setForm((f) => ({ ...f, moFacts: f.moFacts.filter((x) => x.id !== id) }))
  // Contact Information
  const isContacts = BUILDER_SECTIONS[step] === 'Contact Information'
  const coAgents = form.coAgents || []
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const addCo = () => setForm((f) => ({ ...f, coAgents: [...(f.coAgents || []), { id: uid(), photo: null, name: '', title: '', phone: '', phoneType: 'Direct', email: '', license: '' }] }))
  const updCo = (id, k, v) => setForm((f) => ({ ...f, coAgents: f.coAgents.map((x) => (x.id === id ? { ...x, [k]: v } : x)) }))
  const delCo = (id) => setForm((f) => ({ ...f, coAgents: f.coAgents.filter((x) => x.id !== id) }))
  // Confidentiality Statement (read-only, admin-managed)
  const isConfidentiality = BUILDER_SECTIONS[step] === 'Confidentiality Statement'
  const maps = form.maps || []
  const [mapEditor, setMapEditor] = useState(null)
  const [reviewMode, setReviewMode] = useState(initial?.reviewMode || false)
  const [addPageOpen, setAddPageOpen] = useState(false)
  const [pageDraft, setPageDraft] = useState(null) // { layout, title, image, imageName, body }
  const pageRef = useRef(null)
  const [pageChars, setPageChars] = useState(0)
  const openAddPage = () => { setPageDraft(null); setAddPageOpen(true) }
  const startPage = (layout) => { setPageDraft({ layout, title: '', image: null, imageName: '', body: '' }); setPageChars(0) }
  const setPD = (k, v) => setPageDraft((x) => ({ ...x, [k]: v }))
  const pageExec = (cmd, val = null) => { pageRef.current?.focus(); document.execCommand(cmd, false, val); if (pageRef.current) { setPD('body', pageRef.current.innerHTML); setPageChars(pageRef.current.textContent.length) } }
  const onPageMedia = async (e) => { const f = e.target.files?.[0]; if (!f) return; const [m] = await readFiles([f]); setPageDraft((x) => ({ ...x, image: m.url, imageName: f.name })); e.target.value = '' }
  const savePage = () => {
    const d = pageDraft
    if (!d || !d.title.trim()) return
    const body = pageRef.current ? pageRef.current.innerHTML : d.body
    const page = { id: d.id || uid(), layout: d.layout, title: d.title.trim(), image: d.image || null, imageName: d.imageName || '', body }
    setForm((f) => ({ ...f, customPages: d.id ? (f.customPages || []).map((x) => (x.id === d.id ? page : x)) : [...(f.customPages || []), page] }))
    setAddPageOpen(false); setPageDraft(null)
    notify(d.id ? 'Page updated' : 'Custom page added')
  }
  const editCustomPage = (c) => { setPageDraft({ id: c.id, layout: c.layout, title: c.title, image: c.image, imageName: c.imageName, body: c.body }); setPageChars((c.body || '').replace(/<[^>]*>/g, '').length); setAddPageOpen(true) }
  const delCustomPage = (id) => setForm((f) => ({ ...f, customPages: (f.customPages || []).filter((x) => x.id !== id) }))
  const PAGE_LAYOUTS = {
    media: { t: 'Full Page Media', d: 'Edge-to-edge photo, floorplan, or PDF page', icon: Maximize2, c: 'bg-violet-50 text-violet-500', media: true, text: false, titleHint: 'Used in the Table of Contents (not shown on the page itself).' },
    titleMedia: { t: 'Title + Media', d: 'Branded header with image, PDF, or site plan', icon: ImageIcon, c: 'bg-blue-50 text-blue-500', media: true, text: false, titleHint: 'Shown at the top of the page and in the Table of Contents.' },
    titleText: { t: 'Title + Text', d: 'Branded header with rich text content', icon: FileText, c: 'bg-emerald-50 text-emerald-500', media: false, text: true, titleHint: 'Shown at the top of the page and in the Table of Contents.' },
    mediaText: { t: 'Media & Text', d: 'Photo or PDF alongside text, side by side', icon: Columns2, c: 'bg-amber-50 text-amber-500', media: true, text: true, titleHint: 'Shown at the top of the page and in the Table of Contents.' },
  }
  const [rc, setRc] = useState({
    primary: '#1e293b', secondary: '#3b82f6', preset: 'Brokerage Presets', scheme: 'Color Schemes',
    logo: true, logoSize: 90, companyInfo: true, contactInfo: true, price: true, capRate: true, noi: true, capNoiMode: 'Auto',
    hidden: {}, colorsOpen: true, coverOpen: true, page: 0,
  })
  const setRcv = (k, v) => setRc((x) => ({ ...x, [k]: v }))
  const addMap = () => {
    // Default new maps to a view of India (editable via the map editor) when the
    // property has no coordinates, so the map is never blank.
    const hasLoc = typeof form.lat === 'number' && !Number.isNaN(form.lat)
    const m = {
      id: uid(),
      title: 'Map',
      lat: hasLoc ? form.lat : 22.5937,
      lng: hasLoc ? form.lng : 78.9629,
      zoom: hasLoc ? 14 : 5,
    }
    setForm((f) => ({ ...f, maps: [...(f.maps || []), m] }))
    setMapEditor(m)
  }
  const updMap = (id, title) => setForm((f) => ({ ...f, maps: f.maps.map((m) => (m.id === id ? { ...m, title } : m)) }))
  const saveMap = (m) => { setForm((f) => ({ ...f, maps: f.maps.map((x) => (x.id === m.id ? m : x)) })); setMapEditor(null); notify('Map updated') }
  const delMap = (id) => setForm((f) => ({ ...f, maps: f.maps.filter((m) => m.id !== id) }))
  const [mapDel, setMapDel] = useState(null)
  const charLimit = isInvest || isLocation ? 2500 : 3000

  // Financials + Rent Roll state
  const finType = form.finType || 'Full Financials'
  const [scopeConfirm, setScopeConfirm] = useState(null) // pending finType change awaiting confirm
  const [rrConfirm, setRrConfirm] = useState(null) // pending rent-roll type change awaiting confirm
  const rrSel = form.rrSel || { family: 'Multi-Year Cash Flow', mode: 'Unit-by-Unit' }
  const rrLayout = RR_LAYOUTS[`${rrSel.family}|${rrSel.mode}`] || RR_LAYOUTS['Multi-Year Cash Flow|Unit-by-Unit']
  const rrCols = rrLayout.cols
  const rrKeys = rrLayout.keys
  const rrSelLabel = `${rrSel.mode}${rrSel.mode === 'Unit Mix' ? ' (Grouped)' : ''} · ${rrSel.family}`
  const rentRoll = form.rentRoll || []
  const addRentRow = (kind) =>
    setForm((f) => ({ ...f, rentRoll: [...(f.rentRoll || []), { id: uid(), kind, unit: '', tenant: kind === 'vacancy' ? 'VACANT' : '', sf: '', rentSf: '', monthly: '', annual: '', incr: '', reimbSf: '', annReimb: '', start: '', end: '', notes: '' }] }))
  const updRentRow = (id, key, val) => setForm((f) => ({ ...f, rentRoll: f.rentRoll.map((r) => (r.id === id ? { ...r, [key]: val } : r)) }))
  const delRentRow = (id) => setForm((f) => ({ ...f, rentRoll: f.rentRoll.filter((r) => r.id !== id) }))

  // Calculated Key Metrics — auto-fill from price & property data where possible.
  const dpVal = (...labels) => {
    for (const l of labels) {
      const hit = (form.dataPoints || []).find((p) => p.label.toLowerCase() === l.toLowerCase() && p.value)
      if (hit) return hit.value
    }
    return ''
  }
  const calcMetrics = [
    { label: 'Asking Price', icon: DollarSign, value: form.priceVis === 'Show' && form.price ? currency(form.price) : dpVal('Asking Price') },
    { label: 'Cap Rate', icon: Percent, value: dpVal('Cap Rate') },
    { label: 'Price/SF', icon: Scale, value: dpVal('Price/SF', 'Price per SF') },
    { label: 'NOI', icon: TrendingUp, value: dpVal('NOI') },
    { label: 'Occupancy', icon: Percent, value: dpVal('Occupancy', 'Occupancy %') },
    { label: 'Vacancy Factor', icon: Percent, value: dpVal('Vacancy Factor', 'Vacancy') },
    { label: 'Base Rent', icon: DollarSign, value: dpVal('Base Rent') },
    { label: 'EGI', icon: DollarSign, value: dpVal('EGI') },
    { label: 'Cash-on-Cash', icon: Percent, value: dpVal('Cash-on-Cash') },
    { label: 'IRR', icon: TrendingUp, value: dpVal('IRR') },
    { label: 'Building SF', icon: Building, value: dpVal('Building SF', 'GLA', 'Rentable SF') },
    { label: 'Year Built', icon: Calendar, value: dpVal('Year Built') },
  ]
  // Apply the user's saved ordering, keeping any new labels at the end.
  const calcDefaultOrder = calcMetrics.map((m) => m.label)
  const calcOrder =
    form.calcOrder && form.calcOrder.length
      ? [...form.calcOrder.filter((l) => calcDefaultOrder.includes(l)), ...calcDefaultOrder.filter((l) => !form.calcOrder.includes(l))]
      : calcDefaultOrder
  const orderedCalc = calcOrder.map((l) => calcMetrics.find((m) => m.label === l)).filter(Boolean)
  const moveCalc = (label, dir) =>
    setForm((f) => {
      const cur = f.calcOrder && f.calcOrder.length ? [...f.calcOrder] : calcDefaultOrder
      // ensure all labels present
      calcDefaultOrder.forEach((l) => { if (!cur.includes(l)) cur.push(l) })
      const i = cur.indexOf(label)
      const j = i + dir
      if (i < 0 || j < 0 || j >= cur.length) return f
      ;[cur[i], cur[j]] = [cur[j], cur[i]]
      return { ...f, calcOrder: cur }
    })

  // Load the saved HTML into the editor whenever the section changes.
  useEffect(() => {
    if (step >= 2 && draftRef.current) {
      draftRef.current.innerHTML = form.sections[step] || ''
      setCharCount(draftRef.current.textContent.length)
      setCopyCat(0)
      setCatOpen(false)
    }
    if (isMarket && moRef.current) moRef.current.innerHTML = form.moAbout || ''
    // On the Location Highlights step: seed the location card and auto-fetch nearby places.
    if (isLocation) {
      setForm((f) => (f.locCard ? f : { ...f, locCard: { address: f.street, city: f.city, state: f.state, zip: f.zip } }))
      if (!form.accessItems && form.lat) refreshAccess()
    }
    // Intentionally keyed on step only — must not reset while typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // Auto-save the whole in-progress builder session so a page refresh keeps the data.
  useEffect(() => {
    try {
      localStorage.setItem(BUILDER_SESSION_KEY, JSON.stringify({ form, step, config, draftId }))
    } catch { /* quota exceeded (e.g. many large images) — skip */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, step])

  const saveDraft = () => {
    if (!draftRef.current) return
    setForm((f) => ({ ...f, sections: { ...f.sections, [step]: draftRef.current.innerHTML } }))
    setCharCount(draftRef.current.textContent.length)
  }
  const execCmd = (cmd, val = null) => {
    draftRef.current?.focus()
    document.execCommand(cmd, false, val)
    saveDraft()
  }
  const addLink = () => {
    const url = window.prompt('Enter a URL')
    if (url) execCmd('createLink', url)
  }
  const insertCard = (text) => {
    if (!draftRef.current) return
    draftRef.current.focus()
    const lead = draftRef.current.textContent.trim() ? '<br><br>' : ''
    document.execCommand('insertHTML', false, lead + copyToHtml(text, copyFill))
    saveDraft()
    notify('Copy added to your draft')
  }

  const ptCard = PROPERTY_TYPE_CARDS.find((c) => c.key === config.propertyType)
  const PIcon = ptCard ? ptCard.icon : Building2
  const seg = 'rounded-md px-4 py-1.5 text-sm font-semibold transition'

  // ---- Review & Customize (final step) -------------------------------------
  // Build a real multi-page PDF (Cover, Executive Summary, Investment Highlights,
  // Map, Market Overview, Closing) — all pages in one file.
  const genPdf = async () => {
    notify('Generating PDF…')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const W = 595.28, H = 841.89, M = 44
    const primary = rc.primary || brand || '#1e293b'
    const money = (n) => '$' + (Number(n) || 0).toLocaleString('en-US')
    const cap = (form.capRate ? String(form.capRate) : dpVal('Cap Rate').replace('%', '') || '5.50') + '%'
    const noi = money(form.noi || (dpVal('NOI') || '').replace(/[^0-9.]/g, '') || 82500)
    const agent = (form.coAgents && form.coAgents[0]) || { name: CURRENT_USER.name, role: 'Agent', email: CURRENT_USER.email }
    const stripHtml = (h) => (h || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const loadImg = (url) => new Promise((res) => { if (!url) { res(null); return } const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => res(null); im.src = url })
    const label = (t, x, y) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor('#94a3b8'); doc.text(t.toUpperCase(), x, y) }
    const sectionTitle = (t, y) => { doc.setFillColor(primary); doc.rect(M, y - 11, 3, 15, 'F'); doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor('#0f172a'); doc.text(t, M + 12, y) }
    const kv = (k, v, x, y, w) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor('#64748b'); doc.text(k, x, y); doc.setFont('helvetica', 'bold'); doc.setTextColor('#0f172a'); doc.text(String(v), x + w, y, { align: 'right' }) }

    const coverImg = await loadImg(form.media?.cover?.url)
    const mapImg = GMAPS_KEY && typeof form.lat === 'number' ? await loadImg(`https://maps.googleapis.com/maps/api/staticmap?center=${form.lat},${form.lng}&zoom=13&size=600x400&scale=2&markers=color:red%7C${form.lat},${form.lng}&key=${GMAPS_KEY}`) : null

    // ---- Page 1: Cover ----
    if (coverImg) { try { doc.addImage(coverImg, 'JPEG', 0, 0, W, 360) } catch { doc.setFillColor('#e2e8f0'); doc.rect(0, 0, W, 360, 'F') } } else { doc.setFillColor('#e2e8f0'); doc.rect(0, 0, W, 360, 'F') }
    let y = 420
    doc.setFillColor(primary); doc.rect(M, y - 16, 78, 20, 'F'); doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor('#ffffff'); doc.text((config.docType || 'FOR SALE').toUpperCase().slice(0, 18), M + 8, y - 2)
    doc.setTextColor('#0f172a'); doc.setFontSize(30); doc.text(docName, M, y + 30)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor('#64748b'); doc.text(fullAddress || '', M, y + 52)
    // price row (right)
    if (rc.price) { doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor('#0f172a'); doc.text(money(form.price), W - M, y + 6, { align: 'right' }); label('Price', W - M - 60, y + 20) }
    doc.setDrawColor('#e2e8f0'); doc.line(M, y + 76, W - M, y + 76)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor('#0f172a'); doc.text(agent.name, M, y + 100)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor('#64748b'); doc.text(agent.role || 'Agent', M, y + 116); doc.text(agent.email || '', M, y + 130)

    // ---- Page 2: Executive Summary ----
    doc.addPage(); doc.setFillColor(primary); doc.rect(0, 0, W, 6, 'F'); sectionTitle('Executive Summary', 70)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor('#64748b'); doc.text(fullAddress || '', M, 96)
    let by = 140
    label('Property Data', M, by); by += 14
    const pdRows = [['Tenant', 'Quick Quack Car Wash'], ['Lease Type', 'Ground Lease'], ['Lease Term', '20 Years'], ['Rent Increases', '10% every 5 Years'], ['Renewal Options', 'Four (4), Five (5) Yr'], ['Guarantee', 'Corporate']]
    pdRows.forEach(([k, v]) => { kv(k, v, M, by, W - 2 * M); doc.setDrawColor('#eef2f7'); doc.line(M, by + 8, W - M, by + 8); by += 26 })
    // metric tiles
    let ty = 140
    const tile = (t, v, x) => { doc.setDrawColor('#e2e8f0'); doc.roundedRect(x, ty, 150, 54, 6, 6); doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(primary); doc.text(v, x + 12, ty + 24); label(t, x + 12, ty + 42) }
    if (rc.price) tile('Price', money(form.price), W - M - 150)

    // ---- Page 3: Investment Highlights ----
    doc.addPage(); doc.setFillColor(primary); doc.rect(0, 0, W, 6, 'F'); sectionTitle('Investment Highlights', 70)
    let iy = 130
    const block = (t, rows) => { label(t, M, iy); iy += 16; rows.forEach(([k, v]) => { kv(k, v, M, iy, W - 2 * M); doc.setDrawColor('#eef2f7'); doc.line(M, iy + 8, W - M, iy + 8); iy += 26 }); iy += 14 }
    block('Property Snapshot', [['Asking Price', money(form.price)], ['Cap Rate', cap]])
    block('Income Summary', [['Net Operating Income', noi]])
    block('Returns & Occupancy', [['Cap Rate', cap]])

    // ---- Page 4: Map ----
    doc.addPage(); doc.setFillColor(primary); doc.rect(0, 0, W, 6, 'F'); sectionTitle(maps[0]?.title || 'Location', 70)
    if (mapImg) { try { doc.addImage(mapImg, 'PNG', M, 100, W - 2 * M, 380) } catch { /* skip */ } }
    else { doc.setFillColor('#e2e8f0'); doc.rect(M, 100, W - 2 * M, 380, 'F') }

    // ---- Page 5: Market Overview ----
    doc.addPage(); doc.setFillColor(primary); doc.rect(0, 0, W, 6, 'F'); sectionTitle('Market Overview', 70)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor('#475569')
    const mo = stripHtml(form.moAbout) || `Market overview for ${[form.city, form.state].filter(Boolean).join(', ') || 'the area'}. A thriving, high-demand trade area with strong demographics anchoring durable commercial real estate demand.`
    doc.text(doc.splitTextToSize(mo, W - 2 * M), M, 100)
    let my = 300
    label('Key Facts', M, my); my += 16
    const facts = (form.moFacts && form.moFacts.length ? form.moFacts.map((f) => [f.label, f.value]) : [['Population', '281,707'], ['Area', '66.8 sq mi'], ['Time Zone', 'Pacific Time Zone'], ['County', 'Orange County'], ['State', 'California']])
    facts.forEach(([k, v]) => { kv(k, v, M, my, W - 2 * M); doc.setDrawColor('#eef2f7'); doc.line(M, my + 8, W - M, my + 8); my += 26 })

    // ---- Page 6: Closing ----
    doc.addPage(); doc.setFillColor(primary); doc.rect(0, 0, W, 6, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor('#0f172a'); doc.text(docName, W / 2, 90, { align: 'center' })
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor('#64748b'); doc.text(fullAddress || '', W / 2, 110, { align: 'center' })
    label('Presented By', W / 2 - 34, 240)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor('#0f172a'); doc.text(agent.name, W / 2, 266, { align: 'center' })
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor('#64748b'); doc.text(agent.role || 'Agent', W / 2, 282, { align: 'center' }); doc.text(agent.email || '', W / 2, 296, { align: 'center' })
    label('Disclaimer', M, 560)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor('#94a3b8')
    const disc = CONFIDENTIALITY_TEXT.join(' ').replace(/\[COMPANY_NAME\]/g, 'MyCREBlueprint')
    doc.text(doc.splitTextToSize(disc, W - 2 * M), M, 576)

    doc.save(`${docName} - ${config.docType || 'Document'}.pdf`)
    notify('PDF downloaded')
  }

  if (reviewMode) {
    const priceStr = form.price ? `$${(Number(form.price) / 1e6).toFixed(3)}M` : '—'
    const contact = (form.coAgents && form.coAgents[0]) || { name: CURRENT_USER.name, title: 'Agent', email: CURRENT_USER.email }
    const reviewPages = [
      { key: 'cover', title: 'Cover Page' },
      { key: 'exec', title: 'Executive Summary' },
      { key: 'invest', title: 'Investment Highlights' },
      ...(maps || []).map((m) => ({ key: m.id, title: m.title || 'Map', map: m })),
      { key: 'market', title: 'Market Overview' },
      ...(form.customPages || []).map((c) => ({ key: c.id, title: c.title, custom: c })),
      { key: 'closing', title: 'Closing' },
    ]
    const visiblePages = reviewPages.filter((p) => !rc.hidden[p.key])
    const toggleHide = (k) => setRc((x) => ({ ...x, hidden: { ...x.hidden, [k]: !x.hidden[k] } }))
    const RcToggle = ({ on, onClick }) => (
      <button onClick={onClick} className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? 'bg-brand' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </button>
    )
    const rowCls = 'flex items-center justify-between py-2.5'
    return (
      <div className="fixed inset-0 z-50 flex bg-slate-50">
        <div className="hidden md:block">
          <Sidebar forceCollapsed active="dashboard" onNavigate={navFromBuilder} onSignOut={() => { if (onExit) onExit(); if (onSignOut) onSignOut() }} user={user || CURRENT_USER} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setReviewMode(false)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"><ArrowLeft className="h-4 w-4" /></button>
            <h1 className="text-lg font-extrabold text-slate-900">Review &amp; Customize <span className="ml-1 text-sm font-semibold text-slate-400">{visiblePages.length}/{reviewPages.length} pages</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => notify('Template gallery coming soon')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Repeat2 className="h-4 w-4" /> Swap Template</button>
            <button onClick={genPdf} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Download className="h-4 w-4" /> Download PDF</button>
            <button onClick={() => { notify('Saved'); onSave(form, step, true) }} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"><LogOut className="h-4 w-4" /> Save &amp; Exit</button>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left customization panel */}
          <aside className="scrollbar-slim w-80 shrink-0 overflow-y-auto border-r border-slate-200 bg-white">
            {/* COLORS */}
            <div className="border-b border-slate-100">
              <button onClick={() => setRcv('colorsOpen', !rc.colorsOpen)} className="flex w-full items-center justify-between px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-700"><Palette className="h-4 w-4 text-brand" /> Colors</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition ${rc.colorsOpen ? 'rotate-180' : ''}`} />
              </button>
              {rc.colorsOpen && (
                <div className="space-y-3 px-4 pb-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input type="color" value={rc.primary} onChange={(e) => setRcv('primary', e.target.value)} className="h-7 w-7 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5" /> Primary
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input type="color" value={rc.secondary} onChange={(e) => setRcv('secondary', e.target.value)} className="h-7 w-7 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5" /> Secondary
                    </label>
                  </div>
                  <div className="relative">
                    <select value={rc.preset} onChange={(e) => setRcv('preset', e.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none">
                      <option>Brokerage Presets</option><option>Value REIS</option><option>Classic Navy</option><option>Modern Slate</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  <div className="relative">
                    <select value={rc.scheme} onChange={(e) => setRcv('scheme', e.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none">
                      <option>Color Schemes</option><option>Ocean</option><option>Sunset</option><option>Forest</option><option>Monochrome</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              )}
            </div>

            {/* COVER PAGE */}
            <div className="border-b border-slate-100">
              <button onClick={() => setRcv('coverOpen', !rc.coverOpen)} className="flex w-full items-center justify-between px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-700"><ImageIcon className="h-4 w-4 text-brand" /> Cover Page</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition ${rc.coverOpen ? 'rotate-180' : ''}`} />
              </button>
              {rc.coverOpen && (
                <div className="px-4 pb-4">
                  <div className={rowCls}>
                    <span className="text-sm font-semibold text-slate-700">Company Logo</span>
                    <RcToggle on={rc.logo} onClick={() => setRcv('logo', !rc.logo)} />
                  </div>
                  {rc.logo && (
                    <div className="pb-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Logo Size</span>
                        <span>{rc.logoSize}% <button onClick={() => setRcv('logoSize', 100)} className="ml-1 font-semibold text-brand">Reset</button></span>
                      </div>
                      <input type="range" min="40" max="140" value={rc.logoSize} onChange={(e) => setRcv('logoSize', Number(e.target.value))} className="mt-1 w-full accent-orange-500" />
                    </div>
                  )}
                  <div className={rowCls}>
                    <span>
                      <span className="block text-sm font-semibold text-slate-700">Company Info</span>
                      <span className="block text-xs text-slate-400">Brokerage name, phone, website &amp; address</span>
                    </span>
                    <RcToggle on={rc.companyInfo} onClick={() => setRcv('companyInfo', !rc.companyInfo)} />
                  </div>
                  <div className={rowCls}>
                    <span>
                      <span className="block text-sm font-semibold text-slate-700">Contact Info</span>
                      <span className="block text-xs text-slate-400">Show broker name &amp; phone</span>
                    </span>
                    <RcToggle on={rc.contactInfo} onClick={() => setRcv('contactInfo', !rc.contactInfo)} />
                  </div>
                  <div className={rowCls}><span className="text-sm font-semibold text-slate-700">Price</span><RcToggle on={rc.price} onClick={() => setRcv('price', !rc.price)} /></div>
                  <div className={rowCls}><span className="text-sm font-semibold text-slate-700">Cap Rate</span><RcToggle on={rc.capRate} onClick={() => setRcv('capRate', !rc.capRate)} /></div>
                  <div className={rowCls}><span className="text-sm font-semibold text-slate-700">NOI</span><RcToggle on={rc.noi} onClick={() => setRcv('noi', !rc.noi)} /></div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm font-semibold text-slate-700">Cap Rate &amp; NOI</span>
                    <div className="relative">
                      <select value={rc.capNoiMode} onChange={(e) => setRcv('capNoiMode', e.target.value)} className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-sm text-slate-700 outline-none">
                        <option>Auto</option><option>Always</option><option>Never</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <p className="pt-1 text-xs text-slate-400">Applies to the cover, contents, valuation, and pro forma analysis pages. Pro Forma hides the in-place value.</p>
                </div>
              )}
            </div>
          </aside>

          {/* Center preview */}
          <div className="relative flex flex-1 items-center justify-center overflow-auto p-8">
            {(() => {
              const pg = visiblePages[Math.min(rc.page, visiblePages.length - 1)] || visiblePages[0]
              const bpKey = { cover: 'cover', exec: 'exec', invest: 'invest', market: 'location', closing: 'contact' }[pg?.key] || 'exec'
              return (
                <div className="overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200" style={{ width: 560, height: 724 }}>
                  {pg?.map ? (
                    <GMapThumb lat={pg.map.lat} lng={pg.map.lng} zoom={pg.map.zoom} className="h-full w-full" />
                  ) : pg?.custom ? (
                    <div className="h-full w-full overflow-y-auto p-8">
                      <h2 className="text-2xl font-extrabold text-slate-900">{pg.custom.title}</h2>
                      <div className="mt-3 h-1 w-16 rounded" style={{ background: rc.primary }} />
                      {pg.custom.image && (pg.custom.imageName || '').toLowerCase().endsWith('.pdf') ? (
                        <div className="mt-4 flex items-center gap-2 text-slate-500"><FileText className="h-6 w-6 text-rose-400" /> {pg.custom.imageName}</div>
                      ) : pg.custom.image ? (
                        <img src={pg.custom.image} alt="" className="mt-4 w-full rounded-lg object-cover" />
                      ) : null}
                      {pg.custom.body && <div className="mt-4 text-sm leading-relaxed text-slate-700 [&_a]:text-brand" dangerouslySetInnerHTML={{ __html: pg.custom.body }} />}
                    </div>
                  ) : (
                    <div className="origin-top-left" style={{ transform: 'scale(0.875)', width: 640, height: 828 }}>
                      <BuilderPage pageKey={bpKey} data={previewData} />
                    </div>
                  )}
                </div>
              )
            })()}
            {visiblePages.length > 1 && (
              <button onClick={() => setRcv('page', (rc.page + 1) % visiblePages.length)} className="absolute right-6 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand shadow-md ring-1 ring-slate-200 transition hover:bg-orange-50">
                <ChevronDown className="h-5 w-5 -rotate-90" />
              </button>
            )}
          </div>
          {/* Right: Document Sections — jump back to any section to edit */}
          <aside className="scrollbar-slim hidden w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-4 lg:block">
            <div className="border-l-4 border-brand pl-2 text-sm font-extrabold text-slate-900">Document Sections</div>
            <p className="mt-1 pl-2 text-xs text-slate-500">Click any section below to jump back and edit it.</p>
            <div className="mt-3 space-y-0.5">
              {EDIT_SECTIONS.map((s) => (
                <button key={s.i} onClick={() => { setReviewMode(false); setStep(s.i) }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="min-w-0 flex-1 truncate">{s.label}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </button>
              ))}
              <div className="mt-1 flex items-center gap-2 rounded-lg bg-orange-50 px-2 py-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">{EDIT_SECTIONS.length + 1}</span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">Review &amp; Customize</span><span className="block text-xs font-medium text-brand">Editing</span></span>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom: document pages */}
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Document Pages <span className="font-medium normal-case text-slate-400">· Drag to reorder · Click <Eye className="inline h-3.5 w-3.5" /> to show/hide pages</span>
          </p>
          <div className="scrollbar-slim flex gap-3 overflow-x-auto pb-1">
            {reviewPages.map((p, i) => {
              const hidden = !!rc.hidden[p.key]
              const active = visiblePages[rc.page]?.key === p.key
              const bpKey = { cover: 'cover', exec: 'exec', invest: 'invest', market: 'location', closing: 'contact' }[p.key] || 'exec'
              return (
                <div key={p.key} className="group w-40 shrink-0">
                  <button onClick={() => { const vi = visiblePages.findIndex((v) => v.key === p.key); if (vi >= 0) setRcv('page', vi) }} className={`relative block h-24 w-full overflow-hidden rounded-lg border-2 bg-white text-left transition ${active ? 'border-brand' : 'border-slate-200 hover:border-slate-300'} ${hidden ? 'opacity-40' : ''}`}>
                    <span className="absolute left-1.5 top-1.5 z-20 flex h-5 w-5 items-center justify-center rounded bg-slate-900/80 text-[11px] font-bold text-white">{i + 1}</span>
                    <span onClick={(e) => { e.stopPropagation(); toggleHide(p.key) }} className="absolute right-1.5 top-1.5 z-20 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white text-slate-500 shadow ring-1 ring-slate-200 transition hover:text-brand">
                      {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </span>
                    {p.custom && (
                      <span className="absolute bottom-1.5 right-1.5 z-20 flex gap-1 opacity-0 transition group-hover:opacity-100">
                        <span onClick={(e) => { e.stopPropagation(); editCustomPage(p.custom) }} className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white text-brand shadow ring-1 ring-slate-200 hover:bg-orange-50"><Pencil className="h-3 w-3" /></span>
                        <span onClick={(e) => { e.stopPropagation(); delCustomPage(p.custom.id) }} className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white text-rose-500 shadow ring-1 ring-slate-200 hover:bg-rose-50"><Trash2 className="h-3 w-3" /></span>
                      </span>
                    )}
                    {p.map ? (
                      <GMapThumb lat={p.map.lat} lng={p.map.lng} zoom={p.map.zoom} className="h-full w-full" />
                    ) : p.custom ? (
                      <div className="h-full w-full overflow-hidden bg-white p-2">
                        {p.custom.image ? (
                          (p.custom.imageName || '').toLowerCase().endsWith('.pdf')
                            ? <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400"><FileText className="h-7 w-7 text-rose-400" /><span className="text-[8px]">PDF</span></div>
                            : <img src={p.custom.image} alt="" className="h-full w-full rounded object-cover" />
                        ) : (
                          <div className="text-[7px] leading-tight text-slate-500"><div className="mb-1 text-[9px] font-bold text-slate-800">{p.custom.title}</div><div className="line-clamp-6" dangerouslySetInnerHTML={{ __html: (p.custom.body || 'Custom page').slice(0, 400) }} /></div>
                        )}
                      </div>
                    ) : (
                      <div className="pointer-events-none absolute left-0 top-0 origin-top-left overflow-hidden" style={{ transform: 'scale(0.25)' }}>
                        <div style={{ width: 640, height: 828 }}><BuilderPage pageKey={bpKey} data={previewData} /></div>
                      </div>
                    )}
                  </button>
                  <p className="mt-1 truncate text-center text-xs font-semibold text-slate-600">{p.title}</p>
                </div>
              )
            })}
            <button onClick={openAddPage} className="flex h-24 w-40 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-orange-300 text-brand transition hover:bg-orange-50">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100"><Plus className="h-4 w-4" /></span>
              <span className="text-xs font-bold">Add Page</span>
            </button>
          </div>
        </div>
        </div>

        {/* Add Custom Page modal — step 1: pick layout, step 2: fill content */}
        {addPageOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setAddPageOpen(false)}>
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-brand"><FilePlus className="h-5 w-5" /></div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Add Custom Page</h3>
                    <p className="text-sm text-slate-500">Choose a layout, then add images, PDFs, or rich text content.</p>
                  </div>
                </div>
                <button onClick={() => setAddPageOpen(false)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
              </div>

              {!pageDraft ? (
                <div className="grid gap-3 p-5 sm:grid-cols-2">
                  {Object.entries(PAGE_LAYOUTS).map(([k, o]) => (
                    <button key={k} onClick={() => startPage(k)} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-orange-300 hover:bg-orange-50/40">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${o.c}`}><o.icon className="h-5 w-5" /></div>
                      <div><p className="text-sm font-bold text-slate-900">{o.t}</p><p className="mt-0.5 text-xs text-slate-500">{o.d}</p></div>
                    </button>
                  ))}
                </div>
              ) : (() => {
                const lay = PAGE_LAYOUTS[pageDraft.layout]
                return (
                  <>
                    <div className="scrollbar-slim flex-1 overflow-y-auto p-5">
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${lay.c}`}><lay.icon className="h-4 w-4" /></span> {lay.t}</span>
                        <button onClick={() => setPageDraft(null)} className="text-sm font-semibold text-brand hover:underline">Change layout</button>
                      </div>

                      <label className="mb-1 mt-5 block text-sm font-semibold text-slate-700">Page Title <span className="text-rose-500">*</span></label>
                      <input value={pageDraft.title} onChange={(e) => setPD('title', e.target.value)} placeholder="e.g. Floor Plans, Additional Photos, Terms & Conditions" className={inputCls} />
                      <p className="mt-1 text-xs text-slate-400">{lay.titleHint}</p>

                      {lay.media && (
                        <>
                          <label className="mb-1 mt-5 block text-sm font-semibold text-slate-700">Media</label>
                          {pageDraft.image ? (
                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                              {(pageDraft.imageName || '').toLowerCase().endsWith('.pdf') ? <FileText className="h-10 w-10 text-rose-500" /> : <img src={pageDraft.image} alt="" className="h-16 w-24 rounded object-cover" />}
                              <span className="min-w-0 flex-1 truncate text-sm text-slate-600">{pageDraft.imageName || 'Uploaded media'}</span>
                              <button onClick={() => setPageDraft((x) => ({ ...x, image: null, imageName: '' }))} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          ) : (
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 py-12 text-center transition hover:border-orange-300 hover:bg-orange-50/30">
                              <Upload className="h-6 w-6 text-slate-400" />
                              <span className="mt-1 text-sm font-semibold text-slate-700">Upload Image or PDF</span>
                              <span className="text-xs text-slate-400">Drag &amp; drop a photo, floorplan, site plan, or PDF page</span>
                              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onPageMedia} />
                            </label>
                          )}
                        </>
                      )}

                      {lay.text && (
                        <>
                          <label className="mb-1 mt-5 block text-sm font-semibold text-slate-700">Content</label>
                          <div className="overflow-hidden rounded-xl border border-slate-200">
                            <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-slate-50/60 px-2 py-1.5">
                              <button onClick={() => pageExec('formatBlock', 'H2')} className="rounded px-1.5 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-200/70">H2</button>
                              <span className="mx-1 h-5 w-px bg-slate-200" />
                              <button onClick={() => pageExec('bold')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70"><Bold className="h-4 w-4" /></button>
                              <button onClick={() => pageExec('italic')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70"><Italic className="h-4 w-4" /></button>
                              <button onClick={() => pageExec('underline')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70"><Underline className="h-4 w-4" /></button>
                              <span className="mx-1 h-5 w-px bg-slate-200" />
                              <button onClick={() => pageExec('insertUnorderedList')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70"><List className="h-4 w-4" /></button>
                              <button onClick={() => pageExec('insertOrderedList')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70"><ListOrdered className="h-4 w-4" /></button>
                              <span className="mx-1 h-5 w-px bg-slate-200" />
                              <button onClick={() => pageExec('justifyLeft')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70"><AlignLeft className="h-4 w-4" /></button>
                              <button onClick={() => pageExec('justifyCenter')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70"><AlignCenter className="h-4 w-4" /></button>
                              <button onClick={() => pageExec('justifyRight')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70"><AlignRight className="h-4 w-4" /></button>
                              <span className="mx-1 h-5 w-px bg-slate-200" />
                              <button onClick={() => { const u = window.prompt('Link URL'); if (u) pageExec('createLink', u) }} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70"><Link2 className="h-4 w-4" /></button>
                              <button onClick={() => pageExec('insertHorizontalRule')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70"><Minus className="h-4 w-4" /></button>
                              <span className="mx-1 h-5 w-px bg-slate-200" />
                              <button onClick={() => pageExec('undo')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70"><Undo2 className="h-4 w-4" /></button>
                              <button onClick={() => pageExec('redo')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70"><Redo2 className="h-4 w-4" /></button>
                              <span className="ml-auto pr-1 text-xs font-medium text-slate-400">{pageChars}/2000</span>
                            </div>
                            <div className="relative">
                              <div ref={(el) => { pageRef.current = el; if (el && el.dataset.loaded !== '1') { el.innerHTML = pageDraft.body || ''; el.dataset.loaded = '1' } }} contentEditable suppressContentEditableWarning onInput={() => { setPD('body', pageRef.current?.innerHTML || ''); setPageChars(pageRef.current?.textContent.length || 0) }} className="scrollbar-slim min-h-[220px] max-h-[300px] overflow-y-auto p-4 text-sm leading-relaxed text-slate-700 outline-none [&_a]:text-brand [&_a]:underline" />
                              {pageChars === 0 && <span className="pointer-events-none absolute left-4 top-4 text-sm text-slate-400">Type your content here… Use the toolbar for formatting, images, tables, and more.</span>}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
                      <button onClick={() => setAddPageOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                      <button onClick={savePage} disabled={!pageDraft.title.trim()} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50">Add Page</button>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-50">
      {/* Collapsed nav rail — same app sidebar, shown while building */}
      <div className="hidden md:block">
        <Sidebar forceCollapsed active="dashboard" onNavigate={navFromBuilder} onSignOut={() => { if (onExit) onExit(); if (onSignOut) onSignOut() }} user={user || CURRENT_USER} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">{form.name.trim() || 'Untitled Document'}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{config.propertyType}</span>
            <span className="rounded bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">{config.docType}</span>
            {locLabel && <span className="text-xs text-slate-400">· {locLabel}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => notify('Invite link copied')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Users className="h-4 w-4" /> Invite
          </button>
          <button onClick={() => onSave(form, step, false)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <LogOut className="h-4 w-4" /> Save &amp; Exit
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: form + footer */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="scrollbar-slim flex-1 overflow-y-auto">
            <div className={`mx-auto px-6 py-8 ${isMedia || isFinancials || isConfidentiality ? 'max-w-5xl' : isMarket ? 'max-w-6xl' : isContacts ? 'max-w-3xl' : 'max-w-[1200px]'}`}>
              {step === 0 ? (
                <>
                  <h2 className="text-2xl font-extrabold text-slate-900">Property Details</h2>
                  <p className="mt-1 text-sm text-slate-500">Enter your property's basic information to get started.</p>

                  {/* Property type */}
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${ptCard ? PT_TONES[ptCard.tone] : 'bg-sky-50 text-sky-500'}`}>
                        <PIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Property Type</p>
                        <p className="font-bold text-slate-900">{config.propertyType}</p>
                      </div>
                    </div>
                    <button onClick={onChangeType} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
                      <Repeat2 className="h-4 w-4" /> Change Type
                    </button>
                  </div>

                  {/* Name + price */}
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Property Name (Optional)">
                        <TextInput value={form.name} onChange={set('name')} placeholder="Property Name" />
                      </Field>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Selling Price</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">{form.country === 'CA' ? 'CA$' : 'US$'}</span>
                            <input value={form.price} onChange={set('price')} type="number" placeholder="e.g. 2,500,000" className={`${inputCls} pl-11`} />
                          </div>
                          <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1">
                            {['Show', 'Hide', 'Negotiable'].map((o) => (
                              <button key={o} onClick={() => setForm((f) => ({ ...f, priceVis: o }))} className={`${seg} ${form.priceVis === o ? 'bg-brand text-white shadow-sm' : 'text-slate-500'}`}>{o}</button>
                            ))}
                          </div>
                        </div>
                        {form.priceVis === 'Hide' && (
                          <p className="mt-2 text-xs text-slate-400">The price is used for internal calculations but won&apos;t appear in the marketing package.</p>
                        )}
                        {form.priceVis === 'Negotiable' && (
                          <p className="mt-2 text-xs text-slate-400">The price will appear as &quot;Negotiable&quot; in the marketing package.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <h3 className="mt-6 text-base font-bold text-slate-900">Property Address</h3>
                  <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex w-fit rounded-lg bg-slate-100 p-1">
                      {[{ k: 'US', l: 'United States' }, { k: 'CA', l: 'Canada' }].map((c) => (
                        <button key={c.k} onClick={() => setForm((f) => ({ ...f, country: c.k }))} className={`${seg} inline-flex items-center gap-1.5 ${form.country === c.k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                          <span className={`text-[10px] font-bold uppercase ${form.country === c.k ? 'text-brand' : 'text-slate-400'}`}>{c.k}</span>{c.l}
                        </button>
                      ))}
                    </div>
                    {form.country === 'CA' && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        <span><span className="font-semibold text-slate-700">Canada mode:</span> distances and areas display in metric (km / m&sup2; / ha). Automated property facts (building size, lot size, year built) aren&apos;t available from Canadian public records — enter those on the next step.</span>
                      </div>
                    )}
                    <div className="mt-3 flex w-fit rounded-lg bg-slate-100 p-1">
                      {[{ k: 'address', l: 'Search by Address' }, { k: 'parcel', l: 'Search by Parcel' }].map((m) => (
                        <button key={m.k} onClick={() => setForm((f) => ({ ...f, searchMode: m.k }))} className={`${seg} inline-flex items-center gap-1.5 ${form.searchMode === m.k ? 'bg-white text-brand shadow-sm' : 'text-slate-500'}`}>
                          {m.k === 'address' ? <MapPin className="h-4 w-4" /> : <Search className="h-4 w-4" />}{m.l}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4">
                      {form.searchMode === 'address' ? (
                      <>
                      <div className="relative">
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Street Address</label>
                        <input
                          value={form.street}
                          onChange={onStreet}
                          onFocus={() => form.street.trim().length >= 3 && sug.length && setShowSug(true)}
                          onBlur={() => setTimeout(() => setShowSug(false), 150)}
                          placeholder="123 Main Street"
                          autoComplete="off"
                          className={inputCls}
                        />
                        {showSug && sug.length > 0 && (
                          <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                            {sug.map((s, i) => (
                              <button
                                key={i}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  pickSug(s)
                                }}
                                className="flex w-full items-center gap-2 border-b border-slate-50 px-3 py-2.5 text-left text-sm text-slate-600 transition last:border-0 hover:bg-slate-50"
                              >
                                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                                <span className="truncate">{s.display_name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_140px_120px]">
                        <Field label="City"><TextInput value={form.city} onChange={set('city')} placeholder="City" /></Field>
                        <Field label="State">
                          <SelectInput value={form.state} onChange={set('state')} options={['Select State', ...US_STATES]} />
                        </Field>
                        <Field label="ZIP"><TextInput value={form.zip} onChange={set('zip')} placeholder="12345" /></Field>
                      </div>
                      </>
                      ) : (
                      <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="State">
                          <SelectInput value={form.state} onChange={set('state')} options={['Select state…', ...US_STATES]} />
                        </Field>
                        <Field label="County">
                          <input
                            value={form.county || ''}
                            onChange={set('county')}
                            disabled={!form.state || form.state.startsWith('Select')}
                            placeholder={!form.state || form.state.startsWith('Select') ? 'Select state first' : 'Enter county'}
                            className={`${inputCls} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                          />
                        </Field>
                      </div>
                      <div className="mt-3">
                        <Field label="APN (Assessor Parcel Number)">
                          <input value={form.apn || ''} onChange={set('apn')} placeholder="e.g. 5012-001-001" className={inputCls} />
                        </Field>
                      </div>
                      </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" checked={form.customDisplay} onChange={(e) => setForm((f) => ({ ...f, customDisplay: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-orange-300" />
                      <MapPin className="h-4 w-4 text-slate-400" /> Use Custom Display Address
                    </label>
                    {form.customDisplay && (
                      <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/40 p-3">
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Display Address</label>
                        <input value={form.displayAddress || ''} onChange={set('displayAddress')} placeholder="e.g. Downtown Austin, TX" className={inputCls} />
                        <p className="mt-1.5 text-xs text-slate-400">Shown in marketing materials instead of the actual address.</p>
                      </div>
                    )}
                  </div>

                  {(form.street.trim() || form.name.trim()) && (
                    <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> Property details saved
                    </p>
                  )}
                </>
              ) : step === 1 ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Property Data</h2>
                      <p className="mt-1 text-sm text-slate-500">These fields appear in your printed document. Drag rows to reorder.</p>
                    </div>
                    <button
                      onClick={autoPopulate}
                      className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      Auto-populate from Records
                    </button>
                  </div>

                  {form.dataPoints.length === 0 && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                      No property records found for this address. Add fields manually.
                    </div>
                  )}

                  {suggestions.length > 0 && (
                    <div className="mt-5">
                      <p className="text-sm font-semibold text-slate-500">Suggested for {config.propertyType}:</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {suggestions
                          .filter((s) => !form.dataPoints.some((p) => p.label === s))
                          .map((s) => (
                            <button
                              key={s}
                              onClick={() => addPoint(s)}
                              className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50/50 px-3 py-1.5 text-sm font-semibold text-brand transition hover:bg-orange-100"
                            >
                              <Plus className="h-3.5 w-3.5" /> {s}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    {form.dataPoints.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                        <p className="max-w-md text-sm text-slate-500">
                          No property data yet. Add fields manually or auto-populate from public records.
                        </p>
                        <button
                          onClick={autoPopulate}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                          Auto-populate from Records
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {form.dataPoints.map((p) => (
                          <div key={p.id} className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                            <input
                              value={p.label}
                              onChange={(e) => updatePoint(p.id, 'label', e.target.value)}
                              placeholder="Field name"
                              className={`${inputCls} sm:max-w-[220px]`}
                            />
                            <input
                              value={p.value}
                              onChange={(e) => updatePoint(p.id, 'value', e.target.value)}
                              placeholder="Value"
                              className={`${inputCls} flex-1`}
                            />
                            <button
                              onClick={() => removePoint(p.id)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => addPoint('')}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-brand transition hover:bg-orange-50"
                    >
                      <Plus className="h-4 w-4" /> Add Custom Data Point
                    </button>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> Auto-saved
                    </span>
                  </div>
                </>
              ) : isFinancials ? (
                <div className="mx-auto">
                  <div className="text-center">
                    <h2 className="text-2xl font-extrabold text-slate-900">What financial data would you like to include?</h2>
                    <p className="mt-1 text-slate-500">We'll customize the remaining steps based on your selection.</p>
                  </div>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {FIN_TYPES.map((t) => {
                      const sel = finType === t.key
                      return (
                        <button
                          key={t.key}
                          onClick={() => {
                            if (t.key === finType) { setDone((d) => ({ ...d, [step]: true })); setStep(t.key === 'Cap Rate & NOI' ? 8 : t.key === 'Skip Financials' ? 9 : step + 1) }
                            else setScopeConfirm(t.key)
                          }}
                          className={`relative rounded-2xl border-2 p-5 text-center transition ${sel ? 'border-orange-400 bg-orange-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                        >
                          {sel && (
                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white"><Check className="h-3 w-3" /></span>
                          )}
                          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${sel ? 'bg-orange-100 text-brand' : 'bg-slate-100 text-slate-400'}`}>
                            <t.icon className="h-6 w-6" />
                          </div>
                          <p className={`mt-3 font-bold ${sel ? 'text-brand' : 'text-slate-800'}`}>{t.key}</p>
                          <p className="mt-1 text-sm text-slate-500">{t.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : isCapRate ? (() => {
                const price = Number(form.price) || 0
                const capMode = form.capMode || 'noi'
                const noiVal = parseFloat(form.capNoi) || 0
                const capRateVal = parseFloat(form.capRate) || 0
                const calcCap = price ? (noiVal / price) * 100 : 0
                const calcNoi = (price * capRateVal) / 100
                return (
                  <div className="max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-500"><Calculator className="h-5 w-5" /></div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Cap Rate &amp; NOI</h2>
                      <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-600"><Calculator className="h-3.5 w-3.5" /> {finType}</span>
                      <button onClick={() => setStep(6)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"><Repeat2 className="h-3.5 w-3.5" /> Change</button>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Your selling price is set on the Property Details page. Enter either NOI or Cap Rate to calculate the other.</p>

                    {/* Valuation */}
                    <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/30 p-4">
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-900"><Calculator className="h-4 w-4 text-violet-500" /> Valuation <span className="text-xs font-normal text-violet-500">NOI ÷ Cap Rate = Selling Price</span></p>
                      <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
                        <div>
                          <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><Lock className="h-3 w-3" /> Selling Price</p>
                          <p className="text-xl font-extrabold text-slate-900">{currency(price)}</p>
                        </div>
                        <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">From Property Details</span>
                      </div>
                      <div className="mt-3 inline-flex w-full rounded-lg bg-slate-100 p-1">
                        {[{ k: 'noi', l: 'I know the NOI' }, { k: 'caprate', l: 'I know the Cap Rate' }].map((o) => (
                          <button key={o.k} onClick={() => setForm((f) => ({ ...f, capMode: o.k }))} className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition ${capMode === o.k ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500'}`}>{o.l}</button>
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">NOI</label>
                          {capMode === 'noi' ? (
                            <div className="relative">
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                              <input value={form.capNoi || ''} onChange={(e) => setForm((f) => ({ ...f, capNoi: e.target.value }))} placeholder="0" className={`${inputCls} pl-6`} />
                            </div>
                          ) : (
                            <div className="rounded-lg border border-violet-200 bg-violet-50/50 px-3 py-2 text-sm font-bold text-slate-800">{currency(calcNoi)}</div>
                          )}
                        </div>
                        <ArrowRight className="mb-2 h-4 w-4 text-slate-300" />
                        <div>
                          <label className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">Cap Rate <span className="rounded bg-violet-100 px-1 text-[10px] font-semibold text-violet-600">{capMode === 'noi' ? 'Calculated' : 'Input'}</span></label>
                          {capMode === 'caprate' ? (
                            <div className="relative">
                              <input value={form.capRate || ''} onChange={(e) => setForm((f) => ({ ...f, capRate: e.target.value }))} placeholder="0" className={`${inputCls} pr-7`} />
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-violet-200 bg-violet-50/50 px-3 py-2 text-right text-sm font-bold text-slate-800">{calcCap.toFixed(2)}%</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Property metrics */}
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-900"><Building2 className="h-4 w-4 text-amber-500" /> Property Metrics <span className="text-xs font-normal text-slate-400">Optional — appears on Investment Highlights page</span></p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Occupancy</label>
                          <div className="relative">
                            <input value={form.capOcc || ''} onChange={(e) => setForm((f) => ({ ...f, capOcc: e.target.value }))} placeholder="e.g. 94" className={`${inputCls} pr-7`} />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Number of Tenants</label>
                          <div className="relative">
                            <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input value={form.capTenants || ''} onChange={(e) => setForm((f) => ({ ...f, capTenants: e.target.value }))} placeholder="e.g. 12" className={`${inputCls} pl-9`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })() : isSkipFin ? (
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><EyeOff className="h-5 w-5" /></div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Financials Skipped</h2>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"><EyeOff className="h-3.5 w-3.5" /> {finType}</span>
                    <button onClick={() => setStep(6)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"><Repeat2 className="h-3.5 w-3.5" /> Change</button>
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
                      <EyeOff className="h-8 w-8 text-slate-300" />
                      <p className="font-bold text-slate-700">No financial pages in this document</p>
                      <p className="max-w-md text-sm text-slate-500">You chose to skip financials, so no rent roll, income &amp; expenses, or valuation pages will be generated. You can change this anytime.</p>
                      <button onClick={() => setStep(6)} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"><Repeat2 className="h-4 w-4" /> Change Financial Scope</button>
                    </div>
                  </div>
                </div>
              ) : isRentRoll ? (
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-slate-900">Rent Roll</h2>
                    <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-brand"><BarChart3 className="h-3.5 w-3.5" /> {finType}</span>
                    <button onClick={() => setStep(6)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"><Repeat2 className="h-3.5 w-3.5" /> Change</button>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Select a rent roll type and enter your property's tenant and vacancy data.</p>

                  {form.rrChosen ? (
                    /* Collapsed: compact selected-type bar */
                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-800">
                        <span className="h-2 w-2 rounded-full bg-brand" /> {rrSelLabel}
                      </span>
                      <span className="text-slate-300">|</span>
                      <button onClick={() => setForm((f) => ({ ...f, rrChosen: false }))} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                        <Repeat2 className="h-3.5 w-3.5" /> Change Rent Roll Type
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">Select Rent Roll Type</p>
                      <div className="mt-2 grid gap-4 lg:grid-cols-2">
                        {RR_FAMILIES.map((fam) => (
                          <div key={fam.family} className={`rounded-2xl border p-3 ${fam.tone === 'emerald' ? 'border-emerald-200 bg-emerald-50/40' : 'border-violet-200 bg-violet-50/40'}`}>
                            <div className="flex items-start gap-2 px-1 pb-2">
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${fam.tone === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'}`}>
                                <fam.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className={`text-sm font-extrabold ${fam.tone === 'emerald' ? 'text-emerald-700' : 'text-violet-700'}`}>{fam.family}</p>
                                <p className={`text-xs ${fam.tone === 'emerald' ? 'text-emerald-600' : 'text-violet-600'}`}>{fam.blurb}</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {fam.modes.map((m) => {
                                const sel = rrSel.family === fam.family && rrSel.mode === m.mode
                                return (
                                  <button
                                    key={m.mode}
                                    onClick={() => (sel ? setForm((f) => ({ ...f, rrChosen: true })) : setRrConfirm({ family: fam.family, mode: m.mode }))}
                                    className={`w-full rounded-xl border-2 bg-white p-3 text-left transition ${sel ? 'border-orange-400' : 'border-slate-200 hover:border-slate-300'}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <p className="font-bold text-slate-900">{m.mode}</p>
                                      {sel && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white"><Check className="h-3 w-3" /></span>}
                                    </div>
                                    <p className="mt-1 text-xs leading-snug text-slate-500">{m.desc}</p>
                                    <p className="mt-2 text-xs text-slate-500"><b className="text-slate-700">Best for:</b> {m.bestFor}</p>
                                    <ul className="mt-1.5 space-y-1">
                                      {m.points.map((p) => (
                                        <li key={p} className="flex items-center gap-1.5 text-xs text-slate-500"><Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> {p}</li>
                                      ))}
                                    </ul>
                                    <span onClick={(e) => { e.stopPropagation(); notify('Sample opened') }} className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand hover:underline"><Eye className="h-3.5 w-3.5" /> View Sample</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Tenant / vacancy table */}
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="scrollbar-slim overflow-x-auto">
                      <table className="w-full min-w-[900px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50 uppercase tracking-wide text-slate-400">
                            {rrCols.map((c) => <th key={c} className="whitespace-nowrap px-2 py-2 font-semibold">{c}</th>)}
                            <th className="px-2 py-2" />
                          </tr>
                        </thead>
                        <tbody>
                          {rentRoll.length === 0 ? (
                            <tr>
                              <td colSpan={rrCols.length + 1} className="py-10 text-center">
                                <Users className="mx-auto h-7 w-7 text-slate-300" />
                                <p className="mt-2 text-sm text-slate-400">No tenants or vacancies yet</p>
                                <div className="mt-3 flex justify-center gap-2">
                                  <button onClick={() => openTenantModal('tenant')} className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-orange-100"><Plus className="h-3.5 w-3.5" /> Add Tenant</button>
                                  <button onClick={() => openTenantModal('vacancy')} className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-orange-100"><Plus className="h-3.5 w-3.5" /> Add Vacancy</button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            rentRoll.map((r) => (
                              <tr key={r.id} className={`border-b border-slate-50 ${r.kind === 'vacancy' ? 'bg-rose-50/30' : ''}`}>
                                {rrKeys.map((k) => (
                                  <td key={k} className="px-1 py-1">
                                    <input value={r[k] || ''} onChange={(e) => updRentRow(r.id, k, e.target.value)} className="w-full min-w-[64px] rounded border border-slate-200 px-1.5 py-1 text-xs outline-none focus:border-orange-400" />
                                  </td>
                                ))}
                                <td className="px-1 py-1">
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => openEditTenant(r)} className="inline-flex items-center gap-1 rounded-lg border border-orange-200 px-2 py-1 text-xs font-semibold text-brand transition hover:bg-orange-50"><Pencil className="h-3 w-3" /> Edit</button>
                                    <button onClick={() => setDeleteRow(r)} className="rounded p-1 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {rentRoll.length > 0 && (() => {
                          const tenants = rentRoll.filter((r) => r.kind !== 'vacancy').length
                          const sum = (k) => rentRoll.reduce((a, r) => a + (r[k] || 0), 0)
                          const totalFor = (k) => (k === 'sf' ? sum('nSf').toLocaleString() : k === 'monthly' ? money(sum('nMonthly')) : k === 'annual' ? money(sum('nAnnual')) : k === 'annReimb' ? money(sum('nReimb')) : '')
                          return (
                            <tfoot>
                              <tr className="border-t border-slate-200 bg-orange-50/50 text-xs font-bold text-slate-700">
                                <td className="px-2 py-2" colSpan={2}><span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {tenants} tenant{tenants === 1 ? '' : 's'}</span></td>
                                {rrKeys.slice(2).map((k) => <td key={k} className="px-2 py-2">{totalFor(k)}</td>)}
                                <td />
                              </tr>
                            </tfoot>
                          )
                        })()}
                      </table>
                    </div>
                  </div>
                  {rentRoll.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => openTenantModal('tenant')} className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-orange-100"><Plus className="h-3.5 w-3.5" /> Add Tenant</button>
                      <button onClick={() => openTenantModal('vacancy')} className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-orange-100"><Plus className="h-3.5 w-3.5" /> Add Vacancy</button>
                    </div>
                  )}

                  {/* Rent roll notes */}
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <p className="flex items-center gap-1.5 text-sm font-bold text-slate-800"><FileText className="h-4 w-4 text-slate-400" /> Rent Roll Notes</p>
                    <p className="mt-0.5 text-xs text-slate-500">General notes that will appear on the rent roll page of your document. Use for lease structure explanations, market context, or other commentary.</p>
                    <textarea
                      value={form.rrNotes || ''}
                      onChange={(e) => setForm((f) => ({ ...f, rrNotes: e.target.value.slice(0, 500) }))}
                      rows={3}
                      placeholder="e.g. All leases are triple net with annual CPI adjustments. Rents shown reflect current in-place rates as of March 2026."
                      className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">{(form.rrNotes || '').length}/500</p>
                  </div>
                </div>
              ) : isTenantProfiles ? (
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Tenant Profiles</h2>
                      <p className="mt-1 text-sm text-slate-500">Add profiles for each major tenant. Include their logo, credit rating, and key business details.</p>
                    </div>
                    <button onClick={() => openProfileModal()} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"><Plus className="h-4 w-4" /> Add Tenant</button>
                  </div>
                  {tenantProfiles.length === 0 ? (
                    <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
                      <Building2 className="h-8 w-8 text-slate-300" />
                      <p className="text-sm text-slate-400">No tenant profiles yet.</p>
                      <button onClick={() => openProfileModal()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"><Plus className="h-4 w-4" /> Add First Tenant</button>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {tenantProfiles.map((p) => (
                        <div key={p.id} className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                            {p.logo ? <img src={p.logo} alt="logo" className="h-full w-full object-contain" /> : <Building2 className="h-6 w-6" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-slate-900">{p.tradeName || 'Untitled Tenant'}</p>
                            <p className="truncate text-xs text-slate-500">{[p.industry, p.hq].filter(Boolean).join(' · ') || '—'}</p>
                            <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                              {p.credit && p.credit !== 'Not specified' && <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-600">{p.credit}</span>}
                              {p.sf && <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">{p.sf} SF</span>}
                              {p.leaseExp && <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">Exp {p.leaseExp}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                            <button onClick={() => openProfileModal(p)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-brand"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => delProfile(p.id)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : isSalesComps ? (
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500"><Scale className="h-5 w-5" /></div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Sales Comparables</h2>
                        <p className="mt-1 text-sm text-slate-500">Add comparable sales transactions to support your property valuation.</p>
                      </div>
                    </div>
                    <button onClick={() => openCompModal()} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"><Plus className="h-4 w-4" /> Add Comparable</button>
                  </div>
                  {salesComps.length === 0 ? (
                    <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-400"><MapPin className="h-6 w-6" /></div>
                      <p className="text-sm text-slate-400">No comparables added yet.</p>
                      <button onClick={() => openCompModal()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"><Plus className="h-4 w-4" /> Add First Comparable</button>
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">{salesComps.length} Comp{salesComps.length === 1 ? '' : 's'}</span>
                        {compYears.map((y) => (
                          <span key={y} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">{y}</span>
                        ))}
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {salesComps.map((c) => (
                          <div key={c.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                            <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-slate-100 text-slate-300">
                              {c.photo ? <img src={c.photo} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-9 w-9" />}
                            </div>
                            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                              <button onClick={() => openCompModal(c)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow ring-1 ring-slate-200 transition hover:text-brand"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => setCompDel(c)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-rose-400 shadow ring-1 ring-slate-200 transition hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                            {(c.propertyName || c.city) && (
                              <div className="px-4 pt-3">
                                <p className="truncate text-sm font-bold text-slate-900">{c.propertyName || 'Untitled Comparable'}</p>
                                {(c.city || c.state) && <p className="truncate text-xs text-slate-400">{[c.city, c.state].filter(Boolean).join(', ')}</p>}
                              </div>
                            )}
                            <div className="flex items-center justify-between px-4 py-3 text-sm">
                              <span className="text-xs text-slate-400">Price</span>
                              <span className="font-bold text-brand">{c.salePrice ? currency(c.salePrice) : '—'}</span>
                              <span className="text-xs text-slate-400">Sold</span>
                              <span className="font-bold text-slate-900">{soldLabel(c.saleDate)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : isRentalComps ? (
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500"><Home className="h-5 w-5" /></div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Rental Comparables</h2>
                        <p className="mt-1 text-sm text-slate-500">Add comparable rental properties to support your market rent analysis.</p>
                      </div>
                    </div>
                    <button onClick={() => openRentModal()} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"><Plus className="h-4 w-4" /> Add Comparable</button>
                  </div>
                  {rentComps.length === 0 ? (
                    <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-400"><MapPin className="h-6 w-6" /></div>
                      <p className="text-sm text-slate-400">No comparables added yet.</p>
                      <button onClick={() => openRentModal()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"><Plus className="h-4 w-4" /> Add First Comparable</button>
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">{rentComps.length} Comp{rentComps.length === 1 ? '' : 's'}</span>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {rentComps.map((c) => (
                          <div key={c.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                            <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-slate-100 text-slate-300">
                              {c.photo ? <img src={c.photo} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-9 w-9" />}
                            </div>
                            <div className="flex items-start justify-between gap-2 px-4 pt-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900">{c.propertyName || 'Untitled Comparable'}</p>
                                {(c.city || c.state) && <p className="truncate text-xs text-slate-400">{[c.city, c.state].filter(Boolean).join(', ')}</p>}
                              </div>
                              <div className="flex shrink-0 items-center gap-1">
                                <button onClick={() => openRentModal(c)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-brand"><Pencil className="h-3.5 w-3.5" /></button>
                                <button onClick={() => setRentDel(c)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-rose-400 ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3 text-sm">
                              <span className="text-xs text-slate-400">Market Rent</span>
                              <span className="font-bold text-brand">{c.marketRent ? `$${c.marketRent}/SF` : '—'}</span>
                              <span className="text-xs text-slate-400">SF</span>
                              <span className="font-bold text-slate-900">{c.buildingSf ? Number(c.buildingSf).toLocaleString() : '—'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : isMarket ? (
                <div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500"><Globe className="h-5 w-5" /></div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Market Overview</h2>
                      <p className="mt-1 text-sm text-slate-500">Market information and key demographics for your document</p>
                    </div>
                  </div>

                  <div className="mt-6 grid items-stretch gap-8 lg:grid-cols-2">
                    {/* Left column */}
                    <div className="flex flex-col">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Page Title</label>
                      <input value={form.moTitle || ''} onChange={(e) => setForm((f) => ({ ...f, moTitle: e.target.value }))} placeholder="e.g., Market Overview: The Greater Houston Metropolitan Area" className={inputCls} />
                      <p className="mt-1 text-xs text-slate-400">Appears as the heading on the PDF page</p>

                      <label className="mb-1 mt-4 block text-sm font-semibold text-slate-700">About Text</label>
                      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200">
                        <div className="flex items-center gap-0.5 border-b border-slate-100 bg-slate-50/60 px-2 py-1.5">
                          <button onClick={() => moExec('bold')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><Bold className="h-4 w-4" /></button>
                          <button onClick={() => moExec('italic')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><Italic className="h-4 w-4" /></button>
                          <button onClick={() => moExec('underline')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><Underline className="h-4 w-4" /></button>
                          <span className="mx-1 h-5 w-px bg-slate-200" />
                          <button onClick={() => moExec('insertUnorderedList')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><List className="h-4 w-4" /></button>
                          <button onClick={() => moExec('insertOrderedList')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><ListOrdered className="h-4 w-4" /></button>
                          <button onClick={moLink} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><Link2 className="h-4 w-4" /></button>
                          <span className="mx-1 h-5 w-px bg-slate-200" />
                          <button onClick={() => moExec('undo')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><Undo2 className="h-4 w-4" /></button>
                          <button onClick={() => moExec('redo')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><Redo2 className="h-4 w-4" /></button>
                        </div>
                        <div className="relative flex-1">
                          <div
                            ref={moRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={() => setForm((f) => ({ ...f, moAbout: moRef.current?.innerHTML || '' }))}
                            className="scrollbar-slim h-full min-h-[280px] overflow-y-auto p-4 text-sm leading-relaxed text-slate-700 outline-none [&_a]:text-brand [&_a]:underline"
                          />
                          {!(form.moAbout && form.moAbout.replace(/<[^>]*>/g, '').trim()) && (
                            <span className="pointer-events-none absolute left-4 top-4 text-sm text-slate-400">Enter city / market information here…</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right column */}
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Market Image</label>
                      <div className="group relative flex min-h-[200px] flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-6 text-center">
                        {form.moImage ? (
                          <>
                            <img src={form.moImage} alt="" className="max-h-64 w-full rounded-lg object-cover" />
                            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-xs font-semibold text-white">
                              <Camera className="h-3.5 w-3.5" /> Your Upload
                            </span>
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow transition hover:bg-slate-50">
                                <Pencil className="h-4 w-4" /> Change
                                <input type="file" accept="image/*" className="hidden" onChange={async (e) => { if (!e.target.files?.length) return; const [img] = await readFiles([e.target.files[0]]); setForm((f) => ({ ...f, moImage: img.url })); notify('Market image updated') }} />
                              </label>
                              <button onClick={() => { setForm((f) => ({ ...f, moImage: null })); notify('Market image removed') }} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-rose-500 shadow transition hover:bg-rose-50"><Trash2 className="h-4 w-4" /> Remove</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-8 w-8 text-slate-300" />
                            <p className="mt-2 text-sm text-slate-400">No photos available</p>
                            <label className="mt-1 cursor-pointer text-sm font-semibold text-brand hover:underline">
                              Upload your own
                              <input type="file" accept="image/*" className="hidden" onChange={async (e) => { if (!e.target.files?.length) return; const [img] = await readFiles([e.target.files[0]]); setForm((f) => ({ ...f, moImage: img.url })) }} />
                            </label>
                          </>
                        )}
                      </div>
                      <label className="mt-3 flex h-11 w-14 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-orange-300 text-orange-400 transition hover:bg-orange-50">
                        <Upload className="h-4 w-4" />
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => { if (!e.target.files?.length) return; const [img] = await readFiles([e.target.files[0]]); setForm((f) => ({ ...f, moImage: img.url })) }} />
                      </label>

                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500"><ListChecks className="h-4 w-4" /></div>
                          <p className="text-sm font-bold text-slate-900">Key Facts</p>
                        </div>
                        <span className="text-xs text-slate-400">Drag to reorder</span>
                      </div>
                      <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4">
                        {moFacts.length === 0 ? (
                          <p className="py-6 text-center text-sm text-slate-400">No key facts yet. Add facts about this market.</p>
                        ) : (
                          <div className="space-y-2">
                            {moFacts.map((k) => (
                              <div key={k.id} className="group flex items-center gap-2">
                                <input value={k.label} onChange={(e) => updFact(k.id, 'label', e.target.value)} placeholder="Label (e.g. Population)" className="w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                                <input value={k.value} onChange={(e) => updFact(k.id, 'value', e.target.value)} placeholder="Value (e.g. 7.1M)" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                                <button onClick={() => delFact(k.id)} className="rounded-lg p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <button onClick={addFact} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"><Plus className="h-4 w-4" /> Add Key Fact</button>
                        <span className="text-xs text-slate-400">Empty rows won't appear in the PDF</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isContacts ? (
                <div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500"><Users className="h-5 w-5" /></div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Contact Information</h2>
                      <p className="mt-1 text-sm text-slate-500">Add the contacts that will appear on your marketing package.</p>
                    </div>
                  </div>

                  {/* Primary contact card */}
                  <div className="relative mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-300"><Crown className="h-3 w-3" /> Primary Contact</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300"><CheckCircle2 className="h-3 w-3" /> Synced</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-700 ring-2 ring-orange-400/60">
                        {CURRENT_USER.avatar ? <img src={CURRENT_USER.avatar} alt="" className="h-full w-full object-cover" /> : <UserCircle className="h-10 w-10 text-slate-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xl font-extrabold">{CURRENT_USER.name}</p>
                        <p className="text-sm text-slate-300">{CURRENT_USER.role}</p>
                        <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs text-slate-200"><Mail className="h-3.5 w-3.5" /> {CURRENT_USER.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Co-listing agents — inline forms */}
                  {coAgents.map((c) => (
                    <div key={c.id} className="mt-5">
                      <span className="inline-block rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Co-Listing Agent</span>
                      <div className="mt-3 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500"><Users className="h-5 w-5" /></div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Personal Information</p>
                            <p className="text-xs text-slate-400">Name, contact details, and license info</p>
                          </div>
                        </div>
                        <button onClick={() => delCo(c.id)} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 transition hover:text-rose-500"><Trash2 className="h-4 w-4" /> Remove</button>
                      </div>
                      <div className="mt-2 flex gap-5 rounded-2xl border border-slate-200 border-l-4 border-l-blue-400 bg-white p-5">
                        {/* Avatar / upload */}
                        <div className="flex w-24 shrink-0 flex-col items-center">
                          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-300">
                            {c.photo ? <img src={c.photo} alt="" className="h-full w-full object-cover" /> : <UserCircle className="h-12 w-12" />}
                          </div>
                          <label className="mt-2 cursor-pointer text-sm font-semibold text-brand hover:underline">
                            Upload
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { if (!e.target.files?.length) return; const [img] = await readFiles([e.target.files[0]]); updCo(c.id, 'photo', img.url) }} />
                          </label>
                        </div>
                        {/* Fields */}
                        <div className="min-w-0 flex-1">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-slate-700">Full Name</label>
                              <input value={c.name} onChange={(e) => updCo(c.id, 'name', e.target.value)} placeholder="John Smith" className={inputCls} />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-slate-700">Title</label>
                              <input value={c.title} onChange={(e) => updCo(c.id, 'title', e.target.value)} placeholder="Senior Broker" className={inputCls} />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
                              <div className="flex gap-2">
                                <input value={c.phone} onChange={(e) => updCo(c.id, 'phone', e.target.value)} placeholder="(555) 123-4567" className={`${inputCls} flex-1`} />
                                <select value={c.phoneType} onChange={(e) => updCo(c.id, 'phoneType', e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-600 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100">
                                  <option>Direct</option>
                                  <option>Mobile</option>
                                  <option>Office</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                              <input value={c.email} onChange={(e) => updCo(c.id, 'email', e.target.value)} placeholder="agent@company.com" className={inputCls} />
                            </div>
                          </div>
                          <div className="mt-4 sm:w-1/2 sm:pr-2.5">
                            <label className="mb-1 block text-sm font-semibold text-slate-700">License #</label>
                            <input value={c.license} onChange={(e) => updCo(c.id, 'license', e.target.value)} placeholder="DRE# 012345" className={inputCls} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {coAgents.length === 0 && (
                    <button onClick={addCo} className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"><Plus className="h-4 w-4" /> Add Co-Listing Agent</button>
                  )}

                  {/* No team members notice */}
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><UserPlus className="h-4 w-4" /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">No team members available</p>
                        <p className="mt-0.5 text-xs text-slate-500">Additional contacts must be team members. Invite your colleagues from the Team Settings page.</p>
                        <span className="mt-1.5 inline-flex cursor-default items-center gap-1 text-xs font-semibold text-brand"><Settings className="h-3.5 w-3.5" /> Manage Team →</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isConfidentiality ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-start gap-3 border-b border-slate-100 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><ShieldCheck className="h-5 w-5" /></div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">Confidentiality Statement</h2>
                      <p className="mt-1 text-sm text-slate-500">Legal disclaimer for your marketing package. Auto-populated with your company name.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700">
                    <Lock className="h-4 w-4 shrink-0" />
                    <p>This agreement is managed by your team administrator and cannot be edited. Contact your admin to make changes.</p>
                  </div>
                  <div className="p-5">
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <div className="flex items-center gap-0.5 border-b border-slate-100 bg-slate-50/60 px-2 py-1.5 opacity-40">
                        {[Bold, Italic, Underline].map((I, i) => (<span key={i} className="rounded p-1.5 text-slate-400"><I className="h-4 w-4" /></span>))}
                        <span className="mx-1 h-5 w-px bg-slate-200" />
                        <span className="rounded p-1.5 text-slate-400"><List className="h-4 w-4" /></span>
                        <span className="rounded p-1.5 text-slate-400"><ListOrdered className="h-4 w-4" /></span>
                        <span className="rounded p-1.5 text-slate-400"><Link2 className="h-4 w-4" /></span>
                        <span className="mx-1 h-5 w-px bg-slate-200" />
                        <span className="rounded p-1.5 text-slate-400"><Undo2 className="h-4 w-4" /></span>
                        <span className="rounded p-1.5 text-slate-400"><Redo2 className="h-4 w-4" /></span>
                      </div>
                      <div className="space-y-5 bg-white p-6 text-sm leading-relaxed text-slate-700">
                        {CONFIDENTIALITY_TEXT.map((para, i) => (
                          <p key={i} className="whitespace-pre-line">
                            {para.split(/(\[COMPANY_NAME\])/g).map((chunk, j) => (
                              chunk === '[COMPANY_NAME]'
                                ? <span key={j} className="font-semibold text-blue-500">[COMPANY_NAME]</span>
                                : <span key={j}>{chunk}</span>
                            ))}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : isMaps ? (
                mapEditor ? (
                  <div className="-mx-6 -my-8 h-[calc(100vh-4.5rem)]">
                    <GoogleMapEditor open map={mapEditor} onSave={saveMap} onClose={() => setMapEditor(null)} notify={notify} />
                  </div>
                ) : (
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Maps</h2>
                  <p className="mt-1 text-sm text-slate-500">Create branded maps with business logos, labels, and styled overlays for your document.</p>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Maps</p>
                        <p className="text-xs text-slate-400">Each map becomes a full-page slide in your document</p>
                      </div>
                      <button onClick={addMap} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"><Plus className="h-4 w-4" /> Create Map</button>
                    </div>
                    {maps.length === 0 ? (
                      <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
                        <Map className="h-8 w-8 text-slate-300" />
                        <p className="text-sm text-slate-400">No maps yet — click "Create Map" to add a full-page map slide.</p>
                      </div>
                    ) : (
                      <div className="mt-4 grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,300px))]">
                        {maps.map((m) => (
                          <div key={m.id} className="rounded-xl border border-slate-200 p-2">
                            <div className="relative">
                              <GMapThumb lat={m.lat} lng={m.lng} zoom={m.zoom} className="h-52 w-full overflow-hidden rounded-lg bg-slate-100" />
                              <div className="absolute right-2 top-2 z-[900] flex gap-1">
                                <button onClick={() => setMapEditor(m)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand shadow-md ring-1 ring-slate-200 transition hover:bg-orange-50"><Pencil className="h-4 w-4" /></button>
                                <button onClick={() => setMapDel(m)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-rose-500 shadow-md ring-1 ring-slate-200 transition hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1 px-1">
                              <input id={`maptitle-${m.id}`} value={m.title} onChange={(e) => updMap(m.id, e.target.value)} className="min-w-0 flex-1 border-none bg-transparent text-sm font-bold text-slate-800 outline-none" />
                              <button onClick={() => setMapEditor(m)} className="shrink-0 text-slate-300 transition hover:text-brand"><Pencil className="h-3 w-3" /></button>
                            </div>
                            <p className="px-1 text-xs text-slate-400">Shown as the page header</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                )
              ) : isMedia ? (
                <div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                      <Camera className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">Images &amp; Media</h2>
                      <p className="mt-0.5 text-sm text-slate-500">Upload property photos, floorplans, site plans, aerials, and other media. Supports JPG, PNG, WebP, PDF, and SVG.</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Cover Image */}
                    <div className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-orange-300">
                      <Star className="h-7 w-7 text-amber-400" />
                      <p className="mt-1 font-bold text-slate-800">Cover Image</p>
                      <p className="text-xs text-slate-400">1 required — exterior</p>
                      <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">
                        <Upload className="h-4 w-4" /> Upload
                        <input type="file" accept="image/*,.pdf,.svg" className="hidden" onChange={(e) => uploadCover(e.target.files)} />
                      </label>
                    </div>
                    {/* Single-Page Images */}
                    <div className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-orange-300">
                      <Frame className="h-7 w-7 text-blue-500" />
                      <p className="mt-1 font-bold text-slate-800">Single-Page Images</p>
                      <p className="text-xs text-slate-400">One per page</p>
                      <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">
                        <Upload className="h-4 w-4" /> Upload
                        <input type="file" accept="image/*,.pdf,.svg" multiple className="hidden" onChange={(e) => uploadSingles(e.target.files)} />
                      </label>
                    </div>
                    {/* Multi-Image Page */}
                    <div className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-orange-300">
                      <Grid2X2 className="h-7 w-7 text-emerald-500" />
                      <p className="mt-1 font-bold text-slate-800">Multi-Image Page</p>
                      <p className="text-xs text-slate-400">Up to 8 per page</p>
                      <button onClick={() => setGalleryModal({ open: true, title: '', layout: 'Grid', images: [] })} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">
                        <Plus className="h-4 w-4" /> Add Gallery
                      </button>
                    </div>
                    {/* Property Video */}
                    <div className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-orange-300">
                      <Video className="h-7 w-7 text-rose-500" />
                      <p className="mt-1 font-bold text-slate-800">Property Video</p>
                      <p className="text-xs text-slate-400">YouTube, Vimeo, or .mp4</p>
                      <button onClick={() => { setVideoDraft(media.video || ''); setVideoModal(true) }} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">
                        <Plus className="h-4 w-4" /> Link
                      </button>
                    </div>
                  </div>

                  {/* Uploaded media preview */}
                  {(media.cover || media.singles.length > 0 || media.galleries.length > 0 || media.video) && (
                    <div className="mt-6 space-y-5">
                      {media.cover && (
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Cover Image</p>
                          <div className="relative inline-block">
                            <img src={media.cover.url} alt="cover" className="h-28 w-40 rounded-lg border border-slate-200 object-cover" />
                            <button onClick={removeCover} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-400 shadow ring-1 ring-slate-200 transition hover:text-rose-500"><X className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      )}
                      {media.singles.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Single-Page Images ({media.singles.length})</p>
                          <div className="flex flex-wrap gap-3">
                            {media.singles.map((s) => (
                              <div key={s.id} className="relative">
                                <img src={s.url} alt={s.name} className="h-20 w-28 rounded-lg border border-slate-200 object-cover" />
                                <button onClick={() => removeSingle(s.id)} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-400 shadow ring-1 ring-slate-200 transition hover:text-rose-500"><X className="h-3.5 w-3.5" /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {media.galleries.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Multi-Image Pages ({media.galleries.length})</p>
                          <div className="space-y-3">
                            {media.galleries.map((g) => (
                              <div key={g.id} className="rounded-xl border border-slate-200 p-3">
                                <div className="mb-2 flex items-center justify-between">
                                  <p className="text-sm font-semibold text-slate-800">{g.title || 'Untitled Page'} <span className="ml-1 text-xs font-normal text-slate-400">· {g.layout} · {g.images.length} photos</span></p>
                                  <button onClick={() => removeGallery(g.id)} className="rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {g.images.map((im) => (
                                    <img key={im.id} src={im.url} alt="" className="h-14 w-14 rounded-md border border-slate-200 object-cover" />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {media.video && (
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Property Video</p>
                          <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-3">
                            <Video className="h-4 w-4 shrink-0 text-rose-500" />
                            <a href={media.video} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm text-brand hover:underline">{media.video}</a>
                            <button onClick={() => setMedia((m) => ({ ...m, video: '' }))} className="rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><X className="h-4 w-4" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4 xl:flex-row">
                <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {/* Section header */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900">{BUILDER_SECTIONS[step]}</h2>
                        <p className="mt-0.5 text-sm text-slate-500">{SECTION_DESC[BUILDER_SECTIONS[step]] || `Add the content for this section of your ${config.docType}.`}</p>
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-600">
                      <Check className="h-3.5 w-3.5" /> Saved
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left: suggested copy */}
                    <div className="border-b border-slate-100 p-5 lg:border-b-0 lg:border-r">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-500">
                          <Lightbulb className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Suggested Copy</p>
                          <p className="text-xs text-slate-400">Click a card to drop it into your draft →</p>
                        </div>
                      </div>

                      {/* Sub-topic dropdown */}
                      <div className="relative mt-4">
                        <button
                          onClick={() => setCatOpen((o) => !o)}
                          className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                        >
                          {curGroup.title}
                          <span className="flex items-center gap-3 text-slate-400">
                            <span>{curGroup.cards.length}</span>
                            {catOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </span>
                        </button>
                        {catOpen && (
                          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                            {groups.map((g, i) => (
                              <button
                                key={g.title}
                                onClick={() => { setCopyCat(i); setCatOpen(false) }}
                                className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition ${i === copyCat ? 'bg-orange-50 font-bold text-brand' : 'text-slate-600 hover:bg-slate-50'}`}
                              >
                                <span className="flex items-center gap-2">
                                  {i === copyCat && <Check className="h-4 w-4" />}
                                  {g.title}
                                </span>
                                <span className="text-slate-400">{g.cards.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Cards */}
                      <div className="scrollbar-slim mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
                        {curGroup.cards.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => insertCard(c)}
                            className="group flex w-full gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-orange-300 hover:bg-orange-50/30"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                              <Plus className="h-4 w-4" />
                            </span>
                            <span className="text-sm leading-relaxed text-slate-600">
                              <CopyText text={c} fill={copyFill} />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right: your draft */}
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                          <Pencil className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Your Draft</p>
                          <p className="text-xs text-slate-400">Edit freely — changes save automatically</p>
                        </div>
                      </div>

                      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                        {/* Toolbar */}
                        <div className="flex items-center gap-0.5 border-b border-slate-100 bg-slate-50/60 px-2 py-1.5">
                          {[
                            { icon: Bold, cmd: 'bold' }, { icon: Italic, cmd: 'italic' }, { icon: Underline, cmd: 'underline' },
                          ].map(({ icon: I, cmd }) => (
                            <button key={cmd} onClick={() => execCmd(cmd)} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><I className="h-4 w-4" /></button>
                          ))}
                          <span className="mx-1 h-5 w-px bg-slate-200" />
                          <button onClick={() => execCmd('insertUnorderedList')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><List className="h-4 w-4" /></button>
                          <button onClick={() => execCmd('insertOrderedList')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><ListOrdered className="h-4 w-4" /></button>
                          <button onClick={addLink} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><Link2 className="h-4 w-4" /></button>
                          <span className="mx-1 h-5 w-px bg-slate-200" />
                          <button onClick={() => execCmd('undo')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><Undo2 className="h-4 w-4" /></button>
                          <button onClick={() => execCmd('redo')} className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"><Redo2 className="h-4 w-4" /></button>
                          <span className="ml-auto pr-1 text-xs font-medium text-slate-400">{charCount}/{charLimit}</span>
                        </div>
                        {/* Editable area */}
                        <div className="relative">
                          <div
                            ref={draftRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={saveDraft}
                            className="scrollbar-slim min-h-[240px] max-h-[360px] overflow-y-auto p-4 text-sm leading-relaxed text-slate-700 outline-none [&_a]:text-brand [&_a]:underline"
                          />
                          {charCount === 0 && (
                            <span className="pointer-events-none absolute left-4 top-4 text-sm text-slate-400">
                              Click a suggested card on the left, or start typing your own content…
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics side panel (Investment Highlights only) */}
                {isInvest && (
                  <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white shadow-sm xl:w-80">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">Key Metrics</p>
                          <p className="text-xs text-slate-400">Edit metrics for sidebar</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 pt-3">
                      <div className="relative">
                        <button onClick={() => setLibOpen((o) => !o)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                          <Library className="h-3.5 w-3.5" /> Add from Library
                        </button>
                        {libOpen && (
                          <div className="absolute z-30 mt-1 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                            {/* Search */}
                            <div className="p-2">
                              <div className="relative">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                  value={libSearch}
                                  onChange={(e) => setLibSearch(e.target.value)}
                                  placeholder="Search metrics..."
                                  className="w-full rounded-lg border border-orange-300 bg-white py-1.5 pl-8 pr-2 text-xs outline-none focus:ring-2 focus:ring-orange-100"
                                />
                              </div>
                            </div>
                            {/* Category tabs (slider) */}
                            <div className="flex items-center border-b border-slate-100">
                              <button onClick={() => scrollTabs(-1)} className="shrink-0 px-1 py-1.5 text-slate-400 transition hover:text-slate-700"><ChevronLeft className="h-3.5 w-3.5" /></button>
                              <div ref={tabStripRef} className="scrollbar-slim flex flex-1 gap-3 overflow-x-auto px-1 py-1.5">
                                {METRIC_CATS.map((c) => (
                                  <button
                                    key={c}
                                    onClick={() => setLibCat(c)}
                                    className={`shrink-0 border-b-2 pb-1 text-[11px] font-bold uppercase tracking-wide transition ${libCat === c && !libSearch.trim() ? 'border-brand text-brand' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                  >
                                    {c}
                                  </button>
                                ))}
                              </div>
                              <button onClick={() => scrollTabs(1)} className="shrink-0 px-1 py-1.5 text-slate-400 transition hover:text-slate-700"><ChevronRight className="h-3.5 w-3.5" /></button>
                            </div>
                            {/* Results */}
                            <div className="scrollbar-slim max-h-56 overflow-y-auto p-1">
                              {libResults.length === 0 ? (
                                <p className="py-6 text-center text-xs italic text-slate-400">No metrics found</p>
                              ) : (
                                libResults.map((m) => (
                                  <button
                                    key={m.name}
                                    onClick={() => { addMetric(m.name, '', m.icon, true); setLibOpen(false); setLibSearch('') }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-orange-50/50"
                                  >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                      <MetricIcon name={m.icon} className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-slate-700">{m.name}</p>
                                      <p className="truncate text-[11px] text-slate-400">{m.desc}</p>
                                    </div>
                                    <Plus className="h-4 w-4 shrink-0 text-brand" />
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <button onClick={openMetricForm} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                        <Plus className="h-3.5 w-3.5" /> Custom Metric
                      </button>
                    </div>

                    {/* Create Custom Metric form */}
                    {metricForm.open && (
                      <div className="mx-4 mt-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Create Custom Metric</p>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <button
                              onClick={() => setIconPickerOpen((o) => !o)}
                              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-orange-300 hover:text-brand"
                              title="Choose icon"
                            >
                              <MetricIcon name={metricForm.icon} className="h-5 w-5" />
                            </button>
                            {iconPickerOpen && (
                              <div className="absolute z-40 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                                <div className="grid grid-cols-6 gap-1">
                                  {ICON_NAMES.map((n) => (
                                    <button
                                      key={n}
                                      onClick={() => { setMetricForm((mf) => ({ ...mf, icon: n })); setIconPickerOpen(false) }}
                                      className={`flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-orange-50 ${metricForm.icon === n ? 'bg-orange-100 text-brand ring-1 ring-orange-300' : 'text-slate-500'}`}
                                      title={n}
                                    >
                                      <MetricIcon name={n} className="h-4 w-4" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <input
                            autoFocus
                            value={metricForm.name}
                            onChange={(e) => setMetricForm((mf) => ({ ...mf, name: e.target.value }))}
                            placeholder="Metric name"
                            className={`${inputCls} h-10 flex-1`}
                          />
                        </div>
                        <input
                          value={metricForm.value}
                          onChange={(e) => setMetricForm((mf) => ({ ...mf, value: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && submitMetricForm()}
                          placeholder="Value (e.g. $500,000)"
                          className={`${inputCls} mt-2 h-10 w-full`}
                        />
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button onClick={() => { setMetricForm({ open: false, icon: 'DollarSign', name: '', value: '' }); setIconPickerOpen(false) }} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800">
                            Cancel
                          </button>
                          <button onClick={submitMetricForm} disabled={!metricForm.name.trim()} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-40">
                            Add Metric
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="scrollbar-slim mt-3 max-h-[460px] overflow-y-auto px-4 pb-4">
                      {/* Calculated */}
                      <div className="mb-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-brand">
                          <Zap className="h-3.5 w-3.5" /> Calculated
                        </span>
                        <span className="text-[11px] text-slate-400">Auto-updated</span>
                      </div>
                      <div className="mb-3 flex gap-2 rounded-lg bg-blue-50/70 p-2.5 text-[11px] leading-snug text-slate-500">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                        <span>These auto-fill once you complete the <b className="text-slate-600">Financials</b> and <b className="text-slate-600">Rent Roll</b> steps.</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {orderedCalc.map((m, i) => {
                          const hidden = form.calcHidden?.[m.label]
                          return (
                            <div key={m.label} className={`group flex items-center gap-3 py-2.5 ${hidden ? 'opacity-40' : ''}`}>
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                                <m.icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm text-slate-500">{m.label}</p>
                                <p className={`text-sm font-bold ${m.value ? 'text-slate-900' : 'text-slate-300'}`}>{m.value || '—'}</p>
                              </div>
                              <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                                <button onClick={() => moveCalc(m.label, -1)} disabled={i === 0} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                                <button onClick={() => moveCalc(m.label, 1)} disabled={i === orderedCalc.length - 1} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                                <button onClick={() => toggleCalcHidden(m.label)} className="rounded p-1 text-slate-400 hover:bg-slate-100" title={hidden ? 'Show' : 'Hide'}>{hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Additional (custom) */}
                      {metrics.length > 0 && (
                        <>
                          <div className="mb-1 mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            <Pencil className="h-3.5 w-3.5" /> Additional Metrics
                          </div>
                          <div className="divide-y divide-slate-100">
                            {metrics.map((m, i) => (
                              <div key={m.id} className={`group py-2.5 ${m.hidden ? 'opacity-40' : ''}`}>
                                {m.editing ? (
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <div className="relative">
                                        <button
                                          onClick={() => setEditIconFor((id) => (id === m.id ? null : m.id))}
                                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-orange-300 hover:text-brand"
                                          title="Choose icon"
                                        >
                                          <MetricIcon name={m.icon} className="h-5 w-5" />
                                        </button>
                                        {editIconFor === m.id && (
                                          <div className="absolute z-40 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                                            <div className="grid grid-cols-6 gap-1">
                                              {ICON_NAMES.map((n) => (
                                                <button
                                                  key={n}
                                                  onClick={() => { updMetric(m.id, 'icon', n); setEditIconFor(null) }}
                                                  className={`flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-orange-50 ${m.icon === n ? 'bg-orange-100 text-brand ring-1 ring-orange-300' : 'text-slate-500'}`}
                                                  title={n}
                                                >
                                                  <MetricIcon name={n} className="h-4 w-4" />
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <input autoFocus value={m.label} onChange={(e) => updMetric(m.id, 'label', e.target.value)} placeholder="Metric name" className={`${inputCls} h-10 flex-1`} />
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                      <input
                                        value={m.value}
                                        onChange={(e) => updMetric(m.id, 'value', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && updMetric(m.id, 'editing', false)}
                                        placeholder="Value (e.g. $500,000)"
                                        className={`${inputCls} h-10 flex-1`}
                                      />
                                      <button onClick={() => updMetric(m.id, 'editing', false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-white shadow-sm transition hover:bg-orange-600"><Check className="h-4 w-4" /></button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                      <MetricIcon name={m.icon} className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm text-slate-500">{m.label || 'Untitled'}</p>
                                      <p className={`text-sm font-bold ${m.value ? 'text-slate-900' : 'italic text-slate-300'}`}>{m.value || 'No value'}</p>
                                    </div>
                                    <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                                      <button onClick={() => moveMetric(m.id, -1)} disabled={i === 0} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                                      <button onClick={() => moveMetric(m.id, 1)} disabled={i === metrics.length - 1} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                                      <button onClick={() => updMetric(m.id, 'editing', true)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand"><Pencil className="h-3.5 w-3.5" /></button>
                                      <button onClick={() => updMetric(m.id, 'hidden', !m.hidden)} className="rounded p-1 text-slate-400 hover:bg-slate-100">{m.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                                      <button onClick={() => delMetric(m.id)} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500"><X className="h-3.5 w-3.5" /></button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      <p className="mt-4 text-center text-[11px] text-slate-400">Appears on the Investment Highlights page sidebar.</p>
                    </div>
                  </aside>
                )}

                {/* Accessibility side panel (Location Highlights only) */}
                {isLocation && (
                  <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white shadow-sm xl:w-80">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 p-4">
                      <div className="flex items-start gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                          <Navigation className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">Accessibility</p>
                          <p className="text-xs text-slate-400">Transit, airports &amp; highways</p>
                        </div>
                      </div>
                      <button onClick={refreshAccess} disabled={accessLoading} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand transition hover:underline disabled:opacity-50">
                        <RefreshCw className={`h-3.5 w-3.5 ${accessLoading ? 'animate-spin' : ''}`} /> Refresh
                      </button>
                    </div>

                    <div className="scrollbar-slim max-h-[480px] overflow-y-auto p-4">
                      {ACCESS_SECTIONS.map((sec) => {
                        const items = accessItems[sec.cat] || []
                        const toneBtn = sec.tone === 'emerald' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : sec.tone === 'blue' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        return (
                          <div key={sec.cat} className="mb-4">
                            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                              <sec.icon className="h-3.5 w-3.5" /> {sec.label}
                            </div>
                            {items.length ? (
                              <div className="space-y-1">
                                {items.map((it) => (
                                  <div key={it.id} className="group flex items-center justify-between gap-2 text-sm">
                                    <span className="truncate text-slate-700">{it.name}</span>
                                    <span className="flex shrink-0 items-center gap-1.5">
                                      {it.dist != null && <span className="text-slate-400">{it.dist.toFixed(1)} mi</span>}
                                      <button onClick={() => delAccessItem(sec.cat, it.id)} className="text-rose-400 opacity-0 transition hover:text-rose-600 group-hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm italic text-slate-400">{accessLoading ? 'Searching…' : 'None found nearby'}</p>
                            )}
                            {addForm.cat === sec.cat ? (
                              <div className="mt-2 flex items-center gap-1">
                                <input autoFocus value={addForm.name} onChange={(e) => setAddForm((a) => ({ ...a, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submitAdd()} placeholder="Name" className={`${inputCls} h-8 flex-1`} />
                                <input value={addForm.dist} onChange={(e) => setAddForm((a) => ({ ...a, dist: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submitAdd()} placeholder="mi" className={`${inputCls} h-8 w-12`} />
                                <button onClick={submitAdd} className="px-2 text-xs font-bold text-brand transition hover:underline">Add</button>
                              </div>
                            ) : (
                              <button onClick={() => openAdd(sec.cat)} className={`mt-2 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${toneBtn}`}>
                                <Plus className="h-3.5 w-3.5" /> {sec.add}
                              </button>
                            )}
                          </div>
                        )
                      })}

                      <p className="mt-1 border-t border-slate-100 pt-2 text-[11px] text-slate-400">Appears on highlights pages in your document.</p>

                      {/* Location card */}
                      <div className="mb-1.5 mt-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        <MapPin className="h-3.5 w-3.5" /> Location Card
                      </div>
                      <p className="mb-2 text-[11px] leading-snug text-slate-400">Shown beside the map on the Location Highlights page. Blank fields use the property record; coordinates stay automatic.</p>
                      <div className="space-y-2">
                        <div>
                          <label className="mb-0.5 block text-xs font-medium text-slate-500">Address</label>
                          <input value={form.locCard?.address ?? ''} onChange={(e) => updLc('address', e.target.value)} className={`${inputCls} h-9`} />
                        </div>
                        <div>
                          <label className="mb-0.5 block text-xs font-medium text-slate-500">City</label>
                          <input value={form.locCard?.city ?? ''} onChange={(e) => updLc('city', e.target.value)} className={`${inputCls} h-9`} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="mb-0.5 block text-xs font-medium text-slate-500">State</label>
                            <input value={form.locCard?.state ?? ''} onChange={(e) => updLc('state', e.target.value)} className={`${inputCls} h-9`} />
                          </div>
                          <div>
                            <label className="mb-0.5 block text-xs font-medium text-slate-500">Zip Code</label>
                            <input value={form.locCard?.zip ?? ''} onChange={(e) => updLc('zip', e.target.value)} className={`${inputCls} h-9`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </aside>
                )}
                </div>
              )}
            </div>
          </div>

          {/* Footer (hidden while the inline map editor is open — it has its own bar) */}
          {!mapEditor && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
            <button
              onClick={() => {
                if (initial?.reviewMode) {
                  const order = EDIT_SECTIONS.map((s) => s.i)
                  const pos = order.indexOf(step)
                  if (pos > 0) setStep(order[pos - 1]); else setReviewMode(true)
                  return
                }
                step > 0 ? setStep(step - 1) : onExit()
              }}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step >= 1 && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Auto-saved
              </span>
            )}
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {last ? 'Finish & Save' : 'Continue'} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          )}

          {/* Live preview dock — shown from Property Data onward (not on Property Details) */}
          {step >= 1 && !mapEditor && (
            <div className="border-t border-slate-200 bg-white">
              <div className="flex items-center justify-between px-6 py-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-brand" />
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">Live Preview</span>
                  <span className="hidden text-xs text-slate-400 sm:inline">Click any page to open</span>
                </div>
                <button onClick={() => setPreviewOpen((o) => !o)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-800">
                  {previewOpen ? 'Hide' : 'Show'} <ChevronDown className={`h-4 w-4 transition ${previewOpen ? '' : '-rotate-90'}`} />
                </button>
              </div>
              {previewOpen && (
                <div className="scrollbar-slim flex gap-3 overflow-x-auto px-6 pb-3">
                  {PAGES.map((pg, i) => (
                    <button
                      key={pg.key}
                      onClick={() => setViewerIdx(i)}
                      title={`Open ${pg.title}`}
                      className="group relative shrink-0 overflow-hidden rounded-md border border-slate-200 shadow-sm transition hover:ring-2 hover:ring-orange-300"
                    >
                      <ScaledPage scale={0.2}>
                        <BuilderPage pageKey={pg.key} data={previewData} />
                      </ScaledPage>
                      <span className="absolute inset-x-0 bottom-0 bg-slate-900/70 px-1 py-0.5 text-center text-[8px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                        {pg.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Document Sections */}
        <aside className="scrollbar-slim hidden w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-4 lg:block">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="h-4 w-1 rounded bg-brand" /> Document Sections
          </p>
          <p className="mt-1 text-xs text-slate-400">Click any completed section to jump back and edit.</p>
          <div className="mt-3 space-y-1">
            {initial?.reviewMode ? (
              <>
                {EDIT_SECTIONS.map((sec, n) => {
                  const isActive = sec.i === step
                  return (
                    <button key={sec.i} onClick={() => setStep(sec.i)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${isActive ? 'bg-orange-50 text-brand' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isActive ? 'bg-brand text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                        {isActive ? n + 1 : <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0"><span className="block truncate">{sec.label}</span>{isActive && <span className="text-[11px] font-normal text-brand">Editing</span>}</span>
                    </button>
                  )
                })}
                <button onClick={() => setReviewMode(true)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400">{EDIT_SECTIONS.length + 1}</span>
                  <span className="min-w-0"><span className="block truncate">Review &amp; Customize</span></span>
                </button>
              </>
            ) : BUILDER_SECTIONS.map((s, i) => {
              const isActive = i === step
              const isDone = done[i]
              // Only completed sections (or the current one) can be jumped to.
              const canJump = isActive || isDone
              // Steps 9/10 are relabelled based on the chosen financial scope.
              const label = i === 8 && finType === 'Cap Rate & NOI' ? 'Cap Rate & NOI' : i === 9 && finType === 'Skip Financials' ? 'Skip Financials' : s
              return (
                <button
                  key={s}
                  onClick={() => canJump && setStep(i)}
                  disabled={!canJump}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    isActive ? 'bg-orange-50 text-brand' : canJump ? 'text-slate-600 hover:bg-slate-50' : 'cursor-not-allowed text-slate-300'
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isActive ? 'bg-brand text-white' : isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'
                  }`}>
                    {isDone && !isActive ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate">{label}</span>
                    {isActive && <span className="text-[11px] font-normal text-brand">Editing</span>}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>
      </div>
      </div>

      {/* "New Property — Let's Add It!" confirmation before the map picker */}
      {addrPopupOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setAddrPopupOpen(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 px-6 pt-5">
              <h3 className="text-lg font-extrabold text-slate-900">New Property — Let&apos;s Add It!</h3>
              <button onClick={() => setAddrPopupOpen(false)} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 pb-5 pt-3">
              <p className="text-sm font-medium text-brand">
                We don&apos;t have this address in our database yet, but no worries! You can still build a great marketing package.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div className="flex items-start gap-2 text-sm text-slate-600"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Automated maps generate instantly</div>
                <div className="flex items-start gap-2 text-sm text-slate-600"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Demographics included</div>
                <div className="flex items-start gap-2 text-sm text-slate-600"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> City insights included</div>
                <div className="flex items-start gap-2 text-sm text-slate-600"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> You&apos;ll need to confirm a few property details</div>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setAddrPopupOpen(false)}
                  className="whitespace-nowrap rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Try a different address
                </button>
                <button
                  onClick={() => { setAddrPopupOpen(false); setMapOpen(true) }}
                  className="whitespace-nowrap rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                >
                  Continue with this address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <LocationPickerModal
        open={mapOpen}
        initial={form.lat ? [form.lat, form.lng] : null}
        address={fullAddress || docName}
        sub={[form.city, US_STATE_ABBR[form.state] || form.state].filter(Boolean).join(', ')}
        query={form.displayAddress || fullAddress || form.street}
        onConfirm={confirmLocation}
        onClose={() => setMapOpen(false)}
      />

      {!GMAPS_KEY && (
        <MapEditorModal
          open={!!mapEditor}
          map={mapEditor}
          onSave={saveMap}
          onClose={() => setMapEditor(null)}
        />
      )}

      <PageViewerModal
        index={viewerIdx}
        data={previewData}
        onClose={() => setViewerIdx(null)}
        onIndex={setViewerIdx}
      />

      {/* Create Multi-Image Page modal */}
      {galleryModal.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setGalleryModal((g) => ({ ...g, open: false }))}>
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-extrabold text-slate-900">Create Multi-Image Page</h3>
              <button onClick={() => setGalleryModal((g) => ({ ...g, open: false }))} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="scrollbar-slim max-h-[70vh] overflow-y-auto p-5">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Page Title <span className="font-normal text-slate-400">(Optional)</span></label>
              <input value={galleryModal.title} onChange={(e) => setGalleryModal((g) => ({ ...g, title: e.target.value }))} placeholder="e.g. Exterior Views, Interior Details…" className={inputCls} />

              <p className="mb-1.5 mt-5 text-sm font-semibold text-slate-700">Layout Style</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { key: 'Grid', desc: 'All photos at equal size in a clean, uniform layout' },
                  { key: 'Masonry', desc: 'Varied sizes for a dynamic, editorial look — great for mixing landscape and portrait' },
                ].map((o) => (
                  <button
                    key={o.key}
                    onClick={() => setGalleryModal((g) => ({ ...g, layout: o.key }))}
                    className={`rounded-xl border-2 p-3 text-left transition ${galleryModal.layout === o.key ? 'border-orange-300 bg-orange-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <p className={`text-sm font-bold ${galleryModal.layout === o.key ? 'text-brand' : 'text-slate-800'}`}>{o.key}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{o.desc}</p>
                  </button>
                ))}
              </div>

              <p className="mb-1.5 mt-5 text-sm font-semibold text-slate-700">Upload Images <span className="font-normal text-slate-400">(2–8 images)</span></p>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center transition hover:border-orange-300">
                <Upload className="h-7 w-7 text-slate-400" />
                <p className="text-sm text-slate-500">Drop images here or click to browse</p>
                <p className="text-xs text-slate-400">{galleryModal.images.length}/8 images selected</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addGalleryImages(e.target.files)} />
              </label>
              {galleryModal.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {galleryModal.images.map((im, i) => (
                    <div key={im.id} className="relative">
                      <img src={im.url} alt="" className="h-16 w-16 rounded-md border border-slate-200 object-cover" />
                      <button onClick={() => setGalleryModal((g) => ({ ...g, images: g.images.filter((_, j) => j !== i) }))} className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-400 shadow ring-1 ring-slate-200 hover:text-rose-500"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
              <span className="text-xs text-slate-400">{galleryModal.images.length < 2 ? 'Select at least 2 images' : `${galleryModal.images.length} images ready`}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setGalleryModal((g) => ({ ...g, open: false }))} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                <button onClick={createGallery} disabled={galleryModal.images.length < 2} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-40">Create Page</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Tenant / Vacancy modal */}
      {tenantModal && (() => {
        const t = tenantModal
        const rent = computeRent(t.rent, t.rentPer, t.sf)
        const perOpts = ['Per SF / Year', 'Per SF / Month', 'Monthly', 'Annual']
        return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setTenantModal(null)}>
            <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h3 className="text-lg font-extrabold text-slate-900">{t.editId ? (t.mode === 'vacancy' ? 'Edit Vacancy' : 'Edit Tenant') : t.mode === 'vacancy' ? 'New Vacancy' : 'New Tenant'}</h3>
                <button onClick={() => setTenantModal(null)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
              </div>
              <div className="scrollbar-slim flex-1 overflow-y-auto p-5">
                {t.mode === 'vacancy' ? (() => {
                  const ip = computeRent(t.inPlace, t.rentPer, t.sf)
                  const pf = computeRent(t.proForma, t.rentPer, t.sf)
                  return (
                    <>
                      {/* Basic info */}
                      <p className="mb-2 inline-block rounded bg-orange-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">Basic Info</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Unit / Space"><TextInput value={t.unit} onChange={(e) => setTM('unit', e.target.value)} placeholder="e.g. Suite 100" /></Field>
                        <Field label="Unit Type"><TextInput value={t.unitType} onChange={(e) => setTM('unitType', e.target.value)} placeholder="e.g. Retail, 2BR" /></Field>
                        <Field label="Square Feet"><TextInput value={t.sf} onChange={(e) => setTM('sf', e.target.value)} placeholder="e.g. 2500" /></Field>
                      </div>

                      {/* Rent */}
                      <p className="mb-2 mt-5 inline-block rounded bg-orange-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">Rent</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="In-Place"><TextInput value={t.inPlace} onChange={(e) => setTM('inPlace', e.target.value)} placeholder="0.00" /></Field>
                        <Field label="Pro Forma"><TextInput value={t.proForma} onChange={(e) => setTM('proForma', e.target.value)} placeholder="0.00" /></Field>
                        <Field label="Per"><SelectInput value={t.rentPer} onChange={(e) => setTM('rentPer', e.target.value)} options={perOpts} /></Field>
                      </div>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">In-Place</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div><p className="text-[11px] text-slate-400">Annual</p><p className="text-sm font-bold text-slate-800">{money(ip.annual)}</p></div>
                            <div><p className="text-[11px] text-slate-400">Monthly</p><p className="text-sm font-bold text-slate-800">{money(ip.monthly)}</p></div>
                            <div><p className="text-[11px] text-slate-400">Per SF</p><p className="text-sm font-bold text-slate-800">{money(ip.perSf)}</p></div>
                          </div>
                        </div>
                        <div className="rounded-lg bg-orange-50/60 p-3">
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-brand">Pro Forma</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div><p className="text-[11px] text-slate-400">Annual</p><p className="text-sm font-bold text-slate-800">{money(pf.annual)}</p></div>
                            <div><p className="text-[11px] text-slate-400">Monthly</p><p className="text-sm font-bold text-slate-800">{money(pf.monthly)}</p></div>
                            <div><p className="text-[11px] text-slate-400">Per SF</p><p className="text-sm font-bold text-slate-800">{money(pf.perSf)}</p></div>
                          </div>
                        </div>
                      </div>

                      {/* Expense reimbursement */}
                      <p className="mb-2 mt-5 inline-block rounded bg-orange-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">Expense Reimbursement</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="In-Place"><TextInput value={t.reimbInPlace} onChange={(e) => setTM('reimbInPlace', e.target.value)} placeholder="0.00" /></Field>
                        <Field label="Pro Forma"><TextInput value={t.reimbProForma} onChange={(e) => setTM('reimbProForma', e.target.value)} placeholder="0.00" /></Field>
                        <Field label="Per"><SelectInput value={t.reimbPer} onChange={(e) => setTM('reimbPer', e.target.value)} options={perOpts} /></Field>
                      </div>

                      {/* Notes */}
                      <p className="mb-2 mt-5 inline-block rounded bg-orange-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">Notes</p>
                      <textarea value={t.notes} onChange={(e) => setTM('notes', e.target.value.slice(0, 500))} rows={3} placeholder="Optional notes…" className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                      <p className="mt-1 text-right text-xs text-slate-400">{t.notes.length}/500</p>
                    </>
                  )
                })() : (
                <>
                {/* Basic info */}
                <p className="mb-2 inline-block rounded bg-orange-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">Basic Info</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Unit / Space"><TextInput value={t.unit} onChange={(e) => setTM('unit', e.target.value)} placeholder="e.g. Suite 100" /></Field>
                  <Field label="Tenant Name"><TextInput value={t.tenant} onChange={(e) => setTM('tenant', e.target.value)} placeholder="Tenant name" /></Field>
                  <Field label="Square Feet"><TextInput value={t.sf} onChange={(e) => setTM('sf', e.target.value)} placeholder="e.g. 2500" /></Field>
                </div>

                {/* Base rent */}
                <p className="mb-2 mt-5 inline-block rounded bg-orange-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">Base Rent</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Rent"><TextInput value={t.rent} onChange={(e) => setTM('rent', e.target.value)} placeholder="0.00" /></Field>
                  <Field label="Rent Per"><SelectInput value={t.rentPer} onChange={(e) => setTM('rentPer', e.target.value)} options={perOpts} /></Field>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3">
                  <div><p className="text-[11px] text-slate-400">Annual</p><p className="font-bold text-slate-800">{money(rent.annual)}</p></div>
                  <div><p className="text-[11px] text-slate-400">Monthly</p><p className="font-bold text-slate-800">{money(rent.monthly)}</p></div>
                  <div><p className="text-[11px] text-slate-400">Per SF</p><p className="font-bold text-slate-800">{money(rent.perSf)}</p></div>
                </div>

                {/* Rent increases */}
                <p className="mb-2 mt-5 inline-block rounded bg-orange-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">Rent Increases</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[{ k: 'Annual increase', icon: TrendingUp, d: 'Same % every year, compounding' }, { k: 'Custom schedule', icon: Calendar, d: 'Steps in specific years, flat in between' }].map((o) => (
                    <button key={o.k} onClick={() => setTM('incMode', o.k)} className={`flex items-start gap-2 rounded-xl border-2 p-3 text-left transition ${t.incMode === o.k ? 'border-orange-400 bg-orange-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <o.icon className={`mt-0.5 h-4 w-4 shrink-0 ${t.incMode === o.k ? 'text-brand' : 'text-slate-400'}`} />
                      <div><p className="text-sm font-bold text-slate-800">{o.k}</p><p className="text-xs text-slate-500">{o.d}</p></div>
                    </button>
                  ))}
                </div>
                {t.incMode === 'Annual increase' && (
                  <div className="mt-3">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Increase per year</label>
                    <div className="flex items-center gap-2">
                      <input value={t.incPerYear} onChange={(e) => setTM('incPerYear', e.target.value)} placeholder="0" className={`${inputCls} max-w-[140px]`} />
                      <span className="text-sm text-slate-400">%/yr</span>
                    </div>
                  </div>
                )}

                {/* Expense reimbursement */}
                <p className="mb-2 mt-5 inline-block rounded bg-orange-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">Expense Reimbursement</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Amount"><TextInput value={t.reimbAmount} onChange={(e) => setTM('reimbAmount', e.target.value)} placeholder="0.00" /></Field>
                  <Field label="Per"><SelectInput value={t.reimbPer} onChange={(e) => setTM('reimbPer', e.target.value)} options={perOpts} /></Field>
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Increase per year</label>
                  <div className="flex items-center gap-2">
                    <input value={t.reimbInc} onChange={(e) => setTM('reimbInc', e.target.value)} placeholder="0" className={`${inputCls} max-w-[140px]`} />
                    <span className="text-sm text-slate-400">%/yr</span>
                  </div>
                </div>

                {/* Lease details */}
                <p className="mb-2 mt-5 inline-block rounded bg-orange-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">Lease Details</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Lease Type"><SelectInput value={t.leaseType} onChange={(e) => setTM('leaseType', e.target.value)} options={['Select...', 'NNN', 'Modified Gross', 'Full Service', 'Gross', 'Ground Lease']} /></Field>
                  <Field label="Lease Start"><input type="date" value={t.leaseStart} onChange={(e) => setTM('leaseStart', e.target.value)} className={inputCls} /></Field>
                  <Field label="Lease End"><input type="date" value={t.leaseEnd} onChange={(e) => setTM('leaseEnd', e.target.value)} className={inputCls} /></Field>
                </div>

                {/* Notes */}
                <p className="mb-2 mt-5 inline-block rounded bg-orange-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">Notes</p>
                <textarea value={t.notes} onChange={(e) => setTM('notes', e.target.value.slice(0, 500))} rows={3} placeholder="Optional notes…" className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                <p className="mt-1 text-right text-xs text-slate-400">{t.notes.length}/500</p>
                </>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
                <button onClick={() => setTenantModal(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                <button onClick={submitTenant} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">{t.editId ? 'Save Changes' : t.mode === 'vacancy' ? 'Add Vacancy' : 'Add Tenant'}</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Delete tenant/vacancy confirm */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setEditProfileOpen(false)}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-extrabold text-slate-900">Edit Profile?</h3>
              <button onClick={() => setEditProfileOpen(false)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <p className="px-5 py-4 text-sm text-slate-500">This will save your current document progress and redirect you to your profile settings page. You can return to this document afterwards.</p>
            <div className="flex items-center justify-end gap-2 px-5 pb-5">
              <button onClick={() => setEditProfileOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Keep Editing Here</button>
              <button onClick={() => { setEditProfileOpen(false); notify('Progress saved — opening profile settings'); onSave(form, step, false) }} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">Go to Profile</button>
            </div>
          </div>
        </div>
      )}

      {mapDel && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setMapDel(null)}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-extrabold text-slate-900">Delete this map?</h3>
              <button onClick={() => setMapDel(null)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <p className="px-5 py-4 text-sm text-slate-500">{mapDel.title ? `"${mapDel.title}"` : 'This map'} will be permanently removed from your document. This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-2 px-5 pb-5">
              <button onClick={() => setMapDel(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
              <button onClick={() => { delMap(mapDel.id); setMapDel(null); notify('Map deleted') }} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {rentDel && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setRentDel(null)}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500"><Trash2 className="h-5 w-5" /></div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete this comparable?</h3>
                <p className="mt-1 text-sm text-slate-400">{rentDel.propertyName ? `"${rentDel.propertyName}" will be permanently removed.` : 'This comparable will be permanently removed.'} This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setRentDel(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
              <button onClick={() => { delRent(rentDel.id); setRentDel(null); notify('Comparable deleted') }} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {compDel && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setCompDel(null)}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500"><Trash2 className="h-5 w-5" /></div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete this comparable?</h3>
                <p className="mt-1 text-sm text-slate-400">{compDel.propertyName ? `"${compDel.propertyName}" will be permanently removed.` : 'This comparable will be permanently removed.'} This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setCompDel(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
              <button onClick={() => { delComp(compDel.id); setCompDel(null); notify('Comparable deleted') }} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteRow && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteRow(null)}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500"><Trash2 className="h-5 w-5" /></div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete this {deleteRow.kind === 'vacancy' ? 'vacancy' : 'tenant'}?</h3>
                <p className="mt-1 text-sm text-slate-400">This action cannot be undone. All data for this entry will be permanently removed.</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setDeleteRow(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
              <button onClick={() => { delRentRow(deleteRow.id); setDeleteRow(null); notify('Deleted') }} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Rent Roll Type confirm */}
      {rrConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setRrConfirm(null)}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-extrabold text-slate-900">Change Rent Roll Type?</h3>
              <button onClick={() => setRrConfirm(null)} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex gap-3 p-5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-sm text-slate-500">Changing the rent roll type will adjust the available columns. Your existing data will be preserved where possible — only fields that don't exist in the new type will be cleared.</p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
              <button onClick={() => setRrConfirm(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
              <button onClick={() => { setForm((f) => ({ ...f, rrSel: rrConfirm, rrChosen: true })); setRrConfirm(null) }} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">Change Type</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Financial Scope confirm */}
      {scopeConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setScopeConfirm(null)}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-extrabold text-slate-900">Change Financial Scope?</h3>
              <button onClick={() => setScopeConfirm(null)} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex gap-3 p-5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm text-slate-700">Switching to <b className="font-bold">{scopeConfirm}</b> will change which wizard steps are active.</p>
                <p className="mt-2 text-sm text-slate-400">Your existing data is preserved and accessible if you switch back.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
              <button onClick={() => setScopeConfirm(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
              <button
                onClick={() => { setForm((f) => ({ ...f, finType: scopeConfirm })); notify(`Financial scope changed to ${scopeConfirm}`); const target = scopeConfirm === 'Cap Rate & NOI' ? 8 : scopeConfirm === 'Skip Financials' ? 9 : step + 1; setScopeConfirm(null); setDone((d) => ({ ...d, [step]: true })); setStep(target) }}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                Change Scope
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Rental Comparable modal */}
      {rentModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setRentModal(null)}>
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-extrabold text-slate-900">{rentModal.id ? 'Edit Rental Comparable' : 'Add Rental Comparable'}</h3>
              <button onClick={() => setRentModal(null)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="scrollbar-slim grid flex-1 gap-x-8 gap-y-4 overflow-y-auto p-5 md:grid-cols-2">
              {/* Left */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Photo</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-20 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-slate-400">
                    {rentModal.photo ? <img src={rentModal.photo} alt="" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6" />}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                    <Upload className="h-4 w-4" /> Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => { if (!e.target.files?.length) return; const [img] = await readFiles([e.target.files[0]]); setRM('photo', img.url) }} />
                  </label>
                </div>

                <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Property Information</p>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Property Name</label>
                <input value={rentModal.propertyName} onChange={(e) => setRM('propertyName', e.target.value)} placeholder="e.g. Sunset Plaza" className={inputCls} />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Street Address</label>
                    <input value={rentModal.street} onChange={(e) => setRM('street', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">City</label>
                    <input value={rentModal.city} onChange={(e) => setRM('city', e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">State</label>
                    <input value={rentModal.state} onChange={(e) => setRM('state', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Zip Code</label>
                    <input value={rentModal.zip} onChange={(e) => setRM('zip', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Year Built</label>
                    <input value={rentModal.yearBuilt} onChange={(e) => setRM('yearBuilt', e.target.value)} placeholder="e.g. 2005" className={inputCls} />
                  </div>
                </div>
                <label className="mb-1 mt-3 block text-sm font-semibold text-slate-700">Description</label>
                <textarea value={rentModal.description} onChange={(e) => setRM('description', e.target.value)} rows={3} placeholder="Brief description of the comparable…" className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>

              {/* Right */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Rental Details</p>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Market Rent ($/SF)</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <input value={rentModal.marketRent} onChange={(e) => setRM('marketRent', e.target.value)} placeholder="0" className={`${inputCls} pl-6`} />
                </div>

                <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Building Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Building Size (SF)</label>
                    <input value={rentModal.buildingSf} onChange={(e) => setRM('buildingSf', e.target.value)} placeholder="0" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700"># of Tenants</label>
                    <input value={rentModal.tenants} onChange={(e) => setRM('tenants', e.target.value)} placeholder="0" className={inputCls} />
                  </div>
                </div>
                <label className="mb-1 mt-3 block text-sm font-semibold text-slate-700"># of Bedrooms</label>
                <input value={rentModal.bedrooms} onChange={(e) => setRM('bedrooms', e.target.value)} placeholder="e.g. 70" className={inputCls} />
                <label className="mb-1 mt-3 block text-sm font-semibold text-slate-700">Occupancy %</label>
                <input value={rentModal.occupancy} onChange={(e) => setRM('occupancy', e.target.value)} placeholder="0" className={inputCls} />
                <label className="mb-1 mt-3 block text-sm font-semibold text-slate-700">Unit Mix</label>
                <input value={rentModal.unitMix} onChange={(e) => setRM('unitMix', e.target.value)} placeholder="e.g. 10 Studio; 4 One Bed; 1 Commercial" className={inputCls} />

                <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Options</p>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={rentModal.active} onChange={(e) => setRM('active', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-orange-300" /> Property is currently active
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
              <button onClick={() => setRentModal(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900">Cancel</button>
              <button onClick={submitRent} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">{rentModal.id ? 'Save Changes' : 'Add Comparable'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Sales Comparable modal */}
      {compModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setCompModal(null)}>
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-extrabold text-slate-900">{compModal.id ? 'Edit Sales Comparable' : 'Add Sales Comparable'}</h3>
              <button onClick={() => setCompModal(null)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="scrollbar-slim grid flex-1 gap-x-8 gap-y-4 overflow-y-auto p-5 md:grid-cols-2">
              {/* Left */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Photo</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-20 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-slate-400">
                    {compModal.photo ? <img src={compModal.photo} alt="" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6" />}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                    <Upload className="h-4 w-4" /> Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => { if (!e.target.files?.length) return; const [img] = await readFiles([e.target.files[0]]); setCM('photo', img.url) }} />
                  </label>
                </div>

                <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Property Information</p>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Property Name</label>
                <input value={compModal.propertyName} onChange={(e) => setCM('propertyName', e.target.value)} placeholder="e.g. Sunset Plaza" className={inputCls} />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Street Address</label>
                    <input value={compModal.street} onChange={(e) => setCM('street', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">City</label>
                    <input value={compModal.city} onChange={(e) => setCM('city', e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">State</label>
                    <input value={compModal.state} onChange={(e) => setCM('state', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Zip Code</label>
                    <input value={compModal.zip} onChange={(e) => setCM('zip', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Year Built</label>
                    <input value={compModal.yearBuilt} onChange={(e) => setCM('yearBuilt', e.target.value)} placeholder="e.g. 2005" className={inputCls} />
                  </div>
                </div>
                <label className="mb-1 mt-3 block text-sm font-semibold text-slate-700">Description</label>
                <textarea value={compModal.description} onChange={(e) => setCM('description', e.target.value)} rows={3} placeholder="Brief description of the comparable…" className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>

              {/* Right */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Sale Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Sale Price</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                      <input value={compModal.salePrice} onChange={(e) => setCM('salePrice', e.target.value)} className={`${inputCls} pl-6`} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Sale Date</label>
                    <input type="date" value={compModal.saleDate} onChange={(e) => setCM('saleDate', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Cap Rate %</label>
                    <input value={compModal.capRate} onChange={(e) => setCM('capRate', e.target.value)} placeholder="0" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">NOI</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                      <input value={compModal.noi} onChange={(e) => setCM('noi', e.target.value)} placeholder="0" className={`${inputCls} pl-6`} />
                    </div>
                  </div>
                </div>

                <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Building Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Building Size (SF)</label>
                    <input value={compModal.buildingSf} onChange={(e) => setCM('buildingSf', e.target.value)} placeholder="0" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700"># of Tenants</label>
                    <input value={compModal.tenants} onChange={(e) => setCM('tenants', e.target.value)} placeholder="0" className={inputCls} />
                  </div>
                </div>
                <label className="mb-1 mt-3 block text-sm font-semibold text-slate-700"># of Bedrooms</label>
                <input value={compModal.bedrooms} onChange={(e) => setCM('bedrooms', e.target.value)} placeholder="e.g. 70" className={inputCls} />
                <label className="mb-1 mt-3 block text-sm font-semibold text-slate-700">Occupancy %</label>
                <input value={compModal.occupancy} onChange={(e) => setCM('occupancy', e.target.value)} placeholder="0" className={inputCls} />
                <label className="mb-1 mt-3 block text-sm font-semibold text-slate-700">Unit Mix</label>
                <input value={compModal.unitMix} onChange={(e) => setCM('unitMix', e.target.value)} placeholder="e.g. 10 Studio; 4 One Bed; 1 Commercial" className={inputCls} />

                <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Options</p>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={compModal.hideSaleDate} onChange={(e) => setCM('hideSaleDate', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-orange-300" /> Hide sale date
                </label>
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={compModal.active} onChange={(e) => setCM('active', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-orange-300" /> Property is currently active
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
              <button onClick={() => setCompModal(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900">Cancel</button>
              <button onClick={submitComp} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">{compModal.id ? 'Save Changes' : 'Add Comparable'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Tenant Profile modal */}
      {profileModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setProfileModal(null)}>
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-extrabold text-slate-900">{profileModal.id ? 'Edit Tenant Profile' : 'Add Tenant Profile'}</h3>
              <button onClick={() => setProfileModal(null)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="scrollbar-slim grid flex-1 gap-x-8 gap-y-4 overflow-y-auto p-5 md:grid-cols-2">
              {/* Left: basic info */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Basic Information</p>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Trade Name</label>
                <input value={profileModal.tradeName} onChange={(e) => setPM('tradeName', e.target.value)} placeholder="e.g. Starbucks, Target" className={inputCls} />
                <label className="mb-1 mt-3 block text-sm font-semibold text-slate-700">Industry</label>
                <input value={profileModal.industry} onChange={(e) => setPM('industry', e.target.value)} placeholder="Select or type…" className={inputCls} />
                <div className="mt-3 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <span className="text-xs text-slate-400">{(profileModal.description || '').length}/2000</span>
                </div>
                <textarea value={profileModal.description} onChange={(e) => setPM('description', e.target.value.slice(0, 2000))} rows={4} placeholder="Brief description of the tenant, their business, and relevance to the property…" className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Logo</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-slate-400">
                    {profileModal.logo ? <img src={profileModal.logo} alt="logo" className="h-full w-full object-contain" /> : <Building2 className="h-6 w-6" />}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                    <Upload className="h-4 w-4" /> Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => { if (!e.target.files?.length) return; const [img] = await readFiles([e.target.files[0]]); setPM('logo', img.url) }} />
                  </label>
                </div>
              </div>

              {/* Right: company + lease */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Company Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Year Founded</label>
                    <input value={profileModal.yearFounded} onChange={(e) => setPM('yearFounded', e.target.value)} placeholder="e.g. 1971" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Headquarters</label>
                    <input value={profileModal.hq} onChange={(e) => setPM('hq', e.target.value)} placeholder="e.g. Seattle, WA" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700"># of Locations</label>
                    <input value={profileModal.locations} onChange={(e) => setPM('locations', e.target.value)} placeholder="e.g. 35000" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Website</label>
                    <input value={profileModal.website} onChange={(e) => setPM('website', e.target.value)} placeholder="e.g. starbucks.com" className={inputCls} />
                  </div>
                </div>
                <label className="mb-1 mt-3 block text-sm font-semibold text-slate-700">Credit Rating</label>
                <SelectInput value={profileModal.credit} onChange={(e) => setPM('credit', e.target.value)} options={['Not specified', 'AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'Below B', 'Not rated']} />

                <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Lease Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Square Feet</label>
                    <input value={profileModal.sf} onChange={(e) => setPM('sf', e.target.value)} placeholder="e.g. 12500" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Lease Expiration</label>
                    <input value={profileModal.leaseExp} onChange={(e) => setPM('leaseExp', e.target.value)} placeholder="e.g. Dec 2029" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
              <button onClick={() => setProfileModal(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900">Cancel</button>
              <button onClick={submitProfile} disabled={!(profileModal.tradeName || '').trim()} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-40">{profileModal.id ? 'Save Changes' : 'Add Tenant'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Property Video modal */}
      {videoModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setVideoModal(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-extrabold text-slate-900">Property Video</h3>
              <button onClick={() => setVideoModal(false)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500"><Video className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Property Video <span className="ml-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Optional</span></p>
                    <p className="mt-0.5 text-xs leading-snug text-slate-500">Add a YouTube, Vimeo, or direct video link. We'll show a play badge on the cover, a "View Property Video" link on the Property Summary, and embed the player on your Property Hub page.</p>
                  </div>
                </div>
                <div className="relative mt-3">
                  <ExternalLink className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={videoDraft} onChange={(e) => setVideoDraft(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" className={`${inputCls} pl-9`} />
                </div>
                <p className="mt-2 text-xs text-slate-400">{videoDraft.trim() ? 'Video ready' : 'No video attached'}</p>
              </div>
            </div>
            <div className="flex items-center justify-end border-t border-slate-200 px-5 py-3">
              <button
                onClick={() => { setMedia((m) => ({ ...m, video: videoDraft.trim() })); setVideoModal(false); notify(videoDraft.trim() ? 'Video linked' : 'Video removed') }}
                className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardPage({ packages, setPackages, setListings, globalQuery, createNonce, resume, onResumeHandled, onNavigate, onSignOut, user, can = () => true }) {
  const notify = useToast()
  // Re-render once a minute so the "time ago" labels on cards stay current.
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(id)
  }, [])
  const [subTab, setSubTab] = useState('my')
  const [search, setSearch] = useState('')
  const [docType, setDocType] = useState('All Doc Types')
  const [propType, setPropType] = useState('All Property Types')
  const [status, setStatus] = useState('All Status')
  const [sort, setSort] = useState('Last Modified (Newest)')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [transferTarget, setTransferTarget] = useState(null)

  // "Create Document For" chooser + who the next new doc belongs to.
  const [chooserOpen, setChooserOpen] = useState(false)
  const [newDoc, setNewDoc] = useState({ owner: 'my', assignee: null })

  // Open the create-document flow when triggered from elsewhere (e.g. Listing Hub's "Create New").
  useEffect(() => {
    if (createNonce) setChooserOpen(true)
  }, [createNonce])

  // Full-screen create wizard (Document Type -> Property Type -> Template).
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardDefaults, setWizardDefaults] = useState(null)

  // Document builder (opens after "Get Started").
  const [builderOpen, setBuilderOpen] = useState(false)
  const [builderCfg, setBuilderCfg] = useState(null)
  const [builderInitial, setBuilderInitial] = useState(null) // resume state {form, step}
  const [builderDraftId, setBuilderDraftId] = useState(null) // id of the draft being edited
  const [builderNonce, setBuilderNonce] = useState(0) // forces a fresh builder mount per open

  // Resume an in-progress draft (opened from the Listing Hub).
  useEffect(() => {
    if (resume?.draft) {
      const d = resume.draft
      setBuilderCfg({ docType: d.docType, propertyType: d.propertyType, template: d.template, brandColor: d.brandColor })
      setBuilderInitial({ form: d.form, step: d.step, reviewMode: d.reviewMode })
      setBuilderDraftId(d.id)
      setBuilderNonce((n) => n + 1)
      setBuilderOpen(true)
      onResumeHandled?.()
    }
  }, [resume])

  // Restore an in-progress builder session after a page refresh.
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(BUILDER_SESSION_KEY) || 'null')
      if (s && s.config && s.form) {
        setBuilderCfg(s.config)
        setBuilderInitial({ form: s.form, step: s.step || 0 })
        setBuilderDraftId(s.draftId || null)
        setBuilderNonce((n) => n + 1)
        setBuilderOpen(true)
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Bulk-select mode (toggled by the "Select" button).
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const toggleSelected = (id) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  const exitSelect = () => {
    setSelectMode(false)
    setSelectedIds([])
  }
  const [bulkConfirm, setBulkConfirm] = useState(false)
  const bulkDelete = () => {
    const n = selectedIds.length
    setPackages((list) => list.filter((p) => !selectedIds.includes(p.id)))
    notify(`${n} package(s) deleted`, 'error')
    exitSelect()
    setBulkConfirm(false)
  }

  const effectiveSearch = (globalQuery || search).toLowerCase()

  const filtered = useMemo(() => {
    let list = packages.filter((p) => p.owner === subTab)
    if (effectiveSearch.trim()) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(effectiveSearch) ||
          p.address.toLowerCase().includes(effectiveSearch),
      )
    }
    if (docType !== 'All Doc Types') list = list.filter((p) => p.docType === docType)
    if (propType !== 'All Property Types') list = list.filter((p) => p.propertyType === propType)
    if (status !== 'All Status') list = list.filter((p) => p.status === status)
    if (sort === 'Title A–Z') list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'Title Z–A') list = [...list].sort((a, b) => b.title.localeCompare(a.title))
    if (sort === 'Last Modified (Newest)') list = [...list].sort((a, b) => b.id - a.id)
    if (sort === 'Last Modified (Oldest)') list = [...list].sort((a, b) => a.id - b.id)
    return list
  }, [packages, subTab, effectiveSearch, docType, propType, status, sort])

  // Flow: Create New -> "Create Document For" chooser -> full-screen wizard -> details form.
  const openCreate = () => setChooserOpen(true)
  const proceedFromChooser = ({ owner, assignee }) => {
    setNewDoc({ owner, assignee })
    setChooserOpen(false)
    setWizardOpen(true)
  }
  const finishWizard = ({ docType, propertyType, template, scope, locationKind, brandColor }) => {
    setNewDoc((d) => ({ ...d, template, scope, locationKind, brandColor }))
    setBuilderCfg({ docType, propertyType, template, brandColor })
    setBuilderInitial(null)  // fresh document
    setBuilderDraftId(null)
    setBuilderNonce((n) => n + 1)
    setWizardOpen(false)
    setBuilderOpen(true)
  }

  // Create/update the package + listing from the Document Builder and close it.
  // `finished` = true when the last step was completed; otherwise it's saved as a Draft
  // that can be resumed from the Listing Hub at `step`.
  const saveFromBuilder = (bf, step = 0, finished = false) => {
    const id = builderDraftId || uid()
    const title = (bf.name || '').trim() || 'Untitled Document'
    const address = [bf.street, bf.city, bf.state, bf.zip].filter(Boolean).join(', ') || '—'
    const total = BUILDER_SECTIONS.length
    const progress = finished ? 100 : Math.max(10, Math.round((step / total) * 100))
    const sizePoint = (bf.dataPoints || []).find(
      (p) => /building sf|gla|rentable sf|size/i.test(p.label) && p.value,
    )
    // Everything needed to reopen the builder exactly where the user left off —
    // stored even when finished, so re-editing keeps all content (images, media…).
    const draft = {
      id,
      form: bf,
      step,
      reviewMode: finished, // finished docs re-open straight into Review & Customize
      docType: builderCfg?.docType,
      propertyType: builderCfg?.propertyType,
      template: builderCfg?.template ?? newDoc.template,
      brandColor: builderCfg?.brandColor ?? newDoc.brandColor,
    }

    const pkg = {
      id,
      title,
      address,
      docType: builderCfg?.docType,
      propertyType: builderCfg?.propertyType,
      status: finished ? 'In Progress' : 'Draft',
      tags: builderCfg?.propertyType ? [builderCfg.propertyType] : [],
      image: '',
      updated: 'just now',
      ts: Date.now(),
      progress,
      price: Number(bf.price) || 0,
      owner: newDoc.owner,
      assignee: newDoc.assignee,
      template: newDoc.template,
      brandColor: newDoc.brandColor,
      _draft: draft,
    }
    setPackages((list) =>
      builderDraftId && list.some((p) => p.id === id)
        ? list.map((p) => (p.id === id ? { ...p, ...pkg, ts: p.ts || pkg.ts } : p))
        : [pkg, ...list],
    )

    // Mirror into the Listing Hub "My Listings" table.
    if (setListings) {
      const row = {
        id,
        name: title,
        address,
        price: Number(bf.price) || 0,
        type: builderCfg?.propertyType || 'Retail',
        size: sizePoint ? sizePoint.value : '—',
        status: finished ? 'Active' : 'Draft',
        image: propertyImage('1497366216548-37526070297c'),
        featured: false,
        listed: true,
        access: 'Public',
        _draft: draft,
      }
      setListings((list) =>
        builderDraftId && list.some((l) => l.id === id)
          ? list.map((l) => (l.id === id ? { ...l, ...row } : l))
          : [row, ...list],
      )
    }

    notify(finished ? 'Document saved' : 'Draft saved — resume it anytime from Listing Hub')
    setBuilderOpen(false)
    setBuilderInitial(null)
    setBuilderDraftId(null)
    try { localStorage.removeItem(BUILDER_SESSION_KEY) } catch { /* ignore */ }
  }
  const openEdit = (pkg) => {
    // Re-open the full builder (restoring all content incl. images) when we have
    // the saved form; otherwise fall back to the lightweight metadata modal.
    if (pkg._draft && pkg._draft.form) {
      const d = pkg._draft
      setBuilderCfg({ docType: d.docType, propertyType: d.propertyType, template: d.template, brandColor: d.brandColor })
      setBuilderInitial({ form: d.form, step: d.step, reviewMode: d.reviewMode })
      setBuilderDraftId(d.id)
      setBuilderNonce((n) => n + 1)
      setBuilderOpen(true)
      return
    }
    setEditing(pkg)
    setModalOpen(true)
  }

  const handleSubmit = (data) => {
    if (editing) {
      setPackages((list) => list.map((p) => (p.id === editing.id ? { ...p, ...data } : p)))
      notify('Package updated')
    } else {
      setPackages((list) => [
        {
          id: uid(),
          image: '',
          updated: 'just now',
          ts: Date.now(),
          progress: 10,
          ...data,
          owner: newDoc.owner,
          assignee: newDoc.assignee,
          template: newDoc.template,
          scope: newDoc.scope,
          locationKind: newDoc.locationKind,
          brandColor: newDoc.brandColor,
        },
        ...list,
      ])
      notify(
        newDoc.assignee ? `Package created for ${newDoc.assignee}` : 'Package created',
      )
    }
    setModalOpen(false)
    setEditing(null)
  }

  const duplicate = (pkg) => {
    setPackages((list) => [
      { ...pkg, id: uid(), title: `${pkg.title} (Copy)`, status: 'Draft', progress: pkg.progress ?? 20, updated: 'just now', ts: Date.now() },
      ...list,
    ])
    notify('Package duplicated')
  }

  // Transfer opens a chooser so the doc can be handed to a specific team member.
  const transfer = (pkg) => setTransferTarget(pkg)

  // Assign the package to the chosen recipient (a team member, or back to me).
  const doTransfer = (recipient) => {
    const pkg = transferTarget
    if (!pkg) return
    setPackages((list) =>
      list.map((p) =>
        p.id === pkg.id
          ? recipient === 'me'
            ? { ...p, owner: 'my', assignee: null, owner_name: user?.name || 'Me' }
            : { ...p, owner: 'team', assignee: recipient.name, owner_name: recipient.name }
          : p,
      ),
    )
    notify(recipient === 'me' ? 'Transferred to you (My Docs)' : `Transferred to ${recipient.name}`)
    setTransferTarget(null)
  }

  // Convert cycles the document type (OM → Flyer → Brochure → …).
  const convert = (pkg) => {
    const next = DOC_TYPES[(DOC_TYPES.indexOf(pkg.docType) + 1) % DOC_TYPES.length]
    setPackages((list) =>
      list.map((p) => (p.id === pkg.id ? { ...p, docType: next } : p)),
    )
    notify(`Converted to ${next}`)
  }

  const doDelete = () => {
    setPackages((list) => list.filter((p) => p.id !== confirm.id))
    notify('Package deleted', 'error')
    setConfirm(null)
  }

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Your Marketing Packages</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and create marketing materials for your properties
          </p>
        </div>
        {false && can('document.create') && (
          <PrimaryButton icon={Plus} onClick={openCreate}>
            Create New
          </PrimaryButton>
        )}
      </div>

      <div className="mt-6 inline-flex rounded-lg bg-slate-100 p-1">
        {[
          { key: 'my', label: 'My Docs' },
          { key: 'team', label: 'Team Docs' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`rounded-md px-5 py-1.5 text-sm font-semibold transition ${
              subTab === t.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <button
          onClick={() => (selectMode ? exitSelect() : setSelectMode(true))}
          className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
            selectMode
              ? 'border-brand bg-orange-50 text-brand'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {selectMode ? 'Cancel' : 'Select'}
        </button>

        <div className="min-w-[170px]">
          <Select icon={FileText} label="Doc Types" value={docType} onChange={setDocType} options={['All Doc Types', ...DOC_TYPES]} />
        </div>
        <div className="min-w-[180px]">
          <Select icon={Building2} label="Property Types" value={propType} onChange={setPropType} options={['All Property Types', ...PROP_TYPES]} />
        </div>
        <div className="min-w-[150px]">
          <Select icon={Target} label="Status" value={status} onChange={setStatus} options={['All Status', ...PKG_STATUSES]} />
        </div>
        <div className="min-w-[210px]">
          <Select
            icon={ArrowUpDown}
            label="Sort By"
            value={sort}
            onChange={setSort}
            options={[
              'Last Modified (Newest)',
              'Last Modified (Oldest)',
              'Title A–Z',
              'Title Z–A',
            ]}
          />
        </div>

        <span className="whitespace-nowrap text-sm font-medium text-slate-400 lg:ml-auto">
          {filtered.length} document{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Bulk-select action bar */}
      {selectMode && selectedIds.length > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">
            {selectedIds.length} selected
          </span>
          <button
            onClick={() => selectedIds.length && setBulkConfirm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete selected
          </button>
        </div>
      )}

      {filtered.length ? (
  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {filtered.map((pkg, index) => (
      <PackageCard
        key={pkg.id || `pkg-${index}`}
        pkg={pkg}
        onEdit={openEdit}
        onDuplicate={duplicate}
        onDelete={setConfirm}
        onTransfer={transfer}
        onConvert={convert}
        selectMode={selectMode}
        selected={selectedIds.includes(pkg.id)}
        onToggleSelect={() => toggleSelected(pkg.id)}
      />
    ))}
  </div>
) : (
  <EmptyState title="No packages found" subtitle="Try adjusting your filters or create a new marketing package." />
)}

      <CreateForModal
        open={chooserOpen}
        onClose={() => setChooserOpen(false)}
        onContinue={proceedFromChooser}
        members={TEAM_MEMBERS}
      />

      <CreateWizard
        open={wizardOpen}
        onExit={() => setWizardOpen(false)}
        onComplete={finishWizard}
        assignee={newDoc.assignee}
      />

      {builderOpen && builderCfg && (
        <DocumentBuilder
          key={builderNonce}
          config={builderCfg}
          initial={builderInitial}
          draftId={builderDraftId}
          notify={notify}
          onNavigate={onNavigate}
          onSignOut={onSignOut}
          user={user}
          onExit={() => { setBuilderOpen(false); try { localStorage.removeItem(BUILDER_SESSION_KEY) } catch { /* ignore */ } }}
          onChangeType={() => {
            setBuilderOpen(false)
            setWizardOpen(true)
          }}
          onSave={saveFromBuilder}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Package' : 'Finish New Document'}
      >
        <PackageForm
          initial={editing}
          defaults={wizardDefaults}
          ownerTab={newDoc.owner}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={doDelete}
        title="Delete package?"
        message={`"${confirm?.title}" will be permanently removed. This cannot be undone.`}
      />
      <ConfirmDialog
        open={bulkConfirm}
        onClose={() => setBulkConfirm(false)}
        onConfirm={bulkDelete}
        title={`Delete ${selectedIds.length} package${selectedIds.length === 1 ? '' : 's'}?`}
        message="This action cannot be undone. All selected packages will be permanently removed."
      />

      {/* Transfer to a team member */}
      <Modal
        open={!!transferTarget}
        onClose={() => setTransferTarget(null)}
        title="Transfer document"
      >
        <p className="text-sm text-slate-500">
          Move <span className="font-semibold text-slate-700">"{transferTarget?.title || 'this document'}"</span> to a team member. They&apos;ll find it under Team Docs.
        </p>
        <div className="mt-4 space-y-2">
          {/* Transfer back to me */}
          <button
            onClick={() => doTransfer('me')}
            disabled={transferTarget?.owner === 'my'}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-orange-300 hover:bg-orange-50/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-white">
              {user?.initials || 'ME'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-800">{user?.name || 'Me'} <span className="font-normal text-slate-400">(You)</span></span>
              <span className="block truncate text-xs text-slate-400">{user?.email || 'Keep in My Docs'}</span>
            </span>
            {transferTarget?.owner === 'my' && !transferTarget?.assignee && <Check className="h-4 w-4 text-emerald-500" />}
          </button>

          {TEAM_MEMBERS.map((m) => {
            const isCurrent = transferTarget?.owner === 'team' && transferTarget?.assignee === m.name
            return (
              <button
                key={m.id}
                onClick={() => doTransfer(m)}
                disabled={isCurrent}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-orange-300 hover:bg-orange-50/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                  {m.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">{m.name}</span>
                  <span className="block truncate text-xs text-slate-400">{m.email}</span>
                </span>
                {isCurrent ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check className="h-4 w-4" /> Current</span>
                ) : (
                  <Send className="h-4 w-4 text-slate-300" />
                )}
              </button>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <SlidersHorizontal className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Listing form (create / edit)                                             */
/* -------------------------------------------------------------------------- */

const LISTING_STATUSES = ['Active', 'Pending', 'Sold']

function ListingForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      name: '',
      address: '',
      price: '',
      type: 'Office / Medical',
      size: '',
      status: 'Active',
    },
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.address.trim()) return
    onSubmit({ ...form, price: Number(form.price) || 0 })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Property Name">
        <TextInput value={form.name} onChange={set('name')} placeholder="e.g. Cypress Corporate Tower" />
      </Field>
      <Field label="Address">
        <TextInput value={form.address} onChange={set('address')} placeholder="123 Main St, City, State" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Price (USD)">
          <TextInput type="number" value={form.price} onChange={set('price')} placeholder="5000000" />
        </Field>
        <Field label="Size">
          <TextInput value={form.size} onChange={set('size')} placeholder="42,000 SF" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type">
          <SelectInput value={form.type} onChange={set('type')} options={PROP_TYPES} />
        </Field>
        <Field label="Status">
          <SelectInput value={form.status} onChange={set('status')} options={LISTING_STATUSES} />
        </Field>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <PrimaryButton type="submit">{initial ? 'Save Changes' : 'Add Property'}</PrimaryButton>
      </div>
    </form>
  )
}

/* -------------------------------------------------------------------------- */
/*  Screen 2: Listing Hub                                                     */
/* -------------------------------------------------------------------------- */

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? 'bg-emerald-500' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}

function AppearanceThumb({ name, color, selected, onSelect, dark }) {
  const mini = [
    { badge: 'FOR SALE', bg: '#e11d48', price: '$4.2M' },
    { badge: 'FOR LEASE', bg: '#0d9488', price: '$24/SF' },
    { badge: 'FOR SALE', bg: '#e11d48', price: '$8.7M' },
  ]
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative overflow-hidden rounded-xl border-2 text-left transition ${
        selected ? 'border-orange-400 ring-2 ring-orange-100' : 'border-slate-200 hover:border-slate-300'
      } ${dark ? 'bg-slate-900' : 'bg-white'}`}
    >
      {selected && (
        <span className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white shadow">
          <Check className="h-3 w-3" />
        </span>
      )}
      <div className="p-2">
        {/* Hero row */}
        <div className="relative h-16 overflow-hidden rounded-md">
          <img src={FALLBACK_IMG} alt="" className="h-full w-full object-cover" loading="lazy" />
          <span className="absolute left-1 top-1 rounded px-1 py-px text-[6px] font-bold text-white" style={{ background: '#e11d48' }}>
            FOR SALE
          </span>
          <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-px text-[6px] font-bold text-white">$4.2M</span>
        </div>
        {/* Accent bar */}
        <div className="my-1 h-1 rounded-full" style={{ background: color }} />
        {/* Row of 3 mini listings */}
        <div className="grid grid-cols-3 gap-1">
          {mini.map((m, i) => (
            <div key={i} className="relative h-9 overflow-hidden rounded">
              <img src={FALLBACK_IMG} alt="" className="h-full w-full object-cover" loading="lazy" />
              <span className="absolute left-0.5 top-0.5 rounded px-0.5 text-[5px] font-bold leading-tight text-white" style={{ background: m.bg }}>
                {m.badge}
              </span>
              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-0.5 text-[5px] font-bold leading-tight text-white">{m.price}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 border-t px-2.5 py-2" style={{ borderTopColor: dark ? 'rgba(255,255,255,.12)' : '#f1f5f9' }}>
        <span className="h-3 w-1 rounded" style={{ background: color }} />
        <span className={`truncate text-xs font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>{name}</span>
      </div>
    </button>
  )
}

const MICROSITE_TEMPLATES = ['Modern', 'Executive', 'Metro', 'Gold', 'Cypress', 'Vail', 'Evergreen']
const PROPERTY_TEMPLATES = ['Match Listings', 'Modern', 'Executive', 'Metro', 'Bold', 'Cypress', 'Vail', 'Evergreen']
const ACCESS_OPTIONS = ['Public', 'Password Protected', 'Registered Users', 'Private']
const HUB_VIEWS = [
  { key: 'grid', icon: Grid2X2 },
  { key: 'card', icon: LayoutGrid },
  { key: 'map', icon: Map },
  { key: 'list', icon: Rows3 },
]

/* -------------------------------------------------------------------------- */
/*  Public microsite preview (opened from the "Preview" button)              */
/* -------------------------------------------------------------------------- */

const compactPrice = (n) => {
  const v = Number(n) || 0
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$${Math.round(v / 1e3)}K`
  return `$${v}`
}

// Lightens a hex color toward white by `amt` (0-1). #ff0000 + 0.3 -> #ff4d4d
const lighten = (hex, amt) => {
  const h = String(hex || '').replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  if (full.length !== 6) return hex
  const num = parseInt(full, 16)
  const mix = (c) => Math.round(c + (255 - c) * amt)
  const r = mix((num >> 16) & 255)
  const g = mix((num >> 8) & 255)
  const b = mix(num & 255)
  const to = (v) => v.toString(16).padStart(2, '0')
  return '#' + to(r) + to(g) + to(b)
}

// Normalizes a listing into public-facing microsite fields.
const micrositeFields = (l) => ({
  ...l,
  saleType: l.saleType || (l.status === 'Pending' ? 'For Lease' : 'For Sale'),
  leaseType: l.leaseType || 'Net Lease',
  noi: Math.round((Number(l.price) || 0) * 0.055),
})

// Rough coordinates so listings drop real pins on the map.
const CITY_COORDS = {
  Austin: [30.2672, -97.7431],
  Dallas: [32.7767, -96.797],
  Houston: [29.7604, -95.3698],
  'San Antonio': [29.4241, -98.4936],
  Irvine: [33.6846, -117.8265],
  Denver: [39.7392, -104.9903],
  Seattle: [47.6062, -122.3321],
  Phoenix: [33.4484, -112.074],
}

const coordsFor = (l) => {
  let base = [33.6846, -117.8265] // default: Irvine, CA
  const addr = l.address || ''
  for (const city in CITY_COORDS) {
    if (addr.includes(city)) {
      base = CITY_COORDS[city]
      break
    }
  }
  const j = ((Number(l.id) || 0) % 12) / 90 // small jitter so pins don't overlap
  return [base[0] + j, base[1] - j]
}

// Real interactive Leaflet map (OpenStreetMap tiles) with a pin per listing.
function MicrositeMap({ items, primary }) {
  const elRef = useRef(null)

  useEffect(() => {
    if (!elRef.current) return
    const map = L.map(elRef.current, { scrollWheelZoom: true }).setView([33.68, -117.79], 11)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const pinIcon = L.divIcon({
      className: '',
      html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="${primary}" stroke="white" stroke-width="1.5"><path d="M12 2C8 2 5 5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/></svg>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -28],
    })

    const markers = items.map((l) => {
      const [lat, lng] = coordsFor(l)
      return L.marker([lat, lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(`<b>${l.name}</b><br>${l.address}<br><b>${compactPrice(l.price)}</b>`)
    })

    if (markers.length) {
      const group = L.featureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.4), { maxZoom: 14 })
    }

    // The map lives inside a modal, so its container size settles a tick later.
    const t = setTimeout(() => map.invalidateSize(), 120)

    return () => {
      clearTimeout(t)
      map.remove()
    }
  }, [items, primary])

  return <div ref={elRef} className="z-0 h-full min-h-[440px] w-full rounded-xl border border-slate-200" />
}

function MicrositeCard({ l, primary, list }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${list ? 'flex' : ''}`}>
      <div className={`relative ${list ? 'w-64 shrink-0' : ''}`}>
        <img
          src={l.image}
          alt={l.name}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
          className={`w-full object-cover ${list ? 'h-full' : 'h-52'}`}
        />
        <span className={`absolute left-3 top-3 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${l.saleType === 'For Lease' ? 'bg-teal-600' : 'bg-rose-600'}`}>
          {l.saleType}
        </span>
        <span className="absolute bottom-3 right-3 rounded bg-slate-900/80 px-2 py-1 text-xs font-bold text-white">
          {compactPrice(l.price)}
        </span>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex-1 p-4">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: primary }}>{l.leaseType}</p>
          <h3 className="mt-0.5 text-lg font-bold text-slate-900">{l.name}</h3>
          <p className="mt-1 flex items-start gap-1 text-sm text-slate-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: primary }} />
            {l.address}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Cap</p>
              <p className="text-sm font-bold text-slate-800">5.50%</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">NOI</p>
              <p className="text-sm font-bold text-slate-800">${l.noi}</p>
            </div>
          </div>
        </div>
        <div className="h-1" style={{ background: primary }} />
      </div>
    </div>
  )
}

function MicrositePreview({ open, onClose, listings, primary }) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All Types')
  const [sort, setSort] = useState('Newest First')
  const [view, setView] = useState('mapgrid')

  useEffect(() => {
    if (!open) return
    setFilter('All'); setSearch(''); setType('All Types'); setSort('Newest First'); setView('mapgrid')
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  let items = listings.filter((l) => l.listed !== false).map(micrositeFields)
  if (filter !== 'All') items = items.filter((l) => l.saleType === filter)
  if (type !== 'All Types') items = items.filter((l) => l.type === type)
  if (search.trim()) {
    const s = search.toLowerCase()
    items = items.filter((l) => l.name.toLowerCase().includes(s) || l.address.toLowerCase().includes(s))
  }
  if (sort === 'Price: High to Low') items = [...items].sort((a, b) => b.price - a.price)
  else if (sort === 'Price: Low to High') items = [...items].sort((a, b) => a.price - b.price)
  else items = [...items].sort((a, b) => b.id - a.id)

  const types = ['All Types', ...Array.from(new Set(listings.map((l) => l.type)))]
  const VIEW_TABS = [
    { key: 'map', label: 'Map', icon: Map },
    { key: 'mapgrid', label: 'Map + Grid', icon: LayoutGrid },
    { key: 'grid', label: 'Grid', icon: Grid2X2 },
    { key: 'list', label: 'List', icon: Rows3 },
  ]

  return (
    <div className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-slate-50">
      {/* Hero */}
      <div className="relative h-52 shrink-0 overflow-hidden text-white" style={{ background: primary }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(115deg, transparent 55%, rgba(0,0,0,0.28) 55%)` }} />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="relative flex h-full items-center justify-between px-10">
          <div className="h-24 w-40 rounded-xl bg-white/15" />
          <div className="text-right">
            <p className="text-5xl font-extrabold leading-none">{items.length}</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              {items.length === 1 ? 'Property' : 'Properties'}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-6 py-3">
        <div className="inline-flex overflow-hidden rounded-lg">
          {['All', 'For Sale', 'For Lease'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-semibold transition ${
                filter === f ? 'text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              } ${f !== 'All' ? 'border-l border-slate-100' : ''}`}
              style={filter === f ? { background: primary } : undefined}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-56 rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select value={type} onChange={(e) => setType(e.target.value)} className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-orange-400">
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="relative">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-orange-400">
            {['Newest First', 'Price: High to Low', 'Price: Low to High'].map((s) => (
              <option key={s} value={s}>Sort: {s}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-slate-400">
            <span className="font-bold text-slate-700">{items.length}</span> result{items.length === 1 ? '' : 's'}
          </span>
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-200">
            {VIEW_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition ${
                  view === key ? 'text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
                style={view === key ? { background: primary } : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6">
        {items.length === 0 ? (
          <div className="py-24 text-center text-slate-400">No properties match your filters.</div>
        ) : view === 'map' ? (
          <MicrositeMap items={items} primary={primary} />
        ) : view === 'mapgrid' ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <MicrositeMap items={items} primary={primary} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {items.map((l) => <MicrositeCard key={l.id} l={l} primary={primary} />)}
            </div>
          </div>
        ) : view === 'grid' ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => <MicrositeCard key={l.id} l={l} primary={primary} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((l) => <MicrositeCard key={l.id} l={l} primary={primary} list />)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-gradient-to-b from-white to-orange-50/40 py-6 text-center">
        <div className="mx-auto mb-3 h-0.5 w-24 rounded" style={{ background: `${primary}66` }} />
        <p className="text-sm text-slate-500">
          Powered by <span className="font-bold" style={{ color: primary }}>MyCREBlueprint</span>
        </p>
      </div>
    </div>
  )
}

// Builds a fully self-contained microsite HTML page (Leaflet via CDN, data baked
// in) so "Preview" can open the live listings site in a brand-new browser tab.
export function buildMicrositeHtml(items, brandColor, template = 'Modern') {
  // Each microsite theme drives the accent colour + heading font. Because every
  // accent in the CSS below reads ${primary}, reassigning it themes the whole page.
  const THEMES = {
    Modern: { accent: brandColor || '#F97316', font: "Inter,system-ui,-apple-system,sans-serif", hero: brandColor || '#F97316' },
    Executive: { accent: '#1f2937', font: "Georgia,'Times New Roman',serif", hero: '#111827' },
    Metro: { accent: '#2563eb', font: "Inter,system-ui,sans-serif", hero: '#1d4ed8' },
    Gold: { accent: '#c2900f', font: "Georgia,serif", hero: '#b8860b' },
    Cypress: { accent: '#0f766e', font: "Inter,system-ui,sans-serif", hero: '#0f766e' },
    Vail: { accent: '#334155', font: "Inter,system-ui,sans-serif", hero: '#1e293b' },
    Evergreen: { accent: '#166534', font: "Georgia,serif", hero: '#14532d' },
  }
  const th = THEMES[template] || THEMES.Modern
  const primary = th.accent
  const bodyFont = th.font
  const hero = th.hero
  const serif = "Georgia,'Times New Roman',serif"
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Listings — MyCREBlueprint</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:${bodyFont};background:#f8fafc;color:#0f172a}
.hero{position:relative;height:200px;overflow:hidden;color:#fff;background:${hero}}
.hero .cut{position:absolute;inset:0;background:linear-gradient(115deg,transparent 55%,rgba(0,0,0,.28) 55%)}
.hero .inner{position:relative;height:100%;display:flex;align-items:center;justify-content:space-between;padding:0 40px;max-width:1240px;margin:0 auto}
.logo{height:96px;width:160px;border-radius:12px;background:rgba(255,255,255,.15)}
.count b{font-size:48px;font-weight:800;line-height:1;display:block;text-align:right}
.count span{font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;opacity:.85}
.toolbar{background:#fff;border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:1000}
.tbin{display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:12px 24px;max-width:1240px;margin:0 auto}
.seg{display:inline-flex;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
.seg button{border:0;background:#fff;padding:8px 16px;font-size:14px;font-weight:600;color:#475569;cursor:pointer}
.seg button.active{color:#fff;background:${primary}}
input,select{border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:14px;outline:none;color:#334155}
.spacer{margin-left:auto;display:flex;align-items:center;gap:12px}
.result{font-size:14px;color:#94a3b8}.result b{color:#334155}
.content{padding:24px;display:grid;gap:24px}
.content.mapgrid{grid-template-columns:1fr 1fr}
.content.map{grid-template-columns:1fr}
.content.grid #map,.content.list #map{display:none}
.content.map #cards{display:none}
#map{height:560px;border-radius:12px;border:1px solid #e2e8f0;z-index:0}
#cards{display:grid;gap:20px}
.content.mapgrid #cards{grid-template-columns:1fr 1fr;align-content:start}
.content.grid #cards{grid-template-columns:repeat(3,1fr)}
.content.list #cards{grid-template-columns:1fr}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.content.list .card{display:flex}
.imgwrap{position:relative}
.content.list .imgwrap{width:260px;flex:none}
.card img{width:100%;height:208px;object-fit:cover;display:block}
.content.list .card img{height:100%}
.badge{position:absolute;left:12px;top:12px;color:#fff;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:4px 8px;border-radius:4px}
.price{position:absolute;right:12px;bottom:12px;background:rgba(15,23,42,.8);color:#fff;font-size:12px;font-weight:700;padding:4px 8px;border-radius:4px}
.inner2{flex:1;display:flex;flex-direction:column}
.body{padding:16px;flex:1}
.lease{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${primary}}
.name{font-size:18px;font-weight:700;margin-top:2px}
.addr{font-size:14px;color:#64748b;margin-top:4px}
.metrics{display:flex;justify-content:space-between;border-top:1px solid #f1f5f9;margin-top:12px;padding-top:10px}
.lab{font-size:10px;font-weight:600;text-transform:uppercase;color:#94a3b8}
.val{font-size:14px;font-weight:700;color:#334155}
.accent{height:4px;background:${primary}}
footer{text-align:center;padding:28px;background:linear-gradient(#fff,rgba(255,237,213,.4));border-top:1px solid #e2e8f0}
footer .line{width:96px;height:2px;background:${primary};opacity:.4;margin:0 auto 12px;border-radius:2px}
footer p{font-size:14px;color:#64748b}footer b{color:${primary}}
@media(max-width:900px){.content.mapgrid,.content.grid #cards{grid-template-columns:1fr}}
html{scroll-behavior:smooth}
.card{cursor:pointer}
.detail{display:none}
body.detail-open .hero,body.detail-open .toolbar,body.detail-open #content,body.detail-open .list-footer{display:none}
body.detail-open .detail{display:block}
/* Premium single-listing (OM) detail — centered hero, numbered serif sections */
.dhero{position:relative;min-height:560px;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;color:#fff}
.dhero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.dhero .ov{position:absolute;inset:0;background:linear-gradient(155deg,${primary}f2,${primary}cc 55%,rgba(0,0,0,.5))}
.dtop{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;padding:16px 22px;z-index:3}
.dbtn{background:rgba(0,0,0,.35);color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:8px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer}
.dhin{position:relative;z-index:2;max-width:900px;padding:60px 24px}
.deyebrow{font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.92)}
.dhtitle{font-family:${serif};font-size:56px;font-weight:700;line-height:1.05;margin:14px 0 8px}
.dhsub{font-size:13px;font-weight:600;letter-spacing:5px;text-transform:uppercase;opacity:.92}
.dhrule{width:70px;height:2px;background:rgba(255,255,255,.6);margin:20px auto}
.dhaddr{font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.92}
.dhprice{font-family:${serif};font-size:36px;font-weight:700;margin-top:20px}
.dhpl{font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:.8;margin-top:2px}
.dhbtns{display:flex;gap:14px;justify-content:center;margin-top:26px;flex-wrap:wrap}
.dhbtn1{background:#fff;color:${primary};border:0;border-radius:6px;padding:13px 26px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer}
.dhbtn2{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.65);border-radius:6px;padding:13px 26px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer}
.dtabs{position:sticky;top:0;background:#fff;border-bottom:1px solid #e2e8f0;z-index:900}
.dtabsin{max-width:1160px;margin:0 auto;padding:12px 40px;display:flex;gap:8px;justify-content:center;overflow-x:auto}
.dtabs a{font-size:14px;font-weight:600;color:#64748b;text-decoration:none;padding:6px 10px;white-space:nowrap;border-bottom:2px solid transparent}
.dtabs a:hover,.dtabs a.active{color:${primary};border-bottom-color:${primary}}
.sec{padding:58px 0;scroll-margin-top:60px}
.sec.alt{background:#faf7f2}
.secin{max-width:1160px;margin:0 auto;padding:0 40px}
.snum{font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${primary};margin-bottom:8px}
.stitle{font-family:${serif};font-size:38px;font-weight:700;color:#1a1a1a;line-height:1.1}
.opp{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:30px}
.oppc{background:${primary};color:#fff;border-radius:10px;padding:20px;min-height:96px}
.oppc b{font-family:${serif};font-size:21px;font-weight:700;display:block;line-height:1.2}
.oppc span{font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;opacity:.85;margin-top:10px;display:block}
.oppdesc{margin-top:30px;font-size:15px;line-height:1.7;color:#475569;max-width:840px}
.band{background:${primary};color:#fff}
.band .stitle{color:#fff}.band .snum{color:rgba(255,255,255,.85)}
.hlist{display:grid;grid-template-columns:1fr 1fr;gap:14px 40px;margin-top:26px}
.hlist>div{display:flex;gap:12px;font-size:15px;align-items:flex-start;line-height:1.5}
.hlist i{width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.22);flex:none;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-style:normal;margin-top:1px}
#dmap{height:420px;border-radius:12px;border:1px solid #e2e8f0;z-index:0;margin-top:22px}
.subhd{font-family:${serif};font-size:22px;font-weight:700;margin:44px 0 16px;display:flex;align-items:center}
.radbtns{display:inline-flex;gap:4px;margin-left:auto}
.radbtns button{border:1px solid #e2e8f0;background:#fff;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:600;color:#64748b;cursor:pointer}
.radbtns button.active{background:${primary};color:#fff;border-color:${primary}}
.demo{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.dc{border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#fff}
.dc .t{font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;margin-bottom:10px;text-align:center}
.donut{position:relative;width:130px;height:130px;margin:0 auto}
.donut .ctr{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.donut .ctr b{font-size:17px;font-weight:800}
.donut .ctr span{font-size:10px;color:#94a3b8}
.leg{margin-top:12px;font-size:11px}
.leg div{display:flex;align-items:center;gap:6px;margin-top:4px}
.leg i{width:8px;height:8px;border-radius:2px;display:inline-block}
.leg b{margin-left:auto}
.areatbl{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff;margin-top:16px}
.areatbl .fh{background:${primary};color:#fff;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:9px 16px}
.frow{display:flex;justify-content:space-between;gap:10px;padding:11px 16px;border-top:1px solid #eef2f7;font-size:14px}
.areatbl .frow:first-of-type{border-top:0}
.frow .k{color:#64748b}.frow .v{color:#0f172a;font-weight:700;text-align:right}
.gal{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:24px}
.gal img{width:100%;height:200px;object-fit:cover;border-radius:8px}
.contact{background:${primary};color:#fff}
.contact .stitle{color:#fff}.contact .snum{color:rgba(255,255,255,.85)}
.cgrid{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:30px;align-items:start}
.ccard{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:12px;padding:22px}
.ccard .cl{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;opacity:.85}
.agent{display:flex;align-items:center;gap:12px;margin-top:12px}
.agent .av{width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.9);color:${primary};display:flex;align-items:center;justify-content:center;font-weight:700}
.agent .nm{font-weight:700}.agent .rl{font-size:12px;opacity:.85}
.aemail{display:block;margin-top:14px;font-size:14px;color:#fff;text-decoration:underline;opacity:.95}
.btnp{width:100%;background:#fff;color:${primary};border:0;border-radius:8px;padding:12px;font-weight:700;font-size:14px;cursor:pointer;margin-top:16px}
.btno{width:100%;border:1px solid rgba(255,255,255,.5);background:transparent;color:#fff;border-radius:8px;padding:10px;font-weight:600;font-size:13px;cursor:pointer;margin-top:10px}
.finput{width:100%;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);color:#fff;border-radius:8px;padding:11px 13px;font-size:14px;margin-top:10px;outline:none;font-family:inherit}
.finput::placeholder{color:rgba(255,255,255,.7)}
@media(max-width:900px){.opp{grid-template-columns:repeat(2,1fr)}.demo,.hlist,.cgrid{grid-template-columns:1fr}.gal{grid-template-columns:repeat(2,1fr)}.dhtitle{font-size:40px}.stitle{font-size:28px}}
</style></head><body>
<header class="hero"><div class="cut"></div><div class="inner"><div class="logo"></div><div class="count" id="count"></div></div></header>
<div class="toolbar"><div class="tbin">
  <div class="seg" id="filterSeg"><button data-f="All" class="active">All</button><button data-f="For Sale">For Sale</button><button data-f="For Lease">For Lease</button></div>
  <input id="search" placeholder="Search..."/>
  <select id="sort"><option value="Newest">Sort: Newest First</option><option value="PriceHigh">Sort: Price High to Low</option><option value="PriceLow">Sort: Price Low to High</option></select>
  <div class="spacer"><span class="result" id="result"></span><div class="seg" id="viewSeg"><button data-v="map">Map</button><button data-v="mapgrid" class="active">Map + Grid</button><button data-v="grid">Grid</button><button data-v="list">List</button></div></div>
</div></div>
<div class="content mapgrid" id="content"><div id="map"></div><div id="cards"></div></div>
<footer class="list-footer"><div class="line"></div><p>Powered by <b>MyCREBlueprint</b></p></footer>
<div class="detail" id="detailView"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var DATA=${JSON.stringify(items)};
var PRIMARY=${JSON.stringify(primary)};
var state={view:'mapgrid',filter:'All',search:'',sort:'Newest'};
var map=null,markers=[];
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function pinIcon(){return L.divIcon({className:'',html:'<svg width="30" height="30" viewBox="0 0 24 24" fill="'+PRIMARY+'" stroke="white" stroke-width="1.5"><path d="M12 2C8 2 5 5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/></svg>',iconSize:[30,30],iconAnchor:[15,30],popupAnchor:[0,-28]});}
function filtered(){var a=DATA.slice();if(state.filter!=='All')a=a.filter(function(l){return l.saleType===state.filter;});if(state.search){var q=state.search.toLowerCase();a=a.filter(function(l){return (l.name+' '+l.address).toLowerCase().indexOf(q)>-1;});}if(state.sort==='PriceHigh')a.sort(function(x,y){return y.price-x.price;});else if(state.sort==='PriceLow')a.sort(function(x,y){return x.price-y.price;});else a.sort(function(x,y){return y.id-x.id;});return a;}
function cardHtml(l){var bc=l.saleType==='For Lease'?'#0d9488':'#e11d48';return '<div class="card" onclick="openDetail('+l.id+')"><div class="imgwrap"><img src="'+esc(l.image)+'"/><span class="badge" style="background:'+bc+'">'+esc(l.saleType)+'</span><span class="price">'+esc(l.priceLabel)+'</span></div><div class="inner2"><div class="body"><div class="lease">'+esc(l.leaseType)+'</div><div class="name">'+esc(l.name)+'</div><div class="addr">'+esc(l.address)+'</div><div class="metrics"><div><div class="lab">CAP</div><div class="val">5.50%</div></div><div style="text-align:right"><div class="lab">NOI</div><div class="val">$'+l.noi+'</div></div></div></div><div class="accent"></div></div></div>';}
function ensureMap(){if(!map){map=L.map('map').setView([33.68,-117.79],11);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);}}
function drawMap(items){ensureMap();markers.forEach(function(m){map.removeLayer(m);});markers=[];items.forEach(function(l){var m=L.marker([l.lat,l.lng],{icon:pinIcon()}).addTo(map).bindPopup('<b>'+esc(l.name)+'</b><br>'+esc(l.address)+'<br><b>'+esc(l.priceLabel)+'</b>');markers.push(m);});if(markers.length){var g=L.featureGroup(markers);map.fitBounds(g.getBounds().pad(0.4),{maxZoom:14});}setTimeout(function(){map.invalidateSize();},80);}
function render(){var items=filtered();var c=document.getElementById('count');c.innerHTML='<b>'+items.length+'</b><span>'+(items.length===1?'Property':'Properties')+'</span>';document.getElementById('result').innerHTML='<b>'+items.length+'</b> result'+(items.length===1?'':'s');document.getElementById('cards').innerHTML=items.map(cardHtml).join('');document.getElementById('content').className='content '+state.view;if(state.view==='map'||state.view==='mapgrid'){drawMap(items);}creHeight();}
document.getElementById('filterSeg').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;state.filter=b.getAttribute('data-f');var ch=this.children;for(var i=0;i<ch.length;i++)ch[i].classList.toggle('active',ch[i]===b);render();});
document.getElementById('viewSeg').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;state.view=b.getAttribute('data-v');var ch=this.children;for(var i=0;i<ch.length;i++)ch[i].classList.toggle('active',ch[i]===b);render();});
document.getElementById('search').addEventListener('input',function(e){state.search=e.target.value;render();});
document.getElementById('sort').addEventListener('change',function(e){state.sort=e.target.value;render();});
var dmap=null;
var AGENT={name:'Neil Naran',role:'Listing Agent',email:'Neil@valuereis.com',initials:'NN'};
var DEMO=[{t:'Population',s:'Total',segs:[{n:'White',v:1885,c:'#3b82f6'},{n:'Hispanic',v:775,c:'#f59e0b'},{n:'Asian',v:1406,c:'#10b981'},{n:'Black',v:361,c:'#ef4444'},{n:'Other',v:612,c:'#8b5cf6'}]},{t:'Households',s:'Total',segs:[{n:'Owner',v:1478,c:'#3b82f6'},{n:'Renter',v:948,c:'#f59e0b'},{n:'Vacant',v:343,c:'#94a3b8'}]},{t:'Income',s:'Median',median:true,c:'$205,536',segs:[{n:'<$50K',v:231,c:'#ef4444'},{n:'$50-100K',v:447,c:'#f59e0b'},{n:'$100-200K',v:578,c:'#10b981'},{n:'$200K+',v:1513,c:'#3b82f6'}]}];
function fullPrice(n){return '$'+(Number(n)||0).toLocaleString('en-US');}
function fmt(n){return Math.round(n).toLocaleString('en-US');}
function donutSvg(segs,size){var total=0,i;for(i=0;i<segs.length;i++)total+=segs[i].v;if(!total)total=1;var r=size/2-10,cx=size/2,cy=size/2,circ=2*Math.PI*r,off=0,out='';for(i=0;i<segs.length;i++){var len=segs[i].v/total*circ;out+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+segs[i].c+'" stroke-width="14" stroke-dasharray="'+len+' '+(circ-len)+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 '+cx+' '+cy+')"/>';off+=len;}return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'+out+'</svg>';}
function renderDemo(mult){var wrap=document.getElementById('demoWrap');if(!wrap)return;wrap.innerHTML=DEMO.map(function(d){var sum=0,i;for(i=0;i<d.segs.length;i++)sum+=d.segs[i].v;var center=d.median?d.c:fmt(sum*mult);var ring='<div class="donut">'+donutSvg(d.segs,130)+'<div class="ctr"><b>'+center+'</b><span>'+d.s+'</span></div></div>';var leg='<div class="leg">'+d.segs.map(function(x){return '<div><i style="background:'+x.c+'"></i><span>'+x.n+'</span><b>'+fmt(x.v*mult)+'</b></div>';}).join('')+'</div>';return '<div class="dc"><div class="t">'+d.t+'</div>'+ring+leg+'</div>';}).join('');}
function setRadius(btn,mult){var bs=btn.parentElement.children,i;for(i=0;i<bs.length;i++)bs[i].classList.remove('active');btn.classList.add('active');renderDemo(mult);}
function frow(k,v){return '<div class="frow"><span class="k">'+k+'</span><span class="v">'+v+'</span></div>';}
function detailHtml(l){var bc=l.saleType==='For Lease'?'#0d9488':'#e11d48';
var facts='<div class="facts"><div class="fh">Property Facts</div><div class="fg"><div>'+frow('Price',fullPrice(l.price))+frow('Lease Type','Ground Lease')+frow('Rent Increases','10% every 5 Years')+frow('Guarantor','Corporate')+'</div><div>'+frow('Tenant','Quick Quack Car Wash')+frow('Lease Term','20 Years')+frow('Renewal Options','Four (4), Five (5) Yr')+frow('Cap Rate','5.50%')+'</div></div></div>';
var gallery='<div class="gal"><img src="'+esc(l.image)+'"/><img src="'+esc(l.image)+'"/><img src="'+esc(l.image)+'"/><img src="'+esc(l.image)+'"/></div>';
var desc='<p style="font-size:14px;color:#475569;line-height:1.6">'+esc(l.name)+' is a premier '+esc(l.type)+' investment opportunity located at '+esc(l.address)+'. This asset offers a corporate-guaranteed net lease with scheduled rental increases in a dense, high-traffic trade area, ideal for investors seeking stable passive income.</p>';
var highlights='<ul class="bullets"><li>Prime signalized hard-corner location</li><li>Long-term corporate guaranteed lease</li><li>Scheduled rent increases hedge inflation</li><li>Dense, affluent surrounding demographics</li></ul>';
var area='<div class="areatbl">'+frow('Population','281,707')+frow('Area','66.8 sq mi')+frow('Elevation','184 ft')+frow('Time Zone','Pacific Time Zone')+frow('County','Orange County')+frow('Incorporated','1971')+frow('State','California')+'</div><p style="font-size:14px;color:#475569;line-height:1.6;margin-top:12px">The surrounding area is a thriving master-planned community known for its strong economy, top-rated schools, and affluent household base, anchoring durable demand for commercial real estate.</p>';
var sidebar='<div class="side"><div class="card2"><div class="c2h">Listing Agent</div><div class="c2b"><div class="agent"><div class="av">'+AGENT.initials+'</div><div><div class="nm">'+AGENT.name+'</div><div class="rl">'+AGENT.role+'</div></div></div><a class="aemail" href="mailto:'+AGENT.email+'">'+AGENT.email+'</a><button class="btnp">Download Marketing Package</button><button class="btno">Share</button></div></div><div class="card2"><div class="c2h">Request Information</div><div class="c2b"><form onsubmit="return submitInquiry(event)"><input class="finput" placeholder="Your Name *" required/><input class="finput" type="email" placeholder="Email *" required/><input class="finput" placeholder="Phone (optional)"/><textarea class="finput" rows="3">I\\'m interested in '+esc(l.name)+'. Please send me more information.</textarea><button class="btnp" type="submit">Send Inquiry</button></form></div></div></div>';
var cta='<div class="cta dsec" id="sec-Contact"><div class="k">Get in Touch</div><h2>Interested in '+esc(l.name)+'?</h2><div class="sub">Send a message and we\\'ll respond within one business day.</div><form onsubmit="return submitInquiry(event)"><input class="finput" placeholder="Full Name *" required/><input class="finput" type="email" placeholder="Email *" required/><input class="finput" placeholder="Phone (optional)"/><textarea class="finput" rows="3">I\\'m interested in '+esc(l.name)+'. Please send me more information.</textarea><button class="btnp" type="submit">Send Inquiry</button></form></div>';
return '<div class="dhero"><img src="'+esc(l.image)+'"/><div class="ov"></div><div class="dtop"><button class="dbtn" onclick="backToList()">&larr; Back to Listings</button><button class="dbtn" onclick="backToList()">&times;</button></div><div class="dhin"><div class="deyebrow">Exclusive Offering &bull; '+esc(l.saleType)+'</div><div class="dhtitle">'+esc(l.name)+'</div><div class="dhsub">'+esc(l.leaseType)+'</div><div class="dhrule"></div><div class="dhaddr">'+esc(l.address)+'</div><div class="dhprice">'+fullPrice(l.price)+'</div><div class="dhpl">Asking Price</div><div class="dhbtns"><button class="dhbtn1" onclick="goContact()">Request Information</button><button class="dhbtn2" onclick="dlPkg()">Download Package</button></div></div></div>'
+'<div class="dtabs"><div class="dtabsin">'+['Overview','Highlights','Location','Demographics','Area Info','Gallery','Contact'].map(function(t){return '<a href="#sec-'+t.replace(/ /g,'')+'">'+t+'</a>';}).join('')+'</div></div>'
+'<div class="sec" id="sec-Overview"><div class="secin"><div class="snum">#1 &mdash; Overview</div><div class="stitle">The Opportunity</div><div class="opp"><div class="oppc"><b>'+fullPrice(l.price)+'</b><span>Price</span></div><div class="oppc"><b>Quick Quack Car Wash</b><span>Tenant</span></div><div class="oppc"><b>Ground Lease</b><span>Lease Type</span></div><div class="oppc"><b>20 Years</b><span>Lease Term</span></div><div class="oppc"><b>10% every 5 Years</b><span>Rent Increases</span></div><div class="oppc"><b>Four (4), Five (5) Yr</b><span>Renewal Options</span></div><div class="oppc"><b>Corporate</b><span>Guarantor</span></div><div class="oppc"><b>5.50%</b><span>Cap Rate</span></div></div><p class="oppdesc">'+esc(l.name)+' is a premier '+esc(l.type)+' investment opportunity located at '+esc(l.address)+'. This asset offers a corporate-guaranteed net lease with scheduled rental increases in a dense, high-traffic trade area, ideal for investors seeking stable passive income.</p></div></div>'
+'<div class="sec band" id="sec-Highlights"><div class="secin"><div class="snum">#2 &mdash; Highlights</div><div class="stitle">Investment Highlights</div><div class="hlist">'+['Prime signalized hard-corner location','Long-term corporate guaranteed lease','Scheduled rent increases hedge inflation','Dense, affluent surrounding demographics','High-traffic retail trade area','Corporate-backed credit tenant'].map(function(h){return '<div><i>&#10003;</i><span>'+h+'</span></div>';}).join('')+'</div></div></div>'
+'<div class="sec" id="sec-Market"><div class="secin"><div class="snum">#3 &mdash; Market</div><div class="stitle">Market Overview</div><div id="sec-Location"><div id="dmap"></div></div><div class="subhd" id="sec-Demographics">Demographics <span class="radbtns"><button class="active" onclick="setRadius(this,1)">1 Mi</button><button onclick="setRadius(this,3.1)">3 Mi</button><button onclick="setRadius(this,6.4)">5 Mi</button></span></div><div class="demo" id="demoWrap"></div><div class="subhd" id="sec-AreaInfo">About the Area</div><div class="areatbl"><div class="fh">Area Facts</div>'+frow('Population','281,707')+frow('Area','66.8 sq mi')+frow('Elevation','184 ft')+frow('Time Zone','Pacific Time Zone')+frow('County','Orange County')+frow('Incorporated','1971')+frow('State','California')+'</div><p class="oppdesc">The surrounding area is a thriving master-planned community known for its strong economy, top-rated schools, and affluent household base, anchoring durable demand for commercial real estate.</p></div></div>'
+'<div class="sec alt" id="sec-Gallery"><div class="secin"><div class="snum">Gallery</div><div class="stitle">'+esc(l.name)+'</div><div class="gal"><img src="'+esc(l.image)+'"/><img src="'+esc(l.image)+'"/><img src="'+esc(l.image)+'"/><img src="'+esc(l.image)+'"/></div></div></div>'
+'<div class="sec contact" id="sec-Contact"><div class="secin"><div class="snum">#5 &mdash; Contact</div><div class="stitle">Contact Us</div><div class="cgrid"><div class="ccard"><div class="cl">Listing Agent</div><div class="agent"><div class="av">'+AGENT.initials+'</div><div><div class="nm">'+AGENT.name+'</div><div class="rl">'+AGENT.role+'</div></div></div><a class="aemail" href="mailto:'+AGENT.email+'">'+AGENT.email+'</a><button class="btnp" onclick="dlPkg()">Download Marketing Package</button><button class="btno">Share</button></div><div class="ccard"><div class="cl">Request Information</div><form onsubmit="return submitInquiry(event)"><input class="finput" placeholder="Your Name *" required/><input class="finput" type="email" placeholder="Email *" required/><input class="finput" placeholder="Phone (optional)"/><textarea class="finput" rows="3">I\\'m interested in '+esc(l.name)+'. Please send me more information.</textarea><button class="btnp" type="submit">Send Inquiry</button></form></div></div></div></div>'
+'<footer><div class="line"></div><p>Powered by <b>MyCREBlueprint</b></p></footer>';}
function goContact(){var el=document.getElementById('sec-Contact');if(el)el.scrollIntoView({behavior:'smooth'});}
function dlPkg(){alert('The full marketing package will be sent to your email.');}
function submitInquiry(e){e.preventDefault();e.target.innerHTML='<div style="padding:18px;text-align:center;color:#fff;font-weight:600">Thank you! We\\'ll respond within one business day.</div>';return false;}
function initDetailMap(l){if(dmap){dmap.remove();dmap=null;}dmap=L.map('dmap').setView([l.lat,l.lng],14);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(dmap);L.marker([l.lat,l.lng],{icon:pinIcon()}).addTo(dmap);setTimeout(function(){dmap.invalidateSize();},100);}
function creUrl(id){var p=new URLSearchParams(location.search);if(id!=null&&id!=='')p.set('p',id);else p.delete('p');return location.pathname+'?'+p.toString();}
function openDetail(id,skipUrl){var l=null,i;for(i=0;i<DATA.length;i++){if(DATA[i].id==id){l=DATA[i];break;}}if(!l)return;document.getElementById('detailView').innerHTML=detailHtml(l);document.body.classList.add('detail-open');window.scrollTo(0,0);renderDemo(1);initDetailMap(l);creNav(l.id);creHeight();if(!skipUrl){try{history.pushState({p:l.id},'',creUrl(l.id));}catch(e){}}}
function backToList(skipUrl){document.body.classList.remove('detail-open');if(dmap){dmap.remove();dmap=null;}window.scrollTo(0,0);creNav(null);creHeight();if(!skipUrl){try{history.pushState({},'',creUrl(null));}catch(e){}}}
document.addEventListener('click',function(e){var a=e.target.closest?e.target.closest('.dtabs a'):null;if(a){var tb=a.parentElement.querySelectorAll('a'),i;for(i=0;i<tb.length;i++)tb[i].classList.remove('active');a.classList.add('active');}});
/* --- Embed messaging: talk to the parent page when used as an <iframe> --- */
function creHeight(){try{var h=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);parent.postMessage({type:'cre-listings-resize',height:h},'*');}catch(e){}}
function creNav(id){try{parent.postMessage({type:'cre-nav-property',propertyId:id||null},'*');}catch(e){}}
window.addEventListener('load',creHeight);
window.addEventListener('resize',creHeight);
window.addEventListener('message',function(e){if(e.data&&e.data.type==='cre-init'){if(e.data.propertyId)openDetail(e.data.propertyId);else creHeight();}});
setTimeout(creHeight,700);
window.addEventListener('popstate',function(){var pid=new URLSearchParams(location.search).get('p');if(pid)openDetail(pid,true);else backToList(true);});
render();creHeight();
(function(){var pid=new URLSearchParams(location.search).get('p');if(pid)openDetail(pid,true);})();
</script></body></html>`
}

// Standalone public "NDA gate" landing page for a deal room (opened via ?room=).
export function buildDealRoomHtml(room, agent) {
  const name = (room && room.name) || 'Listing'
  const addr = (room && room.address) || ''
  const img = (room && room.image) || FALLBACK_IMG
  const agentName = (agent && agent.name) || 'Listing Broker'
  const agentEmail = (agent && agent.email) || 'broker@crebuilder.com'
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${name} — Confidential OM</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,system-ui,-apple-system,sans-serif;background:#f8fafc;color:#0f172a}
.hero{position:relative;height:340px;overflow:hidden}
.hero>img{width:100%;height:100%;object-fit:cover}
.hero:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(15,23,42,.9),rgba(15,23,42,.4))}
.hov{position:absolute;left:0;right:0;bottom:48px;color:#fff;z-index:2}
.hovin{max-width:1040px;margin:0 auto;padding:0 24px}
.tag{color:#34d399;font-size:13px;font-weight:700;letter-spacing:3px}
.hov h1{font-size:46px;font-weight:800;margin-top:6px;line-height:1.05}
.addr{display:inline-flex;align-items:center;gap:8px;margin-top:10px;font-size:16px;opacity:.9}
.wrap{max-width:1040px;margin:24px auto 0;padding:0 24px 40px;display:grid;grid-template-columns:1fr 320px;gap:24px;position:relative;z-index:3}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;box-shadow:0 12px 34px rgba(0,0,0,.07)}
.chead{display:flex;align-items:center;gap:14px}
.lock{width:48px;height:48px;border-radius:12px;background:#fff7ed;display:flex;align-items:center;justify-content:center;flex:none}
.lock.ok{background:#dcfce7}
.card h2{font-size:22px;font-weight:800}
.card p{color:#64748b;margin-top:12px;line-height:1.6;font-size:14px}
.feats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:22px;clear:both}
.feat{border:1px solid #e2e8f0;border-radius:12px;padding:14px}
.feat b{display:flex;align-items:center;gap:6px;font-size:14px;color:#0f172a}
.feat span{display:block;color:#64748b;font-size:12px;margin-top:6px}
.btn{width:100%;background:#F97316;color:#fff;border:0;border-radius:12px;padding:16px;font-size:16px;font-weight:700;cursor:pointer;margin-top:22px}
.btn:hover{background:#ea580c}
.note{text-align:center;color:#94a3b8;font-size:13px;margin-top:14px}
.fi{width:100%;border:1px solid #e2e8f0;border-radius:10px;padding:12px;font-size:14px;margin-top:10px;outline:none;font-family:inherit}
.side{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;align-self:start}
.side .k{font-size:12px;font-weight:700;letter-spacing:2px;color:#94a3b8}
.side .an{font-size:18px;font-weight:700;margin-top:14px}
.side a{display:block;color:#F97316;margin-top:6px;font-size:14px;text-decoration:none}
footer{text-align:center;padding:30px;color:#64748b;font-size:14px}
footer b{color:#F97316}
.formwrap{max-width:760px;margin:40px auto;padding:0 24px}
.fcard{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:30px;box-shadow:0 12px 34px rgba(0,0,0,.06)}
.fcard h2{font-size:24px;font-weight:800}
.fcard .sub{color:#64748b;margin-top:6px;font-size:14px}
.steps{display:flex;align-items:center;gap:10px;margin:22px 0 26px}
.step{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#94a3b8;white-space:nowrap}
.step.active{color:#0f172a}
.stepn{width:26px;height:26px;border-radius:50%;background:#e2e8f0;color:#64748b;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700}
.step.active .stepn{background:#F97316;color:#fff}
.stepline{width:36px;height:1px;background:#e2e8f0;flex:none}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.fg{margin-bottom:14px}
.fg label{display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#0f172a}
.finput{width:100%;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;font-size:14px;outline:none;font-family:inherit}
.finput:focus{border-color:#fb923c;box-shadow:0 0 0 3px #ffedd5}
.bigbtn{width:100%;background:#F97316;color:#fff;border:0;border-radius:10px;padding:12px;font-size:15px;font-weight:700;cursor:pointer;margin-top:6px}
.bigbtn:hover{background:#ea580c}
.fnote{text-align:center;color:#64748b;font-size:14px;margin-top:16px}
.otp{letter-spacing:14px;text-align:center;font-size:24px}
.summary{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;font-size:14px;color:#475569;margin-bottom:16px}
.ndabox{max-height:120px;overflow:auto;border:1px solid #e2e8f0;border-radius:10px;padding:14px;font-size:13px;color:#64748b;line-height:1.6;margin-bottom:16px}
@media(max-width:860px){.wrap{grid-template-columns:1fr}.hov h1{font-size:34px}.feats{grid-template-columns:1fr}.frow{grid-template-columns:1fr}}
</style></head><body>
<div class="hero"><img src="${img}"/><div class="hov"><div class="hovin"><div class="tag">INVESTMENT OPPORTUNITY</div><h1>${name}</h1><div class="addr"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>${addr}</div></div></div></div>
<div class="wrap">
  <div class="card" id="gate">
    <div class="chead"><div class="lock"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><h2>Confidential &mdash; NDA Required</h2></div>
    <p>Sign the Confidentiality Agreement to access the full Offering Memorandum, including financials, tenant detail, and demographic analysis.</p>
    <div class="feats">
      <div class="feat"><b><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg> E-SIGN binding</b><span>Type-name signature with IP + timestamp captured.</span></div>
      <div class="feat"><b><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> Instant unlock</b><span>Full OM available immediately after signing.</span></div>
    </div>
    <button class="btn" onclick="showForm()">Sign NDA &amp; Access Full OM</button>
    <p class="note">Takes about 30 seconds. Your information is shared with the listing broker only.</p>
  </div>
  <div class="side"><div class="k">LISTED BY</div><div class="an">${agentName}</div><a href="mailto:${agentEmail}">${agentEmail}</a></div>
</div>
<footer>Powered by <b>MyCREBlueprint</b></footer>
<script>
var NAME=${JSON.stringify(name)},ADDR=${JSON.stringify(addr)};
var DATA={};
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function stepBar(a){var s=[[1,'Your info'],[2,'Verify email'],[3,'Review & sign']];var h='<div class="steps">';for(var i=0;i<s.length;i++){var n=s[i][0];h+='<div class="step'+(a===n?' active':'')+'"><span class="stepn">'+(a>n?'&#10003;':n)+'</span>'+s[i][1]+'</div>';if(i<2)h+='<span class="stepline"></span>';}return h+'</div>';}
function shell(inner){document.body.innerHTML='<div class="formwrap"><div class="fcard">'+inner+'</div></div>';window.scrollTo(0,0);}
function showForm(){
  shell('<h2>Confidentiality Agreement</h2><div class="sub">'+esc(NAME)+' &mdash; sign to access the full Offering Memorandum and confidential documents.</div>'
   +stepBar(1)
   +'<form onsubmit="return toStep2(event)">'
   +'<div class="frow"><div class="fg"><label>Full Name</label><input class="finput" id="fn" placeholder="Jane Smith" required></div><div class="fg"><label>Email</label><input class="finput" id="em" type="email" placeholder="jane@example.com" required></div></div>'
   +'<div class="frow"><div class="fg"><label>Company (optional)</label><input class="finput" id="co" placeholder="Smith Capital Partners"></div><div class="fg"><label>Title (optional)</label><input class="finput" id="ti" placeholder="Principal"></div></div>'
   +'<div class="fg"><label>Phone</label><input class="finput" id="ph" placeholder="(555) 555-5555"></div>'
   +'<button class="bigbtn" type="submit">Continue &mdash; verify my email</button>'
   +'<div class="fnote">We&#39;ll email you a 6-digit code to confirm your identity before signing.</div>'
   +'</form>');
}
function toStep2(e){e.preventDefault();DATA.name=document.getElementById('fn').value;DATA.email=document.getElementById('em').value;DATA.company=document.getElementById('co').value;DATA.title=document.getElementById('ti').value;
  shell('<h2>Verify your email</h2><div class="sub">We sent a 6-digit code to <b>'+esc(DATA.email)+'</b>. Enter it below.</div>'
   +stepBar(2)
   +'<div class="fg"><label>6-digit code</label><input class="finput otp" id="otp" maxlength="6" inputmode="numeric" placeholder="------"></div>'
   +'<button class="bigbtn" onclick="toStep3()">Verify &amp; continue</button>'
   +'<div class="fnote">Didn&#39;t get it? <a href="#" onclick="return false" style="color:#F97316;text-decoration:none">Resend code</a> &middot; demo: any 6 digits work</div>');
  return false;
}
function toStep3(){
  shell('<h2>Review &amp; sign</h2><div class="sub">Confirm your details and e-sign the confidentiality agreement.</div>'
   +stepBar(3)
   +'<div class="summary"><b>'+esc(DATA.name)+'</b> &middot; '+esc(DATA.email)+(DATA.company?' &middot; '+esc(DATA.company):'')+'</div>'
   +'<div class="ndabox">This Confidentiality Agreement governs access to the Offering Memorandum for '+esc(NAME)+' at '+esc(ADDR)+'. By signing, you agree to keep all materials strictly confidential, to use them solely to evaluate this opportunity, and not to disclose or reproduce them without the listing broker&#39;s written consent. Your signature is captured with your IP address and a timestamp.</div>'
   +'<div class="fg"><label>Type your full name to sign</label><input class="finput" id="sig" placeholder="'+esc(DATA.name)+'"></div>'
   +'<button class="bigbtn" onclick="finishSign()">Sign &amp; Access OM</button>');
}
function finishSign(){
  shell('<div style="text-align:center"><div class="lock ok" style="margin:0 auto 14px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg></div>'
   +'<h2>Access Granted</h2><div class="sub">Your NDA has been recorded with IP &amp; timestamp. The full Offering Memorandum is now unlocked.</div>'
   +'<button class="bigbtn" onclick="dl()" style="max-width:340px;margin:22px auto 0">&#8681; Download Full OM</button></div>');
}
function dl(){var t="OFFERING MEMORANDUM\\n\\n"+NAME+"\\n"+ADDR+"\\n\\nConfidential — provided under signed NDA.\\nGenerated by MyCREBlueprint (demo document).";var b=new Blob([t],{type:"text/plain"});var u=URL.createObjectURL(b);var a=document.createElement("a");a.href=u;a.download="OM - "+NAME+".txt";a.click();URL.revokeObjectURL(u);}
</script></body></html>`
}

// Maps raw listings into the public-microsite item shape (coords, price label, etc.)
export const toMicrositeItems = (listings) =>
  (listings || [])
    .filter((l) => l.listed !== false)
    .map((l) => {
      const m = micrositeFields(l)
      const [lat, lng] = coordsFor(l)
      return {
        id: l.id,
        name: l.name,
        address: l.address,
        price: Number(l.price) || 0,
        priceLabel: compactPrice(l.price),
        type: l.type,
        image: l.image || FALLBACK_IMG,
        saleType: m.saleType,
        leaseType: m.leaseType,
        noi: m.noi,
        lat,
        lng,
      }
    })

function ListingHubPage({ listings, setListings, globalQuery, onCreateNew, onResumeDraft, can = () => true }) {
  const notify = useToast()

  const [slug, setSlug] = useState('vaziamts')
  // Functional link that actually opens the microsite (works when pasted in a new tab).
  const hubUrl = `${window.location.origin}${window.location.pathname}?hub=${slug}`
  const siteUrl = hubUrl

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [cname, setCname] = useState('')
  const [inquiryForm, setInquiryForm] = useState(true)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [customUrlOpen, setCustomUrlOpen] = useState(false)
  const [slugDraft, setSlugDraft] = useState(slug)
  const [embedOpen, setEmbedOpen] = useState(false)

  // Appearance
  const [micrositeTpl, setMicrositeTpl] = useState('Modern')
  const [propertyTpl, setPropertyTpl] = useState('Match Listings')
  const [defaultView, setDefaultView] = useState('grid')
  const [sameAsMicrosite, setSameAsMicrosite] = useState(true)
  const [primary, setPrimary] = useState('#F97316')
  const secondary = lighten(primary, 0.3)

  // Embed URL carries the theme in the URL (?t=&c=) so it renders correctly on
  // any external site / visitor browser, where localStorage isn't available.
  const embedUrl = `${hubUrl}&t=${encodeURIComponent(micrositeTpl)}&c=${primary.replace('#', '')}`
  const embedCode = `<iframe
  id="cre-listings"
  src="${embedUrl}"
  width="100%"
  height="900"
  frameborder="0"
  style="border:none;border-radius:8px"
  title="Property Listings"
></iframe>
<script>
(function () {
  var iframe = document.getElementById('cre-listings');
  var params = new URLSearchParams(window.location.search);
  var pid = params.get('property');
  iframe.addEventListener('load', function () {
    iframe.contentWindow.postMessage(
      { type: 'cre-init', propertyId: pid ? parseInt(pid) : null },
      '*'
    );
  });
  window.addEventListener('message', function (e) {
    if (!e.data || typeof e.data.type !== 'string') return;
    if (e.data.type === 'cre-listings-resize') {
      iframe.style.height = e.data.height + 'px';
    }
    if (e.data.type === 'cre-nav-property') {
      var url = new URL(window.location.href);
      if (e.data.propertyId) url.searchParams.set('property', e.data.propertyId);
      else url.searchParams.delete('property');
      history.replaceState(null, '', url.toString());
    }
  });
})();
</script>`

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const withDefaults = (l) => ({
    featured: false,
    listed: true,
    access: 'Public',
    ...l,
  })
  const rows = listings.map(withDefaults)

  // Persist current listings + brand color so the public "?hub=" link (opened in a
  // new tab) shows exactly what Preview shows.
  useEffect(() => {
    try {
      localStorage.setItem(
        'crebuilder_hub',
        JSON.stringify({ items: toMicrositeItems(rows), primary, template: micrositeTpl }),
      )
    } catch {
      /* ignore storage errors */
    }
  }, [listings, primary, micrositeTpl])

  const listedCount = rows.filter((l) => l.listed).length
  const unlistedCount = rows.length - listedCount

  const q = (globalQuery || search).toLowerCase()
  const filtered = rows.filter((l) => {
    if (filter === 'listed' && !l.listed) return false
    if (filter === 'unlisted' && l.listed) return false
    if (q.trim() && !(l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q))) return false
    return true
  })

  const patch = (id, changes) =>
    setListings((list) => list.map((l) => (l.id === id ? { ...withDefaults(l), ...changes } : l)))

  // Copy Link and Preview both use the same functional hub URL, so the copied link
  // opens exactly the microsite the Preview shows.
  const copyLink = async () => {
    const ok = await copyToClipboard(hubUrl)
    notify(ok ? 'Preview link copied — opens your live microsite' : 'Unable to copy link', ok ? 'success' : 'error')
  }
  const openMicrosite = () => {
    const w = window.open(hubUrl, '_blank')
    if (!w) {
      notify('Please allow pop-ups to open the preview', 'error')
      return
    }
    notify('Microsite opened in a new tab')
  }
  const addDomain = () => {
    if (!cname.trim()) return
    notify(`Domain "${cname.trim()}" added`)
    setCname('')
  }
  const exportCsv = () => {
    const head = ['Property', 'Address', 'Type', 'Featured', 'Listed', 'Access']
    const body = filtered.map((l) => [l.name, l.address, l.type, l.featured ? 'Yes' : 'No', l.listed ? 'Yes' : 'No', l.access])
    const csv = [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'listings.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    notify('Listings exported')
  }

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const handleSubmit = (data) => {
    if (editing) {
      setListings((list) => list.map((l) => (l.id === editing.id ? { ...l, ...data } : l)))
      notify('Listing updated')
    } else {
      setListings((list) => [
        { id: uid(), image: propertyImage('1497366216548-37526070297c'), featured: false, listed: true, access: 'Public', ...data },
        ...list,
      ])
      notify('Property added')
    }
    setModalOpen(false)
    setEditing(null)
  }
  const doDelete = () => {
    setListings((list) => list.filter((l) => l.id !== confirm.id))
    notify('Listing deleted', 'error')
    setConfirm(null)
  }

  const TABS = [
    { key: 'all', label: `All (${rows.length})` },
    { key: 'listed', label: `Listed (${listedCount})` },
    { key: 'unlisted', label: `Unlisted (${unlistedCount})` },
  ]

  const sectionLabel = 'mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400'

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-brand" />
          <h1 className="text-xl font-extrabold text-slate-900">Listing Hub</h1>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-600/20">
            Active
          </span>
        </div>
        <button
          onClick={() => shareItem({ id: 'hub', title: 'Listing Hub', address: hubUrl }, notify)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Share2 className="h-4 w-4" />
          Share microsite
        </button>
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* LEFT column */}
        <div className="min-w-0 space-y-4">
          {/* Public URL card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <Link2 className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate text-sm text-slate-600">{siteUrl}</span>
              </div>
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </button>
              <button
                onClick={openMicrosite}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <button
                onClick={() => { setSlugDraft(slug); setCustomUrlOpen((v) => !v) }}
                className={`inline-flex items-center gap-1.5 font-medium transition hover:text-brand ${customUrlOpen ? 'text-brand' : ''}`}
              >
                <Pencil className="h-3.5 w-3.5" /> Custom URL
              </button>
              <button
                onClick={() => setEmbedOpen(true)}
                className="inline-flex items-center gap-1.5 font-medium transition hover:text-brand"
              >
                <Code2 className="h-3.5 w-3.5" /> Embed on Your Website
              </button>
              <span className="inline-flex items-center gap-2">
                <Toggle on={inquiryForm} onChange={setInquiryForm} /> Inquiry Form
              </span>
            </div>

            {/* Custom URL inline editor (full width) */}
            {customUrlOpen && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="text-sm text-slate-500">
                  Replace the long default URL with a short, easy-to-remember link. This is the URL you share with clients or put on your business cards.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="whitespace-nowrap text-sm text-slate-500">{window.location.origin}{window.location.pathname}?hub=</span>
                  <input
                    value={slugDraft}
                    onChange={(e) => setSlugDraft(e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())}
                    className="min-w-[220px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                  <PrimaryButton
                    onClick={() => {
                      if (!slugDraft.trim()) return
                      setSlug(slugDraft.trim())
                      setCustomUrlOpen(false)
                      notify('Custom URL updated')
                    }}
                  >
                    Save
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>

          {/* Your own domain card — hidden per request */}
          {false && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <ExternalLink className="h-4 w-4 text-brand" /> Your own domain
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Host your Listing Hub on your own web address. Add a CNAME record, point it to us and we handle the SSL and hosting automatically.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                value={cname}
                onChange={(e) => setCname(e.target.value)}
                placeholder="listings.yourcompany.com"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
              <PrimaryButton onClick={addDomain}>Add</PrimaryButton>
            </div>
          </div>
          )}

          {/* My Listings */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">My Listings</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Toggle "Listed" to make a property visible on your public microsite. Only listed properties appear to visitors.
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setFilter(t.key)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                      filter === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-0 flex-1 sm:flex-none">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-40"
                  />
                </div>
                <button
                  onClick={exportCsv}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
                {can('listing.create') && (
                  <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                )}
                {can('document.create') && (
                  <button
                    onClick={onCreateNew}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create New
                  </button>
                )}
              </div>
            </div>

            <div className="scrollbar-slim mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-3 font-semibold">Property</th>
                    <th className="py-2 pr-3 font-semibold">Address</th>
                    <th className="py-2 pr-3 font-semibold">Type</th>
                    <th className="py-2 pr-3 text-center font-semibold">Featured</th>
                    <th className="py-2 pr-3 text-center font-semibold">Listed</th>
                    <th className="py-2 pr-3 font-semibold">Access</th>
                    <th className="py-2 pr-3 text-center font-semibold">Deal Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((l, i) => (
                    <tr key={(l.id ?? 'row') + '-' + i} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <img src={l.image} onError={(e) => (e.currentTarget.src = FALLBACK_IMG)} alt="" className="h-8 w-10 rounded object-cover" />
                          <button
                            onClick={() => (l._draft ? onResumeDraft(l._draft) : (setEditing(l), setModalOpen(true)))}
                            className="font-semibold text-slate-800 hover:text-brand"
                            title={l._draft ? 'Resume where you left off' : 'Edit listing'}
                          >
                            {l.name}
                          </button>
                          {l._draft && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                              Draft
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-500">{l.address}</td>
                      <td className="py-2.5 pr-3">
                        <div className="flex flex-wrap gap-1">
                          <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700">OM</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{l.type}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-center">
                        <button onClick={() => patch(l.id, { featured: !l.featured })} title="Featured">
                          <Star className={`mx-auto h-4 w-4 ${l.featured ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="flex justify-center">
                          <Toggle on={l.listed} onChange={(v) => patch(l.id, { listed: v })} />
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="relative">
                          <select
                            value={l.access}
                            onChange={(e) => patch(l.id, { access: e.target.value })}
                            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-medium text-slate-700 outline-none focus:border-orange-400"
                          >
                            {ACCESS_OPTIONS.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center justify-center gap-1">
                          <IconButton icon={ExternalLink} label="Preview listing" onClick={() => {
                            const w = window.open(`${hubUrl}&p=${l.id}`, '_blank')
                            if (!w) notify('Please allow pop-ups to open the preview', 'error')
                          }} />
                          <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => setConfirm(l)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-slate-400">
                        No listings match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT — Appearance panel */}
        <div className="scrollbar-slim rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Appearance</p>

          <p className={`mt-4 ${sectionLabel}`}>Microsite Page</p>
          <div className="grid grid-cols-2 gap-2">
            {MICROSITE_TEMPLATES.map((t) => (
              <AppearanceThumb key={t} name={t} color={primary} dark={t === 'Executive'} selected={micrositeTpl === t} onSelect={() => setMicrositeTpl(t)} />
            ))}
          </div>

          <p className={`mt-5 ${sectionLabel}`}>Property Pages</p>
          <div className="grid grid-cols-2 gap-2">
            {PROPERTY_TEMPLATES.map((t) => (
              <AppearanceThumb key={t} name={t} color={primary} dark={t === 'Executive'} selected={propertyTpl === t} onSelect={() => setPropertyTpl(t)} />
            ))}
          </div>

          <p className={`mt-5 ${sectionLabel}`}>Default View</p>
          <div className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">
            {HUB_VIEWS.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setDefaultView(key)}
                title={key}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition ${
                  defaultView === key ? 'bg-white text-brand shadow-sm' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Toggle on={sameAsMicrosite} onChange={setSameAsMicrosite} />
            <span className="text-xs text-slate-500">Same as Microsite default view</span>
          </div>

          <p className={`mt-5 ${sectionLabel}`}>Match Your Brokerage</p>
          <div className="grid grid-cols-4 gap-1.5">
            {BROKERAGES.map((b) => (
              <button
                key={b.label}
                onClick={() => setPrimary(b.colors[0])}
                title={b.label}
                className="overflow-hidden rounded-md border border-slate-200 transition hover:ring-2 hover:ring-orange-200"
              >
                <div className="flex h-6">
                  <div className="flex-1" style={{ background: b.colors[0] }} />
                  <div className="flex-1" style={{ background: b.colors[1] }} />
                </div>
                <div className="truncate px-1 py-0.5 text-center text-[7px] font-semibold text-slate-500">{b.label}</div>
              </button>
            ))}
          </div>

          <p className={`mt-4 ${sectionLabel}`}>Color Palettes</p>
          <div className="grid grid-cols-4 gap-1.5">
            {COLOR_PALETTES.map((p) => (
              <button
                key={p.label}
                onClick={() => setPrimary(p.color)}
                title={p.label}
                className="overflow-hidden rounded-md border border-slate-200 transition hover:ring-2 hover:ring-orange-200"
              >
                <div className="h-6" style={{ background: p.color }} />
                <div className="truncate px-1 py-0.5 text-center text-[7px] font-semibold text-slate-500">{p.label}</div>
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-5 border-t border-slate-100 pt-3">
            <label
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-600"
              title="Click to choose primary color"
            >
              <span className="h-4 w-4 rounded-full ring-1 ring-slate-200" style={{ background: primary }} />
              Primary
              <span className="font-mono text-[10px] uppercase text-slate-400">{primary}</span>
              <input
                type="color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="sr-only"
              />
            </label>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600" title="Auto-generated from primary">
              <span className="h-4 w-4 rounded-full ring-1 ring-slate-200" style={{ background: secondary }} />
              Secondary
              <span className="font-mono text-[10px] uppercase text-slate-400">{secondary}</span>
            </span>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Listing' : 'Add New Property'}>
        <ListingForm initial={editing} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={doDelete}
        title="Delete listing?"
        message={`"${confirm?.name}" will be permanently removed.`}
      />

      {/* Embed code modal */}
      <Modal open={embedOpen} onClose={() => setEmbedOpen(false)} title="Embed on Your Website" maxWidth="max-w-lg">
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Copy this snippet and paste it into any web page to embed your live Listing Hub.
          </p>
          <pre className="scrollbar-slim overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
{embedCode}
          </pre>
          <div className="flex justify-end">
            <PrimaryButton
              icon={Copy}
              onClick={async () => {
                const ok = await copyToClipboard(embedCode)
                notify(ok ? 'Embed code copied' : 'Unable to copy code', ok ? 'success' : 'error')
              }}
            >
              Copy Code
            </PrimaryButton>
          </div>
        </div>
      </Modal>

    </div>
  )
}

function ListingCard({ listing, onEdit, onDelete, onShare }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <img
          src={listing.image}
          alt={listing.name}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={listing.status} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900">{listing.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{listing.address}</span>
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-extrabold text-slate-900">{currency(listing.price)}</span>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{listing.type}</span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <Building className="h-4 w-4 text-slate-400" />
            {listing.size || '—'}
          </span>
          <div className="flex items-center gap-0.5">
            <IconButton icon={Pencil} label="Edit" onClick={() => onEdit(listing)} />
            <IconButton icon={Share2} label="Share" onClick={() => onShare(listing)} />
            <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => onDelete(listing)} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ListingTable({ listings, onEdit, onDelete, onShare }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="scrollbar-slim overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-semibold">Property</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Size</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listings.map((l) => (
              <tr key={l.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={l.image}
                      alt={l.name}
                      onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                      className="h-10 w-14 rounded-md object-cover"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">{l.name}</p>
                      <p className="text-xs text-slate-400">{l.address}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{l.type}</td>
                <td className="px-5 py-3 text-slate-600">{l.size || '—'}</td>
                <td className="px-5 py-3 font-semibold text-slate-900">{currency(l.price)}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={l.status} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-0.5">
                    <IconButton icon={Pencil} label="Edit" onClick={() => onEdit(l)} />
                    <IconButton icon={Share2} label="Share" onClick={() => onShare(l)} />
                    <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => onDelete(l)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Deal form (create)                                                        */
/* -------------------------------------------------------------------------- */

function DealForm({ initialStage, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    property: '',
    value: '',
    agent: '',
    stage: initialStage || 'Lead',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.property.trim() || !form.agent.trim()) return
    const col = DEAL_COLUMNS.find((c) => c.key === form.stage)
    onSubmit({ ...form, value: Number(form.value) || 0, progress: col?.progress ?? 20 })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Property / Deal Name">
        <TextInput value={form.property} onChange={set('property')} placeholder="e.g. Cypress Corporate Tower" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Deal Value (USD)">
          <TextInput type="number" value={form.value} onChange={set('value')} placeholder="5000000" />
        </Field>
        <Field label="Assigned Agent">
          <TextInput value={form.agent} onChange={set('agent')} placeholder="Maya Chen" />
        </Field>
      </div>
      <Field label="Stage">
        <SelectInput value={form.stage} onChange={set('stage')} options={DEAL_COLUMNS.map((c) => c.key)} />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <PrimaryButton type="submit">Create Deal</PrimaryButton>
      </div>
    </form>
  )
}

/* -------------------------------------------------------------------------- */
/*  Screen 3: Deal Rooms (Kanban with drag & drop)                           */
/* -------------------------------------------------------------------------- */

const DEAL_ROOM_STATUSES = ['Active', 'Archived']
const DEAL_ROOM_ACCESS = ['Free Access', 'Password', 'Registered Users', 'Private']

function DealRoomForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: '', address: '', status: 'Active', access: 'Free Access' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Deal Room Name">
        <TextInput value={form.name} onChange={set('name')} placeholder="e.g. Riverside Business Park" />
      </Field>
      <Field label="Property Address">
        <TextInput value={form.address} onChange={set('address')} placeholder="123 Main St, City, State" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Status">
          <SelectInput value={form.status} onChange={set('status')} options={DEAL_ROOM_STATUSES} />
        </Field>
        <Field label="Access">
          <SelectInput value={form.access} onChange={set('access')} options={DEAL_ROOM_ACCESS} />
        </Field>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <PrimaryButton type="submit">Create Deal Room</PrimaryButton>
      </div>
    </form>
  )
}

function DealRoomCard({ room, onOpen, onDelete }) {
  const statusCls =
    room.status === 'Active'
      ? 'bg-emerald-500 text-white'
      : 'bg-slate-900/70 text-white backdrop-blur'
  return (
    <div
      onClick={onOpen}
      className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-40 overflow-hidden bg-slate-100">
        {room.image ? (
          <img
            src={room.image}
            alt={room.name}
            onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200">
            <Building2 className="h-10 w-10 text-slate-300" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusCls}`}>
            {room.status}
          </span>
          {room.access === 'Free Access' && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
              Free Access
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-slate-400 opacity-0 shadow-sm backdrop-blur transition hover:text-rose-600 group-hover:opacity-100"
          title="Delete deal room"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-base font-bold text-slate-900">{room.name}</h3>
        <p className="mt-0.5 truncate text-sm text-slate-500">{room.address || '—'}</p>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-slate-400" />
              {room.files}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" />
              {room.members}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-slate-400">
            <Eye className="h-4 w-4" />
            {room.updated}
          </span>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Deal Room detail (files, prospects, activity, access, settings, NDA)      */
/* -------------------------------------------------------------------------- */

const DEFAULT_ROOM_FILES = [
  { name: "FINAL V2 OM - Ziggi's Coffee - Huntington, IN.pdf", size: '8.7 MB', date: '29/07/2026' },
]
const DEFAULT_ROOM_PROSPECTS = [
  { id: 'p1', initials: 'NN', name: 'Neil Naran', email: 'neil@valuenetlease.com', company: 'Value Net Lease Partners', ref: 'FEE1320B', access: 'NDA', views: 1, downloads: 0, status: 'Active', seen: 'seen 3d ago' },
  { id: 'p2', initials: 'NN', name: 'Neil Naran', email: 'naran.neil@gmail.com', company: 'Value Net Lease Partners', ref: 'C377C776', access: 'Email gate', views: 3, downloads: 1, status: 'Active', seen: 'seen 3d ago' },
]
const DEFAULT_ROOM_ACTIVITY = [
  { icon: Eye, color: 'text-blue-500', who: 'Neil Naran', text: 'viewed the deal room' },
  { icon: FileText, color: 'text-purple-500', who: 'Neil Naran', text: 'viewed the OM' },
  { icon: Eye, color: 'text-blue-500', who: 'Neil Naran', text: 'viewed the deal room' },
  { icon: FileText, color: 'text-purple-500', who: 'Neil Naran', text: 'viewed the OM' },
  { icon: Download, color: 'text-emerald-500', who: 'Neil Naran', text: 'downloaded "FINAL V2 OM - Ziggi\'s Coffee - Huntington, IN.pdf"' },
  { icon: Eye, color: 'text-blue-500', who: 'Neil Naran', text: 'viewed the deal room' },
  { icon: FileText, color: 'text-purple-500', who: 'Neil Naran', text: 'viewed the OM' },
  { icon: Download, color: 'text-amber-500', who: 'Neil Naran', text: 'downloaded the OM PDF' },
  { icon: Eye, color: 'text-blue-500', who: 'Neil Naran', text: 'viewed the deal room' },
  { icon: FileText, color: 'text-purple-500', who: 'Neil Naran', text: 'viewed the OM' },
]

function RoomStat({ icon: Icon, value, label, color = 'text-slate-400' }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <Icon className={`h-5 w-5 ${color}`} />
      <div>
        <p className="text-lg font-extrabold leading-none text-slate-900">{value}</p>
        <p className="text-[11px] text-slate-400">{label}</p>
      </div>
    </div>
  )
}

function SettingRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-600">{label}</span>
      {children}
    </div>
  )
}

// Property "hub" — opened from the deal-room address; links the listing,
// deal room, leads and outreach for a single property.
function DocumentHubView({ room, onBack, notify, onEditDocument }) {
  const [listed, setListed] = useState(true)
  const [access, setAccess] = useState(room.access || 'Free Access')

  // Open the full Document Builder pre-filled with this property.
  const editDocument = () => {
    if (!onEditDocument) { notify('Editing is unavailable here'); return }
    const parts = (room.address || '').split(',').map((s) => s.trim())
    onEditDocument({
      id: 'room-' + room.id,
      docType: 'Offering Memorandum',
      propertyType: 'Net Lease',
      template: null,
      brandColor: null,
      reviewMode: true,
      step: 0,
      form: {
        name: room.name || '',
        street: parts[0] || '',
        city: parts[1] || '',
        state: (parts[2] || '').split(' ')[0] || '',
        zip: (parts[2] || '').split(' ')[1] || '',
        sections: {},
        dataPoints: [],
        rentRoll: [],
        maps: [],
        salesComps: [],
        rentComps: [],
        coAgents: [],
        moFacts: [],
      },
    })
  }
  const publicUrl = `${window.location.origin}${window.location.pathname}?room=${room.id}`
  const stat = (Icon, value, label, color) => (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon className={`h-5 w-5 ${color}`} />
      <div><p className="text-lg font-extrabold leading-none text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div>
    </div>
  )
  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Documents
      </button>

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {room.image ? <img src={room.image} onError={(e) => (e.currentTarget.src = FALLBACK_IMG)} alt="" className="h-16 w-24 rounded-lg object-cover" /> : <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-slate-100"><Building2 className="h-6 w-6 text-slate-300" /></div>}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{room.name}</h1>
                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">Sales Teaser</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Net Lease</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Listed</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{room.address || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton icon={Pencil} onClick={editDocument}>Edit Document</PrimaryButton>
            <button onClick={() => notify('Generating PDF…')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Download className="h-4 w-4" /> PDF</button>
            <button onClick={() => notify('Opening public page…')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><ExternalLink className="h-4 w-4" /> View Public Page</button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 rounded-lg border border-slate-100 sm:grid-cols-4 lg:divide-x lg:divide-slate-100">
          {stat(Mail, 0, 'Inquiries', 'text-blue-500')}
          {stat(ShieldCheck, 2, 'Access grants', 'text-violet-500')}
          {stat(Clock, 0, 'Pending requests', 'text-slate-400')}
          {stat(FileText, 1, 'Room files', 'text-emerald-500')}
        </div>
      </div>

      {/* Cards */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Public Listing */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500"><Globe className="h-5 w-5" /></div>
              <div><p className="text-sm font-bold text-slate-900">Public Listing</p><p className="text-xs text-slate-500">Your listing page + who can access the materials</p></div>
            </div>
            <button onClick={() => notify('Opening Listing Hub')} className="text-xs font-semibold text-brand hover:underline">Listing Hub →</button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Listed on your public page</span>
            <button onClick={() => setListed((v) => !v)} className={`relative h-5 w-9 shrink-0 rounded-full transition ${listed ? 'bg-emerald-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${listed ? 'left-[18px]' : 'left-0.5'}`} /></button>
          </div>
          <label className="mt-3 block text-xs font-medium text-slate-500">Access to OM &amp; documents</label>
          <select value={access} onChange={(e) => setAccess(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none">
            <option>Free Access</option><option>Email gate</option><option>NDA</option><option>Password</option>
          </select>
          <div className="mt-3 flex items-center gap-2">
            <input readOnly value={publicUrl} className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 outline-none" />
            <button onClick={() => copy(publicUrl, 'Link copied')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"><Copy className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Deal Room */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500"><FolderLock className="h-5 w-5" /></div>
              <div><p className="text-sm font-bold text-slate-900">Deal Room</p><p className="text-xs text-slate-500">Confidential files behind the access gate</p></div>
            </div>
            <button onClick={onBack} className="text-xs font-semibold text-brand hover:underline">Open →</button>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span className="flex items-center gap-3"><span className="inline-flex items-center gap-1"><FileText className="h-4 w-4" /> 1 file</span><span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> 2 prospects</span></span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Eye className="h-3.5 w-3.5" /> 5d ago</span>
          </div>
          <button onClick={onBack} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Manage files &amp; prospects</button>
        </div>

        {/* Leads */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500"><Users className="h-5 w-5" /></div>
              <div><p className="text-sm font-bold text-slate-900">Leads</p><p className="text-xs text-slate-500">Everyone who engaged with this property</p></div>
            </div>
            <button onClick={() => notify('Opening leads')} className="text-xs font-semibold text-brand hover:underline">All leads →</button>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {[{ n: 'Neil Naran', s: 'NDA signed', t: '5d ago' }, { n: 'Neil Naran', s: 'Email lead', t: '5d ago' }].map((l, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">NN</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{l.n}</p><p className="text-xs text-slate-400">{l.s}</p></div>
                <span className="text-xs text-slate-400">{l.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outreach */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-brand"><Send className="h-5 w-5" /></div>
              <div><p className="text-sm font-bold text-slate-900">Outreach</p><p className="text-xs text-slate-500">Email campaigns built from this property</p></div>
            </div>
            <button onClick={() => notify('Opening Email Blasts')} className="text-xs font-semibold text-brand hover:underline">Email Blasts →</button>
          </div>
          <button onClick={() => notify('Creating an email blast…')} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"><Send className="h-4 w-4" /> Create an email blast</button>
        </div>
      </div>
    </div>
  )
}

function DealRoomDetail({ room, onBack, notify, onEditDocument }) {
  const [hubOpen, setHubOpen] = useState(false)
  const [files, setFiles] = useState(DEFAULT_ROOM_FILES)
  const [prospects, setProspects] = useState(DEFAULT_ROOM_PROSPECTS)
  const [access, setAccess] = useState(room.access || 'Free Access')
  const [status, setStatus] = useState(room.status === 'Archived' ? 'Archived (visitors blocked)' : 'Active')
  const [duration, setDuration] = useState(30)
  const [notifyNda, setNotifyNda] = useState(true)
  const [notifyDl, setNotifyDl] = useState(true)
  const [watermark, setWatermark] = useState(true)
  const [wmStyle, setWmStyle] = useState('Standard')
  const [nda, setNda] = useState({ name: 'NDA Agreement.pdf' })
  const fileRef = useRef(null)
  const ndaRef = useRef(null)

  const views = prospects.reduce((s, p) => s + p.views, 0)
  const downloads = prospects.reduce((s, p) => s + p.downloads, 0)
  const visitorUrl = `${window.location.origin}${window.location.pathname}?room=${room.id}`

  // Save this room so the public "?room=" gate page (opened in a new tab) can render it.
  useEffect(() => {
    try {
      localStorage.setItem(
        `crebuilder_room_${room.id}`,
        JSON.stringify({ id: room.id, name: room.name, address: room.address, image: room.image }),
      )
    } catch {
      /* ignore */
    }
  }, [room])

  const downloadFile = (f) => {
    const content = `OFFERING MEMORANDUM\n\n${room.name}\n${room.address || ''}\n\nFile: ${f.name}\nConfidential — MyCREBlueprint demo document.`
    const url = window.URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url
    a.download = (f.name.replace(/\.[^.]+$/, '') || 'document') + '.txt'
    a.click()
    window.URL.revokeObjectURL(url)
    notify('File downloaded')
  }
  const openVisitor = () => {
    const w = window.open(visitorUrl, '_blank')
    if (!w) notify('Please allow pop-ups to preview', 'error')
    else notify('Visitor page opened in a new tab')
  }
  const onNdaUpload = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    setNda({ name: f.name })
    notify('NDA updated')
    e.target.value = ''
  }
  const previewNda = () => {
    const content = `CONFIDENTIALITY AGREEMENT (NDA)\n\n${room.name}\n${room.address || ''}\n\nThis Confidentiality Agreement governs access to the confidential Offering Memorandum and supporting documents. By signing, the recipient agrees to keep all materials strictly confidential and to use them solely to evaluate this opportunity.\n\n— MyCREBlueprint demo document`
    const url = window.URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    const w = window.open(url, '_blank')
    if (!w) notify('Please allow pop-ups to preview', 'error')
    else notify('Opening NDA')
    setTimeout(() => window.URL.revokeObjectURL(url), 30000)
  }

  const exportProspect = (p) => {
    const rows = [
      ['Name', 'Email', 'Company', 'Access', 'Views', 'Downloads', 'Status', 'Ref'],
      [p.name, p.email, p.company, p.access, p.views, p.downloads, p.status, p.ref],
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${p.name.replace(/\s+/g, '-')}-activity.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    notify('Prospect activity downloaded')
  }

  const onUpload = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const mb = f.size / (1024 * 1024)
    const size = mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`
    setFiles((list) => [{ name: f.name, size, date: new Date().toLocaleDateString('en-GB') }, ...list])
    notify('File uploaded')
    e.target.value = ''
  }
  const copy = async (text, msg) => {
    const ok = await copyToClipboard(text)
    notify(ok ? msg : 'Unable to copy', ok ? 'success' : 'error')
  }

  const accessBadge = (a) =>
    a === 'NDA'
      ? 'bg-purple-50 text-purple-700'
      : a === 'Email gate'
        ? 'bg-teal-50 text-teal-700'
        : 'bg-slate-100 text-slate-600'

  if (hubOpen) return <DocumentHubView room={room} onBack={() => setHubOpen(false)} notify={notify} onEditDocument={onEditDocument} />

  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Deal Rooms
      </button>

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {room.image ? (
              <img src={room.image} onError={(e) => (e.currentTarget.src = FALLBACK_IMG)} alt="" className="h-12 w-12 rounded-lg object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100"><Building2 className="h-6 w-6 text-slate-300" /></div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">{room.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {room.status}
                </span>
                {room.access === 'Free Access' && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Free Access</span>
                )}
              </div>
              <button onClick={() => setHubOpen(true)} className="text-left text-sm text-slate-500 transition hover:text-brand hover:underline" title="Open property overview">{room.address || '—'}</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => notify('Guided tour coming soon')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <HelpCircle className="h-4 w-4" /> Show me around
            </button>
            <PrimaryButton icon={Copy} onClick={() => copy(visitorUrl, 'Visitor link copied')}>Copy visitor link</PrimaryButton>
            <button onClick={openVisitor} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <ExternalLink className="h-4 w-4" /> Preview
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 divide-slate-100 rounded-lg border border-slate-100 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
          <RoomStat icon={FileText} value={files.length} label="Files" color="text-blue-500" />
          <RoomStat icon={Users} value={prospects.length} label="Prospects" color="text-indigo-500" />
          <RoomStat icon={Clock} value={0} label="Pending requests" color="text-slate-400" />
          <RoomStat icon={Eye} value={views} label="OM & room views" color="text-emerald-500" />
          <RoomStat icon={Download} value={downloads} label="Downloads" color="text-sky-500" />
        </div>
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Confidential files */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  Confidential files <span className="rounded-full bg-slate-100 px-1.5 text-xs font-semibold text-slate-500">{files.length}</span>
                </p>
                <p className="text-xs text-slate-400">PDF, Excel, Word, CSV, or images · 50 MB per file</p>
              </div>
              <PrimaryButton icon={Upload} onClick={() => fileRef.current && fileRef.current.click()}>Upload</PrimaryButton>
              <input ref={fileRef} type="file" className="hidden" onChange={onUpload} />
            </div>
            <div className="mt-3 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-500"><FileText className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{f.name}</p>
                    <p className="text-xs text-slate-400">{f.size} · uploaded {f.date}</p>
                  </div>
                  <IconButton icon={Download} label="Download" onClick={() => downloadFile(f)} />
                  <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => { setFiles((l) => l.filter((_, j) => j !== i)); notify('File deleted', 'error') }} />
                </div>
              ))}
              {!files.length && <p className="py-6 text-center text-sm text-slate-400">No files yet — upload the OM and supporting docs.</p>}
            </div>
          </div>

          {/* Prospects */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
              Prospects <span className="rounded-full bg-slate-100 px-1.5 text-xs font-semibold text-slate-500">{prospects.length}</span>
            </p>
            <p className="text-xs text-slate-400">Everyone who passed (or requested) access to this room</p>
            <div className="scrollbar-slim mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-3 font-semibold">Prospect</th>
                    <th className="py-2 pr-3 font-semibold">Access</th>
                    <th className="py-2 pr-3 font-semibold">Engagement</th>
                    <th className="py-2 pr-3 font-semibold">Status</th>
                    <th className="py-2 font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prospects.map((p, i) => (
                    <tr key={p.id}>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-[10px] font-bold text-white">{p.initials}</div>
                          <div>
                            <p className="flex items-center gap-1 font-semibold text-slate-800">{p.name} <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /></p>
                            <p className="text-xs text-slate-400">{p.email} · {p.company}</p>
                            <p className="text-[10px] text-slate-300">ref {p.ref}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${accessBadge(p.access)}`}>{p.access}</span>
                        <p className="mt-1 text-[11px] text-slate-400">3d ago</p>
                      </td>
                      <td className="py-3 pr-3 text-slate-500">
                        <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{p.views} <FileText className="ml-1 h-3.5 w-3.5" />{p.downloads}</span>
                        <p className="mt-1 text-[11px] text-slate-400">{p.seen}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">{p.status}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-0.5">
                          <IconButton icon={Download} label="Export" onClick={() => exportProspect(p)} />
                          <IconButton icon={Trash2} label="Remove" tone="danger" onClick={() => { setProspects((l) => l.filter((x) => x.id !== p.id)); notify('Prospect removed', 'error') }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-900">Activity</p>
            <p className="text-xs text-slate-400">Room views, OM opens, and downloads as they happen</p>
            <div className="mt-3 space-y-3">
              {DEFAULT_ROOM_ACTIVITY.map((a, i) => {
                const Icon = a.icon
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <Icon className={`h-4 w-4 shrink-0 ${a.color}`} />
                    <span className="flex-1 text-slate-600">
                      <span className="font-semibold text-slate-800">{a.who}</span> {a.text}
                    </span>
                    <span className="text-xs text-slate-400">3d ago</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          {/* Access gate */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-900">Access gate</p>
            <p className="text-xs text-slate-400">Who can view the OM & these files</p>
            <div className="mt-3">
              <SelectInput value={access} onChange={(e) => { setAccess(e.target.value); notify('Access gate updated') }} options={DEAL_ROOM_ACCESS} />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {access === 'Free Access' ? 'Anyone can view and download — no gate.' : `Visitors must pass the "${access}" gate before viewing.`}
            </p>
          </div>

          {/* Room settings */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-900">Room settings</p>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Status</label>
                <div className="mt-1">
                  <SelectInput value={status} onChange={(e) => setStatus(e.target.value)} options={['Active', 'Archived (visitors blocked)']} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Access duration (days)</label>
                <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className={`${inputCls} mt-1`} />
                <p className="mt-1 text-[11px] text-slate-400">How long an approved visitor's unlock lasts.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Notifications</p>
                <SettingRow label="Email me on NDA sign"><Toggle on={notifyNda} onChange={setNotifyNda} /></SettingRow>
                <SettingRow label="Email me on file download"><Toggle on={notifyDl} onChange={setNotifyDl} /></SettingRow>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Watermark downloads</span>
                  <Toggle on={watermark} onChange={setWatermark} />
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                  Stamps each downloaded PDF with the recipient's email, download time, and a trace id — so a leaked document points back to who pulled it.
                </p>
                {watermark && (
                  <div className="mt-2 inline-flex rounded-lg bg-slate-100 p-1">
                    {['Standard (Visible)', 'Subtle (Faint)'].map((s) => (
                      <button key={s} onClick={() => setWmStyle(s)} className={`rounded-md px-3 py-1 text-xs font-semibold transition ${wmStyle === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Your NDA */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-900">Your NDA</p>
            <p className="text-xs text-slate-400">What visitors sign before access</p>
            {nda ? (
              <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 shrink-0 text-rose-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{nda.name}</p>
                    <p className="text-[11px] text-slate-400">Visitors sign this uploaded PDF</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                  <button onClick={previewNda} className="text-brand hover:underline">Preview</button>
                  <button onClick={() => ndaRef.current && ndaRef.current.click()} className="text-slate-500 hover:text-slate-700">Replace</button>
                  <button onClick={() => { setNda(null); notify('NDA removed', 'error') }} className="text-rose-500 hover:text-rose-600">Remove</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => ndaRef.current && ndaRef.current.click()}
                className="mt-3 flex w-full flex-col items-center gap-1 rounded-lg border border-dashed border-slate-300 py-6 text-sm font-medium text-slate-500 transition hover:border-orange-400 hover:text-brand"
              >
                <Upload className="h-5 w-5" />
                Upload NDA PDF
              </button>
            )}
            <input ref={ndaRef} type="file" className="hidden" onChange={onNdaUpload} />
          </div>

          {/* Share */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-900">Share</p>
            <p className="text-xs text-slate-400">Send prospects to the gated landing page</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={openVisitor}
                className="flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-500 transition hover:text-brand"
                title="Open gated landing page"
              >
                {visitorUrl}
              </button>
              <IconButton icon={ExternalLink} label="Open" onClick={openVisitor} />
              <IconButton icon={Copy} label="Copy" onClick={() => copy(visitorUrl, 'Share link copied')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DealRoomsPage({ dealRooms, setDealRooms, onEditDocument }) {
  const notify = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [openRoom, setOpenRoom] = useState(null)

  const create = (data) => {
    setDealRooms((list) => [
      { id: uid(), files: 0, members: 0, updated: 'just now', image: '', ...data },
      ...list,
    ])
    notify('Deal room created')
    setModalOpen(false)
  }
  const doDelete = () => {
    setDealRooms((list) => list.filter((r) => r.id !== confirm.id))
    notify('Deal room deleted', 'error')
    setConfirm(null)
  }

  if (openRoom) {
    return (
      <div className="mx-auto max-w-[1600px] p-6">
        <DealRoomDetail room={openRoom} onBack={() => setOpenRoom(null)} notify={notify} onEditDocument={onEditDocument} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
            <FolderLock className="h-6 w-6 text-brand" />
            Deal Rooms
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Confidential files behind your listing's access gate — rent rolls, financials, leases.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => notify('Guided tour coming soon')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <HelpCircle className="h-4 w-4" />
            Show me around
          </button>
          <PrimaryButton icon={Plus} onClick={() => setModalOpen(true)}>
            New deal room
          </PrimaryButton>
        </div>
      </div>

      {dealRooms.length ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {dealRooms.map((room, i) => (
            <DealRoomCard
              key={(room.id ?? 'room') + '-' + i}
              room={room}
              onOpen={() => setOpenRoom(room)}
              onDelete={() => setConfirm(room)}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No deal rooms yet" subtitle="Create a secure deal room to share confidential files with buyers." />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Deal Room">
        <DealRoomForm onSubmit={create} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={doDelete}
        title="Delete deal room?"
        message={`"${confirm?.name}" and its files will be permanently removed.`}
      />
    </div>
  )
}

function DealCard({ deal, accent, dragging, onDragStart, onDragEnd, onDelete }) {
  const initials = deal.agent
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`cursor-grab rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md active:cursor-grabbing ${
        dragging ? 'opacity-40 ring-2 ring-orange-300' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-900">{deal.property}</h4>
        <IconButton icon={Trash2} label="Remove deal" tone="danger" onClick={onDelete} />
      </div>

      <div className="mt-2 text-lg font-extrabold text-slate-900">{currency(deal.value)}</div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">Progress</span>
          <span className="font-semibold text-slate-700">{deal.progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${accent}`} style={{ width: `${deal.progress}%` }} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-[10px] font-bold text-white">
            {initials}
          </div>
          <span className="text-xs font-medium text-slate-600">{deal.agent}</span>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{deal.stage}</span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Placeholder Screens                                                       */
/* -------------------------------------------------------------------------- */

function PlaceholderPage({ label, icon: Icon }) {
  const notify = useToast()
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-brand">
        <Icon className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold text-slate-900">{label}</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        This module is part of the MyCREBlueprint suite. The interface for{' '}
        <span className="font-semibold text-slate-700">{label}</span> is coming soon in this demo build.
      </p>
      <div className="mt-6">
        <PrimaryButton icon={Plus} onClick={() => notify(`${label} — coming soon`)}>
          Get Started
        </PrimaryButton>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Team & Permissions (Admin)                                                */
/* -------------------------------------------------------------------------- */

function PermToggle({ on, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`relative h-5 w-9 shrink-0 rounded-full transition disabled:opacity-40 ${on ? 'bg-brand' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}

function TeamPermissionsPage({ myUid }) {
  const notify = useToast()
  const [users, setUsers] = useState({})
  const [openUid, setOpenUid] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Member', allPerms: false })
  const [busy, setBusy] = useState(false)

  const submitMember = async () => {
    const { name, email, password, role, allPerms } = form
    if (!email.trim() || password.length < 6) { notify('Enter an email and a password of 6+ characters', 'error'); return }
    setBusy(true)
    try {
      const uid = await createMemberAccount({ email: email.trim(), password, name: name.trim() || email.trim().split('@')[0] })
      const overrides = allPerms ? encodeOverrides(Object.fromEntries(PERMISSION_GROUPS.flatMap((g) => g.perms.map((p) => [p.key, true])))) : {}
      await dbSet(dbRef(db, `users/${uid}`), { name: name.trim() || email.trim().split('@')[0], email: email.trim(), role, overrides })
      notify('Member added')
      setAddOpen(false); setForm({ name: '', email: '', password: '', role: 'Member', allPerms: false })
    } catch (e) {
      const msg = e.code === 'auth/email-already-in-use' ? 'That email already has an account' : e.code === 'auth/weak-password' ? 'Password should be at least 6 characters' : 'Could not add member — check the details and DB rules'
      notify(msg, 'error')
    } finally { setBusy(false) }
  }

  useEffect(() => {
    return onValue(dbRef(db, 'users'), (snap) => { setUsers(snap.val() || {}); setLoading(false) }, () => { setErr(true); setLoading(false) })
  }, [])

  const list = Object.entries(users).map(([uid, u]) => ({ uid, ...u })).sort((a, b) => (a.name || '').localeCompare(b.name || ''))

  const setUserRole = (uid, role) => { dbUpdate(dbRef(db, `users/${uid}`), { role }).then(() => notify('Role updated')).catch(() => notify('Save failed — check DB rules', 'error')) }
  const togglePerm = (uid, key) => {
    const u = users[uid]; if (!u) return
    const overrides = decodeOverrides(u.overrides) // dotted keys
    const eff = resolvePerms(u.role, overrides)
    const preset = new Set(ROLE_PRESETS[u.role] || [])
    const desired = !eff.has(key)
    if (desired === preset.has(key)) delete overrides[key]
    else overrides[key] = desired
    dbSet(dbRef(db, `users/${uid}/overrides`), encodeOverrides(overrides)).catch(() => notify('Save failed — check DB rules', 'error'))
  }

  const roleBadge = (r) => ({ Admin: 'bg-amber-50 text-amber-700', Member: 'bg-slate-100 text-slate-600', Coordinator: 'bg-emerald-50 text-emerald-700' }[r] || 'bg-slate-100 text-slate-600')

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500"><Users className="h-6 w-6" /></div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Team &amp; Permissions</h1>
            <p className="mt-1 text-sm text-slate-500">Set each member's role, then fine-tune exactly which functions they can use.</p>
          </div>
        </div>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"><Plus className="h-4 w-4" /> Add Member</button>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => !busy && setAddOpen(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-extrabold text-slate-900">Add Team Member</h3>
              <button onClick={() => setAddOpen(false)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-xs text-slate-500">Creates a login for the member. Share the email &amp; password with them — they can change the password later.</p>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Full Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="jane@company.com" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Temporary Password</label>
                <input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="At least 6 characters" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Role</label>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={inputCls}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.allPerms} onChange={(e) => setForm((f) => ({ ...f, allPerms: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-orange-300" />
                Grant <b>all permissions</b> to this member
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
              <button onClick={() => setAddOpen(false)} disabled={busy} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900">Cancel</button>
              <button onClick={submitMember} disabled={busy} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60">{busy ? 'Adding…' : 'Add Member'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-800">
        New members join by choosing <b>Create account</b> on the sign-in page. They start as <b>Member</b> and appear here — then you adjust their access below.
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-slate-400">Loading team…</p>
      ) : err ? (
        <p className="mt-8 rounded-lg bg-amber-50 p-4 text-sm text-amber-700">Couldn't read the team from Firebase. Make sure Realtime Database rules allow authenticated reads of <code>/users</code>.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {list.map((u) => {
            const eff = resolvePerms(u.role, decodeOverrides(u.overrides))
            const isMe = u.uid === myUid
            const open = openUid === u.uid
            return (
              <div key={u.uid} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">{(u.name || u.email || '?').slice(0, 1).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{u.name || '—'} {isMe && <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">You</span>}</p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadge(u.role)}`}>{u.role}</span>
                  <select value={u.role} onChange={(e) => setUserRole(u.uid, e.target.value)} disabled={isMe} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none disabled:opacity-50">
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <button onClick={() => setOpenUid(open ? null : u.uid)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    Permissions <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {open && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                    {isMe && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">You can't remove your own admin access here.</p>}
                    <div className="grid gap-5 sm:grid-cols-2">
                      {PERMISSION_GROUPS.map((grp) => (
                        <div key={grp.group}>
                          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">{grp.group}</p>
                          <div className="space-y-1.5">
                            {grp.perms.map((p) => {
                              const preset = (ROLE_PRESETS[u.role] || []).includes(p.key)
                              const on = eff.has(p.key)
                              const overridden = on !== preset
                              return (
                                <div key={p.key} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
                                  <span className="text-sm text-slate-700">{p.label}{overridden && <span className="ml-1.5 rounded bg-orange-50 px-1 py-0.5 text-[9px] font-bold uppercase text-orange-600">custom</span>}</span>
                                  <PermToggle on={on} onClick={() => togglePerm(u.uid, p.key)} disabled={isMe} />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main App                                                                  */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [active, setActive] = useState('dashboard')
  const [user, setUser] = useState(CURRENT_USER)
  const [myUid, setMyUid] = useState(null)
  const [role, setRole] = useState('Member')
  const [perms, setPerms] = useState(() => new Set())
  const can = (key) => perms.has(key)

  // Firebase Auth is the source of truth. On sign-in we ensure a profile exists
  // in the Realtime DB (the FIRST account to sign up becomes the Admin), then
  // resolve that user's effective permissions from their role + overrides.
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        const name = u.displayName || (u.email ? u.email.split('@')[0] : CURRENT_USER.name)
        setUser({ ...CURRENT_USER, name, email: u.email || '', initials: name.slice(0, 1).toUpperCase() })
        setMyUid(u.uid)
        setIsLoggedIn(true)
        saveUser({ name, email: u.email }).catch(() => {})
        let profile = null
        try {
          const usersSnap = await dbGet(dbRef(db, 'users'))
          const users = usersSnap.val() || {}
          profile = users[u.uid]
          if (!profile) {
            const isFirst = Object.keys(users).length === 0
            profile = { name, email: u.email || '', role: isFirst ? 'Admin' : 'Member', overrides: {}, createdAt: u.metadata?.creationTime || '' }
            await dbSet(dbRef(db, `users/${u.uid}`), profile)
          }
        } catch {
          // DB unreachable / rules blocking — fall back to Member (no elevated access).
          profile = { role: 'Member', overrides: {} }
        }
        setRole(profile.role || 'Member')
        setPerms(resolvePerms(profile.role || 'Member', decodeOverrides(profile.overrides)))
      } else {
        setIsLoggedIn(false)
        setRole('Member')
        setPerms(new Set())
        setMyUid(null)
      }
      setAuthReady(true)
    })
  }, [])
  const [query, setQuery] = useState('')

  // Live app data — shared across screens
  const [packages, setPackages] = useState(INITIAL_PACKAGES)
  const [listings, setListings] = useState(INITIAL_LISTINGS)
  const [deals, setDeals] = useState(INITIAL_DEALS)
  const [dealRooms, setDealRooms] = useState(INITIAL_DEAL_ROOMS)

  // Load from MongoDB on startup (falls back to seed data if the backend is offline),
  // then persist any change back to the database.
  const [dbLoaded, setDbLoaded] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [createNonce, setCreateNonce] = useState(0)
  const [resume, setResume] = useState(null) // { draft, nonce } — resume a builder draft
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [p, l, d] = await Promise.all([getCol('packages'), getCol('listings'), getCol('dealrooms')])
        if (!alive) return
        if (p && p.length) setPackages(p)
        else await putCol('packages', INITIAL_PACKAGES)
        if (l && l.length) setListings(l)
        else await putCol('listings', INITIAL_LISTINGS)
        if (d && d.length) setDealRooms(d)
        else await putCol('dealrooms', INITIAL_DEAL_ROOMS)
      } catch {
        /* backend not running — keep in-memory seed data */
      }
      if (alive) setDbLoaded(true)
    })()
    return () => {
      alive = false
    }
  }, [])
  useEffect(() => {
    if (dbLoaded) putCol('packages', packages).catch(() => {})
  }, [packages, dbLoaded])
  useEffect(() => {
    if (dbLoaded) putCol('listings', listings).catch(() => {})
  }, [listings, dbLoaded])
  useEffect(() => {
    if (dbLoaded) putCol('dealrooms', dealRooms).catch(() => {})
  }, [dealRooms, dbLoaded])

  // onAuthStateChanged already sets the user + logged-in flag; just reset the view.
  const handleLogin = () => { setActive('dashboard') }

  const handleSignOut = () => {
    setQuery('')
    signOut(auth).catch(() => {})
  }

  const navigate = (key) => {
    setActive(key)
    setQuery('')
    setMobileNav(false)
  }

  // "Create New" (document) — usable from Dashboard and Listing Hub.
  // Goes to the Dashboard and opens the create-document flow there.
  const startCreate = () => {
    setActive('dashboard')
    setMobileNav(false)
    setCreateNonce((n) => n + 1)
  }

  // Resume an in-progress draft from the Listing Hub — jumps to the Dashboard and
  // reopens the Document Builder where the user left off.
  const resumeDraft = (draft) => {
    if (!draft) return
    setActive('dashboard')
    setMobileNav(false)
    setResume({ draft, nonce: (resume?.nonce || 0) + 1 })
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-400">
        <div className="flex items-center gap-2 text-sm font-medium">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand" /> Loading…
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <ToastProvider>
        <LoginPage onLogin={handleLogin} />
      </ToastProvider>
    )
  }

  const activeLabel = NAV_ITEMS.find((n) => n.key === active)?.label || 'Dashboard'

  const renderScreen = () => {
    switch (active) {
      case 'dashboard':
        return <DashboardPage packages={packages} setPackages={setPackages} setListings={setListings} globalQuery={query} createNonce={createNonce} resume={resume} onResumeHandled={() => setResume(null)} onNavigate={navigate} onSignOut={handleSignOut} user={user} can={can} />
      case 'listings':
        return <ListingHubPage listings={listings} setListings={setListings} globalQuery={query} onCreateNew={startCreate} onResumeDraft={resumeDraft} can={can} />
      case 'deals':
        return <DealRoomsPage dealRooms={dealRooms} setDealRooms={setDealRooms} onEditDocument={resumeDraft} />
      case 'team':
        return <TeamPermissionsPage myUid={myUid} />
      case 'documents':
        return <PlaceholderPage label="Documents" icon={FileText} />
      case 'crm':
        return <PlaceholderPage label="CRM" icon={Contact} />
      case 'email':
        return <PlaceholderPage label="Email Blasts" icon={Send} />
      case 'templates':
        return <PlaceholderPage label="Custom Templates" icon={Wand2} />
      case 'knowledge':
        return <PlaceholderPage label="Knowledge Base" icon={BookOpen} />
      default:
        return <DashboardPage packages={packages} setPackages={setPackages} setListings={setListings} globalQuery={query} createNonce={createNonce} resume={resume} onResumeHandled={() => setResume(null)} onNavigate={navigate} onSignOut={handleSignOut} user={user} can={can} />
    }
  }

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar active={active} onNavigate={navigate} onSignOut={handleSignOut} user={user} can={can} responsiveCollapse />
        </div>

        {/* Mobile slide-in drawer */}
        {mobileNav && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              style={{ animation: 'drawer-fade 0.25s ease-out' }}
              onClick={() => setMobileNav(false)}
            />
            <div className="absolute left-0 top-0 h-full shadow-2xl" style={{ animation: 'drawer-in 0.3s ease-out' }}>
              <Sidebar
                active={active}
                onNavigate={(k) => { setMobileNav(false); navigate(k) }}
                onClose={() => setMobileNav(false)}
                onSignOut={() => {
                  setMobileNav(false)
                  handleSignOut()
                }}
                user={user}
                can={can}
              />
            </div>
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Mobile-only sticky header: menu · logo · create */}
          <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 py-2 md:hidden">
            <button
              onClick={() => setMobileNav(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-sm">
              <Box className="h-5 w-5" />
            </div>
            {can('document.create') ? (
              <button
                onClick={startCreate}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600"
                aria-label="Create new"
              >
                <Plus className="h-6 w-6" />
              </button>
            ) : (
              <span className="h-10 w-10" />
            )}
          </header>
          <main className="scrollbar-slim relative min-h-0 flex-1 overflow-y-auto">{renderScreen()}</main>
        </div>
      </div>
    </ToastProvider>
  )
}
