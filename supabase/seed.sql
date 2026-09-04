-- seed.sql
-- Development seed data for Xunique Labs Internal Management Portal

-- NOTE: Replace user IDs below with your actual Supabase Auth user IDs after inviting them.
-- Here we provide clean seed templates:

-- 1. Sample Clients
INSERT INTO public.clients (id, company_name, industry, website, status, lead_source, tags)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Acme FinTech Corp', 'Financial Services', 'https://acmefin.example.com', 'active', 'referral', ARRAY['Fintech', 'React', 'Cloud']),
    ('c0000000-0000-0000-0000-000000000002', 'Lumina Health Labs', 'Healthcare & Biotech', 'https://luminahealth.example.com', 'negotiation', 'inbound', ARRAY['Healthcare', 'HIPAA', 'Mobile']),
    ('c0000000-0000-0000-0000-000000000003', 'Apex Logistics', 'Supply Chain', 'https://apexlogistics.example.com', 'lead', 'linkedin', ARRAY['Enterprise', 'Logistics'])
ON CONFLICT (id) DO NOTHING;

-- 2. Sample Contacts
INSERT INTO public.contacts (id, client_id, name, role, email, phone, preferred_channel)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Sarah Jenkins', 'VP of Engineering', 'sarah@acmefin.example.com', '+1 (555) 234-5678', 'whatsapp'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'David Ross', 'Product Director', 'david@acmefin.example.com', '+1 (555) 234-5679', 'email'),
    ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Dr. Elena Vance', 'Chief Science Officer', 'elena@luminahealth.example.com', '+1 (555) 876-5432', 'phone')
ON CONFLICT (id) DO NOTHING;

-- 3. Sample Projects
INSERT INTO public.projects (id, client_id, name, description, tech_stack, start_date, end_date, budget, status, kanban_columns)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Merchant Portal Redesign', 'Revamp of the merchant settlement portal with real-time analytics', ARRAY['Next.js', 'PostgreSQL', 'Tailwind'], '2026-09-01', '2026-11-30', 35000.00, 'active', ARRAY['To Do', 'In Progress', 'Review', 'Done']),
    ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Clinical Data Dashboard', 'HIPAA compliant patient telemetry analytics pipeline', ARRAY['Python', 'React', 'FastAPI'], '2026-10-01', '2027-01-15', 52000.00, 'planning', ARRAY['To Do', 'In Progress', 'Review', 'Done'])
ON CONFLICT (id) DO NOTHING;

-- 4. Sample Milestones
INSERT INTO public.milestones (id, project_id, title, description, due_date, completed)
VALUES
    ('m0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Sprint 1: Architecture & Auth Setup', 'Base infrastructure and SSO authentication', '2026-09-15', true),
    ('m0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Sprint 2: Transaction History UI', 'High-throughput data tables with filter and export', '2026-10-01', false)
ON CONFLICT (id) DO NOTHING;
