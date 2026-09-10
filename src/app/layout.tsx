import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Lora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { BrandingProvider } from "@/providers/BrandingProvider";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://xuniquelabs.com"),
  applicationName: "Xunique Labs",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Xunique Labs",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: "w-xJRQJB0rJ45SCZvCgC5r8KSQoE2A5onnFx4TeoHno",
  },
  title: "Xunique Labs | Internal Client Management",
  description: "Unified client, project, financial, and team management for Xunique Labs",
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${lora.variable} ${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased selection:bg-accent/20 selection:text-foreground">
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('xunique_theme_preference');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (!storedTheme && prefersDark) || (storedTheme === 'system' && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <BrandingProvider>
                <ServiceWorkerRegister />
                {children}
              </BrandingProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
