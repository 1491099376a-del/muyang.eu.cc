"use client";

import { useEffect, useRef } from "react";

type Theme = "system" | "light" | "dark";

export const themeScript = `(() => {
  let theme = 'system';
  try { theme = localStorage.getItem('theme') || 'system'; } catch {}
  const dark = theme === 'dark' || (theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();`;

function applyTheme(theme: Theme) {
  const dark = theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function ThemeSelect() {
  const select = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    let stored = "system";
    try { stored = localStorage.getItem("theme") || "system"; } catch {}
    if (select.current) {
      select.current.value = ["light", "dark"].includes(stored) ? stored : "system";
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => applyTheme((select.current?.value || "system") as Theme);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <select
      ref={select}
      aria-label="颜色主题"
      defaultValue="system"
      className="theme-select"
      onChange={(event) => {
        const theme = event.target.value as Theme;
        applyTheme(theme);
        try { localStorage.setItem("theme", theme); } catch {}
      }}
    >
      <option value="system">跟随系统</option>
      <option value="light">浅色模式</option>
      <option value="dark">深色模式</option>
    </select>
  );
}
