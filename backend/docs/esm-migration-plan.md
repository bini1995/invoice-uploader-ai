# Backend ESM dependency migration plan

This backend is now running in native ESM mode (`"type": "module"`). The runtime currently relies on Node’s CJS↔ESM interop for several dependencies that are still CommonJS-only. The plan below keeps the app stable today while clarifying the follow-up work for dependencies that require ESM updates.

## Short-term (current release)

1. **Lock Node 20/22 for stable ESM + JSON imports.**
   - Maintain `"engines": { "node": ">=20 <23" }` to ensure JSON module imports and `import`-based tooling behave consistently.
2. **Use interop for CJS packages that do not yet expose ESM.**
   - Keep default imports for CJS-only libraries (e.g., `pdfkit`, `pdf-parse`, `exceljs`, `jsonwebtoken`, `bcryptjs`, `winston`) via Node’s default-export interop.
   - Use named imports only when packages ship native ESM exports.
3. **Retain the experimental VM modules flag for Jest.**
   - Jest still depends on `NODE_OPTIONS=--experimental-vm-modules` in pure ESM mode; keep this in test scripts for now.

## Mid-term (next 1–2 releases)

1. **Audit every dependency for ESM readiness.**
   - Identify packages with upcoming ESM-only major versions (or new ESM entrypoints) and pin to the ESM-compatible releases.
2. **Upgrade mocking/test tooling to full ESM support.**
   - Evaluate Jest 30+ or alternative runners (e.g., Vitest) that remove the experimental VM modules flag.
3. **Switch JSON loading to `import` or `fs` based on runtime constraints.**
   - If JSON import assertions become problematic in production builds, replace with explicit `fs.readFile` loaders or bundler-friendly JSON imports.

## Long-term (steady-state)

1. **Remove remaining CJS interop usage.**
   - For each dependency that is still CJS-only, track upstream ESM migrations and replace with ESM-capable alternatives when available.
2. **Standardize build/test runtime on ESM tooling.**
   - Move all CLI scripts and one-off jobs to ESM, ensuring consistent module resolution in production and CI.

## Dependency watchlist

- **CJS-only or mixed exports**: `pdfkit`, `pdf-parse`, `exceljs`, `jsonwebtoken`, `bcryptjs`, `winston`.
- **Test tooling**: `jest`, `supertest`.
- **Runtime tooling**: `nodemailer`, `swagger-jsdoc`.

Each item should be revisited during dependency upgrades to prefer ESM-native builds and remove interop shims where possible.
