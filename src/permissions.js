// Central permission catalog + role presets for the RBAC system.
// Every gated capability in the app has a key here. A user's effective
// permissions = their role preset, with per-user overrides applied on top.

export const PERMISSION_GROUPS = [
  {
    group: 'Pages',
    perms: [
      { key: 'dashboard.view', label: 'View Dashboard' },
      { key: 'listings.view', label: 'View Listing Hub' },
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
    group: 'Team',
    perms: [
      { key: 'team.invite', label: 'Invite team members' },
      { key: 'team.manage_permissions', label: 'Manage roles & permissions' },
    ],
  },
]

export const ALL_PERMS = PERMISSION_GROUPS.flatMap((g) => g.perms.map((p) => p.key))

// Role presets — the default permission set for each role.
export const ROLE_PRESETS = {
  Admin: [...ALL_PERMS], // full control
  Member: [
    'dashboard.view', 'listings.view', 'dealrooms.view',
    'listing.create', 'listing.edit', 'listing.publish',
    'document.create', 'document.edit', 'document.download_pdf',
    'dealroom.create',
  ],
  Coordinator: [
    'dashboard.view', 'listings.view',
    'listing.create', 'document.create',
  ],
}

export const ROLES = Object.keys(ROLE_PRESETS)

export const ROLE_INFO = {
  Admin: { color: 'amber', desc: 'Everything a Member has, plus team management & billing.' },
  Member: { color: 'slate', desc: 'Own documents, all features. Paid seat.' },
  Coordinator: { color: 'emerald', desc: 'Creates documents on behalf of others. Free seat.' },
}

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
