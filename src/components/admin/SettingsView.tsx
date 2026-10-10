"use client";
import { company, demoMode } from "@/config/company";
import { Badge } from "@/components/ui/Badge";
import { KeyValue, PageHeader, Panel } from "./common";

const v = (x: string | null) => (x === null ? <Badge tone="danger">Not supplied</Badge> : x);

export function SettingsView() {
  return (
    <>
      <PageHeader title="Settings" description="Read-only view of the configuration this build runs with. Nothing on this page can be edited or saved from the browser." />
      <div className="space-y-5">
        <Panel title="Company configuration (src/config/company.ts)">
          <KeyValue items={[
            { k: "Display name", v: company.displayName }, { k: "Short name", v: company.shortName }, { k: "Tagline", v: company.tagline }, { k: "State", v: company.state },
            { k: "Phone", v: v(company.contact.phone) }, { k: "Email", v: v(company.contact.email) }, { k: "WhatsApp", v: v(company.contact.whatsapp) },
            { k: "Registered office", v: v(company.contact.registeredOffice) }, { k: "Hours", v: v(company.contact.hours) },
          ]} />
          <h3 className="mb-2 mt-5 text-sm font-bold text-navy">Verified facts (shown on the public Transparency page only when supplied)</h3>
          <KeyValue items={company.verifiedFacts.map((f) => ({ k: f.label, v: v(f.value) }))} />
        </Panel>
        <Panel title="Feature flags">
          <KeyValue items={[
            { k: "Demo mode", v: <Badge tone={demoMode.enabled ? "gold" : "neutral"}>{demoMode.enabled ? "Enabled" : "Disabled"}</Badge> },
            { k: "Demo banner text", v: demoMode.banner },
            { k: "Top announcement strip", v: company.announcement ?? <Badge tone="neutral">Hidden</Badge> },
            { k: "Search-engine indexing", v: "Controlled by NEXT_PUBLIC_ALLOW_INDEXING (off unless 'true')" },
          ]} />
        </Panel>
        <Panel title="What must be verified before launch">
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            <li>Legal name, CIN, registered office and Registrar of Chits registration match the incorporation and registration documents.</li>
            <li>Every scheme has an approved agreement and commencement approval attached; no scheme may be activated without both.</li>
            <li>Real authentication, authorisation and maker-checker enforcement exist on the server. The demo role switch is not security.</li>
            <li>Payments, reconciliation and ledgers are driven by a real gateway, bank files and an authoritative backend.</li>
            <li>Audit logs are tamper-evident and server-side; personal data access is permissioned and logged.</li>
            <li>Document storage is private, encrypted and malware-scanned; KYC uses an approved provider.</li>
            <li>Grievance officer, data-protection policy and regulatory reporting obligations are confirmed by legal counsel.</li>
          </ul>
        </Panel>
        <Panel title="Language and environment">
          <p className="text-sm">The site supports English and Tamil through <code className="rounded bg-ivory px-1">src/i18n</code>. Admin screens are English-only in this build; Tamil labels would be added to the dictionaries with the same keys. The chosen language is remembered in the browser and is not a setting stored by the company.</p>
          <p className="mt-3 text-sm">Environment values are read at build time from <code className="rounded bg-ivory px-1">.env.local</code>. Example (placeholders only, never commit real secrets):</p>
          <pre className="mt-2 overflow-x-auto rounded-md bg-navy p-3 text-xs text-ivory">{`NEXT_PUBLIC_SITE_URL=https://example.invalid
NEXT_PUBLIC_ALLOW_INDEXING=false`}</pre>
          <p className="mt-3 text-xs text-muted">Changing configuration means editing code or environment and redeploying. This console deliberately offers no save button.</p>
        </Panel>
      </div>
    </>
  );
}
