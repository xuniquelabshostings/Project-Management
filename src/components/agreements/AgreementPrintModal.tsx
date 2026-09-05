"use client";

import React, { useRef } from "react";
import {
  Printer,
  Mail,
  X,
  FileCheck,
  Info,
} from "lucide-react";
import { Agreement } from "@/types/database.types";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/providers/BrandingProvider";

interface AgreementPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: Agreement | null;
}

export function AgreementPrintModal({ isOpen, onClose, agreement }: AgreementPrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { branding } = useBranding();

  if (!isOpen || !agreement) return null;

  const clientName = agreement.client?.company_name || "Client";
  const clientEmail =
    agreement.client?.contacts?.[0]?.email ||
    (agreement.client as any)?.email ||
    "client@example.com";
  const clientContactName =
    agreement.client?.contacts?.[0]?.name ||
    "Authorized Representative";
  const companyName = branding.companyName || "Xunique Labs";
  const defaultPdfFileName = `${clientName}-Xunique Labs-Agreement`;

  const emailSubject = encodeURIComponent(
    `Software Development Agreement - ${agreement.agreement_number} | ${companyName}`
  );
  const emailBody = encodeURIComponent(
    `Dear ${clientContactName},\n\nPlease find attached the Software Development Agreement (${agreement.agreement_number}) for project "${agreement.project_name}".\n\nKindly review and sign at your earliest convenience.\n\nBest regards,\n${companyName} Team`
  );

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) {
      window.print();
      return;
    }

    // Set document title so browsers use {client_name}-Xunique Labs-Agreement as default save filename
    const originalDocumentTitle = document.title;
    document.title = defaultPdfFileName;

    const restoreTitle = () => {
      document.title = originalDocumentTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };
    window.addEventListener("afterprint", restoreTitle);
    setTimeout(restoreTitle, 5000);

    // Clean up any previously attached print iframe
    const existingFrame = document.getElementById("agreement-print-frame");
    if (existingFrame) {
      existingFrame.remove();
    }

    // Create an isolated hidden iframe with desktop dimensions so media queries don't collapse
    const iframe = document.createElement("iframe");
    iframe.id = "agreement-print-frame";
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.width = "1024px";
    iframe.style.height = "1600px";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all stylesheets and style rules from current page
    const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((node) => node.outerHTML)
      .join("\n");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${defaultPdfFileName}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            }
            .agreement-print-root {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
              border: none !important;
              box-shadow: none !important;
            }
          </style>
        </head>
        <body>
          <div class="agreement-print-root">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Give iframe time to render fonts, images, and styles
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Iframe print error:", err);
        window.print();
      } finally {
        setTimeout(() => {
          iframe.remove();
        }, 1500);
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-border bg-surface-elevated">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-accent/10 text-accent flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-sm font-semibold text-foreground">
                Agreement {agreement.agreement_number}
              </h2>
              <p className="text-xs text-muted">
                Client: {clientName} &bull; {formatINR(agreement.total_fee)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`mailto:${clientEmail}?subject=${emailSubject}&body=${emailBody}`}
              className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover transition-colors"
            >
              <Mail className="w-3.5 h-3.5 mr-1.5 text-muted" />
              Email Client
            </a>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="text-xs font-medium"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / Save as PDF
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface transition-colors ml-1"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informational Tip Banner (Hidden during print) */}
        <div className="no-print px-6 py-2 bg-info-bg/40 border-b border-info/20 text-xs text-info flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Tip:</strong> In the print preview window, choose <strong>&quot;Save as PDF&quot;</strong> as your destination. Includes comprehensive agency liability exemption clauses.
            </span>
          </span>
          <span className="text-[11px] opacity-80">A4 Portrait &bull; Legal Terms</span>
        </div>

        {/* Scrollable Preview Wrapper */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-muted/5 flex justify-center">
          {/* Printable Agreement Card */}
          <div
            id="printable-agreement"
            ref={printRef}
            className="w-full max-w-3xl bg-white text-slate-900 p-8 sm:p-12 rounded-lg shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 space-y-6"
          >
            {/* Header: Company Info + Agreement Details */}
            <div className="flex flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-200">
              <div>
                <div className="flex items-center gap-3">
                  {branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt={companyName}
                      className="w-12 h-12 rounded-lg object-contain border border-slate-200 bg-white p-1 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-lg font-serif shrink-0">
                      {companyName.charAt(0) || "X"}
                    </div>
                  )}
                  <div>
                    <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
                      {companyName}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                      {branding.tagline || "Software Design & Engineering Studio"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                  <p>{branding.addressLine1}</p>
                  {branding.addressLine2 && <p>{branding.addressLine2}</p>}
                  <p>{branding.email} &bull; {branding.phone}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="inline-block px-3 py-1 rounded bg-slate-900 font-mono text-[11px] font-bold text-white tracking-wider uppercase mb-1">
                  MASTER SERVICE AGREEMENT
                </div>
                <div className="font-mono text-sm font-bold text-slate-700">
                  Ref: {agreement.agreement_number}
                </div>
                <div className="mt-2 text-xs space-y-0.5 text-slate-600">
                  <p>
                    <span className="text-slate-400">Effective Date:</span>{" "}
                    <strong>
                      {new Date(agreement.effective_date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </strong>
                  </p>
                  {agreement.completion_date && (
                    <p>
                      <span className="text-slate-400">Target Delivery:</span>{" "}
                      <strong>
                        {new Date(agreement.completion_date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </strong>
                    </p>
                  )}
                  <p>
                    <span className="text-slate-400">Status:</span>{" "}
                    <span className="uppercase font-mono font-semibold text-emerald-700">
                      {agreement.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-2">
              <h2 className="font-serif text-xl font-bold tracking-tight text-slate-900">
                {agreement.title || "MASTER SOFTWARE DEVELOPMENT & SERVICES AGREEMENT"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Project: <strong>{agreement.project_name}</strong>
              </p>
            </div>

            {/* Parties Box */}
            <div className="grid grid-cols-2 gap-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div>
                <p className="font-mono uppercase font-bold text-[10px] text-slate-500 tracking-wider mb-1">
                  SERVICE PROVIDER (AGENCY / DEVELOPER)
                </p>
                <p className="font-bold text-slate-900 text-sm">{companyName}</p>
                <p className="text-slate-600 mt-0.5">{branding.addressLine1}</p>
                {branding.addressLine2 && <p className="text-slate-600">{branding.addressLine2}</p>}
                <p className="text-slate-600 mt-1">{branding.email} &bull; {branding.phone}</p>
                <p className="text-[11px] text-slate-500 mt-1 italic">
                  Independent Developer Studio (Micro-Enterprise)
                </p>
              </div>

              <div>
                <p className="font-mono uppercase font-bold text-[10px] text-slate-500 tracking-wider mb-1">
                  CLIENT (CUSTOMER)
                </p>
                <p className="font-bold text-slate-900 text-sm">{clientName}</p>
                <p className="text-slate-700 font-medium">{clientContactName}</p>
                <p className="text-slate-600 mt-0.5">{clientEmail}</p>
                {agreement.client?.website && (
                  <p className="text-slate-500">{agreement.client.website}</p>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  Industry: {agreement.client?.industry || "Commercial Enterprise"}
                </p>
              </div>
            </div>

            {/* Recitals */}
            <div className="text-xs leading-relaxed text-slate-700 space-y-1.5">
              <p>
                This Master Software Development &amp; Services Agreement (the <strong>&quot;Agreement&quot;</strong>) is made effective as of{" "}
                <strong>
                  {new Date(agreement.effective_date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </strong>, by and between <strong>{companyName}</strong> (the <strong>&quot;Service Provider&quot;</strong> / <strong>&quot;Developer&quot;</strong>) and{" "}
                <strong>{clientName}</strong> (the <strong>&quot;Client&quot;</strong>).
              </p>
              <p>
                WHEREAS, Client desires to retain Service Provider as an independent software developer to perform bespoke digital engineering, architecture, and programming services; and WHEREAS, Service Provider agrees to perform such services strictly under the terms, statutory disclosures, and comprehensive legal liability exemptions set forth herein.
              </p>
            </div>

            {/* Agreement Terms & Conditions (Points Format) */}
            <div className="space-y-3 pt-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 pb-1.5 border-b border-slate-200">
                TERMS &amp; CONDITIONS
              </h3>

              <ul className="space-y-3 text-xs leading-relaxed text-slate-700 list-disc pl-5">
                <li>
                  <strong>Scope of Work &amp; Deliverables:</strong> Service Provider shall develop and deliver the custom software components specified for <strong>{agreement.project_name}</strong> as defined: <span className="text-slate-900 font-medium">{agreement.scope_of_work}</span>. Any features, integrations, redesigns, architectural pivots, or maintenance requests outside this explicit scope constitute a scope change requiring separate written estimates and additional compensation.
                </li>

                <li>
                  <strong>Agency Status &amp; Statutory GST Non-Applicability:</strong> The Client explicitly acknowledges and agrees that the Service Provider is an independent, unregistered micro-enterprise whose aggregate turnover is strictly below the mandatory statutory registration threshold specified under Section 22 of the Central Goods and Services Tax (CGST) Act, 2017. Consequently, <strong>no GST is charged, levied, collected, or applicable</strong> on any fees or invoices issued under this Agreement. All agreed amounts are pure professional development fees.
                </li>

                <li>
                  <strong>Independent Contractor Status:</strong> The relationship between Service Provider and Client is strictly that of an <strong>Independent Contractor</strong>. Nothing in this Agreement shall be construed to create a partnership, joint venture, agency, franchise, or employer-employee relationship. Neither party has authority to bind the other or incur liabilities on the other&apos;s behalf.
                </li>

                <li>
                  <strong>Commercial Fees &amp; Payment Terms:</strong> The agreed total project fee is <strong>{formatINR(agreement.total_fee)}</strong>. Billing and payment schedule: <span className="font-medium text-slate-900">{agreement.payment_terms}</span>. All invoices are due upon presentation or within 7 calendar days. If Client defaults or delays payment past 7 days, Service Provider reserves the right to immediately suspend development, halt deployments, withhold repository commits, and withhold source code handover until all arrears are fully satisfied.
                </li>

                <li>
                  <strong>Client Inspection, Bug Warranty &amp; Final Acceptance:</strong> Upon deployment to a staging or production environment, Client is granted an inspection window of exactly <strong>{agreement.warranty_days || 14} calendar days</strong> (the &quot;Warranty Period&quot;) to test deliverables and notify Developer in writing of any reproducible functional bugs that deviate directly from the agreed scope. Developer shall make good-faith commercially reasonable efforts to fix verified functional defects within scope during this period. Upon the expiration of this window, or upon Client putting the software into commercial or live use (whichever occurs first), the deliverables shall be <strong>irrevocably deemed 100% accepted, complete, and final</strong>. Any subsequent bugs, alterations, OS updates, or feature additions require a separate paid maintenance engagement.
                </li>

                <li>
                  <strong>Strict &quot;AS IS&quot; Software Warranty Disclaimer:</strong> Except as expressly stipulated in the inspection window above, all software code, scripts, user interfaces, backend APIs, schemas, and deliverables are provided strictly &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;, with all faults and without warranty of any kind, whether express, implied, statutory, or otherwise. The Developer specifically disclaims all implied warranties of merchantability, fitness for a particular purpose, operability, title, uninterrupted operation, and non-infringement. The Developer does not warrant that the software will be secure against all future cyber threats, immune from bugs, uninterrupted, or compatible with every arbitrary browser, system, or hardware configuration.
                </li>

                <li>
                  <strong>Comprehensive Legal Exemption &amp; Limitation of Liability:</strong> To the maximum extent permitted by applicable law, in no event shall Service Provider, its founders, developers, subcontractors, or agents be liable to Client, Client&apos;s customers, end-users, or any third party for any direct, indirect, incidental, consequential, special, punitive, or exemplary damages whatsoever. This legal exemption includes, without limitation, damages for loss of profits, loss of revenue, loss of goodwill, loss or corruption of data, hardware failure, system breaches, DDoS attacks, business interruption, loss of commercial opportunity, reputational damage, or statutory/regulatory fines arising from or related to the software or its deployment, regardless of the legal theory or cause of action asserted (whether in contract, tort, negligence, strict liability, misrepresentation, or statute), even if the Service Provider has been expressly warned of the potential for such damages.
                </li>

                <li>
                  <strong>Maximum Aggregate Monetary Liability Cap:</strong> If, notwithstanding the comprehensive exemptions above, any competent court or arbitrator determines that the Developer cannot be fully exempted under law, <strong>the Developer&apos;s entire cumulative monetary liability arising out of or in connection with this Agreement or the software deliverables shall be strictly limited to and shall not exceed the total monetary fees actually received by the Developer from the Client under this specific Agreement</strong>, or ₹1,000 (Indian Rupees One Thousand only), whichever is less.
                </li>

                <li>
                  <strong>Third-Party Services, Cloud Platforms &amp; API Dependencies:</strong> Modern software relies upon third-party platforms, APIs, libraries, and hosting vendors. Service Provider exercises zero control over third-party server downtimes, terms-of-service revisions, pricing hikes, API deprecations, app rejections, or account suspensions. <strong>Service Provider bears zero legal or financial liability for any disruption or failure caused by third-party platforms.</strong>
                </li>

                <li>
                  <strong>Client Legal Compliance &amp; Absolute Indemnification:</strong> Client holds sole and unshared responsibility for the lawful operation of its commercial venture. Client represents and warrants that all materials, data, designs, and requirements provided to Developer do not infringe upon any copyright, trademark, privacy, or statutory right of any party. <strong>Client agrees to defend, indemnify, and hold harmless Service Provider</strong>, its proprietors, and contractors from and against any and all claims, civil actions, government investigations, regulator penalties, consumer complaints, liabilities, losses, damages, and reasonable legal/attorney expenses arising out of: (a) Client&apos;s business activities, products, or services; (b) Client&apos;s handling of end-user data under applicable data privacy laws; or (c) any breach by Client of this Agreement.
                </li>

                <li>
                  <strong>Intellectual Property &amp; Source Code Ownership:</strong> Conditioned strictly upon receipt of <strong>100% full and final payment</strong> of all agreed fees, Developer assigns to Client all right, title, and interest in the bespoke custom source code authored exclusively for Client under this Agreement. Developer retains perpetual, royalty-free rights to its pre-existing algorithms, developer tools, internal boilerplate, and open-source utility code.
                </li>

                {agreement.special_terms && (
                  <li>
                    <strong>Special Provisions &amp; Project Stipulations:</strong>{" "}
                    {agreement.special_terms
                      .replace(/\s*\(AWS,\s*Supabase,\s*Vercel\):?/gi, "")
                      .replace(/AWS,\s*Supabase,\s*Vercel:?/gi, "")
                      .trim()}
                  </li>
                )}

                <li>
                  <strong>Governing Law, Amicable Settlement &amp; Jurisdiction:</strong> This Agreement shall be governed by and construed in accordance with the substantive laws of the Republic of India. In the event of any grievance or dispute, the parties shall first attempt to resolve the issue amicably through good-faith executive discussion within 15 calendar days. Failing amicable resolution, any legal proceeding arising out of this Agreement shall be subject to the <strong>exclusive territorial jurisdiction of the competent courts located in Siddharth Nagar, UP, India</strong>.
                </li>

                <li>
                  <strong>Entire Agreement &amp; Digital Acceptance:</strong> This Agreement constitutes the entire and final understanding between the parties regarding the subject matter hereof and supersedes all prior verbal discussions, quotations, or representations. This Agreement may be executed in counterparts and via electronic signature, digital confirmation, or written email acceptance, each of which shall be deemed legally binding.
                </li>
              </ul>
            </div>

            {/* Signature Block */}
            <div className="pt-8 border-t-2 border-slate-300">
              <p className="text-center font-bold text-xs uppercase tracking-wider text-slate-700 mb-6">
                IN WITNESS WHEREOF, THE PARTIES HAVE DULY EXECUTED THIS AGREEMENT
              </p>

              <div className="grid grid-cols-2 gap-12 text-xs">
                {/* Developer Side */}
                <div className="space-y-3">
                  <p className="font-mono uppercase font-bold text-[10px] text-slate-500 tracking-wider">
                    FOR SERVICE PROVIDER (DEVELOPER)
                  </p>
                  <p className="font-bold text-slate-900">{companyName}</p>

                  <div className="pt-2">
                    {branding.signatureUrl ? (
                      <div className="flex flex-col items-start mb-1">
                        <img
                          src={branding.signatureUrl}
                          alt="Authorized Signature"
                          className="h-12 max-w-[160px] object-contain"
                        />
                        <div className="border-b border-slate-400 w-48 mt-1"></div>
                      </div>
                    ) : (
                      <div className="h-12 border-b border-dashed border-slate-400 w-48 mb-1"></div>
                    )}
                    <p className="text-[10px] font-medium text-slate-700 uppercase tracking-wider mt-1">
                      {branding.signatoryName || "Authorized Signatory"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Date:{" "}
                      {new Date(agreement.effective_date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Client Side */}
                <div className="space-y-3">
                  <p className="font-mono uppercase font-bold text-[10px] text-slate-500 tracking-wider">
                    FOR CLIENT (CUSTOMER)
                  </p>
                  <p className="font-bold text-slate-900">{clientName}</p>

                  <div className="pt-2">
                    <div className="h-12 border-b border-dashed border-slate-400 w-48 mb-1"></div>
                    <p className="text-[10px] font-medium text-slate-700 uppercase tracking-wider mt-1">
                      Authorized Signatory / Officer
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Name: {clientContactName}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Date: ________________________
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer buttons */}
        <div className="no-print flex items-center justify-between px-6 py-3 border-t border-border bg-surface-elevated">
          <p className="text-xs text-muted">
            Clicking &quot;Print / Save as PDF&quot; generates a signed, client-ready legal PDF agreement.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
