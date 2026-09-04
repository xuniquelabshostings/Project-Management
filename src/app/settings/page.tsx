"use client";

import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Check, AlertCircle, Palette } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          avatar_url: avatarUrl,
          theme_preference: theme,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      await refreshProfile();
      setStatusMessage({ text: "Profile updated successfully." });
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to update profile.", isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="pb-2 border-b border-border/50">
          <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight">
            Account Settings
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage your personal profile and appearance preferences
          </p>
        </div>

        {statusMessage && (
          <div
            className={`p-4 rounded-md text-xs border flex items-center gap-2 ${
              statusMessage.isError
                ? "bg-danger-bg text-danger border-danger/20"
                : "bg-success-bg text-success border-success/20"
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Check className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              Your identity within the internal team directory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="pl-9 text-sm opacity-70 bg-surface-elevated cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Contact an administrator to change your registered email address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Assigned Internal Role
                </label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs uppercase font-mono px-3 py-1">
                    {profile?.role.replace("_", " ") || "Developer"}
                  </Badge>
                  <span className="text-[11px] text-muted">
                    (Role is assigned and protected by administrator policies)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="pl-9 text-sm"
                  />
                  <User className="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Direct Phone / WhatsApp
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="pl-9 text-sm"
                  />
                  <Phone className="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Theme Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Interface Appearance</CardTitle>
            <CardDescription>
              Claude-inspired warm palette in light and dark modes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  theme === "light"
                    ? "border-accent ring-2 ring-accent/20 bg-accent-light/30"
                    : "border-border hover:bg-surface-elevated"
                }`}
              >
                <div className="font-medium text-xs text-foreground mb-1">Warm Light</div>
                <div className="text-[11px] text-muted">
                  Warm off-white background with terracotta accents
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  theme === "dark"
                    ? "border-accent ring-2 ring-accent/20 bg-accent-light/30"
                    : "border-border hover:bg-surface-elevated"
                }`}
              >
                <div className="font-medium text-xs text-foreground mb-1">Warm Dark</div>
                <div className="text-[11px] text-muted">
                  Dark charcoal surfaces with gentle contrast
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  theme === "system"
                    ? "border-accent ring-2 ring-accent/20 bg-accent-light/30"
                    : "border-border hover:bg-surface-elevated"
                }`}
              >
                <div className="font-medium text-xs text-foreground mb-1">System Default</div>
                <div className="text-[11px] text-muted">
                  Automatically sync with your OS preferences
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
