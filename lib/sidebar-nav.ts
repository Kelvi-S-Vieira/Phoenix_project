import type { SidebarNavSection } from "@/components/Sidebar";

// Mirrors the prototype's aluno sidebar (projeto_fenix_app_final.html,
// lines 3722-3743), minus the sections/items that don't have a page in this
// port yet:
//   - "Visão Geral": the prototype also has "Meu Perfil" (data-page="perfil")
//     and "Diário" (data-page="diario") — neither page exists in this port,
//     so only "Dashboard" is linked here.
//   - "Treino": "🕊️ Terceira Idade" isn't built yet, and "🔥 Jovem" was
//     dropped from scope entirely (2026-10-01 product decision) — only
//     "🏋️ Treino" is linked. "Calendário" has no page in this port either.
//   - "Nutrição": "🍽️ Alimentação" has no page in this port — section
//     omitted entirely rather than linking a 404.
//   - "Progresso": the prototype links a single "/progresso" page; this
//     port instead has separate "/medidas" and "/fotos" pages, so both are
//     linked under this section.
//   - "Guia & Planos": none of "Guia", "Plano 17sem" or "🎯 Montar Plano"
//     have pages in this port yet (future work per MIGRATION_PLAN.md) — the
//     whole section is omitted.
export const ALUNO_SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    label: "Visão Geral",
    items: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/onboarding", label: "Meu Perfil" },
    ],
  },
  {
    label: "Treino",
    items: [{ href: "/treino", label: "Treino", icon: "🏋️" }],
  },
  {
    label: "Progresso",
    items: [
      { href: "/medidas", label: "Medidas" },
      { href: "/fotos", label: "Fotos" },
    ],
  },
];

export const PERSONAL_SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    label: "Acompanhamento",
    items: [{ href: "/personal", label: "Meus Alunos", icon: "📋" }],
  },
];
