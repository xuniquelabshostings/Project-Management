export const LANDING_SCHEMA = `{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["ProfessionalService", "LocalBusiness"],
      "@id": "https://xuniquelabs.com/#organization",
      "name": "Xunique Labs — Website Development Services, App Development & Digital Marketing in Delhi",
      "alternateName": [
        "Xunique Labs",
        "XuniqueLabs",
        "Website Development Services in Delhi - Xunique Labs",
        "Web Design Company Delhi",
        "App Development in Delhi - Xunique Labs",
        "Digital Marketing Agency Delhi",
        "Website Developers in Delhi"
      ],
      "url": "https://xuniquelabs.com/",
      "logo": "https://xuniquelabs.com/assets/logo-mark.png",
      "image": "https://xuniquelabs.com/assets/logo-mark.png",
      "description": "Xunique Labs is a premier agency for website development services in Delhi, custom web design, mobile app development (iOS & Android), and ROI-driven digital marketing. Founded by Sayyed Abdul Ali, our expert team builds high-performance Next.js web applications, Flutter mobile apps, e-commerce platforms, and scalable digital solutions.",
      "telephone": "+917458845252",
      "email": "xuniquelabs@gmail.com",
      "founder": {
        "@type": "Person",
        "@id": "https://xuniquelabs.com/#founder",
        "name": "Sayyed Abdul Ali",
        "alternateName": "Sayyed Nawab Abdul Ali",
        "jobTitle": "Lead Software Engineer & Founder",
        "url": "https://xuniquelabs.com/",
        "knowsAbout": [
          "Website Development Services in Delhi",
          "Web Design & UI/UX",
          "Mobile App Development in Delhi",
          "Digital Marketing & SEO",
          "Flutter & React Native",
          "Next.js & React Development",
          "E-Commerce Website Development",
          "Full-Stack Web Engineering",
          "Search Engine Optimization (SEO)"
        ]
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Delhi",
        "addressRegion": "Delhi",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 28.5662016,
        "longitude": 77.2708634
      },
      "hasMap": "https://maps.app.goo.gl/QW1TKXBxYsGVq1t28",
      "sameAs": [
        "https://www.instagram.com/xuniquelabs"
      ],
      "areaServed": [
        { "@type": "City", "name": "Delhi" },
        { "@type": "City", "name": "New Delhi" },
        { "@type": "City", "name": "Noida" },
        { "@type": "City", "name": "Gurugram" },
        { "@type": "Country", "name": "India" }
      ],
      "priceRange": "₹1,999 - ₹50,000+",
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "20:00"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Website Development, Mobile App & Digital Marketing Services in Delhi",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Website Development Services in Delhi",
              "description": "High-performance responsive websites, business web platforms, landing pages, and Next.js applications by top website developers in Delhi."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "App Development in Delhi",
              "description": "Cross-platform iOS and Android mobile app development using Flutter and React Native with cloud backend integration."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Web Design & UI/UX Services",
              "description": "Bespoke user interface and user experience design, wireframing, design systems, and responsive web design."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Digital Marketing & SEO Services in Delhi",
              "description": "Search engine optimization (SEO), Google & Meta Ads, performance marketing, content strategy, and conversion rate optimization."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "E-Commerce Website Development in Delhi",
              "description": "Custom e-commerce store design and development, payment gateways, inventory sync, and conversion-optimized storefronts."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Custom Software & MVP Development",
              "description": "Scalable web application development, custom APIs, startup MVPs, and cloud architecture engineering."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Maintenance & Support Services",
              "description": "Ongoing monitoring, security patches, performance optimization, and dedicated support."
            }
          }
        ]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://xuniquelabs.com/#website",
      "url": "https://xuniquelabs.com/",
      "name": "Xunique Labs",
      "description": "Website Development Services, App Development & Digital Marketing in Delhi",
      "publisher": { "@id": "https://xuniquelabs.com/#organization" },
      "inLanguage": "en-IN"
    },
    {
      "@type": "FAQPage",
      "@id": "https://xuniquelabs.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Looking for premier website development services in Delhi? How does Xunique Labs deliver?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Xunique Labs is a leading provider of website development services in Delhi. Unlike traditional agencies using heavy pre-made templates, our senior website developers handcrafted clean, responsive websites, Next.js web applications, and digital platforms optimized to load in under 1 second and rank at the top of Google search results."
          }
        },
        {
          "@type": "Question",
          "name": "Why hire Xunique Labs website developers in Delhi over standard agencies?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "At Xunique Labs, your software is architected directly by senior website developers and designers without intermediary managers. We guarantee custom code, 100/100 Core Web Vitals, modern web design, zero bloatware, and complete source code ownership."
          }
        },
        {
          "@type": "Question",
          "name": "What is the cost of website development and web design in Delhi?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We provide transparent, upfront pricing: Starter single-page websites start at ₹1,999/- (1–2 days delivery), 5-page Business Websites with custom web design are ₹7,999/-, and full E-Commerce Stores are ₹9,999/-. For custom web applications and mobile apps, we provide milestone-based quotes."
          }
        },
        {
          "@type": "Question",
          "name": "Do you provide mobile app development and digital marketing in Delhi along with web design?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Xunique Labs is a full-service web, mobile app development, and digital marketing studio in Delhi. We engineer high-performance cross-platform mobile apps for iOS and Android, and run data-driven SEO and performance marketing campaigns."
          }
        },
        {
          "@type": "Question",
          "name": "How do your website developers ensure our site ranks high on Google for relevant search keywords?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Every website includes complete on-page technical SEO: semantic HTML5, Schema.org JSON-LD structured data, Core Web Vitals performance optimization, mobile responsiveness, XML sitemaps, Open Graph tags, and keyword-focused content hierarchy to maximize search visibility."
          }
        },
        {
          "@type": "Question",
          "name": "How to get started with website development services in Delhi with Xunique Labs?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can submit your project brief on xuniquelabs.com, email us at support@xuniquelabs.com or xuniquelabs@gmail.com, or reach out on WhatsApp at +91 74588 45252 for instant project scoping and quotation."
          }
        }
      ]
    }
  ]
}`;

