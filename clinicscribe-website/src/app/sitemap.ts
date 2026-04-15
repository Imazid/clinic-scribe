import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants";

const BASE_URL = BRAND.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    "/product",
    "/pricing",
    "/about",
    "/blog",
    "/faq",
    "/safety",
    "/privacy",
    "/terms",
    "/demo",
    "/use-cases",
    "/integrations",
    "/integrations/genie",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/pricing" ? 0.9 : 0.7,
  }));
}
