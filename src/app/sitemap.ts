import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase/client";
import { MOCK_BLOG_POSTS } from "@/lib/mock-data";

export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://xuniquelabs.com";
  const now = new Date();

  // 1. Landing page root and all core functional landing page sections
  const landingSections: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#process`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/#work`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#contact`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // 2. Fetch all published blog posts dynamically from Supabase database & merge with fallback posts
  const postsMap = new Map<string, { slug: string; date: Date; featured?: boolean }>();

  // A. Baseline static blog posts
  for (const post of MOCK_BLOG_POSTS) {
    if (post.status === "published") {
      postsMap.set(post.slug, {
        slug: post.slug,
        date: new Date(post.published_at || post.updated_at || post.created_at || now),
        featured: post.featured,
      });
    }
  }

  // B. Dynamic live blog posts from Supabase database
  try {
    const { data: dbPosts, error } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at, created_at, featured, status")
      .eq("status", "published");

    if (!error && dbPosts && dbPosts.length > 0) {
      for (const p of dbPosts) {
        if (!p.slug) continue;
        postsMap.set(p.slug, {
          slug: p.slug,
          date: new Date(p.updated_at || p.published_at || p.created_at || now),
          featured: Boolean(p.featured),
        });
      }
    }
  } catch (err) {
    console.warn("Sitemap: failed to query database blog posts, falling back to local posts:", err);
  }

  const blogEntries: MetadataRoute.Sitemap = Array.from(postsMap.values()).map(
    ({ slug, date, featured }) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: date,
      changeFrequency: "weekly" as const,
      priority: featured ? 0.85 : 0.8,
    })
  );

  return [...landingSections, ...blogEntries];
}
