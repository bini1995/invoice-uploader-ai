#!/bin/bash
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'EOSQL'
CREATE EXTENSION IF NOT EXISTS vector;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'documents'
      AND column_name = 'embedding'
  ) THEN
    CREATE INDEX IF NOT EXISTS documents_embedding_ivfflat_idx
      ON documents USING ivfflat (embedding vector_l2_ops);
  END IF;
END
$$;
EOSQL
