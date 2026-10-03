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

export interface SidebarNavItem {
  href: string;
  label: string;
  icon?: string;
}

export interface SidebarNavSection {
  label: string;
  items: SidebarNavItem[];
}

export default function Sidebar({
  variant,
  accountName,
  currentWeight,
  targetWeight,
  sections,
}: {
  /** "aluno" shows the weight eyebrow + full nav; "personal" shows the simpler panel. */
  variant: "aluno" | "personal";
  /** Shown under the brand title, e.g. "Kelvin · Aluno" / "Kelvin · Personal". */
  accountName: string;
  /** Only used for the aluno variant's brand eyebrow ("82 kg → 75 kg"). */
  currentWeight?: number | null;
  targetWeight?: number | null;
  sections: SidebarNavSection[];
}) {
  const router = useRouter();
  const pathname = usePathname();
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

  const eyebrow =
    variant === "aluno"
      ? currentWeight != null && targetWeight != null
        ? `${currentWeight} kg → ${targetWeight} kg`
        : currentWeight != null
          ? `${currentWeight} kg`
          : targetWeight != null
            ? `Meta: ${targetWeight} kg`
            : "Projeto Fênix"
      : "Painel do Personal";

  const nav = (
    <>
      {sections.map((section) => (
        <div key={section.label}>
          <div className="nav-section-label">{section.label}</div>
          {section.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={"nav-item" + (pathname === item.href ? " active" : "")}
            >
              <span className="dot"></span>
              {item.icon ? `${item.icon} ` : ""}
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </>
  );

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-eyebrow">{eyebrow}</div>
        <div className="brand-title">Projeto Fênix</div>
        <div className="fx-account-role" style={{ marginTop: 8 }}>
          {accountName}
        </div>
      </div>

      {nav}

      <div className="nav-item" onClick={toggleTheme} style={{ marginTop: 14 }}>
        <span className="dot"></span>
        {theme === "dark" ? "🌙 Tema escuro" : "☀️ Tema claro"}
      </div>
      <div className="nav-item" onClick={handleLogout} style={{ marginTop: 6 }}>
        <span className="dot"></span>
        Sair
      </div>
    </aside>
  );
}
