/**
 * Email + Social Publishing — JOB QUEUE + SCHEDULER (Milestone 1, STEP 2).
 *
 * All background work (send one email to one recipient, publish one social post) runs as a
 * JOB in a queue, so it can be scheduled, retried and made idempotent (Section 5.4 of the spec).
 *
 * Storage: distribution/<TEAM_KEY>/jobs/<jobId>   (server-only write — see database.rules.json)
 *   {
 *     type,          // which handler runs it: 'demo' | 'email_send' | 'social_post' | ...
 *     status,        // 'queued' | 'running' | 'done' | 'failed'
 *     payload,       // handler-specific data
 *     scheduled_at,  // earliest time (ms) the job may run
 *     due_at,        // when the scheduler should pick it up (= scheduled_at, bumped on retry)
 *     attempts,      // how many times it has been tried
 *     max_attempts,  // give up after this many (default 3)
 *     last_error,    // reason string on failure
 *     created_at, updated_at, locked_at, done_at
 *   }
 *
 * The scheduler tick (processDueJobs) runs every minute (onSchedule) and can also be called on
 * demand for testing. It claims each due job atomically (transaction queued -> running), so two
 * overlapping ticks never run the same job twice; handlers must still be idempotent themselves.
 */
const admin = require('firebase-admin')

const TEAM_KEY = 'vaziamts'
const db = () => admin.database()
const jobsRef = () => db().ref(`distribution/${TEAM_KEY}/jobs`)

// --- handler registry --------------------------------------------------------------
// Each job `type` maps to an async function(payload, ctx). The real workers register here:
// the email worker ('email_send') in STEP 5, the social worker ('social_post') in M3.
const handlers = {}
function registerHandler(type, fn) { handlers[type] = fn }

// Built-in demo handler so the queue can be exercised end-to-end before the real workers exist.
registerHandler('demo', async (payload) => ({ ok: true, echo: payload || null }))

// --- enqueue -----------------------------------------------------------------------
async function enqueueJob({ type, payload = null, scheduledAt = Date.now(), maxAttempts = 3 } = {}) {
  if (!type) throw new Error('enqueueJob: type required')
  const now = Date.now()
  const ref = jobsRef().push()
  await ref.set({
    type,
    status: 'queued',
    payload,
    scheduled_at: scheduledAt,
    due_at: scheduledAt,
    attempts: 0,
    max_attempts: maxAttempts,
    last_error: null,
    created_at: now,
    updated_at: now,
  })
  return ref.key
}

// Exponential backoff (ms) between retries: ~30s, 2m, 8m, ... capped at 1 hour.
const backoffMs = (attempt) => Math.min(30000 * Math.pow(4, attempt - 1), 60 * 60 * 1000)

// --- the scheduler tick ------------------------------------------------------------
// Picks up every job whose due_at has passed and runs it. Returns a small summary.
async function processDueJobs(limit = 50) {
  const now = Date.now()
  const snap = await jobsRef().orderByChild('due_at').endAt(now).limitToFirst(limit).get()
  const val = snap.val() || {}
  const ids = Object.keys(val)
  const result = { scanned: ids.length, done: 0, failed: 0, retried: 0, skipped: 0 }

  for (const id of ids) {
    const job = val[id]
    if (!job || job.status !== 'queued') { result.skipped++; continue }
    const ref = jobsRef().child(id)
    const token = Date.now() + '_' + Math.random().toString(36).slice(2)

    // Claim atomically: whichever tick flips 'queued' -> 'running' and stamps its token owns the
    // job. We transact on the whole node and ALWAYS return it (never undefined) — returning
    // undefined would abort the transaction on the initial null read, which is why an earlier
    // version skipped every job. The lock token lets us tell our own claim apart from a rival's.
    const res = await ref.transaction((cur) => {
      if (cur && cur.status === 'queued') {
        cur.status = 'running'
        cur.locked_at = Date.now()
        cur.lock = token
        cur.updated_at = Date.now()
      }
      return cur
    })
    const after = res.committed ? res.snapshot.val() : null
    if (!after || after.lock !== token) { result.skipped++; continue }

    try {
      const handler = handlers[job.type]
      if (!handler) throw new Error('no handler registered for type: ' + job.type)
      await handler(job.payload, { id, job })
      await ref.update({ status: 'done', done_at: Date.now(), updated_at: Date.now(), last_error: null, lock: null })
      result.done++
    } catch (err) {
      const attempts = (job.attempts || 0) + 1
      const reason = (err && err.message) || String(err)
      if (attempts >= (job.max_attempts || 3)) {
        await ref.update({ status: 'failed', attempts, last_error: reason, updated_at: Date.now(), lock: null })
        result.failed++
      } else {
        // Re-queue with a backoff delay (idempotent handlers make a repeat run safe).
        await ref.update({ status: 'queued', attempts, last_error: reason, due_at: Date.now() + backoffMs(attempts), updated_at: Date.now(), lock: null })
        result.retried++
      }
    }
  }
  return result
}

