import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/profile", "/settings", "/api"],
    },
    sitemap: "https://realtor.regalpdc.com/sitemap.xml",
  };
}
