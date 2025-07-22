# ClarifyOps AI Document Ops Engine

This is a full-stack **AI Document Ops Engine** delivering operational clarity for any document through automated intelligence workflows, built using:

- **React + Tailwind CSS** (frontend)
- **Express + PostgreSQL** (backend)
- **OpenRouter API** for natural language error feedback

The backend no longer relies on Redis queues or background workers. All document
processing happens directly through the Express API for a simpler deployment.

The API has been consolidated to a single `/api/documents` namespace (with `/api/invoices` kept as an alias) and the old invoice controller has been removed. Experimental features like feedback collection and the automation builder now live under `/api/labs/*`.

Originally this project focused solely on invoice processing. It is now evolving into a general **Document AI Platform** that handles invoices, contracts and more. See [docs/TRANSFORMATION_PLAN.md](docs/TRANSFORMATION_PLAN.md) for the roadmap.

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

- Smart document router for all document types
- Schema-free data extractor with confidence scores
- Real-time ops timeline via WebSocket
- Conversational agent with pgvector embeddings
- YAML-based plugin rules
- Compliance report generator
- Compliance checker flags missing contract clauses
- Document lifecycle rules with flexible expiration and deletion
- **Enterprise Add-On**: Secure DocuSign signing (stubbed) with optional blockchain hash

 - Upload CSV, PDF and Excel document files
 - In-app guided tour for new users
 - CSV import/export for documents and vendors
 - See a clean display of parsed documents
- Get validation feedback for bad rows
- Real-time field validation highlights column errors as you type
- AI-generated summaries of common CSV issues (via OpenRouter)
- AI-generated summaries of common CSV issues with "Possible Fixes" and "Warnings"
 - Query documents using natural language (via OpenRouter)
 - Natural language chart queries show spending trends instantly
 - AI-powered document quality scores with tips
 - AI-driven document explanations and anomaly spotting for any document
 - Auto-generated payment request PDFs and vendor follow-up drafts
- User ratings on AI responses continuously improve future accuracy
- Ask Me Anything assistant for financial questions
- AI assistant can answer billing support queries
 - Context-aware Inbox Copilot chat for each document
- (e.g. "Which vendors had the most inconsistencies last month?")
- Role-based access control (Admins, Approvers, Viewers)
- Admins can generate expiring invitation links for Viewer or Editor accounts
 - Activity log of document actions
 - Downloadable audit history per vendor or document
