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
  Zap,
  ClipboardList,
  TrendingUp,
  BarChart3,
  Camera,
  Image as ImageIcon,
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
  email: 'waqas.axecorp@gmail.com',
  role: 'Broker · Axe Corp',
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
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=60'

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
        title: `CREbuilder — ${title}`,
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
  doc.text('CREbuilder', M, 46)
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
  doc.text('Generated by CREbuilder · Demo build', M, 778)

  const safe = title.replace(/[^a-z0-9]+/gi, '_')
  doc.save(`${safe}.pdf`)
  notify('PDF downloaded')
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'listings', label: 'Listing Hub', icon: Globe },
  { key: 'deals', label: 'Deal Rooms', icon: FolderLock },
  { key: 'crm', label: 'CRM', icon: Contact, dot: true },
  { key: 'email', label: 'Email Blasts', icon: Send },
  { key: 'templates', label: 'Custom Templates', icon: Wand2 },
  { key: 'knowledge', label: 'Knowledge Base', icon: BookOpen, dividerBefore: true },
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
  const [email, setEmail] = useState('waqas.axecorp@gmail.com')
  const [password, setPassword] = useState('demo1234')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }
    setError('')
    onLogin({ email })
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
          <span className="text-xl font-extrabold tracking-tight">CREbuilder</span>
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
          © 2026 CREbuilder. All rights reserved.
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-slate-50 p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              CREbuilder
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to your workspace to continue.
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
              <button type="button" className="font-semibold text-brand hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-orange-300 active:scale-[0.99]"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Demo build — any email &amp; password will sign you in.
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
          <span className="text-brand">CRE</span>builder
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

