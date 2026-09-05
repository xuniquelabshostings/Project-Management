import { Metadata } from "next";
import { BlogPostClient } from "@/components/blog/BlogPostClient";
import { MOCK_BLOG_POSTS, getLocalBlogPostBySlug } from "@/lib/mock-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return MOCK_BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = MOCK_BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Article Not Found | Xunique Labs Blog",
      description: "The requested technical dispatch could not be found.",
    };
  }

  return {
    title: `${post.title} — Xunique Labs Engineering Journal`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.published_at || post.created_at,
      authors: [post.author_name],
      tags: post.tags,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const initialPost = MOCK_BLOG_POSTS.find((p) => p.slug === slug) || null;

  return <BlogPostClient initialPost={initialPost} slug={slug} />;
}
