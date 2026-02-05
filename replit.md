# ClarifyOps - AI Claims Data Extractor

## Overview

ClarifyOps is a full-stack AI-powered claims data extraction and review platform built for insurance workflows. The system automates medical and insurance claim intake, validation, and routing with audit-ready accuracy. Core capabilities include AI-powered document parsing, CPT/ICD code validation, workflow triage (OpsClaim), and fraud detection (AuditFlow).

The platform processes claims through an Express.js backend with PostgreSQL storage, using OpenRouter for AI features like field extraction and summarization. The React frontend provides claim management, analytics dashboards, and workflow automation tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## Production Deployment (January 29, 2026)

**Live Site:** https://clarifyops.com

### Hosting Details
- **Server**: DigitalOcean Droplet (2GB RAM, Ubuntu 24.04)
- **IP Address**: 104.131.56.144
- **Domain**: clarifyops.com (registered via GoDaddy)
- **SSL**: Let's Encrypt certificate (auto-renews)
- **Process Manager**: PM2 for Node.js backend
- **Web Server**: nginx reverse proxy

### Server Commands
- View backend logs: `pm2 logs clarifyops-backend`
- Restart backend: `pm2 restart clarifyops-backend`
- Reload nginx: `systemctl reload nginx`
- Pull updates: `cd /var/www/clarifyops && git pull origin main`
- Rebuild frontend: `cd /var/www/clarifyops/frontend && npm run build`

### Configuration Files
- Backend env: `/var/www/clarifyops/backend/.env`
- Nginx config: `/etc/nginx/sites-available/clarifyops`
- PM2 config: Auto-saved via `pm2 save`

### GitHub Repository
- URL: https://github.com/bini1995/invoice-uploader-ai
- Push from Replit → Pull on droplet to deploy updates

## Recent Changes (February 2026)

- **User Registration & Profile System**: Complete user registration with name/email/password validation, profile page, and sidebar user display
- **Google SSO Authentication**: OAuth 2.0 integration for Google sign-in (requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)
- **Public API (v1)**: REST API endpoints at /api/v1/ for claims access, status updates, and webhooks with API key authentication
- **AI Assistant "Clari"**: Renamed AI bot to Clari with expanded knowledge base covering platform features, pricing, integrations, and documentation
- **Documentation Site**: Internal docs at /docs with Getting Started, API Reference, Integrations, Security, and SSO sections
- **Validation Error Handling**: Improved Zod validation error formatting in backend
- **Logo Transparency Fix**: Logo now uses transparent background with CSS `brightness-0 invert` filter on dark backgrounds (sidebar, navbars, login/signup). Original colored logo preserved on white/light backgrounds.
- **HIPAA Compliance Documentation**: Comprehensive `docs/HIPAA_COMPLIANCE.md` with full ePHI data flow diagrams, BA determination, PHI inventory, risk assessment, breach notification plan, and compliance checklist
- **SOC 2 Scope Document**: New `docs/SOC2_SCOPE.md` with all 5 Trust Service Categories, Common Criteria controls (CC1-CC9), gap analysis, and remediation plan
- **Trust Center Page** (`/trust`): Professional page showcasing security practices, compliance certifications (HIPAA, SOC 2, GDPR), data handling principles, and subprocessor transparency
- **Privacy Policy Page** (`/privacy`): Comprehensive privacy policy with HIPAA PHI sections, subprocessor disclosure, data retention, breach notification, and GDPR rights
- **Terms of Service Page** (`/terms`): Full legal terms covering HIPAA BAA requirements, AI processing disclaimers, data ownership, acceptable use, and liability limitations

- **Competitive Advantage Features**: Added 6 features to establish market position:
  - Self-Service Demo Mode (`TryDocumentDemo.jsx`) - Interactive document upload with simulated AI extraction
  - ROI Calculator (`ROICalculator.jsx`) - Dynamic savings calculator with sliders for claims volume, processing time, hourly rate, and error rate
  - Compliance Badges (`ComplianceBadges.jsx`) - HIPAA, SOC 2, audit logging, encryption, PHI redaction, GDPR badges
  - Benchmark Comparison Page (`/compare`) - Feature-by-feature comparison vs Rossum, Luminai, Affinda, Wisedocs
  - Integration Showcase (`/integrations`) - Guidewire, Duck Creek, Salesforce, ServiceNow, Zapier integration cards
  - Use Case Pages (`/use-cases`) - Workers Comp, Auto FNOL, Medical Billing with challenges/solutions breakdowns

