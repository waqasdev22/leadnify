/**
 * Leadnify.io — social connect backend.
 *
 * A signed-in dashboard user connects LinkedIn / Instagram from the browser. The browser only
 * ever handles the public client id and the short-lived OAuth `code`; this Cloud Function does
 * the secret half: it exchanges the code for an access token (using the app secret, which never
 * leaves the server), reads the real account (name / email / username), stores it under the
 * user, and returns it so the dashboard can show exactly which account is connected.
 *
 * Secrets are provided via Firebase secrets (never in the repo or the frontend):
 *   firebase functions:secrets:set LINKEDIN_CLIENT_SECRET
 *   firebase functions:secrets:set INSTAGRAM_CLIENT_SECRET
 * Public client ids are provided as params (safe to expose):
 *   firebase functions:config is not used; set these as env/params at deploy.
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret, defineString } = require('firebase-functions/params')
const admin = require('firebase-admin')

admin.initializeApp()
const db = admin.database()

// Public client ids (safe) — same values as the frontend's VITE_* vars.
const LINKEDIN_CLIENT_ID = defineString('LINKEDIN_CLIENT_ID')
const INSTAGRAM_CLIENT_ID = defineString('INSTAGRAM_CLIENT_ID')
// Secrets (never exposed) — set with `firebase functions:secrets:set ...`.
const LINKEDIN_CLIENT_SECRET = defineSecret('LINKEDIN_CLIENT_SECRET')
const INSTAGRAM_CLIENT_SECRET = defineSecret('INSTAGRAM_CLIENT_SECRET')

const form = (obj) => new URLSearchParams(obj).toString()

// Exchange a LinkedIn OIDC code for a token, then read the member's profile.
async function connectLinkedIn({ code, redirectUri }) {
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: LINKEDIN_CLIENT_ID.value(),
      client_secret: LINKEDIN_CLIENT_SECRET.value(),
    }),
  })
  const token = await tokenRes.json()
  if (!tokenRes.ok || !token.access_token) {
    throw new HttpsError('permission-denied', token.error_description || 'LinkedIn token exchange failed')
  }
  const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })
  const me = await meRes.json()
  return {
    provider: 'linkedin',
    id: me.sub || '',
    name: me.name || '',
    email: me.email || '',
    picture: me.picture || '',
    accessToken: token.access_token,
    expiresAt: Date.now() + (Number(token.expires_in) || 0) * 1000,
    connectedAt: Date.now(),
  }
}

// Exchange an Instagram Business Login code for a token, then read the account.
async function connectInstagram({ code, redirectUri }) {
  const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form({
      client_id: INSTAGRAM_CLIENT_ID.value(),
      client_secret: INSTAGRAM_CLIENT_SECRET.value(),
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }),
  })
  const token = await tokenRes.json()
  if (!tokenRes.ok || !token.access_token) {
    throw new HttpsError('permission-denied', token.error_message || 'Instagram token exchange failed')
  }
  const meRes = await fetch(
    `https://graph.instagram.com/v21.0/me?fields=user_id,username,account_type&access_token=${encodeURIComponent(token.access_token)}`,
  )
  const me = await meRes.json()
  return {
    provider: 'instagram',
    id: String(me.user_id || token.user_id || ''),
    name: me.username ? `@${me.username}` : '',
    username: me.username || '',
    accountType: me.account_type || '',
    accessToken: token.access_token,
    connectedAt: Date.now(),
  }
}

exports.connectSocial = onCall(
  { secrets: [LINKEDIN_CLIENT_SECRET, INSTAGRAM_CLIENT_SECRET], cors: true },
  async (request) => {
    const uid = request.auth && request.auth.uid
    if (!uid) throw new HttpsError('unauthenticated', 'Sign in first.')
    const { provider, code, redirectUri } = request.data || {}
    if (!provider || !code || !redirectUri) {
      throw new HttpsError('invalid-argument', 'provider, code and redirectUri are required.')
    }

    let account
    if (provider === 'linkedin') account = await connectLinkedIn({ code, redirectUri })
    else if (provider === 'instagram') account = await connectInstagram({ code, redirectUri })
    else throw new HttpsError('invalid-argument', `Unsupported provider: ${provider}`)

    // Store the full record (incl. token) privately for the server; return a safe subset.
    await db.ref(`data/${uid}/social/${provider}`).set(account)
    const { accessToken, ...safe } = account
    return safe
  },
)
