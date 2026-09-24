# BidSmith ASF — UK Public Procurement Intelligence Platform

**Evidence-first, accountable and auditable AI procurement workspace.**
BidSmith ASF helps suppliers and contracting authorities scan UK tenders against the right rules — Procurement Act 2023, PPN 02/24, PPN 017 (AI transparency) and more — and generate compliant, evidence-backed bid packages.

> ⚠️ **Status:** pre-release. The platform is being rebuilt to a 4-phase plan (see _Roadmap_). Not yet cleared for public/production use.

## What it does

- **Document Registry** — searchable index of UK procurement policy documents (PPNs, Procurement Act guidance, National Procurement Policy Statements), scraped daily and robots.txt-compliant.
- **Tender Compliance Scanner** — upload/paste an ITT/RFP and scan it against Procurement Act 2023, PPN 06/21, PPN 02/24 and other regimes; get risks, mandatory pass/fail items, checklists and required evidence.
- **Bid Proposal Builder** — generate structured bid proposal packages, then export to PDF/DOCX.
- **Document Composition Suite / PDF Template Editor** — author, audit (AI quality & grammar inspection) and white-label export.
- **Grounded Policy Assistant** — grounded Q&A over the registry with citations.
- **AI runs server-side only.** No model calls from the browser; the server degrades gracefully to a structured fallback mode when no `GEMINI_API_KEY` is configured.

## Architecture

```
┌────────────┐     ┌───────────────────────────┐     ┌──────────────┐
│  React 19   │ <-> │  Express API (server.ts) │ <-> │   Supabase    │
│  Vite SPA   │     │  /api/* routes            │     │  (optional)   │
└────────────┘     │  ├─ scraperEngine          │     └──────────────┘
                   │  ├─ gemini (LLM layer)     │ --> Gemini API
                   │  ├─ documentParser         │
                   │  ├─ bidProposalEngine      │
                   │  └─ pdfGenerator           │
                   └───────────────────────────┘
```

- **Frontend:** React 19 + Vite + Tailwind CSS v4 (`src/`)
- **Backend:** Express + TypeScript (`server.ts`, `server/`)
- **AI:** `@google/genai` via a server-side wrapper with JSON-repair resilience
- **Storage:** Supabase (optional at runtime), plus in-memory registry seeded from `src/data/procurementData.ts`
- **Scraper:** `uk_procurement_scraper.py`, scheduled daily 06:00 UTC via GitHub Actions

## Quick start

Requires Node 20+ (or Bun 1.1+).

```bash
git clone https://github.com/Donny1717/bidsmithasf.git
cd bidsmithasf
npm install          # or: bun install
cp .env.example .env # then fill in what you have

npm run dev          # runs API on http://localhost:3000 with Vite middleware
```

### Environment variables (`.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | for AI features | Gemini API key. Without it, AI endpoints return structured fallback results. |
| `API_KEYS` | **for any shared/public deployment** | Comma-separated API keys accepted by `/api/*` protected routes. Unset = open development mode (loud warning). |
| `APP_URL` | no | Self-referential URL (OAuth callbacks, links). |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | optional | Supabase project credentials. |

### API authentication

Mutating and AI-backed routes require an API key once `API_KEYS` is set:

```bash
curl -H "x-api-key: YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"tenderTitle":"Example","tenderText":"...","userRole":"supplier_bidder"}' \
  http://localhost:3000/api/tender/analyze
```

Rate limits: **120 req/min/IP** on `/api`, **20 req/min/IP** on AI-backed routes (headers `X-RateLimit-*`, `Retry-After` on 429).

## Key endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Liveness/health check |
| GET | `/api/documents` | Registry search (filters: category, documentType, status, search) |
| GET | `/api/documents/:id/pdf` | Generate official-style PDF for a registry document |
| GET | `/api/documents/export/csv|json` | Bulk export |
| POST | `/api/tender/analyze` | Tender compliance scan (flagship) |
| POST | `/api/tender/parse-document` | Upload ITT/RFP (base64) and extract requirements |
| POST | `/api/tender/auto-fix` | AI mitigation for a compliance risk |
| POST | `/api/tender/validate-quality` | AI quality/grammar inspection of a section |
| POST | `/api/bid-proposal/generate` | Generate a bid proposal package |
| POST | `/api/bid-proposal/export-pdf` | White-label proposal PDF export |
| GET/POST | `/api/database/*` | Supabase config/test/save (API-key protected) |
| GET/POST | `/api/scraper/status|sync` | Scraper status / manual sync (sync is key-protected) |

## Build & test

```bash
npm run lint   # tsc --noEmit
npm run build  # vite build + esbuild server bundle
npm start      # node dist/server.cjs (NODE_ENV=production serves dist/)
```

CI (.github/workflows/ci.yml`) runs lint + build on every push/PR.

## Roadmap — 4-phase rebuild

The platform is being rebuilt as an **evidence-first, accountable and auditable AI procurement workspace**. Security, traceability and accessibility are treated as defaults, not add-ons.

| Phase | Name | Focus |
| --- | --- | --- |
| 1 | Foundation & Governance | Constitution, legal/policy baseline (PPN 017, Procurement Act 2023), salvage audit, architecture, security foundation, **accessibility policy (WCAG 2.2 AA + GOV.UK Design System)** |
| 2 | Evidence & Tender Core | Identity, secure document intake, requirement graph, evidence vault, claim ledger, manual review + auditable export |
| 3 | Controlled AI & Assurance | AI personnel registry, Model Gateway (no direct model calls), evidence-bound drafting, AI disclosure per PPN 017, evaluation/red-team |
| 4 | Validation & Private Release | Pen test, WCAG 2.2 AA audit, private beta on synthetic/redacted tenders, assurance bundle, controlled release |

Golden rules across all phases: **no evidence, no material claim · no identity, no AI service · no audit event, no state change · no human verification, no final export.**

## Accessibility

Target: **WCAG 2.2 Level AA** (required for UK public-sector-facing services). In progress — see the roadmap. Automated checks run in CI; manual keyboard/screen-reader testing is planned per phase. Report an accessibility issue by opening a GitHub issue labelled `accessibility`.

## AI disclosure

BidSmith ASF uses generative AI (Google Gemini) **server-side** to draft analyses and proposals. Outputs are drafts until a human verifies them. AI never submits anything autonomously. See [PPN 017](https://www.gov.uk/government/publications/procurement-policy-note-017-improving-transparency-of-ai-use-in-procurement) for the UK procurement context.

## License

All rights reserved (proprietary) pending a final licence decision.
