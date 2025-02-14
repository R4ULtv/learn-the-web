import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string): string => new URL(path, baseUrl).toString();

  return [
    {
      url: url("/"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
