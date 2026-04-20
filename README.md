# ClearGate — Verify. Invoice. Pay. All Clear.

> Nothing passes without verification.

**ClearGate** is an AI-powered counterparty verification and payment platform built entirely on the Locus ecosystem. Enter an email, domain, or company name — ClearGate runs **7 parallel security scans**, generates a **trust report with AI risk analysis**, creates **professional invoices**, and processes **instant USDC payments**. All deployed on **BuildWithLocus**.

**🔗 Live:** [svc-cleargate.buildwithlocus.com](https://svc-mo47l6ryjh61wjpz.buildwithlocus.com) (API) | Frontend deployed as `web` service

---

## 🏗️ Architecture

```
BuildWithLocus Project: "cleargate" (Monorepo)
│
├── Service: "api"  (Node.js + Express)
│   ├── 8 route modules (verify, invoice, checkout, deliver, wallet, reports, deploy, health)
│   ├── 4 service modules (locus, checkoutService, invoiceGenerator, auditLogger)
│   └── In-memory data store (reports, sessions, invoices)
│
└── Service: "web"  (Vite + React)
    ├── 9 page components (Landing, Verify, Invoice, Checkout, Dashboard, Report, Audit, Batch, Enterprise)
    ├── 3 shared components (Navbar, Footer, ThreatMap)
    └── Full design system (index.css)
```

### Data Flow

```
User Input (email/domain/company)
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  ClearGate API (Express on BuildWithLocus)           │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  7 Parallel Security Scans via Locus Wrapped  │   │
│  │                                                │   │
│  │  1. Brave Search → OFAC/Sanctions proxy        │   │
│  │  2. Hunter → Email deliverability              │   │
│  │  3. VirusTotal → Domain malware (70+ engines)  │   │
│  │  4. Firecrawl → Website content scrape         │   │
│  │  5. Brave → Email/domain reputation            │   │
│  │  6. Brave → IP/location intelligence           │   │
│  │  7. Gemini 2.5 Flash → AI risk synthesis       │   │
│  └──────────────────────────────────────────────┘   │
│                      │                               │
│                      ▼                               │
│  ┌──────────────────────────────────────────────┐   │
│  │  Trust Report + Risk Score (0-100)             │   │
│  │  → AI-generated assessment & recommendation    │   │
│  │  → Full audit trail with per-call reasoning    │   │
│  └──────────────────────────────────────────────┘   │
│                      │                               │
│                      ▼                               │
│  ┌──────────────────────────────────────────────┐   │
│  │  Invoice Generation (Gemini AI)                │   │
│  │  → Professional line-item breakdown            │   │
│  │  → Payment terms, tax calculation              │   │
│  └──────────────────────────────────────────────┘   │
│                      │                               │
│                      ▼                               │
│  ┌──────────────────────────────────────────────┐   │
│  │  Locus Checkout → USDC on Base                 │   │
│  │  → Instant settlement, on-chain receipt        │   │
│  │  → BaseScan transaction verification           │   │
│  └──────────────────────────────────────────────┘   │
│                      │                               │
│                      ▼                               │
│  ┌──────────────────────────────────────────────┐   │
│  │  Delivery (AgentMail) + Refund (Email Escrow)  │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🔗 Locus Integrations (14 endpoints, all load-bearing)

Every integration below is critical to ClearGate's operation — remove any one and a feature breaks.

| # | Integration | Locus Product | Endpoint | Purpose |
|---|------------|---------------|----------|---------|
| 1 | Brave Search | Wrapped API | `brave/web-search` | OFAC sanctions screening + reputation + IP intel |
| 2 | Hunter | Wrapped API | `hunter/email-verifier` | Email deliverability verification |
| 3 | VirusTotal | Wrapped API | `virustotal/domain-report` | Domain scanned against 70+ antivirus engines |
| 4 | Firecrawl | Wrapped API | `firecrawl/scrape` | Website content scraping & legitimacy check |
| 5 | Gemini AI (Verify) | Wrapped API | `gemini/chat` | AI risk assessment synthesis |
| 6 | Gemini AI (Invoice) | Wrapped API | `gemini/chat` | AI invoice line-item generation |
| 7 | Checkout | Locus Checkout | `checkout/session` | USDC payment processing |
| 8 | Checkout Status | Locus Checkout | `checkout/session/:id` | Real-time payment polling |
| 9 | AgentMail | x402 | `x402/agentmail-send-message` | Trust report email delivery |
| 10 | Email Escrow | Pay API | `pay/send-email` | Automated refunds for failed verifications |
| 11 | Balance | Pay API | `pay/balance` | Wallet dashboard |
| 12 | Transactions | Pay API | `pay/transactions` | Full transaction history & audit trail |
| 13 | Build Auth | BuildWithLocus | `v1/auth/exchange` | API key → JWT for enterprise deployments |
| 14 | Build Deploy | BuildWithLocus | `v1/projects/from-repo` | One-click enterprise portal provisioning |

---

## 🖥️ Pages & Features

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Animated hero with live verification demo, FAQ, integrations grid |
| Verify | `/verify` | 7-point security scan engine with risk meter visualization |
| Invoice | `/invoice` | AI-powered invoice generation from plain-language descriptions |
| Checkout | `/checkout/:id` | USDC payment flow with blockchain confirmation animation |
| Dashboard | `/dashboard` | Wallet balance, transaction history, report management |
| Report | `/report/:id` | Detailed verification report with audit trail |
| Audit | `/audit` | System-level audit log viewer |
| Batch | `/batch` | Bulk verification of multiple targets |
| Enterprise | `/enterprise` | One-click white-label deployment via BuildWithLocus API |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- A Locus API key (`claw_` prefix) from [paywithlocus.com](https://beta.paywithlocus.com)

### 1. Clone & Install

```bash
git clone https://github.com/dhiraj-143r/Cleargate.git
cd Cleargate

# Backend
cd backend
npm install
cp .env.example .env  # Add your LOCUS_API_KEY
npm run dev

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

### 2. Environment Variables

**Backend (`backend/.env`):**

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 8080) |
| `LOCUS_API_KEY` | Yes | Your `claw_` API key from PayWithLocus |
| `LOCUS_API_BASE` | No | API base URL (default: `https://beta-api.paywithlocus.com`) |
| `USE_DUMMY` | No | Set to `true` to use demo data without credits |
| `FRONTEND_URL` | No | CORS origin (default: `http://localhost:5173`) |

