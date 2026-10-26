// ------------------------------------------------------------------------------------
// Email + Social Publishing — DATA MODEL (Milestone 1: the five email tables).
//
// Spec reference: distribution plan, Section 5.5 (Data model).
//
// This project's database is Firebase Realtime Database (not SQL), so a "table" here is a
// keyed node under one team-scoped namespace:
//
//     distribution/<TEAM_KEY>/<table>/<id>
//
// Five M1 tables:
//   sending_domains      — one row per sending domain (DKIM tokens, DNS records, verify state)
//   team_email_settings  — the team's SES config, caps, warm-up stage, approval flag, footer
//   suppressions         — do-not-send list (unsubscribe / bounce / complaint), keyed by email
//   email_sends          — one row per recipient per campaign, keyed by idempotency_key
//   email_events         — SES events (delivery / bounce / complaint / open / click / unsub)
//
// Access model (enforced by database.rules.json):
//   - sending_domains, team_email_settings : Owner/Admin WRITE, whole team READ.
//   - suppressions, email_sends, email_events : SERVER-ONLY write (Cloud Functions via the
//     Admin SDK, which bypasses rules). The dashboard only READS these, so delivery records
//     and the suppression list can't be tampered with from a browser. (Section 6, rule 9/12.)
//   - Everything is under the single team key, and every read requires auth, so no other
//     team / the anonymous public can see it (Section 6, rule 11 — team isolation).
//
// Record shapes (documented; RTDB itself is schemaless). `*` = set by the server later.
//   sending_domains/<id>      : { domain, mail_from_subdomain, status, dkim_tokens[],
//                                 dns_records[], created_at, verified_at* }
//   team_email_settings/config: { from_name, reply_to, legal_name, postal_address,
//                                 daily_cap, warmup_stage, require_approval,
//                                 ses_config_set, status, updated_at }
//   suppressions/<emailKey>   : { email, reason, source, created_at }                  (server)
//   email_sends/<idem_key>    : { campaign_id, lead_id, email, status, ses_message_id*,
//                                 created_at, sent_at* }                                (server)
//   email_events/<pushId>     : { send_id, type, email, campaign_id, data, created_at } (server)
// ------------------------------------------------------------------------------------
import { db, functions } from './firebase'
import { httpsCallable } from 'firebase/functions'
import {
  ref as dbRef,
  get as dbGet,
  set as dbSet,
  update as dbUpdate,
  push as dbPush,
  remove as dbRemove,
} from 'firebase/database'

// One shared team workspace, same key the rest of the app uses (see api.js TEAM_KEY).
export const TEAM_KEY = 'vaziamts'

export const DIST_TABLES = [
  'sending_domains',
  'team_email_settings',
  'suppressions',
  'email_sends',
  'email_events',
  'jobs',   // STEP 2: background job queue (server-only write)
  'alerts', // STEP 8: circuit-breaker alerts (server-only write)
]

// --- job queue (STEP 2) + circuit breaker (STEP 8) — wrappers around the server functions ----
// These are server-side actions (Owner/Admin only); the browser calls them via Cloud Functions.
export const enqueueTestJob = () => httpsCallable(functions, 'enqueueTestJob')().then((r) => r.data)
export const runScheduler = () => httpsCallable(functions, 'distributionTick')().then((r) => r.data)
export const checkBreaker = () => httpsCallable(functions, 'distributionBreakerCheck')().then((r) => r.data)
export const resumeSending = () => httpsCallable(functions, 'resumeSending')().then((r) => r.data)
export const warmupStatus = () => httpsCallable(functions, 'distributionWarmupStatus')().then((r) => r.data)
// TEST ONLY: add demo sends/bounces/complaints, or reset, to exercise the admin numbers.
export const testData = (opts) => httpsCallable(functions, 'distributionTestData')(opts || {}).then((r) => r.data)

const tablePath = (table, id) =>
  `distribution/${TEAM_KEY}/${table}${id != null && id !== '' ? '/' + id : ''}`

