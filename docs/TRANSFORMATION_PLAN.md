# ClarifyOps Transformation Plan

This document outlines a high level path to evolve ClarifyOps into an **AI Document Ops Engine**. The brand now emphasizes **AI Document Intelligence + Automation** to deliver operational clarity for any document. Key steps include removing invoice-specific code and expanding the data model so other document types can be supported.

## 1. Generalize data model

- Added a new `party_name` column allowing any entity name (vendor, client, etc.).
- Introduced a `fields` JSONB column on the `documents` table for flexible per document fields.
- The legacy `invoice_number` column should only be referenced when `doc_type = 'invoice'`.

## 2. Update backend services

- `insertDocument` now accepts a `party_name` field and stores it alongside the existing vendor value.
- `uploadDocument` and `extractDocument` persist extracted fields to the new table column.
- Upload logic now normalizes `party_name` so validation and automation use a generic field.

## 3. Future steps

- Migrate front‑end components to prefer `party_name` when displaying records.
- Replace remaining invoice-specific checks with conditionals based on `doc_type`.
- Expand validation and automation rules to reference `fields` for all document types.

## Feature Priorities

| Feature                              | Priority | Effort | Notes                                   |
|--------------------------------------|---------|-------|-----------------------------------------|
| Unified Document Table               | High    | Medium | Backbone of the entire transition       |
| Rename Routes + Frontend Labels      | High    | Low    | Immediate branding impact               |
| Entity Extraction + Summarization    | High    | Medium | Easy with OpenRouter, high user value   |
| Comparison View                      | Medium  | Medium | UX heavy but great differentiator       |
| Workflow Builder Enhancements        | High    | Medium | Already exists, just generalize         |
| Intelligent Routing (Doc-Type Aware) | High    | High   | Needs rule engine upgrade               |
| Voice-to-Doc, Form-to-Doc            | Medium  | Medium | Add as next-gen interaction layer       |
| Secure Signing + Hashing             | Medium  | Medium | Legal use-case booster                  |

## 4. New AI Ops features

- **AI Entity Extraction** – Added `POST /api/documents/:id/extract` which uses OpenRouter to pull dates, terms, parties and clauses from any uploaded document.
- **Document Comparison** – Every document edit now records a version in the new `document_versions` table. `GET /api/documents/:id/versions` returns diffs and `POST /api/documents/:id/versions/:versionId/restore` restores old snapshots.
- **Document Summarization** – New `GET /api/documents/:id/summary` endpoint summarizes any document.

## 5. Roadmap to Full AI Ops Platform

- **Auto-categorization** – `/api/ai/categorize` suggests top categories like HR, Legal or Expense for uploaded text.
- **Document Workflows** – `/api/document-workflows` replaces the old workflows route and stores `doc_type` and optional `conditions` for each department.
- **Versioned Uploads** – `POST /api/documents/:id/version` lets users upload new versions while `/api/documents/:id/versions` provides a timeline of edits.

## 6. Compliance & Lifecycle Enhancements

- **Compliance Checker** – `/api/documents/:id/compliance` flags missing clauses for contracts.
- **Document Lifecycle Rules** – `retention_policy`, `expires_at` and `archived` now apply to all documents.
- **Secure Signing** – New `/api/signing/:id/start` endpoint stores a blockchain hash and redirects to DocuSign.

## 7. Enterprise Readiness

- **Org-wide Settings** – Centralized configuration scoped to each organization with support for custom branding and tenant preferences.
- **SOC2-ready Audit Logs** – Immutable `audit_logs` table capturing every user action with timestamp, IP and metadata.
- **Usage Analytics** – `/api/analytics/usage` aggregates document volumes and workflow stats per tenant for admins.
- **Role Delegation** – Administrators can delegate temporary roles and approval authority via `/api/roles/delegate`.
