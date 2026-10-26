// Team Settings → Email & Sending Domain (Milestone 1).
//
// The team's email-sending configuration: the legal details that must appear in every email
// footer (legal name + postal address — sending is blocked without them, per compliance rule 3),
// an optional daily cap, the "members need approval to send" switch, and the sending-domain
// status. Writes to team_email_settings/config. The real domain Verify flow (DKIM/DNS) is added
// in STEP 4 once Amazon SES is connected.
import React, { useEffect, useState } from 'react'
import { getEmailSettings, updateEmailSettings, dmList } from './distributionData'
import { Mail, Globe, ShieldCheck } from 'lucide-react'

export default function TeamEmailSettings({ role = 'Member' }) {
  const canManage = ['Owner', 'Admin'].includes(role)
  const [form, setForm] = useState({ legal_name: '', postal_address: '', daily_cap: '', require_approval: false })
  const [domains, setDomains] = useState([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    getEmailSettings().then((s) => {
      const c = s || {}
      setForm({ legal_name: c.legal_name || '', postal_address: c.postal_address || '', daily_cap: c.daily_cap || '', require_approval: c.require_approval === true })
    }).catch(() => {})
    dmList('sending_domains').then((d) => setDomains(d || [])).catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true); setMsg('')
    try {
      await updateEmailSettings({
        legal_name: form.legal_name.trim(),
        postal_address: form.postal_address.trim(),
        daily_cap: form.daily_cap === '' ? null : Number(form.daily_cap),
        require_approval: !!form.require_approval,
      })
      setMsg('Saved')
    } catch (e) {
      setMsg('Could not save: ' + (e?.message || 'error'))
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const hasFooter = !!(form.legal_name.trim() && form.postal_address.trim())
  const input = 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand disabled:bg-slate-50 disabled:text-slate-400'

  return (
    <div className="space-y-5">
      {/* Legal details */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><Mail className="h-4 w-4 text-brand" /> Email sending details</p>
        <p className="mt-0.5 text-xs text-slate-500">These appear in every email footer. Sending is blocked until the legal name and postal address are set (CAN-SPAM).</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">Legal name</span>
            <input value={form.legal_name} disabled={!canManage} onChange={(e) => setForm((f) => ({ ...f, legal_name: e.target.value }))} className={input} placeholder="Value REIS LLC" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">Postal address</span>
            <input value={form.postal_address} disabled={!canManage} onChange={(e) => setForm((f) => ({ ...f, postal_address: e.target.value }))} className={input} placeholder="123 Main St, Dallas TX" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">Daily cap (optional — only lowers the warm-up cap)</span>
            <input type="number" value={form.daily_cap} disabled={!canManage} onChange={(e) => setForm((f) => ({ ...f, daily_cap: e.target.value }))} className={input} placeholder="e.g. 500" />
          </label>
          <label className="flex items-center gap-2 pt-6">
            <input type="checkbox" checked={form.require_approval} disabled={!canManage} onChange={(e) => setForm((f) => ({ ...f, require_approval: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-brand" />
            <span className="text-sm text-slate-600">Members need approval to send</span>
          </label>
        </div>

        <div className="mt-3 flex items-center gap-3">
          {canManage ? (
            <>
              <button onClick={save} disabled={saving} className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-hover disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
              {msg && <span className={`text-xs font-semibold ${msg.startsWith('Could') ? 'text-rose-600' : 'text-emerald-600'}`}>{msg}</span>}
            </>
          ) : (
            <p className="text-xs text-slate-400">Only an Owner or Admin can change these.</p>
          )}
          {hasFooter && <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><ShieldCheck className="h-3.5 w-3.5" /> Footer ready</span>}
        </div>
      </div>

      {/* Sending domain */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><Globe className="h-4 w-4 text-brand" /> Sending domain</p>
        <p className="mt-0.5 text-xs text-slate-500">The domain your emails are sent from. Verifying it (DKIM/DNS) keeps them out of spam.</p>
        {domains.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No sending domain added yet.</p>
        ) : (
          <div className="mt-3 space-y-1.5">
            {domains.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <span className="font-semibold text-slate-700">{d.domain}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${d.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : d.status === 'failed' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>{d.status || 'pending'}</span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">Domain verification (add domain → DNS records → Verify) connects once Amazon SES is set up.</p>
      </div>
    </div>
  )
}
