"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectUrl = redirectParam && redirectParam !== "/" ? redirectParam : "/management";

  const { signIn, user } = useAuth();
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

  return (
    <Card className="border border-border bg-surface shadow-xs">
      <div className="p-8">
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight">
            Administrator Workspace
          </h1>
          <p className="text-xs text-muted mt-1.5">
            Sign in to manage your clients, projects, tasks, and financials
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
          <img
            src="/assets/logo-mark-nobg.png"
            alt="Xunique Labs"
            className="w-8 h-8 object-contain"
          />
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
