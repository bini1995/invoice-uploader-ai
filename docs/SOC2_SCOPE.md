# ClarifyOps SOC 2 Type II Scope Document

**Last Updated:** February 2026
**Classification:** Internal — Confidential
**Document Owner:** ClarifyOps Security & Compliance
**Audit Framework:** AICPA SOC 2 (Trust Service Criteria 2017)
**Target Audit Period:** 12 months

---

## 1. System Description

### 1.1 Overview

ClarifyOps is a cloud-based, AI-powered claims data extraction and review platform designed for insurance operations teams. The system automates medical and insurance claim intake, validation, routing, and fraud detection with audit-ready accuracy.

### 1.2 Principal Service Commitments

1. Securely process and store insurance claims data including ePHI
2. Provide AI-powered document extraction with 99.9% target accuracy
3. Maintain multi-tenant data isolation between customer organizations
4. Deliver real-time claims workflow automation and triage
5. Generate audit-ready reports and compliance documentation

### 1.3 System Boundaries

| Component | In Scope | Description |
|---|---|---|
| React Frontend Application | Yes | User-facing web application at clarifyops.com |
| Express.js Backend API | Yes | REST API handling all business logic |
| PostgreSQL Database (Neon) | Yes | Primary data store for all claims and user data |
| DigitalOcean Infrastructure | Yes | Compute infrastructure (Ubuntu 24.04, nginx, PM2) |
| OpenRouter AI Gateway | Yes | Third-party AI service for document extraction |
| Let's Encrypt SSL | Partial | Certificate issuance (provider-managed) |
| GitHub Repository | Yes | Source code management and version control |
| Sentry Monitoring | Yes | Error tracking and performance monitoring |
| User Endpoints (Browsers) | No | End-user devices and browsers |
| Third-party Integrations | Partial | Guidewire, Duck Creek, Zapier (stub endpoints) |

---

## 2. Trust Service Criteria in Scope

### Selected Categories

| Trust Service Category | In Scope | Rationale |
|---|---|---|
| **Security** (Common Criteria) | Yes | Foundation for all other categories; required |
| **Availability** | Yes | SLA commitments to customers for uptime |
| **Processing Integrity** | Yes | Claims data must be processed accurately |
| **Confidentiality** | Yes | PHI and PII must be protected |
| **Privacy** | Yes | Personal information handling per regulations |

---

## 3. Security (Common Criteria)

### CC1: Control Environment

| Control | Implementation | Evidence |
|---|---|---|
| CC1.1 — Integrity and ethical values | Code of conduct, security policies | Policy documents |
| CC1.2 — Board oversight | Security reviews, compliance reporting | Meeting minutes |
| CC1.3 — Management structure | Defined roles: admin, viewer, broker, adjuster, medical_reviewer, auditor | RBAC configuration |
| CC1.4 — Commitment to competence | Technical hiring standards, training | HR records |
| CC1.5 — Accountability | Activity logging, audit trails | `activity_logs` table |

### CC2: Communication and Information

| Control | Implementation | Evidence |
|---|---|---|
| CC2.1 — Internal communication | Security incident procedures, change management | Documentation |
| CC2.2 — External communication | Privacy policy, terms of service, BAAs | Published policies |
| CC2.3 — System description | Architecture documentation, data flow diagrams | docs/HIPAA_COMPLIANCE.md |

### CC3: Risk Assessment

| Control | Implementation | Evidence |
|---|---|---|
| CC3.1 — Risk objectives | Defined security objectives per HIPAA/SOC 2 | This document |
| CC3.2 — Risk identification | Threat modeling, vulnerability assessment | Risk assessment report |
| CC3.3 — Fraud risk | AuditFlow fraud detection, risk scoring | Fraud detection engine |
| CC3.4 — Change risk | Code review process, staging environments | Git history, PR reviews |

### CC4: Monitoring

| Control | Implementation | Evidence |
|---|---|---|
| CC4.1 — Ongoing monitoring | Sentry error tracking, Prometheus metrics | Dashboards, alerts |
| CC4.2 — Deficiency remediation | Issue tracking, incident response | Incident logs |

### CC5: Control Activities