/* -------------------------------------------------------------------------- */
/*  Circuit breaker (STEP 8)                                                   */
/*                                                                            */
/*  Watches the recent bounce/complaint rate and, if it crosses the limits,    */
/*  PAUSES sending and raises an alert — so a bad list can't get the team's    */
/*  Amazon SES account banned or their domain blocked by Gmail (Section 6,     */
/*  rule 6). It only pauses; an Owner/Admin resumes after fixing the list.     */
/* -------------------------------------------------------------------------- */
const CB = {
  MIN_SAMPLE: 200,          // don't judge a rate until at least this many sends
  BOUNCE_PAUSE: 0.05,       // pause above 5% bounces
  COMPLAINT_PAUSE: 0.001,   // pause above 0.1% complaints
  WINDOW_MS: 24 * 60 * 60 * 1000, // look at the last 24 hours
}

const settingsRef = () => db().ref(`distribution/${TEAM_KEY}/team_email_settings/config`)
const sendsRef = () => db().ref(`distribution/${TEAM_KEY}/email_sends`)
const eventsRef = () => db().ref(`distribution/${TEAM_KEY}/email_events`)
const alertsRef = () => db().ref(`distribution/${TEAM_KEY}/alerts`)

// Compute the recent rates and, if over the limits, trip the breaker (pause + alert, once).
async function checkCircuitBreaker() {
  const now = Date.now()
  const windowStart = now - CB.WINDOW_MS

  const [sendsSnap, eventsSnap] = await Promise.all([
    sendsRef().orderByChild('created_at').startAt(windowStart).get(),
    eventsRef().orderByChild('created_at').startAt(windowStart).get(),
  ])
  const sends = sendsSnap.val() || {}
  const events = eventsSnap.val() || {}
  const totalSends = Object.keys(sends).length
  let bounces = 0
  let complaints = 0
  for (const k of Object.keys(events)) {
    const t = events[k] && events[k].type
    if (t === 'bounce') bounces++
    else if (t === 'complaint') complaints++
  }
  const bounceRate = totalSends ? bounces / totalSends : 0
  const complaintRate = totalSends ? complaints / totalSends : 0
  const result = { totalSends, bounces, complaints, bounceRate, complaintRate, tripped: false, reason: null }

  // Need a meaningful sample before a percentage means anything.
  if (totalSends < CB.MIN_SAMPLE) return result

  let reason = null
  if (bounceRate > CB.BOUNCE_PAUSE) reason = `bounce rate ${(bounceRate * 100).toFixed(2)}% exceeds 5%`
  else if (complaintRate > CB.COMPLAINT_PAUSE) reason = `complaint rate ${(complaintRate * 100).toFixed(2)}% exceeds 0.1%`

  if (reason) {
    result.tripped = true
    result.reason = reason
    const cur = (await settingsRef().get()).val() || {}
    if (!cur.sending_paused) {
      // Pause sending and raise the alert exactly once (don't spam on every tick).
      await settingsRef().update({ sending_paused: true, paused_reason: reason, paused_at: now, updated_at: now })
      await alertsRef().push().set({ type: 'circuit_breaker', reason, bounce_rate: bounceRate, complaint_rate: complaintRate, total_sends: totalSends, created_at: now })
      console.log('circuitBreaker TRIPPED:', reason)
    }
  }
  return result
}

