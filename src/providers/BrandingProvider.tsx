"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface AppBranding {
  companyName: string;
  tagline: string;
  logoUrl: string | null;
  signatureUrl: string | null;
  signatoryName: string;
  addressLine1: string;
  addressLine2: string;
  email: string;
  phone: string;
  taxId: string;
}

export const DEFAULT_BRANDING: AppBranding = {
  companyName: "Xunique Labs",
  tagline: "Design & Engineering Studio",
  logoUrl: "/assets/logo-mark-nobg.png",
  signatureUrl: null,
  signatoryName: "Authorized Signatory",
  addressLine1: "Bharat Nagar, New Friends Colony",
  addressLine2: "New Delhi, Delhi, 110025",
  email: "support@xuniquelabs.com",
  phone: "+91 (80) 4920-1100",
  taxId: "29AABCU9603R1ZM",
};

const BRANDING_STORAGE_KEY = "xunique_app_branding";

interface BrandingContextType {
  branding: AppBranding;
  updateBranding: (updates: Partial<AppBranding>) => void;
  resetBranding: () => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<AppBranding>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(BRANDING_STORAGE_KEY);
        if (stored) {
          return { ...DEFAULT_BRANDING, ...JSON.parse(stored) };
        }
      } catch (e) {
        console.warn("Failed to load custom branding from storage:", e);
      }
    }
    return DEFAULT_BRANDING;
  });

  const updateBranding = (updates: Partial<AppBranding>) => {
    setBranding((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to save custom branding:", e);
      }
      return next;
    });
  };

  const resetBranding = () => {
    setBranding(DEFAULT_BRANDING);
    try {
      localStorage.removeItem(BRANDING_STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to reset branding:", e);
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}
