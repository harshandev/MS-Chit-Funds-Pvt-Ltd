# MS Chit Funds Pvt. Ltd. — website (DEMO BUILD)

Next.js 16 · TypeScript · Tailwind 4 · Radix UI · Recharts · React Hook Form + Zod. Deploys to Vercel as-is (`vercel` / Git import, framework auto-detected).

**Everything is simulated.** No real payments, KYC, e-signatures or auctions. Demo sign-in OTP is `123456` (see `src/config/company.ts`), shown on screen as a development-only code.

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck && npm run lint && npm test && npm run build
```

## Structure
- `src/config/company.ts` — legal name, contact, verified facts (all `null` until supplied; unverified values are hidden on public pages and listed as missing in `/admin/compliance`).
- `src/lib/money.ts`, `src/lib/chit.ts` — integer-paise money + deterministic illustrative chit maths (unit-tested).
- `src/data/*` — central demo data. `src/services/*` — service interfaces with **mock adapters**; swap for a real API without touching UI.
- `src/components/ui` — design system. Tokens live in `src/app/globals.css`.
- `src/i18n` — English + draft Tamil (needs human translation review).
- Routes: public `(public)`, `(auth)`, `/dashboard/*` (customer), `/admin/*` (console).

## Before launch
Verify company name/CIN/office/registrations/grievance contact, replace provisional logo, get legal text (scheme terms, privacy, terms) approved, review Tamil copy, build a real backend (auth, server-side calculations/auctions, payment gateway + webhooks, KYC, e-sign, audit), then set `NEXT_PUBLIC_ALLOW_INDEXING=true`. See `.env.example`.
