import React from "react";
import { LANDING_HTML } from "./landing-content";
import { LandingInteractive } from "./LandingInteractive";

export function LandingPage() {
  return (
    <div className="xunique-landing-root" suppressHydrationWarning>
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
