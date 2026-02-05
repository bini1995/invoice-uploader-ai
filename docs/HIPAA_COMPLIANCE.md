# ClarifyOps HIPAA Compliance & PHI Data Flow

**Last Updated:** February 2026
**Classification:** Internal — Confidential
**Document Owner:** ClarifyOps Security & Compliance
**Review Cadence:** Quarterly

---

## 1. Business Associate (BA) Determination

### Status: YES — ClarifyOps is a Business Associate

ClarifyOps processes claims data on behalf of covered entities (health insurers, healthcare providers, third-party administrators). Under 45 CFR § 160.103, any entity that creates, receives, maintains, or transmits ePHI on behalf of a covered entity qualifies as a Business Associate.

### BA Obligations

| Obligation | ClarifyOps Status |
|---|---|
| Execute BAA with each covered entity customer | Required before onboarding |
| Implement administrative, physical, and technical safeguards | Implemented (see Section 4) |
| Report breaches to covered entity within 60 days | Incident Response Plan in place |
| Ensure subcontractors sign BAAs | OpenRouter BAA required |
| Maintain documentation for 6 years | Audit logs retained per policy |
| Appoint a Privacy Officer | Designated internally |
| Conduct annual risk assessments | Scheduled annually |

### Subcontractor / Sub-BA Relationships

| Subcontractor | Role | BAA Required | PHI Access |
|---|---|---|---|
| OpenRouter (AI gateway) | AI text extraction & classification | Yes | Transient — text sent for processing, not stored |
| Neon (PostgreSQL hosting) | Database storage | Yes | Stores encrypted ePHI |
| DigitalOcean | Server infrastructure | Yes | ePHI on disk (encrypted) |
| Let's Encrypt | TLS certificates | No | No PHI access |

---

## 2. ePHI Data Flow Diagram

### 2.1 Data Entry Points

```
┌─────────────────────────────────────────────────────────────────┐
│                     ePHI ENTRY POINTS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [1] Document Upload (PDF/CSV/Excel/Images)                     │
│      POST /api/claims/upload                                    │
│      → Multer file handling → disk storage                      │
│      → pdf-parse / mammoth / tesseract.js OCR                   │
│      → Raw text extracted                                       │
│                                                                 │
│  [2] Audio FNOL Transcription                                   │
│      POST /api/claims/fnol/transcribe                           │
│      → Audio file → transcription → text                        │
│                                                                 │
│  [3] EHR/FHIR Webhooks                                          │
│      POST /api/integrations/ehr/:provider/webhook               │
│      POST /api/integrations/ehr/:provider/fhir/webhook          │
│      → Inbound clinical data from Epic, Cerner, etc.            │
│                                                                 │
│  [4] External Claim Status Webhooks                             │
│      POST /api/v1/webhooks/claim-update                         │
│      POST /api/claims/status-webhook                            │
│      → Status updates (may contain claim metadata)              │
│                                                                 │
│  [5] ERP/Insurance System Webhooks                              │
│      POST /api/integrations/erp/webhook                         │
│      POST /api/integrations/zapier/guidewire                    │
│      POST /api/integrations/zapier/duckcreek                    │
│      → Policy & claim data from Guidewire, Duck Creek           │
│                                                                 │
│  [6] Manual Data Entry via UI                                   │
│      Claim forms, patient info, CPT/ICD codes                   │
│      → React frontend → API → database                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Processing Flow

```
┌──────────────┐    ┌───────────────┐    ┌──────────────────┐
│  File Upload │───▶│ Text Extract  │───▶│ PHI Detection    │
│  (Multer)    │    │ (pdf-parse,   │    │ (compliance.js)  │
│              │    │  mammoth,     │    │  - SSN patterns  │
│              │    │  tesseract)   │    │  - DOB patterns  │
│              │    │               │    │  - MRN/Member ID │
│              │    │               │    │  - Phone/Email   │
│              │    │               │    │  - Policy IDs    │
└──────────────┘    └───────────────┘    └────────┬─────────┘
                                                  │
                         ┌────────────────────────┤
                         ▼                        ▼
              ┌───────────────────┐    ┌──────────────────┐
              │ PHI DETECTED      │    │ NO PHI DETECTED  │
              │                   │    │                  │
              │ 1. Encrypt PHI    │    │ Store raw text   │
              │    (AES-256)      │    │ as-is            │
              │ 2. Anonymize text │    │                  │
              │    ([REDACTED])   │    │                  │
              │ 3. Store encrypted│    │                  │
              │    payload in     │    │                  │
              │    phi_encrypted_ │    │                  │
              │    payload column │    │                  │
              └────────┬──────────┘    └────────┬─────────┘
                       │                        │
                       ▼                        ▼
              ┌──────────────────────────────────────────┐
              │           PostgreSQL Database             │
              │                                          │
              │  documents table:                        │
              │  - raw_text (anonymized if PHI found)    │
              │  - phi_encrypted_payload (AES-256)       │
              │  - phi_fields (list of detected fields)  │
              │  - metadata (anonymized)                 │
              │  - embedding (vector, no PHI)            │
              │                                          │
              │  activity_logs table:                    │
              │  - All access/modifications logged       │
              │  - User, timestamp, action, tenant_id    │
              └──────────────────────────────────────────┘
