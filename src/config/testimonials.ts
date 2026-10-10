/**
 * Verified testimonials ONLY. Each entry must have written consent from the
 * named person and be verified by the company before being added here.
 * While this array is empty, the homepage shows a neutral product-benefit
 * section instead. Never add placeholder or invented quotes.
 */
export interface Testimonial {
  quote: string;
  name: string;
  /** e.g. city or relationship to the company, as consented. */
  descriptor?: string;
}

export const testimonials: Testimonial[] = [];
