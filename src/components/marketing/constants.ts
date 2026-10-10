import { formatLakh } from "@/lib/money";
import type { Paise } from "@/lib/money";
import { schemes } from "@/data/demo";
import type { Scheme } from "@/data/types";

/** Illustrative auction discount used for homepage / methodology examples (15%). */
export const ILLUSTRATIVE_DISCOUNT_BPS = 1500;

/** Scheme used for the hero summary card and homepage examples. */
export const showcaseScheme: Scheme = schemes[0];

/** formatLakh with the lakh/crore unit translated. */
export const lakh = (tr: (en: string) => string, p: Paise) => formatLakh(p).replace(/ (lakh|crore)$/, (_, u: string) => ` ${tr(u)}`);
