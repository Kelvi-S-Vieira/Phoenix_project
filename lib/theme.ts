// Tema claro/escuro. A escolha salva (localStorage `fenix_theme`) tem prioridade;
// sem escolha salva vale `prefers-color-scheme` do sistema (ver themeInitScript
// em app/layout.tsx, que aplica o atributo antes da primeira pintura).
export type Theme = "dark" | "light";
export const THEME_STORAGE_KEY = "fenix_theme";

/** Tema atual: escolha salva > atributo já aplicado pelo bootstrap > sistema > escuro. */
export function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // localStorage indisponível — cai para o atributo/sistema
  }
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
  }
  try {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  } catch {
    // ignore
  }
  return "dark";
}

/** Aplica e persiste o tema, com transição de ~180 ms (desligada por prefers-reduced-motion no CSS). */
export function applyTheme(next: Theme): void {
  const root = document.documentElement;
  root.classList.add("fx-theme-switching");
  root.setAttribute("data-theme", next);
  window.setTimeout(() => root.classList.remove("fx-theme-switching"), 260);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // best-effort only
  }
}
