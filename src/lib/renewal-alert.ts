import { Client, Contact, getClientName } from "@/types/database.types";
import { lookupDomainWhois, DomainWhoisResult } from "@/lib/domain-whois";
import { supabase } from "@/lib/supabase/client";
import { getLocalClients, saveLocalClient } from "@/lib/mock-data";

export interface SendWhatsAppAlertResult {
  success: boolean;
  phone?: string;
  domainWhois?: DomainWhoisResult | null;
  updatedClient?: Client;
  error?: string;
}

/**
 * 1. Automatically fetch or resolve the client's phone number
 * Looks in provided contacts, client.contacts, local storage, and live Supabase contacts.
 */
export async function resolveClientPhone(
  client: Client,
  providedContacts?: Contact[]
): Promise<{ phone: string | null; contactName?: string }> {
  // A. Check provided contacts or attached contacts
  let contactsList =
    providedContacts && providedContacts.length > 0
      ? providedContacts
      : client.contacts || [];

  // B. If no contacts on client, check local store
  if (!contactsList || contactsList.length === 0) {
    const local = getLocalClients().find((c) => c.id === client.id);
    if (local?.contacts && local.contacts.length > 0) {
      contactsList = local.contacts;
    }
  }

  // C. If still empty, query Supabase
  if (!contactsList || contactsList.length === 0) {
    try {
      const { data } = await supabase
        .from("contacts")
        .select("*")
        .eq("client_id", client.id);
      if (data && data.length > 0) {
        contactsList = data as Contact[];
      }
    } catch (err) {
      console.warn("Could not query contacts for client:", err);
    }
  }

  // D. Find best contact: preferred WhatsApp first, then any contact with phone
  const preferredWhatsapp = contactsList.find(
    (c) => c.preferred_channel === "whatsapp" && Boolean(c.phone)
  );
  if (preferredWhatsapp?.phone) {
    return { phone: preferredWhatsapp.phone, contactName: preferredWhatsapp.name };
  }

  const anyPhoneContact = contactsList.find((c) => Boolean(c.phone));
  if (anyPhoneContact?.phone) {
    return { phone: anyPhoneContact.phone, contactName: anyPhoneContact.name };
  }

  return { phone: null };
}

/**
 * 2. Automatically query public free WHOIS/RDAP API and sync back to client record
 */