- Detailed logs show who made each change
- Document version history with one-click restore
- Auto-routing documents by vendor or tag
- Smart auto-assignment routes documents to the usual owner using vendor history
- Budget threshold warnings
- Budget guardrails with live upload warnings and budget forecasts
- Anomaly detection dashboard
- Automatic anomaly alerts with severity tiers
- Fraud pattern detection for suspicious vendor activity
- Anomaly scoring currently returns a fixed risk value (Isolation Forest disabled)
- Timeline view of document changes
- Recurring document detection with notifications
- Document duplication prevention using content hashes
- Document similarity detection to flag lookalike documents
- Recurring billing templates with automated sending and payment retries
- Linked document relationship graph to spot duplicates and vendor patterns
- Smart auto-fill suggestions for vendor tags and payment terms
- AI-powered autocomplete and cleanup for vendor and total fields
- Analytics and reports page with filtering and PDF export
- Trend reports for monthly spend and aging documents
- Customizable dashboards with date filters and export options
- Adaptive dashboard with context-aware alerts, AI suggestions and draggable KPI cards
- Custom KPI dashboards per department or vendor with charts like approval time by vendor, late payments trend and documents over budget
- Public shareable dashboards accessible via secure link
- ML predictions highlight cash-flow problem areas
- Private notes on documents
- Shared comment threads for team discussion
- Approver reminders with escalation
- Approval workflows track documents needing review and record status (Pending, Flagged, Approved)
- Smart reminders for overdue documents and pending approvals (email, Slack/Teams & in-app)
- Manual approval reminder emails can be triggered via `POST /api/reminders/approval`
- Batch actions with bulk approval and PDF export
- Bulk edit/delete/archive options for faster table management
- Multi-step upload wizard guides file selection, review, tagging and final confirmation
- Drag-and-drop upload with real-time field mapping
- AI explanations for why a document was flagged
- Admin settings panel with auto-archive toggle, custom AI tone and upload limits
- Org-wide settings per tenant with custom branding
- SOC2-ready audit logs for every action
- Usage analytics dashboard for document volume and workflow metrics
- Role delegation so approvers can temporarily assign their duties
- Document expiration auto-closes past-due documents or flags them for review
- "Why did AI say this?" links show confidence and reasoning
- AI-powered bulk categorization of uploaded documents
- AI-powered auto tagging with vendor/voucher recommendations
- Predictive vendor behavior suggestions
- Anomaly warnings before upload
- Conversational uploading via natural language commands
- Natural language document search
- Hoverable vendor bios with website and industry info
- AI fraud detection heatmaps (color-coded anomaly maps)
- Risk heatmap with clustering graphs highlighting similar documents or vendors
- Fraud detection reports listing flagged documents with reasons
- Automatic vendor bios + risk scores from public data
- Real-time document chat thread with collaborators
- Multi-language support (Spanish and French)
- Browser extension for uploading documents directly from Gmail
- Fully responsive mobile layout and installable PWA
- Capture invoice photos on mobile with built-in OCR
- PDF Invoice OCR with AI formatting correction
- Self-learning OCR corrections that retrain parsing from user edits
- Autonomous agents continuously retrain OCR models from field corrections and provide smart suggestions
- Intelligent column mapping suggestions (line items, totals, tax)
- Supplier portal for vendors to upload documents, update banking info and check payments
- Slack/Teams notifications for approvals or flags
- Smart keyboard shortcuts (press **A** to archive, **F** to flag, **/** to focus search)
- Real-time "Ops Mode" dashboard with a live feed of invoice activity
- Live Invoice Feed shows uploads, flags and approvals in real time
- Multi-tenant support so agencies can switch between different client accounts
- Polite vendor notification emails for flagged or rejected documents
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
- Low-code automation builder (`/api/automations`) for if‑then API workflows
- Blockchain-backed invoice validation with PDF hashing for tamper-proof records
### Recent Backend Updates
- Unified `documents` table with flexible JSON fields (`party_name` and `fields`).
- `/api/documents/:id/extract` for AI entity extraction.
- `/api/documents/:id/versions` and `/api/documents/:id/versions/:versionId/restore` for document comparison.
- `/api/documents/:id/summary` for AI summarization.
- `/api/document-workflows` for doc-type specific workflows.
- `/api/ai/categorize` suggests document categories.
- `/api/documents/:id/compliance` checks contracts for missing clauses.
- Lifecycle rules support `retention_policy`, `expires_at` and `archived`.
- **Enterprise Add-On**: `/api/signing/:id/start` returns a placeholder link for e-signing.
- Enterprise features include org-wide settings, SOC2 audit logs, usage analytics and role delegation.

## Setup Instructions

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Add your DATABASE_URL and OpenRouter API key
# Set either OPENROUTER_API_KEY or OPENAI_API_KEY in .env
# Optional: adjust DUE_REMINDER_DAYS and APPROVAL_REMINDER_DAYS in .env to tweak reminder timing
# Set DATA_ENCRYPTION_KEY to enable at-rest encryption of sensitive fields
npm start
```

### Multi-Tenant Usage

Set an `X-Tenant-Id` header on every API request. Invoices are filtered by this
tenant ID and new uploads will be associated with it. The default tenant is
`"default"` if no header is provided.
Admin users can aggregate data across all tenants by sending `X-Tenant-Id: all`.

### Future Roadmap

- Email-to-upload via Gmail API (requires OAuth and service accounts)
- SMS alerts powered by Twilio

### Database Update

Add an `assignee` column for storing invoice assignments:

```sql
ALTER TABLE documents ADD COLUMN assignee TEXT;
ALTER TABLE documents ADD COLUMN approval_status TEXT DEFAULT 'Pending';
ALTER TABLE documents ADD COLUMN approval_history JSONB DEFAULT '[]';
ALTER TABLE documents ADD COLUMN comments JSONB DEFAULT '[]';
ALTER TABLE documents ADD COLUMN priority BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN flag_reason TEXT;
ALTER TABLE documents ADD COLUMN approval_chain JSONB DEFAULT '["Manager","Finance","CFO"]';
ALTER TABLE documents ADD COLUMN current_step INTEGER DEFAULT 0;
ALTER TABLE documents ADD COLUMN payment_terms TEXT;
ALTER TABLE documents ADD COLUMN private_notes TEXT;
ALTER TABLE documents ADD COLUMN due_date DATE;
ALTER TABLE documents ADD COLUMN po_id INTEGER;
ALTER TABLE documents ADD COLUMN integrity_hash TEXT;
ALTER TABLE documents ADD COLUMN content_hash TEXT;
ALTER TABLE documents ADD COLUMN retention_policy TEXT DEFAULT 'forever';
ALTER TABLE documents ADD COLUMN delete_at TIMESTAMP;
ALTER TABLE documents ADD COLUMN tenant_id TEXT DEFAULT 'default';
ALTER TABLE documents ADD COLUMN department TEXT;
ALTER TABLE documents ADD COLUMN expires_at TIMESTAMP;
ALTER TABLE documents ADD COLUMN expired BOOLEAN DEFAULT FALSE;
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

The previous auto-archive job for invoices has been disabled. Documents may still specify an `expires_at` or `delete_at` timestamp for manual lifecycle cleanup.

Invoices also store a SHA256 `integrity_hash` generated at upload time. You can
set a retention policy (`6m`, `2y`, or `forever`) on upload or later. A daily
job deletes documents once their `delete_at` date passes.
Invoices can also include an `expires_at` date. Any invoice past this
deadline is automatically marked `expired` and flagged for admin review.

### Department Workflows

Specify a `department` when uploading documents and the backend will
apply custom approval rules:

- **Finance** – requires two separate approvals.
- **Legal** – auto-approves and is meant for comments only.
- **Ops** – documents under $100 auto-approve, others need one manager step.

### Purchase Order Matching

Upload purchase orders separately and the backend will automatically match new documents
by vendor and amount. Invoices without a matching PO are flagged for manual review
and trigger Slack/Teams alerts. Approved documents must follow the defined multi-level
workflow based on the `approval_chain`.

### Categorization Rules

Define your own invoice categorization logic. Add rules via `POST /api/analytics/rules` with fields like `vendor`, `descriptionContains`, `amountGreaterThan`, and a resulting `category` or `flagReason`. All rules are returned from `GET /api/analytics/rules`.

Once rules are created you can automatically tag an invoice with
`POST /api/documents/:id/auto-categorize`. The AI model suggests categories such
as "Marketing", "Legal", or "Recurring" when no rule matches.

### New Endpoints

- `POST /api/documents/budgets` – create/update a monthly or quarterly budget by vendor or tag
- `GET /api/documents/budgets/warnings` – check if spending has exceeded 90% of a budget
- `GET /api/documents/budgets/forecast` – predict next month's spend by department
- `GET /api/documents/anomalies` – list vendors with unusual spending spikes
- `GET /api/workflows` – list saved workflows
- `POST /api/workflows` – create or update a workflow
- `POST /api/workflows/evaluate` – test workflow rules against a payload
- `GET /api/analytics/report/excel` – download invoice reports in Excel format
- `GET /api/analytics/outliers` – list documents with unusual amounts
- `GET /api/analytics/dashboard/realtime` – real-time processing metrics

### Workflow Builder

The `/workflow-builder` page lets admins design approval chains and rules with an
interactive expression builder. Test expressions are sent to `POST /api/workflows/evaluate`
to see how rules would route a sample invoice.
The `/inbox` page shows newly uploaded documents waiting for approval.
- `GET /api/documents/fraud/flagged` – list flagged documents with reasons
- `GET /api/documents/fraud/ml-detect` – list documents with high anomaly scores
- `POST /api/documents/fraud/:id/label` – mark invoice as confirmed fraud or not
- `GET /api/documents/:id/timeline` – view a timeline of state changes for an invoice
- `GET /api/:tenantId/export-templates` – list saved CSV templates
- `POST /api/:tenantId/export-templates` – create a new export template
- `GET /api/:tenantId/export-templates/:id/export` – export documents using a template
- `PATCH /api/documents/:id/retention` – update an invoice retention policy (6m, 2y, forever)
- `POST /api/documents/payment-risk` – predict payment delay risk for a vendor
- `POST /api/documents/payment-behavior` – predict expected payment date and confidence
- `POST /api/documents/nl-chart` – run a natural language query and return data for charts
- `POST /api/documents/cash-flow/scenario` – recalculate cash flow under payment delay scenarios
- `GET /api/scenarios` – list saved cash flow scenarios
- `POST /api/scenarios` – save a cash flow scenario
- `GET /api/scenarios/:id` – run a saved scenario
- `POST /api/documents/:id/vendor-reply` – generate or send a polite vendor email when an invoice is flagged or rejected
- `GET /api/documents/:id/payment-request` – download a JSON payload for a payment request form
- `GET /api/documents/:id/payment-request/pdf` – download a PDF payment request
- `GET /api/documents/:id/explain` – AI summary of an invoice with anomaly score
- `POST /api/feedback` – submit a rating for an AI-generated result
- `GET /api/feedback` – view average ratings by endpoint
- `GET /api/documents/vendor-scorecards` – view vendor responsiveness and payment metrics
- `GET /api/documents/graph` – network graph data linking vendors and duplicate documents
- `GET /api/vendors` – list vendors with last invoice date and total spend
- `PATCH /api/vendors/:vendor/notes` – update notes for a vendor
- `GET /api/vendors/match?q=name` – fuzzy match vendor names
- `GET /api/documents/amount-suggestions?q=100` – suggest close historical amounts
- `POST /api/documents/:id/copilot` – context-aware chat about an invoice
- `GET /api/vendors/export` – download vendors as CSV
- `POST /api/vendors/import` – import vendors from CSV
- `PATCH /api/documents/:id/payment-status` – update payment status
- `POST /api/documents/import-csv` – upload a CSV of documents
- Header names are case and space insensitive (e.g. "Invoice Number" works).
- `DELETE /api/documents/bulk/delete` – delete multiple documents
- `PATCH /api/documents/bulk/edit` – bulk update invoice fields
- `POST /api/documents/:id/extract` – extract key entities from a document
- `POST /api/documents/:id/auto-tag` – AI auto-tag from common categories
- `POST /api/documents/suggest-voucher` – recommend a voucher description
- `POST /api/documents/share` – generate a share link for selected documents
- `GET /api/documents/shared/:token` – access a shared invoice view
- `POST /api/documents/dashboard/share` – generate a public dashboard link
- `GET /api/documents/dashboard/shared/:token` – view a restricted dashboard
- `GET /api/documents/:id/versions` – list prior versions of an invoice
- `POST /api/documents/:id/versions/:versionId/restore` – restore a previous version
- `GET /api/documents/:id/summary` – AI generated summary of any document
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
POST /api/documents/42/vendor-reply
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
POST /api/documents/42/vendor-reply
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
POST /api/documents/summarize-errors
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
GET /api/documents/42/payment-request
```

Example response:

```json
{ "vendor": "Acme", "amount": 199.99, "due_date": "2025-06-01" }
```

### Recurring & Automated Billing

Create recurring templates that automatically generate new documents on a schedule. Failed payments are retried up to three times and a 2% late fee is applied after the final attempt. The AI layer predicts payment likelihood and sends Slack/Teams alerts for invoices with a low chance of payment.

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

Offline sync is currently disabled in the MVP. The service worker is unregistered by default. If you want to experiment with offline capabilities, re-enable the service worker in `frontend/src/index.js` and rebuild the frontend.

### Demo Chart Data

If your database is empty, the dashboard charts now display sample data automatically. To generate more realistic demo data in the backend, log in as an admin and click **Seed Dummy Data** on the Vendors page or call:

```bash
POST /api/documents/seed-dummy
```

This inserts a few demo documents so charts like *Top Vendors* and *Approval Timeline* look populated during testing. If you prefer to seed from the command line instead of hitting the API, run:

```bash
cd backend
npm run seed-dummy
```

### Database Migration

If you're upgrading from an earlier version that only had an `documents` table,
run the migration script to rename it and add the new document fields:

```bash
cd backend
node migrations/migrateInvoicesToDocuments.js
```

This backs up the old table, renames it to `documents` and adds `type`, `title`,
`entity`, `fileType` and `contentHash` columns. Existing API calls under
`/api/documents` continue to work via the `/api/documents` routes.

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

This happens when the backend tries to reach PostgreSQL on the IPv6 loopback address. Ensure your `.env` or deployment settings point to the `db` service by setting `DB_HOST=db` and `DB_PORT=5432` (or set `DATABASE_URL=postgres://postgres:postgres@db:5432/documents_db`).

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

**`Database init error: extension "vector" is not available`**

The Postgres container must include the pgvector extension. Use the `pgvector/pgvector:pg15` image in `docker-compose.yml` and rebuild:

```bash
docker-compose down
docker-compose up --build
```

