import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function BlogFooter() {
  return (
    <footer className="border-t border-border bg-surface mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo-mark-nobg.png"
                alt="Xunique Labs"
                className="w-7 h-7 object-contain"
              />
              <span className="font-serif font-bold text-lg text-foreground">
                Xunique Labs
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-md font-sans">
              A premier software and website development studio in Delhi. We engineer high-performance web applications, cross-platform mobile apps, and custom digital platforms drawn to spec.
            </p>
            <div className="text-[11px] font-mono text-muted/80 pt-2 space-y-1">
              <div>
                <span>Primary Support: </span>
                <a href="mailto:support@xuniquelabs.com" className="text-accent hover:underline">
                  support@xuniquelabs.com
                </a>
              </div>
              <div>
                <span>Direct Studio: </span>
                <a href="mailto:xuniquelabs@gmail.com" className="text-accent hover:underline">
                  xuniquelabs@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold text-foreground uppercase tracking-wider mb-3">
              Disciplines
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li><Link href="/#services" className="hover:text-foreground transition-colors">Web Applications (Next.js)</Link></li>
              <li><Link href="/#services" className="hover:text-foreground transition-colors">Mobile Apps (Flutter/React Native)</Link></li>
              <li><Link href="/#services" className="hover:text-foreground transition-colors">UI/UX Systems & Prototypes</Link></li>
              <li><Link href="/#services" className="hover:text-foreground transition-colors">E-Commerce & Payment Gateways</Link></li>
              <li><Link href="/#services" className="hover:text-foreground transition-colors">Performance & Code Audits</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold text-foreground uppercase tracking-wider mb-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li><Link href="/" className="hover:text-foreground transition-colors">Studio Home</Link></li>
              <li><Link href="/blog" className="text-accent font-medium hover:underline">Engineering Blog</Link></li>
              <li><Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing & Packages</Link></li>
              <li><Link href="/#work" className="hover:text-foreground transition-colors">Selected Case Files</Link></li>
              <li><Link href="/#contact" className="hover:text-foreground transition-colors">Contact Studio</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-muted">
          <div>© {new Date().getFullYear()} XUNIQUE LABS. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-4">
            <span>SCALE: 1:1 SPECIFICATION</span>
            <span>DELHI, INDIA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
