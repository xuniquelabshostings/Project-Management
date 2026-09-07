import { Metadata } from "next";
import { LandingPage } from "@/components/site/LandingPage";
import { LANDING_SCHEMA } from "@/components/site/landing-content";

export const metadata: Metadata = {
  metadataBase: new URL("https://xuniquelabs.com"),
  title: "Website Development Services in Delhi | Web Design, App Dev & Digital Marketing — Xunique Labs",
  description:
    "Xunique Labs delivers premier website development services in Delhi, bespoke web design, mobile app development, and ROI-driven digital marketing in Delhi. Top developers building fast Next.js & Flutter apps.",
  keywords: [
    "website development services in delhi",
    "web design",
    "app development in delhi",
    "digital marketing services in delhi",
    "seo company in delhi",
    "performance marketing delhi",
    "google ads management delhi",
    "website developers in delhi",
    "mobile app development in delhi",
    "web design company in delhi",
    "best website development services in delhi",
    "custom software development delhi",
    "e-commerce website development delhi",
    "flutter app developer delhi",
    "react nextjs developers in delhi",
    "full stack web development delhi",
    "UI UX design studio delhi",
    "top website developers in delhi",
    "Xunique Labs",
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
  openGraph: {
    title: "Website Development Services in Delhi | Web Design & App Development — Xunique Labs",
    description:
      "Premier website development services in Delhi, bespoke web design, and cross-platform mobile app development. Engineered to spec by senior website developers in Delhi.",
    url: "https://xuniquelabs.com",
    siteName: "Xunique Labs",
    images: [
      {
        url: "/assets/logo-mark.png",
        width: 1200,
        height: 630,
        alt: "Website Development Services in Delhi — Xunique Labs",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Development Services in Delhi | Web Design & App Development — Xunique Labs",
    description:
      "Premier website development services in Delhi, custom web design, and mobile app development. Handcrafted by senior website developers in Delhi.",
    images: ["/assets/logo-mark.png"],
  },
  alternates: {
    canonical: "https://xuniquelabs.com",
  },
};

export default function HomePage() {
  return (
    <>
      <link rel="stylesheet" href="/landing.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: LANDING_SCHEMA }}
      />
      <LandingPage />
    </>
  );
}
