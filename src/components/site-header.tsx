import Link from "next/link";
import { site } from "@/data/site";
import { ThemeSelect } from "@/components/theme-select";

export function SiteHeader() {
  return (
    <header className="site-header shell">
      <Link href="/" aria-label={`${site.name} 首页`} className="wordmark">
        {site.name.toLowerCase()}<span aria-hidden="true">.</span>
      </Link>
      <nav aria-label="主导航">
        {site.navigation.map((item) => (
          <Link key={item.href} href={`/${item.href}`}>{item.label}</Link>
        ))}
      </nav>
      <ThemeSelect />
    </header>
  );
}
