import type { MetadataRoute } from "next";
import { schemes } from "@/data/demo";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const routes = ["/", "/how-it-works", "/chit-plans", "/calculator", "/transparency", "/about", "/contact", "/faq", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...routes.map((r) => ({ url: `${base}${r}`, lastModified: now, priority: r === "/" ? 1 : 0.7 })),
    ...schemes.map((s) => ({ url: `${base}/chit-plans/${s.id}`, lastModified: now, priority: 0.6 })),
  ];
}
