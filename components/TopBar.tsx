"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function readSavedTheme(): "dark" | "light" {
  try {
    return localStorage.getItem("fenix_theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export default function TopBar({ title }: { title: string }) {
  const router = useRouter();
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
  );
}
