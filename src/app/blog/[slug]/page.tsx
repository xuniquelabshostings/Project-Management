import { Metadata } from "next";
import { BlogPostClient } from "@/components/blog/BlogPostClient";
import { MOCK_BLOG_POSTS, getLocalBlogPostBySlug } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase/client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = new Set<string>(MOCK_BLOG_POSTS.map((post) => post.slug));

  try {
    const { data: dbPosts } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("status", "published");

    if (dbPosts) {
      for (const p of dbPosts) {
        if (p.slug) slugs.add(p.slug);
      }
    }
  } catch (err) {
    console.warn("generateStaticParams: failed to query Supabase posts:", err);
  }

  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let post = MOCK_BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    try {
      const { data: dbPost } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (dbPost) {
        post = dbPost as any;
      }
    } catch {}
  }

  if (!post) {
    return {
      title: "Article Not Found | Xunique Labs Blog",
      description: "The requested technical dispatch could not be found.",
    };
  }

  return {
    metadataBase: new URL("https://xuniquelabs.com"),
    title: `${post.title} — Xunique Labs Engineering Journal`,
    description: post.excerpt,
    keywords: post.tags,
    alternates: {
      canonical: `https://xuniquelabs.com/blog/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: `${post.title} — Xunique Labs`,
      description: post.excerpt,
      url: `https://xuniquelabs.com/blog/${slug}`,
      siteName: "Xunique Labs",
      type: "article",
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at || post.published_at || post.created_at,
      authors: [post.author_name || "Sayyed Abdul Ali"],
      tags: post.tags,
      images: post.cover_image
        ? [
            {
              url: post.cover_image.startsWith("http")
                ? post.cover_image
                : `https://xuniquelabs.com${post.cover_image}`,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [
            {
              url: "https://xuniquelabs.com/assets/logo-mark.png",
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — Xunique Labs`,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : ["/assets/logo-mark.png"],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post = MOCK_BLOG_POSTS.find((p) => p.slug === slug) || null;

  if (!post) {
    try {
      const { data: dbPost } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (dbPost) {
        post = dbPost as any;
      }
    } catch {}
  }

  const articleJsonLd = post
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `https://xuniquelabs.com/blog/${slug}#article`,
        "headline": post.title,
        "description": post.excerpt,
        "url": `https://xuniquelabs.com/blog/${slug}`,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://xuniquelabs.com/blog/${slug}`,
        },
        "datePublished": post.published_at || post.created_at,
        "dateModified": post.updated_at || post.published_at || post.created_at,
        "author": {
          "@type": "Person",
          "@id": "https://xuniquelabs.com/#founder",
          "name": post.author_name || "Sayyed Abdul Ali",
          "url": "https://xuniquelabs.com/",
        },
        "publisher": {
          "@type": "Organization",
          "@id": "https://xuniquelabs.com/#organization",
          "name": "Xunique Labs",
          "logo": {
            "@type": "ImageObject",
            "url": "https://xuniquelabs.com/assets/logo-mark.png",
          },
        },
        "image": post.cover_image
          ? [post.cover_image.startsWith("http") ? post.cover_image : `https://xuniquelabs.com${post.cover_image}`]
          : ["https://xuniquelabs.com/assets/logo-mark.png"],
        "keywords": post.tags?.join(", "),
        "articleSection": post.category || "Engineering",
      })
    : null;

  return (
    <>
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: articleJsonLd }}
        />
      )}
      <BlogPostClient initialPost={post} slug={slug} />
    </>
  );
}