### 3. Deploy to BuildWithLocus

ClearGate uses a `.locusbuild` configuration for monorepo deployment:

```bash
# Authenticate
TOKEN=$(curl -s -X POST https://api.buildwithlocus.com/v1/auth/exchange \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"YOUR_CLAW_KEY"}' | jq -r '.token')

# Deploy from GitHub
curl -s -X POST https://api.buildwithlocus.com/v1/projects/from-repo \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "cleargate", "repo": "dhiraj-143r/Cleargate", "branch": "main"}'
```

Or simply: `git push locus main`

---

## 📡 API Reference

### Verification
```
POST /api/verify
Body: { "target": "vendor@company.com" }
Response: { id, target, assessment, scans, auditTrail, costBreakdown }
```

### Invoice Generation
```
POST /api/invoice/generate
Body: { "description": "Website redesign", "amount": 500, "clientName": "Acme Corp" }
Response: { id, invoiceNumber, lineItems, total, terms }
```

### Checkout
```
POST /api/checkout/create
Body: { "reportId": "uuid", "amount": 1.00 }
Response: { id, checkoutUrl, status, mode }
```

### Wallet
```
GET /api/wallet/balance
Response: { balance, currency, walletAddress, network }

GET /api/transactions
Response: { transactions: [...], mode }
```

### Enterprise Deployment
```
POST /api/deploy-enterprise
Body: { "clientName": "Acme Corp" }
Response: { success, project, urls: { web, api } }
```

### Report Delivery
```
POST /api/deliver
Body: { "reportId": "uuid", "email": "client@example.com" }
Response: { id, status, sentAt }
```

### Health Check
```
GET /api/health
Response: { status: "ok", service: "cleargate-api", version: "1.0.0" }
```

---

## 🔒 Security

- **Non-custodial**: All payments flow through Locus Checkout — ClearGate never holds user funds
- **Audit trail**: Every API call is logged with reasoning, cost, and duration
- **Controls**: Spending is capped per verification; AI assessment can block high-risk payments
- **API keys**: Managed via BuildWithLocus environment variables in production (never hardcoded in client code)
- **CORS**: Restricted to frontend origin in production

---

## 🛠️ Technologies

| Layer | Tech |
|-------|------|
| Frontend | React (Vite), vanilla CSS design system |
| Backend | Node.js, Express |
| AI | Gemini 2.5 Flash via Locus Wrapped APIs |
| Payments | Locus Checkout, USDC on Base |
| Deployment | BuildWithLocus (containers, SSL, routing) |
| Email | AgentMail via Locus x402 |

---

## 📄 License

MIT