export const LANDING_HTML = `<header>
  <div class="top-strip">
    <div class="top-strip-inner">
      <div class="top-strip-left">
        <a href="tel:+917458845252" class="top-strip-link" title="Call Xunique Labs">
          <svg class="top-strip-icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          <span>+91 7458845252</span>
        </a>
      </div>
      <div class="top-strip-right">
        <div class="top-strip-time" id="userTimeContainer">
          <svg class="top-strip-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span class="top-strip-label">Local Time:</span>
          <span class="top-strip-val" id="userCurrentTime">--:--:--</span>
          <span class="top-strip-dot"></span>
          <span class="top-strip-tz" id="userTimezone">--</span>
        </div>
      </div>
    </div>
  </div>
  <div class="nav-wrap">
    <nav class="nav">
      <a href="#top" class="logo" aria-label="Xunique Labs — Website Development Services in Delhi">
        <span class="mark">
          <img src="/assets/logo-mark-nobg.png" alt="Xunique Labs — Website Development Services &amp; App Development in Delhi" loading="eager">
        </span>
      </a>
      <ul class="nav-links" id="navLinks">
        <li><a href="#services">Services</a></li>
        <li><a href="#work">Work</a></li>
        <li><a href="#process">Process</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#faq">FAQ</a></li>
        <li><a href="#contact">Contact</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="#contact" class="nav-cta">Start a Project</a></li>
      </ul>
      <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </nav>
  </div>
</header>

<main id="top">

  <!-- HERO -->
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy reveal">
        <div class="eyebrow">Website Development Services in Delhi • Web Design &amp; App Development Studio</div>
        <h1>Software, drawn <em>to spec</em> — not shipped by guesswork.</h1>
        <p><strong>Xunique Labs</strong> provides premier <strong>website development services in Delhi</strong>, bespoke <strong>web design</strong>, <strong>digital marketing</strong>, and high-performance <strong>mobile app development in Delhi</strong>. Our expert <strong>website developers in Delhi</strong> engineer fast, scalable web platforms, e-commerce systems, and mobile applications drawn to spec.</p>
        <div class="hero-actions">
          <a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20looking%20to%20start%20a%20new%20software%20project.%20Let's%20discuss%20scope,%20timeline,%20and%20deliverables." target="_blank" rel="noopener" class="btn btn-primary">Start a Project →</a>
          <a href="#work" class="btn btn-ghost">See our Work</a>
        </div>
        <div class="hero-meta">
          <div><strong>120+</strong>Projects delivered</div>
          <div><strong>94%</strong>Client retention</div>
        </div>
      </div>

      <div class="hero-panel reveal">
        <img src="/assets/only%20x.png" alt="Xunique Labs — Web Design &amp; Website Developers in Delhi" loading="eager">
      </div>
    </div>
  </section>

  <!-- SERVICES -->
  <section id="services" class="services">
    <div class="wrap">
      <div class="section-head reveal">
        <div>
          <div class="eyebrow">Capabilities</div>
          <h2>Seven disciplines, one team</h2>
        </div>
        <p>Every engagement pulls from the same in-house team — no handoffs between agencies, no lost context between design, code, and growth.</p>
      </div>
    </div>

    <div class="wrap">
      <div class="sheet-grid reveal">

        <a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20inquiring%20about%20your%20Website%20Development%20Services%20in%20Delhi%20(SaaS,%20Web%20Applications,%20Dashboards).%20Let's%20discuss%20my%20project." target="_blank" rel="noopener" class="sheet">
          <span class="sheet-num mono">SHEET A-01</span>
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4" width="18" height="14" rx="1"/><path d="M3 8H21M7 4V8"/></svg></div>
          <h3>Website Development Services</h3>
          <p>Fast, maintainable, and SEO-optimized website development services in Delhi built on Next.js, React, and modern full-stack architectures.</p>
          <div class="sheet-scale">REV. 03 — WEB / SAAS / DASHBOARDS →</div>
        </a>

        <a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20inquiring%20about%20your%20Mobile%20App%20Development%20in%20Delhi%20(iOS,%20Android,%20Cross-Platform).%20Let's%20discuss%20my%20app." target="_blank" rel="noopener" class="sheet">
          <span class="sheet-num mono">SHEET A-02</span>
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18H13"/></svg></div>
          <h3>App Development in Delhi</h3>
          <p>Native-feel iOS and Android mobile app development in Delhi from a single codebase, built with Flutter and React Native for real-world speed.</p>
          <div class="sheet-scale">REV. 02 — iOS / ANDROID / CROSS-PLATFORM →</div>
        </a>

        <a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20inquiring%20about%20your%20Web%20Design%20%26%20UI/UX%20services%20(User%20Research,%20Wireframing,%20Design%20Systems).%20Let's%20discuss." target="_blank" rel="noopener" class="sheet">
          <span class="sheet-num mono">SHEET A-03</span>
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="M12 3V6M12 18V21M3 12H6M18 12H21"/></svg></div>
          <h3>Web Design &amp; UI/UX</h3>
          <p>Modern, responsive web design and intuitive UI/UX design systems engineered around conversions and seamless user journeys.</p>
          <div class="sheet-scale">REV. 04 — PRODUCT / RESEARCH / SYSTEMS →</div>
        </a>

        <a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20inquiring%20about%20your%20Digital%20Marketing%20services%20(SEO,%20Google%20Ads,%20Social%20Media,%20PPC,%20Growth).%20Let's%20discuss%20our%20campaign." target="_blank" rel="noopener" class="sheet">
          <span class="sheet-num mono">SHEET A-04</span>
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 20V10M18 20V4M6 20v-4"/><path d="M3 20h18"/><path d="M18 4l-4 4M18 4h-4M18 4v4"/></svg></div>
          <h3>Digital Marketing &amp; SEO</h3>
          <p>Data-driven search engine optimization (SEO), targeted Google &amp; Meta ad campaigns, and ROI-focused growth marketing to scale traffic and conversions.</p>
          <div class="sheet-scale">REV. 06 — SEO / ADS / PPC / GROWTH →</div>
        </a>

        <a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20inquiring%20about%20your%20E-Commerce%20Website%20Development%20Solutions%20(Storefronts,%20Payment%20Gateways,%20Catalog).%20Let's%20discuss%20my%20store." target="_blank" rel="noopener" class="sheet">
          <span class="sheet-num mono">SHEET A-05</span>
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 6H5L7.5 16H18L20 8H6.5"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg></div>
          <h3>E-Commerce Website Development</h3>
          <p>High-converting e-commerce website development in Delhi with secure payment gateways, catalog management, and fast checkout flows.</p>
          <div class="sheet-scale">REV. 01 — STOREFRONT / PAYMENTS / CATALOG →</div>
        </a>

        <a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20inquiring%20about%20your%20MVP%20%26%20Custom%20Software%20Development%20services%20(Fast%20Release,%20Validation,%20Scoping).%20Let's%20discuss." target="_blank" rel="noopener" class="sheet">
          <span class="sheet-num mono">SHEET A-06</span>
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 15L9 4L15 15L20 6"/><circle cx="9" cy="4" r="1.4"/><circle cx="20" cy="6" r="1.4"/></svg></div>
          <h3>MVP &amp; Custom Software</h3>
          <p>Custom software engineering and agile MVP development for startups and enterprises needing tailored cloud architectures.</p>
          <div class="sheet-scale">REV. 05 — SCOPE / VALIDATE / ITERATE →</div>
        </a>

        <a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20inquiring%20about%20your%20Maintenance%20%26%20Support%20services%20(Ongoing%20Monitoring,%20Patches,%20Updates).%20Let's%20discuss." target="_blank" rel="noopener" class="sheet">
          <span class="sheet-num mono">SHEET A-07</span>
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M14.7 6.3L17.7 9.3L9 18H6V15L14.7 6.3Z"/><path d="M13 8L16 11"/></svg></div>
          <h3>Maintenance &amp; Support</h3>
          <p>Ongoing monitoring, performance optimization, and dedicated support so your product keeps scaling seamlessly.</p>
          <div class="sheet-scale">REV. 07 — SLA / MONITORING / RELEASES →</div>
        </a>

      </div>
    </div>
  </section>

  <!-- PROCESS -->
  <section id="process" class="process">
    <div class="wrap">
      <div class="section-head reveal">
        <div>
          <div class="eyebrow">How we work</div>
          <h2>A fixed sequence, not a black box</h2>
        </div>
        <p>You always know which stage a project is in, what's due next, and who owns it.</p>
      </div>

      <div class="schedule reveal">
        <div class="stage" style="--fill:20%">
          <span class="stage-index mono">01</span>
          <h4>Discover</h4>
          <p>Requirements, users, constraints, and success metrics — documented before anything is designed.</p>
          <div class="stage-bar"><span></span></div>
        </div>
        <div class="stage" style="--fill:40%">
          <span class="stage-index mono">02</span>
          <h4>Design</h4>
          <p>Wireframes to high-fidelity screens, reviewed with you at each checkpoint, not just at the end.</p>
          <div class="stage-bar"><span></span></div>
        </div>
        <div class="stage" style="--fill:75%">
          <span class="stage-index mono">03</span>
          <h4>Develop</h4>
          <p>Build in focused agile sprints with a staging link you can click through at any point.</p>
          <div class="stage-bar"><span></span></div>
        </div>
        <div class="stage" style="--fill:90%">
          <span class="stage-index mono">04</span>
          <h4>Launch</h4>
          <p>QA pass, performance and security checks, then a coordinated go-live.</p>
          <div class="stage-bar"><span></span></div>
        </div>
        <div class="stage" style="--fill:100%">
          <span class="stage-index mono">05</span>
          <h4>Support</h4>
          <p>Monitoring and a direct line to the team that built it, for as long as you need us.</p>
          <div class="stage-bar"><span></span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- WORK -->
  <section id="work" class="work">
    <div class="wrap">
      <div class="section-head reveal">
        <div>
          <div class="eyebrow">Selected Work</div>
          <h2>Case files</h2>
        </div>
        <p>A sample of recent builds. Full case studies available on request.</p>
      </div>

      <div class="work-grid reveal">
        <a class="case" href="https://www.ourhomeindia.com/" target="_blank" rel="noopener">
          <div class="case-figure" aria-hidden="true">
            <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><rect x="60" y="60" width="280" height="140" stroke="#0E2A47" stroke-width="1" fill="none"/><path d="M60 130H340" stroke="#0E2A47" stroke-width="1"/></svg>
          </div>
          <div class="case-top">
            <span class="case-tag mono">CASE — PROP-01</span>
            <span class="case-action mono">LIVE SITE ↗</span>
          </div>
          <div class="case-body">
            <h3>OurHomeIndia</h3>
            <p>A pan-India real estate discovery platform — verified buy/rent listings, an advisor enquiry flow, and property-owner onboarding.</p>
            <div class="stack"><span>Web Platform</span><span>Property Search</span><span>Lead Gen</span></div>
          </div>
        </a>

        <a class="case" href="https://mrnothing.in/" target="_blank" rel="noopener">
          <div class="case-figure" aria-hidden="true">
            <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><circle cx="120" cy="130" r="70" stroke="#0E2A47" stroke-width="1" fill="none"/><circle cx="280" cy="130" r="45" stroke="#0E2A47" stroke-width="1" fill="none"/></svg>
          </div>
          <div class="case-top">
            <span class="case-tag mono">CASE — RTL-02</span>
            <span class="case-action mono">LIVE SITE ↗</span>
          </div>
          <div class="case-body">
            <h3>Mr.Nothing</h3>
            <p>A curated lifestyle showcase spanning clothing, electronics, and home &amp; kitchen essentials, built for fast browsing and discovery.</p>
            <div class="stack"><span>E-commerce</span><span>Catalog UI</span></div>
          </div>
        </a>

        <a class="case" href="https://freedomnex.com/" target="_blank" rel="noopener">
          <div class="case-figure" aria-hidden="true">
            <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><path d="M40 220V60M40 60L110 120L180 40L250 150L320 90L390 200" stroke="#0E2A47" stroke-width="1" fill="none"/></svg>
          </div>
          <div class="case-top">
            <span class="case-tag mono">CASE — EDU-03</span>
            <span class="case-action mono">LIVE SITE ↗</span>
          </div>
          <div class="case-body">
            <h3>FreedomNex</h3>
            <p>A digital learning sanctuary for classical Islamic philosophy — structured curricula, a wisdom anthology, and a reverent manuscript-inspired interface.</p>
            <div class="stack"><span>Content Platform</span><span>Learning Paths</span></div>
          </div>
        </a>
      </div>
    </div>
  </section>

  <!-- PRICING -->
  <section id="pricing" class="pricing">
    <div class="wrap">
      <div class="section-head reveal">
        <div>
          <div class="eyebrow">Affordable Plans</div>
          <h2>Best Pricing for Website Development in Delhi</h2>
        </div>
        <p>We strive to offer the most competitive prices in the web development industry. High-quality websites accessible to every business with full code ownership. <em>Note: Listed prices are service charges only.</em></p>
      </div>

      <div class="pricing-grid reveal">

        <!-- Plan 1: Starter -->
        <div class="pricing-card">
          <div class="pricing-card-header">
            <span class="pricing-num mono">SHEET P-01</span>
            <h3 class="pricing-title">Starter</h3>
            <div class="pricing-delivery mono">
              <span>🕓 Delivery: 1–2 Days</span>
            </div>
          </div>
          <div class="pricing-price-box">
            <span class="pricing-orig">₹2999</span>
            <div class="pricing-curr">
              <span class="curr-sym">₹</span>1,999/-
            </div>
          </div>
          <ul class="pricing-features">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>1 Premium Landing Page</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Mobile Friendly Design</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>SEO-Friendly Design</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Inquiry / Contact Form</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Social Media Integration</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Google Map Integration</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>WhatsApp Integration</span>
            </li>
          </ul>
          <div class="pricing-footer">
            <a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20interested%20in%20the%20Starter%20Plan%20(₹1,999/-%20Landing%20Page,%201–2%20Days).%20How%20can%20we%20proceed%20further%3F" class="btn btn-ghost" target="_blank" rel="noopener">Get Started →</a>
            <span class="pricing-note">* Service charges only</span>
          </div>
        </div>

        <!-- Plan 2: Business Website (Popular) -->
        <div class="pricing-card popular">
          <div class="pricing-ribbon">Popular</div>
          <div class="pricing-card-header">
            <span class="pricing-num mono">SHEET P-02</span>
            <h3 class="pricing-title">Business Website</h3>
            <div class="pricing-delivery mono">
              <span>🕓 Delivery: 3–5 Days</span>
            </div>
          </div>
          <div class="pricing-price-box">
            <span class="pricing-orig">₹12000</span>
            <div class="pricing-curr">
              <span class="curr-sym">₹</span>7,999/-
            </div>
          </div>
          <ul class="pricing-features">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Up to 5 Pages</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Blog Setup</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Mobile &amp; SEO Friendly Design</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Contact &amp; Inquiry Forms</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>WhatsApp &amp; Social Media Integration</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Google Map Integration</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>1 Month Free Maintenance</span>
            </li>
          </ul>
          <div class="pricing-footer">
            <a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20interested%20in%20the%20Business%20Website%20Plan%20(₹7,999/-%20Up%20to%205%20Pages,%203–5%20Days).%20Let's%20discuss%20and%20book%20this%20project." class="btn btn-primary" target="_blank" rel="noopener">Book Now →</a>
            <span class="pricing-note">* Service charges only</span>
          </div>
        </div>

        <!-- Plan 3: E-Commerce Store -->
        <div class="pricing-card">
          <div class="pricing-card-header">
            <span class="pricing-num mono">SHEET P-03</span>
            <h3 class="pricing-title">E-Commerce Store</h3>
            <div class="pricing-delivery mono">
              <span>🕓 Delivery: 7–10 Days</span>
            </div>
          </div>
          <div class="pricing-price-box">
            <span class="pricing-orig">₹25000</span>
            <div class="pricing-curr">
              <span class="curr-sym">₹</span>9,999/-
            </div>
          </div>
          <ul class="pricing-features">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>WooCommerce Store Setup</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Payment Gateway &amp; Shipping Setup</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Order Dashboard</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>WhatsApp &amp; Social Media Integration</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Mobile &amp; SEO Friendly Design</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Contact &amp; Inquiry Forms</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Google Map Integration</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Popup Offers + CTA Sections</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>1 Month Free Maintenance</span>
            </li>
          </ul>
          <div class="pricing-footer">
            <a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20interested%20in%20the%20E-Commerce%20Store%20Plan%20(₹9,999/-%20WooCommerce%20%26%20Payments,%207–10%20Days).%20Let's%20launch%20my%20store." class="btn btn-ghost" target="_blank" rel="noopener">Launch Store →</a>
            <span class="pricing-note">* Service charges only</span>
          </div>
        </div>

        <!-- Plan 4: Custom / Large Scale App -->
        <div class="pricing-card custom">
          <div class="pricing-card-header">
            <span class="pricing-num mono">SHEET P-04</span>
            <h3 class="pricing-title">Custom Application</h3>
            <div class="pricing-delivery mono">
              <span>🕓 Delivery: Milestone-Based</span>
            </div>
          </div>
          <div class="pricing-price-box">
            <span class="pricing-orig">Flexible Scope</span>
            <div class="pricing-curr custom-curr">
              Negotiable
            </div>
          </div>
          <ul class="pricing-features">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Custom Full-Stack Web &amp; Mobile App</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Scalable Cloud Architecture &amp; APIs</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Custom UI/UX Design System</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Database Design &amp; Complex Logic</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Third-Party &amp; Custom AI Integrations</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Agile Sprints &amp; Phased Budgeting</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Full Source Code Ownership</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Dedicated Support &amp; SLA Options</span>
            </li>
          </ul>
          <div class="pricing-footer">
            <a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20looking%20for%20a%20Custom%20Large-Scale%20Application%20Plan%20(Full-Stack%20Web/Mobile).%20Let's%20discuss%20our%20project%20scope,%20milestones,%20and%20negotiate%20pricing." class="btn btn-ghost" target="_blank" rel="noopener">Discuss Project →</a>
            <span class="pricing-note">* Service charges only</span>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- SPEC / STATS -->
  <section class="spec" id="about">
    <div class="wrap">
      <div class="section-head reveal">
        <div>
          <div class="eyebrow">Track Record</div>
          <h2>Specification sheet</h2>
        </div>
        <p>Numbers we track internally on every engagement, not just the ones that look good on a landing page.</p>
      </div>

      <div class="spec-table reveal">
        <div class="spec-row">
          <div class="spec-label">Projects delivered since 2019</div>
          <div class="spec-value"><span class="num" data-count="120">0</span><span class="unit">+</span></div>
        </div>
        <div class="spec-row">
          <div class="spec-label">Average time to first launch</div>
          <div class="spec-value"><span class="num" data-count="8">0</span><span class="unit">weeks</span></div>
        </div>
        <div class="spec-row">
          <div class="spec-label">Client retention past year one</div>
          <div class="spec-value"><span class="num" data-count="94">0</span><span class="unit">%</span></div>
        </div>
        <div class="spec-row">
          <div class="spec-label">Median production uptime</div>
          <div class="spec-value"><span class="num" data-count="99.9" data-decimal="1">0</span><span class="unit">%</span></div>
        </div>
      </div>
    </div>
  </section>


  <!-- STACK MARQUEE -->
  <div class="stack-strip" aria-hidden="true">
    <div class="marquee" id="marquee">
      <span>REACT</span><span>NEXT.JS</span><span>FLUTTER</span><span>NODE.JS</span><span>POSTGRESQL</span><span>FIREBASE</span><span>FASTAPI</span><span>TYPESCRIPT</span><span>STRIPE</span><span>AWS</span>
      <span>REACT</span><span>NEXT.JS</span><span>FLUTTER</span><span>NODE.JS</span><span>POSTGRESQL</span><span>FIREBASE</span><span>FASTAPI</span><span>TYPESCRIPT</span><span>STRIPE</span><span>AWS</span>
    </div>
  </div>

  <!-- FAQ SECTION -->
  <section class="faq-section" id="faq">
    <div class="wrap">
      <div class="section-head reveal">
        <div>
          <div class="eyebrow">Technical Briefs &amp; Queries</div>
          <h2>Frequently Asked Questions</h2>
        </div>
        <p>Direct answers regarding website development services, mobile app development in Delhi, pricing, and project workflows with Xunique Labs.</p>
      </div>

      <div class="faq-grid reveal">
        <div class="faq-item">
          <h3 class="faq-q"><span class="faq-q-num mono">01</span> Looking for premier website development services in Delhi? How does Xunique Labs deliver?</h3>
          <p class="faq-a"><strong>Xunique Labs</strong> is a leading provider of <strong>website development services in Delhi</strong>. Unlike typical agencies that outsource or use heavy drag-and-drop templates, our senior website developers handcraft custom-coded, responsive websites, Next.js web applications, and digital platforms built to load in milliseconds and rank high on search engines.</p>
        </div>

        <div class="faq-item">
          <h3 class="faq-q"><span class="faq-q-num mono">02</span> Why choose Xunique Labs website developers in Delhi over standard agencies?</h3>
          <p class="faq-a">At <strong>Xunique Labs</strong>, your project is architected and built directly by senior <strong>website developers in Delhi</strong> without intermediary account managers or bloated code. We deliver custom-coded solutions with zero unnecessary dependencies, guaranteed sub-second loading speeds, and full source code ownership.</p>
        </div>

        <div class="faq-item">
          <h3 class="faq-q"><span class="faq-q-num mono">03</span> What is the cost of website development and web design in Delhi?</h3>
          <p class="faq-a">We believe in transparent, honest pricing: Starter landing pages start at <strong>₹1,999/-</strong> (1–2 days delivery), multi-page Business Websites with custom web design are <strong>₹7,999/-</strong>, and full E-Commerce Stores are <strong>₹9,999/-</strong>. For custom SaaS, enterprise dashboards, and mobile applications, we provide milestone-based quotes.</p>
        </div>

        <div class="faq-item">
          <h3 class="faq-q"><span class="faq-q-num mono">04</span> Do you provide mobile app development in Delhi alongside web design?</h3>
          <p class="faq-a">Yes. Xunique Labs specializes in comprehensive <strong>mobile app development in Delhi</strong> and bespoke web design. We engineer high-performance cross-platform mobile apps for Android and iOS using Flutter and React Native, paired with robust backend architectures (Node.js, Firebase, PostgreSQL, FastAPI).</p>
        </div>

        <div class="faq-item">
          <h3 class="faq-q"><span class="faq-q-num mono">05</span> How do your website developers ensure our site ranks on Google for search keywords?</h3>
          <p class="faq-a">Every build includes technical on-page SEO: clean semantic HTML5, Schema.org JSON-LD structured data, Core Web Vitals optimization, responsive mobile layout, Open Graph social metadata, and automated sitemap generation to give you the highest competitive edge on search results.</p>
        </div>

        <div class="faq-item">
          <h3 class="faq-q"><span class="faq-q-num mono">06</span> How can we start a project or hire website developers in Delhi with Xunique Labs?</h3>
          <p class="faq-a">Submit your inquiry via our project brief form below, dispatch an email to <a href="mailto:support@xuniquelabs.com" style="color:var(--brass); text-decoration:underline;">support@xuniquelabs.com</a>, or message us directly on WhatsApp at <a href="https://wa.me/917458845252" target="_blank" rel="noopener" style="color:var(--brass); text-decoration:underline;">+91 74588 45252</a> for immediate scoping.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CONTACT US SECTION -->
  <section class="contact-section" id="contact">
    <div class="wrap">
      <div class="section-head reveal">
        <div>
          <div class="eyebrow">Transmission Desk</div>
          <h2>Contact our studio</h2>
        </div>
        <p>Tell us what you're building. We review incoming functional specs, designs, and inquiries with an engineer's eye and respond within 24 hours.</p>
      </div>

      <div class="contact-layout reveal">
        <!-- Studio Dispatch Details -->
        <div class="contact-info-panel">
          <div class="contact-card">
            <span class="mono contact-card-label">DIRECT DISPATCH</span>
            <h3>Connect with our leads</h3>
            <p>Skip the account managers. You'll speak directly with senior engineers and product designers who will architect and deliver your software.</p>

            <div class="contact-channels">
              <a href="mailto:support@xuniquelabs.com" class="channel-item">
                <div class="channel-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div class="channel-text">
                  <span class="channel-title">Primary Support</span>
                  <span class="channel-value mono">support@xuniquelabs.com</span>
                </div>
              </a>

              <a href="mailto:xuniquelabs@gmail.com" class="channel-item">
                <div class="channel-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div class="channel-text">
                  <span class="channel-title">Direct Studio Email</span>
                  <span class="channel-value mono">xuniquelabs@gmail.com</span>
                </div>
              </a>

              <a href="mailto:sayyednawababdulali@gmail.com" class="channel-item">
                <div class="channel-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div class="channel-text">
                  <span class="channel-title">Engineering Lead</span>
                  <span class="channel-value mono">sayyednawababdulali@gmail.com</span>
                </div>
              </a>

              <a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20ready%20to%20build%20a%20project.%20Can%20we%20scope%20it%20out%20and%20discuss%20next%20steps%3F" target="_blank" rel="noopener" class="channel-item">
                <div class="channel-icon" style="color:#25D366;">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M17.507 14.307l-.009.075c-.244-.122-1.442-.712-1.666-.793-.223-.082-.386-.122-.549.122-.163.245-.63 1.018-.773 1.18-.143.164-.285.184-.529.062-.244-.123-1.03-.38-1.963-1.212-.726-.647-1.216-1.446-1.359-1.69-.143-.245-.015-.378.107-.5.11-.11.245-.285.367-.428.122-.143.163-.245.244-.408.082-.163.041-.306-.02-.428-.061-.123-.549-1.325-.753-1.815-.198-.478-.4-.413-.549-.42-.143-.008-.306-.01-.469-.01-.163 0-.428.061-.652.305-.224.245-.855.836-.855 2.039 0 1.203.876 2.364.998 2.528.122.163 1.723 2.631 4.173 3.69.583.251 1.038.401 1.393.514.585.186 1.118.16 1.539.097.47-.07 1.442-.59 1.645-1.161.204-.571.204-1.06.143-1.161-.061-.102-.224-.163-.469-.286zM12.02 20.082h-.008a8.04 8.04 0 01-4.103-1.127l-.294-.175-3.053.801.815-2.977-.192-.306a8.037 8.037 0 01-1.233-4.298c0-4.444 3.616-8.06 8.063-8.06 2.152 0 4.175.839 5.696 2.36 1.521 1.522 2.359 3.545 2.358 5.698 0 4.445-3.617 8.086-8.042 8.086zm6.757-14.821A9.516 9.516 0 0012.02 2.457c-5.275 0-9.568 4.292-9.57 9.57 0 1.685.44 3.33 1.277 4.781L2.25 21.75l5.068-1.329a9.55 9.55 0 004.697 1.229h.005c5.274 0 9.568-4.293 9.57-9.571 0-2.557-.996-4.96-2.813-6.818z"/></svg>
                </div>
                <div class="channel-text">
                  <span class="channel-title">Instant WhatsApp &amp; Call</span>
                  <span class="channel-value mono">+91 74588 45252</span>
                </div>
              </a>

              <a href="https://maps.app.goo.gl/QW1TKXBxYsGVq1t28" target="_blank" rel="noopener noreferrer" class="channel-item">
                <div class="channel-icon" style="color:var(--brass);">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div class="channel-text">
                  <span class="channel-title">Studio Location</span>
                  <span class="channel-value mono">Delhi Studio (Google Maps) ↗</span>
                </div>
              </a>

              <a href="https://www.instagram.com/xuniquelabs" target="_blank" rel="noopener noreferrer" class="channel-item">
                <div class="channel-icon" style="color:#E1306C;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </div>
                <div class="channel-text">
                  <span class="channel-title">Instagram</span>
                  <span class="channel-value mono">@xuniquelabs ↗</span>
                </div>
              </a>
            </div>

            <div class="contact-meta-strip">
              <div class="meta-badge">
                <span class="meta-dot"></span>
                <span>Guaranteed Initial Response: &lt; 24 Hours</span>
              </div>
            </div>
          </div>

          <!-- Studio Location & Interactive Google Map Card -->
          <div class="contact-card contact-map-card">
            <div class="map-card-header">
              <div>
                <span class="mono contact-card-label">STUDIO LOCATION</span>
                <h4 class="map-title">Xunique Labs — Delhi HQ</h4>
              </div>
              <a href="https://maps.app.goo.gl/QW1TKXBxYsGVq1t28" target="_blank" rel="noopener noreferrer" class="map-link-badge mono" title="Open in Google Maps">
                <span>View on Maps ↗</span>
              </a>
            </div>
            <div class="map-embed-frame">
              <iframe
                src="https://maps.google.com/maps?q=28.5662016,77.2708634&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
                width="100%"
                height="210"
                style="border:0; border-radius:4px; display:block;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Xunique Labs Google Maps Location"
              ></iframe>
            </div>
            <div class="map-card-footer">
              <span class="mono text-muted text-[11px]">📍 Delhi 110025, India • Coords: 28.5662° N, 77.2709° E</span>
              <a href="https://maps.app.goo.gl/QW1TKXBxYsGVq1t28" target="_blank" rel="noopener noreferrer" class="mono text-[11px] text-accent hover:underline">Directions ↗</a>
            </div>
          </div>
        </div>

        <!-- Project Specification Brief Form -->
        <div class="contact-form-panel">
          <form class="contact-form" id="projectContactForm">
            <div class="form-header">
              <span class="mono form-title-spec">PROJECT SPECIFICATION BRIEF</span>
              <span class="mono form-status-stamp">FORM REV 2.4</span>
            </div>

            <div class="form-row form-row-2">
              <div class="form-group">
                <label for="contactName" class="form-label mono">YOUR NAME *</label>
                <input type="text" id="contactName" name="name" class="form-input" placeholder="e.g. Alex Vance" required>
              </div>
              <div class="form-group">
                <label for="contactEmail" class="form-label mono">EMAIL ADDRESS *</label>
                <input type="email" id="contactEmail" name="email" class="form-input" placeholder="alex@company.com" required>
              </div>
            </div>

            <div class="form-row form-row-2">
              <div class="form-group">
                <label for="contactPhone" class="form-label mono">PHONE / WHATSAPP</label>
                <input type="tel" id="contactPhone" name="phone" class="form-input" placeholder="+1 (555) 000-0000">
              </div>
              <div class="form-group">
                <label for="projectType" class="form-label mono">PROJECT DISCIPLINE *</label>
                <select id="projectType" name="projectType" class="form-select" required>
                  <option value="Web Application">Web Application</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Digital Marketing & SEO">Digital Marketing &amp; SEO</option>
                  <option value="Full-Stack MVP">Full-Stack MVP</option>
                  <option value="Custom Software & API">Custom Software &amp; API</option>
                  <option value="Architecture & Code Audit">Architecture &amp; Code Audit</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="projectBudget" class="form-label mono">ESTIMATED BUDGET / TIER</label>
              <select id="projectBudget" name="budget" class="form-select">
                <option value="Starter Plan (₹1,999/- · Landing Page)">Starter Plan — ₹1,999/- (Landing Page, 1–2 Days)</option>
                <option value="Business Website (₹7,999/- · Up to 5 Pages)" selected>Business Website — ₹7,999/- (Up to 5 Pages, Popular)</option>
                <option value="E-Commerce Store (₹9,999/- · Online Store)">E-Commerce Store — ₹9,999/- (WooCommerce &amp; Payments)</option>
                <option value="Custom Application (Negotiable · Full-Stack/Scale)">Custom Application — Negotiable (Full-Stack Web/Mobile)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="contactMessage" class="form-label mono">PROJECT SUMMARY / SCOPE DETAILS *</label>
              <textarea id="contactMessage" name="message" class="form-textarea" rows="4" placeholder="Describe the problem, target audience, core features, timeline expectations, or links to references/Figma..." required></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary form-submit-btn" style="background:#25D366; border-color:#25D366; color:#FFFFFF;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M17.507 14.307l-.009.075c-.244-.122-1.442-.712-1.666-.793-.223-.082-.386-.122-.549.122-.163.245-.63 1.018-.773 1.18-.143.164-.285.184-.529.062-.244-.123-1.03-.38-1.963-1.212-.726-.647-1.216-1.446-1.359-1.69-.143-.245-.015-.378.107-.5.11-.11.245-.285.367-.428.122-.143.163-.245.244-.408.082-.163.041-.306-.02-.428-.061-.123-.549-1.325-.753-1.815-.198-.478-.4-.413-.549-.42-.143-.008-.306-.01-.469-.01-.163 0-.428.061-.652.305-.224.245-.855.836-.855 2.039 0 1.203.876 2.364.998 2.528.122.163 1.723 2.631 4.173 3.69.583.251 1.038.401 1.393.514.585.186 1.118.16 1.539.097.47-.07 1.442-.59 1.645-1.161.204-.571.204-1.06.143-1.161-.061-.102-.224-.163-.469-.286zM12.02 20.082h-.008a8.04 8.04 0 01-4.103-1.127l-.294-.175-3.053.801.815-2.977-.192-.306a8.037 8.037 0 01-1.233-4.298c0-4.444 3.616-8.06 8.063-8.06 2.152 0 4.175.839 5.696 2.36 1.521 1.522 2.359 3.545 2.358 5.698 0 4.445-3.617 8.086-8.042 8.086zm6.757-14.821A9.516 9.516 0 0012.02 2.457c-5.275 0-9.568 4.292-9.57 9.57 0 1.685.44 3.33 1.277 4.781L2.25 21.75l5.068-1.329a9.55 9.55 0 004.697 1.229h.005c5.274 0 9.568-4.293 9.57-9.571 0-2.557-.996-4.96-2.813-6.818z"/></svg>
                <span>Submit</span>
              </button>
              <a href="mailto:support@xuniquelabs.com" class="btn btn-ghost form-email-btn">
                <span>Email</span>
              </a>
            </div>
            <div class="form-notice mono">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>Transmissions are confidential. NDAs available prior to technical scoping.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>

</main>

<footer>
  <div class="wrap">
    <div class="foot-logo">
      <span class="mark mark-plaque">
        <img src="/assets/logo-mark-nobg.png" alt="Xunique Labs — Website Development Services in Delhi" loading="lazy">
      </span>
    </div>
  </div>

  <div class="titleblock">
    <div class="tb-cell">
      <span class="lbl mono">STUDIO</span>
      <p>Xunique Labs provides leading website development services in Delhi, bespoke web design, and cross-platform mobile app development. Our team of expert website developers in Delhi builds high-speed, scalable digital solutions with architectural precision.</p>
    </div>
    <div class="tb-cell">
      <span class="lbl mono">SITE MAP</span>
      <ul>
        <li><a href="#services">Services</a></li>
        <li><a href="#work">Work</a></li>
        <li><a href="#process">Process</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#faq">FAQ</a></li>
        <li><a href="#contact">Contact</a></li>
        <li><a href="/blog">Blog</a></li>
      </ul>
    </div>
    <div class="tb-cell">
      <span class="lbl mono">CUSTOMER SUPPORT</span>
      <ul>
        <li><a href="mailto:support@xuniquelabs.com">support@xuniquelabs.com</a></li>
        <li><a href="mailto:xuniquelabs@gmail.com">xuniquelabs@gmail.com</a></li>
        <li><a href="mailto:sayyednawababdulali@gmail.com">sayyednawababdulali@gmail.com</a></li>
        <li><a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I%20have%20an%20inquiry%20regarding%20customer%20support%20and%20services." target="_blank" rel="noopener">WhatsApp — +91 74588 45252</a></li>
        <li><a href="https://maps.app.goo.gl/QW1TKXBxYsGVq1t28" target="_blank" rel="noopener noreferrer" style="color:var(--brass); text-decoration:underline;">📍 Google Maps — Delhi Studio ↗</a></li>
        <li><a href="https://www.instagram.com/xuniquelabs" target="_blank" rel="noopener noreferrer">Instagram — @xuniquelabs ↗</a></li>
      </ul>
    </div>
     
  </div>

  <div class="subfoot">
    <span>© 2026 XUNIQUE LABS. ALL RIGHTS RESERVED.</span>
    <span>SCALE — NOT TO SCALE</span>
  </div>
</footer>

<!-- FLOATING WHATSAPP BUTTON -->
<a href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20interested%20in%20discussing%20a%20new%20project%20with%20your%20studio." target="_blank" rel="noopener noreferrer" class="whatsapp-float" aria-label="Chat with Xunique Labs on WhatsApp">
  <span class="whatsapp-tooltip mono">Chat on WhatsApp</span>
  <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true"><path d="M17.507 14.307l-.009.075c-.244-.122-1.442-.712-1.666-.793-.223-.082-.386-.122-.549.122-.163.245-.63 1.018-.773 1.18-.143.164-.285.184-.529.062-.244-.123-1.03-.38-1.963-1.212-.726-.647-1.216-1.446-1.359-1.69-.143-.245-.015-.378.107-.5.11-.11.245-.285.367-.428.122-.143.163-.245.244-.408.082-.163.041-.306-.02-.428-.061-.123-.549-1.325-.753-1.815-.198-.478-.4-.413-.549-.42-.143-.008-.306-.01-.469-.01-.163 0-.428.061-.652.305-.224.245-.855.836-.855 2.039 0 1.203.876 2.364.998 2.528.122.163 1.723 2.631 4.173 3.69.583.251 1.038.401 1.393.514.585.186 1.118.16 1.539.097.47-.07 1.442-.59 1.645-1.161.204-.571.204-1.06.143-1.161-.061-.102-.224-.163-.469-.286zM12.02 20.082h-.008a8.04 8.04 0 01-4.103-1.127l-.294-.175-3.053.801.815-2.977-.192-.306a8.037 8.037 0 01-1.233-4.298c0-4.444 3.616-8.06 8.063-8.06 2.152 0 4.175.839 5.696 2.36 1.521 1.522 2.359 3.545 2.358 5.698 0 4.445-3.617 8.086-8.042 8.086zm6.757-14.821A9.516 9.516 0 0012.02 2.457c-5.275 0-9.568 4.292-9.57 9.57 0 1.685.44 3.33 1.277 4.781L2.25 21.75l5.068-1.329a9.55 9.55 0 004.697 1.229h.005c5.274 0 9.568-4.293 9.57-9.571 0-2.557-.996-4.96-2.813-6.818z"/></svg>
</a>`;