```

### 2.3 AI Processing Flow (OpenRouter)

```
┌──────────────────┐         ┌──────────────────────┐
│ Claim Text       │────────▶│ OpenRouter API        │
│ (may contain PHI)│  HTTPS  │ (openai/gpt-4o-mini) │
│                  │         │ (openai/gpt-3.5-turbo)│
│ Sent for:        │         │                       │
│ - Classification │         │ Processing:           │
│ - Field extract  │◀────────│ - Extract CPT/ICD     │
│ - Entity extract │  JSON   │ - Classify doc type   │
│ - Summarization  │         │ - Extract entities    │
│ - Risk scoring   │         │ - Summarize content   │
└──────────────────┘         └──────────────────────┘

RISK: Full claim text (including PHI) is sent to OpenRouter for
extraction. OpenRouter's data handling policy and BAA coverage
must be verified.

MITIGATION PLAN:
1. Pre-anonymize text before sending to AI where possible
2. Require BAA from OpenRouter / underlying model providers
3. Verify OpenRouter does not retain request data
4. Log all AI API calls for audit trail
```

### 2.4 Data Exit Points

```
┌─────────────────────────────────────────────────────────────────┐
│                     ePHI EXIT POINTS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [1] Dashboard / UI Display                                     │
│      → PII masking middleware (piiMask.js) for non-admin roles  │
│      → Role-based access control limits visibility              │
│                                                                 │
│  [2] Report Exports (PDF/Excel/CSV)                             │
│      GET /api/analytics/export-pdf                              │
│      GET /api/analytics/export-excel                            │
│      GET /api/export-templates/:id/export                       │
│      → Currently exports raw data — PII masking needed          │
│                                                                 │
│  [3] API Responses                                              │
│      GET /api/v1/claims                                         │
│      GET /api/v1/claims/:id                                     │
│      → API key authenticated, returns claim data                │
│                                                                 │
│  [4] Webhook Notifications (Outbound)                           │
│      → Status change events to external systems                 │
│      → May include claim metadata                               │
│                                                                 │
│  [5] AI Processing (OpenRouter)                                 │
│      → Claim text sent externally for AI extraction             │
│      → Transient processing, not stored by provider (verify)    │
│                                                                 │
│  [6] Email Notifications                                        │
│      → Nodemailer for reminders/summaries                       │
│      → Should never contain raw PHI                             │
│                                                                 │
│  [7] Slack/Teams Webhooks                                       │
│      → Notification messages — must not contain PHI             │
│                                                                 │
│  [8] Browser Console / Error Logs                               │
│      → Sentry error tracking — must scrub PHI from payloads     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. PHI Inventory

### 3.1 Types of ePHI Handled

