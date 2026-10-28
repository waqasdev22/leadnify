# Leadnify — Project Status Update

**Prepared for:** Neil Naran (ValueREIS)
**Re:** 10/18 "Changes" list — progress + what we need from you
**Date:** October 28, 2026
**Live site:** leadnify.io

---

## 1. What we have completed ✅

All of the items below are **built, deployed, and live** on leadnify.io. (Tip: hard-refresh the page, or open an incognito window, to clear your browser cache and see the latest.)

### Property & Listings
- **Property Pictures** — Video files are now blocked, and any image over **15 MB** is rejected with a clear error message (previously large files uploaded silently).
- **Pre-Saved Fields — Property Address** — Street and Zip are now saved separately, so the edit form keeps the full address instead of coming back blank.
- **Pre-Saved Fields — Deal Agents / Contacts** — The full list of agents and contacts on a deal is now saved and reloads correctly when you edit a deal.
- **Cover Picture disappearing after 24–48 hours — FIXED** — Root cause was two open browser sessions overwriting each other's data. We added a **live sync** so every session stays current and covers/data are no longer lost.
- **OM & Saved Pictures** — The Offering Memorandum and gallery photos now stay attached to the property everywhere (edit screen, My Deals, public page, deal room) and survive reopening.
- **Featured listings** — Capped at a maximum of **5** featured properties.

### Leads & CRM
- **Duplicate leads — FIXED** — The same inquiry no longer appears twice in My Leads. (Note: any duplicates created before this fix need a one-time manual delete.)
- **Select + Delete leads** — Checkbox select, Select-All, and bulk delete, now with a clean confirmation popup. (Raw captured lead data is always preserved in the background — nothing is ever truly lost.)
- **Lead routing** — Lead and OM-download notifications now go to the **deal's agent(s)** only (falls back to info@valuereis.com if no agent is set). *(Final lead-source category list to be confirmed with Josh.)*
- **Lead Source** — The Source column is now an editable dropdown per lead; you can **add your own custom sources** and remove them. Website/download leads get a source automatically.
- **"Leads by Source" report** — A new report showing lead count and % grouped by source.
- **Geography Map — "Leads by State"** — Inquiry forms and the manual Add-Lead form now capture the lead's **State**. Each property's deal room shows a "Leads by State" breakdown with %, color-coded (High / Medium / Low). *(Only new leads carry a state; older leads have none.)*
- **Reports date range** — All-time / 30d / 90d / 1yr toggle now actually filters the data.
- **Activity & Pipeline metrics** — The Activity card and pipeline stats (Stage Changes, Executed CA, etc.) now show real, live numbers instead of static placeholders.

### Team & Settings
- **Microsite link moved to Settings** — The public microsite link now lives under Settings (admin-only), and the old "Public URL" card and "Share microsite" button were removed from My Deals.
- **Coordinator role** — Added as a full working role (between Manager and Member) with the correct permissions.
- **Role explanations** — A "What each role can do" card so anyone can see exactly what each role is allowed.
- **Team Settings improvements** — Member-count summary, per-role chips, member search, active indicator, per-member deals/leads counts, and join date.
- **"Done" buttons** — Added where edit screens were missing a clear exit, plus "changes save automatically" notes where applicable.

---

## 2. What we need from you to finish the rest ⏳

Six items from your list are **ready to build** — they're only waiting on accounts, access, or a decision from your side. Once you provide these, we'll complete them.

| # | Item | What we need from you |
|---|------|------------------------|
| **1** | **Constant Contact** (email campaigns) | Constant Contact account login **+ API key** |
| **2** | **LinkedIn auto-posting** (social) | A **LinkedIn Developer App** (Client ID + Secret) and approval for LinkedIn's Posts API |
| **3** | **AI SEO (Sniper / Shotgun ads)** | A **Google Ads or Meta Ads** account **+ an ad budget**, plus an **Anthropic (AI) API key**. Please also confirm which platform to start with. |
| **4** | **Auto-Population from Address** | A **data/Google Places API key + cost approval**. (Population and aerial map are free; traffic, local employers, and local tenants require a paid key.) |
| **5** | **Re-Design / new logo** | A **designer** to refresh the look and provide a new logo (this is a design task, not a code task). |
| **6** | **Admin Portal** | Just a **decision** — no account or cost needed:<br>• **Option A:** Turn the existing "Team & Permissions" page into the Admin Portal, restricted to Owners/Admins only.<br>• **Option B:** Build a brand-new separate Admin Portal page. |

**Plus one quick question for Josh:** please confirm the final list of **lead-source categories** you'd like in the dropdown. (The lead-source feature itself is already built and live.)

---

## 3. Bottom line

- Everything on your list that we could build on our side is **done and live**.
- The **6 items above** are the only ones remaining, and each is blocked on one of: an account/API key, an ad budget, a designer, or your decision (Admin Portal).
- As soon as you provide these, we'll build them and the full changes list will be **100% complete**.

---

*Please reach out with any questions — happy to walk through any of these live.*
