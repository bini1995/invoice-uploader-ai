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
- Role-based access control (Admins, Approvers, Viewers)
- Activity log of invoice actions

## Setup Instructions

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Make sure to add your DATABASE_URL and OPENAI_API_KEY
npm start
```

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

### Auto-Archive Rule

The backend automatically archives invoices older than 90 days
unless they are marked as `priority`.

### Frontend

```bash
cd frontend
npm install
npm start
```
