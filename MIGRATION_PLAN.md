# Migration checklist — fenix-web vs. projeto_fenix_app_final.html

Checklist derived from a full module-by-module audit comparing the
prototype against this port. Update a box to `[x]` only when it's actually
shipped (code merged, build/lint clean) — not when it's merely planned.

## Product decisions (made 2026-10-01)

- **Modo Jovem**: out of scope, will not be built (LGPD — the prototype's
  youth mode addresses minors directly).
- **Guia**: build a generic version only — none of the owner's personal
  clinical data.
- **Plano 17 semanas**: keep visible to all users, but generalized —
  computed from each user's own plan (start date, duration, targets), not
  hardcoded dates or gated by name. Unified with Montar Plano's engine.

## Done

- [x] Treino: week-wide log loading (was today-only)
- [x] Measurements no longer count toward streak
- [x] All "today"/weekday calculations use America/Sao_Paulo (was server UTC)
- [x] Avançado calisthenics reorganized by movement pattern (empurrar/puxar/pernas/core)
- [x] RLS hardening (personal_lookup view, self-update column locking, invite-code RPCs, workout_log_entries DELETE policy)
- [x] Post-signup "enter invite code" screen
- [x] Avançado builder base: sections 0-4, multi-group days, anatomical portions, equipment/level filters, rest timer
- [x] Avançado tabs — Musculação/Calistenia/Cardio/Aquecimento (full fidelity)
- [x] Avançado tabs — HIIT/Tabata/HYROX/CrossFit/Esportes (generic entry form only — see Item 6)
- [x] Left sidebar nav with icons (replacing per-page TopBar)
- [x] CSS/typography parity pass across every existing page (fonts, cards, auth screens, forms)
- [x] Dashboard: flame gauge, Cargas, Cardio semanal, Composição corporal, Metas da fase, Conta & dados (PDF print + JSON backup export)
- [x] Treino Básico/Intermediário: exact prototype structure/copy (intro cards, section wording)
- [x] Fotos: drag-slider compare + client-side image resize before upload
- [x] Profile editing (reopen onboarding any time, recalculates targets)
- [x] kg/lb toggle (sidebar + every weight display)
- [x] Accent color picker (sidebar + login/signup)
- [x] Onboarding: pace-suggestion cards, end-date hint, risk feedback (step 4); protein/kg, pace card, formula breakdown (step 5)
- [x] Diário (food diary): day nav, 4 macro cards, meal tabs, food search (204 items) + manual entry

## Build-order items (all shipped)

### 4. Alimentação — Marmitas, Suplementação, Receitas Fit ✅ done
- [x] Marmitas: 145 suggested recipes (category + fast/vegan filters)
- [x] Marmitas: user's own recipes (create/edit, JSON export; import skipped — doesn't map cleanly onto a real DB, per established project judgment)
- [x] Marmitas: weekly meal-prep planning
- [x] Marmitas: shopping list (extras have a real checked column; aggregated-ingredient checks are session-only)
- [x] Suplementação: 79 supplement cards (prototype actually has 79, not 77 — tag filters, goal-based default, medical disclaimer). Dropped the prototype's fabricated brand/product-photo content.
- [x] Receitas Fit: 53 recipes (goal/macros/supplements/steps)
- [x] New tables: `user_recipes`, `meal_prep_plan`, `shopping_extras`

### 5. Montar Plano + Calendário ✅ done
- [x] Montar Plano setup (weeks/diet/level/split) — `app/montar-plano/PlanSetupForm.tsx`
- [x] Week-by-week generation engine — `lib/plan-generation.ts` (shared by Montar Plano + Plano17)
- [x] Montar Plano progress view (edit/delete, one active plan per user — enforced app-side) — `app/montar-plano/page.tsx` + `PlanActions.tsx`
- [x] Plano 17 semanas generalized, reading from the same engine, gated on "has an active plan" instead of account name — `app/plano17/page.tsx`
- [x] Calendário: own per-day log (status + note), plan-sized (or rolling 84-day) grid, milestone markers — no hardcoded user data — `app/calendario/page.tsx` + `CalendarGrid.tsx`
- [x] New table: `calendar_days`; `custom_plans` extended (`updated_at`, diet check constraint); `profiles.calendar_start_date` added — `supabase/migration_plano.sql`

