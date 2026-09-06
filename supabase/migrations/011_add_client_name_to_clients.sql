-- 011_add_client_name_to_clients.sql
-- Adds client_name column to clients table and ensures bidirectional compatibility with company_name.

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS client_name TEXT;

-- Backfill client_name from company_name where null
UPDATE public.clients
SET client_name = company_name
WHERE client_name IS NULL AND company_name IS NOT NULL;

-- If company_name is null, backfill from client_name
UPDATE public.clients
SET company_name = client_name
WHERE company_name IS NULL AND client_name IS NOT NULL;

-- Trigger to keep client_name and company_name synchronized
CREATE OR REPLACE FUNCTION public.sync_client_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_name IS NOT NULL AND (NEW.company_name IS NULL OR NEW.company_name = '') THEN
    NEW.company_name := NEW.client_name;
  ELSIF NEW.company_name IS NOT NULL AND (NEW.client_name IS NULL OR NEW.client_name = '') THEN
    NEW.client_name := NEW.company_name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_client_name ON public.clients;
CREATE TRIGGER trg_sync_client_name
BEFORE INSERT OR UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.sync_client_name();
