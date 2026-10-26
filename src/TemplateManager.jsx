// Team Settings → Campaign Templates (template editing).
//
// Lists the built-in templates (read-only) and the team's own templates, and lets an
// Owner/Admin/Manager create, edit and delete their own. Each template has an email, LinkedIn
// and Instagram version. Custom templates are stored in distribution/<team>/templates and show
// up in the campaign wizard's template picker alongside the built-in ones.
import React, { useCallback, useEffect, useState } from 'react'
import { TEMPLATE_LIBRARY, BLANK_TEMPLATE } from './templatesData'
import { listTemplates, saveTemplate, deleteTemplate } from './distributionData'
import { FileText, Plus, Pencil, Trash2, Lock, ChevronLeft, Copy } from 'lucide-react'

const clone = (o) => JSON.parse(JSON.stringify(o))

export default function TemplateManager({ role = 'Member' }) {
  const canManage = ['Owner', 'Admin', 'Manager'].includes(role)
  const [custom, setCustom] = useState([])
  const [editing, setEditing] = useState(null) // the template object being edited (null = list view)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(() => {
    listTemplates().then((r) => setCustom(Array.isArray(r) ? r : [])).catch(() => {})
  }, [])
  useEffect(() => { reload() }, [reload])

  const startNew = () => setEditing(clone({ ...BLANK_TEMPLATE }))
  const startEdit = (t) => setEditing(clone(t))
  // Duplicate — makes an editable COPY of any template (built-in or custom). The copy drops the id
  // and is_system flag, so saving it creates a new team template. (Spec: "teams can edit copies of
  // the system templates.") Opens straight into the editor so the user can tweak before saving.
  const duplicate = (t) => setEditing(clone({
    name: `${t.name} (copy)`,
    is_system: false,
    email: t.email || { subject: '', body: '' },
    linkedin: t.linkedin || { text: '' },
    instagram: t.instagram || { caption: '' },
  }))
  const remove = async (t) => {
    if (!window.confirm(`Delete template "${t.name}"?`)) return
    try { await deleteTemplate(t.id); reload() } catch { /* ignore */ }
  }
  const save = async () => {
    if (!editing.name || !editing.name.trim()) { window.alert('Give the template a name.'); return }
    setSaving(true)
    try { await saveTemplate(editing); setEditing(null); reload() } catch (e) { window.alert('Could not save: ' + (e?.message || 'error')) }
    setSaving(false)
  }

  // --- editor view ---------------------------------------------------------------
  if (editing) {
    const set = (path, val) => setEditing((e) => {
      const n = clone(e)
      if (path.length === 1) n[path[0]] = val
      else n[path[0]][path[1]] = val
      return n
    })
    const input = 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand'
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <button onClick={() => setEditing(null)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"><ChevronLeft className="h-3.5 w-3.5" /> Back to templates</button>
        <p className="mt-3 text-sm font-extrabold text-slate-900">{editing.id ? 'Edit template' : 'New template'}</p>

        <label className="mt-3 block">
          <span className="text-xs font-semibold text-slate-500">Template name</span>
          <input value={editing.name} onChange={(e) => set(['name'], e.target.value)} className={input} placeholder="e.g. New Year Outreach" />
        </label>

        <p className="mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Email</p>
        <label className="mt-1 block">
          <span className="text-xs font-semibold text-slate-500">Subject</span>
          <input value={editing.email.subject} onChange={(e) => set(['email', 'subject'], e.target.value)} className={input} placeholder="Subject with merge fields, e.g. {{property}}" />
        </label>
        <label className="mt-2 block">
          <span className="text-xs font-semibold text-slate-500">Body</span>
          <textarea value={editing.email.body} onChange={(e) => set(['email', 'body'], e.target.value)} rows={5} className={input + ' resize-y'} placeholder="Email body…" />
        </label>

        <p className="mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">LinkedIn</p>
        <textarea value={editing.linkedin.text} onChange={(e) => set(['linkedin', 'text'], e.target.value)} rows={4} className={input + ' resize-y'} placeholder="LinkedIn post…" />

        <p className="mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Instagram</p>
        <textarea value={editing.instagram.caption} onChange={(e) => set(['instagram', 'caption'], e.target.value)} rows={4} className={input + ' resize-y'} placeholder="Instagram caption…" />

        <p className="mt-2 text-xs text-slate-400">Merge fields: <code className="rounded bg-slate-100 px-1">{'{{property}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{city}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{state}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{price}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{cap_rate}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{noi}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{tenant}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{deal_room_url}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{agent_name}}'}</code> <code className="rounded bg-slate-100 px-1">{'{{agent_phone}}'}</code>. The preview fills them in from the deal.</p>

        <div className="mt-4 flex items-center gap-2">
          <button onClick={save} disabled={saving} className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-hover disabled:opacity-50">{saving ? 'Saving…' : 'Save template'}</button>
          <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
        </div>
      </div>
    )
  }

  // --- list view -----------------------------------------------------------------
  const Row = ({ t, system }) => (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-brand"><FileText className="h-4 w-4" /></span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{t.name}</p>
          <p className="truncate text-xs text-slate-400">{t.email?.subject || '—'}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {system ? (
          <>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-400"><Lock className="h-3 w-3" /> Built-in</span>
            {canManage && (
              <button onClick={() => duplicate(t)} title="Make an editable copy" className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-bold text-brand transition hover:bg-orange-100"><Copy className="h-3.5 w-3.5" /> Duplicate</button>
            )}
          </>
        ) : canManage ? (
          <>
            <button onClick={() => duplicate(t)} title="Make an editable copy" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"><Copy className="h-3.5 w-3.5" /></button>
            <button onClick={() => startEdit(t)} className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-bold text-brand transition hover:bg-orange-100"><Pencil className="h-3.5 w-3.5" /> Edit</button>
            <button onClick={() => remove(t)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
          </>
        ) : null}
      </div>
    </div>
  )

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><FileText className="h-4 w-4 text-brand" /> Campaign templates</p>
          <p className="mt-0.5 text-xs text-slate-500">Built-in templates plus your team's own. Each has an email, LinkedIn and Instagram version.</p>
        </div>
        {canManage && (
          <button onClick={startNew} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-hover"><Plus className="h-4 w-4" /> New template</button>
        )}
      </div>

      {custom.length > 0 && (
        <>
          <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Your templates</p>
          <div className="space-y-2">{custom.map((t) => <Row key={t.id} t={t} system={false} />)}</div>
        </>
      )}

      <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Built-in</p>
      <div className="space-y-2">{TEMPLATE_LIBRARY.map((t) => <Row key={t.id} t={t} system={true} />)}</div>
    </div>
  )
}