| Control | Implementation | Evidence |
|---|---|---|
| CC5.1 — Risk mitigation | PHI detection, encryption, anonymization | `compliance.js` |
| CC5.2 — Technology controls | JWT auth, RBAC, input validation, HTTPS | Source code, configs |
| CC5.3 — Policy deployment | Security headers (Helmet), CORS, rate limiting | Middleware configs |

### CC6: Logical and Physical Access

| Control | Implementation | Evidence |
|---|---|---|
| CC6.1 — Access provisioning | User registration with email verification | Auth flow |
| CC6.2 — Access removal | Account deactivation, token revocation | Admin controls |
| CC6.3 — Role-based access | 6-tier RBAC system | `authMiddleware.js` |
| CC6.4 — Physical access | DigitalOcean SOC 2 certified data centers | Provider SOC report |
| CC6.5 — Access restrictions | SSH key-only server access, no password auth | Server config |
| CC6.6 — Authentication | JWT + refresh tokens, Google SSO, bcrypt passwords | Auth implementation |
| CC6.7 — Access review | Periodic user access audits | Admin dashboard |
| CC6.8 — Credential management | Password hashing (bcrypt), token expiration | Security config |

### CC7: System Operations

| Control | Implementation | Evidence |
|---|---|---|
| CC7.1 — Threat detection | Sentry alerts, failed auth monitoring | Alert configs |
| CC7.2 — Anomaly detection | Upload heatmaps, fraud scoring (AuditFlow) | Analytics dashboard |
| CC7.3 — Vulnerability management | Dependency scanning, security patches | `npm audit`, server updates |
| CC7.4 — Incident response | IR plan in progress; notification procedures planned | IR documentation (in progress) |
| CC7.5 — Recovery procedures | Database backups (Neon-managed), PM2 auto-restart; formal DR plan needed | Backup configs (partial) |

### CC8: Change Management

| Control | Implementation | Evidence |
|---|---|---|
| CC8.1 — Change authorization | Git-based workflow, code review | Git history |
| CC8.2 — Testing | Vitest unit tests, Playwright E2E tests | Test results |
| CC8.3 — Change deployment | CI/CD via GitHub, PM2 process management | Deployment logs |

### CC9: Risk Mitigation (Vendors)

| Control | Implementation | Evidence |
|---|---|---|
| CC9.1 — Vendor assessment | Evaluate sub-processor security posture | Vendor questionnaires |
| CC9.2 — Vendor agreements | BAAs, DPAs with data processors | Signed agreements |

---

## 4. Availability

| Control | Implementation | Evidence |
|---|---|---|
| A1.1 — Capacity planning | DigitalOcean scalable infrastructure | Resource monitoring |
| A1.2 — Environmental protections | Data center physical security (provider) | DigitalOcean SOC report |
| A1.3 — Recovery objectives | RPO/RTO targets to be formally defined | Backup policy (planned) |
| A1.4 — Backup procedures | Neon automated database backups (provider-managed) | Neon dashboard |
| A1.5 — Business continuity | PM2 auto-restart for process recovery; formal BCP needed | Process configs (partial) |
| A1.6 — Recovery testing | Backup restoration tests to be scheduled | Test records (planned) |

### Uptime Target

- **SLA Target:** 99.5% monthly uptime
- **Monitoring:** Sentry uptime monitoring, Prometheus metrics
- **Incident Communication:** Status page notifications

---

## 5. Processing Integrity

| Control | Implementation | Evidence |
|---|---|---|
| PI1.1 — Processing accuracy | AI extraction with human review workflow | Claim readiness scores |
| PI1.2 — Input validation | Zod/Ajv schema validation, file type checks | Validation middleware |
| PI1.3 — Processing completeness | Document status tracking (pending → processed → reviewed) | Workflow state machine |
| PI1.4 — Output verification | Claim field extraction confidence scores | AI response metadata |
| PI1.5 — Error handling | Graceful fallbacks, error logging, retry logic | Error handling code |

### Data Accuracy Controls

