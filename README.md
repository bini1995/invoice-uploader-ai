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
- AI-generated summaries of common CSV issues with "Possible Fixes" and "Warnings"
- Query invoices using natural language (via OpenAI)
- Natural language chart queries show spending trends instantly
- AI-powered invoice quality scores with tips
- AI-driven invoice explanations and anomaly spotting for any invoice
- Auto-generated payment request PDFs and vendor follow-up drafts
- User ratings on AI responses continuously improve future accuracy
- Ask Me Anything assistant for financial questions
- (e.g. "Which vendors had the most inconsistencies last month?")
- Role-based access control (Admins, Approvers, Viewers)
- Activity log of invoice actions
- Auto-routing invoices by vendor or tag
- Budget threshold warnings
- Anomaly detection dashboard
- Fraud pattern detection for suspicious vendor activity
- Timeline view of invoice changes
- Recurring invoice detection with notifications
- Recurring billing templates with automated sending and payment retries
- Linked invoice relationship graph to spot duplicates and vendor patterns
- Smart auto-fill suggestions for vendor tags and payment terms
- Analytics and reports page with filtering and PDF export
- Private notes on invoices
- Shared comment threads for team discussion
- Approver reminders with escalation
- Batch actions with bulk approval and PDF export
- AI explanations for why an invoice was flagged
- Admin settings panel with auto-archive toggle, custom AI tone and upload limits
- "Why did AI say this?" links show confidence and reasoning
- AI-powered bulk categorization of uploaded invoices
- Predictive vendor behavior suggestions
- Anomaly warnings before upload
- Voice-to-upload for quick invoice creation
- Natural language invoice search
- Hoverable vendor bios with website and industry info
- AI fraud detection heatmaps (color-coded anomaly maps)
- Automatic vendor bios + risk scores from public data
- Real-time invoice chat thread with collaborators
- Multi-language support (Spanish and French)
- Browser extension for uploading invoices directly from Gmail
- Slack/Teams notifications for approvals or flags
- Smart keyboard shortcuts (press **A** to archive, **F** to flag, **/** to focus search)
- Real-time "Ops Mode" dashboard with a live feed of invoice activity
- Multi-tenant support so agencies can switch between different client accounts
- Polite vendor notification emails for flagged or rejected invoices
- Scenario planning to test payment delays
- Vendor scorecards rating responsiveness, payment consistency, and volume/price trends
- Vendor management page with notes and spending totals per vendor
- Smart vendor matching for inconsistent spellings
- Team member roles view with profile avatars
- Shareable collaborator mode with comment-only or editor access
- Manual or API-driven payment status sync

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
ALTER TABLE invoices ADD COLUMN po_id INTEGER;
ALTER TABLE invoices ADD COLUMN integrity_hash TEXT;
ALTER TABLE invoices ADD COLUMN retention_policy TEXT DEFAULT 'forever';
ALTER TABLE invoices ADD COLUMN delete_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN tenant_id TEXT DEFAULT 'default';
ALTER TABLE invoices ADD COLUMN department TEXT;
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

Create a `vendor_notes` table to store notes about each vendor:

```sql
CREATE TABLE vendor_notes (
  vendor TEXT PRIMARY KEY,
  notes TEXT
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

Create a `purchase_orders` table to track POs:

```sql
CREATE TABLE purchase_orders (
  id SERIAL PRIMARY KEY,
  po_number TEXT UNIQUE,
  vendor TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  matched_invoice_id INTEGER,
  status TEXT DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Auto-Archive Rule

The backend automatically archives invoices older than 90 days
unless they are marked as `priority`.

Invoices also store a SHA256 `integrity_hash` generated at upload time. You can
set a retention policy (`6m`, `2y`, or `forever`) on upload or later. A daily
job deletes invoices once their `delete_at` date passes.

### Department Workflows

Specify a `department` when uploading invoices and the backend will
apply custom approval rules:

- **Finance** – requires two separate approvals.
- **Legal** – auto-approves and is meant for comments only.
- **Ops** – invoices under $100 auto-approve, others need one manager step.

### Purchase Order Matching

Upload purchase orders separately and the backend will automatically match new invoices
by vendor and amount. Invoices without a matching PO are flagged for manual review
and trigger Slack/Teams alerts. Approved invoices must follow the defined multi-level
workflow based on the `approval_chain`.

### Categorization Rules

Define your own invoice categorization logic. Add rules via `POST /api/analytics/rules` with fields like `vendor`, `descriptionContains`, `amountGreaterThan`, and a resulting `category` or `flagReason`. All rules are returned from `GET /api/analytics/rules`.

Once rules are created you can automatically tag an invoice with
`POST /api/invoices/:id/auto-categorize`. The AI model suggests categories such
as "Marketing", "Legal", or "Recurring" when no rule matches.

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
- `GET /api/invoices/:id/payment-request/pdf` – download a PDF payment request
- `GET /api/invoices/:id/explain` – AI summary of an invoice with anomaly score
- `POST /api/feedback` – submit a rating for an AI-generated result
- `GET /api/feedback` – view average ratings by endpoint
- `GET /api/invoices/vendor-scorecards` – view vendor responsiveness and payment metrics
- `GET /api/invoices/graph` – network graph data linking vendors and duplicate invoices
- `GET /api/vendors` – list vendors with last invoice date and total spend
- `PATCH /api/vendors/:vendor/notes` – update notes for a vendor
- `GET /api/vendors/match?q=name` – fuzzy match vendor names
- `PATCH /api/invoices/:id/payment-status` – update payment status
- `POST /api/invoices/share` – generate a share link for selected invoices
- `GET /api/invoices/shared/:token` – access a shared invoice view
- `POST /api/payments/:id/link` – generate a payment link for an invoice
- `POST /api/payments/stripe/webhook` – Stripe webhook endpoint for status updates
- `POST /api/pos/upload` – upload a CSV of purchase orders
- `GET /api/pos` – list all purchase orders

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

### Recurring & Automated Billing

Create recurring templates that automatically generate new invoices on a schedule. Failed payments are retried up to three times and a 2% late fee is applied after the final attempt. The AI layer predicts payment likelihood and sends Slack/Teams alerts for invoices with a low chance of payment.

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

### Offline Mode (PWA)

The app registers a service worker so you can view and stage invoices even without a network connection. Any actions you take while offline are queued in local storage and automatically synced when the browser comes back online. Install the PWA from your browser's "Add to home screen" option for the best experience.

### Docker Deployment

Run the entire stack in Docker containers:

```bash
cp .env.example .env
docker-compose up --build
```

The frontend is served on `http://localhost:3001` while the API runs on `http://localhost:3000`.

### Troubleshooting

**`Module not found: Can't resolve 'react-router-dom'`**

If you get this error when running `npm start` in the `frontend` directory, the dependencies may not be installed yet. Run:

```bash
cd frontend
npm install
```

This installs `react-router-dom` along with the rest of the packages.
