/**
 * Company configuration. EVERY value here must be verified against the
 * incorporation documents and approved scheme documents before launch.
 * `null` = not yet supplied: public pages hide the field, the admin
 * compliance console lists it as "missing information".
 */
export interface VerifiedField {
  label: string;
  value: string | null;
}

export const company = {
  /** Match exactly to the certificate of incorporation before launch. */
  displayName: "MS Chit Funds Pvt. Ltd.",
  shortName: "MS Chit Funds",
  tagline: "Traditional trust. Transparent technology.",
  description:
    "A Tamil Nadu chit fund company building a clearer, more transparent way to participate in chit schemes.",
  state: "Tamil Nadu",
  /** Set to a message to show the top announcement strip, or null to hide it. */
  announcement: "Discover a more transparent way to participate in a chit.",
  /** Real contact details are null until supplied. */
  contact: {
    phone: null as string | null,
    email: null as string | null,
    whatsapp: null as string | null,
    registeredOffice: null as string | null,
    hours: null as string | null,
  },
  social: {
    facebook: null as string | null,
    instagram: null as string | null,
    youtube: null as string | null,
    linkedin: null as string | null,
  },
  /** Facts shown on the public Transparency page ONLY when value !== null. */
  verifiedFacts: [
    { label: "Legal company name", value: null },
    { label: "Corporate Identification Number (CIN)", value: null },
    { label: "Registered office", value: null },
    { label: "Registrar of Chits registration (Tamil Nadu)", value: null },
    { label: "Scheme sanction / approval references", value: null },
    { label: "Grievance officer name & contact", value: null },
    { label: "Data protection & security policy reference", value: null },
  ] as VerifiedField[],
} as const;

export const demoMode = {
  enabled: true,
  banner:
    "DEMO MODE — all data, payments, auctions and approvals on this site are simulated.",
  /** Development-only OTP for the simulated sign-in. Never use real OTPs here. */
  devOtp: "123456",
};

export const publicNav = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/chit-plans", label: "Explore Chits" },
  { href: "/transparency", label: "Transparency" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
] as const;
