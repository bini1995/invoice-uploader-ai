# HIPAA & GDPR Compliance Overview

ClarifyOps is designed with security-first principles to handle sensitive medical and insurance data.

## PHI Safeguards
- **Data at Rest**: All sensitive database fields are encrypted using AES-256.
- **Data in Transit**: Mandatory TLS/SSL for all API and web traffic.
- **Access Controls**: Strict Role-Based Access Control (RBAC) manages data visibility.
- **Audit Trails**: Every document access, modification, and upload is logged in the `activity_logs` table.
- **PII Masking**: Automatic masking of sensitive fields (names, emails) for non-admin roles.

## GDPR Compliance
- **Data Portability**: Users can export their data in CSV/PDF formats.
- **Right to Erasure**: Support for data retention policies and manual purge operations.
- **Tenant Isolation**: Strict logical separation of data using `tenant_id` and server-side enforcement.
