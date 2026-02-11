# ClarifyOps - AI Claims Data Extractor

## Overview

ClarifyOps is a full-stack AI-powered platform designed to automate medical and insurance claim intake, validation, and routing with audit-ready accuracy. It streamlines insurance workflows through AI-powered document parsing, CPT/ICD code validation, workflow triage (OpsClaim), and fraud detection (AuditFlow). The platform aims to provide significant savings and revenue recovery for various insurance industry stakeholders by automating complex, manual processes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with CSS custom properties (dark mode support)
- **State Management**: SWR for data fetching, React Context for global state
- **Routing**: React Router v6
- **UI Components**: Custom components, Radix UI primitives, and MUI

### Backend Architecture
- **Framework**: Express.js v5 with ES modules
- **Database**: PostgreSQL with pgvector extension
- **Authentication**: JWT-based with refresh tokens, role-based access control (admin, viewer, broker, adjuster, medical_reviewer, auditor)
- **API Design**: RESTful endpoints under `/api/claims`
- **AI Integration**: OpenRouter API for GPT models
- **File Processing**: Multer for uploads, pdf-parse and mammoth for document parsing

### Data Storage
- **Primary Database**: PostgreSQL storing documents, users, tenants, workflows, audit logs
- **Document Storage**: File system uploads with metadata in database
- **Vector Search**: pgvector for semantic document search via embeddings
- **Multi-tenancy**: Tenant ID isolation across all tables

### Key Design Patterns
- **Multi-tenant Architecture**: All operations scoped by tenant ID
- **Feature Flags**: Environment variables control feature availability
- **Activity Logging**: Comprehensive audit trail for document operations
- **Webhook Integration**: Status change notifications to external systems

### UI/UX and Features
- **Search Results Action Panel**: Provides immediate actions on search findings (View Details, Export, Flag for Review, Check Duplicates, Medical Timeline).
- **Enhanced Duplicate Detection Workflow**: Includes options to flag as fraud, side-by-side comparison, and view matched claims.
- **Medical Chronology Feature**: AI-powered extraction and interactive visualization of chronological medical events from claims.
- **Batch Upload / Bulk Processing**: Drag-and-drop interface for uploading multiple documents with real-time status tracking.
- **Natural Language Semantic Search**: AI-powered search across claims using plain English queries via vector embeddings.
- **Confidence Scoring**: Per-field AI confidence scores and overall weighted confidence.
- **Complete Delivery System**: Four-pathway data delivery infrastructure including Webhook Delivery, Zapier Integration, Enhanced Public API v1, and CSV/Excel Exports, managed by an Auto-Delivery Orchestrator.
- **User Registration & Profile System**: Full user management with Google SSO authentication.
- **AI Assistant "Clari"**: Renamed AI bot with expanded knowledge base.
- **Compliance Features**: HIPAA, SOC 2, and GDPR considerations with documentation and trust center page.
- **Competitive Advantage Features**: Self-Service Demo Mode, ROI Calculator, Compliance Badges, Benchmark Comparison, Integration Showcase, and Use Case Pages.

## External Dependencies

### AI/ML Services
- **OpenRouter API**: Primary AI gateway for GPT models (field extraction, summarization, chat).
- **OpenAI Embeddings**: `text-embedding-ada-002` for document vector search.

### Database
- **PostgreSQL**: Primary data store with `pgvector` extension.

### Monitoring & Observability
- **Sentry**: Error tracking and performance monitoring.
- **Prometheus**: Metrics collection.

### Email & Notifications
- **Nodemailer**: Email delivery.
- **Socket.IO**: Real-time notifications.

### Document Processing
- **pdf-parse**: PDF text extraction.
- **mammoth**: Word document conversion.
- **ExcelJS**: Spreadsheet generation for exports.
- **PDFKit**: PDF generation for reports.
- **tesseract.js**: OCR for image uploads.

### Validation & Security
- **Ajv**: JSON schema validation.
- **bcryptjs**: Password hashing.
- **jsonwebtoken**: JWT token management.
- **sanitize-html**: Input sanitization.
- **helmet**: Security headers.

### Third-Party Integrations
- **Zapier**: Webhook receiver for automation workflows.
- **Guidewire/Duck Creek**: Placeholder for future insurance system triggers.