CREATE TABLE IF NOT EXISTS invoices_backup AS TABLE invoices;

DO $$
BEGIN
  IF to_regclass('public.documents') IS NULL THEN
    ALTER TABLE invoices RENAME TO documents;
  END IF;
END $$;

ALTER TABLE documents ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS entity TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "fileType" TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "contentHash" TEXT;