| PHI Element | Where Detected | Storage | Masking |
|---|---|---|---|
| Patient Name | Document text | Anonymized in raw_text | [REDACTED] |
| Date of Birth | Document text, metadata | Anonymized | [REDACTED] |
| Social Security Number | Document text | Anonymized | [REDACTED] |
| Medical Record Number | Document text | Anonymized | [REDACTED] |
| Member/Subscriber ID | Document text | Anonymized | [REDACTED] |
| Policy Number | Document text | Anonymized | [REDACTED] |
| Claim Number | Document text | Anonymized | [REDACTED] |
| Phone Number | Document text | Anonymized | [REDACTED] |
| Email Address | Document text, user accounts | Anonymized in text | [REDACTED] |
| Address | Document text | Anonymized | [REDACTED] |
| CPT/ICD Codes | Extracted fields | Stored in metadata | Visible to authorized roles |
| Diagnosis Information | Document text | Anonymized in raw_text | [REDACTED] in text |
| Payment Amounts | Extracted fields | Stored in metadata | Visible to authorized roles |
| Provider NPI | Document text | Stored in metadata | Visible to authorized roles |

### 3.2 Database Tables Containing ePHI

| Table | PHI Columns | Encryption | Access Control |
|---|---|---|---|
| `documents` | `raw_text`, `phi_encrypted_payload`, `metadata` | AES-256 for phi_encrypted_payload | Tenant isolation + RBAC |
| `invoices` | `raw_text`, `phi_encrypted_payload`, `metadata` | AES-256 for phi_encrypted_payload | Tenant isolation + RBAC |
| `users` | `email`, `name`, `password_hash` | Password bcrypt-hashed | User self-access + admin |
| `activity_logs` | `details` (may reference document content) | None — must not log PHI | Tenant isolation |
| `webhook_events` | `payload` (external status updates) | None | Tenant isolation |
| `documents` (files) | Uploaded PDF/image files on disk | Disk-level encryption | File system permissions |

---

## 4. Security Controls (Administrative, Physical, Technical)

### 4.1 Administrative Safeguards

| Control | Implementation | Status |
|---|---|---|
| Security Management Process | Risk assessment conducted | In Progress |
| Workforce Security | RBAC with 6 roles (admin, viewer, broker, adjuster, medical_reviewer, auditor) | Implemented |
| Information Access Management | Tenant isolation via tenant_id on all queries | Implemented |
| Security Awareness Training | Employee training program | Planned |
| Security Incident Procedures | Incident response plan documented | In Progress |
| Contingency Plan | Database backups via Neon; formal DR plan needed | Partial |
| Business Associate Agreements | Required for all subcontractors | In Progress |

### 4.2 Technical Safeguards

