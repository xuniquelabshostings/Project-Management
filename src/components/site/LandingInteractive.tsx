"use client";

import { useEffect } from "react";
import { getLocalCaseFiles, getLocalPlans } from "@/lib/mock-data";

function getFigureSvg(figureType: string, imageUrl?: string | null, title?: string) {
  if (figureType === "image" && imageUrl) {
    return `<img src="${imageUrl}" alt="${title || "Project"}" style="width:100%; height:100%; object-fit:cover; opacity:0.65;" />`;
  }
  if (figureType === "circle") {
    return `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><circle cx="120" cy="130" r="70" stroke="#0E2A47" stroke-width="1" fill="none"/><circle cx="280" cy="130" r="45" stroke="#0E2A47" stroke-width="1" fill="none"/></svg>`;
  }
  if (figureType === "cross") {
    return `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><path d="M200 50V210M120 130H280" stroke="#0E2A47" stroke-width="1.2" fill="none"/><circle cx="200" cy="130" r="70" stroke="#0E2A47" stroke-width="0.8" stroke-dasharray="4 4" fill="none"/><rect x="145" y="75" width="110" height="110" rx="4" stroke="#0E2A47" stroke-width="0.8" fill="none"/></svg>`;
  }
  if (figureType === "wave") {
    return `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><path d="M40 220V60M40 60L110 120L180 40L250 150L320 90L390 200" stroke="#0E2A47" stroke-width="1" fill="none"/></svg>`;
  }
  if (figureType === "blueprint") {
    return `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><rect x="50" y="40" width="300" height="180" stroke="#0E2A47" stroke-width="1" fill="none"/><path d="M50 90H350M150 90V220" stroke="#0E2A47" stroke-width="0.8"/></svg>`;
  }
  return `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><rect x="60" y="60" width="280" height="140" stroke="#0E2A47" stroke-width="1" fill="none"/><path d="M60 130H340" stroke="#0E2A47" stroke-width="1"/></svg>`;
}

function syncDynamicContent() {
  // 1. Sync Case Files (#work .work-grid)
  const workGrid = document.querySelector("#work .work-grid");
  if (workGrid) {
    const cases = getLocalCaseFiles().filter((c) => c.featured);
    if (cases.length > 0) {
      workGrid.innerHTML = cases
        .map(
          (c) => `
          <a class="case" href="${c.live_url}" target="_blank" rel="noopener">
            <div class="case-figure" aria-hidden="true">
              ${getFigureSvg(c.figure_type, c.image_url, c.title)}
            </div>
            <div class="case-top">
              <span class="case-tag mono">${c.case_code}</span>
              <span class="case-action mono">LIVE SITE ↗</span>
            </div>
            <div class="case-body">
              <h3>${c.title}</h3>
              <p>${c.description}</p>
              <div class="stack">${c.tags.map((t) => `<span>${t}</span>`).join("")}</div>
            </div>
          </a>
        `
        )
        .join("");
    }
  }

  // 2. Sync Development Plans (#pricing .pricing-grid)
  const pricingGrid = document.querySelector("#pricing .pricing-grid");
  if (pricingGrid) {
    const plans = getLocalPlans();
    if (plans.length > 0) {
      pricingGrid.innerHTML = plans
        .map((p) => {
          const isPopular = p.is_popular;
          const isCustom = p.is_custom_quote;
          const ribbonHtml = isPopular
            ? `<div class="pricing-ribbon">${p.popular_badge || "★ MOST POPULAR"}</div>`
            : "";
          const priceBoxHtml = isCustom
            ? `<div class="pricing-price-box"><div class="pricing-curr custom-curr">Custom Scope</div></div>`
            : `<div class="pricing-price-box">
                ${p.original_price ? `<span class="pricing-orig">${p.currency_symbol || "₹"}${p.original_price}</span>` : ""}
                <div class="pricing-curr">
                  <span class="curr-sym">${p.currency_symbol || "₹"}</span>${p.price}<span style="font-size:0.9rem; font-family:var(--sans, sans-serif); color:var(--text-dim-on-paper);">${p.price_period || "/-"}</span>
                </div>
              </div>`;

          const featuresHtml = p.features
            .map(
              (f) => `
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>${f}</span>
              </li>`
            )
            .join("");

          const waMsg =
            p.whatsapp_message ||
            `Hi Xunique Labs, I'm interested in the ${p.name} Plan (${
              isCustom ? "Custom Quote" : `${p.currency_symbol || "₹"}${p.price}${p.price_period || "/-"}`
            }, ${p.delivery_time}). Let's discuss scope and get started.`;
          const waLink = `https://wa.me/917458845252?text=${encodeURIComponent(waMsg)}`;

          return `
            <div class="pricing-card ${isPopular ? "popular" : ""} ${isCustom ? "custom" : ""}">
              ${ribbonHtml}
              <div class="pricing-card-header">
                <span class="pricing-num mono">${p.sheet_code}</span>
                <h3 class="pricing-title">${p.name}</h3>
                <div class="pricing-delivery mono">
                  <span>🕓 Delivery: ${p.delivery_time}</span>
                </div>
              </div>
              ${priceBoxHtml}
              <ul class="pricing-features">
                ${featuresHtml}
              </ul>
              <div class="pricing-footer">
                <a href="${waLink}" class="btn ${isPopular ? "btn-primary" : "btn-ghost"}" target="_blank" rel="noopener">${p.cta_text || "Book Now →"}</a>
              </div>
            </div>
          `;
        })
        .join("");
    }
  }
}

