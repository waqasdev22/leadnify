// Sending health — the internal admin monitoring page (Milestone 1, STEP 10).
//
// Reads the data the M1 backend already keeps (team_email_settings, sending_domains,
// email_sends, email_events, alerts) and shows it on one screen: sending status (paused or
// active), warm-up stage + daily cap + today's usage, bounce/complaint rates, sending domains,
// and recent circuit-breaker alerts. Owner/Admin can resume sending after the breaker paused it.
import React, { useCallback, useEffect, useState } from 'react'
import { getEmailSettings, dmList, resumeSending, updateEmailSettings, testData } from './distributionData'
import { ShieldCheck, ShieldAlert, Flame, Send, Bell, Globe, RefreshCw, PlayCircle, MapPin, Settings, FlaskConical } from 'lucide-react'

// Test tools show only when the URL has ?dmtest=1 (never in a normal production view).
const TEST_MODE = (() => { try { return new URLSearchParams(window.location.search).get('dmtest') === '1' } catch { return false } })()

function Stat({ label, value, sub, tone = 'slate' }) {
  const tones = { slate: 'text-slate-900', green: 'text-emerald-600', red: 'text-rose-600', amber: 'text-amber-600' }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${tones[tone] || tones.slate}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

export default function SendingAdminPanel({ role = 'Member' }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resuming, setResuming] = useState(false)
  const [form, setForm] = useState({ legal_name: '', postal_address: '', daily_cap: '', require_approval: false })
  const [savingCfg, setSavingCfg] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [busyTest, setBusyTest] = useState('')
  const canManage = ['Owner', 'Admin'].includes(role)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [settings, domains, alerts, sends, events] = await Promise.all([
        getEmailSettings(), dmList('sending_domains'), dmList('alerts'), dmList('email_sends'), dmList('email_events'),
      ])
      let bounces = 0
      let complaints = 0
      ;(events || []).forEach((e) => { if (e.type === 'bounce') bounces++; else if (e.type === 'complaint') complaints++ })
      setData({
        settings: settings || {},
        domains: domains || [],
        alerts: (alerts || []).sort((a, b) => (b.created_at || 0) - (a.created_at || 0)),
        total: (sends || []).length,
        bounces,
        complaints,
      })
    } catch {
      setData(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Fill the settings form from whatever is loaded.
  useEffect(() => {
    if (!data) return
    const s = data.settings || {}
    setForm({
      legal_name: s.legal_name || '',
      postal_address: s.postal_address || '',
      daily_cap: s.daily_cap || '',
      require_approval: s.require_approval === true,
    })
  }, [data])

  const doResume = async () => {
    setResuming(true)
    try { await resumeSending(); await load() } catch { /* ignore */ }
    setResuming(false)
  }

  const saveSettings = async () => {
    setSavingCfg(true); setSavedMsg('')
    try {
      await updateEmailSettings({
        legal_name: form.legal_name.trim(),
        postal_address: form.postal_address.trim(),
        daily_cap: form.daily_cap === '' ? null : Number(form.daily_cap),
        require_approval: !!form.require_approval,
      })
      setSavedMsg('Saved')
      await load()
    } catch (e) {
      setSavedMsg('Could not save: ' + (e?.message || 'error'))
    }
    setSavingCfg(false)
    setTimeout(() => setSavedMsg(''), 3000)
  }

  const runTest = async (label, opts) => {
    setBusyTest(label)
    try { await testData(opts); await load() } catch { /* ignore */ }
    setBusyTest('')
  }

  if (loading) return <div className="mt-7 text-sm text-slate-400">Loading sending health…</div>
  if (!data) return null

  const s = data.settings
  const paused = s.sending_paused === true
  const pct = (n) => (data.total ? ((n / data.total) * 100).toFixed(2) + '%' : '0.00%')
  const hasFooter = !!(s.legal_name && s.postal_address)

  return (
    <div className="mt-7">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500"><ShieldCheck className="h-3.5 w-3.5" /> Sending health (Admin)</p>
        <button onClick={load} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
      </div>

      {/* Status banner */}
      <div className={`mt-3 flex items-center justify-between rounded-xl border p-4 ${paused ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
        <div className="flex items-center gap-3">
          {paused ? <ShieldAlert className="h-6 w-6 text-rose-500" /> : <ShieldCheck className="h-6 w-6 text-emerald-500" />}
          <div>
            <p className={`text-sm font-extrabold ${paused ? 'text-rose-700' : 'text-emerald-700'}`}>{paused ? 'Sending PAUSED' : 'Sending active'}</p>
            <p className="text-xs text-slate-500">{paused ? (s.paused_reason || 'Paused by the circuit breaker') : 'No issues — the circuit breaker is watching.'}</p>
          </div>
        </div>
        {paused && canManage && (
          <button onClick={doResume} disabled={resuming} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50">
            <PlayCircle className="h-4 w-4" /> {resuming ? 'Resuming…' : 'Resume sending'}
          </button>
        )}
      </div>

      {/* Stats grid */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Warm-up" value={s.verified === false || !s.warmup_stage ? '—' : `Week ${s.warmup_stage}`} sub={<span className="inline-flex items-center gap-1"><Flame className="h-3 w-3 text-amber-500" /> cap {s.warmup_cap || s.effective_daily_cap || '—'}/day</span>} tone="amber" />
        <Stat label="Sent today" value={s.sent_today ?? 0} sub={`${s.remaining_today ?? '—'} remaining`} />
        <Stat label="Bounce rate" value={pct(data.bounces)} sub={`${data.bounces} of ${data.total} · target < 2%`} tone={data.total >= 200 && data.bounces / data.total > 0.05 ? 'red' : 'green'} />
        <Stat label="Complaint rate" value={pct(data.complaints)} sub={`${data.complaints} of ${data.total} · target < 0.1%`} tone={data.total >= 200 && data.complaints / data.total > 0.001 ? 'red' : 'green'} />
      </div>

      {/* Test tools (only with ?dmtest=1) — exercise the numbers before real sending exists */}
      {TEST_MODE && canManage && (
        <div className="mt-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-600"><FlaskConical className="h-3.5 w-3.5" /> Test tools (demo data)</p>
          <p className="mt-1 text-xs text-slate-500">Press a button, watch the number change. In real use the server fills these from actual sending.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => runTest('sent', { sends: 10 })} disabled={!!busyTest} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">{busyTest === 'sent' ? '…' : '+10 Sent'}</button>
            <button onClick={() => runTest('bounce', { bounces: 1 })} disabled={!!busyTest} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">{busyTest === 'bounce' ? '…' : '+1 Bounce'}</button>
            <button onClick={() => runTest('complaint', { complaints: 1 })} disabled={!!busyTest} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">{busyTest === 'complaint' ? '…' : '+1 Complaint'}</button>
            <button onClick={() => runTest('reset', { reset: true })} disabled={!!busyTest} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50">{busyTest === 'reset' ? '…' : 'Reset (clean)'}</button>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Note: Bounce/Complaint change instantly on this panel. "Sent today" updates within ~1 minute (the scheduler recomputes it).</p>
        </div>
      )}

      {/* Footer requirement + domains */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400"><MapPin className="h-3.5 w-3.5" /> Footer (legal, required)</p>
          {hasFooter ? (
            <div className="mt-2 text-sm text-slate-700">
              <p className="font-semibold">{s.legal_name}</p>
              <p className="text-xs text-slate-400">{s.postal_address}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><ShieldCheck className="h-3.5 w-3.5" /> Ready to send</p>
            </div>
          ) : (
            <p className="mt-2 text-sm font-semibold text-rose-600">Missing — sending is blocked until the team legal name + postal address are set.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400"><Globe className="h-3.5 w-3.5" /> Sending domains</p>
          {data.domains.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">No domains added yet.</p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {data.domains.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{d.domain}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${d.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : d.status === 'failed' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>{d.status || 'pending'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* (Email settings editor now lives in Team Settings → Email & Sending Domain.) */}

      {/* Recent alerts */}
      {data.alerts.length > 0 && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400"><Bell className="h-3.5 w-3.5" /> Recent alerts</p>
          <div className="mt-2 space-y-1.5">
            {data.alerts.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-slate-700">{a.reason || a.type}</span>
                <span className="shrink-0 text-xs text-slate-400">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
