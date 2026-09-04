-- 006_invoices_and_proposals.sql
-- Invoicing, Line Items, Proposals and SOWs with zero-developer access RLS

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    status invoice_status NOT NULL DEFAULT 'draft',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    recurrence_interval TEXT CHECK (recurrence_interval IN ('monthly', 'quarterly')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- 2. Invoice line items table
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    line_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

CREATE INDEX IF NOT EXISTS idx_line_items_invoice ON public.invoice_line_items(invoice_id);

-- 3. Proposals and Contracts table
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    version INTEGER NOT NULL DEFAULT 1,
    status proposal_status NOT NULL DEFAULT 'draft',
    template_id UUID,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_proposals_client ON public.proposals(client_id);

-- 4. Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: INVOICES (Strictly Admin + AM only; Developers have NO access)
CREATE POLICY "Admins and AMs view invoices"
    ON public.invoices
    FOR SELECT
    TO authenticated
    USING (public.can_manage_client(client_id));

CREATE POLICY "Admins and AMs insert invoices"
    ON public.invoices
    FOR INSERT
    TO authenticated
    WITH CHECK (public.can_manage_client(client_id));

CREATE POLICY "Admins and AMs update invoices"
    ON public.invoices
    FOR UPDATE
    TO authenticated
    USING (public.can_manage_client(client_id))
    WITH CHECK (public.can_manage_client(client_id));

CREATE POLICY "Admins delete invoices"
    ON public.invoices
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 6. RLS Policies: INVOICE LINE ITEMS
CREATE POLICY "Admins and AMs view line items"
    ON public.invoice_line_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices inv
            WHERE inv.id = invoice_id AND public.can_manage_client(inv.client_id)
        )
    );

CREATE POLICY "Admins and AMs manage line items"
    ON public.invoice_line_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices inv
            WHERE inv.id = invoice_id AND public.can_manage_client(inv.client_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.invoices inv
            WHERE inv.id = invoice_id AND public.can_manage_client(inv.client_id)
        )
    );

-- 7. RLS Policies: PROPOSALS
CREATE POLICY "Admins and AMs view proposals"
    ON public.proposals
    FOR SELECT
    TO authenticated
    USING (public.can_manage_client(client_id));

CREATE POLICY "Admins and AMs insert proposals"
    ON public.proposals
    FOR INSERT
    TO authenticated
    WITH CHECK (public.can_manage_client(client_id));

CREATE POLICY "Admins and AMs update proposals"
    ON public.proposals
    FOR UPDATE
    TO authenticated
    USING (public.can_manage_client(client_id))
    WITH CHECK (public.can_manage_client(client_id));

CREATE POLICY "Admins delete proposals"
    ON public.proposals
    FOR DELETE
    TO authenticated
    USING (public.is_admin());
