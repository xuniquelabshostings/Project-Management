import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://xuniquelabs.com"),
  title: "Engineering Journal & Architecture Dispatches | Xunique Labs",
  description:
    "Technical articles, case studies, and engineering notes on Next.js performance, Flutter mobile apps, full-stack web architecture, and cloud infrastructure by senior developers at Xunique Labs.",
  keywords: [
    "Xunique Labs blog",
    "software engineering blog",
    "Next.js architecture",
    "Flutter vs React Native",
    "Core Web Vitals optimization",
    "website development Delhi",
    "full stack web development",
    "Sayyed Abdul Ali",
  ],
  authors: [{ name: "Sayyed Abdul Ali", url: "https://xuniquelabs.com" }],
  creator: "Xunique Labs",
  publisher: "Xunique Labs",
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
  alternates: {
    canonical: "https://xuniquelabs.com/blog",
  },
  openGraph: {
    title: "Engineering Journal & Architecture Dispatches — Xunique Labs",
    description:
      "Deep technical articles on web performance, mobile app engineering, scalable systems, and bespoke digital solutions.",
    url: "https://xuniquelabs.com/blog",
    siteName: "Xunique Labs",
    images: [
      {
        url: "/assets/logo-mark.png",
        width: 1200,
        height: 630,
        alt: "Xunique Labs Engineering Journal",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering Journal & Architecture Dispatches — Xunique Labs",
    description:
      "Deep technical articles on web performance, mobile app engineering, and scalable systems.",
    images: ["/assets/logo-mark.png"],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
