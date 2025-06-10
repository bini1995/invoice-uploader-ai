# Invoice Uploader + AI Error Summarizer

This is a full-stack invoice uploader tool with AI-powered CSV error summarization, built using:

- **React + Tailwind CSS** (frontend)
- **Express + PostgreSQL** (backend)
- **OpenAI API** for natural language error feedback

## Features

- Upload CSV invoice files
- See a clean display of parsed invoices
- Get validation feedback for bad rows
- AI-generated summaries of common CSV issues (via OpenAI)
- Query invoices using natural language (via OpenAI)
- AI-powered invoice quality scores with tips
- User ratings on AI responses continuously improve future accuracy
- Ask Me Anything assistant for financial questions
- Role-based access control (Admins, Approvers, Viewers)
- Activity log of invoice actions
- Auto-routing invoices by vendor or tag
- Budget threshold warnings
- Anomaly detection dashboard
- Fraud pattern detection for suspicious vendor activity
- Timeline view of invoice changes
- Recurring invoice detection with notifications
- Smart auto-fill suggestions for vendor tags and payment terms
- Private notes on invoices
- Shared comment threads for team discussion
- Approver reminders with escalation
- Batch actions with bulk approval and PDF export
- AI explanations for why an invoice was flagged
- "Why did AI say this?" links show confidence and reasoning
- AI-powered bulk categorization of uploaded invoices
- Hoverable vendor bios with website and industry info
- Smart keyboard shortcuts (press **A** to archive, **F** to flag, **/** to focus search)
- Real-time "Ops Mode" dashboard with a live feed of invoice activity
- Multi-tenant support so agencies can switch between different client accounts
- Polite vendor notification emails for flagged or rejected invoices
- Scenario planning to test payment delays
- Vendor scorecards rating responsiveness, payment consistency, and volume/price trends

## Setup Instructions

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Make sure to add your DATABASE_URL and OPENAI_API_KEY
npm start
```

### Multi-Tenant Usage

Set an `X-Tenant-Id` header on every API request. Invoices are filtered by this
tenant ID and new uploads will be associated with it. The default tenant is
`"default"` if no header is provided.

### Database Update

Add an `assignee` column for storing invoice assignments:

```sql
ALTER TABLE invoices ADD COLUMN assignee TEXT;
ALTER TABLE invoices ADD COLUMN approval_status TEXT DEFAULT 'Pending';
ALTER TABLE invoices ADD COLUMN approval_history JSONB DEFAULT '[]';
ALTER TABLE invoices ADD COLUMN comments JSONB DEFAULT '[]';
ALTER TABLE invoices ADD COLUMN priority BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN flag_reason TEXT;
ALTER TABLE invoices ADD COLUMN approval_chain JSONB DEFAULT '["Manager","Finance","CFO"]';
ALTER TABLE invoices ADD COLUMN current_step INTEGER DEFAULT 0;
ALTER TABLE invoices ADD COLUMN payment_terms TEXT;
ALTER TABLE invoices ADD COLUMN private_notes TEXT;
ALTER TABLE invoices ADD COLUMN due_date DATE;
ALTER TABLE invoices ADD COLUMN integrity_hash TEXT;
ALTER TABLE invoices ADD COLUMN retention_policy TEXT DEFAULT 'forever';
ALTER TABLE invoices ADD COLUMN delete_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN tenant_id TEXT DEFAULT 'default';
```

Create an `activity_logs` table for the audit trail:

```sql
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  action TEXT NOT NULL,
  invoice_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Create a `budgets` table for spending limits:

```sql
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  vendor TEXT,
  tag TEXT,
  period TEXT NOT NULL, -- 'monthly' or 'quarterly'
  amount NUMERIC NOT NULL,
  UNIQUE(vendor, tag, period)
);
```

Create a `feedback` table for storing ratings on AI results:

```sql
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  endpoint TEXT,
  rating INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Auto-Archive Rule

The backend automatically archives invoices older than 90 days
unless they are marked as `priority`.

Invoices also store a SHA256 `integrity_hash` generated at upload time. You can
set a retention policy (`6m`, `2y`, or `forever`) on upload or later. A daily
job deletes invoices once their `delete_at` date passes.

### New Endpoints

- `POST /api/invoices/budgets` – create/update a monthly or quarterly budget by vendor or tag
- `GET /api/invoices/budgets/warnings` – check if spending has exceeded 90% of a budget
- `GET /api/invoices/anomalies` – list vendors with unusual spending spikes
- `GET /api/invoices/:id/timeline` – view a timeline of state changes for an invoice
- `PATCH /api/invoices/:id/retention` – update an invoice retention policy (6m, 2y, forever)
- `POST /api/invoices/payment-risk` – predict payment delay risk for a vendor
- `POST /api/invoices/nl-chart` – run a natural language query and return data for charts
- `POST /api/invoices/cash-flow/scenario` – recalculate cash flow under payment delay scenarios
- `POST /api/invoices/:id/vendor-reply` – generate or send a polite vendor email when an invoice is flagged or rejected
- `GET /api/invoices/:id/payment-request` – download a JSON payload for a payment request form
- `POST /api/feedback` – submit a rating for an AI-generated result
- `GET /api/feedback` – view average ratings by endpoint
- `GET /api/invoices/vendor-scorecards` – view vendor responsiveness and payment metrics

### Vendor Reply Drafts

Request a draft:

```bash
POST /api/invoices/42/vendor-reply
{
  "status": "flagged",
  "reason": "Incorrect PO number"
}
```

Example response:

```json
{ "draft": "Dear Vendor, ..." }
```

Send after manual edits:

```bash
POST /api/invoices/42/vendor-reply
{
  "status": "flagged",
  "manualEdit": "Hi team, please resend with the right PO",
  "email": "billing@acme.com"
}
```

Response:

```json
{ "message": "Email sent successfully." }
```

### Payment Request Form

Request payment data:

```bash
GET /api/invoices/42/payment-request
```

Example response:

```json
{ "vendor": "Acme", "amount": 199.99, "due_date": "2025-06-01" }
```

### Feedback Loop

Feedback submitted through `/api/feedback` is aggregated daily. The average
scores for each endpoint are reviewed to fine‑tune prompts and tweak scoring
heuristics so future AI results get better over time.

### Frontend

```bash
cd frontend
npm install
npm start
```