| Control | Description |
|---|---|
| CPT/ICD Code Validation | Codes validated against standard code sets |
| Duplicate Detection | Document deduplication via content hashing |
| Extraction Confidence | AI extraction includes confidence scores per field |
| Human-in-the-Loop | Review queue for low-confidence extractions |
| Audit Trail | All modifications logged with user, timestamp, action |

---

## 6. Confidentiality

| Control | Implementation | Evidence |
|---|---|---|
| C1.1 — Confidential information identification | PHI detection via regex patterns in `compliance.js` | Detection logic |
| C1.2 — Confidential information disposal | Data retention policies, secure deletion | Deletion procedures |
| C1.3 — Confidential information protection | AES-256 encryption, PII masking, RBAC | Encryption implementation |

### Data Classification

| Classification | Examples | Controls |
|---|---|---|
| **Restricted** | PHI (SSN, DOB, MRN), passwords, API keys | Encrypted, masked, access-logged |
| **Confidential** | Claim amounts, policy numbers, CPT codes | RBAC-protected, tenant-isolated |
| **Internal** | User emails, system configs, analytics | Authenticated access required |
| **Public** | Landing page content, documentation | No restrictions |

---

## 7. Privacy

| Control | Implementation | Evidence |
|---|---|---|
| P1.0 — Privacy notice | Terms of service, privacy policy | Published on website |
| P1.1 — Data collection | Explicit consent at registration | Sign-up flow |
| P2.1 — Choice and consent | Google SSO consent, data processing agreement | OAuth flow |
| P3.1 — Personal information collection | Minimum necessary data collection | Registration form |
| P4.1 — Use and retention | Data used only for stated purposes | Privacy policy |
| P5.1 — Access to personal information | User profile page, data export | Dashboard access |
| P6.1 — Disclosure to third parties | AI processing only (OpenRouter) | BAA documentation |
| P7.1 — Data quality | User-editable profile, data validation | Profile management |
| P8.1 — Complaint management | Support channels, privacy inquiries | Contact mechanisms |

---

## 8. Infrastructure & Architecture

### 8.1 Production Environment

```
┌──────────────────────────────────────────────────┐
│                    Internet                       │
│                       │                           │
│              ┌────────▼────────┐                  │
│              │  Let's Encrypt  │                  │
│              │  TLS/SSL Cert   │                  │
│              └────────┬────────┘                  │
│                       │                           │
│              ┌────────▼────────┐                  │
│              │     nginx       │                  │
│              │  Reverse Proxy  │                  │
│              │  (Port 443/80)  │                  │
│              └────────┬────────┘                  │
│                       │                           │
│        ┌──────────────┼──────────────┐            │
│        ▼              ▼              ▼            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ React    │  │ Express  │  │ Static   │        │
│  │ Frontend │  │ Backend  │  │ Assets   │        │
│  │ (Build)  │  │ (PM2)    │  │ (nginx)  │        │
│  └──────────┘  └────┬─────┘  └──────────┘        │
│                     │                             │
│         ┌───────────┼───────────┐                 │
│         ▼           ▼           ▼                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │PostgreSQL│ │OpenRouter│ │  Sentry  │          │
│  │ (Neon)   │ │   API    │ │Monitoring│          │
│  └──────────┘ └──────────┘ └──────────┘          │
│                                                   │
│  DigitalOcean Droplet (104.131.56.144)            │
│  Ubuntu 24.04 LTS                                 │
└──────────────────────────────────────────────────┘
```

### 8.2 Security Headers

| Header | Value | Purpose |
|---|---|---|
| Strict-Transport-Security | max-age=31536000 | Force HTTPS |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | SAMEORIGIN | Prevent clickjacking |
| Content-Security-Policy | Configured | Prevent XSS |
| X-XSS-Protection | 1; mode=block | Legacy XSS protection |

---

## 9. Personnel & Roles

### 9.1 System Roles

| Role | Access Level | PHI Access |
|---|---|---|
| Admin | Full system access | Full |
| Medical Reviewer | Claims review, clinical data | Full (scoped to assigned claims) |
| Adjuster | Claims processing, status updates | Partial (assigned claims only) |
| Auditor | Read-only access, audit reports | Read-only PHI |
| Broker | Limited claims view | Masked PHI |
| Viewer | Dashboard and reports only | No direct PHI |

