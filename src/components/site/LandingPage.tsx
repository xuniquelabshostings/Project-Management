import React from "react";
import { LANDING_HTML } from "./landing-content";
import { LandingInteractive } from "./LandingInteractive";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const processedHtml = basePath
  ? LANDING_HTML.replaceAll('src="/assets/', `src="${basePath}/assets/`)
  : LANDING_HTML;

export function LandingPage() {
  return (
    <div className="xunique-landing-root" suppressHydrationWarning>
      {/* Render Website Body */}
      <div
        dangerouslySetInnerHTML={{ __html: processedHtml }}
        suppressHydrationWarning
      />

      {/* Interactive client-side effects & observers */}
      <LandingInteractive />
    </div>
  );
}
