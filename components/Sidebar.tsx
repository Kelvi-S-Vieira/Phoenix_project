"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  formatWeight,
  setWeightUnit,
  type WeightUnit,
} from "@/lib/weight-unit";

import { applyTheme, readTheme } from "@/lib/theme";

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
  const [theme, setTheme] = useState<"dark" | "light">(readTheme);
  const [accent, setAccent] = useState<AccentKey>(readSavedAccent);
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>(unit);
  // Mobile/tablet drawer (<900px). On wider screens the sidebar is persistent
  // and this state is ignored by CSS.
  const [open, setOpen] = useState(false);
  const [openedFor, setOpenedFor] = useState(pathname);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  // Close when the route changes (adjusting state during render, per React docs).
  if (openedFor !== pathname) {
    setOpenedFor(pathname);
    setOpen(false);
  }

  const closeDrawer = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDrawer();
        return;
      }
      if (e.key === "Tab" && drawerRef.current) {
        // Simple focus trap inside the open drawer.
        const f = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    document.body.classList.add("fx-drawer-open");
    // Move focus into the drawer.
    const raf = requestAnimationFrame(() =>
      drawerRef.current?.querySelector<HTMLElement>(".sidebar-close")?.focus(),
    );
    // If the viewport grows to the persistent-sidebar width, reset.
    const mq = window.matchMedia("(min-width: 900px)");
    const onMq = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onMq);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("fx-drawer-open");
      mq.removeEventListener("change", onMq);
    };
  }, [open, closeDrawer]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
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
              aria-current={pathname === item.href ? "page" : undefined}
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
    <>
    <button
      ref={toggleRef}
      type="button"
      className="sidebar-toggle"
      aria-label={open ? "Fechar menu" : "Abrir menu"}
      aria-expanded={open}
      aria-controls="fx-sidebar"
      onClick={() => setOpen((o) => !o)}
    >
      <span className="sidebar-toggle-bars" aria-hidden="true"></span>
    </button>
    <div
      className={"sidebar-overlay" + (open ? " open" : "")}
      onClick={closeDrawer}
      aria-hidden="true"
    />
    <aside
      id="fx-sidebar"
      ref={drawerRef}
      className={"sidebar" + (open ? " open" : "")}
      aria-label="Menu principal"
    >
      <button
        type="button"
        className="sidebar-close"
        aria-label="Fechar menu"
        onClick={closeDrawer}
      >
        ×
      </button>
      <div className="brand">
        <div className="brand-eyebrow">{eyebrow}</div>
        <div className="brand-title">Projeto Fênix</div>
        <div className="fx-account-role" style={{ marginTop: 8 }}>
          {accountName}
        </div>
      </div>

      <div className="sidebar-nav">{nav}</div>

      <div className="sidebar-footer">
        <button
          type="button"
          className="nav-item nav-item-btn"
          onClick={toggleTheme}
          style={{ marginTop: 14 }}
          aria-label={theme === "dark" ? "Mudar para o tema claro" : "Mudar para o tema escuro"}
        >
          <span className="dot"></span>
          {theme === "dark" ? "🌙 Tema escuro" : "☀️ Tema claro"}
        </button>

        <div className="fx-accent-picker-sidebar fx-accent-picker">
          <span className="fx-accent-picker-label">Cor:</span>
          {ACCENTS.map((a) => (
            <button
              type="button"
              key={a.key}
              className={"fx-accent-swatch-mini" + (accent === a.key ? " selected" : "")}
              data-accent={a.key}
              title={a.title}
              aria-label={`Cor ${a.title}`}
              aria-pressed={accent === a.key}
              onClick={() => handleAccentClick(a.key)}
            />
          ))}
        </div>

        {variant === "aluno" && (
          <div className="fx-unit-toggle">
            <span className="fx-unit-toggle-label">Unidade:</span>
            <div className="fx-unit-toggle-pill">
              <button
                type="button"
                className={"fx-unit-opt" + (weightUnit === "kg" ? " active" : "")}
                data-unit="kg"
                aria-pressed={weightUnit === "kg"}
                onClick={() => handleUnitClick("kg")}
              >
                kg
              </button>
              <button
                type="button"
                className={"fx-unit-opt" + (weightUnit === "lb" ? " active" : "")}
                data-unit="lb"
                aria-pressed={weightUnit === "lb"}
                onClick={() => handleUnitClick("lb")}
              >
                lb
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          className="nav-item nav-item-btn"
          onClick={handleLogout}
          style={{ marginTop: 6 }}
        >
          <span className="dot"></span>
          Sair
        </button>
      </div>
    </aside>
    </>
  );
}
