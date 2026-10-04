import { site } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <span>© {new Date().getFullYear()} {site.name}</span>
      <span>{site.footer}</span>
      <span>{new URL(site.url).hostname}</span>
    </footer>
  );
}
