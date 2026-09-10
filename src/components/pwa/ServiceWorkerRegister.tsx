"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      const handleLoad = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for updates
            registration.addEventListener("updatefound", () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.addEventListener("statechange", () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    console.log("[PWA] New version available.");
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.warn("[PWA] Service Worker registration failed:", error);
          });
      };

      if (document.readyState === "complete") {
        handleLoad();
      } else {
        window.addEventListener("load", handleLoad);
        return () => window.removeEventListener("load", handleLoad);
      }
    }
  }, []);

  return null;
}