### 9.2 Administrative Roles

| Role | Responsibility |
|---|---|
| System Administrator | Infrastructure, deployments, access management |
| Security Officer | Risk assessment, incident response, compliance |
| Privacy Officer | Data protection, HIPAA/GDPR compliance |
| Development Team | Application development, bug fixes, features |

---

## 10. Audit Readiness Checklist

### Documentation Required

- [x] System description and architecture diagrams
- [x] Data flow diagrams (PHI flow documented)
- [x] Risk assessment (HIPAA_COMPLIANCE.md)
- [x] Access control matrix (RBAC roles defined)
- [ ] Formal security policies (Information Security Policy)
- [ ] Incident response plan (formalized)
- [ ] Business continuity / disaster recovery plan
- [ ] Vendor management policy
- [ ] Change management policy (formalized)
- [ ] Employee security awareness training records

### Technical Evidence Required

- [x] Authentication mechanism (JWT + Google SSO)
- [x] Encryption implementation (AES-256, bcrypt, TLS)
- [x] Audit logging (activity_logs table)
- [x] Input validation (Zod, Ajv, sanitize-html)
- [x] Role-based access control (6 roles)
- [x] Multi-tenant isolation (tenant_id scoping)
- [ ] Penetration test report
- [ ] Vulnerability scan results
- [ ] Backup and recovery test results
- [ ] Access review records

---

## 11. Gap Analysis & Remediation Plan

### Critical Gaps (Must Fix Before Audit)

| Gap | Priority | Estimated Effort | Target Date |
|---|---|---|---|
| Formal Information Security Policy document | Critical | 1 week | TBD |
| Incident Response Plan (formalized) | Critical | 1 week | TBD |
| Penetration test by third party | Critical | 2-4 weeks | TBD |
| BAA execution with OpenRouter, Neon, DigitalOcean | Critical | 1-2 weeks | TBD |
| Pre-anonymization of text before AI API calls | Critical | 1 week | TBD |

### Important Gaps (Should Fix Before Audit)

| Gap | Priority | Estimated Effort | Target Date |
|---|---|---|---|
| Vulnerability scanning automation | High | 1 week | TBD |
| Business continuity / DR plan | High | 1 week | TBD |
| Vendor management policy | High | 3 days | TBD |
| Change management policy (formalized) | High | 3 days | TBD |
| Employee security training program | High | 1 week | TBD |
| Backup restoration testing | High | 2 days | TBD |

### Nice-to-Have (Improve Audit Readiness)

| Gap | Priority | Estimated Effort | Target Date |
|---|---|---|---|
| SOC 2 compliance monitoring dashboard | Medium | 2 weeks | TBD |
| Automated access review reports | Medium | 1 week | TBD |
| File-level encryption for uploads | Medium | 1 week | TBD |
| PII masking for export endpoints | Medium | 3 days | TBD |

---

## 12. Competitive Positioning

ClarifyOps compliance posture addresses known competitor weaknesses:

| Competitor Issue | ClarifyOps Advantage |
|---|---|
| Rossum: $18K+/year pricing excludes SMBs | Flexible pricing tiers accessible to all organization sizes |
| Rossum: Poor multi-language document support | Extensible text extraction pipeline supports diverse formats |
| Rossum: Complex API integration difficulties | Clean REST API with comprehensive documentation at /docs |
| Rossum: Lengthy setup requiring technical expertise | Self-service demo mode, guided onboarding |
| Wisedocs: Limited independent user reviews, incentivized feedback | Transparent pricing and authentic user testimonials |
| Wisedocs: Narrow focus on medical records only | Full claims lifecycle: intake, extraction, routing, fraud detection |
| Luminai: Small team (9 employees), limited support bandwidth | Dedicated support with comprehensive knowledge base (Clari AI) |
| General: Lack of real-time processing visibility | Live extraction preview, claim readiness scores, processing dashboards |
| General: No built-in fraud detection | AuditFlow risk scoring and anomaly detection |
| General: Siloed tools require multiple vendors | Unified platform: ClarifyClaims + OpsClaim + AuditFlow |
