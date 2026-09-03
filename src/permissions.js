// Central permission catalog + role presets for the RBAC system.
// Every gated capability in the app has a key here. A user's effective
// permissions = their role preset, with per-user overrides applied on top.

export const PERMISSION_GROUPS = [
  {
    group: 'Pages',
    perms: [
      { key: 'dashboard.view', label: 'View Dashboard' },
      { key: 'listings.view', label: 'View My Deals' },
      { key: 'dealrooms.view', label: 'View Deal Rooms' },
    ],
  },
  {
    group: 'Listings',
    perms: [
      { key: 'listing.create', label: 'Create listing' },
      { key: 'listing.edit', label: 'Edit listing' },
      { key: 'listing.delete', label: 'Delete deal' },
      { key: 'listing.publish', label: 'Publish / unpublish listing' },
      { key: 'listing.feature', label: 'Set featured listing' },
      { key: 'deal.edit_contacts', label: 'Edit deal contacts' },
      { key: 'deal.edit_broker', label: 'Edit broker of record' },
      { key: 'deal.edit_owner', label: 'Edit deal owner' },
    ],
  },
  {
    group: 'Documents',
    perms: [
      { key: 'document.create', label: 'Create document' },
      { key: 'document.edit', label: 'Edit document' },
      { key: 'document.delete', label: 'Delete document' },
      { key: 'document.download_pdf', label: 'Download PDF' },
    ],
  },
  {
    group: 'Deal Rooms',
    perms: [
      { key: 'dealroom.create', label: 'Create deal room' },
      { key: 'dealroom.manage_access', label: 'Manage room access' },
      { key: 'dealroom.delete', label: 'Delete deal room' },
    ],
  },
  {
    group: 'Team & Billing',
    perms: [
      { key: 'team.invite', label: 'Invite team members' },
      { key: 'team.manage_permissions', label: 'Manage roles & permissions' },
      { key: 'team.view_all_leads', label: "See all team members' leads & data" },
      { key: 'billing.manage', label: 'Manage billing & subscription' },
    ],
  },
]

export const ALL_PERMS = PERMISSION_GROUPS.flatMap((g) => g.perms.map((p) => p.key))

// Role presets — the default permission set for each role.
// Mirrors the client's "User Permissions" matrix:
//   Owner  = full control, the only role that can delete a deal.
//   Admin  = everything except deleting a deal.
//   Manager= everything except deleting a deal and team-mgmt (roles/billing); CAN invite.
//   Member = like Manager, but can't invite, can't feature, and can't edit a deal's
//            contacts / broker of record / owner. Still sees all team leads & data.
const OWNER_ONLY = ['listing.delete', 'dealroom.delete']          // Delete deal — Owner only
const OWNER_ADMIN_ONLY = ['team.manage_permissions', 'billing.manage'] // roles & billing
const MEMBER_EXCLUDE = ['team.invite', 'listing.feature', 'deal.edit_contacts', 'deal.edit_broker', 'deal.edit_owner']
export const ROLE_PRESETS = {
  Owner: [...ALL_PERMS],
  Admin: ALL_PERMS.filter((k) => !OWNER_ONLY.includes(k)),
  Manager: ALL_PERMS.filter((k) => !OWNER_ONLY.includes(k) && !OWNER_ADMIN_ONLY.includes(k)),
  Member: ALL_PERMS.filter((k) => !OWNER_ONLY.includes(k) && !OWNER_ADMIN_ONLY.includes(k) && !MEMBER_EXCLUDE.includes(k)),
}

export const ROLES = Object.keys(ROLE_PRESETS)

export const ROLE_INFO = {
  Owner: { color: 'amber', desc: 'Account owner — full control, including billing, team management, and the only role that can delete a deal.' },
  Admin: { color: 'rose', desc: 'Everything except deleting a deal — full team management & billing.' },
  Manager: { color: 'indigo', desc: "All features except deleting a deal and managing roles/billing. Can invite members and sees all team leads & data. Paid seat." },
  Member: { color: 'slate', desc: "Sees all team leads & data, but can't invite, feature listings, or edit a deal's contacts / broker / owner. Paid seat." },
}

// Realtime DB keys can't contain "." — encode permission keys for storage.
// (Permission keys never contain "-", so the mapping is reversible.)
export const encPerm = (k) => k.replace(/\./g, '-')
export const decPerm = (k) => k.replace(/-/g, '.')
export const decodeOverrides = (ov) => { const o = {}; for (const k in (ov || {})) o[decPerm(k)] = ov[k]; return o }
export const encodeOverrides = (ov) => { const o = {}; for (const k in (ov || {})) o[encPerm(k)] = ov[k]; return o }

// Effective permission set = role preset ± per-user overrides ({ key: true|false }).
export function resolvePerms(role, overrides) {
  const set = new Set(ROLE_PRESETS[role] || [])
  const ov = overrides || {}
  for (const key of Object.keys(ov)) {
    if (ov[key]) set.add(key)
    else set.delete(key)
  }
  return set
}