// Is sending currently paused? (The send worker in STEP 5 checks this before every send.)
async function isSendingPaused() {
  const cur = (await settingsRef().get()).val() || {}
  return cur.sending_paused === true
}

// Clear the pause (Owner/Admin, after fixing the list). Does not reset history.
async function resumeSending() {
  await settingsRef().update({ sending_paused: false, paused_reason: null, resumed_at: Date.now(), updated_at: Date.now() })
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/*  Warm-up caps (STEP 9)                                                      */
/*                                                                            */
/*  A brand-new sender can't blast its full volume on day one — mailbox        */
/*  providers would flag it as spam. So a team starts with a small daily cap   */
/*  that grows week by week as its reputation builds (Section 6, rule 7). A    */
/*  team whose domain isn't verified yet sends on a shared subdomain with a    */
/*  tiny cap (Section 5.1). The send worker (STEP 5) checks canSendNow() before */
/*  every send.                                                                */
/* -------------------------------------------------------------------------- */
const WARMUP = {
  SCHEDULE: [500, 1000, 2500, 5000, 10000, 25000, 50000], // daily cap per warm-up week (week 1 = index 0)
  UNVERIFIED_CAP: 50,  // domain not verified yet -> shared subdomain, tiny cap
  WEEK_MS: 7 * 24 * 60 * 60 * 1000,
}

// Which warm-up week the team is in (1-based), from when warm-up started.
function warmupStage(startedAt, now = Date.now()) {
  if (!startedAt) return 1
  const weeks = Math.floor((now - startedAt) / WARMUP.WEEK_MS)
  return Math.min(Math.max(weeks + 1, 1), WARMUP.SCHEDULE.length)
}

async function anyDomainVerified() {
  const domains = (await db().ref(`distribution/${TEAM_KEY}/sending_domains`).get()).val() || {}
  return Object.values(domains).some((d) => d && d.status === 'verified')
}

// How many emails were sent today (UTC)?
async function sentToday(now = Date.now()) {
  const d = new Date(now)
  const startOfDayUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  const snap = await sendsRef().orderByChild('created_at').startAt(startOfDayUTC).get()
  return Object.keys(snap.val() || {}).length
}

// The team's current cap and today's usage.
async function warmupStatus() {
  const cfg = (await settingsRef().get()).val() || {}
  const verified = await anyDomainVerified()
  let stage
  let warmupCap
  if (!verified) { stage = 0; warmupCap = WARMUP.UNVERIFIED_CAP }
  else { stage = warmupStage(cfg.warmup_started_at); warmupCap = WARMUP.SCHEDULE[stage - 1] }
  // A manual daily_cap in settings may only LOWER the cap, never raise it past the warm-up limit.
  const cap = cfg.daily_cap ? Math.min(cfg.daily_cap, warmupCap) : warmupCap
  const used = await sentToday()
  return { verified, stage, warmup_cap: warmupCap, daily_cap: cap, sent_today: used, remaining_today: Math.max(0, cap - used) }
}

// Can we send `count` more emails right now? (respects pause + daily cap)
async function canSendNow(count = 1) {
  if (await isSendingPaused()) return { allowed: false, reason: 'sending_paused' }
  const s = await warmupStatus()
  const allowed = s.remaining_today >= count
  return { allowed, reason: allowed ? null : 'daily_cap_reached', ...s }
}

// Write the current warm-up numbers into settings so the admin page (STEP 10) can show them.
async function refreshWarmupStatus() {
  const s = await warmupStatus()
  await settingsRef().update({
    warmup_stage: s.stage,
    warmup_cap: s.warmup_cap,
    effective_daily_cap: s.daily_cap,
    sent_today: s.sent_today,
    remaining_today: s.remaining_today,
    warmup_updated_at: Date.now(),
  })
  return s
}

module.exports = {
  enqueueJob, processDueJobs, registerHandler, backoffMs, TEAM_KEY, jobsRef,
  checkCircuitBreaker, isSendingPaused, resumeSending, CB,
  warmupStatus, canSendNow, refreshWarmupStatus, warmupStage, WARMUP,
}
