export interface DomainWhoisResult {
  success: boolean;
  domain: string;
  registrar: string | null;
  registeredAt: string | null;
  expiresAt: string | null;
  nameservers?: string[];
  error?: string;
}

export async function lookupDomainWhois(rawDomain: string): Promise<DomainWhoisResult> {
  if (!rawDomain) {
    return {
      success: false,
      domain: "",
      registrar: null,
      registeredAt: null,
      expiresAt: null,
      error: "Please enter a domain name or URL.",
    };
  }

  // Clean domain name (strip protocol, paths, ports, and whitespace)
  const cleanDomain = rawDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split(":")[0];

  if (!cleanDomain || !cleanDomain.includes(".")) {
    return {
      success: false,
      domain: cleanDomain,
      registrar: null,
      registeredAt: null,
      expiresAt: null,
      error: "Please enter a valid domain name with a TLD (e.g. example.com).",
    };
  }

  try {
    // Query open ICANN RDAP standard service directly from browser
    const rdapUrl = `https://rdap.org/domain/${encodeURIComponent(cleanDomain)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(rdapUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/rdap+json, application/json",
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        domain: cleanDomain,
        registrar: null,
        registeredAt: null,
        expiresAt: null,
        error: `RDAP lookup returned status ${response.status}. Domain may have private WHOIS or be unregistered.`,
      };
    }

    const data = await response.json();

    // Parse Registration and Expiration Events
    let registeredAt: string | null = null;
    let expiresAt: string | null = null;

    if (Array.isArray(data.events)) {
      for (const event of data.events) {
        if (event.eventAction === "registration" && event.eventDate) {
          registeredAt = event.eventDate.split("T")[0];
        }
        if (
          (event.eventAction === "expiration" ||
            event.eventAction === "registrar expiration") &&
          event.eventDate
        ) {
          expiresAt = event.eventDate.split("T")[0];
        }
      }
    }

    // Extract Registrar Name from Entities
    let registrar: string | null = null;
    if (Array.isArray(data.entities)) {
      for (const entity of data.entities) {
        if (Array.isArray(entity.roles) && entity.roles.includes("registrar")) {
          if (Array.isArray(entity.vcardArray) && Array.isArray(entity.vcardArray[1])) {
            const fnItem = entity.vcardArray[1].find(
              (item: any[]) => Array.isArray(item) && item[0] === "fn"
            );
            if (fnItem && fnItem[3]) {
              registrar = String(fnItem[3]);
            }
          }
          if (!registrar && entity.handle) {
            registrar = String(entity.handle);
          }
        }
      }
    }

    // Extract Nameservers
    const nameservers: string[] = [];
    if (Array.isArray(data.nameservers)) {
      for (const ns of data.nameservers) {
        if (ns.ldhName) nameservers.push(ns.ldhName.toLowerCase());
      }
    }

    return {
      success: true,
      domain: cleanDomain,
      registrar: registrar || "Unknown Registrar",
      registeredAt: registeredAt || null,
      expiresAt: expiresAt || null,
      nameservers,
    };
  } catch (error: any) {
    if (error.name === "AbortError") {
      return {
        success: false,
        domain: cleanDomain,
        registrar: null,
        registeredAt: null,
        expiresAt: null,
        error: "Lookup timed out. You can enter the registration and renewal dates manually.",
      };
    }
    return {
      success: false,
      domain: cleanDomain,
      registrar: null,
      registeredAt: null,
      expiresAt: null,
      error: error?.message || "Could not complete WHOIS query.",
    };
  }
}
