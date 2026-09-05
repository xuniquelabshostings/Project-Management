"use client";

import React, { useEffect } from "react";
import { LANDING_HTML, LANDING_SCHEMA } from "./landing-content";

export function LandingPage() {
  useEffect(() => {
    // 1. Mobile nav toggle
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");

    const handleNavToggle = () => {
      if (!navLinks || !navToggle) return;
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    };

    const handleNavLinkClick = () => {
      if (!navLinks || !navToggle) return;
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    if (navToggle) {
      navToggle.addEventListener("click", handleNavToggle);
    }

    const anchorLinks = navLinks?.querySelectorAll("a");
    anchorLinks?.forEach((a) => a.addEventListener("click", handleNavLinkClick));

    // 2. Scroll reveal observer
    const revealEls = document.querySelectorAll(".reveal, .stage");
    const revealIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealIo.observe(el));

    // 3. Count-up stats observer
    const counters = document.querySelectorAll("[data-count]");
    const countIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const target = parseFloat(el.dataset.count || "0");
          const decimals = parseInt(el.dataset.decimal || "0", 10);
          const duration = 1400;
          const start = performance.now();

          function tick(now: number) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = target * eased;
            el.textContent = decimals ? val.toFixed(decimals) : String(Math.round(val));
            if (p < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
          countIo.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => countIo.observe(el));

    // 4. Live user clock with timezone
    let clockInterval: NodeJS.Timeout | null = null;
    const timeEl = document.getElementById("userCurrentTime");
    const tzEl = document.getElementById("userTimezone");

    if (timeEl && tzEl) {
      const getTzAbbr = (d: Date) => {
        try {
          const parts = new Intl.DateTimeFormat([], { timeZoneName: "short" }).formatToParts(d);
          const tzPart = parts.find((p) => p.type === "timeZoneName");
          if (tzPart && tzPart.value) return tzPart.value;
        } catch (_) {}

        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz) return tz;
        } catch (_) {}

        const offset = -d.getTimezoneOffset();
        const sign = offset >= 0 ? "+" : "-";
        const hrs = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
        const mins = String(Math.abs(offset) % 60).padStart(2, "0");
        return `GMT${sign}${hrs}:${mins}`;
      };

      const updateTime = () => {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        tzEl.textContent = getTzAbbr(now);
      };

      updateTime();
      clockInterval = setInterval(updateTime, 1000);
    }

    // 5. Contact Form WhatsApp Dispatch
    const contactForm = document.getElementById("projectContactForm");
    const handleContactSubmit = (e: Event) => {
      e.preventDefault();
      const name = (document.getElementById("contactName") as HTMLInputElement)?.value?.trim() || "";
      const email = (document.getElementById("contactEmail") as HTMLInputElement)?.value?.trim() || "";
      const phone = (document.getElementById("contactPhone") as HTMLInputElement)?.value?.trim() || "Not specified";
      const discipline = (document.getElementById("projectType") as HTMLSelectElement)?.value || "";
      const budget = (document.getElementById("projectBudget") as HTMLSelectElement)?.value || "";
      const message = (document.getElementById("contactMessage") as HTMLTextAreaElement)?.value?.trim() || "";

      const waText = `*New Project Inquiry — Xunique Labs*
----------------------------------------
*Name:* ${name}
*Email:* ${email}
*Phone/WhatsApp:* ${phone}
*Discipline:* ${discipline}
*Estimated Budget:* ${budget}

*Project Summary & Scope:*
${message}
----------------------------------------
_Dispatched via Xunique Labs Studio Contact Desk_`;

      const waUrl = `https://wa.me/917458845252?text=${encodeURIComponent(waText)}`;
      const submitBtn = contactForm?.querySelector(".form-submit-btn") as HTMLElement;

      if (submitBtn) {
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = "<span>✓ Opening WhatsApp...</span>";
        submitBtn.style.opacity = "0.9";

        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
        if (isMobile) {
          window.location.href = waUrl;
        } else {
          window.open(waUrl, "_blank", "noopener,noreferrer");
        }

        setTimeout(() => {
          submitBtn.innerHTML = originalHtml;
          submitBtn.style.opacity = "1";
        }, 3500);
      }
    };

    if (contactForm) {
      contactForm.addEventListener("submit", handleContactSubmit);
    }

    // Cleanup
    return () => {
      if (navToggle) navToggle.removeEventListener("click", handleNavToggle);
      anchorLinks?.forEach((a) => a.removeEventListener("click", handleNavLinkClick));
      revealIo.disconnect();
      countIo.disconnect();
      if (clockInterval) clearInterval(clockInterval);
      if (contactForm) contactForm.removeEventListener("submit", handleContactSubmit);
    };
  }, []);

  return (
    <div className="xunique-landing-root">
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
      />

      {/* Render Website Body */}
      <div dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />
    </div>
  );
}
