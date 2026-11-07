import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { projectDetails } from "@/data/project-details";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url },
    { url: `${site.url}/projects` },
    ...projectDetails.map((project) => ({ url: `${site.url}/projects/${project.slug}` })),
    ...site.notes.items.map((note) => ({ url: `${site.url}/notes/${note.slug}`, lastModified: note.date })),
  ];
}
