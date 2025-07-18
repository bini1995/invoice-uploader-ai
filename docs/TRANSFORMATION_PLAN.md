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
