"use client";

import { useEffect } from "react";

export function LandingInteractive() {
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
    };
  }, []);

  return null;
}
