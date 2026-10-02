# PLAN: Jodnoi (จดหน่อย)

Goal: record income/expense in <= 3 taps, custom categories, dashboard with date range (default = current month), installable offline PWA.

## Milestones
- [x] 1. Scaffold + pure logic (types, money, dates, summary) + unit tests. Done when: `npm test` green.
- [x] 2. Dexie schema + seed categories + quick-add sheet (expense/income). Verified on localhost: add record, reload, persists.
- [x] 3. Category management (add/edit/hide, icon + color) in Settings. Code done; NOT yet clicked through manually.
- [x] 4. History grouped by day, edit/delete with Undo. Code done; not yet clicked through manually.
- [x] 5. Dashboard: totals, category donut, daily bars, range presets + custom range (default current month). Verified totals + donut list render; custom range / charts visuals not yet eyeballed.
- [x] 6. Export/Import JSON + CSV, PWA manifest/service worker/install button, storage.persist. Build generates sw.js + manifest; install flow and import NOT yet tested on a device.
- [ ] 7. UI polish, mobile check, deploy (Cloudflare Pages).

## Feature: multiple accounts (approved)
Decisions: view one account at a time (no "all"); first account is named "บัญชีเริ่มต้น"; last selected account is remembered across app opens (localStorage `activeAccountId`); categories shared across accounts; no transfers / opening balance yet.
- [x] A1. Schema v2 (accounts table, transactions.accountId), upgrade creates "บัญชีเริ่มต้น" and moves existing tx into it; repo helpers.
- [x] A2. Account context + top switcher (modal) with persistence; Home/History/Dashboard filtered by active account.
- [x] A3. Settings: manage accounts (add/edit/hide/delete with move-to), QuickAdd saves to active account.
- [x] A4. Backup v2 (accounts included, v1 files still import into active account), CSV account column. Verified in browser: v1->v2 DB upgrade moved existing tx into "บัญชีเริ่มต้น"; add account, per-account totals, last-selected persisted across reload, delete with move-to, last account protected. Parse/CSV covered by unit tests; JSON export/import round trip NOT clicked through in UI.
Rules: cannot delete/hide the last visible account; deleting an account with transactions requires choosing a target account to move them to.

## Local verification
`npm run dev`, open http://localhost:5173 (use browser devtools mobile view). Check: quick-add flow, reload persistence, range filter, offline (devtools > Network > Offline after `npm run build && npm run preview`).

## Production checklist
- `npm run build` + `npm test` + `npm run lint` pass
- Deploy `dist/` to Cloudflare Pages (build cmd `npm run build`, output `dist`), HTTPS on
- Verify install prompt on Android Chrome, Add-to-Home-Screen on iOS Safari
- Rollback: redeploy previous Cloudflare Pages deployment

## Decisions
- Satang integers, `YYYY-MM-DD` date strings, UUID ids (see CLAUDE.md).

## Next
User tries accounts on localhost/phone (dev server: `npm run dev -- --host`, http://192.168.1.240:5173) and reports UX fixes. Before opening the new version on a device that holds real data, export a JSON backup first (schema v2 upgrade is one-way). Then: click through JSON export/import round trip, then deploy to Cloudflare Pages only after the user confirms. Known: oxlint react-purity warnings for `new Date()` in render (benign); bundle ~710 kB (recharts) could be code-split.
