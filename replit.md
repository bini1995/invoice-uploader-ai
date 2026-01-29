# ClarifyOps - AI Claims Data Extractor

## Overview

ClarifyOps is a full-stack AI-powered claims data extraction and review platform built for insurance workflows. The system automates medical and insurance claim intake, validation, and routing with audit-ready accuracy. Core capabilities include AI-powered document parsing, CPT/ICD code validation, workflow triage (OpsClaim), and fraud detection (AuditFlow).

The platform processes claims through an Express.js backend with PostgreSQL storage, using OpenRouter for AI features like field extraction and summarization. The React frontend provides claim management, analytics dashboards, and workflow automation tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

- **Image/OCR Support**: Enhanced `fileToText.js` to handle image uploads (PNG, JPG, etc.) via tesseract.js OCR. Added MIME type detection for files without extensions.
- **Binary File Handling**: Added null byte detection to prevent binary data from being stored in PostgreSQL text fields.
- **File Type Support**: Extended support for additional file types (.gif, .bmp, .tiff, .webp for images; .csv, .eml for text).
- **Error Handling**: Improved OCR error handling with graceful fallbacks to placeholder text for unreadable images.
- **PHI Detection**: Verified PHI detection and anonymization working correctly (redacting DOB, phone numbers, member IDs).

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