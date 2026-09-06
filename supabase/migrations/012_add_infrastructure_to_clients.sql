-- Migration 012: Add domain & hosting infrastructure lifecycle tracking to clients

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS domain_name TEXT,
  ADD COLUMN IF NOT EXISTS domain_registrar TEXT,
  ADD COLUMN IF NOT EXISTS domain_registered_at DATE,
  ADD COLUMN IF NOT EXISTS domain_renew_at DATE,
  ADD COLUMN IF NOT EXISTS domain_price NUMERIC,
  ADD COLUMN IF NOT EXISTS hosting_provider TEXT,
  ADD COLUMN IF NOT EXISTS hosting_plan TEXT,
  ADD COLUMN IF NOT EXISTS hosting_activated_at DATE,
  ADD COLUMN IF NOT EXISTS hosting_renew_at DATE,
  ADD COLUMN IF NOT EXISTS hosting_price NUMERIC,
  ADD COLUMN IF NOT EXISTS renewal_alert_days INTEGER DEFAULT 30;

-- Optional index for querying clients expiring soon
CREATE INDEX IF NOT EXISTS idx_clients_domain_renew_at ON public.clients(domain_renew_at) WHERE domain_renew_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_hosting_renew_at ON public.clients(hosting_renew_at) WHERE hosting_renew_at IS NOT NULL;
