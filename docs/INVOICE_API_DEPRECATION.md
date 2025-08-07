# Invoice API Deprecation

The legacy `/api/invoices` endpoints are deprecated in favor of `/api/claims`.

- **Removal date:** August 31, 2025
- All clients should migrate to `/api/claims` prior to this date.
- Requests to `/api/invoices` return `Deprecation`, `Sunset`, `Warning`, and `Link` headers to signal this change.
- CI includes a health check that fails if new code references `/invoices` routes.
 - During the grace window, `GET` requests receive a `308` redirect to the equivalent `/api/claims` path, preserving query strings and headers and cached for up to 60 seconds.
 - After the removal date, `/api/invoices` will respond `410 Gone` with an RFC7807 `application/problem+json` body while keeping the same `Link` header for migration info.

## Timeline
- **Now:** Deprecation headers emitted; new development should target `/api/claims`.
- **August 31, 2025:** `/api/invoices` removed.
