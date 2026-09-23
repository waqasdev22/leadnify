/**
 * Leadnify.io — backend Cloud Functions.
 *
 * adminSetPassword: an Owner/Admin sets a team member's password directly (so the member can then
 * sign in with the password chosen for them — no reset email needed). Setting another user's
 * password can only be done server-side with the Admin SDK, and only by an Owner/Admin.
 *
 * (The LinkedIn/Instagram social-connect function was removed from deployment: it required
 * Secret Manager secrets that are not configured, which blocked deploying anything in this
 * codebase. Social connect is a future feature and can be re-added with its secrets set.)
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

admin.initializeApp()
const db = admin.database()

exports.adminSetPassword = onCall({ cors: true }, async (request) => {
  const callerUid = request.auth && request.auth.uid
  if (!callerUid) throw new HttpsError('unauthenticated', 'Sign in first.')

  const roleSnap = await db.ref(`users/${callerUid}/role`).get()
  const callerRole = roleSnap.val()
  if (callerRole !== 'Owner' && callerRole !== 'Admin') {
    throw new HttpsError('permission-denied', 'Only an Owner or Admin can set a member’s password.')
  }

  const { uid, password } = request.data || {}
  if (!uid || typeof uid !== 'string') throw new HttpsError('invalid-argument', 'A target user uid is required.')
  if (uid === callerUid) throw new HttpsError('failed-precondition', 'Use Settings → Change Password to change your own password.')
  if (!password || String(password).length < 6) {
    throw new HttpsError('invalid-argument', 'Password must be at least 6 characters.')
  }

  await admin.auth().updateUser(uid, { password: String(password) })
  return { ok: true }
})