function Sidebar({ active, onNavigate, onSignOut, user }) {
  const [collapsed, setCollapsed] = useState(false)
  const [showPromo, setShowPromo] = useState(true)

  return (
    <aside
      className={`relative flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-100 px-5">
        <Logo collapsed={collapsed} />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-14 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:text-brand"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ key, label, icon: Icon, dot, dividerBefore }) => {
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
      {!collapsed && showPromo && <UpgradeCard onDismiss={() => setShowPromo(false)} />}

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
          {pkg.updated && (
            <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              {pkg.updated}
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
function PreviewPage({ index, brandColor, docType }) {
  const p = PREVIEW_PROPERTY
  if (index === 0) {
    return (
      <div className="flex h-[72vh] flex-col">
        <div className="relative h-[52%] shrink-0">
          <img src={FALLBACK_IMG} alt="" className="h-full w-full object-cover" />
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
            <img src={FALLBACK_IMG} alt="" className="h-56 w-full rounded-lg object-cover" />
            <div className="h-3 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
          </>
        )}
        {variant === 1 && (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            {Array.from({ length: 7 }).map((_, r) => (
              <div key={r} className={`flex items-center justify-between px-4 py-2.5 ${r === 0 ? 'text-white' : r % 2 ? 'bg-slate-50' : 'bg-white'}`} style={r === 0 ? { background: brandColor } : undefined}>
                <div className={`h-2.5 w-1/3 rounded ${r === 0 ? 'bg-white/70' : 'bg-slate-300'}`} />
                <div className={`h-2.5 w-16 rounded ${r === 0 ? 'bg-white/70' : 'bg-slate-200'}`} />
                <div className={`h-2.5 w-12 rounded ${r === 0 ? 'bg-white/70' : 'bg-slate-200'}`} />
              </div>
            ))}
          </div>
        )}
        {variant === 2 && (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-4">
                <div className="mb-2 h-6 w-6 rounded" style={{ background: brandColor }} />
                <div className="h-2.5 w-3/4 rounded bg-slate-200" />
                <div className="mt-1.5 h-2.5 w-1/2 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}
        {variant === 3 && (
          <div className="space-y-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: brandColor }} />
                <div className="h-2.5 rounded bg-slate-200" style={{ width: `${90 - i * 6}%` }} />
              </div>
            ))}
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
function MiniPage({ index, brandColor }) {
  if (index === 0) {
    return (
      <div className="h-full w-full">
        <img src={FALLBACK_IMG} alt="" className="h-2/3 w-full object-cover" />
        <div className="h-1/3 bg-white" style={{ borderTop: `2px solid ${brandColor}` }} />
      </div>
    )
  }
  return (
    <div className="h-full w-full bg-white">
      <div className="h-2" style={{ background: brandColor }} />
      <div className="space-y-1 p-1.5">
        <div className="h-1 w-3/4 rounded bg-slate-200" />
        <div className="h-1 w-1/2 rounded bg-slate-100" />
        <div className="h-1 w-2/3 rounded bg-slate-100" />
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
          <PreviewPage index={page} brandColor={brandColor} docType={docType} />
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
            <MiniPage index={i} brandColor={brandColor} />
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
          <span className="text-brand">CRE</span>builder
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
        <div className="mx-auto flex max-w-7xl items-center justify-between">
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
    ] },
    { title: 'Property Description', cards: [
      '[Property Name] encompasses [Building SF] square feet of leasable [Property Type] space situated on a [Lot Size]-acre parcel. Originally constructed in [Year Built], the property features [Construction] construction with [Parking] parking spaces, providing ample convenience for tenants and customers alike.',
      'Built in [Year Built], [Property Name] offers [Building SF] square feet across a [Lot Size]-acre site, with quality [Construction] construction and [Parking] dedicated parking spaces.',
      '[Property Name] is a [Building SF]-square-foot [Property Type] property featuring durable [Construction] construction, ample [Parking] parking, and excellent frontage along [Street].',
    ] },
    { title: 'Location & Access', cards: [
      'Strategically positioned in [City], [State], [Property Name] enjoys strong visibility along [Street] with convenient regional access and proximity to major demand drivers.',
      '[Property Name] benefits from a prime [City] location, with excellent access via [Street] and a surrounding trade area of [Population] residents within a [Radius]-mile radius.',
      'Located at [Street] in [City], [State], the property sits within an established trade area supported by strong daytime population and [Traffic Count] vehicles per day.',
    ] },
    { title: 'Investment Thesis', cards: [
      'This offering represents a compelling opportunity to acquire [Property Name] at an attractive [Cap Rate] cap rate, with [Lease Term] remaining and built-in [Escalations] escalations driving predictable cash flow.',
      'With durable in-place income and below-market rents, [Property Name] offers investors both stability and upside in the growing [City], [State] market.',
      '[Property Name] presents an attractive risk-adjusted return, combining a well-located [Property Type] asset with a clear value-creation strategy and long-term appreciation potential.',
    ] },
    { title: 'Closing Statement', cards: [
      'In summary, [Property Name] combines a prime [City], [State] location, [Occupancy] occupancy, and [Cap Rate] returns into a single institutional-quality offering.',
      '[Property Name] is an institutional-quality [Property Type] offering in [City], [State] that merits serious consideration from discerning investors.',
      'We welcome the opportunity to discuss [Property Name] further and to arrange a private tour of this well-positioned [City] asset.',
    ] },
  ],
  'Investment Highlights': [
    { title: 'Income Stability', cards: [
      '[Property Name] is [Occupancy] leased to [Anchor Tenants], generating [NOI] in net operating income with [Escalations] annual rent escalations that hedge against inflation.',
      'Backed by a creditworthy tenant base, [Property Name] delivers [NOI] of stable net operating income with contractual rent growth over the hold period.',
      'The property’s [Occupancy] occupancy and staggered lease expirations provide [Property Name] with a resilient, diversified income stream.',
    ] },
    { title: 'Location Advantage', cards: [
      'Located in the high-growth [City], [State] corridor, [Property Name] benefits from [Traffic Count] vehicles per day and a trade-area population of [Population].',
      '[Property Name] enjoys premier frontage along [Street], placing it directly in the path of growth within the [City] market.',
      'Surrounded by strong demand drivers, [Property Name] offers exceptional accessibility and visibility in one of [City]’s most sought-after submarkets.',
    ] },
    { title: 'Value-Add Upside', cards: [
      'With [Vacancy] of vacant space and below-market rents, [Property Name] offers meaningful upside through lease-up and mark-to-market rent growth.',
      'Investors can unlock additional value at [Property Name] through cosmetic renovations, expense optimization, and renewing tenants to market rents.',
      '[Property Name] provides a clear value-add path, positioning new ownership to grow NOI and expand asset value over time.',
    ] },
  ],
  'Location Highlights': [
    { title: 'Market Overview', cards: [
      '[Property Name] is situated in [City], [State], one of the region’s most active [Property Type] submarkets, supported by strong population and job growth.',
      'The [City], [State] market continues to attract residents and employers, providing a durable demand base for [Property Name].',
      'Positioned in a supply-constrained corridor, [Property Name] benefits from limited competition and steady tenant demand.',
    ] },
    { title: 'Access & Visibility', cards: [
      'The property enjoys prominent frontage along [Street] with [Traffic Count] vehicles per day and direct access to [Highway], ensuring exceptional visibility.',
      '[Property Name] offers convenient ingress and egress from [Street], with strong signage visibility to passing traffic.',
      'Located at [Street] in [City], the asset is easily accessible from major thoroughfares and regional transit routes.',
    ] },
    { title: 'Demographics', cards: [
      'Within a [Radius]-mile radius, the trade area is home to [Population] residents with an average household income of [Income], underpinning strong consumer demand.',
      'The surrounding population of [Population] and growing household incomes provide a deep customer base for tenants at [Property Name].',
      'Favorable demographics — including a daytime population of [Daytime Population] — reinforce the long-term stability of [Property Name].',
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
  const { name, docType, price, priceVis, location, owner, ownerEmail, dataPoints, brand, sections } = data
  const initials = (owner || 'W').split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()
  const showPrice = priceVis === 'Show' && price
  const mapBlock = (
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
        <div className="relative flex-1" style={{ background: 'repeating-linear-gradient(45deg,#eef2f7,#eef2f7 14px,#e8eef6 14px,#e8eef6 28px)' }}>
          <div className="absolute bottom-4 right-5 flex items-center gap-2 rounded-md bg-white/80 px-3 py-1.5">
            <Building2 className="h-4 w-4" style={{ color: brand }} />
            <span className="text-xs font-extrabold tracking-tight text-slate-700">CREbuilder</span>
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
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Agent · CREbuilder</p>
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
function MiniMap({ lat, lng }) {
  const elRef = useRef(null)
  useEffect(() => {
    if (!elRef.current) return
    const has = typeof lat === 'number' && !Number.isNaN(lat)
    const map = L.map(elRef.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false }).setView(has ? [lat, lng] : [39.8, -98.5], has ? 13 : 4)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(map)
    if (has) {
      const pin = L.divIcon({ className: '', html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="1.5"><path d="M12 2C8 2 5 5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/></svg>`, iconSize: [30, 30], iconAnchor: [15, 30] })
      L.marker([lat, lng], { icon: pin }).addTo(map)
    }
    const t = setTimeout(() => map.invalidateSize(), 150)
    return () => { clearTimeout(t); map.remove() }
  }, [lat, lng])
  return <div ref={elRef} className="h-40 w-full overflow-hidden rounded-lg bg-slate-100" />
}

