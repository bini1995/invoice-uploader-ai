# ClarifyOps Transformation Plan

This document outlines a high level path to move the existing invoice uploader toward a more general AI Ops platform. Key steps include abstracting invoice-only logic and expanding the data model so other document types can be supported.

## 1. Generalize data model

- Added a new `party_name` column to `invoices` allowing any entity name (vendor, client, etc.).
- Introduced a `fields` JSONB column on the `documents` table for flexible per document fields.
- `invoice_number` remains but should be referenced only when `doc_type = 'invoice'`.

## 2. Update backend services

- `insertInvoice` now accepts a `party_name` field and stores it alongside the existing vendor value.
- `uploadDocument` and `extractDocument` persist extracted fields to the new table column.
- Invoice upload logic now normalizes `party_name` so validation and automation use a generic field.

## 3. Future steps

- Migrate front‑end components to prefer `party_name` when displaying records.
- Replace remaining hard coded invoice checks with conditionals based on `doc_type`.
- Expand validation and automation rules to reference `fields` for non‑invoice documents.

## 4. New AI Ops features

- **AI Entity Extraction** – Added `POST /api/documents/:id/extract` which uses OpenRouter to pull dates, terms, parties and clauses from any uploaded document.
- **Document Comparison** – Every document edit now records a version in the new `document_versions` table. `GET /api/documents/:id/versions` returns diffs and `POST /api/documents/:id/versions/:versionId/restore` restores old snapshots.
- **Document Summarization** – New `GET /api/documents/:id/summary` endpoint summarizes any document, generalizing the previous invoice-specific summary.

## 5. Roadmap to Full AI Ops Platform

- **Auto-categorization** – `/api/ai/categorize` suggests top categories like HR, Legal or Expense for uploaded text.
- **Document Workflows** – `/api/document-workflows` replaces the old workflows route and stores `doc_type` and optional `conditions` for each department.
- **Versioned Uploads** – `POST /api/documents/:id/version` lets users upload new versions while `/api/documents/:id/versions` provides a timeline of edits.

## 6. Compliance & Lifecycle Enhancements

- **Compliance Checker** – `/api/documents/:id/compliance` flags missing clauses for contracts.
- **Document Lifecycle Rules** – `retention_policy`, `expires_at` and `archived` now apply to all documents.
- **Secure Signing** – New `/api/signing/:id/start` endpoint stores a blockchain hash and redirects to DocuSign.
