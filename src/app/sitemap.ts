import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url },
    ...site.notes.items.map((note) => ({ url: `${site.url}/notes/${note.slug}`, lastModified: note.date })),
  ];
}
