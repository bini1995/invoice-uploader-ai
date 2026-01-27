# Troubleshooting Guide

## Common Issues

### 1. Node.js Version Conflicts
**Error**: `TypeError: memorize is not a function` or similar Vite errors.
**Solution**: Ensure you are using Node.js 20+. Use `node -v` to check. If using `nvm`, run `nvm use 20`.

### 2. Database Connection Failures
**Error**: `ECONNREFUSED` or `database "documents_db" does not exist`.
**Solution**: Verify your `DATABASE_URL` in the `.env` file. Ensure PostgreSQL is running and the database name matches.

### 3. Missing Dependencies
**Error**: `Module not found: 'vite-plugin-compression'`.
**Solution**: Run `npm install` in the root and `frontend` directories.

### 4. AI Processing Failures
**Error**: `AI processing service temporarily unavailable`.
**Solution**: Check your `OPENROUTER_API_KEY` or `OPENAI_API_KEY`. Ensure you have sufficient credits on your provider.
