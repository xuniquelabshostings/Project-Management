"use client";

import React, { useState } from "react";
import { Mail, Phone, MessageSquare, Edit2, Trash2, Plus, UserCheck, MapPin } from "lucide-react";
import { Contact } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactModal } from "./ContactModal";
import { supabase } from "@/lib/supabase/client";
import { isValidUuid, deleteLocalContact } from "@/lib/mock-data";

interface ContactsListProps {
  clientId: string;
  contacts: Contact[];
  onContactsUpdated: () => void;
}

export function ContactsList({ clientId, contacts, onContactsUpdated }: ContactsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const handleEdit = (c: Contact) => {
    setEditingContact(c);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm("Are you sure you want to remove this contact?")) return;
    deleteLocalContact(clientId, contactId);
    try {
      if (isValidUuid(contactId)) {
        await supabase.from("contacts").delete().eq("id", contactId);
      }
    } catch (err: any) {
      console.warn("Could not delete from Supabase:", err.message);
    }
    onContactsUpdated();
  };

  const cleanPhoneForWa = (phone?: string | null) => {
    if (!phone) return "";
    return phone.replace(/[^\d]/g, "");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-semibold text-foreground">
          Client Stakeholders & Contacts ({contacts.length})
        </h3>
        <Button variant="secondary" size="sm" onClick={handleCreate}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border rounded-lg bg-surface-elevated/30">
          <UserCheck className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
          <p className="text-xs text-muted">No contacts recorded yet for this client.</p>
          <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={handleCreate}>
            Add Primary Contact
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 rounded-lg border border-border bg-surface flex flex-col justify-between hover:border-border/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent-light text-accent flex items-center justify-center font-semibold text-xs shrink-0">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{contact.name}</h4>
                    {contact.role && <p className="text-xs text-muted">{contact.role}</p>}
                    {contact.address && (
                      <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 shrink-0 text-accent" />
                        <span className="truncate max-w-[200px]">{contact.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                    title="Edit Contact"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-1 rounded text-muted hover:text-danger hover:bg-danger-bg transition-colors"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {contact.preferred_channel && (
                    <Badge variant="outline" className="text-[10px] font-mono capitalize">
                      Prefers {contact.preferred_channel}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {contact.phone && (
                    <a
                      href={`https://wa.me/${cleanPhoneForWa(contact.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md border border-border bg-surface-elevated text-success hover:border-success/40 transition-colors"
                      title="Message on WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="p-1.5 rounded-md border border-border bg-surface-elevated text-muted hover:text-foreground hover:border-border/80 transition-colors"
                      title="Send Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-1.5 rounded-md border border-border bg-surface-elevated text-muted hover:text-foreground hover:border-border/80 transition-colors"
                      title="Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientId={clientId}
        contactToEdit={editingContact}
        onSaved={() => onContactsUpdated()}
      />
    </div>
  );
}
