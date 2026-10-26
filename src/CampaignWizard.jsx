// Campaign Wizard — the "New Campaign" composer (Milestone 2).
//
// Build progress:
//   Sub-step 1: the 7-step shell (navigation + progress bar).
//   Sub-step 2: Step 1 (Deal) and Step 2 (Template) now have real, selectable content.
// The remaining steps (Channels, Audience, Content, Schedule, Review) are still placeholders
// and get filled in next. Opening this never sends anything; it's a draft composer.
import React, { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Check, Building2, Mail, Linkedin, Instagram, Search, Users, Monitor, Smartphone, Pencil, Eye } from 'lucide-react'
import { TEMPLATE_LIBRARY } from './templatesData'

const STEPS = [
  { key: 'deal', label: 'Deal' },
  { key: 'template', label: 'Template' },
  { key: 'channels', label: 'Channels' },
  { key: 'audience', label: 'Audience' },
  { key: 'content', label: 'Content' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'review', label: 'Review' },
]


const fmtPrice = (p) => {
  const n = Number(p)
  if (!n) return ''
  return '$' + n.toLocaleString('en-US')
}

export default function CampaignWizard({ open, onClose, deals = [], customTemplates = [], leads = [], conns = {}, initialDealId = null, initialDraft = null, onSaveDraft, onSendTest, userEmail = '' }) {
  const [step, setStep] = useState(0)
  const [dealId, setDealId] = useState(null)
  const [templateId, setTemplateId] = useState(null)
  const [channels, setChannels] = useState({ email: true, linkedin: false, instagram: false })
  const [audienceSearch, setAudienceSearch] = useState('')
  const [content, setContent] = useState({ email: { subject: '', body: '' }, linkedin: { text: '' }, instagram: { caption: '' } })
  const [schedule, setSchedule] = useState({ mode: 'now', at: '' })
  const [excluded, setExcluded] = useState({}) // audience leads the agent has un-ticked
  const [saving, setSaving] = useState(false)

  // Reset each time the wizard opens.
  useEffect(() => {
    if (open) {
      setStep(0); setSaving(false); setAudienceSearch(''); setExcluded({})
      const blankContent = { email: { subject: '', body: '' }, linkedin: { text: '' }, instagram: { caption: '' } }
      if (initialDraft) {
        // Editing a saved draft: preload everything from it.
        setDealId(initialDraft.deal_id || null)
        setTemplateId(initialDraft.template_id || null)
        const chs = Array.isArray(initialDraft.channels) ? initialDraft.channels : []
        setChannels({ email: chs.includes('email'), linkedin: chs.includes('linkedin'), instagram: chs.includes('instagram') })
        setContent({ ...blankContent, ...(initialDraft.content || {}) })
        setSchedule(initialDraft.schedule || { mode: 'now', at: '' })
      } else {
        setDealId(initialDealId || null); setTemplateId(null)
        setChannels({ email: true, linkedin: false, instagram: false })
        setContent(blankContent); setSchedule({ mode: 'now', at: '' })
      }
    }
  }, [open])

  // When reaching the Content step, pre-fill all channels from the chosen template (once).
  useEffect(() => {
    if (step !== 4) return
    const t = [...TEMPLATE_LIBRARY, ...customTemplates].find((x) => x.id === templateId)
    if (!t) return
    setContent((c) => {
      const touched = c.email.subject || c.email.body || c.linkedin.text || c.instagram.caption
      if (touched) return c
      return {
        email: { subject: t.email.subject, body: t.email.body },
        linkedin: { text: t.linkedin.text },
        instagram: { caption: t.instagram.caption },
      }
    })
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const isFirst = step === 0
  const isLast = step === STEPS.length - 1
  const selectedChannels = Object.keys(channels).filter((k) => channels[k])
  // Require a choice on the steps that have real content before moving on.
  const canNext = step === 0 ? !!dealId : step === 1 ? !!templateId : step === 2 ? selectedChannels.length > 0 : true

  // All template choices: built-in library + the team's own templates + a blank start.
  const allTemplates = [...[...TEMPLATE_LIBRARY, ...customTemplates].map((t) => ({ id: t.id, name: t.name })), { id: 'blank', name: 'Blank' }]

  const selectedDeal = deals.find((d) => String(d.id) === String(dealId))
  const selectedTemplateName = (allTemplates.find((t) => String(t.id) === String(templateId)) || {}).name || '—'

  // Recipients = leads with an email address, narrowed by the audience search.
  const withEmail = leads.filter((l) => (l.email || '').includes('@'))
  const aq = audienceSearch.trim().toLowerCase()
  const recipients = aq
    ? withEmail.filter((l) => `${l.name || ''} ${l.email || ''} ${l.company || ''}`.toLowerCase().includes(aq))
    : withEmail
  const leadKey = (l) => String(l.id || l.email || '')
  const selectedRecipients = recipients.filter((r) => !excluded[leadKey(r)])

  // Build the draft record saved to the campaigns table. Carries the id when editing so the
  // existing draft is updated in place instead of a duplicate being created.
  const buildDraft = () => ({
    ...(initialDraft && initialDraft.id ? { id: initialDraft.id, created_at: initialDraft.created_at } : {}),
    deal_id: dealId,
    deal_name: selectedDeal ? (selectedDeal.name || selectedDeal.title || '') : (initialDraft ? initialDraft.deal_name : ''),
    template_id: templateId,
    template_name: selectedTemplateName,
    channels: selectedChannels,
    recipient_count: selectedChannels.includes('email') ? selectedRecipients.length : 0,
    schedule,
    content,
  })
  const doSaveDraft = async () => {
    if (!onSaveDraft || saving) return
    setSaving(true)
    const ok = await onSaveDraft(buildDraft())
    setSaving(false)
    if (ok) onClose && onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose && onClose() }}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-base font-extrabold text-slate-900">New Campaign</p>
            <p className="text-xs text-slate-400">Step {step + 1} of {STEPS.length} · {STEPS[step].label}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-100 px-5 py-3">
          {STEPS.map((s, i) => {
            const done = i < step
            const active = i === step
            return (
              <React.Fragment key={s.key}>
                <button
                  onClick={() => i <= step && setStep(i)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    active ? 'bg-brand text-white' : done ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  } ${i <= step ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                    active ? 'bg-white/25' : done ? 'bg-emerald-100' : 'bg-slate-200'
                  }`}>
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  {s.label}
                </button>
                {i < STEPS.length - 1 && <span className="h-px w-3 shrink-0 bg-slate-200" />}
              </React.Fragment>
            )
          })}
        </div>

        {/* Step body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 0 && (
            <DealStep deals={deals} dealId={dealId} onPick={setDealId} />
          )}
          {step === 1 && (
            <TemplateStep templates={allTemplates} templateId={templateId} onPick={setTemplateId} />
          )}
          {step === 2 && (
            <ChannelsStep channels={channels} conns={conns} onToggle={(k) => setChannels((c) => ({ ...c, [k]: !c[k] }))} />
          )}
          {step === 3 && (
            <AudienceStep
              recipients={recipients}
              excluded={excluded}
              leadKey={leadKey}
              selectedCount={selectedRecipients.length}
              search={audienceSearch}
              setSearch={setAudienceSearch}
              onToggle={(k) => setExcluded((e) => { const n = { ...e }; if (n[k]) delete n[k]; else n[k] = true; return n })}
              onAll={() => setExcluded({})}
              onNone={() => { const n = {}; recipients.forEach((r) => { n[leadKey(r)] = true }); setExcluded(n) }}
            />
          )}
          {step === 4 && (
            <ContentStep channels={selectedChannels} content={content} setContent={setContent} deal={selectedDeal} onSendTest={onSendTest} userEmail={userEmail} />
          )}
          {step === 5 && (
            <ScheduleStep schedule={schedule} setSchedule={setSchedule} />
          )}
          {step === 6 && (
            <ReviewStep
              selectedDeal={selectedDeal}
              templateName={selectedTemplateName}
              channels={selectedChannels}
              recipientCount={recipients.length}
              schedule={schedule}
              content={content}
            />
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={isFirst}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            {onSaveDraft && (
              <button
                onClick={doSaveDraft}
                disabled={!dealId || saving}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save draft'}
              </button>
            )}
            {isLast ? (
              <button onClick={doSaveDraft} disabled={!dealId || saving} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-hover disabled:opacity-40">
                <Check className="h-4 w-4" /> {saving ? 'Saving…' : 'Finish & save draft'}
              </button>
            ) : (
              <button
                onClick={() => canNext && setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={!canNext}
                className="inline-flex items-center gap-1 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Step 1: pick a deal -----------------------------------------------------------
function DealStep({ deals, dealId, onPick }) {
  return (
    <div>
      <h2 className="text-base font-extrabold text-slate-900">Pick a deal</h2>
      <p className="mt-0.5 text-sm text-slate-500">Choose a property to build this campaign around.</p>
      {deals.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
          <Building2 className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-500">No deals yet</p>
          <p className="mt-1 text-xs text-slate-400">Add a property in My Deals, then it will appear here.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-2.5">
          {deals.map((d) => {
            const sel = String(d.id) === String(dealId)
            const img = d.image || d.cover || (Array.isArray(d.images) && d.images[0]) || ''
            return (
              <button
                key={d.id}
                onClick={() => onPick(d.id)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                  sel ? 'border-brand bg-orange-50/60 ring-1 ring-brand' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {img ? (
                    <img src={img} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300"><Building2 className="h-5 w-5" /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{d.name || d.title || 'Untitled property'}</p>
                  <p className="truncate text-xs text-slate-400">{d.address || [d.city, d.state].filter(Boolean).join(', ')}</p>
                </div>
                {d.price ? <span className="shrink-0 text-sm font-bold text-slate-700">{fmtPrice(d.price)}</span> : null}
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${sel ? 'border-brand bg-brand text-white' : 'border-slate-300'}`}>
                  {sel && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --- Step 2: pick a template -------------------------------------------------------
function TemplateStep({ templates, templateId, onPick }) {
  return (
    <div>
      <h2 className="text-base font-extrabold text-slate-900">Choose a template</h2>
      <p className="mt-0.5 text-sm text-slate-500">Pick a starting point for the campaign content.</p>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {templates.map((t) => {
          const sel = String(t.id) === String(templateId)
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${
                sel ? 'border-brand bg-orange-50/60 ring-1 ring-brand' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="text-sm font-bold text-slate-900">{t.name}</span>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${sel ? 'border-brand bg-brand text-white' : 'border-slate-300'}`}>
                {sel && <Check className="h-3.5 w-3.5" />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// --- Step 3: pick channels ---------------------------------------------------------
const CHANNELS = [
  { key: 'email', name: 'Email', icon: Mail, tile: 'bg-blue-50 text-blue-500' },
  { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, tile: 'bg-[#0A66C2]/10 text-[#0A66C2]' },
  { key: 'instagram', name: 'Instagram', icon: Instagram, tile: 'bg-pink-50 text-pink-500' },
]
function ChannelsStep({ channels, conns, onToggle }) {
  return (
    <div>
      <h2 className="text-base font-extrabold text-slate-900">Pick channels</h2>
      <p className="mt-0.5 text-sm text-slate-500">Where should this campaign go? Pick one or more.</p>
      <div className="mt-4 grid gap-2.5">
        {CHANNELS.map((ch) => {
          const on = !!channels[ch.key]
          const Icon = ch.icon
          const connected = ch.key === 'email' ? true : !!conns[ch.key]
          return (
            <button
              key={ch.key}
              onClick={() => onToggle(ch.key)}
              className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                on ? 'border-brand bg-orange-50/60 ring-1 ring-brand' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ch.tile}`}><Icon className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">{ch.name}</p>
                <p className="text-xs text-slate-400">{ch.key === 'email' ? 'Always ready' : connected ? 'Connected' : 'Not connected — connect in Distribution'}</p>
              </div>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${on ? 'border-brand bg-brand text-white' : 'border-slate-300'}`}>
                {on && <Check className="h-3.5 w-3.5" />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// --- Step 4: choose the audience (tick the buyers who should get this) -------------
function AudienceStep({ recipients, excluded, leadKey, selectedCount, search, setSearch, onToggle, onAll, onNone }) {
  return (
    <div>
      <h2 className="text-base font-extrabold text-slate-900">Choose the audience</h2>
      <p className="mt-0.5 text-sm text-slate-500">Recipients come from your My Leads. Tick the buyers who should get this.</p>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-brand/30 bg-orange-50/50 px-4 py-3">
        <Users className="h-5 w-5 text-brand" />
        <div>
          <p className="text-xl font-extrabold text-slate-900">{selectedCount}</p>
          <p className="text-xs font-semibold text-slate-500">selected{search.trim() ? ' (of filtered)' : ''} · {recipients.length} shown</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads by name, email or company…"
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs">
        <button onClick={onAll} className="font-semibold text-brand hover:underline">Select all</button>
        <span className="text-slate-300">·</span>
        <button onClick={onNone} className="font-semibold text-slate-500 hover:underline">Clear</button>
      </div>

      <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-100">
        {recipients.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-400">No matching leads with an email address.</p>
        ) : (
          recipients.slice(0, 100).map((l, i) => {
            const k = leadKey(l)
            const on = !excluded[k]
            return (
              <button
                key={l.id || l.email || i}
                onClick={() => onToggle(k)}
                className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-2 text-left transition last:border-0 hover:bg-slate-50"
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? 'border-brand bg-brand text-white' : 'border-slate-300'}`}>
                  {on && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{l.name || '—'}</span>
                <span className="ml-2 shrink-0 truncate text-xs text-slate-400">{l.email}</span>
              </button>
            )
          })
        )}
      </div>
      <p className="mt-2 text-xs text-slate-400">Unsubscribed, bounced and no-consent leads will be removed automatically before sending.</p>
    </div>
  )
}

// --- Step 5: write the content (one tab per selected channel) ----------------------
const CH_META = { email: { name: 'Email', icon: Mail }, linkedin: { name: 'LinkedIn', icon: Linkedin, limit: 1300 }, instagram: { name: 'Instagram', icon: Instagram, limit: 2200 } }

// Merge-field values from the chosen deal, so a preview shows real text instead of {{property}}.
function dealMergeValues(deal) {
  const addr = String(deal?.address || '')
  const parts = addr.split(',').map((s) => s.trim()).filter(Boolean)
  let city = deal?.city || ''
  let state = deal?.state || ''
  if (!city || !state) {
    if (parts.length >= 3) { city = city || parts[parts.length - 3]; state = state || parts[parts.length - 2] }
    else if (parts.length === 2) { city = city || parts[0]; state = state || parts[1] }
    else if (parts.length === 1) { city = city || parts[0] }
  }
  // Agent name/phone live on the listing as agentName/agentPhone (camelCase), or in the
  // deal's contacts[] array — read all the shapes so {{agent_name}}/{{agent_phone}} fill in.
  const c0 = Array.isArray(deal?.contacts) && deal.contacts[0] ? deal.contacts[0] : null
  const agentName = deal?.agentName || deal?.agent_name || deal?.broker_name || (c0 && c0.name) || ''
  const agentPhone = deal?.agentPhone || deal?.agent_phone || deal?.broker_phone || (c0 && c0.phone) || ''
  // The deal room link is the public per-property URL (leadnify.io/<hub>/<slug>), built from
  // the listing's slug the same way the Preview/Copy-link buttons do.
  const slugify = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
  const pslug = deal?.slug || slugify(deal?.name || deal?.title)
  const origin = (typeof window !== 'undefined' && window.location && window.location.origin) || 'https://leadnify.io'
  const dealRoom = deal?.deal_room_url || (pslug ? `${origin}/vaziamts/${pslug}` : 'https://leadnify.io')
  return {
    property: deal?.name || deal?.title || '',
    city, state,
    price: deal?.price ? '$' + Number(deal.price).toLocaleString('en-US') : '',
    type: deal?.type || deal?.saleType || '',
    size: deal?.size || '',
    link: dealRoom,
    deal_room_url: dealRoom,          // client's exact field name (same value as {{link}})
    cap_rate: deal?.capRate || deal?.cap_rate || '',
    noi: deal?.noi || '',
    tenant: deal?.tenant || '',
    broker_name: agentName,           // kept for backward compatibility
    broker_phone: agentPhone,
    agent_name: agentName,            // client's exact field name
    agent_phone: agentPhone,          // client's exact field name
  }
}
const applyMerge = (txt, vals) => String(txt || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => (vals[k] != null && vals[k] !== '' ? vals[k] : m))

function ContentStep({ channels, content, setContent, deal, onSendTest, userEmail }) {
  const [tab, setTab] = useState(channels[0] || 'email')
  const [note, setNote] = useState('')
  const [testing, setTesting] = useState(false)
  const [mode, setMode] = useState('edit')     // edit | preview
  const [device, setDevice] = useState('desktop') // desktop | mobile
  const set = (ch, field, val) => setContent((c) => ({ ...c, [ch]: { ...c[ch], [field]: val } }))
  const active = channels.includes(tab) ? tab : channels[0] || 'email'
  const vals = dealMergeValues(deal)

  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Write the content</h2>
          <p className="mt-0.5 text-sm text-slate-500">One tab per channel. Preview shows how it looks with the deal's details.</p>
        </div>
        {/* Edit / Preview toggle */}
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-slate-200 text-xs font-semibold">
          <button onClick={() => setMode('edit')} className={`inline-flex items-center gap-1 px-2.5 py-1.5 ${mode === 'edit' ? 'bg-brand text-white' : 'text-slate-500'}`}><Pencil className="h-3.5 w-3.5" /> Edit</button>
          <button onClick={() => setMode('preview')} className={`inline-flex items-center gap-1 px-2.5 py-1.5 ${mode === 'preview' ? 'bg-brand text-white' : 'text-slate-500'}`}><Eye className="h-3.5 w-3.5" /> Preview</button>
        </div>
      </div>

      {/* channel tabs */}
      <div className="mt-3 flex gap-1.5">
        {channels.map((ch) => {
          const M = CH_META[ch]; const Icon = M.icon; const on = active === ch
          return (
            <button key={ch} onClick={() => setTab(ch)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${on ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              <Icon className="h-3.5 w-3.5" /> {M.name}
            </button>
          )
        })}
      </div>

      {mode === 'edit' ? (
        <>
          {/* tools */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => setNote('AI drafting connects once the Anthropic API key is set (Milestone 4).')} className="rounded-lg border border-brand/40 bg-orange-50 px-3 py-1.5 text-xs font-bold text-brand transition hover:bg-orange-100">✨ Draft with AI</button>
            <button
              disabled={testing}
              onClick={async () => {
                if (!onSendTest) { setNote('Test send connects once the email engine (Milestone 1) is live.'); return }
                setTesting(true); setNote('Sending test email to you…')
                const ok = await onSendTest(applyMerge(content.email.subject, vals) || 'Test — Leadnify', applyMerge(content.email.body, vals) || '')
                setTesting(false)
                setNote(ok ? `Test email sent to ${userEmail || 'your inbox'} — check your email.` : 'Could not send the test — try again.')
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >{testing ? 'Sending…' : 'Send test to me'}</button>
          </div>
          {note && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">{note}</p>}

          {/* editor */}
          <div className="mt-3 space-y-2">
            {active === 'email' && (
              <>
                <input value={content.email.subject} onChange={(e) => set('email', 'subject', e.target.value)} placeholder="Subject line" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
                <textarea value={content.email.body} onChange={(e) => set('email', 'body', e.target.value)} rows={7} placeholder="Email body…" className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
                <p className="text-xs text-slate-400">Merge fields: <code className="rounded bg-slate-100 px-1">{'{{property}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{city}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{state}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{price}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{cap_rate}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{noi}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{tenant}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{deal_room_url}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{agent_name}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{agent_phone}}'}</code> — the preview fills them in.</p>
              </>
            )}
            {active === 'linkedin' && (
              <>
                <textarea value={content.linkedin.text} onChange={(e) => set('linkedin', 'text', e.target.value)} rows={8} placeholder="LinkedIn post…" className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
                <p className={`text-right text-xs ${content.linkedin.text.length > 1300 ? 'text-rose-500' : 'text-slate-400'}`}>{content.linkedin.text.length} / 1300</p>
              </>
            )}
            {active === 'instagram' && (
              <>
                <textarea value={content.instagram.caption} onChange={(e) => set('instagram', 'caption', e.target.value)} rows={8} placeholder="Instagram caption… (write “Link in bio”, URLs aren’t clickable)" className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
                <p className={`text-right text-xs ${content.instagram.caption.length > 2200 ? 'text-rose-500' : 'text-slate-400'}`}>{content.instagram.caption.length} / 2200</p>
              </>
            )}
          </div>
        </>
      ) : (
        <ContentPreview channel={active} content={content} vals={vals} device={device} setDevice={setDevice} />
      )}
    </div>
  )
}

// Live preview of the content with merge fields filled in (email in a desktop/mobile frame).
function ContentPreview({ channel, content, vals, device, setDevice }) {
  if (channel === 'email') {
    const subject = applyMerge(content.email.subject, vals) || '(no subject)'
    const body = applyMerge(content.email.body, vals) || '(no body yet)'
    const width = device === 'mobile' ? 'max-w-[360px]' : 'max-w-full'
    return (
      <div className="mt-3">
        <div className="mb-2 flex items-center justify-end gap-1">
          <button onClick={() => setDevice('desktop')} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${device === 'desktop' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'}`}><Monitor className="h-3.5 w-3.5" /> Desktop</button>
          <button onClick={() => setDevice('mobile')} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${device === 'mobile' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'}`}><Smartphone className="h-3.5 w-3.5" /> Mobile</button>
        </div>
        <div className={`mx-auto overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${width}`}>
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
            <p className="text-xs text-slate-400">Subject</p>
            <p className="text-sm font-bold text-slate-900">{subject}</p>
          </div>
          <div className="px-4 py-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{body}</p>
          </div>
          <div className="border-t border-slate-100 px-4 py-2 text-center text-[11px] text-slate-400">
            Legal name &amp; postal address · Unsubscribe
          </div>
        </div>
      </div>
    )
  }
  const text = channel === 'linkedin' ? applyMerge(content.linkedin.text, vals) : applyMerge(content.instagram.caption, vals)
  return (
    <div className="mt-3">
      <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2">
          {channel === 'linkedin' ? <Linkedin className="h-4 w-4 text-[#0A66C2]" /> : <Instagram className="h-4 w-4 text-pink-500" />}
          <span className="text-sm font-bold text-slate-900">{channel === 'linkedin' ? 'LinkedIn post' : 'Instagram caption'}</span>
        </div>
        <div className="px-4 py-3">
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{text || '(nothing written yet)'}</p>
          {channel === 'instagram' && <p className="mt-2 text-xs font-semibold text-slate-400">Link in bio</p>}
        </div>
      </div>
    </div>
  )
}

// --- Step 6: schedule --------------------------------------------------------------
// Local timezone label (e.g. "America/Chicago"), used so the agent sees the time is in THEIR zone.
export const localTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || '' } catch { return '' } }
// "now" formatted for a datetime-local input's min attribute, so a past time can't be picked.
const nowLocalInput = () => {
  const p = (n) => String(n).padStart(2, '0')
  const d = new Date()
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
function ScheduleStep({ schedule, setSchedule }) {
  const tz = localTz()
  const isPast = schedule.mode === 'later' && schedule.at && new Date(schedule.at).getTime() < Date.now()
  return (
    <div>
      <h2 className="text-base font-extrabold text-slate-900">Schedule</h2>
      <p className="mt-0.5 text-sm text-slate-500">Send now, or pick a date and time.</p>
      <div className="mt-4 grid gap-2.5">
        <button onClick={() => setSchedule((s) => ({ ...s, mode: 'now' }))} className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${schedule.mode === 'now' ? 'border-brand bg-orange-50/60 ring-1 ring-brand' : 'border-slate-200 hover:border-slate-300'}`}>
          <div><p className="text-sm font-bold text-slate-900">Send now</p><p className="text-xs text-slate-400">Goes out as soon as you finish.</p></div>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${schedule.mode === 'now' ? 'border-brand bg-brand text-white' : 'border-slate-300'}`}>{schedule.mode === 'now' && <Check className="h-3.5 w-3.5" />}</span>
        </button>
        <button onClick={() => setSchedule((s) => ({ ...s, mode: 'later', tz }))} className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${schedule.mode === 'later' ? 'border-brand bg-orange-50/60 ring-1 ring-brand' : 'border-slate-200 hover:border-slate-300'}`}>
          <div><p className="text-sm font-bold text-slate-900">Schedule for later</p><p className="text-xs text-slate-400">Pick a date and time.</p></div>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${schedule.mode === 'later' ? 'border-brand bg-brand text-white' : 'border-slate-300'}`}>{schedule.mode === 'later' && <Check className="h-3.5 w-3.5" />}</span>
        </button>
        {schedule.mode === 'later' && (
          <>
            <input type="datetime-local" min={nowLocalInput()} value={schedule.at} onChange={(e) => setSchedule((s) => ({ ...s, at: e.target.value, tz }))} className={`rounded-lg border px-3 py-2 text-sm outline-none focus:border-brand ${isPast ? 'border-rose-300' : 'border-slate-200'}`} />
            <p className="text-xs text-slate-400">Times are in your timezone{tz ? ` (${tz})` : ''}. The scheduler checks every minute.</p>
            {isPast && <p className="text-xs font-semibold text-rose-500">That time is in the past — pick a future time.</p>}
          </>
        )}
      </div>
    </div>
  )
}

// --- Step 7: review ----------------------------------------------------------------
function ReviewStep({ selectedDeal, templateName, channels, recipientCount, schedule, content }) {
  const rows = [
    ['Deal', selectedDeal ? (selectedDeal.name || selectedDeal.title) : '—'],
    ['Template', templateName],
    ['Channels', channels.map((c) => CH_META[c].name).join(', ') || '—'],
    ['Recipients', channels.includes('email') ? `${recipientCount}` : 'n/a (social only)'],
    ['When', schedule.mode === 'now' ? 'Send now' : (schedule.at ? new Date(schedule.at).toLocaleString() : 'Schedule — pick a time')],
    ['Email subject', content.email.subject || '—'],
  ]
  return (
    <div>
      <h2 className="text-base font-extrabold text-slate-900">Review &amp; send</h2>
      <p className="mt-0.5 text-sm text-slate-500">Check everything, then finish.</p>
      <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-4 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{k}</span>
            <span className="text-right text-sm font-semibold text-slate-700">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
        <p className="font-semibold text-slate-600">Before this can actually send:</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          <li>Email footer needs the team legal name + postal address</li>
          <li>Unsubscribe link is added automatically</li>
          <li>Live sending turns on once the email engine (M1) + AWS are set up</li>
        </ul>
      </div>
    </div>
  )
}
