# AI Claims Data Extractor

This is a full-stack **AI Claims Data Extractor** delivering operational clarity for insurance claim files through automated intelligence workflows, built using:

- **React + Tailwind CSS** (frontend)
- **Express + PostgreSQL** (backend)
- **OpenRouter API** for natural language error feedback

The backend no longer relies on Redis queues or background workers. All document
processing happens directly through the Express API for a simpler deployment.

The API has been consolidated to a single `/api/claims` namespace (with `/api/invoices` kept as an alias) and the old invoice controller has been removed. Experimental features like feedback collection and the automation builder now live under `/api/labs/*`.

Originally this project focused solely on invoice processing. It is now evolving into a general **Document AI Platform** that handles invoices, contracts and more. See [docs/TRANSFORMATION_PLAN.md](docs/TRANSFORMATION_PLAN.md) for the roadmap. A quick feature comparison against other tools is available in [docs/MARKET_POSITIONING.md](docs/MARKET_POSITIONING.md).

Looking for past invoice features? See [legacy_invoice_features.md](docs/legacy_invoice_features.md).

## Current Scope
ClarifyOps now exclusively supports medical and insurance claim workflows:
- AI-powered claim intake and summarization
- CPT/ICD code validation
- Workflow triage (OpsClaim)
- Auditing & fraud detection (AuditFlow) [See more](docs/AuditFlow.md)

## Architecture
The stack focuses on claim processing and routing:
- React + Tailwind CSS frontend
- Express + PostgreSQL backend
- Claims ingestion APIs under `/api/claims`
- AI validation and summarization via OpenRouter
- Workflow routing through OpsClaim queues
- Fraud and audit detection powered by AuditFlow

## Claims Sub-Brand Structure

- ClarifyClaims: Main claims experience (upload, validate, summarize)
- OpsClaim: Action queue and workflow routing
- AuditFlow: Risk and audit review for flagged claims [See more](docs/AuditFlow.md)

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

## Assets

- All large media assets (videos, images) are hosted externally on a CDN and excluded from version control.
- For local development, ensure the CDN is accessible or place lightweight placeholder files in `frontend/public`.

## Features

ClarifyOps is a modular AI-powered claims platform focused on extraction, validation, and fraud detection for healthcare and insurance use cases.

### 🔍 Extraction
- Smart document router with claim-specific types (`claim_invoice`, `medical_bill`, `fnol_form`).
- Healthcare claim extraction for CPT codes, ICD‑10 and policy IDs.
- Schema-free data extractor with confidence scores and OCR that learns from user edits.
- Supports CSV, PDF and Excel uploads with intelligent column mapping and auto-fill suggestions.
- Conversational uploading and natural language document search.

### ✅ Validation
- Claim validation rules for deductible thresholds and benefit maximums.
- Real-time field validation with instant feedback and AI-generated CSV issue summaries.
- Compliance checker and report generator for missing contract clauses.
- Anomaly warnings before upload and document duplication prevention using content hashes.
- AuditFlow: fraud risk scores and manual override. [See more](docs/AuditFlow.md)

### 📝 Review
- AI-generated document summaries, explanations and quality scores.
- Document version history, detailed audit logs and timeline views of changes.
- Analytics dashboards with trends, custom KPIs and exportable reports.
- Linked document graphs and similarity detection to spot duplicates and patterns.

### 🤝 Collaboration
- Real-time ops timeline and context-aware OpsClaim Copilot chat.
- Shared comment threads, private notes and document chat for reviewers.
- Role-based access control with invite links, activity logs and audit history.
- Approval workflows with reminders, bulk actions and Slack/Teams notifications.

### ⚙️ System Features
- Conversational agent with pgvector embeddings and YAML-based plugin rules.
- Document lifecycle rules, auto-routing and smart auto-assignment.
- Multi-tenant support, browser extension uploads and responsive PWA.
- Automation builder and integrations for ERPs, Slack, Google Sheets and more.
- **Enterprise Add-On**: secure DocuSign signing with optional blockchain hash and org-wide settings.

