import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return { rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/login", "/register"] }, sitemap: `${base}/sitemap.xml` };
}
