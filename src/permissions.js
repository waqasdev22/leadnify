// Central permission catalog + role presets for the RBAC system.
// Every gated capability in the app has a key here. A user's effective
// permissions = their role preset, with per-user overrides applied on top.

export const PERMISSION_GROUPS = [
  {
    group: 'Pages',
    perms: [
      { key: 'dashboard.view', label: 'View Dashboard' },
      { key: 'listings.view', label: 'View My Listings' },
      { key: 'dealrooms.view', label: 'View Deal Rooms' },
    ],
  },
  {
    group: 'Listings',
    perms: [
      { key: 'listing.create', label: 'Create listing' },
      { key: 'listing.edit', label: 'Edit listing' },
      { key: 'listing.delete', label: 'Delete listing' },
      { key: 'listing.publish', label: 'Publish / unpublish listing' },
      { key: 'listing.feature', label: 'Set featured listing' },
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
// Owner  = account owner, full control.
// Admin  = Manager + team management & billing (effectively everything).
// Manager= all features, sees all team members' leads & data. Paid seat.
// Member = all features, sees only their own leads & data. Paid seat.
const NO_TEAM_MGMT = ['team.invite', 'team.manage_permissions', 'billing.manage']
export const ROLE_PRESETS = {
  Owner: [...ALL_PERMS],
  Admin: [...ALL_PERMS],
  Manager: ALL_PERMS.filter((k) => !NO_TEAM_MGMT.includes(k)),
  // Member sees only their own data and cannot feature listings (Milestone I 2.7).
  Member: ALL_PERMS.filter((k) => !NO_TEAM_MGMT.includes(k) && k !== 'team.view_all_leads' && k !== 'listing.feature'),
}

export const ROLES = Object.keys(ROLE_PRESETS)

export const ROLE_INFO = {
  Owner: { color: 'amber', desc: 'Account owner — full control, including billing & team management.' },
  Admin: { color: 'rose', desc: 'All features plus team management & billing.' },
  Manager: { color: 'indigo', desc: "All features. Sees all team members' leads & data. Paid seat." },
  Member: { color: 'slate', desc: 'All features. Sees only their own leads & data. Paid seat.' },
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