## Recent Changes (January 2026)

- **Production Deployment**: Deployed to DigitalOcean droplet with nginx, PM2, and Let's Encrypt SSL.
- **Database Config Fix**: Updated db.js to properly read DATABASE_URL and avoid Docker-specific hostname overrides.
- **Image/OCR Support**: Enhanced `fileToText.js` to handle image uploads (PNG, JPG, etc.) via tesseract.js OCR. Added MIME type detection for files without extensions.
- **Binary File Handling**: Added null byte detection to prevent binary data from being stored in PostgreSQL text fields.
- **File Type Support**: Extended support for additional file types (.gif, .bmp, .tiff, .webp for images; .csv, .eml for text).
- **Error Handling**: Improved OCR error handling with graceful fallbacks to placeholder text for unreadable images.
- **PHI Detection**: Verified PHI detection and anonymization working correctly (redacting DOB, phone numbers, member IDs).
- **OpenRouter AI Integration**: Fixed embedding data format conversion for pgvector (Object to Array conversion). AI classification now correctly categorizes claims as medical_bill, invoice, fnol_form, etc.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with Vite as the build tool
- **Styling**: Tailwind CSS with CSS custom properties for theming (dark mode support)
- **State Management**: SWR for data fetching, React Context for global state
- **Routing**: React Router v6
- **UI Components**: Mix of custom components, Radix UI primitives, and MUI
- **Testing**: Vitest with React Testing Library, Playwright for E2E

### Backend Architecture
- **Framework**: Express.js v5 with ES modules
- **Database**: PostgreSQL with pgvector extension for embeddings
- **Authentication**: JWT-based with refresh tokens, role-based access control (admin, viewer, broker, adjuster, medical_reviewer, auditor)
- **API Design**: RESTful endpoints under `/api/claims` namespace (consolidated from legacy `/api/invoices`)
- **AI Integration**: OpenRouter API for GPT models (field extraction, summarization, entity extraction)
- **File Processing**: Multer for uploads, pdf-parse and mammoth for document parsing

### Data Storage
- **Primary Database**: PostgreSQL storing documents, users, tenants, workflows, audit logs
- **Document Storage**: File system uploads with metadata in database
- **Vector Search**: pgvector for semantic document search via embeddings
- **Multi-tenancy**: Tenant ID isolation across all tables

### Key Design Patterns
- **Multi-tenant Architecture**: All operations scoped by tenant ID from request context
- **Feature Flags**: Environment variables control lite mode vs full features
- **Activity Logging**: Comprehensive audit trail for all document operations
- **Webhook Integration**: Status change notifications to external systems

### Sub-Brand Structure
- **ClarifyClaims**: Main claims upload, validation, and summarization
- **OpsClaim**: Action queue and workflow routing
- **AuditFlow**: Risk scoring and fraud detection for flagged claims

## External Dependencies

### AI/ML Services
- **OpenRouter API**: Primary AI gateway for GPT-3.5/4 models (field extraction, summarization, chat)
- **OpenAI Embeddings**: text-embedding-ada-002 for document vector search

### Database
- **PostgreSQL**: Primary data store with pgvector extension
- **Connection pooling**: pg library with configurable pool settings

### Monitoring & Observability
- **Sentry**: Error tracking and performance monitoring
- **Prometheus**: Metrics collection via prom-client (claim uploads, extraction latency, exports)

### Email & Notifications
- **Nodemailer**: Email delivery for reminders and summaries
- **Slack/Teams webhooks**: Optional notification integrations
- **Socket.IO**: Real-time notifications and updates

### Document Processing
- **pdf-parse**: PDF text extraction
- **mammoth**: Word document conversion
- **ExcelJS**: Spreadsheet generation for exports
- **PDFKit**: PDF generation for reports

### Validation & Security
- **Ajv**: JSON schema validation
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token management
- **sanitize-html**: Input sanitization
- **helmet**: Security headers

### Third-Party Integrations (Placeholder)
- **Guidewire/Duck Creek**: Insurance system triggers (stub endpoints)
- **Zapier**: Webhook receiver for automation workflows