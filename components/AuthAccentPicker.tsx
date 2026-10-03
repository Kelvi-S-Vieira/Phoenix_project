"use client";

import { useState } from "react";

// Ported from the prototype's `#fx_accentPicker` (projeto_fenix_app_final.html,
// ~lines 3613-3618 for the markup, ~18000/18500 for the click wiring): lets
// logged-out visitors preview/set the accent color right from the login/signup
// screen. Uses the SAME localStorage key the prototype does
// (`fenix_login_accent`) and applies it to <html data-accent> immediately, so
// the choice is already in effect (and picked up by app/layout.tsx's
// pre-paint script) by the time they sign in.
const ACCENT_STORAGE_KEY = "fenix_login_accent";

type AccentKey = "ember" | "aco" | "verde";
const ACCENTS: { key: AccentKey; title: string }[] = [
  { key: "ember", title: "Ember (padrão)" },
  { key: "aco", title: "Aço" },
  { key: "verde", title: "Verde Força" },
];

function readSavedAccent(): AccentKey {
  try {
    const v = localStorage.getItem(ACCENT_STORAGE_KEY);
    return v === "aco" || v === "verde" ? v : "ember";
  } catch {
    return "ember";
  }
}

export default function AuthAccentPicker() {
  const [accent, setAccent] = useState<AccentKey>(readSavedAccent);

  function handleClick(next: AccentKey) {
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

  return (
    <div className="fx-accent-picker">
      {ACCENTS.map((a) => (
        <div
          key={a.key}
          className={"fx-accent-swatch" + (accent === a.key ? " selected" : "")}
          data-accent={a.key}
          title={a.title}
          onClick={() => handleClick(a.key)}
        />
      ))}
    </div>
  );
}
