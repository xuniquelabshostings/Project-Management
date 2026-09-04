"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserRole } from "@/types/database.types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { signIn, signInAsDemo, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setErrorMessage(error.message || "Failed to sign in. Please verify your credentials.");
      setIsLoading(false);
    } else {
      router.push(redirectUrl);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    signInAsDemo(role);
    router.push(redirectUrl);
  };

  return (
    <Card className="border border-border bg-surface shadow-xs">
      <div className="p-8">
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight">
            Team Member Portal
          </h1>
          <p className="text-xs text-muted mt-1.5">
            Sign in to access your projects, tasks, and client accounts
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-md bg-danger-bg border border-danger/20 flex items-start gap-2.5 text-danger text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Input
                type="email"
                required
                placeholder="name@xuniquelabs.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-sm"
              />
              <Mail className="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 text-sm"
              />
              <Lock className="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Sign In <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* Quick Demo Access for Testing */}
        <div className="mt-6 pt-5 border-t border-border/50">
          <div className="text-center mb-3">
            <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
              Quick Test Sign-In
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("admin")}
              className="px-2 py-2 text-xs rounded-md border border-border bg-surface-elevated hover:bg-surface-hover hover:border-accent/40 transition-colors text-foreground text-center"
            >
              <div className="font-semibold text-accent">Admin</div>
              <div className="text-[10px] text-muted">Full Access</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("account_manager")}
              className="px-2 py-2 text-xs rounded-md border border-border bg-surface-elevated hover:bg-surface-hover hover:border-accent/40 transition-colors text-foreground text-center"
            >
              <div className="font-semibold text-warning">Account Mgr</div>
              <div className="text-[10px] text-muted">Clients & Billing</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("developer")}
              className="px-2 py-2 text-xs rounded-md border border-border bg-surface-elevated hover:bg-surface-hover hover:border-accent/40 transition-colors text-foreground text-center"
            >
              <div className="font-semibold text-info">Developer</div>
              <div className="text-[10px] text-muted">Tasks Only</div>
            </button>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-border/40 text-center">
          <p className="text-[11px] text-muted leading-relaxed">
            Internal access only. Accounts are issued by an administrator.
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background p-4 sm:p-6 md:p-12 relative">
      {/* Top Bar with Brand & Theme Toggle */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-serif font-semibold text-foreground text-base tracking-tight">
            Xunique Labs
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <Suspense
          fallback={
            <div className="p-8 text-center text-sm text-muted">
              Loading authentication...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer note */}
      <div className="text-center text-xs text-muted/80 pb-2">
        <p>&copy; {new Date().getFullYear()} Xunique Labs &bull; Internal Workspace</p>
      </div>
    </div>
  );
}
