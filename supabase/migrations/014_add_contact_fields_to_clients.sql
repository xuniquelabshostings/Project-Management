-- Migration 014: Add email, phone, and address columns to clients table
-- Ensures direct compatibility with client contact details in clients table

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
