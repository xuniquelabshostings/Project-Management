import React from "react";
import { LANDING_HTML, LANDING_SCHEMA } from "./landing-content";
import { LandingInteractive } from "./LandingInteractive";

export function LandingPage() {
  return (
    <div className="xunique-landing-root" suppressHydrationWarning>
      {/* External CSS and Google Fonts */}
      <link rel="stylesheet" href="/landing.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: LANDING_SCHEMA }}
        suppressHydrationWarning
      />

      {/* Render Website Body */}
      <div
        dangerouslySetInnerHTML={{ __html: LANDING_HTML }}
        suppressHydrationWarning
      />

      {/* Interactive client-side effects & observers */}
      <LandingInteractive />
    </div>
  );
}