### Claims API
- `POST /api/claims` – upload and start processing a claim.
- `POST /api/claims/:id/extract` – AI entity extraction.
- `POST /api/claims/:id/validate` – CPT code validator.
- `POST /api/claims/:id/analyze` – anomaly classifier.
- `GET /api/claims/:id/summary` – AI summarization.
- `GET /api/claims/:id/versions` and `.../restore` – document comparison.
- `GET /api/claims/anomalies` – detect unusual spending.
- `GET /api/analytics/dashboard/realtime` – AuditFlow dashboard metrics.
- `POST /api/claims/seed-dummy` – seed demo claims for charts.

(Recently added: CPT validator endpoint, anomaly classifier, AuditFlow dashboard support)

### API Docs & Health

Swagger documentation is available at [`/api/docs`](http://localhost:3000/api/docs) when the backend is running. A lightweight `/api/health` endpoint returns a simple `{ "status": "ok" }` payload for uptime monitoring tools.

### Webhook Integration

Set `CLAIM_STATUS_WEBHOOK_URL` in `.env` to receive a POST request whenever a claim's status is updated. Optional JSON strings `CLAIM_WEBHOOK_HEADERS` and `CLAIM_WEBHOOK_TEMPLATE` allow custom headers and extra payload fields.

Sample webhook payload:

```json
{
  "claim_id": "12345",
  "previous_status": "pending",
  "new_status": "reviewed",
  "updated_at": "2025-07-25T14:20:00Z"
}
```

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

When `REACT_APP_DEMO_MODE=true` is set for the frontend build, a small dropdown allows switching between sample tenants without manually editing headers.

## Roadmap

🧠 **CPT Explainability**
- Show patients and reviewers a simple reason why a procedure was coded
- e.g., "Code 99213: Standard outpatient visit lasting 15–20 mins"

📤 **EDI / HL7 837 Ingestion**
- Upload and parse industry-standard formats
- Support for claim submission and remittance files

📊 **Insurer Dashboards**
- High-level view of claims in review, flagged anomalies, payout timelines

📈 **Anomaly Classifier Fine-Tuning**
- Integrate real-world feedback to improve fraud predictions

🔄 **Claims Automation**
- End-to-end claim review and payout readiness with minimal human intervention

### Database Update

Add an `assignee` column for storing invoice assignments:

```sql
ALTER TABLE documents ADD COLUMN assignee TEXT;
ALTER TABLE documents ADD COLUMN assignment_reason TEXT;
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

CREATE TABLE category_feedback (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  suggested_category TEXT,
  confidence NUMERIC,
  accepted BOOLEAN,
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

### Claim Workflows

ClarifyOps supports claim handling roles directly:

| Role | View |
|------|------|
| **Adjuster** | See new claim intake, route for review |
| **Medical Reviewer** | Validate CPT/ICD accuracy and justification |
| **Audit Officer** | Review fraud flags and perform override or hold |
| **Finance/Payout** | Confirm approved claims and trigger payment batch |

### Categorization Logic

AI uses claim metadata and context to classify each case:

- **CPT Code Clustering**: Similar procedures grouped for risk analysis
- **ICD/Diagnosis Mapping**: Flags uncommon code combinations
- **Overbilling Detection**: Flags services with low justification confidence
- **Missing Information Detection**: Patient ID, provider NPI, or prior auth
- **Anomaly Classification**: Duplicate claims, policy mismatch, upcoding

See [`backend/utils/rulesEngine.js`](backend/utils/rulesEngine.js) for implementation details. Example rule in YAML:

```yaml
rules:
  - if: cpt_code == "99215" and avg_duration < 10min
    then:
      flag: "overbilling"
```

### Workflow Builder

The `/workflow-builder` page lets admins design approval chains and rules with an
interactive expression builder. Test expressions are sent to `POST /api/workflows/evaluate`
to see how rules would route a sample invoice.
The `/inbox` page shows newly uploaded documents waiting for approval.
- `GET /api/claims/:id/timeline` – view a timeline of state changes for an invoice
- `GET /api/:tenantId/export-templates` – list saved CSV templates
- `POST /api/:tenantId/export-templates` – create a new export template
- `GET /api/:tenantId/export-templates/:id/export` – export documents using a template
- `PATCH /api/claims/:id/retention` – update an invoice retention policy (6m, 2y, forever)
- `POST /api/claims/nl-chart` – run a natural language query and return data for charts
- `GET /api/claims/:id/explain` – AI summary of an invoice with anomaly score
- `POST /api/feedback` – submit a rating for an AI-generated result
- `GET /api/feedback` – view average ratings by endpoint
- `GET /api/claims/vendor-scorecards` – view vendor responsiveness and payment metrics
- `GET /api/claims/graph` – network graph data linking vendors and duplicate documents
- `GET /api/vendors` – list vendors with last invoice date and total spend
- `PATCH /api/vendors/:vendor/notes` – update notes for a vendor
- `GET /api/vendors/match?q=name` – fuzzy match vendor names
- `GET /api/claims/amount-suggestions?q=100` – suggest close historical amounts
- `POST /api/claims/:id/copilot` – context-aware chat about an invoice
- `GET /api/vendors/export` – download vendors as CSV
- `POST /api/vendors/import` – import vendors from CSV
- `POST /api/claims/import-csv` – upload a CSV of documents
- Header names are case and space insensitive (e.g. "Invoice Number" works).
- `DELETE /api/claims/bulk/delete` – delete multiple documents
- `PATCH /api/claims/bulk/edit` – bulk update invoice fields
- `POST /api/claims/:id/extract` – extract key entities from a document
- `POST /api/claims/:id/extract-fields` – AI claim field extraction (stores version and timestamp)
- `POST /api/claims/:id/auto-tag` – AI auto-tag from common categories
- `POST /api/claims/suggest-voucher` – recommend a voucher description
- `POST /api/claims/share` – generate a share link for selected documents
- `GET /api/claims/shared/:token` – access a shared invoice view
- `POST /api/claims/dashboard/share` – generate a public dashboard link
- `GET /api/claims/dashboard/shared/:token` – view a restricted dashboard
- `GET /api/claims/:id/versions` – list prior versions of an invoice
- `POST /api/claims/:id/versions/:versionId/restore` – restore a previous version
- `GET /api/claims/:id/summary` – AI generated summary of any document
- `GET /api/automations` – list automation rules
- `POST /api/automations` – create an automation
- `PUT /api/automations/:id` – update an automation
- `DELETE /api/automations/:id` – delete an automation
- `POST /api/agents/suggest` – return smart suggestions for an invoice
- `POST /api/agents/retrain` – trigger OCR retraining from corrections

### AI Error Summary

Have the AI translate CSV upload errors into plain English:

```bash
POST /api/claims/summarize-errors
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
POST /api/claims/seed-dummy
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
`/api/claims` continue to work via the `/api/claims` routes.

Make sure you log in again to obtain a fresh token if you see a `401` response when calling the endpoint.

### Docker Deployment

Run the entire stack in Docker containers:

```bash
cp .env.example .env
docker-compose up --build
```

The frontend is served on `http://localhost:3001` while the API runs on `http://localhost:3000`.
The build reads `VITE_API_BASE_URL` or `REACT_APP_API_BASE_URL` from `.env` to
know where requests should be sent. In development this defaults to
`http://localhost:4000/api`. For a production deployment, set one of these values to
your public API origin (e.g. `https://clarifyops.com/api`) and rebuild the
frontend container.

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

The initialization script also creates an `ivfflat` index on the `embedding` column of the `documents` table so vector similarity queries run quickly.

