# ClarifyOps Invoice Uploader + AI Error Summarizer

This is a full-stack invoice uploader tool with AI-powered CSV error summarization, built using:

- **React + Tailwind CSS** (frontend)
- **Express + PostgreSQL** (backend)
- **OpenRouter API** for natural language error feedback


## Requirements
- Node.js 18.x LTS

The project relies on Node 18. Using newer versions (e.g. Node 20) can lead to runtime errors such as `TypeError: memorize is not a function` when starting the frontend.

If you use [nvm](https://github.com/nvm-sh/nvm) you can run:

```bash
nvm install 18
nvm use 18
```

After switching Node versions, reinstall the dependencies inside the `frontend` folder:

```bash
cd frontend
npm install --legacy-peer-deps
```

## Features

- Upload CSV, PDF and Excel invoice files
- In-app guided tour for new users
- CSV import/export for invoices and vendors
- See a clean display of parsed invoices
- Get validation feedback for bad rows
- Real-time field validation highlights column errors as you type
- AI-generated summaries of common CSV issues (via OpenRouter)
- AI-generated summaries of common CSV issues with "Possible Fixes" and "Warnings"
- Query invoices using natural language (via OpenRouter)
- Natural language chart queries show spending trends instantly
- AI-powered invoice quality scores with tips
- AI-driven invoice explanations and anomaly spotting for any invoice
- Auto-generated payment request PDFs and vendor follow-up drafts
- User ratings on AI responses continuously improve future accuracy
- Ask Me Anything assistant for financial questions
- AI assistant can answer billing support queries
- Context-aware Inbox Copilot chat for each invoice
- (e.g. "Which vendors had the most inconsistencies last month?")
- Role-based access control (Admins, Approvers, Viewers)
- Admins can generate expiring invitation links for Viewer or Editor accounts
- Activity log of invoice actions
- Downloadable audit history per vendor or invoice
- Detailed logs show who made each change
- Invoice version history with one-click restore
- Auto-routing invoices by vendor or tag
- Smart auto-assignment routes invoices to the usual owner using vendor history
- Budget threshold warnings
- Budget guardrails with live upload warnings and budget forecasts
- Anomaly detection dashboard
- Automatic anomaly alerts with severity tiers
- Fraud pattern detection for suspicious vendor activity
- ML-based anomaly scoring using Isolation Forest with admin feedback loop
- Timeline view of invoice changes
- Recurring invoice detection with notifications
- Invoice duplication prevention using content hashes
- Invoice similarity detection to flag lookalike invoices
- Recurring billing templates with automated sending and payment retries
- Linked invoice relationship graph to spot duplicates and vendor patterns
- Smart auto-fill suggestions for vendor tags and payment terms
- AI-powered autocomplete and cleanup for vendor and total fields
- Analytics and reports page with filtering and PDF export
- Trend reports for monthly spend and aging invoices
- Customizable dashboards with date filters and export options
- Adaptive dashboard with context-aware alerts, AI suggestions and draggable KPI cards
- Custom KPI dashboards per department or vendor with charts like approval time by vendor, late payments trend and invoices over budget
- Public shareable dashboards accessible via secure link
- ML predictions highlight cash-flow problem areas
- Private notes on invoices
- Shared comment threads for team discussion
- Approver reminders with escalation
- Approval workflows track invoices needing review and record status (Pending, Flagged, Approved)
- Smart reminders for overdue invoices and pending approvals (email, Slack/Teams & in-app)
- Manual approval reminder emails can be triggered via `POST /api/reminders/approval`
- Batch actions with bulk approval and PDF export
- Bulk edit/delete/archive options for faster table management
- Multi-step upload wizard guides file selection, review, tagging and final confirmation
- Drag-and-drop upload with real-time field mapping
- AI explanations for why an invoice was flagged
- Admin settings panel with auto-archive toggle, custom AI tone and upload limits
- Invoice expiration auto-closes past-due invoices or flags them for review
- "Why did AI say this?" links show confidence and reasoning
- AI-powered bulk categorization of uploaded invoices
- AI-powered auto tagging with vendor/voucher recommendations
- Predictive vendor behavior suggestions
- Anomaly warnings before upload
- Voice-to-upload for quick invoice creation
- Conversational uploading via natural language commands
- Natural language invoice search
- Hoverable vendor bios with website and industry info
- AI fraud detection heatmaps (color-coded anomaly maps)
- Risk heatmap with clustering graphs highlighting similar invoices or vendors
- Fraud detection reports listing flagged invoices with reasons
- Automatic vendor bios + risk scores from public data
- Real-time invoice chat thread with collaborators
- Multi-language support (Spanish and French)
- Browser extension for uploading invoices directly from Gmail
- Fully responsive mobile layout and installable PWA
- Capture invoice photos on mobile with built-in OCR
- PDF Invoice OCR with AI formatting correction
- Self-learning OCR corrections that retrain parsing from user edits
- Autonomous agents continuously retrain OCR models from field corrections and provide smart suggestions
- Intelligent column mapping suggestions (line items, totals, tax)
- Supplier portal for vendors to upload invoices, update banking info and check payments
- Slack/Teams notifications for approvals or flags
- Smart keyboard shortcuts (press **A** to archive, **F** to flag, **/** to focus search)
- Real-time "Ops Mode" dashboard with a live feed of invoice activity
- Live Invoice Feed shows uploads, flags and approvals in real time
- Multi-tenant support so agencies can switch between different client accounts
- Polite vendor notification emails for flagged or rejected invoices
- Smart Email Drafting Engine 2.0 learns from past messages
- Scenario planning to test payment delays
- Vendor scorecards rating responsiveness, payment consistency, and volume/price trends
- Vendor management page with notes and spending totals per vendor
- Smart vendor matching for inconsistent spellings
- AI vendor matching with confidence scores and accept/reject feedback
- Team member roles view with profile avatars
- Shareable collaborator mode with comment-only or editor access
- Export template builder for custom CSV layouts
- Whitelabel themes and logo per tenant
- New roles: Admin, Accountant and Approver
- Manual or API-driven payment status sync
- Multi-currency support with automatic VAT/GST calculations
- Automation marketplace integrations (Zapier/Make) for Slack and Google Sheets, plus connectors for your accounting platform, via `/api/integrations`
- RPA automation engine triggers post-approval exports to your ERP system
- Scheduled email fetch imports PDF invoices automatically
- Forward invoices to `upload@yourdomain.com` and attachments are parsed via Gmail API
- Low-code automation builder (`/api/automations`) for if‑then API workflows
- Blockchain-backed invoice validation with PDF hashing for tamper-proof records

## Setup Instructions

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Add your DATABASE_URL and OpenRouter API key
# Set either OPENROUTER_API_KEY or OPENAI_API_KEY in .env
# Optional: adjust DUE_REMINDER_DAYS and APPROVAL_REMINDER_DAYS in .env to tweak reminder timing
# Set DATA_ENCRYPTION_KEY to enable at-rest encryption of sensitive fields
# Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER if you want SMS alerts
# Set GOOGLE_SERVICE_ACCOUNT_KEY and EMAIL_INBOX to enable email-to-upload support
npm start
```

### Multi-Tenant Usage

Set an `X-Tenant-Id` header on every API request. Invoices are filtered by this
tenant ID and new uploads will be associated with it. The default tenant is
`"default"` if no header is provided.
Admin users can aggregate data across all tenants by sending `X-Tenant-Id: all`.

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
ALTER TABLE invoices ADD COLUMN content_hash TEXT;
ALTER TABLE invoices ADD COLUMN retention_policy TEXT DEFAULT 'forever';
ALTER TABLE invoices ADD COLUMN delete_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN tenant_id TEXT DEFAULT 'default';
ALTER TABLE invoices ADD COLUMN department TEXT;
ALTER TABLE invoices ADD COLUMN expires_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN expired BOOLEAN DEFAULT FALSE;
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

Create a `cashflow_scenarios` table to store saved payment delay simulations:

```sql
CREATE TABLE cashflow_scenarios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  delay_days INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Auto-Archive Rule

The backend automatically archives invoices older than 90 days
unless they are marked as `priority`.

Invoices also store a SHA256 `integrity_hash` generated at upload time. You can
set a retention policy (`6m`, `2y`, or `forever`) on upload or later. A daily
job deletes invoices once their `delete_at` date passes.
Invoices can also include an `expires_at` date. Any invoice past this
deadline is automatically marked `expired` and flagged for admin review.

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
- `GET /api/invoices/budgets/forecast` – predict next month's spend by department
- `GET /api/invoices/anomalies` – list vendors with unusual spending spikes
- `GET /api/workflows` – list saved workflows
- `POST /api/workflows` – create or update a workflow
- `POST /api/workflows/evaluate` – test workflow rules against a payload
- `GET /api/analytics/report/excel` – download invoice reports in Excel format
- `GET /api/analytics/outliers` – list invoices with unusual amounts
- `GET /api/analytics/dashboard/realtime` – real-time processing metrics

### Workflow Builder

The `/workflow-builder` page lets admins design approval chains and rules with an
interactive expression builder. Test expressions are sent to `POST /api/workflows/evaluate`
to see how rules would route a sample invoice.
The `/inbox` page shows newly uploaded invoices waiting for approval.
- `GET /api/invoices/fraud/flagged` – list flagged invoices with reasons
- `GET /api/invoices/fraud/ml-detect` – list invoices with high anomaly scores
- `POST /api/invoices/fraud/:id/label` – mark invoice as confirmed fraud or not
- `GET /api/invoices/:id/timeline` – view a timeline of state changes for an invoice
- `GET /api/:tenantId/export-templates` – list saved CSV templates
- `POST /api/:tenantId/export-templates` – create a new export template
- `GET /api/:tenantId/export-templates/:id/export` – export invoices using a template
- `PATCH /api/invoices/:id/retention` – update an invoice retention policy (6m, 2y, forever)
- `POST /api/invoices/payment-risk` – predict payment delay risk for a vendor
- `POST /api/invoices/payment-behavior` – predict expected payment date and confidence
- `POST /api/invoices/nl-chart` – run a natural language query and return data for charts
- `POST /api/invoices/cash-flow/scenario` – recalculate cash flow under payment delay scenarios
- `GET /api/scenarios` – list saved cash flow scenarios
- `POST /api/scenarios` – save a cash flow scenario
- `GET /api/scenarios/:id` – run a saved scenario
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
- `GET /api/invoices/amount-suggestions?q=100` – suggest close historical amounts
- `POST /api/invoices/:id/copilot` – context-aware chat about an invoice
- `GET /api/vendors/export` – download vendors as CSV
- `POST /api/vendors/import` – import vendors from CSV
- `PATCH /api/invoices/:id/payment-status` – update payment status
- `POST /api/invoices/import-csv` – upload a CSV of invoices
- Header names are case and space insensitive (e.g. "Invoice Number" works).
- `DELETE /api/invoices/bulk/delete` – delete multiple invoices
- `PATCH /api/invoices/bulk/edit` – bulk update invoice fields
- `POST /api/invoices/:id/auto-tag` – AI auto-tag from common categories
- `POST /api/invoices/suggest-voucher` – recommend a voucher description
- `POST /api/invoices/share` – generate a share link for selected invoices
- `GET /api/invoices/shared/:token` – access a shared invoice view
- `POST /api/invoices/dashboard/share` – generate a public dashboard link
- `GET /api/invoices/dashboard/shared/:token` – view a restricted dashboard
- `GET /api/invoices/:id/versions` – list prior versions of an invoice
- `POST /api/invoices/:id/versions/:versionId/restore` – restore a previous version
- `POST /api/payments/:id/link` – generate a payment link for an invoice
- `POST /api/payments/stripe/webhook` – Stripe webhook endpoint for status updates
- `POST /api/pos/upload` – upload a CSV of purchase orders
- `GET /api/pos` – list all purchase orders
- `GET /api/automations` – list automation rules
- `POST /api/automations` – create an automation
- `PUT /api/automations/:id` – update an automation
- `DELETE /api/automations/:id` – delete an automation
- `POST /api/agents/suggest` – return smart suggestions for an invoice
- `POST /api/agents/retrain` – trigger OCR retraining from corrections

### Vendor Reply Drafts

Request a draft:

```bash
POST /api/invoices/42/vendor-reply
{
  "status": "flagged",
  "reason": "Incorrect PO number"
}
```

Optional fields:

```json
{ "tone": "formal" } // or "casual" for a more relaxed style
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

### AI Error Summary

Have the AI translate CSV upload errors into plain English:

```bash
POST /api/invoices/summarize-errors
{
  "errors": ["Row 1: Missing vendor", "Row 2: Amount invalid"]
}
```

Example response:

```json
{ "summary": "Row 1 is missing a vendor name. Row 2 has an invalid amount." }
```

### AI Vendor Matching

Get AI help choosing the correct vendor when names are incomplete or misspelled.

```bash
POST /api/vendors/ai-match
{
  "vendor": "Acme Co",
  "invoice_number": "12345",
  "amount": 99.50
}
```

Example response:

```json
{ "suggestion_id": 1, "vendor": "Acme Corporation", "confidence": 0.92 }
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

### Invitations

Admins can generate an invite link by calling:

```bash
POST /api/invites { "role": "viewer", "expiresInHours": 48 }
```

The link returned as `/api/invites/<token>` can be shared with a teammate. They
complete the sign‑up via:

```bash
POST /api/invites/<token>/accept { "username": "newuser", "password": "pass" }
```

Invites expire automatically and grant the specified role (viewer or editor).

### Offline Mode (PWA)

The app registers a service worker so you can view and stage invoices even without a network connection. Any actions you take while offline are queued in local storage and automatically synced when the browser comes back online. Install the PWA from your browser's "Add to home screen" option for the best experience.

### Demo Chart Data

If your database is empty, the dashboard charts now display sample data automatically. To generate more realistic demo data in the backend, log in as an admin and click **Seed Dummy Data** on the Vendors page or call:

```bash
POST /api/invoices/seed-dummy
```

This inserts a few demo invoices so charts like *Top Vendors* and *Approval Timeline* look populated during testing. If you prefer to seed from the command line instead of hitting the API, run:

```bash
cd backend
npm run seed-dummy
```

Make sure you log in again to obtain a fresh token if you see a `401` response when calling the endpoint.

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

**`SyntaxError: Error parsing .../ajv/package.json`**

If you see this error when running `npm start`, your dependencies may have been
installed using a newer Node version. Use Node 18 and reinstall:

```bash
nvm use 18
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**`Email error: Invalid login 535-5.7.8`**

Gmail may reject the credentials provided to Nodemailer. Verify `EMAIL_USER` and
`EMAIL_PASS` in your `.env` file. If your Google account has two-factor
authentication enabled, create an [App Password](https://support.google.com/accounts/answer/185833)
and use it as `EMAIL_PASS`.

**`SyntaxError: .../json-schema-draft-07.json: Unexpected end of JSON input`**

This indicates the install was done with an incompatible Node version and
corrupted some dependencies. Switch to Node 18 and reinstall:

```bash
nvm use 18
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**`Database init error: connect ECONNREFUSED ::1:5433`**

This happens when the backend tries to reach PostgreSQL on the IPv6 loopback address. Ensure your `.env` or deployment settings point to the `db` service by setting `DB_HOST=db` and `DB_PORT=5432` (or set `DATABASE_URL=postgres://postgres:postgres@db:5432/invoices_db`).

1. Check that `backend/app.js` begins with `require('dotenv').config();` so environment variables are loaded.
2. In `backend/config/db.js` the `Pool` should read connection info from `process.env` (`DB_HOST`, `DB_PORT`, etc. or `DATABASE_URL`).
3. After updating `.env`, rebuild the containers:

   ```bash
   docker-compose down
   docker-compose up --build
   ```
4. Verify inside the running backend container that `DATABASE_URL`, `DB_HOST`,
   and `DB_PORT` show the expected values:

   ```bash
   docker-compose exec backend env | grep -E 'DATABASE_URL|DB_HOST|DB_PORT'
   ```
   If `DATABASE_URL` still points to `localhost:5433`, override it in your `.env`
   or remove the variable so the `DB_HOST` and `DB_PORT` values are used.

