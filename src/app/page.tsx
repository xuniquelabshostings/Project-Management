import { Metadata } from "next";
import { LandingPage } from "@/components/site/LandingPage";

export const metadata: Metadata = {
  metadataBase: new URL("https://xuniquelabs.com"),
  title: "Xunique Labs — Website Developer in Delhi | Web & Mobile App Development Studio",
  description:
    "Xunique Labs is a leading website developer & mobile app development company in Delhi. We engineer high-performance web applications, Flutter mobile apps, e-commerce stores, and custom software systems.",
  keywords: [
    "Website Developer in Delhi",
    "Web Development Company Delhi",
    "Mobile App Development Delhi",
    "Flutter App Developer",
    "React Next.js Developer Delhi",
    "E-commerce Website Development",
    "Custom Software Studio Delhi",
    "Sayyed Abdul Ali",
    "Xunique Labs",
  ],
  openGraph: {
    title: "Xunique Labs — Website Developer in Delhi | Web & Mobile App Development Studio",
    description:
      "Software drawn to spec, not shipped by guesswork. High-performance web applications, Flutter mobile apps, and custom digital platforms.",
    url: "https://xuniquelabs.com",
    siteName: "Xunique Labs",
    images: [
      {
        url: "/assets/logo-mark.png",
        width: 1200,
        height: 630,
        alt: "Xunique Labs — Website Developer in Delhi",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xunique Labs — Website Developer in Delhi",
    description: "Website & Mobile App Development Studio in Delhi.",
    images: ["/assets/logo-mark.png"],
  },
  alternates: {
    canonical: "https://xuniquelabs.com",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
