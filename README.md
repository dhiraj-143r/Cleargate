# ClearGate — Verify. Invoice. Pay. All Clear.

> Nothing passes without verification.

**ClearGate** is an AI-powered platform that collapses verification, invoicing, and payment into a single flow. Enter an email, domain, or company name — ClearGate runs 7 parallel security scans, generates a trust report with AI-powered risk analysis, creates professional invoices, and processes instant USDC payments. All deployed on BuildWithLocus.

## Architecture

```
BuildWithLocus Project: "cleargate"
├── Service: "api"  (Node.js + Express)  → Backend API
└── Service: "web"  (Vite + React)       → Frontend UI
```

## Locus Integrations (12 endpoints, all load-bearing)

| Integration | Purpose |
|-------------|---------|
| Wrapped: OFAC Sanctions | Screen against 25+ sanctions lists |
| Wrapped: VirusTotal | Scan domain against 70+ antivirus engines |
| Wrapped: Hunter | Verify email is real |
| Wrapped: Email Reputation | Check sender risk score |
| Wrapped: IPinfo | Trace IP origin |
| Wrapped: Firecrawl | Scrape company website |
| Wrapped: Gemini | AI risk analysis |
| Checkout | USDC payment processing |
| AgentMail | Email report delivery |
| Email Escrow | Refund failed verifications |
| Pay/Balance | Wallet dashboard |
| Transactions | Full audit trail |

## Technologies

- React (Vite) — Frontend
- Node.js (Express) — Backend
- Locus Checkout SDK — Payments
- BuildWithLocus — Deployment
- USDC on Base — Settlement

## Live URL

`https://svc-{id}.buildwithlocus.com`

## License

MIT