export async function fetchAndSyncDomainWhois(
  client: Client
): Promise<{ whois: DomainWhoisResult | null; updatedClient: Client }> {
  const targetDomain = (client.domain_name || client.website || "").trim();
  let whoisResult: DomainWhoisResult | null = null;

  if (targetDomain) {
    try {
      whoisResult = await lookupDomainWhois(targetDomain);
    } catch (err) {
      console.warn("Auto WHOIS lookup failed:", err);
    }
  }

  // Prepare updated client with live WHOIS values if successful
  const updatedClient: Client = { ...client };

  if (whoisResult && whoisResult.success) {
    if (whoisResult.domain && !updatedClient.domain_name) {
      updatedClient.domain_name = whoisResult.domain;
    }
    if (whoisResult.registrar) {
      updatedClient.domain_registrar = whoisResult.registrar;
    }
    if (whoisResult.registeredAt) {
      updatedClient.domain_registered_at = whoisResult.registeredAt;
    }
    if (whoisResult.expiresAt) {
      updatedClient.domain_renew_at = whoisResult.expiresAt;
    }

    // Persist to local storage
    saveLocalClient(updatedClient);

    // Try persisting to Supabase if accessible
    try {
      await supabase
        .from("clients")
        .update({
          domain_name: updatedClient.domain_name,
          domain_registrar: updatedClient.domain_registrar,
          domain_registered_at: updatedClient.domain_registered_at,
          domain_renew_at: updatedClient.domain_renew_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", client.id);
    } catch (err) {
      // Ignored if demo mode or offline
    }
  }

  return { whois: whoisResult, updatedClient };
}

/**
 * 3. Formulate the rich WhatsApp renewal message
 */
export function buildWhatsAppRenewalMessage(
  client: Client,
  contactName?: string,
  whois?: DomainWhoisResult | null
): string {
  const clientName = getClientName(client);
  const greetingName = contactName ? `${contactName} (${clientName})` : clientName;

  const domain =
    whois?.domain ||
    client.domain_name ||
    (client.website
      ? client.website
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "")
          .split("/")[0]
      : null);
  const registrar =
    whois?.registrar || client.domain_registrar || "Standard Registrar";
  const registeredAt = whois?.registeredAt || client.domain_registered_at;
  const expiresAt = whois?.expiresAt || client.domain_renew_at;

  // Calculate days left
  let daysLeftText = "";
  if (expiresAt) {
    const expDate = new Date(expiresAt);
    const now = new Date();
    expDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil(
      (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0) {
      daysLeftText = `🚨 Expired ${Math.abs(diff)} days ago`;
    } else if (diff === 0) {
      daysLeftText = "⚠️ Expires TODAY";
    } else if (diff <= 7) {
      daysLeftText = `⚡ Urgent: ${diff} days remaining`;
    } else {
      daysLeftText = `📅 ${diff} days remaining`;
    }
  }

  let msg = `🔔 *Domain & Infrastructure Renewal Alert* - Xunique Labs\n\n`;
  msg += `Hello *${greetingName}*,\n\n`;
  msg += `We are reaching out to notify you regarding the upcoming renewal of your online services:\n\n`;

  if (domain) {
    msg += `🌐 *Domain Registration:*\n`;
    msg += `• *Domain:* ${domain}\n`;
    msg += `• *Registrar:* ${registrar}\n`;
    if (registeredAt) {
      msg += `• *Registered On:* ${registeredAt}\n`;
    }
    if (expiresAt) {
      msg += `• *Renewal / Expiry Date:* ${expiresAt} (${daysLeftText})\n`;
    }
    if (client.domain_price != null) {
      msg += `• *Annual Domain Fee:* $${client.domain_price}\n`;
    }
    msg += `\n`;
  }

  if (client.hosting_provider || client.hosting_renew_at) {
    msg += `🖥️ *Web Hosting & Server:*\n`;
    if (client.hosting_provider) {
      msg += `• *Provider:* ${client.hosting_provider}${
        client.hosting_plan ? ` - ${client.hosting_plan}` : ""
      }\n`;
    }
    if (client.hosting_activated_at) {
      msg += `• *Activated On:* ${client.hosting_activated_at}\n`;
    }
    if (client.hosting_renew_at) {
      msg += `• *Hosting Renewal Date:* ${client.hosting_renew_at}\n`;
    }
    if (client.hosting_price != null) {
      msg += `• *Hosting Fee:* $${client.hosting_price}\n`;
    }
    msg += `\n`;
  }

  msg += `⚠️ *Action Required:* To maintain uninterrupted uptime and prevent domain forfeiture or DNS suspension, please confirm if you would like us to process this renewal on your behalf.\n\n`;
  msg += `Thank you,\n*Xunique Labs Team*`;

  return msg;
}

/**
 * 4. Master trigger: automatically fetches phone, automatically fetches free WHOIS, and opens WhatsApp
 */
export async function sendClientWhatsAppRenewalAlert(
  client: Client,
  providedContacts?: Contact[],
  promptIfNoPhone = true
): Promise<SendWhatsAppAlertResult> {
  // A. Auto-fetch client phone number
  const { phone: detectedPhone, contactName } = await resolveClientPhone(
    client,
    providedContacts
  );

  let finalPhone = detectedPhone;
  if (!finalPhone && promptIfNoPhone && typeof window !== "undefined") {
    const input = window.prompt(
      `No phone number found for ${getClientName(client)}.\n\nPlease enter client's WhatsApp phone number with country code (e.g. +91 9876543210):`
    );
    if (input && input.trim()) {
      finalPhone = input.trim();
    }
  }

  // B. Auto-fetch domain registration, expiry, registrar from free public WHOIS / RDAP API
  const { whois, updatedClient } = await fetchAndSyncDomainWhois(client);

  // C. Build the WhatsApp message with verified WHOIS dates
  const message = buildWhatsAppRenewalMessage(updatedClient, contactName, whois);

  // D. Format clean phone number
  const cleanPhone = finalPhone ? finalPhone.replace(/[^0-9]/g, "") : "";

  // E. Open WhatsApp
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  if (typeof window !== "undefined") {
    window.open(waUrl, "_blank");
  }

  return {
    success: true,
    phone: finalPhone || undefined,
    domainWhois: whois,
    updatedClient,
  };
}