// Confirm-location modal: draggable Leaflet pin, opens after Property Details.
function LocationPickerModal({ open, initial, address, onConfirm, onClose }) {
  const elRef = useRef(null)
  const posRef = useRef(null)

  useEffect(() => {
    if (!open || !elRef.current) return
    const hasInit = initial && typeof initial[0] === 'number'
    const start = hasInit ? initial : [30.3753, 69.3451] // fallback: center of Pakistan
    posRef.current = start
    const map = L.map(elRef.current, { scrollWheelZoom: true }).setView(start, hasInit ? 15 : 5)
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
    const t = setTimeout(() => map.invalidateSize(), 120)
    return () => {
      clearTimeout(t)
      map.remove()
    }
  }, [open, initial])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <MapPin className="h-5 w-5 text-brand" /> Confirm Property Location
            </h3>
            {address && <p className="mt-0.5 text-sm text-slate-500">{address}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div ref={elRef} className="h-80 w-full bg-slate-100" />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
          <p className="text-xs text-slate-500">Drag the pin or click the map to fine-tune the exact location.</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
            <button onClick={() => onConfirm(posRef.current)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">
              <Check className="h-4 w-4" /> Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const BUILDER_SESSION_KEY = 'crebuilder_builder_session'
function DocumentBuilder({ config, initial, draftId, onExit, onChangeType, onSave, notify }) {
  const [step, setStep] = useState(initial?.step || 0)
  // Mark every step before the resume point as completed.
  const [done, setDone] = useState(() => {
    const d = {}
    for (let i = 0; i < (initial?.step || 0); i++) d[i] = true
    return d
  })
  const [mapOpen, setMapOpen] = useState(false)
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
      street: '', city: '', state: '', zip: '', customDisplay: false, displayAddress: '',
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
    // After Property Details, confirm the map location before moving on.
    if (step === 0) {
      setMapOpen(true)
      return
    }
    setDone((d) => ({ ...d, [step]: true }))
    // Cap Rate & NOI / Skip scopes skip the Rent Roll step from Financials (6).
    if (step === 6 && form.finType === 'Cap Rate & NOI') { setStep(8); return }
    if (step === 6 && form.finType === 'Skip Financials') { setStep(9); return }
    if (last) onSave(form, step, true)
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
  const readFiles = (files) =>
    Promise.all(
      [...files].map(
        (file) =>
          new Promise((resolve) => {
            const r = new FileReader()
            r.onload = () => resolve({ id: uid(), name: file.name, url: r.result })
            r.readAsDataURL(file)
          }),
      ),
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
  const addMap = () => setForm((f) => ({ ...f, maps: [...(f.maps || []), { id: uid(), title: `Map ${(f.maps?.length || 0) + 1}`, lat: f.lat, lng: f.lng }] }))
  const updMap = (id, title) => setForm((f) => ({ ...f, maps: f.maps.map((m) => (m.id === id ? { ...m, title } : m)) }))
  const delMap = (id) => setForm((f) => ({ ...f, maps: f.maps.filter((m) => m.id !== id) }))
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
      const hit = form.dataPoints.find((p) => p.label.toLowerCase() === l.toLowerCase() && p.value)
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
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
            <div className={`mx-auto px-6 py-8 ${isMedia || isFinancials || isConfidentiality ? 'max-w-5xl' : isMarket ? 'max-w-6xl' : isContacts ? 'max-w-3xl' : 'max-w-none'}`}>
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
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                            <input value={form.price} onChange={set('price')} type="number" placeholder="e.g. 2,500,000" className={`${inputCls} pl-7`} />
                          </div>
                          <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1">
                            {['Show', 'Hide', 'Negotiable'].map((o) => (
                              <button key={o} onClick={() => setForm((f) => ({ ...f, priceVis: o }))} className={`${seg} ${form.priceVis === o ? 'bg-brand text-white shadow-sm' : 'text-slate-500'}`}>{o}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <h3 className="mt-6 text-base font-bold text-slate-900">Property Address</h3>
                  <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="inline-flex rounded-lg bg-slate-100 p-1">
                      {[{ k: 'US', l: 'United States' }, { k: 'CA', l: 'Canada' }].map((c) => (
                        <button key={c.k} onClick={() => setForm((f) => ({ ...f, country: c.k }))} className={`${seg} ${form.country === c.k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>{c.l}</button>
                      ))}
                    </div>
                    <div className="mt-3 inline-flex rounded-lg bg-slate-100 p-1">
                      {[{ k: 'address', l: 'Search by Address' }, { k: 'parcel', l: 'Search by Parcel' }].map((m) => (
                        <button key={m.k} onClick={() => setForm((f) => ({ ...f, searchMode: m.k }))} className={`${seg} inline-flex items-center gap-1.5 ${form.searchMode === m.k ? 'bg-white text-brand shadow-sm' : 'text-slate-500'}`}>
                          {m.k === 'address' ? <MapPin className="h-4 w-4" /> : <Search className="h-4 w-4" />}{m.l}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4">
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
                <div className="max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><EyeOff className="h-5 w-5" /></div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Financials Skipped</h2>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"><EyeOff className="h-3.5 w-3.5" /> {finType}</span>
                    <button onClick={() => setStep(6)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"><Repeat2 className="h-3.5 w-3.5" /> Change</button>
                  </div>
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <EyeOff className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-3 font-bold text-slate-700">No financial pages in this document</p>
                    <p className="mt-1 text-sm text-slate-500">You chose to skip financials, so no rent roll, income &amp; expenses, or valuation pages will be generated. You can change this anytime.</p>
                    <button onClick={() => setStep(6)} className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Repeat2 className="h-4 w-4" /> Change Financial Scope</button>
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

                  <div className="mt-6 grid gap-8 lg:grid-cols-2">
                    {/* Left column */}
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Page Title</label>
                      <input value={form.moTitle || ''} onChange={(e) => setForm((f) => ({ ...f, moTitle: e.target.value }))} placeholder="e.g., Market Overview: The Greater Houston Metropolitan Area" className={inputCls} />
                      <p className="mt-1 text-xs text-slate-400">Appears as the heading on the PDF page</p>

                      <label className="mb-1 mt-4 block text-sm font-semibold text-slate-700">About Text</label>
                      <div className="overflow-hidden rounded-xl border border-slate-200">
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
                        <div className="relative">
                          <div
                            ref={moRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={() => setForm((f) => ({ ...f, moAbout: moRef.current?.innerHTML || '' }))}
                            className="scrollbar-slim min-h-[400px] max-h-[520px] overflow-y-auto p-4 text-sm leading-relaxed text-slate-700 outline-none [&_a]:text-brand [&_a]:underline"
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
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {maps.map((m) => (
                          <div key={m.id} className="rounded-xl border border-slate-200 p-2">
                            <div className="relative">
                              <MiniMap lat={m.lat} lng={m.lng} />
                              <div className="absolute right-2 top-2 flex gap-1">
                                <button onClick={() => document.getElementById(`maptitle-${m.id}`)?.focus()} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow ring-1 ring-slate-200 transition hover:text-brand"><Pencil className="h-3.5 w-3.5" /></button>
                                <button onClick={() => delMap(m.id)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-rose-400 shadow ring-1 ring-slate-200 transition hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1 px-1">
                              <input id={`maptitle-${m.id}`} value={m.title} onChange={(e) => updMap(m.id, e.target.value)} className="min-w-0 flex-1 border-none bg-transparent text-sm font-bold text-slate-800 outline-none" />
                              <Pencil className="h-3 w-3 shrink-0 text-slate-300" />
                            </div>
                            <p className="px-1 text-xs text-slate-400">Shown as the page header</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
                            <span>{tokenCount(curGroup.cards[0])}</span>
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
                                <span className="text-slate-400">{tokenCount(g.cards[0])}</span>
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

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
            <button
              onClick={() => (step > 0 ? setStep(step - 1) : onExit())}
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

          {/* Live preview dock — shown from Property Data onward (not on Property Details) */}
          {step >= 1 && (
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
            {BUILDER_SECTIONS.map((s, i) => {
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

      <LocationPickerModal
        open={mapOpen}
        initial={form.lat ? [form.lat, form.lng] : null}
        address={fullAddress || docName}
        onConfirm={confirmLocation}
        onClose={() => setMapOpen(false)}
      />

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

function DashboardPage({ packages, setPackages, setListings, globalQuery, createNonce, resume, onResumeHandled }) {
  const notify = useToast()
  const [subTab, setSubTab] = useState('my')
  const [search, setSearch] = useState('')
  const [docType, setDocType] = useState('All Doc Types')
  const [propType, setPropType] = useState('All Property Types')
  const [status, setStatus] = useState('All Status')
  const [sort, setSort] = useState('Last Modified (Newest)')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)

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
      setBuilderInitial({ form: d.form, step: d.step })
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
    // Everything needed to reopen the builder exactly where the user left off.
    const draft = finished
      ? null
      : {
          id,
          form: bf,
          step,
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
        ? list.map((p) => (p.id === id ? { ...p, ...pkg } : p))
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
      { ...pkg, id: uid(), title: `${pkg.title} (Copy)`, status: 'Draft', progress: pkg.progress ?? 20, updated: 'just now' },
      ...list,
    ])
    notify('Package duplicated')
  }

  // Transfer moves the package between My Docs and Team Docs.
  const transfer = (pkg) => {
    const target = pkg.owner === 'my' ? 'team' : 'my'
    setPackages((list) =>
      list.map((p) => (p.id === pkg.id ? { ...p, owner: target } : p)),
    )
    notify(`Transferred to ${target === 'my' ? 'My' : 'Team'} Docs`)
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
    <div className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Your Marketing Packages</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and create marketing materials for your properties
          </p>
        </div>
        <PrimaryButton icon={Plus} onClick={openCreate}>
          Create New
        </PrimaryButton>
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
          Powered by <span className="font-bold" style={{ color: primary }}>CREBuilder</span>
        </p>
      </div>
    </div>
  )
}

// Builds a fully self-contained microsite HTML page (Leaflet via CDN, data baked
// in) so "Preview" can open the live listings site in a brand-new browser tab.
export function buildMicrositeHtml(items, primary) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Listings — CREbuilder</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,system-ui,-apple-system,sans-serif;background:#f8fafc;color:#0f172a}
.hero{position:relative;height:200px;overflow:hidden;color:#fff;background:${primary}}
.hero .cut{position:absolute;inset:0;background:linear-gradient(115deg,transparent 55%,rgba(0,0,0,.28) 55%)}
.hero .inner{position:relative;height:100%;display:flex;align-items:center;justify-content:space-between;padding:0 40px}
.logo{height:96px;width:160px;border-radius:12px;background:rgba(255,255,255,.15)}
.count b{font-size:48px;font-weight:800;line-height:1;display:block;text-align:right}
.count span{font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;opacity:.85}
.toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:12px;background:#fff;border-bottom:1px solid #e2e8f0;padding:12px 24px;position:sticky;top:0;z-index:1000}
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
.dhero{position:relative;height:520px;overflow:hidden;background:#334155}
.dhero>img{width:100%;height:100%;object-fit:cover}
.dtop{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;padding:14px 20px;z-index:2}
.dbtn{background:rgba(0,0,0,.55);color:#fff;border:0;border-radius:8px;padding:8px 12px;font-size:13px;font-weight:600;cursor:pointer}
.dov{position:absolute;left:0;right:0;bottom:0;padding:26px 0;background:linear-gradient(transparent,rgba(0,0,0,.8));color:#fff}
.dovin{max-width:1180px;margin:0 auto;padding:0 40px}
.dov .bd{display:flex;gap:8px;margin-bottom:10px}
.hbadge{display:inline-block;padding:5px 12px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#fff;white-space:nowrap}
.dov h1{font-size:30px;font-weight:800}
.dov .a{opacity:.9;margin-top:4px;font-size:14px}
.dov .p{font-size:12px;font-weight:600;letter-spacing:1px;opacity:.8;margin-top:10px}
.dov .pv{font-size:24px;font-weight:800}
.dtabs{position:sticky;top:0;background:#fff;border-bottom:1px solid #e2e8f0;padding:10px 0;z-index:900}
.dtabsin{max-width:1180px;margin:0 auto;padding:0 40px;display:flex;gap:4px;overflow-x:auto}
.dtabs a{font-size:14px;font-weight:600;color:#64748b;text-decoration:none;padding:6px 12px;border-radius:6px;white-space:nowrap}
.dtabs a:hover,.dtabs a.active{color:${primary}}
.dwrap{max-width:1180px;margin:0 auto;padding:8px 40px 20px;display:grid;grid-template-columns:1fr 340px;gap:28px}
.dsec{scroll-margin-top:66px}
.sh{font-weight:700;font-size:18px;border-left:3px solid ${primary};padding-left:10px;margin:26px 0 12px}
.dtitle{display:flex;align-items:center;gap:10px;font-size:24px;font-weight:800}
.facts{border:1px solid #fed7aa;border-radius:12px;overflow:hidden;background:#fff7ed;margin-top:8px}
.facts .fh{background:${primary};color:#fff;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:8px 14px}
.fg{display:grid;grid-template-columns:1fr 1fr}
.frow{display:flex;justify-content:space-between;gap:10px;padding:10px 14px;border-top:1px solid #fed7aa;font-size:13px}
.frow .k{color:#9a3412}.frow .v{font-weight:700;color:#7c2d12;text-align:right}
.bullets{list-style:none}.bullets li{position:relative;padding-left:20px;margin:6px 0;font-size:14px;color:#475569}
.bullets li:before{content:'';position:absolute;left:0;top:7px;width:8px;height:8px;border-radius:2px;background:${primary}}
.gal{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.gal img{width:100%;height:96px;object-fit:cover;border-radius:8px}
#dmap{height:360px;border-radius:12px;border:1px solid #e2e8f0;z-index:0}
.demohd{display:flex;align-items:center}
.radbtns{display:inline-flex;gap:4px;margin-left:auto}
.radbtns button{border:1px solid #e2e8f0;background:#fff;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:600;color:#64748b;cursor:pointer}
.radbtns button.active{background:${primary};color:#fff;border-color:${primary}}
.demo{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.dc{border:1px solid #e2e8f0;border-radius:12px;padding:14px;background:#fff}
.dc .t{font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;text-align:center}
.donut{position:relative;width:130px;height:130px;margin:0 auto}
.donut .ctr{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.donut .ctr b{font-size:17px;font-weight:800}
.donut .ctr span{font-size:10px;color:#94a3b8}
.leg{margin-top:12px;font-size:11px}
.leg div{display:flex;align-items:center;gap:6px;margin-top:4px}
.leg i{width:8px;height:8px;border-radius:2px;display:inline-block}
.leg b{margin-left:auto}
.areatbl{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#f8fafc;margin-top:8px}
.areatbl .frow{border-top:1px solid #e2e8f0}
.areatbl .frow:first-child{border-top:0}
.areatbl .k{color:#64748b}.areatbl .v{color:#0f172a}
.side .card2{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff;margin-bottom:16px}
.c2h{background:${primary};color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;padding:8px 14px}
.c2b{padding:16px}
.agent{display:flex;align-items:center;gap:12px}
.agent .av{width:44px;height:44px;border-radius:50%;background:${primary};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}
.agent .nm{font-weight:700}.agent .rl{font-size:12px;color:#94a3b8}
.aemail{display:block;margin-top:12px;font-size:13px;color:${primary};text-decoration:none}
.btnp{width:100%;background:${primary};color:#fff;border:0;border-radius:8px;padding:10px;font-weight:700;font-size:14px;cursor:pointer;margin-top:12px}
.btno{width:100%;border:1px solid #e2e8f0;background:#fff;border-radius:8px;padding:8px;font-weight:600;font-size:13px;color:#475569;cursor:pointer;margin-top:8px}
.finput{width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:9px 12px;font-size:14px;margin-top:8px;outline:none;font-family:inherit}
.cta{background:linear-gradient(#fff,#fff7ed);padding:44px 40px;text-align:center;border-top:1px solid #e2e8f0}
.cta .k{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${primary}}
.cta h2{font-size:26px;font-weight:800;margin-top:6px}
.cta .sub{color:#64748b;font-size:14px;margin-top:4px}
.cta form{max-width:520px;margin:18px auto 0;text-align:left}
@media(max-width:900px){.dwrap{grid-template-columns:1fr}.demo{grid-template-columns:1fr}.fg{grid-template-columns:1fr}.gal{grid-template-columns:repeat(2,1fr)}}
</style></head><body>
<header class="hero"><div class="cut"></div><div class="inner"><div class="logo"></div><div class="count" id="count"></div></div></header>
<div class="toolbar">
  <div class="seg" id="filterSeg"><button data-f="All" class="active">All</button><button data-f="For Sale">For Sale</button><button data-f="For Lease">For Lease</button></div>
  <input id="search" placeholder="Search..."/>
  <select id="sort"><option value="Newest">Sort: Newest First</option><option value="PriceHigh">Sort: Price High to Low</option><option value="PriceLow">Sort: Price Low to High</option></select>
  <div class="spacer"><span class="result" id="result"></span><div class="seg" id="viewSeg"><button data-v="map">Map</button><button data-v="mapgrid" class="active">Map + Grid</button><button data-v="grid">Grid</button><button data-v="list">List</button></div></div>
</div>
<div class="content mapgrid" id="content"><div id="map"></div><div id="cards"></div></div>
<footer class="list-footer"><div class="line"></div><p>Powered by <b>CREBuilder</b></p></footer>
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
return '<div class="dhero"><img src="'+esc(l.image)+'"/><div class="dtop"><button class="dbtn" onclick="backToList()">&larr; Back to Listings</button><button class="dbtn" onclick="backToList()">&times;</button></div><div class="dov"><div class="dovin"><div class="bd"><span class="hbadge" style="background:'+bc+'">'+esc(l.saleType)+'</span><span class="hbadge" style="background:rgba(255,255,255,.25)">'+esc(l.leaseType)+'</span></div><h1>'+esc(l.name)+'</h1><div class="a">'+esc(l.address)+'</div><div class="p">ASKING PRICE</div><div class="pv">'+fullPrice(l.price)+'</div></div></div></div><div class="dtabs"><div class="dtabsin">'+['Overview','Gallery','Location','Demographics','Area Info','Contact'].map(function(t){return '<a href="#sec-'+t.replace(/ /g,'')+'">'+t+'</a>';}).join('')+'</div></div><div class="dwrap"><div class="dmain"><div class="dsec" id="sec-Overview"><div class="dtitle">'+esc(l.name)+'</div><div style="color:'+PRIMARY+';font-weight:700;margin-top:4px">'+fullPrice(l.price)+'</div>'+facts+'</div><div class="dsec"><div class="sh">Description</div>'+desc+'</div><div class="dsec"><div class="sh">Highlights</div>'+highlights+'</div><div class="dsec" id="sec-Gallery"><div class="sh">Photo Gallery</div>'+gallery+'</div><div class="dsec" id="sec-Location"><div class="sh">Location</div><div id="dmap"></div></div><div class="dsec" id="sec-Demographics"><div class="sh demohd">Demographics <span class="radbtns"><button class="active" onclick="setRadius(this,1)">1 Mi</button><button onclick="setRadius(this,3.1)">3 Mi</button><button onclick="setRadius(this,6.4)">5 Mi</button></span></div><div class="demo" id="demoWrap"></div></div><div class="dsec" id="sec-AreaInfo"><div class="sh">About the Area</div>'+area+'</div></div>'+sidebar+'</div>'+cta+'<footer><div class="line"></div><p>Powered by <b>CREBuilder</b></p></footer>';}
function submitInquiry(e){e.preventDefault();e.target.innerHTML='<div style="padding:18px;text-align:center;color:#16a34a;font-weight:600">Thank you! We\\'ll respond within one business day.</div>';return false;}
function initDetailMap(l){if(dmap){dmap.remove();dmap=null;}dmap=L.map('dmap').setView([l.lat,l.lng],14);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(dmap);L.marker([l.lat,l.lng],{icon:pinIcon()}).addTo(dmap);setTimeout(function(){dmap.invalidateSize();},100);}
function openDetail(id){var l=null,i;for(i=0;i<DATA.length;i++){if(DATA[i].id===id){l=DATA[i];break;}}if(!l)return;document.getElementById('detailView').innerHTML=detailHtml(l);document.body.classList.add('detail-open');window.scrollTo(0,0);renderDemo(1);initDetailMap(l);creNav(id);creHeight();}
function backToList(){document.body.classList.remove('detail-open');if(dmap){dmap.remove();dmap=null;}window.scrollTo(0,0);creNav(null);creHeight();}
document.addEventListener('click',function(e){var a=e.target.closest?e.target.closest('.dtabs a'):null;if(a){var tb=a.parentElement.querySelectorAll('a'),i;for(i=0;i<tb.length;i++)tb[i].classList.remove('active');a.classList.add('active');}});
/* --- Embed messaging: talk to the parent page when used as an <iframe> --- */
function creHeight(){try{var h=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);parent.postMessage({type:'cre-listings-resize',height:h},'*');}catch(e){}}
function creNav(id){try{parent.postMessage({type:'cre-nav-property',propertyId:id||null},'*');}catch(e){}}
window.addEventListener('load',creHeight);
window.addEventListener('resize',creHeight);
window.addEventListener('message',function(e){if(e.data&&e.data.type==='cre-init'){if(e.data.propertyId)openDetail(e.data.propertyId);else creHeight();}});
setTimeout(creHeight,700);
render();creHeight();
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
<footer>Powered by <b>CREBuilder</b></footer>
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
function dl(){var t="OFFERING MEMORANDUM\\n\\n"+NAME+"\\n"+ADDR+"\\n\\nConfidential — provided under signed NDA.\\nGenerated by CREbuilder (demo document).";var b=new Blob([t],{type:"text/plain"});var u=URL.createObjectURL(b);var a=document.createElement("a");a.href=u;a.download="OM - "+NAME+".txt";a.click();URL.revokeObjectURL(u);}
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

function ListingHubPage({ listings, setListings, globalQuery, onCreateNew, onResumeDraft }) {
  const notify = useToast()

  const [slug, setSlug] = useState('vaziamts')
  const siteUrl = `https://www.crebuilder.com/listings/${slug}`
  // Functional link that actually opens the microsite (works when pasted in a new tab).
  const hubUrl = `${window.location.origin}${window.location.pathname}?hub=${slug}`

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [cname, setCname] = useState('')
  const [inquiryForm, setInquiryForm] = useState(true)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [customUrlOpen, setCustomUrlOpen] = useState(false)
  const [slugDraft, setSlugDraft] = useState(slug)
  const [embedOpen, setEmbedOpen] = useState(false)

  const embedCode = `<iframe
  id="cre-listings"
  src="${hubUrl}"
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

  // Appearance
  const [micrositeTpl, setMicrositeTpl] = useState('Modern')
  const [propertyTpl, setPropertyTpl] = useState('Match Listings')
  const [defaultView, setDefaultView] = useState('grid')
  const [sameAsMicrosite, setSameAsMicrosite] = useState(true)
  const [primary, setPrimary] = useState('#F97316')
  const secondary = lighten(primary, 0.3)

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
        JSON.stringify({ items: toMicrositeItems(rows), primary }),
      )
    } catch {
      /* ignore storage errors */
    }
  }, [listings, primary])

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
    <div className="p-6">
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

      <div className="mt-5 grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_340px] lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_450px]">
        {/* LEFT column */}
        <div className="space-y-4">
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
                  <span className="whitespace-nowrap text-sm text-slate-500">https://www.crebuilder.com/listings/</span>
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

          {/* Your own domain card */}
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
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-40 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <button
                  onClick={exportCsv}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
                <button
                  onClick={onCreateNew}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
                >
                  <Plus className="h-3.5 w-3.5" /> Create New
                </button>
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
                          <IconButton icon={ExternalLink} label="Open deal room" onClick={() => notify(`Deal room for ${l.name}`)} />
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

function DealRoomDetail({ room, onBack, notify }) {
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
    const content = `OFFERING MEMORANDUM\n\n${room.name}\n${room.address || ''}\n\nFile: ${f.name}\nConfidential — CREbuilder demo document.`
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
    const content = `CONFIDENTIALITY AGREEMENT (NDA)\n\n${room.name}\n${room.address || ''}\n\nThis Confidentiality Agreement governs access to the confidential Offering Memorandum and supporting documents. By signing, the recipient agrees to keep all materials strictly confidential and to use them solely to evaluate this opportunity.\n\n— CREbuilder demo document`
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
              <p className="text-sm text-slate-500">{room.address || '—'}</p>
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

function DealRoomsPage({ dealRooms, setDealRooms }) {
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
      <div className="p-6">
        <DealRoomDetail room={openRoom} onBack={() => setOpenRoom(null)} notify={notify} />
      </div>
    )
  }

  return (
    <div className="p-6">
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
        This module is part of the CREbuilder suite. The interface for{' '}
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
/*  Main App                                                                  */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try { return localStorage.getItem('crebuilder_auth') === '1' } catch { return false }
  })
  const [active, setActive] = useState('dashboard')
  const [user, setUser] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('crebuilder_db_user') || 'null')
      return saved?.email ? { ...CURRENT_USER, ...saved } : CURRENT_USER
    } catch { return CURRENT_USER }
  })
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

  const handleLogin = ({ email }) => {
    const nextUser = { ...CURRENT_USER, email }
    setUser(nextUser)
    setIsLoggedIn(true)
    setActive('dashboard')
    try { localStorage.setItem('crebuilder_auth', '1') } catch {}
    // Save the login to MongoDB (users collection). Ignored if backend/DB offline.
    saveUser({ name: nextUser.name, email: nextUser.email }).catch(() => {})
  }

  const handleSignOut = () => {
    setIsLoggedIn(false)
    setQuery('')
    try { localStorage.removeItem('crebuilder_auth') } catch {}
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
        return <DashboardPage packages={packages} setPackages={setPackages} setListings={setListings} globalQuery={query} createNonce={createNonce} resume={resume} onResumeHandled={() => setResume(null)} />
      case 'listings':
        return <ListingHubPage listings={listings} setListings={setListings} globalQuery={query} onCreateNew={startCreate} onResumeDraft={resumeDraft} />
      case 'deals':
        return <DealRoomsPage dealRooms={dealRooms} setDealRooms={setDealRooms} />
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
        return <DashboardPage packages={packages} setPackages={setPackages} setListings={setListings} globalQuery={query} createNonce={createNonce} resume={resume} onResumeHandled={() => setResume(null)} />
    }
  }

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar active={active} onNavigate={navigate} onSignOut={handleSignOut} user={user} />
        </div>

        {/* Mobile slide-in drawer */}
        {mobileNav && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileNav(false)}
            />
            <div className="absolute left-0 top-0 h-full shadow-2xl">
              <Sidebar
                active={active}
                onNavigate={navigate}
                onSignOut={() => {
                  setMobileNav(false)
                  handleSignOut()
                }}
                user={user}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            title={activeLabel}
            user={user}
            query={query}
            onQuery={setQuery}
            onMenu={() => setMobileNav(true)}
          />
          <main className="scrollbar-slim flex-1 overflow-y-auto">{renderScreen()}</main>
        </div>
      </div>
    </ToastProvider>
  )
}
