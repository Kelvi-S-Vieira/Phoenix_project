"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  formatWeight,
  setWeightUnit,
  type WeightUnit,
} from "@/lib/weight-unit";

function readSavedTheme(): "dark" | "light" {
  try {
    return localStorage.getItem("fenix_theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

// "ember" is the default accent (no data-accent attribute needed).
export type AccentKey = "ember" | "aco" | "verde";
const ACCENTS: { key: AccentKey; title: string }[] = [
  { key: "ember", title: "Ember (padrão)" },
  { key: "aco", title: "Aço" },
  { key: "verde", title: "Verde Força" },
];
// Matches the prototype's real key (`fenix_login_accent`) — see app/layout.tsx.
const ACCENT_STORAGE_KEY = "fenix_login_accent";

function readSavedAccent(): AccentKey {
  try {
    const v = localStorage.getItem(ACCENT_STORAGE_KEY);
    return v === "aco" || v === "verde" ? v : "ember";
  } catch {
    return "ember";
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
  unit = "kg",
}: {
  /** "aluno" shows the weight eyebrow + full nav; "personal" shows the simpler panel. */
  variant: "aluno" | "personal";
  /** Shown under the brand title, e.g. "Kelvin · Aluno" / "Kelvin · Personal". */
  accountName: string;
  /** Only used for the aluno variant's brand eyebrow ("82 kg → 75 kg"). Always in kg — converted for display using `unit`. */
  currentWeight?: number | null;
  targetWeight?: number | null;
  sections: SidebarNavSection[];
  /** The server-resolved kg/lb preference (from `getServerWeightUnit()`), so the eyebrow renders in the right unit on first paint. */
  unit?: WeightUnit;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">(readSavedTheme);
  const [accent, setAccent] = useState<AccentKey>(readSavedAccent);
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>(unit);

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

  function handleAccentClick(next: AccentKey) {
    setAccent(next);
    if (next === "ember") {
      document.documentElement.removeAttribute("data-accent");
    } else {
      document.documentElement.setAttribute("data-accent", next);
    }
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, next);
    } catch {
      // best-effort only
    }
  }

  function handleUnitClick(next: WeightUnit) {
    if (next === weightUnit) return;
    setWeightUnitState(next);
    setWeightUnit(next);
    // Re-renders every Server Component on the page (Dashboard's weight
    // cards, the personal's aluno-detail stats, etc.) using the new cookie
    // value, and updates this component's own `unit` prop too.
    router.refresh();
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
        ? `${formatWeight(currentWeight, weightUnit)} → ${formatWeight(targetWeight, weightUnit)}`
        : currentWeight != null
          ? formatWeight(currentWeight, weightUnit)
          : targetWeight != null
            ? `Meta: ${formatWeight(targetWeight, weightUnit)}`
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

      <div className="fx-accent-picker-sidebar fx-accent-picker">
        <span className="fx-accent-picker-label">Cor:</span>
        {ACCENTS.map((a) => (
          <div
            key={a.key}
            className={"fx-accent-swatch-mini" + (accent === a.key ? " selected" : "")}
            data-accent={a.key}
            title={a.title}
            onClick={() => handleAccentClick(a.key)}
          />
        ))}
      </div>

      {variant === "aluno" && (
        <div className="fx-unit-toggle">
          <span className="fx-unit-toggle-label">Unidade:</span>
          <div className="fx-unit-toggle-pill">
            <span
              className={"fx-unit-opt" + (weightUnit === "kg" ? " active" : "")}
              data-unit="kg"
              onClick={() => handleUnitClick("kg")}
            >
              kg
            </span>
            <span
              className={"fx-unit-opt" + (weightUnit === "lb" ? " active" : "")}
              data-unit="lb"
              onClick={() => handleUnitClick("lb")}
            >
              lb
            </span>
          </div>
        </div>
      )}

      <div className="nav-item" onClick={handleLogout} style={{ marginTop: 6 }}>
        <span className="dot"></span>
        Sair
      </div>
    </aside>
  );
}
