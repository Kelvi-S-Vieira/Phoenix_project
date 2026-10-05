import type { SidebarNavSection } from "@/components/Sidebar";

// Mirrors the prototype's aluno sidebar (projeto_fenix_app_final.html,
// lines 3722-3743), minus the sections/items that don't have a page in this
// port yet:
//   - "Visão Geral": the prototype also has "Meu Perfil" (data-page="perfil")
//     — now linked here. "Diário" (data-page="diario") is linked under
//     "Nutrição" below, now that /diario exists in this port.
//   - "Treino": "🔥 Jovem" was dropped from scope entirely (2026-10-01
//     product decision, LGPD). Terceira Idade is reached by picking it as a
//     tier inside "🏋️ Treino" (TierPicker), same as Básico/Intermediário/
//     Avançado — it does not get its own sidebar item.
//   - "Nutrição": "🍽️ Alimentação" is now linked, as 3 separate pages
//     (Marmitas, Suplementação, Receitas Fit) rather than the prototype's
//     single page with an internal sub-nav.
//   - "Progresso": the prototype links a single "/progresso" page; this
//     port instead has separate "/medidas" and "/fotos" pages, so both are
//     linked under this section.
//   - "Guia & Planos": "🎯 Montar Plano", "Plano 17sem" and "Calendário" now
//     have pages (unified engine, see lib/plan-generation.ts and
//     MIGRATION_PLAN.md). "Guia" is now linked too, as a generic reference
//     page (no owner-specific clinical data — see app/guia/page.tsx).
export const ALUNO_SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    label: "Visão Geral",
    items: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/perfil", label: "Meu Perfil" },
    ],
  },
  {
    label: "Treino",
    items: [{ href: "/treino", label: "Treino", icon: "🏋️" }],
  },
  {
    label: "Nutrição",
    items: [
      { href: "/diario", label: "Diário", icon: "🍽️" },
      { href: "/dieta", label: "Dieta", icon: "🥗" },
      { href: "/alimentacao/marmitas", label: "Marmitas" },
      { href: "/alimentacao/suplementacao", label: "Suplementação" },
      { href: "/alimentacao/receitas", label: "Receitas Fit" },
    ],
  },
  {
    label: "Progresso",
    items: [
      { href: "/medidas", label: "Medidas" },
      { href: "/fotos", label: "Fotos" },
    ],
  },
  {
    label: "Guia & Planos",
    items: [
      { href: "/montar-plano", label: "Montar Plano", icon: "🎯" },
      { href: "/plano17", label: "Plano semanal" },
      { href: "/calendario", label: "Calendário" },
      { href: "/guia", label: "Guia" },
    ],
  },
];

export const PERSONAL_SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    label: "Acompanhamento",
    items: [{ href: "/personal", label: "Meus Alunos", icon: "📋" }],
  },
];