### 6. Avançado — finish the custom builder ✅ done
- [x] Curated HIIT pool (33 exercises, `lib/treino-circuitos-data.ts`)
- [x] Curated Tabata pool (47 exercises)
- [x] Curated HYROX pool (22 — 8 official stations + 14 equipment-free alternatives, grouped by sub-heading)
- [x] Curated CrossFit pool (39 exercises) + format select (AMRAP/EMOM/For Time/Rounds for Time)
- [x] Full circuit builder: rounds/work/rest, intensity presets ("montar circuito sugerido"), "montar por tempo total", real duration/kcal estimate from exercise×round×work/rest composition — `lib/treino-avancado-builder.ts`
- [x] Elder/low-impact warning on all 4 tabs when the idoso level filter is active
- [x] Training-log history keyed by day-independent `exerciseKey()` — `exercise_set_logs` table, one row per logged set
- [x] 1RM calculation (Epley formula), personal-record (PR) tracking, automatic progression suggestions (reps→carga→volume→rezone→swap ladder), deload warnings, 1RM sparkline — `lib/treino-progression.ts`, wired into `MusculacaoTab`'s exercise rows (collapsed behind the existing "detalhes" toggle)
- [x] Exercise swap (keeps sets/reps/warmup config, preserves the old exercise's own log history under its own key)
- [x] New table: `exercise_set_logs` — `supabase/migration_exercise_set_logs.sql`, folded into `schema.sql`
- Scope note: Calistenia was left on its existing simple checklist (no training-log UI) — the task allowed this ("optionally calistenia, your call"); only Musculação exercises (which already had a stable per-exercise key wired up) got the full log/1RM/PR/progression/swap treatment. The prototype's advanced-technique picker (dropset/rest-pause/cluster set) was not ported — orthogonal to this batch's scope.

### 7. Terceira Idade, Guia, Backup polish ✅ done
- [x] Terceira Idade: 3 session types (mobilidade/equilíbrio/fortalecimento), new tier `treino-terceira-idade`, own data module `lib/terceira-idade-data.ts`
- [x] Terceira Idade: weekly frequency goal (2/3/4/5x), per-exercise checklist, weekly summary with 3-tier encouragement message, per-session "feeling" tag (private, non-comparative) — `app/treino/terceira-idade/TerceiraIdadeBoard.tsx`
- [x] Own weekly completion tracking — does NOT write to `activity_days` (main streak is untouched by this tier)
- [x] New tables: `senior_session_checklist`, `senior_session_completions`; `profiles.senior_freq_goal` added; `training_tier` enum extended with `treino-terceira-idade` — `supabase/migration_terceira_idade.sql`, folded into `schema.sql`
- [x] Guia: generic reference content (per product decision above) — `app/guia/page.tsx`, all of the owner's personal clinical data (specific T value/weight/re-test plan) stripped and replaced with genuinely generic educational content, added to the sidebar nav
- [x] Backup/PDF: reviewed the existing Dashboard export (JSON backup + print summary) — already covers the meaningful tables and renders correctly; nothing broken, left as-is

---

## Fase 3 — Produto e UX (a partir de feedback de uso real, 2026-10-04)

Com a paridade funcional vs. o protótipo fechada (itens 4-7 acima), esta fase
é guiada por uso real do app, não mais pelo protótipo. Itens vindos do
feedback do usuário em 2026-10-04, mais algumas lacunas e sugestões que
apareceram durante a investigação de cada ponto. Prioridade: P0 = correções
rápidas e de baixo risco; P1 = lacunas de paridade entre níveis, escopo
claro; P2 = features novas que precisam de uma decisão de produto antes de
construir (custo de API, abordagem técnica); P3 = expansão de conteúdo
(trabalho manual, incremental).

### P0 — Correções rápidas ✅ done
- [x] Suplementação: filtro inicial sempre em "Todos" (hoje pré-filtra pela
  meta do perfil — ex. "manter"/"recomp" cai direto em "Recuperação e
  Saúde", parecendo fixo) — `app/alimentacao/suplementacao/SupplementsBrowser.tsx`
- [x] Treino Avançado: adicionar a imagem de cabeçalho que Básico/Intermediário
  já têm (`.tb-header`/`.ti-header` usam `--tier-header-image`; o cabeçalho do
  Avançado não usa essa classe) — `app/treino/page.tsx`
- [x] Sidebar: corrigir o bug visual à esquerda (menu ficando sobreposto/
  cortado) e reorganizar para não ficar tão extenso — avaliar seções
  colapsáveis, ou cabeçalho fixo com a navegação rolando por baixo
  (`components/Sidebar.tsx`, `app/globals.css` `.sidebar`)
- [x] Layout desktop: `.fx-app` está com `max-width: 640px` fixo em
  qualquer tamanho de tela — isso faz telas grandes mostrarem o conteúdo
  "espremido" no centro, como se fosse mobile. Ajustar para uma largura
  maior em telas de desktop via media query (CSS puro, sem precisar
  detectar o dispositivo por JS) — `app/globals.css`
- [x] Cronômetro de descanso: hoje fica embutido no meio da página do
  Avançado (precisa rolar até ele toda vez). Avaliar deixá-lo fixo/
  flutuante na tela (ex. canto inferior) para ficar visível durante o
  treino sem precisar rolar — `app/treino/avancado/AvancadoBuilder.tsx`

### P1 — Lacunas entre níveis de treino ✅ done
- [x] Aba "🏃 Cardio" (corrida/bike/elíptico/natação, com duração e
  intensidade) existe no protótipo para Básico e Intermediário também, mas
  só foi portada para o Avançado — adicionar a mesma aba, no mesmo modelo,
  em Básico/Intermediário (`lib/treino-basico-data.ts`,
  `lib/treino-intermediario-data.ts`, `app/treino/TreinoBoard.tsx`)
- [x] Ao final da duração de um plano (Montar Plano/Plano semanal), mostrar
  qual o consumo calórico recomendado para manutenção do objetivo atingido
  — hoje isso não aparece em lugar nenhum. (`lib/plan-generation.ts`,
  `app/plano17/page.tsx`, `app/montar-plano/page.tsx`)
- [x] Meu Perfil: hoje "/onboarding" sempre abre o assistente de metas do
  zero. Construir uma página de perfil de verdade — resumo de quem é o
  usuário, personal vinculado (se tiver), gráfico de evolução de peso,
  resumo do treino da semana — com um botão separado "Editar metas" que aí
  sim abre o assistente. (`app/onboarding/page.tsx` → nova `app/perfil/page.tsx`)
- [x] Verificar o fluxo "Continuar com Google" ponta a ponta (login E
  cadastro) — revisado linha a linha (`login/page.tsx` → `signInWithOAuth`
  → `/auth/callback` → checa `profile.role` → `/complete-profile` se for
  conta nova, senão `/`). Fluxo está correto e completo; nenhum bug
  encontrado na leitura do código. (Teste real em produção ainda recomendado
  pelo usuário, mas sem decisão de produto pendente.)

### P2 — Features novas (decisões do usuário em 2026-10-04) ✅ done
- [x] Diário: reconhecimento de calorias por foto do prato (IA) — decisão:
  **IA do próprio app** (`app/api/diario/estimar/route.ts`, Anthropic API
  server-side, tool-use para saída estruturada; downscale da foto no
  cliente antes de enviar). Modo "Foto (IA)" em `app/diario/AddFood.tsx`.
  Precisa de `ANTHROPIC_API_KEY` configurada no Vercel — sem ela, mostra
  aviso amigável em vez de quebrar.
- [x] Diário: "falar a refeição" (voz → texto) — decisão: **reconhecimento
  de voz nativo do navegador** (Web Speech API, `pt-BR`, sem serviço de
  nuvem). Botão de microfone no modo "Descrever (IA)", só aparece se o
  navegador suportar.
- [x] Diário: digitar a refeição inteira em texto livre e a IA estimar os
  macros — mesma rota de IA do item de foto acima (texto em vez de
  imagem), com lista de itens revisável/editável antes de salvar.
- [x] Receitas Fit e Suplementação conectados ao Montar Plano — decisão:
  **etapa a mais no assistente** (`app/montar-plano/PlanRecommendStep.tsx`,
  só aparece quando o perfil NÃO tem personal vinculado). Marmitas e
  Receitas Fit escolhidas entram de fato no plano da semana
  (`user_recipes`/`meal_prep_plan`, mesmo mecanismo de "adicionar sugestão"
  já existente em Marmitas); suplementos ficam registrados em
  `plan_recommendation_picks` e aparecem com um selo "⭐ Recomendado no seu
  plano" em Suplementação/Receitas Fit.
- [x] (Ajuste pedido em 2026-10-04, mesma sessão) Botões reais de
  "+ Adicionar à semana" e "+ Registrar no diário hoje" em cada card de
  Receitas Fit (`RecipesFitBrowser.tsx`) — escolher uma receita ali agora
  também entra no cardápio da semana e pode ser lançada direto no Diário
  de hoje, sem precisar digitar os macros de novo.
- [x] (Ajuste pedido em 2026-10-04, mesma sessão) Novo card "O que
  recomendamos ingerir por dia" em Montar Plano (`components/
  PlanNutritionSummary.tsx`) — mostra kcal/proteína/carbo/gordura (já
  calculados no onboarding) + uma nova meta de água (`computeWaterTargetMl`,
  `lib/fenix-domain.ts`, 35ml/kg + ajuste por nível de atividade) + lista de
  suplementos recomendados para o objetivo, com link para Diário/
  Suplementação/Receitas Fit — faltava qualquer visualização disso no
  Montar Plano.

### P3 — Expansão de conteúdo (trabalho manual incremental)
- [ ] Ampliar a base de alimentos do Diário (hoje 204 itens)
- [ ] Ampliar as sugestões de marmitas (hoje 145) e receitas fit (hoje 53)

---

## Fase 4 — Uso real pós-P2 (feedback do usuário em 2026-10-04, manhã)

Auditoria feita ANTES de qualquer correção, a pedido do usuário. Marmitas e
Suplementação já foram corrigidas (ver checkmarks abaixo). O item do Treino
Avançado está em construção — decisões já tomadas pelo usuário:
sub-navegação dentro da própria página `/treino` (não itens no menu lateral
principal); cronômetro de descanso sugerido = tempo total da sessão dividido
pelo número de pausas (não regra fixa por tipo de exercício).

### Treino Avançado — separar "montar treino" de "acompanhar treino" ✅ done
Hoje `app/treino/avancado/AvancadoBuilder.tsx` é um componente único (2086
linhas) onde a escolha de grupo muscular, a escolha de exercícios, os
filtros de equipamento/nível E o registro de carga/repetição aparecem todos
juntos, sempre visíveis, na mesma tela/aba (`MusculacaoTab` e irmãs) — é
isso que a screenshot mostra. Não existe hoje uma tela "só acompanhamento"
separada da tela "só configuração", nem um item de dia no menu lateral
(tipo "Segunda · Treino Peito").
- [x] Separar em duas fases: uma etapa de configuração ("Montar treino" ou
  "Gerar treino" — template + grupos/exercícios por dia, como já existe)
  que roda uma vez (ou quando o usuário pedir pra editar), e uma tela de
  acompanhamento diário nova, focada só em: exercícios já selecionados do
  dia, número de séries, gif de execução, e campos pra registrar
  repetições/carga feitas. A lógica de seleção/toggle já existe quase
  toda — é principalmente separar a UI em duas telas, não reescrever o
  motor. (`AvancadoBuilder.tsx`: toggle `"⚙️ Montar treino" / "📋 Treino do
  dia"` no topo da página, estado `mode`.)
- [x] Menu lateral (ou sub-nav dentro de Treino) ganha a visão por dia —
  ex. "Segunda · Treino Peito" — pra abrir direto o dia, sem passar pela
  configuração de novo. Decisão travada: isso vive como modo/aba DENTRO da
  página `/treino` existente, não como novos itens no menu lateral — modo
  "📋 Treino do dia" com um seletor de dia compacto (`.tv-compact-day-strip`)
  próprio, sem precisar passar pelas seções 0/1/2 de configuração.
- [x] Filtro de equipamento: virar um checkbox discreto, fechado por
  padrão, só pra quem quiser restringir a lista de exercícios por
  equipamento disponível — não abrir sempre visível como hoje.
  (`EquipmentFilterBox`, disclosure fechada por padrão, modo "montar"
  apenas.)
- [x] Filtro de nível (iniciante/intermediário/avançado/idoso — distinto do
  tier da conta): decidido uma vez no cadastro/onboarding em vez de ficar
  como filtro manual na tela de treino. (`profiles.avancado_level`,
  `supabase/migration_avancado_level.sql`; escolhido em `TierPicker.tsx` ao
  marcar "Treino Avançado"; `LevelFilterBox` removido do render ao vivo,
  substituído por `LevelMiniPicker` — linha somente leitura + "mudar".)
- [x] Cronômetro de descanso: hoje sempre começa em 60s e o usuário escolhe
  o preset manualmente a cada série. Sugerir automaticamente uma duração
  de descanso (e re-sugerir ao longo da sessão) com base na quantidade de
  exercícios/séries do dia e no tempo de treino disponível, pra sessão
  inteira caber no tempo — hoje não existe nenhum cálculo disso, é sempre
  fixo. (`computeSuggestedRestSeconds`: tempo planejado da sessão ÷ número
  de séries de trabalho planejadas, limitado a 20-240s; botão "✨ usar
  sugestão" ao lado dos presets 30/60/90/120s em `RestTimer`, só exibido no
  modo "Treino do dia".)

### Marmitas ✅ done
- [x] A receita padrão "Frango grelhado, arroz e legumes"
  (`DEFAULT_RECIPES` em `app/alimentacao/marmitas/page.tsx`) era semeada
  TODA VEZ que a lista de receitas do usuário ficava vazia (não era um
  seed único) — era por isso que "sempre inicia com uma". Removido o
  auto-seed; lista começa vazia, com um aviso apontando pra aba Sugestões.

### Suplementação — recomendações pouco diversas ✅ done
- [x] `pickRecommendedSupplements()` (novo, `lib/supplements.ts`) escolhe 1
  item por papel/função (fonte de proteína, creatina, cafeína/pré-treino,
  recuperação/saúde geral), variando a proteína e o item de recuperação
  pelo objetivo. Usado em `PlanNutritionSummary.tsx` e
  `PlanRecommendStep.tsx` — os dois lugares mostram a mesma lista agora.

### Recomendações adicionais (sugestões minhas, fora do que você pediu)
- [x] Persistir o filtro de equipamento como preferência do perfil (define
  uma vez, aplica em todos os dias/treinos) em vez de reiniciar a cada
  sessão.
- [x] Resumo semanal no topo da nova tela de acompanhamento diário (ex.
  "3/5 treinos feitos essa semana") — Básico/Intermediário e Terceira
  Idade já têm algo parecido, Avançado hoje não tem nenhum resumo rápido.
- [x] Cronômetro de descanso iniciar automaticamente ao marcar uma série
  como concluída, em vez de precisar apertar "iniciar" toda vez.
- [x] Diversificação de suplementos: se o perfil tiver alguma preferência
  alimentar registrada (ex. vegano/vegetariano), priorizar proteína
  vegetal no lugar de whey na recomendação — pergunta "Alguma preferência
  alimentar?" (opcional, passo do objetivo) no onboarding grava
  `profiles.dietary_preference`; `pickRecommendedSupplements(goal,
  dietaryPreference)` troca a proteína por "Proteína vegetal" p/ vegetariano
  e vegano, e p/ vegano troca Ômega-3 (EPA/DHA, óleo de peixe) por
  Multivitamínico.

---

## Original Sprint 3–5 plan (superseded, kept for history)

This sprint (Phase 2) proved the architecture end-to-end with a deliberately
small vertical slice: auth (email/password + Google), the aluno onboarding
wizard, the aluno dashboard (weight + streak + chat preview), and the
personal's roster + per-aluno evolution report + chat. Sprint 3 (training
tiers, Medidas, Fotos, templates, streak/badges) and Sprint 4's kg/lb +
color picker + Diário are now folded into the checklist above as done.

## Fase 5 — Diário estilo FitCal + Tipo de dieta (2026-10-05, modelos aprovados)

- [x] Análise por foto/texto no formato FitCal: gramas e valores por 100 g por ingrediente, nota de saúde, descrição, stepper, Corrigir/Salvar
- [x] Leitura de código de barras (BarcodeDetector + Open Food Facts) — **não testado ao vivo**
- [x] Diário com barra-chama v2 (7 melhorias), cards de macros, água, semana, chip de dieta
- [x] Tipo de dieta (`diet_type`, `fasting_window`): onboarding, /dieta, metas P/C/G por dieta, filtro em marmitas/receitas fit/Montar Plano
- [ ] Água ainda em localStorage (sem coluna no banco)
- [ ] Carboidrato das marmitas é derivado por palavra-chave (lib/meal-carbs.ts) — aproximado
- [ ] Ampliar banco de alimentos (TACO/USDA) — P3
- [ ] Botões "+" por refeição no Diário; "Ceia" gravada como "extra"

## Fase 6 — Pendências de produto, responsividade e modo claro (2026-10-05)

- [x] Água no banco (`water_logs`, migration_water_logs.sql)
- [x] Ceia como refeição própria (migration_diary_meal_ceia.sql)
- [x] Botões "+" por refeição no Diário
- [x] P3: FOOD_DB 204→496, marmitas 145→194, receitas fit 53→78 (valores de memória TACO/USDA, validados por scripts/validate-nutrition-data.mjs); `gramsPerUnit`; carbo das marmitas casado com FOOD_DB
- [x] Responsividade: sidebar vira drawer < 900 px, alvos de toque 44 px, inputs 16 px, safe-area, viewport
- [x] Modo claro v2 "papel quente/brasa" (tokens, contraste AA, FlameBar sem cores fixas, segue prefers-color-scheme)
- [ ] Não verificado em tela real (exigem login): páginas de alimentação, AddFood, perfil, personal, lightbox, onboarding/dieta no claro
- [ ] Busca do AddFood mostra só 8 resultados por substring (ranquear por relevância)
- [ ] Trocar `#6aa6e0` inline em SummaryCards/AiEstimateReview por `var(--macro-f)`
- [ ] Cobrança (aguardando decisões: gateway, planos, teste, pós-teste, CNPJ/MEI)