// RTDB keys can't contain . # $ [ ] / — used to key suppressions/sends by email address.
export const emailKey = (email) =>
  String(email || '').trim().toLowerCase().replace(/[.#$/[\]]/g, ',')

// RTDB returns a keyed node as an object; normalise to an array where each row carries its id.
const toArray = (val) =>
  val == null
    ? []
    : Array.isArray(val)
      ? val.filter((x) => x != null)
      : Object.entries(val).map(([k, v]) => (v && typeof v === 'object' ? { id: k, ...v } : { id: k, value: v }))

// --- generic row operations --------------------------------------------------------
// Read one row by id (null if it doesn't exist).
export async function dmGet(table, id) {
  const snap = await dbGet(dbRef(db, tablePath(table, id)))
  return snap.val()
}
// Read a whole table as an array (each row carries its `id`).
export async function dmList(table) {
  const snap = await dbGet(dbRef(db, tablePath(table)))
  return toArray(snap.val())
}
// Create or fully replace a row at a known id.
export async function dmSet(table, id, obj) {
  await dbSet(dbRef(db, tablePath(table, id)), obj)
  return { id, ...obj }
}
// Merge fields into an existing row.
export async function dmUpdate(table, id, patch) {
  await dbUpdate(dbRef(db, tablePath(table, id)), patch)
}
// Append a row under a generated push id (e.g. email_events) — returns the new id.
export async function dmPush(table, obj) {
  const r = dbPush(dbRef(db, tablePath(table)))
  await dbSet(r, obj)
  return r.key
}
export async function dmRemove(table, id) {
  await dbRemove(dbRef(db, tablePath(table, id)))
}

// --- convenience helpers the rest of the feature will use --------------------------
// The team has exactly one settings row, stored at team_email_settings/config.
export const getEmailSettings = () => dmGet('team_email_settings', 'config')
export const setEmailSettings = (obj) =>
  dmSet('team_email_settings', 'config', { ...obj, updated_at: Date.now() })
// Merge a few fields into the settings without wiping the scheduler-computed values
// (warmup_cap, sent_today, etc.). Used by the dashboard's Email Settings editor.
export const updateEmailSettings = (patch) =>
  dmUpdate('team_email_settings', 'config', { ...patch, updated_at: Date.now() })

// Is this email on the do-not-send list? (checked before every send — Section 6, rule 4.)
export const isSuppressed = async (email) =>
  (await dmGet('suppressions', emailKey(email))) != null

// Save a campaign draft from the composer wizard (team-writable; Section 5.5 campaigns table).
// With an `id` it updates that draft in place; otherwise it creates a new one. Returns the id.
export async function saveCampaignDraft(data) {
  const { id, ...rest } = data || {}
  if (id) {
    await dmSet('campaigns', id, { ...rest, status: rest.status || 'draft', updated_at: Date.now() })
    return id
  }
  return dmPush('campaigns', { ...rest, status: 'draft', created_at: Date.now() })
}

// List this team's campaigns (most recent first).
export async function listCampaigns() {
  const rows = await dmList('campaigns')
  return rows.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
}

export const deleteCampaignDraft = (id) => dmRemove('campaigns', id)

// --- approval workflow (Section 5.5 campaigns; Milestone 2, step 8) -----------------
// A campaign moves: draft → pending_approval → approved / rejected. When the team setting
// require_approval is on, a Member must submit and a Manager/Admin must approve before it can
// send. (Send itself is Milestone 1 / AWS; this is the human gate that comes before it.)
export const submitForApproval = (id, by) =>
  dmUpdate('campaigns', id, { status: 'pending_approval', submitted_by: by || '', submitted_at: Date.now(), review_comment: '', updated_at: Date.now() })
export const approveCampaign = (id, by) =>
  dmUpdate('campaigns', id, { status: 'approved', approved_by: by || '', approved_at: Date.now(), review_comment: '', updated_at: Date.now() })
export const rejectCampaign = (id, by, comment) =>
  dmUpdate('campaigns', id, { status: 'rejected', reviewed_by: by || '', reviewed_at: Date.now(), review_comment: comment || '', updated_at: Date.now() })

// --- scheduling controls (Milestone 2, step 7) --------------------------------------
// A scheduled campaign can be rescheduled (new time) or cancelled (back to send-now) right up
// until sending starts. The every-minute scheduler is the backend that picks these up later.
export const updateCampaignSchedule = (id, schedule) =>
  dmUpdate('campaigns', id, { schedule, updated_at: Date.now() })

// --- custom campaign templates (team-created; built-in ones live in templatesData.js) ----------
export async function listTemplates() {
  const rows = await dmList('templates')
  return rows.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
}
export async function saveTemplate(data) {
  const { id, ...rest } = data || {}
  if (id) {
    await dmSet('templates', id, { ...rest, is_system: false, updated_at: Date.now() })
    return id
  }
  return dmPush('templates', { ...rest, is_system: false, created_at: Date.now() })
}
export const deleteTemplate = (id) => dmRemove('templates', id)

// Expose the helpers on window so the data model can be exercised from the browser console.
// Always on in dev (`npm run dev`); on the live build only when the URL carries ?dmtest=1,
// so production stays clean unless we're deliberately testing. (Temporary M1 testing aid —
// safe to remove once the data model is confirmed; all writes stay gated by security rules.)
const __dmTestFlag = (() => {
  try { return new URLSearchParams(window.location.search).get('dmtest') === '1' } catch { return false }
})()
if ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) || __dmTestFlag) {
  try {
    window.dm = {
      dmGet, dmList, dmSet, dmUpdate, dmPush, dmRemove,
      emailKey, getEmailSettings, setEmailSettings, isSuppressed,
      enqueueTestJob, runScheduler, checkBreaker, resumeSending, warmupStatus,
      TEAM_KEY, DIST_TABLES,
    }
  } catch {
    /* non-browser / no window — ignore */
  }
}
