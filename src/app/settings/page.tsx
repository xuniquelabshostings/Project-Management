"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Phone,
  Mail,
  Check,
  AlertCircle,
  Palette,
  Upload,
  Image as ImageIcon,
  Trash2,
  Building2,
  RotateCcw,
  Receipt,
  FileText,
  PenTool,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useBranding } from "@/providers/BrandingProvider";
import { supabase } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { branding, updateBranding, resetBranding } = useBranding();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const [brandingForm, setBrandingForm] = useState({
    companyName: branding.companyName,
    tagline: branding.tagline,
    logoUrl: branding.logoUrl || "",
    signatureUrl: branding.signatureUrl || "",
    signatoryName: branding.signatoryName || "Authorized Signatory",
    addressLine1: branding.addressLine1,
    addressLine2: branding.addressLine2,
    email: branding.email,
    phone: branding.phone,
    taxId: branding.taxId,
  });
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [logoFileError, setLogoFileError] = useState<string | null>(null);
  const [signatureFileError, setSignatureFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  useEffect(() => {
    setBrandingForm({
      companyName: branding.companyName,
      tagline: branding.tagline,
      logoUrl: branding.logoUrl || "",
      signatureUrl: branding.signatureUrl || "",
      signatoryName: branding.signatoryName || "Authorized Signatory",
      addressLine1: branding.addressLine1,
      addressLine2: branding.addressLine2,
      email: branding.email,
      phone: branding.phone,
      taxId: branding.taxId,
    });
  }, [branding]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFileError(null);

    if (file.size > 2 * 1024 * 1024) {
      setLogoFileError("Logo image file size must be under 2MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setLogoFileError("Selected file must be an image (PNG, JPG, SVG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBrandingForm((prev) => ({ ...prev, logoUrl: result }));
    };
    reader.onerror = () => {
      setLogoFileError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setBrandingForm((prev) => ({ ...prev, logoUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSignatureFileError(null);

    if (file.size > 2 * 1024 * 1024) {
      setSignatureFileError("Signature image file size must be under 2MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSignatureFileError("Selected file must be an image (PNG, JPG, SVG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBrandingForm((prev) => ({ ...prev, signatureUrl: result }));
    };
    reader.onerror = () => {
      setSignatureFileError("Failed to read signature image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    setBrandingForm((prev) => ({ ...prev, signatureUrl: "" }));
    if (signatureInputRef.current) {
      signatureInputRef.current.value = "";
    }
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding({
      companyName: brandingForm.companyName.trim() || "Xunique Labs",
      tagline: brandingForm.tagline.trim(),
      logoUrl: brandingForm.logoUrl.trim() || null,
      signatureUrl: brandingForm.signatureUrl.trim() || null,
      signatoryName: brandingForm.signatoryName.trim() || "Authorized Signatory",
      addressLine1: brandingForm.addressLine1.trim(),
      addressLine2: brandingForm.addressLine2.trim(),
      email: brandingForm.email.trim(),
      phone: brandingForm.phone.trim(),
      taxId: brandingForm.taxId.trim(),
    });
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 3000);
  };

  const handleResetToDefault = () => {
    if (window.confirm("Reset company branding, logo, signature, and invoice details to defaults?")) {
      resetBranding();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (signatureInputRef.current) {
        signatureInputRef.current.value = "";
      }
      setBrandingSaved(true);
      setTimeout(() => setBrandingSaved(false), 3000);
    }
  };

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
                  Account Privilege Level
                </label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs uppercase font-mono px-3 py-1 font-semibold text-accent border-accent/40 bg-accent/5">
                    Administrator
                  </Badge>
                  <span className="text-[11px] text-muted">
                    (Single-user mode &bull; Full unrestricted administrative access)
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

        {/* Company Branding & Invoice Logo */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-accent" />
                  App Branding &amp; Invoice Logo
                </CardTitle>
                <CardDescription>
                  Customise your application logo, company name, and letterhead details used in navigation and printed invoice bills
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetToDefault}
                className="text-xs text-muted hover:text-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset Defaults
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {brandingSaved && (
              <div className="mb-4 p-3 rounded-md text-xs bg-success-bg text-success border border-success/20 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Branding updated! The new logo and details are now active in the sidebar and client invoice bills.</span>
              </div>
            )}

            <form onSubmit={handleSaveBranding} className="space-y-6">
              {/* Logo Section */}
              <div className="p-4 rounded-lg border border-border bg-surface-elevated/40 space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                  Application &amp; Invoice Logo
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Logo Preview Box */}
                  <div className="relative group">
                    {brandingForm.logoUrl ? (
                      <div className="w-20 h-20 rounded-lg border-2 border-border bg-white flex items-center justify-center p-1.5 shadow-sm overflow-hidden">
                        <img
                          src={brandingForm.logoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border bg-surface flex flex-col items-center justify-center text-muted gap-1">
                        <Building2 className="w-6 h-6" />
                        <span className="text-[9px] font-mono uppercase">No Logo</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-file-upload"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        Upload Logo Image
                      </Button>

                      {brandingForm.logoUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveLogo}
                          className="text-xs text-danger hover:bg-danger-bg/20"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <p className="text-[11px] text-muted">
                      Recommended: Square or horizontal PNG, SVG, or JPG under 2MB. Logo appears in the sidebar and top of invoice bills.
                    </p>

                    {logoFileError && (
                      <p className="text-xs text-danger font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {logoFileError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Direct URL input alternative */}
                <div className="pt-2 border-t border-border/40">
                  <label className="block text-[11px] font-medium text-muted mb-1">
                    Or Enter Direct Image URL
                  </label>
                  <div className="relative">
                    <Input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={brandingForm.logoUrl.startsWith("data:") ? "" : brandingForm.logoUrl}
                      onChange={(e) => setBrandingForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                      className="pl-8 text-xs font-mono"
                    />
                    <ImageIcon className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                  {brandingForm.logoUrl.startsWith("data:") && (
                    <span className="inline-block mt-1 text-[10px] text-accent font-medium">
                      ✓ Custom image uploaded from local storage (Base64)
                    </span>
                  )}
                </div>
              </div>

              {/* Default Authorized Signatory & Signature Image Section */}
              <div className="p-4 rounded-lg border border-border bg-surface-elevated/40 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-accent" />
                    Default Authorized Signatory &amp; Signature
                  </label>
                  <span className="text-[11px] text-muted">Auto-placed on every client invoice bill</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Signature Preview Box */}
                  <div className="relative group">
                    {brandingForm.signatureUrl ? (
                      <div className="w-36 h-20 rounded-lg border-2 border-border bg-white flex items-center justify-center p-2 shadow-sm overflow-hidden">
                        <img
                          src={brandingForm.signatureUrl}
                          alt="Signature Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-36 h-20 rounded-lg border-2 border-dashed border-border bg-surface flex flex-col items-center justify-center text-muted gap-1">
                        <PenTool className="w-5 h-5 opacity-60" />
                        <span className="text-[9px] font-mono uppercase">No Signature</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleSignatureUpload}
                      className="hidden"
                      id="signature-file-upload"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => signatureInputRef.current?.click()}
                        className="text-xs"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        Upload Signature Image
                      </Button>

                      {brandingForm.signatureUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveSignature}
                          className="text-xs text-danger hover:bg-danger-bg/20"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <p className="text-[11px] text-muted">
                      Recommended: Transparent PNG, SVG, or JPG under 2MB. Placed right above the Authorized Signatory line on all invoice bills.
                    </p>

                    {signatureFileError && (
                      <p className="text-xs text-danger font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {signatureFileError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Signatory Label & Direct Signature URL */}
                <div className="pt-2 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted mb-1">
                      Signatory Title / Designatory Label
                    </label>
                    <Input
                      type="text"
                      placeholder="Authorized Signatory"
                      value={brandingForm.signatoryName}
                      onChange={(e) => setBrandingForm((prev) => ({ ...prev, signatoryName: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted mb-1">
                      Or Enter Signature Image URL
                    </label>
                    <div className="relative">
                      <Input
                        type="url"
                        placeholder="https://example.com/signature.png"
                        value={brandingForm.signatureUrl.startsWith("data:") ? "" : brandingForm.signatureUrl}
                        onChange={(e) => setBrandingForm((prev) => ({ ...prev, signatureUrl: e.target.value }))}
                        className="pl-8 text-xs font-mono"
                      />
                      <ImageIcon className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Company & Letterhead Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Company / Studio Name *
                  </label>
                  <Input
                    type="text"
                    required
                    value={brandingForm.companyName}
                    onChange={(e) => setBrandingForm((prev) => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Xunique Labs"
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted mt-1">App header title &amp; bill issuer name</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Tagline / Subtitle
                  </label>
                  <Input
                    type="text"
                    value={brandingForm.tagline}
                    onChange={(e) => setBrandingForm((prev) => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Design & Engineering Studio"
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted mt-1">Shown below company name in sidebar and bill</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Office / Business Address Line 1
                  </label>
                  <Input
                    type="text"
                    value={brandingForm.addressLine1}
                    onChange={(e) => setBrandingForm((prev) => ({ ...prev, addressLine1: e.target.value }))}
                    placeholder="Bharat Nagar, New Friends Colony"
                    className="text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Address Line 2 (City, State, Country, Postal Code)
                  </label>
                  <Input
                    type="text"
                    value={brandingForm.addressLine2}
                    onChange={(e) => setBrandingForm((prev) => ({ ...prev, addressLine2: e.target.value }))}
                    placeholder="New Delhi, Delhi, 110025"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Billing &amp; Inquiry Email
                  </label>
                  <Input
                    type="email"
                    value={brandingForm.email}
                    onChange={(e) => setBrandingForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="support@xuniquelabs.com"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Billing Phone / Contact
                  </label>
                  <Input
                    type="tel"
                    value={brandingForm.phone}
                    onChange={(e) => setBrandingForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 (80) 4920-1100"
                    className="text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    GSTIN / Tax Registration ID
                  </label>
                  <Input
                    type="text"
                    value={brandingForm.taxId}
                    onChange={(e) => setBrandingForm((prev) => ({ ...prev, taxId: e.target.value }))}
                    placeholder="29AABCU9603R1ZM"
                    className="text-sm font-mono uppercase"
                  />
                  <p className="text-[11px] text-muted mt-1">Optional business tax identifier (excluded from invoice bills)</p>
                </div>
              </div>

              {/* Live Letterhead Preview */}
              <div className="p-4 rounded-lg border border-border/80 bg-white text-slate-900 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-accent" />
                    Invoice Bill Letterhead Preview
                  </span>
                  <span className="text-[10px] text-slate-400">Live preview of bill header</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {brandingForm.logoUrl ? (
                      <img
                        src={brandingForm.logoUrl}
                        alt="Preview"
                        className="w-10 h-10 rounded-md object-contain border border-slate-200 bg-white p-1 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-base font-serif shrink-0">
                        {brandingForm.companyName.charAt(0) || "X"}
                      </div>
                    )}
                    <div>
                      <h4 className="font-serif font-bold text-base text-slate-900 leading-tight">
                        {brandingForm.companyName || "Your Company Name"}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {brandingForm.tagline || "Your Tagline / Studio"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 space-y-0.5 hidden sm:block">
                    {brandingForm.addressLine1 && <p>{brandingForm.addressLine1}</p>}
                    {brandingForm.addressLine2 && <p>{brandingForm.addressLine2}</p>}
                  </div>
                </div>

                {/* Signatory Preview in Live Letterhead Box */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Authorized Signatory preview:
                  </span>
                  <div className="text-right">
                    {brandingForm.signatureUrl ? (
                      <div className="flex flex-col items-end mb-1">
                        <img
                          src={brandingForm.signatureUrl}
                          alt="Signature"
                          className="h-9 max-w-[130px] object-contain"
                        />
                        <div className="border-b border-slate-300 w-28 mt-0.5"></div>
                      </div>
                    ) : (
                      <div className="h-6 border-b border-dashed border-slate-300 w-28 ml-auto mb-1"></div>
                    )}
                    <p className="text-[9px] font-medium text-slate-700 uppercase tracking-wider">
                      {brandingForm.signatoryName || "Authorized Signatory"}
                    </p>
                    <p className="text-[9px] text-slate-400">{brandingForm.companyName || "Company"}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button type="submit" variant="primary" size="sm">
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Save Branding Changes
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
