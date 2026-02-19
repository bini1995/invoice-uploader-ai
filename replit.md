# ClarifyOps - AI Claims Data Extractor

## Overview

ClarifyOps is a claims prep service that handles the annoying paperwork before adjusters open a file. Positioned as labor replacement (not an AI platform), it transforms 60-page claim packets into adjuster-ready summaries with CPT/ICD validation, confidence scores, and medical chronology. Priced at $4/claim (first 25 free) targeting independent adjusting firms (5-50 adjusters). Per-user tenant isolation for data security.

## Recent Changes (Feb 2026)
- **Positioning pivot**: Changed from "AI claims platform" to "labor replacement service" — messaging focuses on time saved for adjusters
- **Hero rewrite**: "Your adjusters shouldn't spend 45 minutes reading every claim file" with CTA "Send Us a Sample Claim"
- **Pricing model**: Replaced subscription tiers ($249/$499/$999/mo) with $4/claim pay-per-use model. First 25 claims free. Updated across PricingSection, BillingPage, ROICalculator, PriceCalculator, FaqAccordion, AISupportBot, CaseStudies
- **Security audit (OWASP)**: Fixed code injection in automationEngine.js, false-positive input sanitizer blocking claim text, API key exposure via query strings, hardcoded DB password, credential logging
- **Multi-tenancy fix**: Added `tenant_id` column to users table, each user gets unique tenant on registration/SSO (was sharing 'default' tenant)
- **UI language update**: "Prepared report" renamed to "adjuster-ready claim packet" throughout the application
- **Navigation rename**: Drop Files→Upload Assignment, Prepared Reports→Ready Packets, Send to Adjuster→Deliver to Carrier, AuditFlow→Billing Error Detection
- **Demo claim feature**: "Try a Real Example Claim" button on empty inbox loads realistic demo data into user's own tenant
- **Email standardization**: All CTAs now point to claims@clarifyops.com

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
- **Stripe Payment Integration**: Full billing system with Stripe checkout, subscription management, and billing portal. Three beta pricing tiers (Starter $249/mo, Professional $499/mo, Enterprise $999/mo) with yearly discounts. Post-beta pricing: $599, $1,499, $2,999/mo. Frontend Billing page at `/billing`. Auth middleware protects all billing routes.
- **User Registration & Profile System**: Full user management with Google SSO authentication.
- **AI Assistant "Clari"**: Renamed AI bot with expanded knowledge base.
- **Compliance Features**: HIPAA, SOC 2, and GDPR considerations with documentation and trust center page.
- **Competitive Advantage Features**: Self-Service Demo Mode, ROI Calculator, Compliance Badges, Benchmark Comparison, Integration Showcase, and Use Case Pages.
- **First-Run Guided Onboarding**: Empty dashboard replaced with 3-step guided flow (Upload → Review → Export) for new users, with visual preview snippet of a prepared claim file below the steps. Sidebar simplified to 5 primary items (Search hidden until 3+ claims) with advanced features behind "More" toggle. Demo sandbox shows visual prepared claim report instead of CSV.
- **Prepared Claim Report Page**: Full-page `/claim/:id` view that shows extracted fields, confidence scores, readiness bar, duplicate checks, medical chronology, and AI summary. The "WOW screen" that appears immediately after upload completes (single-file auto-redirect).
- **Mobile Responsiveness**: Full mobile layout with slide-in sidebar drawer, bottom navigation, hamburger toggle, consistent `md:` breakpoints across all layout components.

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