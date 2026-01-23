# Phase 4: Export & Integration

This phase focuses on getting data out of the platform and into existing systems.

## Features

- **CSV & JSON export** of all claims and their parsed fields via `/api/claims/export`.
- **ERP / Claims system integration** endpoint to push claim data.
- **Webhook triggers** fire on claim status changes using `CLAIM_STATUS_WEBHOOK_URL`.
  - Signed with `CLAIM_WEBHOOK_SECRET` (`X-Webhook-Signature: sha256=...`)
  - Custom headers via `CLAIM_WEBHOOK_HEADERS`
  - Additional payload fields via `CLAIM_WEBHOOK_TEMPLATE`

Sample payload:

```json
{
  "claim_id": "12345",
  "new_status": "reviewed",
  "updated_at": "2025-07-25T14:20:00Z"
}
```

Future Phase 5 will add exportable claim status history for audit trails.
