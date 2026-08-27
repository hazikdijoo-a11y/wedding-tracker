# Vow & Ledger — Wedding Budget Tracker

A premium, local-first wedding expense tracker and budget dashboard. Track
planned vs. actual spend, vendor contracts and payments, per-event budgets,
and generate reports — all stored offline in your browser (IndexedDB via
Dexie), no backend or account required.

## Features

- Fast "Quick Add Expense" flow with smart category/vendor suggestions
- Dashboard with budget health, alerts, category breakdown, payments due
- Vendor profiles with contract tracking and payment history
- Wedding functions (Haldi, Sangeet, Reception, ...) with per-event budgets
- Planned vs. actual budget table with over/under indicators
- Analytics: category donut chart, spending timeline, contributions
- CSV export and print-to-PDF reports
- JSON backup / restore
- Mobile-first responsive design with bottom nav + FAB, desktop sidebar

## Getting started

```bash
npm install
npm run dev
```

Open the printed `http://localhost:5173/` URL. On first launch you'll walk
through a short onboarding flow (or click "Load sample data" to explore with
a pre-filled demo wedding).

## Build

```bash
npm run build
```

Outputs a static PWA bundle to `dist/`, deployable to any static host
(GitHub Pages, Netlify, Vercel, etc).

## Stack

Vite + React, react-router, Dexie (IndexedDB), recharts, lucide-react.
