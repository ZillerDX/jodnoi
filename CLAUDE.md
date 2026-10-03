# Jodnoi (จดหน่อย)

Personal income/expense tracker as an offline-first PWA (Thai UI, THB only). Data lives in the device (IndexedDB). No backend.

## Stack
React 19 + Vite + TypeScript (strict) + Tailwind v4 + Dexie (IndexedDB) + Recharts + vite-plugin-pwa + Vitest.

## Commands
- Install: `npm install`
- Dev: `npm run dev` (http://localhost:5173)
- Build: `npm run build` (runs `tsc -b` then vite build)
- Lint: `npm run lint` (oxlint)
- Test: `npm test` (vitest run)
- Preview built PWA: `npm run preview`
- Deploy: `npm run deploy` (needs `npx wrangler login` once). Hosted as a Cloudflare Worker with static assets (`wrangler.jsonc`), live at https://jodnoi.jodnoi.workers.dev. Wrangler's `pages` commands now delegate to Workers, so do not use `wrangler pages`.

## Architecture
- `src/lib/` pure logic, no React/DB: types, money (satang), dates, summary (+ tests).
- `src/db/` Dexie schema, seed categories, repositories (CRUD), export/import.
- `src/components/` shared UI (sheet, chips, charts). `src/pages/` Home, Dashboard, History, Settings.

## Conventions
- Money is stored as integer **satang**; never use floats for stored amounts.
- Dates are local calendar strings `YYYY-MM-DD` (not timestamps) so range queries are simple.
- IDs are UUIDs (`newId()` from `src/lib/id.ts` (randomUUID is unavailable on http LAN origins)), so a later sync to a server is possible.
- Dashboard default range = current month.
- Accounts: every transaction has `accountId`; the UI shows one active account at a time (no "all"), remembered in localStorage `activeAccountId`. Categories are shared. Always keep >= 1 visible account; deleting an account moves its transactions to a chosen account. First account is named "บัญชีเริ่มต้น".
- Dexie schema is versioned (`src/db/db.ts`, now v2); never edit an old version, add a new one with `.upgrade()`.
- Backup/CSV pure logic lives in `src/lib/backup.ts` (v1 files still import; v2 includes accounts).
- Deleting a category must not delete transactions (archive instead; summary falls back to "ไม่ระบุหมวด").
- UI language: Thai only. Minimal style, dark mode supported.

## PWA / branding
- Updates are prompt-style: `registerType: 'prompt'`; `src/lib/updatePrompt.ts` + `<UpdateBanner />` ask the user, then `applyUpdate()` reloads. It re-checks every 30 min and when the app returns to the foreground. Never switch back to silent autoUpdate (could reload mid-entry).
- Install button logic: `src/lib/installPrompt.ts` captures `beforeinstallprompt` at load (must be imported first in main.tsx).
- Brand assets are generated from `public/mascot.svg` by `python scripts/build-brand-assets.py` (icons, avatar, mini mascot poses in `src/components/mascotBust.ts`). Edit the script/mascot, then re-render PNGs with the sharp-cli commands in the script header. Do not hand-edit generated files.
- Manifest colors: background_color `#f4f1ff` must match the flat background of `public/icon-maskable.svg` and the boot screen in `index.html`.

## Gotchas
- Product name is Jodnoi, but the IndexedDB name stays `expense-tracker` and localStorage key `activeAccountId` stays: renaming them would orphan existing users' data.
- License is source-available, non-commercial, no-derivatives (see LICENSE); keep the header text in README/LICENSE consistent.
- Data loss risk: clearing browser data wipes everything. Keep Export/Import JSON working; call `navigator.storage.persist()`.
- iOS install is Safari -> Share -> Add to Home Screen (no install prompt event).
- No env vars needed.
