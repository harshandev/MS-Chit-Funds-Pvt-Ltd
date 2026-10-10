/** All money is stored as integer paise to avoid floating-point drift. */
export type Paise = number;

export const rupees = (r: number): Paise => Math.round(r * 100);

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const inrPrecise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹1,00,000 — whole rupees. */
export const formatINR = (p: Paise): string => inr.format(p / 100);
/** ₹1,00,000.50 — with paise. */
export const formatINRPrecise = (p: Paise): string => inrPrecise.format(p / 100);

/** Compact lakh/crore label: ₹3 lakh. */
export function formatLakh(p: Paise): string {
  const r = p / 100;
  if (r >= 1_00_00_000) return `₹${+(r / 1_00_00_000).toFixed(2)} crore`;
  if (r >= 1_00_000) return `₹${+(r / 1_00_000).toFixed(2)} lakh`;
  return formatINR(p);
}

/** Percent is carried as basis points (500 = 5%). */
export type Bps = number;
export const pctToBps = (pct: number): Bps => Math.round(pct * 100);
export const applyBps = (p: Paise, bps: Bps): Paise => Math.round((p * bps) / 10000);
export const formatBps = (b: Bps): string => `${+(b / 100).toFixed(2)}%`;