| Control | Implementation | Status |
|---|---|---|
| Access Control | JWT authentication + refresh tokens | Implemented |
| Audit Controls | activity_logs table, all CRUD operations logged | Implemented |
| Integrity Controls | Input validation (Zod/Ajv), sanitize-html | Implemented |
| Transmission Security | TLS/SSL (Let's Encrypt), HTTPS enforced | Implemented |
| Encryption at Rest | AES-256 for PHI payloads (when detected), bcrypt for passwords. Uploaded files on disk not yet encrypted at file level. | Partial |
| Automatic Logoff | JWT token expiration | Implemented |
| Unique User Identification | Username + email, Google SSO | Implemented |
| Emergency Access | Admin role has full access | Implemented |

### 4.3 Physical Safeguards

| Control | Implementation | Status |
|---|---|---|
| Facility Access | DigitalOcean data center security (SOC 2 certified) | Provider-managed |
| Workstation Security | SSH key-only access, no password auth | Implemented |
| Device Controls | Server access restricted to authorized personnel | Implemented |
| Media Disposal | Encrypted volumes, secure deletion procedures | Planned |

---

## 5. Risk Assessment Summary

### 5.1 High-Risk Areas

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| PHI sent to OpenRouter without pre-anonymization | HIGH | HIGH | Implement pre-anonymization before AI calls |
| Export reports may contain un-masked PHI | HIGH | MEDIUM | Apply PII masking to all export functions |
| Activity logs may inadvertently contain PHI | MEDIUM | MEDIUM | Scrub log entries, never log raw document text |
| Sentry error payloads may contain PHI | MEDIUM | LOW | Configure Sentry data scrubbing rules |
| Uploaded files stored unencrypted on disk | MEDIUM | LOW | Implement file-level encryption |
| Webhook payloads may expose PHI | MEDIUM | LOW | Validate and sanitize outbound webhook data |
| Email notifications could leak PHI | LOW | LOW | Template-based emails, no raw data |

### 5.2 Remediation Priority

1. **Immediate (Week 1-2):** Pre-anonymize text before OpenRouter API calls
2. **Short-term (Week 2-4):** Apply PII masking to all export endpoints
3. **Medium-term (Month 2):** Implement file-level encryption for uploaded documents
4. **Medium-term (Month 2):** Configure Sentry PHI scrubbing
5. **Ongoing:** Quarterly risk assessment reviews

---

## 6. Breach Notification Plan

### 6.1 Detection

- Sentry alerts for unauthorized access patterns
- Prometheus metrics for anomalous API usage
- Activity log monitoring for bulk data access
- Failed authentication attempt monitoring

### 6.2 Response Timeline

| Step | Timeline | Action |
|---|---|---|
| Discovery | T+0 | Security team notified, investigation begins |
| Assessment | T+24 hours | Determine scope, affected individuals, PHI involved |
| Containment | T+48 hours | Isolate affected systems, revoke compromised credentials |
| Notification to Covered Entity | T+60 days max | Written notification per BAA terms |
| HHS Notification | T+60 days max | If 500+ individuals affected: immediate to HHS |
| Individual Notification | T+60 days max | Written notice to affected individuals |
| Documentation | Ongoing | Maintain breach log for 6 years |

---

## 7. Data Retention & Disposal

| Data Type | Retention Period | Disposal Method |
|---|---|---|
| Claim documents | Per BAA terms (typically 6-10 years) | Secure deletion + audit log |
| User accounts | Duration of service + 1 year | Anonymization or deletion |
| Activity logs | 6 years minimum | Archived, then purged |
| Uploaded files | Per BAA terms | Secure file deletion |
| AI processing logs | 1 year | Automatic purge |
| Webhook event logs | 1 year | Automatic purge |

---

## 8. GDPR Compliance Addendum

### Data Subject Rights

| Right | Implementation | Status |
|---|---|---|
| Right to Access | Users can view their data via dashboard | Implemented |
| Right to Rectification | Users can update profile information | Implemented |
| Right to Erasure | Data deletion upon request, tenant-scoped | Implemented |
| Right to Portability | CSV/PDF export of all user data | Implemented |
| Right to Restrict Processing | Feature flag to pause processing | Planned |
| Right to Object | Opt-out mechanisms | Planned |

### Tenant Data Isolation

All data operations are scoped by `tenant_id`, enforced at the middleware level. Cross-tenant data access is architecturally prevented through server-side query filtering.

---

## 9. Compliance Checklist

- [ ] Execute BAA with all covered entity customers
- [ ] Obtain BAA from OpenRouter for AI processing
- [ ] Obtain BAA from Neon (PostgreSQL provider)
- [ ] Obtain BAA from DigitalOcean
- [x] Implement PHI detection and anonymization
- [x] Implement AES-256 encryption for PHI payloads
- [x] Implement RBAC with minimum necessary access
- [x] Implement audit logging for all data access
- [x] Implement TLS/SSL for data in transit
- [x] Implement PII masking for API responses
- [ ] Implement pre-anonymization for AI API calls
- [ ] Implement PII masking for export endpoints
- [ ] Implement file-level encryption for uploads
- [ ] Configure Sentry PHI data scrubbing
- [ ] Complete formal risk assessment
- [ ] Establish breach notification procedures
- [ ] Conduct workforce security training
- [ ] Document data retention and disposal procedures
- [ ] Annual compliance review scheduled
