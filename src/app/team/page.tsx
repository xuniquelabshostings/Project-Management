"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, Settings } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";

export default function TeamPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to settings
    const timer = setTimeout(() => {
      router.replace("/settings");
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Single-User Administrator Workspace
        </h1>
        <p className="text-sm text-muted max-w-md mx-auto">
          This system is configured for a single administrator. Multi-user team management has been disabled and full administrative access is granted across all modules.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link href="/settings">
            <Button variant="primary" size="sm">
              <Settings className="w-3.5 h-3.5 mr-1.5" /> Go to Account Settings
            </Button>
          </Link>
          <Link href="/management">
            <Button variant="outline" size="sm">
              Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
