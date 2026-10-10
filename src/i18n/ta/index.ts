import { home } from "./home";
import { pages } from "./pages";
import { app } from "./app";

/**
 * Tamil translations keyed by the EXACT English source string.
 * DRAFT machine-quality Tamil — must be reviewed by a human translator.
 * Legal copy (privacy, terms, scheme legal placeholders) is intentionally
 * NOT translated until legal review; those pages show an English notice.
 */
export const taMap: Record<string, string> = { ...home, ...pages, ...app };
