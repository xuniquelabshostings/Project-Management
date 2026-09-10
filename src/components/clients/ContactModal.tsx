"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Contact } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { isValidUuid, generateUUID } from "@/lib/mock-data";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSaved: (contact: Contact) => void;
  contactToEdit?: Contact | null;
}

export function ContactModal({
  isOpen,
  onClose,
  clientId,
  onSaved,
  contactToEdit,
}: ContactModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredChannel, setPreferredChannel] = useState<"whatsapp" | "email" | "phone" | "other">("whatsapp");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (contactToEdit) {
      setName(contactToEdit.name);
      setRole(contactToEdit.role || "");
      setEmail(contactToEdit.email || "");
      setPhone(contactToEdit.phone || "");
      setAddress(contactToEdit.address || "");
      setPreferredChannel((contactToEdit.preferred_channel as any) || "whatsapp");
    } else {
      setName("");
      setRole("");
      setEmail("");
      setPhone("");
      setAddress("");
      setPreferredChannel("whatsapp");
    }
    setErrorMsg(null);
  }, [contactToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Contact name is required.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const payload = {
      client_id: clientId,
      name: name.trim(),
      role: role.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      preferred_channel: preferredChannel,
    };

    try {
      if (contactToEdit) {
        const { data, error } = await supabase
          .from("contacts")
          .update(payload)
          .eq("id", contactToEdit.id)
          .select()
          .single();

        if (error) throw error;
        onSaved(data as Contact);
      } else {
        const { data, error } = await supabase
          .from("contacts")
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        onSaved(data as Contact);
      }
      onClose();
    } catch (err: any) {
      console.error("Supabase contact write error:", err.message);
      setErrorMsg(err.message || "Failed to save contact to Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contactToEdit ? "Edit Client Contact" : "Add Client Contact"}
      description="Save primary or secondary stakeholders for direct communication."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-md bg-danger-bg border border-danger/20 text-danger text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Full Name *
          </label>
          <Input
            required
            placeholder="Sarah Jenkins"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Role / Designation
          </label>
          <Input
            placeholder="VP Engineering / Product Lead"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="sarah@client.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Phone / WhatsApp
            </label>
            <Input
              type="tel"
              placeholder="+1 555 0192"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Physical / Office Address <span className="text-muted font-normal">(Optional)</span>
          </label>
          <Input
            placeholder="e.g. Suite 400, 100 Innovation Way, San Francisco, CA"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Preferred Communication Channel
          </label>
          <select
            value={preferredChannel}
            onChange={(e) =>
              setPreferredChannel(
                e.target.value as "whatsapp" | "email" | "phone" | "other"
              )
            }
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          >
            <option value="whatsapp">WhatsApp (Direct message / calls)</option>
            <option value="email">Email</option>
            <option value="phone">Phone Call</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {contactToEdit ? "Save Changes" : "Add Contact"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
