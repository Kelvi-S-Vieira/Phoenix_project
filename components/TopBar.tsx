"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function readSavedTheme(): "dark" | "light" {
  try {
    return localStorage.getItem("fenix_theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export interface TopBarNavLink {
  href: string;
  label: string;
}

export default function TopBar({
  title,
  nav,
}: {
  title: string;
  /** Optional nav links shown under the title row (e.g. Dashboard/Medidas/Treino). */
  nav?: TopBarNavLink[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  // Lazy initializer: reads localStorage once, synchronously, on first
  // render — no effect needed (and the saved theme was already applied
  // before paint by the inline script in app/layout.tsx, so this just
  // keeps the toggle button's icon in sync with it).
  const [theme, setTheme] = useState<"dark" | "light">(readSavedTheme);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("fenix_theme", next);
    } catch {
      // best-effort only
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="fx-topbar-wrap">
      <div className="fx-topbar">
        <div className="fx-topbar-brand">
          <span className="flame">🔥</span> {title}
        </div>
        <div className="fx-topbar-actions">
          <button className="btn ghost small" type="button" onClick={toggleTheme}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button className="btn ghost small" type="button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
      {nav && nav.length > 0 && (
        <nav className="fx-topbar-nav">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={"fx-topbar-nav-link" + (pathname === item.href ? " active" : "")}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
