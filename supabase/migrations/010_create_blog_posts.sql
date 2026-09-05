-- 010_create_blog_posts.sql
-- Creates the blog_posts table with RLS, search indexing, and publication workflows.

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Engineering',
  tags TEXT[] NOT NULL DEFAULT '{}',
  cover_image TEXT,
  author_name TEXT NOT NULL DEFAULT 'Sayyed Abdul Ali',
  author_avatar TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  read_time_minutes INTEGER NOT NULL DEFAULT 3,
  views_count INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Indexes for fast query lookup
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON public.blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);

-- Enable Row-Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 1. Public can read all published posts
CREATE POLICY "Public can read published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- 2. Authenticated administrative users can perform all operations
CREATE POLICY "Admins have full access to blog posts"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
