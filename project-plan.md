# Project Plan

Two genuinely separate frontend applications that will eventually share one backend:

- **LandLord** (`LandLord-Angular-Project-R70-CodeMonkey/`) — property-management app (landlord + tenant roles).
- **BariVara.com** (`BariVara-Angular-Project-R70-CodeMonky/`) — public rental marketplace (guest / tenant / apartment owner / landlord-linked roles).

Both are Angular 22, standalone components, signals-based, and currently **frontend-only**: no backend, no network calls, no persistence beyond `localStorage` (auth). All business data lives in an in-memory `MockDataService` per app and resets on page reload.

This document is the roadmap. **Part 1 (frontend)** records what has been built and which gaps remain. **Part 2 (backend)** is a placeholder to be filled in when backend work starts.

---

## Part 1: Frontend

### Phase 1 — Project scaffolding — ✅ Done

- Two independent Angular applications (Angular 22, TypeScript ~6.0, npm, Vitest unit-test runner).
- Standalone components everywhere, lazy-loaded routes (`loadChildren` / `loadComponent`), no NgModules, no component-level `.html`/`.css` files (inline templates, shared `styles.css`).
- Fixed dev ports so the two apps can run side by side without flags: LandLord `npm start` → **4200**, BariVara `npm start` → **4201**.
- `tsconfig` strictness: `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, strict DI.

### Phase 2 — Data models & mock store — ✅ Done

- **LandLord `MockDataService`**: `Property`, `Unit` (with per-unit usual utility defaults), `TenantRecord` (NID-based identity), `RentalAgreement`, `Invoice`, `PaymentRecord`, `ExpenseRecord`, `LedgerEntry`, `MaintenanceTicket`, `MarketplaceRequest`, plus shared `Conversation` / `AppNotification`.
- **BariVara `MockDataService`**: `OwnerProperty`, `OwnerUnit`, `Listing` (`source: 'owner' | 'landlord-linked'`, `status: active | paused | taken`), `Favorite`, `BookingRequest`, tenant/owner profiles.
- Core business rules live in the mock store so they carry over to a real backend unchanged:
  - `ensureBillsGenerated(period)` — idempotent monthly bill generation (rent + utility snapshot + rolled-over unpaid balance).
  - `applyPaymentToTenant(...)` — oldest-unpaid-month-first payment application, shared by every payment entry point.
  - Invoices are immutable once any payment lands; `updateInvoiceUtilities` is a no-op on paid/partial bills.
  - Tenant NID uniqueness enforced for *active* tenants only (a past tenant's record never blocks a re-registration).
  - `ledgerEntries()` — confirmed payments (income) + expenses (outflow) merged into one cash book, property-scoped.
- **Phase 2.9** — BariVara's `Listing` mirrors the LandLord `Unit` shape where the concepts overlap (`unitNumber`, `rent`, status), so the two apps read the same story.

### Phase 3 — Cross-app connection (pre-backend contract) — ✅ Done (frontend half)

- **Phase 3.4** — both apps default to fixed ports and know each other's dev URL via `src/app/core/cross-app.config.ts` (`LANDLORD_CORE_DEV_URL`, `BARIVARA_DEV_URL`).
- Boundary-crossing DTOs defined in `shared-contracts.ts` (identical hand-kept copies in both apps): `VacancyAdSync`, `BookingRequestSync`, `UnitStatusSync`. These are **defined now but unused** — they become the wire contract in Phase 15.
- Seed data is narratively consistent across apps for a coherent demo (e.g. LandLord vacant unit A-102 @ ৳14,000 ↔ BariVara landlord-linked listing "Green View Apartments — A-102"; applicant Karim Hossain ↔ BariVara tenant profile).
- Dev-only cross-links between the two running apps (each opens the other in a new tab into its own mock world):
  - LandLord → BariVara: "Live on BariVara.com" in Ad Status; "Search on BariVara.com" in tenant Browse & Transfer.
  - BariVara → LandLord: landlord-linked dashboard "Redirect to LandLord core → Marketplace & Leads"; public footer "Manage listings on LandLord".

### Phase 4 — Design system — ✅ Done

- One shared design language across both apps: global `styles.css` with a common class system (`.card`, `.badge-*`, `.table-scroll`, `.module-grid`, `.module-tile`, `.listing-grid`, `.tabs`, `.hero`, `.callout-banner`, etc.).
- **Phase 4.6** — the two stylesheets deliberately share shape so both apps read as one product family, differentiated by brand color: **BariVara orange** vs **LandLord blue**.
- Each app has its own inline-SVG logo (`shared/logo.component.ts`), light/dark variants for header vs sidebar.
- Constraint followed throughout: restrained use of gradient/shadow so the UIs don't look AI-generated.

### Phase 5 — Auth & role-based routing — ✅ Done (stubbed)

- `AuthService` is a frontend stub: accepts any email/password, persists the chosen role to `localStorage`, so route guards behave like a logged-in session.
- `roleGuard` per area; a signed-in user hitting the wrong area is redirected to their own dashboard home.
- **BariVara roles**: guest (public), tenant, apartment owner, landlord-linked (read-only ad view + redirect to LandLord core).
- **LandLord roles**: landlord, tenant.
- Login/signup/forgot/reset screens exist in both apps; real account system is deferred to the backend.

### Phase 6 — LandLord: Property & Units — ✅ Done

- Add property; add / edit units; unit status `vacant` / `occupied`; per-unit utility defaults (with prepaid-meter caveat documented: no "Electricity" item when the tenant recharges directly).
- Occupancy stat on the dashboard.

### Phase 7 — LandLord: Tenant lifecycle — ✅ Done

- Register tenant (walk-in) with NID uniqueness check; assign a vacant unit; create the rental agreement (terms + deposit).
- Tenant detail: edit lease terms, billing history, payment history, maintenance cost history, total due / paid / tenant-borne maintenance.
- Move-out: outstanding balance + damage deductions, refund vs final-bill calculation, unit set vacant, tenant archived (inactive, `unitId` cleared).

### Phase 8 — LandLord: Billing & Payments — ✅ Done

- Monthly Bills: generate current-month bills (auto-generated on entry + manual button), read-only past months, inline edit of utility lines on unpaid bills.
- Receive Payment: per-tenant total due, cash/bank/mobile, applies oldest-unpaid-first.
- Pending Cash: tenant-reported cash payments confirmed or rejected by the landlord; balance only clears on confirmation.
- Tenant side: Pay page (online gateway simulated / cash offline) and payment history.

### Phase 9 — LandLord: Ledger & Expenses — ✅ Done

- Cash-book ledger: every confirmed payment (in) and expense (out), running balance computed over the property-filtered ledger *before* the date range narrows, so narrowing doesn't reset the balance; property + date filters; totals in/out/net.
- Expenses: log with category, description, amount, bearer (`landlord` / `tenant`), tenant attribution when tenant-borne; feeds the ledger and tenant cost history.

### Phase 10 — LandLord: Maintenance — ✅ Done

- Tickets list/detail/new (landlord and tenant views); pending vs resolved; ticket status counts on the dashboard; tenant-borne costs roll into the ledger via expenses.

### Phase 11 — LandLord: Marketplace & Leads — ✅ Done (mock)

- Ad Status per unit: live / paused / not listed; pause & repost.
- Booking Requests: list + detail, approve / reject, optional chat box.
- Tenant Browse & Transfer: request transfer to a vacant unit (creates a `MarketplaceRequest` with a `tenantId`).

### Phase 12 — BariVara: Public marketplace — ✅ Done

- Homepage: hero search (district → area → property type), recent listings.
- Browse: filters for query, district, area, property type, source (owner-posted vs landlord-linked); only `active` listings shown.
- Listing detail: save to favorites (tenants), book a listing (creates a `BookingRequest`); guests are prompted to sign up. Listings mark `taken` once an owner approves a request.
- No listing images yet (placeholder "No photo" blocks).

### Phase 13 — BariVara: Owner portal — ✅ Done

- Properties: add property + unit (initial creation only).
- My Listings: post an ad (auto-fill from an owned property/unit, or manual entry), edit, repost, delete.
- Requests: list + detail for a listing's booking requests; approve → mark unit filled / take ad down (`status: taken`); reject → notify applicant.

### Phase 14 — Messaging & notifications — ⚠️ Partial

- Conversation list and thread views exist in both apps; notifications list with read/unread and delete.
- **Gaps**: no way to *start* a new conversation (seed data only); the chat "Send" button on request-detail pages is not wired up; BariVara tenant notifications do not react to booking-request status changes (no auto-notifications from approve/reject).

### Phase 15 — Real cross-app sync — ⏳ Planned (blocked on Part 2: backend)

The boundary DTOs from Phase 3 become live wire contracts over a shared backend:

- **c3040** — LandLord: unit goes vacant → `VacancyAdSync` → BariVara auto-posts a `Listing` with `source: 'landlord-linked'`.
- **e5045** — BariVara: someone requests a landlord-linked listing → `BookingRequestSync` → LandLord creates a `MarketplaceRequest`.
- **e5125** — LandLord: approve / mark unit filled / pause ad → `UnitStatusSync` → BariVara updates or removes the corresponding listing.

Until then, each app manages its own mock data independently and the two apps only link to each other's dev URLs.

### Phases 16–18 — Reserved

Future frontend enhancements (to be named when scoped, e.g. listing images/uploads, persistence via storage, conversation creation).

### Phase 19 — Production domains — ⏳ Planned

Replace the hardcoded dev URLs in `cross-app.config.ts` with environment-based configuration backed by real domains.

---

## §3a — Known gaps & non-blocking issues

Found during review; not blocking, not yet fixed.

### LandLord
- No property edit/delete (add-only property form; units can be edited).
- No way to start a new conversation (messages are static seed data).
- Single hardcoded demo tenant (`t-1`, Rahim Uddin) and one property.
- Documents page has no upload/file handling behind it.
- `Unit` / `Property` carry no `district` / `area`, though `VacancyAdSync` requires them — Phase 15 mapping must derive them.

### BariVara
- No unit-management page for owners beyond initial creation (can't list/edit owner units independently).
- No way to start a new conversation (messages are static seed data).
- Single hardcoded demo tenant (`tenant-1`, Karim Hossain) and owner (`owner-1`, Nasrin Akhter).
- No listing images — placeholder "No photo" blocks.
- No pause action for owner-posted listings (only edit / repost / delete).
- Tenant notifications don't react to booking-request status changes.

### Both apps
- `app.spec.ts` smoke tests are stale: they assert a placeholder `<h1>` ("Hello, …") that no longer renders (the shell is just `<router-outlet>`); they would fail under `ng test`.
- Chat "Send" buttons on request-detail pages are inert.
- No loading/error/empty states beyond inline `@empty` blocks (fine today since data is local and synchronous).
- All state resets on page reload (in-memory signals); only auth survives via `localStorage`.
- Requests/leads and ad status do not actually sync between the apps — narratively consistent only.

---

## Part 2: Backend

> **Placeholder.** This section will be filled in when backend work starts.

Anticipated scope (to be refined):

- **Tech stack & project layout** — TBD.
- **API contract** — implement the Phase 3 DTOs (`VacancyAdSync`, `BookingRequestSync`, `UnitStatusSync`) as real wire shapes so Phase 15 sync works.
- **Auth & accounts** — real user system to replace the `AuthService` stub (roles: landlord, tenant, apartment owner, guest).
- **Persistence** — replace each app's `MockDataService` with server-backed state; port the business rules (bill generation, oldest-unpaid-first payment application, NID uniqueness, ledger, invoice immutability) unchanged.
- **Cross-app sync** — c3040 / e5045 / e5125 flows between LandLord and BariVara.
- **Deployment** — real domains, environment-based config (Phase 19).

---