export function LandingInteractive() {
  useEffect(() => {
    // 0. Dynamic sync from stored case files and development plans
    syncDynamicContent();
    const handleContentUpdate = () => syncDynamicContent();
    window.addEventListener("xunique_site_content_updated", handleContentUpdate);

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

    // 2. Scroll reveal observer with support for grid stagger
    const revealEls = document.querySelectorAll(
      ".reveal, .stage, .schedule, .process, .sheet-grid, .work-grid, .pricing-grid, .faq-grid, .contact-channels, .contact-card, .contact-form-panel"
    );
    const revealIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            // If the schedule container is revealed, make sure all child stages are marked in
            if (entry.target.classList.contains("schedule") || entry.target.classList.contains("process")) {
              entry.target.querySelectorAll(".stage").forEach((s, idx) => {
                setTimeout(() => s.classList.add("in"), idx * 120);
              });
            }
            revealIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealIo.observe(el));

    // 2b. Header scroll elevation effect
    const navWrap = document.querySelector(".nav-wrap");
    const handleWindowScroll = () => {
      if (!navWrap) return;
      if (window.scrollY > 30) {
        navWrap.classList.add("scrolled");
      } else {
        navWrap.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    handleWindowScroll();

    // 2c. Hero panel interactive subtle 3D tilt on desktop
    const heroPanel = document.querySelector(".hero-panel") as HTMLElement;
    let heroRafId: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const animateHeroTilt = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      if (heroPanel) {
        const heroImg = heroPanel.querySelector("img");
        if (heroImg) {
          heroImg.style.transform = `perspective(1000px) rotateY(${currentX * 6}deg) rotateX(${-currentY * 6}deg) scale(1.02)`;
        }
      }
      heroRafId = requestAnimationFrame(animateHeroTilt);
    };

    const handleHeroMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 900) return;
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 2;
      targetY = (e.clientY / innerHeight - 0.5) * 2;
    };

    const handleHeroMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const heroSection = document.querySelector(".hero");
    if (heroSection) {
      heroSection.addEventListener("mousemove", handleHeroMouseMove as EventListener, { passive: true });
      heroSection.addEventListener("mouseleave", handleHeroMouseLeave);
      heroRafId = requestAnimationFrame(animateHeroTilt);
    }

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
      window.removeEventListener("scroll", handleWindowScroll);
      if (heroSection) {
        heroSection.removeEventListener("mousemove", handleHeroMouseMove as EventListener);
        heroSection.removeEventListener("mouseleave", handleHeroMouseLeave);
      }
      if (heroRafId) cancelAnimationFrame(heroRafId);
      if (clockInterval) clearInterval(clockInterval);
      if (contactForm) contactForm.removeEventListener("submit", handleContactSubmit);
      window.removeEventListener("xunique_site_content_updated", handleContentUpdate);
    };
  }, []);

  return null;
}
