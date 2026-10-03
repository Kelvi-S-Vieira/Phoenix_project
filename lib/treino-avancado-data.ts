/**
 * Static reference data for the "treino-avancado" (Avançado tier) workout
 * module, ported from the prototype (projeto_fenix_app_final.html, the
 * treino-avancado IIFE around lines 7908-11633). Pure reference content
 * (exercise pool + weekly split templates) — see treino-basico-data.ts for
 * the shared shape and treino-shared-types.ts for the interfaces reused
 * across tiers.
 *
 * Unlike Básico/Intermediário, Avançado's MUSCLE_GROUPS nests exercises one
 * level deeper than a flat list: each group has a `portions` map (e.g.
 * "peito" -> superior/médio/inferior, "ombro" -> anterior/lateral/posterior
 * deltoid, etc.), so the user can target a specific anatomical sub-region
 * instead of just a whole muscle group. This is carried over faithfully from
 * the prototype — the shared `MuscleGroup` interface
 * (treino-shared-types.ts) now has an optional `portions` field alongside
 * the flat `exercises` field precisely to support this; `exerciseId()` takes
 * an optional portion-key segment too, so a logged set for "peito > médio"
 * and one for "peito > superior" never collide. Every group in this file has
 * `portions` populated (no group is flat) — the optional `exercises` field
 * on `MuscleGroup` only exists for Básico/Intermediário and any future flat
 * group, it's unused here.
 *
 * Other simplifications vs. the prototype (documented, not accidental):
 * - The prototype's SPLITS templates for "abc" and "ppl" additionally list a
 *   standalone "trapezio" group key for the same days as "costas", but in
 *   the source MUSCLE_GROUPS "trapézio" only exists nested as a portion of
 *   "costas" ("costas.portions.trapezio") — there's no matching top-level
 *   "trapezio" group, so in the prototype itself that extra list entry
 *   silently resolves to nothing and renders no exercises. Now that portions
 *   are preserved, selecting "costas" already surfaces its "Trapézio"
 *   portion alongside "Largura" and "Espessura", so the redundant standalone
 *   "trapezio" entries are simply dropped from the SPLITS day arrays here
 *   (rather than inventing a duplicate top-level "trapezio" group, which
 *   would either double-count that portion's volume or require stripping it
 *   out of "costas" — both worse than just not listing it twice). No
 *   `MuscleGroupKey` for "trapezio" exists for the same reason.
 * - The prototype's avançado module also adds a much larger feature set,
 *   most of it now ported (see lib/treino-avancado-builder.ts,
 *   lib/treino-circuitos-data.ts, lib/treino-progression.ts and
 *   AvancadoBuilder.tsx): equipment-type/training-level filters, warmup
 *   exercises, a cardio modality system (HIIT, Tabata, HYROX, CrossFit,
 *   sports) with its own "WORKOUT_TYPES"/circuit-builder concept, weekly
 *   volume-vs-target tracking, an exercise-swap-within-portion button, and
 *   per-exercise training-log history (1RM/PR/progression/deload). Still
 *   NOT ported: the advanced techniques picker (dropset/rest-pause/cluster
 *   set) — a per-selection "technique" field shown alongside sets/reps in
 *   the prototype, orthogonal to everything above and out of scope for this
 *   batch.
 * - CALIST_GROUPS (the "🤸 Calistenia" tab's pool) is organized by movement
 *   pattern — empurrar/puxar/pernas/core — matching the prototype's
 *   CALISTHENICS_GROUPS, and deliberately NOT by the MuscleGroupKey set
 *   above: these patterns are selectable on any training day, independent
 *   of whichever muscle groups the split schedules for musculação that day
 *   (an earlier version of this port mapped each pattern onto one
 *   MUSCLE_GROUPS key instead — empurrar->peito, puxar->costas,
 *   pernas->quadriceps, core->abdomen — which wrongly hid, say, "puxar"
 *   exercises on a leg day, and mislabeled the "pernas" pattern as
 *   "Quadríceps"). CALIST_GROUPS has a single `"calistenia"` pseudo-group
 *   key, reusing the existing anatomical `portions` structure (the same one
 *   MUSCLE_GROUPS uses for e.g. "peito" -> superior/médio/inferior) for the
 *   four movement patterns instead — see its own comment below, and
 *   `alwaysGroups` on the "calistenia" WORKOUT_TYPES entry /
 *   `renderGroups` in app/treino/TreinoBoard.tsx for how a tab's groups can
 *   be decoupled from the day's scheduled muscle groups.
 *
 * IMPORTANT (future work, do not build on this yet): `workout_log_entries`
 * is keyed `(profile_id, logged_at, exercise_id)`, one row per day, and
 * every `exercise_id` here is day-prefixed (`exerciseId()` always starts
 * with `dayKey::`) — see the big comment on `exerciseId()` in
 * treino-shared-types.ts. That's correct for today's daily checklist, but
 * it means Monday's and Thursday's logged sets for the "same" exercise can
 * never be joined into one history. A future 1RM/PR/progression-tracking
 * feature (especially relevant for Avançado) must NOT be built on top of
 * `workout_log_entries` as-is; it needs its own table keyed without the
 * day, e.g. `exercise_set_logs(profile_id, exercise_key, logged_at, weight,
 * reps, rpe, pain)`. `exerciseKey()` (treino-shared-types.ts) already
 * exists as the day-independent id that future table would use.
 */

import {
  type Exercise,
  type MuscleGroup,
  type MuscleGroupPortion,
  type DayKey,
  type DayInfo,
  DAYS,
  type WorkoutTypeKey,
  type WorkoutType as SharedWorkoutType,
  type Split as SharedSplit,
  exerciseId as sharedExerciseId,
} from "./treino-shared-types";

export type { Exercise, MuscleGroup, MuscleGroupPortion, DayKey, DayInfo, WorkoutTypeKey };
export { DAYS };

export type MuscleGroupKey =
  | "ombro"
  | "biceps"
  | "triceps"
  | "peito"
  | "costas"
  | "quadriceps"
  | "posterior"
  | "gluteos"
  | "panturrilha"
  | "abdomen"
  | "antebraco";

// ===================== POOL DE EXERCÍCIOS — MUSCULAÇÃO =====================
// Ported with the prototype's anatomical "portions" sub-structure preserved
// — see module comment above. Each group here has `portions` populated;
// none use the flat `exercises` field.
export const MUSCLE_GROUPS: Record<MuscleGroupKey, MuscleGroup> =
{
  "ombro": {
    "label": "Ombro",
    "portions": {
      "anterior": {
        "label": "Deltoide Anterior",
        "exercises": [
          {
            "name": "Desenvolvimento militar com barra",
            "exec": "Em pé ou sentado, barra na altura dos ombros, empurre para cima até a extensão quase completa dos cotovelos, sem hiperestender a lombar.",
            "erro": "Arquear excessivamente as costas para compensar a falta de força, jogando o quadril para frente.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/1.jpg"
            ]
          },
          {
            "name": "Desenvolvimento com halteres",
            "exec": "Sentado com apoio nas costas, halteres na altura dos ombros, empurre para cima em arco levemente convergente.",
            "erro": "Descer os halteres rápido demais e perder o controle na fase excêntrica.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/1.jpg"
            ]
          },
          {
            "name": "Elevação frontal com halteres",
            "exec": "Halteres à frente das coxas, eleve um ou os dois braços até a altura dos ombros com leve flexão de cotovelo.",
            "erro": "Usar embalo do quadril/lombar para jogar o peso para cima.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/1.jpg"
            ]
          },
          {
            "name": "Desenvolvimento Arnold",
            "exec": "Inicie com halteres na frente do rosto, gire os punhos enquanto empurra para cima até a extensão total.",
            "erro": "Fazer a rotação muito rápido, perdendo a tensão no deltoide anterior.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/1.jpg"
            ]
          },
          {
            "name": "Desenvolvimento na máquina",
            "exec": "Sentado, ajuste o apoio e empurre os manípulos para cima até quase a extensão total dos cotovelos.",
            "erro": "Ajustar o banco muito baixo ou alto, tirando o ângulo correto de empurrão.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shoulder_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shoulder_Press/1.jpg"
            ]
          },
          {
            "name": "Elevação frontal na polia baixa",
            "exec": "De costas para a polia baixa (ou de frente, cabo entre as pernas), eleve o cabo à frente do corpo até a altura dos ombros.",
            "erro": "Usar impulso das pernas/quadril para lançar o cabo para cima.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Cable_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Cable_Raise/1.jpg"
            ]
          },
          {
            "name": "Elevação frontal com barra",
            "exec": "Barra à frente das coxas com pegada pronada, eleve com os braços estendidos até a altura dos ombros.",
            "erro": "Usar carga excessiva que force a lombar a arquear.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise_And_Pullover/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise_And_Pullover/1.jpg"
            ]
          },
          {
            "name": "Push press (desenvolvimento com impulso de pernas)",
            "exec": "Flexione levemente os joelhos para gerar impulso e empurre a barra ou halteres para cima com os ombros.",
            "erro": "Depender só do impulso das pernas sem ativar o deltoide na fase final."
          },
          {
            "name": "Desenvolvimento com halteres pegada neutra",
            "exec": "Sentado ou em pé, segure os halteres com as palmas voltadas uma para a outra e empurre-os verticalmente até quase estender os cotovelos, mantendo a pegada neutra durante todo o percurso.",
            "erro": "Rotacionar os punhos para pronação no topo do movimento, perdendo o benefício da pegada neutra sobre o ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Shoulder_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Shoulder_Press/1.jpg"
            ]
          },
          {
            "name": "Elevação frontal com anilha",
            "exec": "Em pé, segure a anilha com as duas mãos na lateral do disco e eleve-a à frente do corpo até a altura dos olhos, mantendo os cotovelos levemente flexionados.",
            "erro": "Usar impulso do quadril para lançar a anilha em vez de elevar controlado apenas com o ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Plate_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Plate_Raise/1.jpg"
            ]
          },
          {
            "name": "Elevação frontal com kettlebell",
            "exec": "Segure o kettlebell pelos chifres com as duas mãos e eleve-o à frente do corpo até a altura dos ombros, controlando a descida.",
            "erro": "Deixar o kettlebell balançar por inércia em vez de controlar a fase excêntrica.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Two-Dumbbell_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Two-Dumbbell_Raise/1.jpg"
            ]
          },
          {
            "name": "Desenvolvimento Bradford",
            "exec": "Em pé com a barra na altura dos ombros, empurre-a até quase estender os cotovelos à frente da cabeça e desça atrás da nuca sem travar os cotovelos, alternando o trajeto frente-trás continuamente.",
            "erro": "Estender completamente os cotovelos no topo, perdendo a tensão contínua característica do movimento."
          },
          {
            "name": "Desenvolvimento no Smith machine",
            "exec": "Sentado no banco posicionado sob a barra guiada, empurre-a verticalmente a partir da altura dos ombros até quase estender os cotovelos, controlando a descida até a posição inicial.",
            "erro": "Posicionar o banco longe demais da trajetória da barra, forçando os ombros a uma rotação desnecessária.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Shoulder_Military_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Shoulder_Military_Press/1.jpg"
            ]
          },
          {
            "name": "Desenvolvimento kettlebell bottoms-up unilateral",
            "exec": "Em pé, segure o kettlebell invertido (base para cima) e empurre-o acima da cabeça mantendo o punho firme e o cotovelo alinhado sob o sino, sem deixar o peso tombar.",
            "erro": "Relaxar o punho e o antebraço, permitindo que o kettlebell tombe para os lados durante o empurrão."
          },
          {
            "name": "Desenvolvimento landmine unilateral",
            "exec": "Com a barra encaixada no landmine, segure a ponta livre com uma mão junto ao ombro e empurre-a em diagonal para cima e à frente até quase estender o cotovelo.",
            "erro": "Empurrar em linha reta vertical em vez de seguir o arco natural imposto pelo landmine, sobrecarregando o cotovelo."
          },
          {
            "name": "Desenvolvimento atrás da nuca com barra",
            "exec": "Sentado, segure a barra com pegada um pouco mais aberta que os ombros e desça-a atrás da nuca até a altura das orelhas, empurrando de volta ao topo sem travar os cotovelos.",
            "erro": "Descer a barra além da mobilidade do ombro, forçando uma rotação externa excessiva e comprimindo a articulação.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/1.jpg"
            ]
          },
          {
            "name": "Desenvolvimento unilateral com halter em pé",
            "exec": "Em pé com o core contraído, empurre um halter verticalmente com um braço até quase estender o cotovelo, resistindo à inclinação lateral do tronco.",
            "erro": "Inclinar o tronco para o lado oposto para compensar a falta de estabilidade, transformando o movimento em uma flexão lateral.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Shoulder_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Shoulder_Press/1.jpg"
            ]
          },
          {
            "name": "Elevação frontal isométrica com barra",
            "exec": "Em pé, segure a barra com os braços estendidos à frente na altura dos ombros e mantenha a posição estática pelo tempo determinado, sem deixar os braços caírem.",
            "erro": "Perder a extensão dos cotovelos ao longo da isometria, dobrando os braços e aliviando a tensão do deltoide anterior.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Front_Barbell_Raise_Over_Head/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Front_Barbell_Raise_Over_Head/1.jpg"
            ]
          },
          {
            "name": "Desenvolvimento no cabo unilateral (polia baixa)",
            "exec": "De frente para a polia baixa, segure a alça junto ao ombro e empurre para cima e ligeiramente à frente até quase estender o cotovelo, aproveitando a tensão constante do cabo — diferente do halter, que perde tensão perto do ombro no início.",
            "erro": "Inclinar o tronco para trás para ajudar a empurrar o cabo em vez de usar apenas o deltoide anterior.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Cable_Shoulder_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Cable_Shoulder_Press/1.jpg"
            ]
          },
          {
            "name": "Elevação frontal alternada no cabo duplo (polias baixas cruzadas)",
            "exec": "Com as polias baixas cruzadas à frente do corpo, segure uma alça em cada mão e alterne elevando os braços à frente até a altura dos ombros, mantendo tensão constante do cabo mesmo na posição mais baixa.",
            "erro": "Usar impulso do quadril entre uma repetição e outra em vez de elevar controlado apenas com o ombro."
          },
          {
            "name": "Landmine press meio-ajoelhado (half-kneeling)",
            "exec": "Ajoelhe com um joelho no chão do lado oposto ao braço de trabalho, segure a ponta da barra do landmine junto ao ombro e empurre para cima e à frente até quase estender o cotovelo, mantendo o tronco estável na posição meio-ajoelhada.",
            "erro": "Deixar o quadril rodar junto com o empurrão em vez de manter a base meio-ajoelhada fixa e estável, o que é justamente o propósito da variação para treinar estabilidade de tronco."
          },
          {
            "name": "Landmine push press (com impulso de pernas)",
            "exec": "Em pé, segure a ponta da barra do landmine junto ao ombro, flexione levemente o joelho e use um pequeno impulso das pernas para ajudar a empurrar a barra para cima e à frente, controlando bem a descida.",
            "erro": "Usar impulso excessivo das pernas a ponto de o movimento virar um agachamento com empurrão, perdendo o trabalho ativo do ombro que o exercício deve gerar."
          }
        ]
      },
      "lateral": {
        "label": "Deltoide Lateral",
        "exercises": [
          {
            "name": "Elevação lateral com halteres",
            "exec": "Halteres ao lado do corpo, eleve os braços lateralmente até a altura dos ombros, cotovelos levemente flexionados.",
            "erro": "Elevar acima da linha dos ombros usando trapézio em vez do deltoide.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral no cabo",
            "exec": "Cabo na polia baixa, puxe lateralmente cruzando levemente o corpo para manter tensão constante.",
            "erro": "Afastar-se demais da polia perdendo o ângulo de tração correto.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral na máquina",
            "exec": "Sente-se ajustando o apoio, eleve os braços lateralmente controlando a descida.",
            "erro": "Usar impulso e não controlar a fase negativa do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Side_Lateral_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Side_Lateral_Raise/1.jpg"
            ]
          },
          {
            "name": "Remada alta",
            "exec": "Barra ou cabo à frente do corpo, puxe verticalmente levando os cotovelos acima das mãos.",
            "erro": "Puxar com os braços muito afastados do corpo, sobrecarregando o ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Cable_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Cable_Row/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral deitado de lado no banco",
            "exec": "Deitado de lado no banco, eleve o halter do braço de cima lateralmente controlando o movimento.",
            "erro": "Girar o tronco para ajudar a subir o peso em vez de isolar o deltoide.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise_-_With_Bands/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise_-_With_Bands/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral unilateral no cabo (cross-body)",
            "exec": "Cabo cruzando à frente do corpo na altura baixa, puxe lateralmente até a altura do ombro com um braço por vez.",
            "erro": "Deixar o cotovelo travar totalmente reto, perdendo tensão constante."
          },
          {
            "name": "Elevação lateral 21s (parciais + completa)",
            "exec": "Faça 7 repetições parciais na metade inferior, 7 na metade superior e 7 completas, sem descansar entre os blocos.",
            "erro": "Usar peso alto demais e perder a forma nos blocos parciais.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_One-Arm_Lateral_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_One-Arm_Lateral_Raise/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral com faixa elástica",
            "exec": "Faixa presa embaixo dos pés ou de um ponto fixo baixo, eleve os braços lateralmente controlando a tensão da faixa.",
            "erro": "Deixar a faixa perder tensão no início do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise_-_With_Bands/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise_-_With_Bands/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral com kettlebell",
            "exec": "Em pé, segure o kettlebell pelo corpo (não pelos chifres) e eleve-o lateralmente até a altura dos ombros, cotovelo levemente flexionado e liderando o movimento.",
            "erro": "Segurar pela alça em vez do corpo do kettlebell, alterando o centro de gravidade e forçando o punho.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Laterals_to_Front_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Laterals_to_Front_Raise/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral com disco",
            "exec": "Em pé, segure a anilha com as duas mãos na borda e eleve-a lateralmente, ligeiramente à frente do corpo, até a altura dos ombros.",
            "erro": "Elevar a anilha estritamente ao lado do corpo em vez de um pouco à frente, tirando a tensão do deltoide lateral.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Incline_Lateral_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Incline_Lateral_Raise/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral lean-away no cabo",
            "exec": "Segure a polia baixa com uma mão, incline o tronco para longe do aparelho apoiando-se na outra mão e eleve o braço lateralmente até a altura do ombro.",
            "erro": "Manter o tronco ereto em vez de inclinar para longe, reduzindo a amplitude e a tensão na fase inicial.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral sentado com halteres",
            "exec": "Sentado em banco reto sem apoio nas costas, eleve os halteres lateralmente até a altura dos ombros, evitando usar o encosto para gerar impulso.",
            "erro": "Balançar o tronco para trás contra o encosto para ajudar a subir o peso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_Rear_Lateral_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_Rear_Lateral_Raise/1.jpg"
            ]
          },
          {
            "name": "Remada alta com halteres pegada larga",
            "exec": "Em pé segurando um halter em cada mão à frente do corpo, puxe os cotovelos para cima e para fora, levando os halteres até a altura do peito.",
            "erro": "Puxar os cotovelos para trás em vez de para os lados, transferindo o esforço para o trapézio.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Upright_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Upright_Row/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral apoiado no banco inclinado",
            "exec": "Deitado de bruços sobre um banco inclinado a cerca de 30 graus, eleve os halteres lateralmente até a altura dos ombros, sem usar impulso do tronco.",
            "erro": "Levantar o peito do banco durante a subida, introduzindo impulso e aliviando o deltoide.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_One-Arm_Rear_Lateral_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_One-Arm_Rear_Lateral_Raise/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral parcial com halteres",
            "exec": "Posicione os halteres já na altura da linha dos ombros e execute pequenas elevações parciais na porção final do movimento, mantendo tensão constante.",
            "erro": "Ampliar a amplitude descendo os braços até o quadril, transformando o parcial em um movimento completo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral unilateral com halter em pé",
            "exec": "Em pé, segure um halter em uma mão e a outra na cintura ou em um apoio, eleve o braço lateralmente até a altura do ombro isoladamente.",
            "erro": "Inclinar o tronco para o lado do movimento para ajudar a elevar o peso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_One-Arm_Lateral_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_One-Arm_Lateral_Raise/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral unilateral na máquina",
            "exec": "Sentado lateralmente ao aparelho, ajuste o encosto para apoiar as costas e eleve o braço lateralmente contra a resistência até a altura do ombro.",
            "erro": "Girar o tronco durante a execução para compensar a falta de força no final da amplitude.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Incline_Lateral_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Incline_Lateral_Raise/1.jpg"
            ]
          },
          {
            "name": "Remada alta na polia baixa",
            "exec": "Em pé de frente para a polia baixa com barra reta ou triângulo, puxe verticalmente conduzindo os cotovelos para cima e para fora até a altura do peito.",
            "erro": "Elevar a barra acima da linha dos ombros, aumentando o risco de impacto (impingement) na articulação.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Cable_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Cable_Row/1.jpg"
            ]
          },
          {
            "name": "Elevação lateral bilateral na polia baixa dupla (cross duplo)",
            "exec": "Com as duas polias baixas cruzadas nas laterais do corpo, eleve os dois braços lateralmente ao mesmo tempo até a altura dos ombros, mantendo tensão constante do cabo em vez de usar halteres.",
            "erro": "Perder a sincronia entre os dois braços, deixando um lado subir mais rápido ou mais alto que o outro."
          }
        ]
      },
      "posterior": {
        "label": "Deltoide Posterior",
        "exercises": [
          {
            "name": "Crucifixo inverso com halteres",
            "exec": "Tronco inclinado à frente, eleve os halteres lateralmente contraindo as escápulas.",
            "erro": "Usar embalo do tronco em vez de isolar o movimento nos ombros.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes/1.jpg"
            ]
          },
          {
            "name": "Crucifixo inverso na máquina (peck deck invertido)",
            "exec": "Sentado de frente para o aparelho, puxe as alavancas para trás contraindo o posterior do ombro.",
            "erro": "Deixar o peso puxar os ombros para frente entre as repetições.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Machine_Flyes/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Machine_Flyes/1.jpg"
            ]
          },
          {
            "name": "Face pull no cabo",
            "exec": "Corda na polia alta, puxe em direção ao rosto separando as mãos, cotovelos altos.",
            "erro": "Puxar muito baixo, tornando o movimento mais de costas do que de deltoide posterior.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/1.jpg"
            ]
          },
          {
            "name": "Remada aberta com halteres",
            "exec": "Tronco inclinado, puxe os halteres para cima abrindo os cotovelos lateralmente.",
            "erro": "Puxar os cotovelos colados ao corpo, tirando o foco do deltoide posterior.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Incline_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Incline_Row/1.jpg"
            ]
          },
          {
            "name": "Peck deck invertido unilateral",
            "exec": "Um braço por vez no aparelho, puxe para trás isolando o posterior do ombro e controlando a volta.",
            "erro": "Girar o tronco para ajudar a puxar o peso."
          },
          {
            "name": "Remada alta com corda foco em posterior (rear delt row)",
            "exec": "Corda na polia baixa, puxe em direção ao rosto/peito abrindo bem os cotovelos para os lados.",
            "erro": "Puxar em linha reta sem separar as mãos, perdendo o foco no deltoide posterior."
          },
          {
            "name": "Reverse fly no banco inclinado",
            "exec": "Deitado de bruços em banco inclinado, eleve os halteres lateralmente contraindo as escápulas.",
            "erro": "Elevar os halteres além da linha do corpo, forçando a articulação do ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Reverse_Flye/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Reverse_Flye/1.jpg"
            ]
          },
          {
            "name": "Y-raise com halteres leves",
            "exec": "Em pé ou deitado de bruços, eleve os braços formando um Y acima da cabeça com halteres bem leves.",
            "erro": "Usar carga pesada demais, o que impede a formação correta do Y.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Incline_Dumbbell_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Incline_Dumbbell_Raise/1.jpg"
            ]
          },
          {
            "name": "Crucifixo inverso no cross-over",
            "exec": "Posicione as polias altas cruzadas, segure a alça oposta com cada mão e abra os braços horizontalmente para trás até a altura dos ombros, cruzando os cabos à frente do corpo.",
            "erro": "Flexionar excessivamente os cotovelos, transformando o movimento em uma remada em vez de um crucifixo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes_With_External_Rotation/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes_With_External_Rotation/1.jpg"
            ]
          },
          {
            "name": "Crucifixo inverso deitado de bruços em banco reto",
            "exec": "Deitado de bruços sobre um banco reto com os pés apoiados no chão, eleve os halteres lateralmente para trás até a altura do banco, mantendo os cotovelos levemente flexionados.",
            "erro": "Levantar a cabeça e o peito do banco durante a execução, gerando impulso lombar.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes/1.jpg"
            ]
          },
          {
            "name": "Remada unilateral apoiada foco posterior",
            "exec": "Com um joelho e uma mão apoiados no banco, puxe o halter conduzindo o cotovelo bem aberto lateralmente até a altura das costelas, priorizando a rotação externa do ombro.",
            "erro": "Puxar o cotovelo rente ao corpo, deslocando o trabalho para o latíssimo em vez do deltoide posterior.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/1.jpg"
            ]
          },
          {
            "name": "T-raise com halteres em pé",
            "exec": "Incline o tronco à frente mantendo a coluna neutra e eleve os halteres simultaneamente para os lados formando um T com o corpo, parando na altura dos ombros.",
            "erro": "Endireitar o tronco durante a subida, usando as pernas para ajudar a elevar o peso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Rear_Delt_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Rear_Delt_Raise/1.jpg"
            ]
          },
          {
            "name": "Elevação posterior com faixa presa acima da cabeça",
            "exec": "Com a faixa presa em um ponto alto à frente, puxe as extremidades para baixo e para os lados até a altura dos quadris, abrindo os braços em arco.",
            "erro": "Puxar apenas com os braços flexionando os cotovelos precocemente, sem abrir o arco com os ombros.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_Rear_Lateral_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_Rear_Lateral_Raise/1.jpg"
            ]
          },
          {
            "name": "Pull-apart com barra curta",
            "exec": "Segure uma barra curta ou cano com as duas mãos afastadas na largura dos ombros e puxe-a horizontalmente para os lados, aproximando as escápulas.",
            "erro": "Girar os punhos ou flexionar os cotovelos durante o movimento em vez de manter os braços retos.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Pull_Apart/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Pull_Apart/1.jpg"
            ]
          },
          {
            "name": "Crucifixo inverso na máquina pegada cruzada",
            "exec": "Sentado no peck deck invertido, cruze os braços segurando as alças opostas e abra-os para trás até a altura dos ombros, aumentando a amplitude na fase inicial.",
            "erro": "Reduzir a amplitude por não cruzar completamente os braços no início do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Machine_Flyes/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Machine_Flyes/1.jpg"
            ]
          },
          {
            "name": "Remada alta unilateral foco posterior",
            "exec": "Em pé, puxe um halter verticalmente junto ao corpo conduzindo o cotovelo para fora e ligeiramente para trás, priorizando a ativação do deltoide posterior sobre o trapézio.",
            "erro": "Elevar o cotovelo muito à frente do corpo, deslocando o esforço para o deltoide lateral e o trapézio.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_One-Arm_Upright_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_One-Arm_Upright_Row/1.jpg"
            ]
          },
          {
            "name": "Elevação em Y no cabo duplo",
            "exec": "Com as polias baixas cruzadas atrás do corpo, segure uma alça em cada mão e eleve os braços diagonalmente à frente formando um Y, até a altura da cabeça.",
            "erro": "Elevar os braços em linha reta para cima em vez do ângulo diagonal, perdendo o padrão de ativação do Y-raise."
          },
          {
            "name": "Rotação externa com halter deitado de lado",
            "exec": "Deitado de lado com o cotovelo fixo junto às costelas e flexionado a 90 graus, gire o antebraço para cima levantando o halter sem afastar o cotovelo do corpo.",
            "erro": "Afastar o cotovelo do tronco durante a rotação, transformando o movimento em uma elevação em vez de uma rotação externa isolada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation/1.jpg"
            ]
          },
          {
            "name": "Face pull com barra reta na polia alta (pegada pronada)",
            "exec": "Em vez da corda, segure a barra reta na polia alta com pegada pronada e puxe em direção ao rosto, abrindo os cotovelos para os lados e contraindo as escápulas no final.",
            "erro": "Usar carga muito alta, o que impede a retração escapular completa e transforma o movimento em uma remada alta.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/1.jpg"
            ]
          },
          {
            "name": "Crucifixo inverso no cabo com corda unilateral",
            "exec": "Segure uma ponta da corda na polia oposta na altura do peito, um braço por vez, e puxe abrindo o braço para trás em arco até a altura do ombro, contraindo o deltoide posterior.",
            "erro": "Girar o tronco para ajudar a puxar o cabo em vez de isolar o movimento no ombro."
          }
        ]
      }
    }
  },
  "biceps": {
    "label": "Bíceps",
    "portions": {
      "longa": {
        "label": "Cabeça Longa",
        "exercises": [
          {
            "name": "Rosca direta com barra reta atrás do corpo (banco inclinado)",
            "exec": "Sentado em banco inclinado, braços atrás do tronco, flexione o cotovelo trazendo a barra/halteres até o ombro.",
            "erro": "Mover o ombro para frente durante a subida, retirando o alongamento da cabeça longa.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca scott inversa de amplitude",
            "exec": "Apoiado no banco scott, desça controlado até quase a extensão total antes de flexionar novamente.",
            "erro": "Não descer completamente, perdendo o estímulo na porção longa.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca alternada com halteres para trás do corpo",
            "exec": "Em pé, um braço por vez, leve o halter levemente atrás da linha do tronco no início do movimento.",
            "erro": "Balançar o tronco para ajudar a subir o peso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Alternate_Bicep_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Alternate_Bicep_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca no cabo baixo (polia atrás)",
            "exec": "De costas para a polia baixa, puxe o cabo por cima da cabeça flexionando o cotovelo à frente.",
            "erro": "Deixar o cotovelo cair, perdendo tensão constante no bíceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/High_Cable_Curls/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/High_Cable_Curls/1.jpg"
            ]
          },
          {
            "name": "Rosca 21 (parciais + completa)",
            "exec": "7 repetições na metade inferior, 7 na metade superior e 7 completas, sem pausar entre os blocos.",
            "erro": "Reduzir demais a carga a ponto de perder o estímulo nos blocos parciais.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_High_Bench_Barbell_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_High_Bench_Barbell_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca direta com barra W pegada aberta",
            "exec": "Pegada mais aberta que os ombros na barra W, flexione o cotovelo mantendo o tronco parado.",
            "erro": "Balançar o tronco para ajudar a subir o peso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Standing_Barbell_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Standing_Barbell_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca no cabo baixo unilateral atrás do corpo",
            "exec": "Um braço por vez, cabo na polia baixa atrás do corpo, flexione levando a mão até o ombro.",
            "erro": "Deixar o cotovelo avançar à frente do tronco durante a subida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Cable_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Cable_Curl/1.jpg"
            ]
          },
          {
            "name": "Bíceps unilateral na polia baixa (de costas para a polia)",
            "exec": "De costas para a polia baixa, um braço por vez, braço estendido atrás do tronco, flexione o cotovelo levando a mão até o ombro mantendo o cotovelo fixo.",
            "erro": "Deixar o cotovelo avançar à frente do corpo, perdendo o alongamento da cabeça longa.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Cable_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Cable_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca bayesiana (Bayesian curl)",
            "exec": "De costas para a polia baixa, afaste-se um passo à frente deixando o braço levemente atrás do corpo na posição inicial. Flexione o cotovelo trazendo a mão em direção ao ombro e incline levemente o tronco à frente conforme sobe, mantendo tensão constante no bíceps do início ao fim do movimento.",
            "erro": "Ficar totalmente ereto durante a subida, perdendo a tensão constante que é o objetivo principal dessa variação.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drag_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drag_Curl/1.jpg"
            ]
          },
          {
            "name": "Bíceps unilateral na polia alta (de lado para a polia)",
            "exec": "De lado para a polia alta, um braço por vez, cotovelo apontando para cima na direção da polia, flexione trazendo a mão em direção ao ombro contraindo o bíceps no topo.",
            "erro": "Deixar o cotovelo cair durante a execução, perdendo a tensão na posição de pico."
          },
          {
            "name": "Drag curl (rosca arrastada)",
            "exec": "Em pé, arraste a barra rente ao corpo subindo verticalmente, cotovelos indo para trás no topo.",
            "erro": "Afastar a barra do corpo, transformando em rosca comum.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca inclinada com halteres",
            "exec": "Sentado em banco inclinado a 45 graus com os braços pendendo atrás do tronco, flexione os cotovelos elevando os halteres até a altura dos ombros, sem tirar os braços da linha do corpo.",
            "erro": "Balançar os ombros para frente durante a subida, tirando o braço da posição estendida atrás do tronco.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/1.jpg"
            ]
          },
          {
            "name": "Rosca inclinada alternada com halteres",
            "exec": "No mesmo banco inclinado, execute a rosca com um braço de cada vez, mantendo o cotovelo fixo atrás da linha do tronco durante toda a repetição.",
            "erro": "Rodar o punho para dentro durante a subida, perdendo a supinação completa no topo do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Hammer_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Hammer_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca sentado no chão com pernas estendidas",
            "exec": "Sentado no chão com as pernas estendidas e o tronco levemente reclinado apoiado nos braços atrás, flexione os cotovelos elevando os halteres a partir de uma posição de ombro estendido.",
            "erro": "Encostar os cotovelos no chão e usar o tronco para impulsionar o peso em vez de isolar o bíceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spider_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spider_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca com kettlebell atrás do corpo",
            "exec": "Em pé, posicione o braço levemente atrás da linha do tronco segurando o kettlebell pelo corpo e flexione o cotovelo elevando-o até o ombro.",
            "erro": "Deixar o cotovelo avançar para a frente do tronco durante a subida, reduzindo o alongamento da cabeça longa.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Finger_Curls/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Finger_Curls/1.jpg"
            ]
          },
          {
            "name": "Rosca com corda no cabo baixo atrás do corpo",
            "exec": "De costas para a polia baixa com o cabo ajustado com corda, mantenha o braço estendido atrás do tronco e flexione o cotovelo puxando a corda até o ombro.",
            "erro": "Aproximar o cotovelo do corpo durante a execução, perdendo a extensão de ombro que caracteriza o exercício.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Cable_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Cable_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca isométrica no banco inclinado",
            "exec": "No banco inclinado com o halter em flexão de 90 graus, mantenha a posição estática pelo tempo determinado sem deixar o braço subir ou descer.",
            "erro": "Perder o ângulo de 90 graus ao longo da isometria, deixando o braço ceder gradualmente.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zottman_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zottman_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca com halteres deitado no banco declinado",
            "exec": "Deitado de costas em banco declinado com os braços pendendo atrás da cabeça, flexione os cotovelos elevando os halteres em direção aos ombros.",
            "erro": "Levantar o tronco do banco para ajudar no movimento em vez de manter a coluna apoiada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/1.jpg"
            ]
          },
          {
            "name": "Rosca com barra EZ atrás do corpo em pé",
            "exec": "Em pé, segure a barra EZ com os braços estendidos ligeiramente atrás do quadril e flexione os cotovelos elevando a barra até a altura do peito.",
            "erro": "Projetar o quadril à frente para impulsionar a barra em vez de flexionar apenas pelo cotovelo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ_Bar_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ_Bar_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca unilateral em banco inclinado alto",
            "exec": "Deite o peito sobre o encosto de um banco inclinado a quase 90 graus e, com o braço solto para trás, flexione o cotovelo elevando o halter até o ombro.",
            "erro": "Apoiar o queixo no encosto e usar o pescoço como ponto de apoio para compensar a falta de força.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Preacher_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Preacher_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca com faixa elástica atrás do corpo",
            "exec": "Prenda a faixa elástica atrás do corpo na altura do quadril, segure a extremidade com o braço estendido para trás e flexione o cotovelo elevando a mão até o ombro.",
            "erro": "Deixar a faixa perder tensão no início do movimento por ficar muito próximo do ponto de fixação.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lower_Back_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lower_Back_Curl/1.jpg"
            ]
          }
        ]
      },
      "curta": {
        "label": "Cabeça Curta",
        "exercises": [
          {
            "name": "Rosca concentrada",
            "exec": "Sentado, cotovelo apoiado na parte interna da coxa, flexione o braço isoladamente até contração máxima.",
            "erro": "Apoiar o cotovelo muito para fora, tirando o ângulo de trabalho da cabeça curta.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Concentration_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Concentration_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca scott com barra reta",
            "exec": "Braços apoiados no banco scott à frente do corpo, flexione controlando a descida.",
            "erro": "Usar impulso do ombro para iniciar a subida da barra.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca direta com pegada supinada (barra W próxima ao corpo)",
            "exec": "Em pé, cotovelos fixos ao lado do corpo, flexione trazendo a barra ao peito.",
            "erro": "Afastar os cotovelos do tronco durante a execução.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Standing_Barbell_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Standing_Barbell_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca direta em pé na polia baixa",
            "exec": "De frente para a polia baixa com a barra reta ou EZ, cotovelos fixos ao lado do corpo, flexione trazendo a barra até o peito e desça controlado.",
            "erro": "Usar impulso do quadril ou balançar o tronco para ajudar a subir o peso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curls_Lying_Against_An_Incline/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curls_Lying_Against_An_Incline/1.jpg"
            ]
          },
          {
            "name": "Rosca cabo alto (cruzamento)",
            "exec": "Polias altas dos dois lados, cruze os cabos flexionando os cotovelos à frente do corpo.",
            "erro": "Não manter os braços na linha do corpo, perdendo o foco na cabeça curta.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Preacher_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Preacher_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca Zottman",
            "exec": "Suba com pegada supinada e desça com pegada pronada, alternando a rotação do punho.",
            "erro": "Girar o punho rápido demais, perdendo o controle da fase excêntrica.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bicep_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bicep_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca com halteres pegada supinada sentado",
            "exec": "Sentado, halteres com pegada supinada, flexione os cotovelos mantendo o tronco parado.",
            "erro": "Usar embalo do tronco para completar a repetição.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca spider (apoiado de bruços em banco inclinado)",
            "exec": "Deitado de bruços em banco inclinado, braços pendurados à frente, flexione o cotovelo isoladamente.",
            "erro": "Deixar o ombro se mover para frente, perdendo o isolamento do bíceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Cable_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Cable_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca preacher unilateral",
            "exec": "Um braço por vez apoiado no banco scott, flexione controlando toda a amplitude.",
            "erro": "Não estender totalmente o cotovelo no final da repetição.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Incline_Dumbbell_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Incline_Dumbbell_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca scott com halteres",
            "exec": "Sentado no banco scott com os braços apoiados na almofada, flexione os cotovelos elevando os halteres até quase tocar os ombros, sem levantar os braços do apoio.",
            "erro": "Levantar os cotovelos da almofada no topo do movimento para completar a amplitude.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zottman_Preacher_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zottman_Preacher_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca scott na máquina",
            "exec": "Ajuste o assento da máquina scott para que as axilas encostem no topo da almofada e flexione os cotovelos puxando a alavanca até a contração máxima do bíceps.",
            "erro": "Ajustar o assento muito baixo, deixando o ombro elevado e reduzindo a ativação do bíceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Preacher_Curls/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Preacher_Curls/1.jpg"
            ]
          },
          {
            "name": "Rosca scott com barra W",
            "exec": "Apoiado no banco scott com pegada supinada fechada na barra W, flexione os cotovelos elevando a barra até quase tocar os ombros e desça controladamente até a extensão quase completa.",
            "erro": "Estender totalmente o cotovelo com carga pesada, sobrecarregando a articulação na posição de maior alongamento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Hammer_Dumbbell_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Hammer_Dumbbell_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca com halteres pegada supinada em pé",
            "exec": "Em pé com os cotovelos fixos junto ao tronco, flexione simultaneamente os dois halteres com pegada supinada até a altura dos ombros.",
            "erro": "Balançar o tronco para trás para gerar impulso na fase final da subida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Hammer_Curls/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Hammer_Curls/1.jpg"
            ]
          },
          {
            "name": "Rosca spider unilateral com halter",
            "exec": "Apoiado de bruços no banco inclinado com um braço estendido para baixo, flexione o cotovelo elevando o halter até a contração máxima, mantendo o braço perpendicular ao chão.",
            "erro": "Afastar o cotovelo do apoio do banco durante a execução, perdendo o isolamento do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Dumbbell_Curl_Over_Incline_Bench/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Dumbbell_Curl_Over_Incline_Bench/1.jpg"
            ]
          },
          {
            "name": "Rosca concentrada no cabo baixo",
            "exec": "Sentado de lado para a polia baixa com o cotovelo apoiado na parte interna da coxa, flexione o cotovelo puxando o cabo até a altura do peito.",
            "erro": "Apoiar o cotovelo na parte externa da coxa, alterando o ângulo de tração do cabo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Close-Grip_Concentration_Barbell_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Close-Grip_Concentration_Barbell_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca scott com cabo",
            "exec": "Posicione o banco scott em frente à polia baixa, apoie os braços na almofada e flexione os cotovelos puxando a barra até a contração máxima.",
            "erro": "Deixar o cabo perder tensão na posição inicial por posicionar o banco longe demais da polia.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Preacher_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Preacher_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca com halteres pegada supinada alternada em pé",
            "exec": "Em pé, flexione um halter de cada vez com pegada supinada, mantendo o cotovelo do braço parado totalmente estendido e imóvel junto ao tronco.",
            "erro": "Movimentar o cotovelo do braço que não está trabalhando, perdendo a estabilidade da postura.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Hammer_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Hammer_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca scott unilateral na máquina",
            "exec": "Ajuste o assento da máquina scott e flexione o cotovelo de um braço por vez, puxando a alavanca até a contração máxima sem levantar o braço da almofada.",
            "erro": "Girar o tronco para o lado que está trabalhando para ajudar a completar a repetição."
          },
          {
            "name": "Rosca scott com kettlebell unilateral",
            "exec": "Apoiado no banco scott, segure o kettlebell pela alça com um braço e flexione o cotovelo elevando-o até a contração máxima, mantendo o braço fixo na almofada.",
            "erro": "Deixar o kettlebell rodar na mão durante a subida, perdendo a estabilidade do pulso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Preacher_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Preacher_Curl/1.jpg"
            ]
          }
        ]
      },
      "braquial": {
        "label": "Braquial",
        "exercises": [
          {
            "name": "Rosca martelo com halteres",
            "exec": "Pegada neutra (palmas viradas uma para outra), flexione o cotovelo mantendo o punho fixo.",
            "erro": "Girar o punho durante o movimento, transformando em rosca supinada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross_Body_Hammer_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross_Body_Hammer_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca martelo no cabo com corda",
            "exec": "Pegada neutra na corda, puxe flexionando o cotovelo controlando a volta.",
            "erro": "Deixar o cotovelo se afastar do corpo durante a tração.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/1.jpg"
            ]
          },
          {
            "name": "Rosca invertida com barra (pegada pronada)",
            "exec": "Pegada pronada na barra reta, flexione o cotovelo mantendo os punhos travados.",
            "erro": "Usar carga excessiva que force a flexão do punho.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca martelo alternada em pé",
            "exec": "Alterne os braços com pegada neutra, mantendo o cotovelo fixo ao lado do tronco.",
            "erro": "Balançar o corpo para gerar impulso no final da subida."
          },
          {
            "name": "Rosca cross-body (halter cruzando o corpo)",
            "exec": "Pegada neutra, flexione levando o halter em direção ao ombro oposto.",
            "erro": "Girar o tronco para ajudar a cruzar o halter.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca martelo no banco inclinado",
            "exec": "Sentado em banco inclinado, braços atrás do tronco, flexione com pegada neutra.",
            "erro": "Deixar o ombro avançar à frente durante a subida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/1.jpg"
            ]
          },
          {
            "name": "Rosca martelo 21s",
            "exec": "7 parciais na metade inferior, 7 na metade superior e 7 completas com pegada neutra.",
            "erro": "Perder a pegada neutra nos blocos parciais, girando o punho.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Hammer_Curls/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Hammer_Curls/1.jpg"
            ]
          },
          {
            "name": "Rosca martelo com corda unilateral",
            "exec": "Um braço por vez na corda com pegada neutra, controle bem a fase de descida.",
            "erro": "Deixar o cotovelo subir/afastar do tronco durante o movimento."
          },
          {
            "name": "Rosca martelo sentado",
            "exec": "Sentado em banco reto com os halteres ao lado do corpo em pegada neutra, flexione os cotovelos elevando-os até a altura dos ombros sem apoiar as costas para gerar impulso.",
            "erro": "Recostar no encosto e usar a extensão do tronco para ajudar a levantar o peso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross_Body_Hammer_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross_Body_Hammer_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca martelo na polia baixa com barra reta",
            "exec": "De frente para a polia baixa segurando a barra reta em pegada neutra pelas extremidades, flexione os cotovelos puxando até o peito, mantendo os cotovelos fixos ao lado do corpo.",
            "erro": "Afastar os cotovelos do tronco durante a puxada, transformando o movimento em uma remada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Hammer_Dumbbell_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Hammer_Dumbbell_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca invertida na polia baixa",
            "exec": "Segure a barra reta na polia baixa com pegada pronada e flexione os cotovelos elevando-a até a altura do peito, mantendo os punhos travados.",
            "erro": "Deixar os punhos flexionarem durante a subida, tirando a tensão do antebraço e do braquial.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Cable_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Cable_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca invertida com barra EZ",
            "exec": "Em pé, segure a barra EZ nas partes mais próximas do centro com pegada pronada e flexione os cotovelos elevando-a até a altura do peito.",
            "erro": "Usar uma pegada muito aberta, o que reduz a ativação do braquiorradial e sobrecarrega os punhos.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca martelo no banco scott",
            "exec": "Apoiado no banco preacher com pegada neutra nos halteres, flexione os cotovelos elevando-os até a contração máxima, mantendo o braço em contato com a almofada.",
            "erro": "Descer o peso rápido demais na fase excêntrica, perdendo o controle sobre a articulação do cotovelo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/1.jpg"
            ]
          },
          {
            "name": "Rosca martelo com kettlebell",
            "exec": "Em pé, segure o kettlebell pela alça em pegada neutra e flexione o cotovelo elevando-o até a altura do ombro, mantendo o punho alinhado com o antebraço.",
            "erro": "Deixar o kettlebell balançar lateralmente por causa do deslocamento do centro de gravidade do sino."
          },
          {
            "name": "Rosca invertida unilateral com halter",
            "exec": "Em pé, segure um halter com pegada pronada e flexione o cotovelo elevando-o até a altura do peito, mantendo o punho firme durante todo o movimento.",
            "erro": "Deixar o antebraço rodar de volta para a pegada neutra no meio da repetição."
          },
          {
            "name": "Rosca martelo isométrica",
            "exec": "Com os halteres em pegada neutra, flexione os cotovelos a 90 graus e mantenha a posição estática pelo tempo determinado, sem deixar o braço subir ou ceder.",
            "erro": "Apoiar os cotovelos no tronco para aliviar a carga durante a isometria."
          },
          {
            "name": "Rosca invertida na máquina",
            "exec": "Sentado na máquina de rosca com pegada pronada nos manípulos, flexione os cotovelos puxando a alavanca até a contração máxima do antebraço.",
            "erro": "Elevar os ombros durante a puxada para compensar a falta de força no fim do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Plate_Curls/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Plate_Curls/1.jpg"
            ]
          },
          {
            "name": "Rosca martelo deitado no chão",
            "exec": "Deitado de costas no chão com os braços estendidos ao lado do corpo em pegada neutra, flexione os cotovelos elevando os halteres até que o antebraço fique perpendicular ao chão.",
            "erro": "Levantar o cotovelo do chão durante a subida, alterando o ângulo de trabalho do braquial."
          }
        ]
      }
    }
  },
  "triceps": {
    "label": "Tríceps",
    "portions": {
      "longa": {
        "label": "Cabeça Longa",
        "exercises": [
          {
            "name": "Tríceps testa com barra (acima da cabeça)",
            "exec": "Deitado ou sentado, braços acima da cabeça, flexione o cotovelo descendo a barra atrás da nuca.",
            "erro": "Abrir muito os cotovelos, perdendo o alongamento da cabeça longa.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Barbell_Triceps_Extension_Behind_The_Head/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Barbell_Triceps_Extension_Behind_The_Head/1.jpg"
            ]
          },
          {
            "name": "Tríceps francês com halter (unilateral acima da cabeça)",
            "exec": "Halter atrás da nuca com um braço, estenda o cotovelo mantendo o braço próximo à cabeça.",
            "erro": "Deixar o cotovelo se abrir para o lado durante a extensão."
          },
          {
            "name": "Extensão de tríceps no cabo alto (por trás da cabeça)",
            "exec": "De costas para a polia alta, puxe a corda por cima da cabeça estendendo os cotovelos à frente.",
            "erro": "Inclinar o tronco para frente para compensar a carga.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/1.jpg"
            ]
          },
          {
            "name": "Tríceps francês na polia com corda",
            "exec": "De costas para a polia baixa, segure a corda com as duas mãos atrás da cabeça, cotovelos apontando para cima e fixos, e estenda os braços para cima até quase a extensão completa.",
            "erro": "Deixar os cotovelos se abrirem para os lados durante a extensão, perdendo o alongamento da cabeça longa.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Overhead_Extension_with_Rope/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Overhead_Extension_with_Rope/1.jpg"
            ]
          },
          {
            "name": "Mergulho entre bancos (dips) — Tríceps",
            "exec": "Mãos apoiadas em dois bancos, desça o corpo flexionando os cotovelos e suba estendendo.",
            "erro": "Descer demais forçando o ombro além do confortável para a articulação.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ring_Dips/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ring_Dips/1.jpg"
            ]
          },
          {
            "name": "Tríceps testa com halteres unilateral",
            "exec": "Deitado, um halter por vez acima da cabeça, estenda o cotovelo mantendo o braço próximo à orelha.",
            "erro": "Deixar o braço se afastar da linha da cabeça durante a extensão.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Triceps_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Triceps_Extension/1.jpg"
            ]
          },
          {
            "name": "Extensão de tríceps sentado com barra atrás da cabeça",
            "exec": "Sentado, barra atrás da nuca, estenda os cotovelos para cima mantendo os braços próximos à cabeça.",
            "erro": "Abrir os cotovelos para os lados durante a subida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Overhead_Barbell_Triceps_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Overhead_Barbell_Triceps_Extension/1.jpg"
            ]
          },
          {
            "name": "Pullover com corda no cabo (overhead extension)",
            "exec": "De costas para a polia baixa, corda acima da cabeça, estenda os cotovelos levando as mãos à frente.",
            "erro": "Usar o ombro para puxar em vez de isolar a extensão do cotovelo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Barbell_Pullover/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Barbell_Pullover/1.jpg"
            ]
          },
          {
            "name": "Mergulho na paralela com tronco ereto",
            "exec": "Mãos nas paralelas, tronco o mais vertical possível, desça e suba flexionando e estendendo os cotovelos.",
            "erro": "Inclinar o tronco à frente, transferindo o estímulo para o peito.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/1.jpg"
            ]
          },
          {
            "name": "Tríceps francês bilateral em pé",
            "exec": "Em pé, segure um halter com as duas mãos por baixo do disco superior e estenda os cotovelos acima da cabeça, descendo o peso atrás da nuca de forma controlada.",
            "erro": "Abrir os cotovelos para os lados durante a descida, perdendo o alinhamento vertical do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Overhead_Triceps_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Overhead_Triceps_Extension/1.jpg"
            ]
          },
          {
            "name": "Extensão de tríceps ajoelhado com corda atrás da cabeça",
            "exec": "Ajoelhado de costas para a polia baixa segurando a corda atrás da cabeça com as duas mãos, estenda os cotovelos levando as mãos para cima e à frente.",
            "erro": "Inclinar o tronco para frente durante a extensão, tirando o alongamento do tríceps na posição inicial.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Triceps_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Triceps_Extension/1.jpg"
            ]
          },
          {
            "name": "Tríceps testa no banco declinado com barra EZ",
            "exec": "Deitado no banco declinado segurando a barra EZ acima do rosto, flexione os cotovelos descendo a barra em direção à testa e estenda de volta sem mover os braços.",
            "erro": "Deslocar os cotovelos para trás da cabeça durante a descida, tirando a tensão do tríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Barbell_Triceps_Extension_Behind_The_Head/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Barbell_Triceps_Extension_Behind_The_Head/1.jpg"
            ]
          },
          {
            "name": "Tríceps francês sentado com halteres duplos",
            "exec": "Sentado com um halter em cada mão acima da cabeça e as palmas voltadas uma para a outra, flexione os cotovelos descendo os halteres atrás da nuca e estenda de volta ao topo.",
            "erro": "Deixar os cotovelos se afastarem para os lados durante a descida, perdendo o alinhamento em pegada neutra.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Overhead_Triceps_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Overhead_Triceps_Extension/1.jpg"
            ]
          },
          {
            "name": "Mergulho na paralela com peso adicional",
            "exec": "Com um cinto de peso preso na cintura, execute o mergulho na paralela descendo até os ombros ficarem na altura dos cotovelos e empurre de volta ao topo.",
            "erro": "Descer além da amplitude confortável do ombro só para compensar a carga extra, forçando a articulação.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dip_Machine/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dip_Machine/1.jpg"
            ]
          },
          {
            "name": "Extensão de tríceps overhead no landmine unilateral",
            "exec": "De costas para o landmine, segure a ponta livre da barra com uma mão acima da cabeça e estenda o cotovelo empurrando a barra para cima seguindo o arco natural do equipamento.",
            "erro": "Perder a verticalidade do antebraço durante a extensão, deixando o cotovelo vagar para os lados."
          },
          {
            "name": "Tríceps testa com halteres bilateral no banco inclinado",
            "exec": "Deitado no banco inclinado a 30 graus com um halter em cada mão acima do rosto, flexione os cotovelos simultaneamente e estenda de volta sem movimentar os ombros.",
            "erro": "Usar um ângulo de inclinação alto demais, transformando o movimento em um desenvolvimento em vez de uma extensão isolada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Dumbbell_Tricep_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Dumbbell_Tricep_Extension/1.jpg"
            ]
          },
          {
            "name": "Extensão de tríceps unilateral no cross-over atrás da cabeça",
            "exec": "Com a polia alta atrás da cabeça, segure a alça com uma mão e estenda o cotovelo levando a mão para cima e à frente, mantendo o cotovelo próximo à cabeça.",
            "erro": "Afastar o cotovelo da cabeça durante a extensão, alterando o ângulo de trabalho da cabeça longa.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_One_Arm_Tricep_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_One_Arm_Tricep_Extension/1.jpg"
            ]
          },
          {
            "name": "Mergulho no aparelho guiado",
            "exec": "Sentado ou em pé no aparelho de mergulho guiado, empurre as alavancas para baixo estendendo os cotovelos até quase a extensão completa, mantendo o tronco levemente inclinado à frente.",
            "erro": "Inclinar o tronco excessivamente à frente, transferindo o esforço para o peitoral em vez do tríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jerk_Dip_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jerk_Dip_Squat/1.jpg"
            ]
          },
          {
            "name": "Extensão de tríceps com kettlebell acima da cabeça",
            "exec": "Em pé, segure o kettlebell pelos chifres com as duas mãos acima da cabeça e estenda os cotovelos completamente, controlando a descida atrás da nuca.",
            "erro": "Deixar os cotovelos abrirem para os lados na descida, perdendo a trajetória vertical do peso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Overhead_Triceps_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Overhead_Triceps_Extension/1.jpg"
            ]
          }
        ]
      },
      "lateral": {
        "label": "Cabeça Lateral",
        "exercises": [
          {
            "name": "Tríceps corda no cabo (pulley)",
            "exec": "De frente para a polia alta, estenda os cotovelos empurrando a corda para baixo e afastando as pontas no final.",
            "erro": "Afastar os cotovelos do tronco durante a execução.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Triceps_Pushdown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Triceps_Pushdown/1.jpg"
            ]
          },
          {
            "name": "Tríceps pulley com barra reta",
            "exec": "Pegada pronada na barra, cotovelos fixos ao lado do corpo, estenda para baixo.",
            "erro": "Usar o peso do corpo para empurrar a barra em vez do tríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_Rope_Attachment/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_Rope_Attachment/1.jpg"
            ]
          },
          {
            "name": "Extensão unilateral no cabo",
            "exec": "Um braço por vez na polia alta, estenda o cotovelo mantendo-o fixo ao lado do corpo.",
            "erro": "Girar o tronco para ajudar a empurrar o cabo."
          },
          {
            "name": "Kickback com halter",
            "exec": "Tronco inclinado à frente, cotovelo fixo ao lado do corpo, estenda o antebraço para trás.",
            "erro": "Balançar o cotovelo para cima e para baixo em vez de mantê-lo fixo."
          },
          {
            "name": "Tríceps coice com halteres (kickback)",
            "exec": "Incline o tronco à frente, cotovelo dobrado e colado ao corpo, estique o braço para trás até ficar reto, depois volte devagar.",
            "erro": "Balançar o braço em vez de fazer o movimento controlado.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Dumbbell_Kickback/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Dumbbell_Kickback/1.jpg"
            ]
          },
          {
            "name": "Tríceps coice na polia baixa",
            "exec": "Cabo na polia baixa, tronco inclinado, estenda o cotovelo para trás mantendo-o fixo ao lado do corpo.",
            "erro": "Levantar o cotovelo durante a extensão, perdendo a tensão constante.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Dumbbell_Kickback/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Dumbbell_Kickback/1.jpg"
            ]
          },
          {
            "name": "Supino fechado (close grip bench press)",
            "exec": "Deitado, pegada mais fechada que os ombros na barra, desça até o peito e empurre estendendo os cotovelos.",
            "erro": "Abrir demais os cotovelos, transformando em supino comum.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Tríceps na máquina",
            "exec": "Sentado, empurre a alavanca estendendo os cotovelos até quase a extensão total.",
            "erro": "Usar amplitude reduzida, sem descer totalmente.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/1.jpg"
            ]
          },
          {
            "name": "Extensão de tríceps unilateral com halter (kickback invertido em pé)",
            "exec": "Em pé, tronco levemente inclinado, um braço por vez, estenda o cotovelo controlando a volta.",
            "erro": "Girar o tronco para gerar impulso na extensão.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Pronated_Dumbbell_Triceps_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Pronated_Dumbbell_Triceps_Extension/1.jpg"
            ]
          },
          {
            "name": "Tríceps pulley com barra reta pegada larga",
            "exec": "Segure a barra reta na polia alta com as mãos bem afastadas, além da largura dos ombros, e estenda os cotovelos empurrando a barra para baixo até a extensão quase completa.",
            "erro": "Deixar os cotovelos se abrirem para os lados por causa da pegada mais larga, perdendo a estabilidade do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_V-Bar_Attachment/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_V-Bar_Attachment/1.jpg"
            ]
          },
          {
            "name": "Kickback com halteres bilateral",
            "exec": "Incline o tronco à frente com os cotovelos fixos junto às costelas e estenda os dois cotovelos simultaneamente para trás, contraindo o tríceps no topo do movimento.",
            "erro": "Deixar os cotovelos caírem durante a extensão, reduzindo o ângulo de trabalho do exercício."
          },
          {
            "name": "Supino fechado com halteres",
            "exec": "Deitado no banco reto com um halter em cada mão próximos um do outro sobre o peito, desça-os mantendo os cotovelos próximos ao tronco e empurre de volta ao topo.",
            "erro": "Deixar os halteres se afastarem lateralmente na descida, perdendo a proximidade que caracteriza a pegada fechada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Extensão de tríceps cross-body no cabo baixo",
            "exec": "Com a polia baixa ao lado do corpo, segure a alça com a mão oposta ao aparelho e estenda o cotovelo cruzando a mão em diagonal até a altura do ombro contrário.",
            "erro": "Girar o tronco para ajudar na extensão em vez de manter os quadris fixos e isolar o cotovelo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Lying_Triceps_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Lying_Triceps_Extension/1.jpg"
            ]
          },
          {
            "name": "Tríceps na máquina pegada neutra unilateral",
            "exec": "Sentado na máquina de extensão com pegada neutra, empurre a alavanca para baixo com um braço de cada vez, mantendo o cotovelo apoiado durante todo o percurso.",
            "erro": "Elevar o ombro do lado que está trabalhando para compensar a falta de força no final da amplitude."
          },
          {
            "name": "Kickback com kettlebell",
            "exec": "Incline o tronco à frente com o cotovelo fixo junto às costelas e estenda o cotovelo levando o kettlebell para trás até a extensão completa do braço.",
            "erro": "Balançar o kettlebell por inércia em vez de controlar a extensão através da contração do tríceps."
          },
          {
            "name": "Tríceps pulley pegada mista",
            "exec": "Segure a barra reta na polia alta com uma mão em pegada pronada e a outra em supinada e estenda os cotovelos empurrando a barra para baixo simetricamente.",
            "erro": "Deixar o lado de pegada mais fraca compensar assimetricamente, inclinando o corpo para esse lado.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/1.jpg"
            ]
          },
          {
            "name": "Supino fechado no banco inclinado",
            "exec": "Deitado no banco inclinado a 30 graus com pegada fechada na barra, desça-a até a parte superior do peito e empurre de volta mantendo os cotovelos próximos ao tronco.",
            "erro": "Descer a barra até o pescoço em vez do peito superior, alterando o ângulo de trabalho e sobrecarregando o ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_with_Chains/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_with_Chains/1.jpg"
            ]
          },
          {
            "name": "Tríceps pulley com apoio no banco",
            "exec": "De frente para a polia alta, apoie a mão livre em um banco ou suporte à frente para estabilizar o tronco e estenda o cotovelo empurrando a alça para baixo.",
            "erro": "Deixar o tronco inclinar junto com o movimento do braço, perdendo o isolamento do cotovelo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Triceps_Pushdown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Triceps_Pushdown/1.jpg"
            ]
          },
          {
            "name": "Tríceps pushdown com faixa elástica",
            "exec": "Prenda a faixa elástica em um ponto alto, segure as extremidades com pegada pronada e estenda os cotovelos empurrando para baixo até a extensão quase completa.",
            "erro": "Deixar a faixa perder tensão na posição inicial por ficar muito próximo do ponto de fixação.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Band_Overhead_Triceps/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Band_Overhead_Triceps/1.jpg"
            ]
          }
        ]
      },
      "medial": {
        "label": "Cabeça Medial",
        "exercises": [
          {
            "name": "Tríceps testa com barra EZ (baixa amplitude)",
            "exec": "Deitado, barra descendo em direção à testa/topo da cabeça com cotovelos semi-fixos.",
            "erro": "Descer a barra longe da cabeça, tirando tensão do tríceps."
          },
          {
            "name": "Tríceps pulley pegada invertida (supinada)",
            "exec": "Pegada supinada na barra reta na polia alta, estenda os cotovelos mantendo-os junto ao corpo.",
            "erro": "Deixar os punhos flexionarem durante o movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_Rope_Attachment/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_Rope_Attachment/1.jpg"
            ]
          },
          {
            "name": "Mergulho no banco (bench dips)",
            "exec": "Mãos apoiadas no banco atrás do corpo, desça flexionando os cotovelos a cerca de 90°.",
            "erro": "Descer demais sobrecarregando a articulação do ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Parallel_Bar_Dip/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Parallel_Bar_Dip/1.jpg"
            ]
          },
          {
            "name": "Extensão de tríceps deitado com halteres (pegada neutra)",
            "exec": "Deitado no banco, halteres com pegada neutra, flexione os cotovelos levando os pesos próximo às orelhas.",
            "erro": "Abrir os cotovelos para os lados durante a descida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Dumbbell_Tricep_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Dumbbell_Tricep_Extension/1.jpg"
            ]
          },
          {
            "name": "Tríceps corda unilateral no pulley",
            "exec": "Um lado da corda por vez, estenda o cotovelo mantendo-o fixo ao lado do corpo.",
            "erro": "Deixar o ombro compensar o movimento em vez do cotovelo isolado."
          },
          {
            "name": "Supino fechado no smith machine",
            "exec": "Pegada fechada na barra guiada, desça controlado até o peito e estenda os cotovelos.",
            "erro": "Deixar os punhos flexionarem por causa da pegada muito fechada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Extensão de tríceps na polia com pegada V (barra V)",
            "exec": "Pegada neutra na barra V na polia alta, estenda os cotovelos empurrando para baixo.",
            "erro": "Usar impulso do tronco em vez de isolar o tríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Stretch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Stretch/1.jpg"
            ]
          },
          {
            "name": "Kickback na polia baixa unilateral",
            "exec": "Um braço na polia baixa atrás do corpo, cotovelo fixo ao lado do tronco, estenda o antebraço para trás controlando a volta.",
            "erro": "Levantar o cotovelo durante a execução, perdendo o ângulo de trabalho."
          },
          {
            "name": "Extensão de tríceps deitado com barra EZ",
            "exec": "Deitado no banco reto segurando a barra EZ acima do rosto com pegada fechada, flexione os cotovelos descendo a barra em direção à testa e estenda de volta sem mover os braços.",
            "erro": "Deixar os cotovelos se abrirem para os lados durante a descida, perdendo a proximidade que isola a cabeça medial."
          },
          {
            "name": "Extensão de tríceps unilateral sentado atrás da nuca",
            "exec": "Sentado, segure um halter com uma mão atrás da nuca com o cotovelo apontado para cima e estenda o cotovelo elevando o halter até quase travar o braço.",
            "erro": "Deixar o cotovelo se abrir para o lado durante a extensão, perdendo o alinhamento vertical do antebraço.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Dumbbell_Triceps_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Dumbbell_Triceps_Extension/1.jpg"
            ]
          },
          {
            "name": "Tríceps pulley pegada pronada estreita",
            "exec": "Segure a barra reta na polia alta com as mãos juntas no centro em pegada pronada e estenda os cotovelos empurrando a barra para baixo, mantendo os cotovelos colados ao tronco.",
            "erro": "Afastar os cotovelos do corpo durante a descida, perdendo a tensão concentrada da pegada fechada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_V-Bar_Attachment/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_V-Bar_Attachment/1.jpg"
            ]
          },
          {
            "name": "Extensão de tríceps no crossover baixo",
            "exec": "Com as polias baixas cruzadas à frente do corpo, segure uma alça em cada mão junto ao quadril e estenda os cotovelos empurrando as mãos para baixo e para fora, mantendo os cotovelos fixos ao lado do tronco.",
            "erro": "Deixar os cotovelos se moverem para frente e para trás em vez de mantê-los fixos durante toda a extensão."
          },
          {
            "name": "Extensão de tríceps unilateral com kettlebell deitado",
            "exec": "Deitado no banco reto, segure o kettlebell pela alça com um braço estendido acima do peito e flexione o cotovelo descendo o peso em direção à testa, estendendo de volta ao topo.",
            "erro": "Deixar o kettlebell balançar para os lados por causa do deslocamento do centro de gravidade do sino.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Supinated_Dumbbell_Triceps_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Supinated_Dumbbell_Triceps_Extension/1.jpg"
            ]
          },
          {
            "name": "Tríceps testa com halteres pegada neutra em pé",
            "exec": "Em pé com os cotovelos apontados para cima junto à cabeça e halteres em pegada neutra, flexione os cotovelos descendo os pesos atrás da nuca e estenda de volta ao topo.",
            "erro": "Deixar os cotovelos avançarem para a frente durante a descida, perdendo a posição fixa junto à cabeça."
          },
          {
            "name": "Mergulho assistido na máquina",
            "exec": "Ajuste o contrapeso da máquina de mergulho assistido, posicione os joelhos na plataforma e desça o corpo flexionando os cotovelos até os ombros ficarem na altura dos cotovelos, empurrando de volta ao topo.",
            "erro": "Usar um contrapeso excessivo que elimina a carga real de trabalho do tríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dip_Machine/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dip_Machine/1.jpg"
            ]
          },
          {
            "name": "Kickback com halteres alternado",
            "exec": "Incline o tronco à frente com os cotovelos fixos junto às costelas e estenda um cotovelo de cada vez para trás, alternando os lados a cada repetição.",
            "erro": "Girar o tronco para o lado que está sendo estendido, usando rotação do corpo em vez de força do tríceps."
          },
          {
            "name": "Extensão de tríceps unilateral no banco scott",
            "exec": "Apoie a parte de trás do braço na almofada do banco scott com o cotovelo fixo e estenda o antebraço segurando um halter, controlando a descida até a flexão quase completa.",
            "erro": "Deixar o braço deslizar sobre a almofada durante o movimento, perdendo o ponto de apoio fixo do cotovelo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Low-Pulley_One-Arm_Triceps_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Low-Pulley_One-Arm_Triceps_Extension/1.jpg"
            ]
          },
          {
            "name": "Tríceps pulley ajoelhado com barra reta",
            "exec": "Ajoelhado de frente para a polia alta segurando a barra reta, estenda os cotovelos empurrando a barra para baixo, mantendo o tronco ereto e os cotovelos fixos ao lado do corpo.",
            "erro": "Sentar sobre os calcanhares e usar o peso do corpo para ajudar a empurrar a barra para baixo."
          }
        ]
      }
    }
  },
  "peito": {
    "label": "Peito",
    "portions": {
      "superior": {
        "label": "Peitoral Superior (Clavicular)",
        "exercises": [
          {
            "name": "Supino inclinado com barra",
            "exec": "Banco a 30-45°, desça a barra até a parte superior do peito e empurre de volta.",
            "erro": "Inclinar o banco além de 45°, transferindo o trabalho para o ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/1.jpg"
            ]
          },
          {
            "name": "Supino inclinado com halteres",
            "exec": "Banco inclinado, desça os halteres controlando até a altura do peito superior.",
            "erro": "Deixar os cotovelos abrirem 90° completos, sobrecarregando o ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Grip_Incline_DB_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Grip_Incline_DB_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Crucifixo inclinado com halteres",
            "exec": "Banco inclinado, braços em arco lateral, desça até sentir alongamento no peito.",
            "erro": "Descer demais perdendo a estabilidade do ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes/1.jpg"
            ]
          },
          {
            "name": "Crossover no cabo (de baixo para cima)",
            "exec": "Polias baixas, puxe os cabos em diagonal até se encontrarem na altura do peito superior.",
            "erro": "Usar apenas os braços sem contrair o peitoral no final do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/1.jpg"
            ]
          },
          {
            "name": "Supino inclinado no smith machine",
            "exec": "Banco inclinado sob a barra guiada, desça até o peito superior e empurre de volta controlado.",
            "erro": "Posicionar o banco no ângulo errado em relação à barra, forçando o ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Incline_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Incline_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Flexão de braço inclinada (mãos elevadas)",
            "exec": "Mãos apoiadas em um banco ou step, corpo inclinado, desça o peito em direção às mãos.",
            "erro": "Deixar o quadril cair, perdendo o alinhamento corporal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Push-up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Push-up/1.jpg"
            ]
          },
          {
            "name": "Crucifixo inclinado no cabo unilateral",
            "exec": "Banco inclinado sob a polia baixa, um braço por vez, traga o cabo em arco até a linha do peito superior.",
            "erro": "Girar o tronco para ajudar a completar o movimento."
          },
          {
            "name": "Peck deck inclinado (quando disponível)",
            "exec": "Sentado com o assento ajustado para ângulo superior, junte os braços à frente contraindo o peito superior.",
            "erro": "Usar amplitude reduzida sem sentir o alongamento no início do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/1.jpg"
            ]
          },
          {
            "name": "Supino inclinado na máquina articulada (hammer strength)",
            "exec": "Ajuste o banco da máquina para acompanhar a inclinação dos punhos e empurre as alavancas para cima e à frente até a extensão quase completa dos cotovelos, sem travá-los. Retorne controladamente até sentir alongamento na porção superior do peitoral.",
            "erro": "Elevar os ombros junto com o movimento, transferindo a carga para o trapézio superior.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Incline_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Incline_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Supino inclinado com halteres pegada neutra (martelo)",
            "exec": "Deitado no banco a 30-45°, segure os halteres com as palmas voltadas uma para a outra e empurre-os para cima em linha reta acima do peitoral superior. Desça até os cotovelos formarem cerca de 90°.",
            "erro": "Deixar os halteres se afastarem lateralmente, perdendo a trajetória vertical e sobrecarregando o ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Grip_Incline_DB_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Grip_Incline_DB_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Supino inclinado unilateral com halter",
            "exec": "Com um halter em uma das mãos e a outra apoiada na coxa ou no banco para estabilidade, empurre o peso para cima mantendo o tronco fixo e sem rotacionar. Alterne os lados após completar a série.",
            "erro": "Rotacionar o tronco para ajudar no empurrão, tirando o trabalho do peitoral."
          },
          {
            "name": "Crucifixo inclinado unilateral com halter",
            "exec": "Deitado no banco inclinado, com um halter em uma mão, abra o braço lateralmente com leve flexão do cotovelo até sentir alongamento no peitoral superior e retorne em arco até o topo.",
            "erro": "Flexionar e estender o cotovelo durante o movimento, transformando o crucifixo em um supino parcial."
          },
          {
            "name": "Supino inclinado com barra pegada fechada",
            "exec": "No banco inclinado, posicione as mãos na barra com afastamento pouco maior que a largura dos ombros e desça a barra até tocar levemente a parte superior do peitoral, mantendo os cotovelos próximos ao tronco.",
            "erro": "Abrir demais os cotovelos, perdendo o foco na região superior e sobrecarregando os ombros.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/1.jpg"
            ]
          },
          {
            "name": "Supino inclinado com barra landmine (press unilateral)",
            "exec": "Encaixe uma extremidade da barra em um apoio landmine ou canto, segure a outra ponta junto ao peitoral e empurre em diagonal para cima e à frente, um braço de cada vez, mantendo o core estável.",
            "erro": "Deixar o tronco girar em direção ao braço que empurra, perdendo a estabilidade da coluna."
          },
          {
            "name": "Flexão de braço inclinada com sobrecarga (anilha nas costas)",
            "exec": "Com as mãos apoiadas em um banco ou step e uma anilha posicionada sobre a região lombar/escapular segurada por um parceiro ou cinto, execute a flexão controlando a descida até o peito quase tocar o apoio.",
            "erro": "Deixar o quadril cair ou subir durante o movimento, perdendo o alinhamento corporal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/1.jpg"
            ]
          },
          {
            "name": "Crucifixo inclinado alternado no cabo",
            "exec": "Nas polias baixas em pé de frente ao banco inclinado, traga um cabo de cada vez em arco até a linha do peitoral superior, alternando os braços com cadência controlada e sem soltar a tensão na polia oposta.",
            "erro": "Acelerar a fase de retorno, permitindo que o peso puxe o braço de volta sem controle."
          },
          {
            "name": "Supino inclinado com halteres pegada pronada fechada",
            "exec": "No banco a 30°, segure os halteres próximos um do outro com pegada pronada e empurre-os para cima mantendo os cotovelos semi-fechados durante todo o percurso.",
            "erro": "Deixar os punhos se estenderem para trás, sobrecarregando a articulação do punho."
          },
          {
            "name": "Peck deck ajustável em ângulo alto unilateral",
            "exec": "Com o apoio do peck deck regulado para simular a linha superior do peitoral, empurre a alavanca com um braço até o centro do corpo, contraindo no ponto final, e retorne controlando o alongamento.",
            "erro": "Girar o tronco para ajudar a completar a amplitude, tirando a tensão do peitoral."
          },
          {
            "name": "Supino inclinado com barra pegada aberta (foco externo/superior)",
            "exec": "No banco a 30-45°, posicione as mãos bem além da largura dos ombros na barra e desça até a parte superior do peito, com amplitude mais curta que a pegada padrão, priorizando a porção externa do peitoral superior.",
            "erro": "Sobrecarregar o punho e o ombro usando carga alta com a pegada excessivamente aberta."
          },
          {
            "name": "Crucifixo inclinado no cabo com corda (pegada neutra)",
            "exec": "Nas polias baixas, troque as alças simples pela corda e traga as duas pontas em arco até se encontrarem à frente do peitoral superior, aproximando bem as mãos no topo para maximizar a contração.",
            "erro": "Separar as pontas da corda cedo demais na descida, perdendo a tensão constante característica da pegada neutra.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Cable_Flye/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Cable_Flye/1.jpg"
            ]
          }
        ]
      },
      "medio": {
        "label": "Peitoral Médio (Esternal)",
        "exercises": [
          {
            "name": "Supino reto com barra",
            "exec": "Deitado no banco reto, desça a barra até tocar levemente o peito e empurre de volta.",
            "erro": "Quicar a barra no peito para gerar impulso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_Powerlifting/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_Powerlifting/1.jpg"
            ]
          },
          {
            "name": "Supino reto com halteres",
            "exec": "Deitado, halteres descendo em arco até a linha do peito, empurrando de volta.",
            "erro": "Deixar os halteres irem além do controle na descida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Crucifixo reto com halteres",
            "exec": "Deitado, braços em arco lateral com leve flexão de cotovelo, desça até o alongamento máximo confortável.",
            "erro": "Manter os cotovelos totalmente travados, sobrecarregando a articulação.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/1.jpg"
            ]
          },
          {
            "name": "Crossover no cabo (na linha do peito)",
            "exec": "Polias na altura dos ombros, puxe os cabos horizontalmente até se encontrarem à frente do peito.",
            "erro": "Inclinar o tronco para frente para compensar a falta de amplitude.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Crossover/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Crossover/1.jpg"
            ]
          },
          {
            "name": "Supino reto no smith machine",
            "exec": "Deitado sob a barra guiada, desça até tocar o peito levemente e empurre de volta.",
            "erro": "Posicionar o banco fora do eixo da barra, forçando o ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Close-Grip_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Close-Grip_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Flexão de braço tradicional — Peito",
            "exec": "Mãos na largura dos ombros, corpo alinhado, desça o peito até quase tocar o chão e empurre de volta.",
            "erro": "Deixar o quadril subir ou cair, perdendo o alinhamento corporal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clock_Push-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clock_Push-Up/1.jpg"
            ]
          },
          {
            "name": "Peck deck (voador na máquina)",
            "exec": "Sentado, cotovelos levemente flexionados, junte os braços à frente contraindo o peito.",
            "erro": "Bater os braços com força no final, usando impulso em vez de contração controlada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/1.jpg"
            ]
          },
          {
            "name": "Crucifixo no banco reto com cabo unilateral",
            "exec": "Deitado no banco sob a polia, um braço por vez, traga o cabo em arco até o centro do peito.",
            "erro": "Girar o tronco para ajudar a trazer o cabo até o centro."
          },
          {
            "name": "Supino reto na máquina articulada (hammer strength)",
            "exec": "Sentado com as costas apoiadas, empurre as alavancas horizontalmente à frente até quase estender os cotovelos e retorne até sentir alongamento no meio do peitoral.",
            "erro": "Perder o contato das costas com o encosto durante o empurrão, gerando impulso lombar.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Supino reto com halteres pegada neutra (martelo)",
            "exec": "Deitado no banco reto, empurre os halteres para cima com as palmas voltadas uma para a outra, mantendo trajetória vertical sobre o centro do peitoral.",
            "erro": "Deixar os cotovelos abrirem excessivamente na descida, sobrecarregando a articulação do ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press_with_Neutral_Grip/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press_with_Neutral_Grip/1.jpg"
            ]
          },
          {
            "name": "Supino reto unilateral com halter",
            "exec": "Com um halter em uma das mãos, empurre-o para cima mantendo o quadril e o tronco estáveis sobre o banco, sem deixar o corpo rotacionar para compensar a carga.",
            "erro": "Levantar o quadril do banco para gerar impulso no empurrão.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Supino reto com barra pegada fechada",
            "exec": "Deitado no banco reto, posicione as mãos com afastamento pouco maior que a largura dos ombros e desça a barra até tocar levemente o meio do peitoral, cotovelos próximos ao corpo.",
            "erro": "Rebater a barra no peito para ganhar impulso na subida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Crucifixo reto no cabo com banco (cross bench unilateral)",
            "exec": "Deitado em um banco posicionado entre duas polias baixas, traga um cabo de cada vez em arco até o centro do peitoral, mantendo leve flexão de cotovelo constante.",
            "erro": "Estender totalmente o cotovelo no topo, transferindo a tensão para o tríceps."
          },
          {
            "name": "Flexão de braço com pegada afastada",
            "exec": "Apoie as mãos no chão bem além da largura dos ombros e desça o tronco controladamente até o peito se aproximar do solo, mantendo o corpo alinhado.",
            "erro": "Deixar os cotovelos abrirem em ângulo de 90° com o tronco, sobrecarregando o ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/1.jpg"
            ]
          },
          {
            "name": "Flexão de braço em barras paralelas baixas (foco peitoral)",
            "exec": "Apoiado em barras paralelas baixas com o tronco inclinado à frente, flexione os cotovelos descendo o corpo até sentir alongamento no peitoral e empurre de volta à posição inicial.",
            "erro": "Manter o tronco na vertical, o que desloca o foco do peitoral para o tríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up/1.jpg"
            ]
          },
          {
            "name": "Supino reto com kettlebells",
            "exec": "Segure os kettlebells pelas alças com pegada neutra ou pronada e empurre-os verticalmente acima do peitoral, controlando a estabilidade lateral do peso durante todo o movimento.",
            "erro": "Deixar os kettlebells balançarem lateralmente por falta de controle no punho.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_With_Bands/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_With_Bands/1.jpg"
            ]
          },
          {
            "name": "Pullover na máquina (foco peitoral/serrátil)",
            "exec": "Sentado na máquina de pullover, com os braços semi-flexionados presos nos apoios, traga a alavanca da posição atrás da cabeça até a linha do quadril, contraindo o peitoral e o serrátil.",
            "erro": "Flexionar e estender o cotovelo durante o movimento em vez de manter o ângulo fixo do braço.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Dumbbell_Pullover/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Dumbbell_Pullover/1.jpg"
            ]
          },
          {
            "name": "Supino reto com barra pegada média (pausa isométrica na base)",
            "exec": "Com pegada na largura dos ombros, desça a barra até tocar o peitoral e faça uma pausa de 1-2 segundos antes de empurrar de volta, mantendo tensão constante.",
            "erro": "Relaxar completamente a musculatura durante a pausa, perdendo a tensão e comprometendo a estabilidade do ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Barbell_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Barbell_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Supino reto com barra pegada aberta (larga)",
            "exec": "Deitado no banco reto, posicione as mãos bem além da largura dos ombros na barra e desça até tocar levemente o peito, com amplitude reduzida e ênfase na porção externa do peitoral.",
            "erro": "Abrir demais os cotovelos e usar carga excessiva, sobrecarregando a articulação do ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Guillotine_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Guillotine_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Voador unilateral em pé no cabo (standing single-arm cable fly)",
            "exec": "Em pé, de lado para a polia ajustada na altura do peito, puxe o cabo cruzando o corpo até a linha central com leve flexão de cotovelo, girando ligeiramente o tronco para dar suporte ao movimento.",
            "erro": "Girar o tronco em excesso para ajudar a completar o movimento, tirando o isolamento do peitoral."
          },
          {
            "name": "Crucifixo no cabo com corda (rope fly cruzado)",
            "exec": "Com uma polia lateral em cada lado na altura do peito, segure uma ponta da corda em cada mão e cruze os cabos à frente do corpo, contraindo o peitoral no centro antes de retornar controlado.",
            "erro": "Soltar a tensão da corda logo no início do movimento por afastar demais as mãos na volta.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rear_Delt_Fly/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rear_Delt_Fly/1.jpg"
            ]
          },
          {
            "name": "Landmine press bilateral com as duas mãos",
            "exec": "Com uma extremidade da barra encaixada no landmine e a outra apoiada contra o peito segurada com as duas mãos, empurre a barra para cima e à frente seguindo o arco natural do equipamento, sem travar totalmente os cotovelos no topo.",
            "erro": "Arquear a lombar para ajudar a empurrar o peso, em vez de manter o core contraído durante todo o movimento."
          },
          {
            "name": "Landmine press em pé com rotação de tronco",
            "exec": "Com a barra no landmine junto ao peito, empurre-a para cima e à frente enquanto gira levemente o tronco e o quadril na direção do braço que empurra, retornando à posição inicial de forma controlada.",
            "erro": "Girar apenas os ombros sem envolver o quadril na rotação, perdendo a transferência de força pela cadeia cinética e sobrecarregando a lombar."
          },
          {
            "name": "Thruster com landmine (agachamento + press)",
            "exec": "Segure a ponta da barra do landmine junto ao peito com as duas mãos, agache até a coxa próxima do paralelo e, ao subir, use o impulso das pernas para empurrar a barra para cima e à frente em um único movimento contínuo.",
            "erro": "Separar o agachamento do empurrão em dois tempos distintos em vez de encadear os dois numa transição fluida, perdendo a transferência de força das pernas para o press."
          }
        ]
      },
      "inferior": {
        "label": "Peitoral Inferior (Costal)",
        "exercises": [
          {
            "name": "Supino declinado com barra",
            "exec": "Banco declinado, desça a barra até a parte inferior do peito e empurre de volta.",
            "erro": "Descer rápido demais sem controle na fase excêntrica.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Crossover no cabo (de cima para baixo)",
            "exec": "Polias altas, puxe os cabos em diagonal para baixo até se encontrarem próximo ao quadril.",
            "erro": "Usar apenas o movimento do braço sem inclinar levemente o tronco à frente.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Cable_Crossover/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Cable_Crossover/1.jpg"
            ]
          },
          {
            "name": "Mergulho (dips) com foco no peito",
            "exec": "Tronco inclinado à frente nas paralelas, desça controlando a flexão dos cotovelos.",
            "erro": "Manter o tronco ereto, o que desloca o estímulo para o tríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Bench_Dip/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Bench_Dip/1.jpg"
            ]
          },
          {
            "name": "Flexão de braço com pés elevados invertida (declinada)",
            "exec": "Mãos no chão, pés elevados, desça o peito em direção ao solo controlando o movimento.",
            "erro": "Deixar o quadril cair, perdendo alinhamento corporal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Push-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Push-Up/1.jpg"
            ]
          },
          {
            "name": "Supino declinado com halteres",
            "exec": "Banco declinado, desça os halteres controlando até a parte inferior do peito e empurre de volta.",
            "erro": "Perder o controle dos halteres na posição declinada, arriscando lesão.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Pullover com halter",
            "exec": "Deitado transversalmente no banco, halter acima do peito, desça em arco atrás da cabeça e retorne.",
            "erro": "Flexionar demais os cotovelos, tirando o trabalho do peitoral e passando para o tríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Dumbbell_Pullover/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Dumbbell_Pullover/1.jpg"
            ]
          },
          {
            "name": "Crossover baixo unilateral",
            "exec": "Polia alta, um braço por vez, puxe o cabo diagonalmente para baixo até a altura do quadril.",
            "erro": "Girar o tronco para ganhar amplitude artificial.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Cable_Crossover/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Cable_Crossover/1.jpg"
            ]
          },
          {
            "name": "Flexão de braço com cotovelos junto ao corpo (foco inferior)",
            "exec": "Mãos próximas, cotovelos rente ao tronco, desça o peito controlando o movimento.",
            "erro": "Abrir os cotovelos para os lados, tirando o foco do peitoral inferior.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Handstand_Push-Ups/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Handstand_Push-Ups/1.jpg"
            ]
          },
          {
            "name": "Supino declinado na máquina articulada (hammer strength)",
            "exec": "Ajuste o assento para a inclinação negativa e empurre as alavancas à frente e ligeiramente para baixo, contraindo a porção inferior do peitoral no final do movimento.",
            "erro": "Usar amplitude parcial, não permitindo o alongamento completo na fase excêntrica.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Supino declinado com halteres pegada neutra",
            "exec": "No banco declinado com os pés travados, empurre os halteres para cima com as palmas voltadas uma para a outra, seguindo trajetória levemente diagonal em direção ao quadril.",
            "erro": "Descer os halteres rápido demais, perdendo o controle da fase excêntrica."
          },
          {
            "name": "Supino declinado unilateral com halter",
            "exec": "Com um halter em uma das mãos no banco declinado, empurre o peso para cima mantendo o tronco estável e o outro braço apoiado ou estendido lateralmente para equilíbrio.",
            "erro": "Deixar o quadril subir do banco para compensar a instabilidade."
          },
          {
            "name": "Supino declinado no smith machine",
            "exec": "Deitado no banco declinado posicionado sob a barra guiada, desça a barra até a porção inferior do peitoral e empurre de volta em trajetória fixa, sem necessidade de estabilização lateral.",
            "erro": "Posicionar o banco de forma que a barra desça sobre o abdômen em vez do peitoral inferior.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Bench_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Bench_Press/1.jpg"
            ]
          },
          {
            "name": "Mergulho (dips) nas paralelas com tronco inclinado à frente",
            "exec": "Nas barras paralelas, incline o tronco para frente e desça o corpo flexionando os cotovelos até sentir alongamento no peitoral inferior, mantendo os cotovelos ligeiramente abertos.",
            "erro": "Manter o tronco ereto, o que desloca a ênfase para o tríceps em vez do peitoral.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/1.jpg"
            ]
          },
          {
            "name": "Mergulho assistido na máquina com foco peitoral",
            "exec": "Ajuste o contrapeso da máquina assistida, incline o tronco à frente durante a descida e desça até os ombros ficarem abaixo dos cotovelos, controlando a subida.",
            "erro": "Usar assistência excessiva que elimina a fase de alongamento necessária no peitoral."
          },
          {
            "name": "Crucifixo declinado com halteres",
            "exec": "No banco declinado, abra os braços lateralmente com leve flexão de cotovelo até sentir alongamento na porção inferior do peitoral e feche em arco até o topo.",
            "erro": "Descer os halteres além da linha dos ombros, forçando excessivamente a articulação do ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Flyes/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Flyes/1.jpg"
            ]
          },
          {
            "name": "Pullover na polia alta com banco reto",
            "exec": "Deitado em um banco posicionado de costas para a polia alta, puxe a barra ou corda por cima da cabeça até a linha do quadril, mantendo os braços semi-estendidos.",
            "erro": "Flexionar os cotovelos durante a puxada, transformando o movimento em uma puxada dorsal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Pullover/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Pullover/1.jpg"
            ]
          },
          {
            "name": "Flexão de braço com pés elevados em caixote alto (declinada acentuada)",
            "exec": "Com os pés apoiados em um caixote ou banco alto e as mãos no chão, desça o tronco controladamente mantendo o corpo alinhado, enfatizando a porção inferior do peitoral.",
            "erro": "Deixar o quadril flexionar, formando um ângulo no corpo em vez de manter a linha reta.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Push-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Push-Up/1.jpg"
            ]
          },
          {
            "name": "Supino declinado com barra pegada fechada",
            "exec": "No banco declinado, posicione as mãos próximas e desça a barra até a linha inferior do peitoral, mantendo os cotovelos junto ao tronco durante toda a execução.",
            "erro": "Abrir os cotovelos na descida, perdendo o foco na porção inferior e sobrecarregando o punho."
          },
          {
            "name": "Crossover baixo com corda (pegada neutra, de cima para baixo)",
            "exec": "Nas polias altas, troque as alças simples pela corda e puxe as duas pontas diagonalmente para baixo até a altura do quadril, aproximando bem as mãos no final para maximizar a contração do peitoral inferior.",
            "erro": "Separar as pontas da corda cedo demais, perdendo a tensão constante na fase final do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/1.jpg"
            ]
          },
          {
            "name": "Supino declinado com barra pegada aberta",
            "exec": "No banco declinado, posicione as mãos bem além da largura dos ombros e desça a barra até a parte inferior do peitoral, com amplitude reduzida e ênfase na porção externa/inferior.",
            "erro": "Abrir demais os cotovelos, sobrecarregando o ombro por causa da pegada excessivamente aberta."
          }
        ]
      }
    }
  },
  "costas": {
    "label": "Costas",
    "portions": {
      "largura": {
        "label": "Latíssimo do Dorso (Largura)",
        "exercises": [
          {
            "name": "Puxada frontal aberta (pulldown)",
            "exec": "Pegada aberta pronada, puxe a barra até a parte superior do peito levando os cotovelos para baixo.",
            "erro": "Puxar a barra atrás da nuca, gerando risco ao ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Barra fixa (pull-up) pegada aberta",
            "exec": "Pegada pronada afastada, puxe o corpo até o queixo passar da barra.",
            "erro": "Usar embalo do corpo (kipping) em vez de força controlada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scapular_Pull-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scapular_Pull-Up/1.jpg"
            ]
          },
          {
            "name": "Puxada unilateral no pulley",
            "exec": "Um braço por vez, puxe o cabo em direção ao quadril contraindo a escápula.",
            "erro": "Girar excessivamente o tronco para ajudar no movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Lat_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Lat_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Remada curvada pegada aberta",
            "exec": "Tronco inclinado, puxe a barra em direção ao abdômen com pegada mais aberta que os ombros.",
            "erro": "Extender demais a coluna lombar, perdendo a postura neutra.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/1.jpg"
            ]
          },
          {
            "name": "Puxada com pegada neutra (barra V ou triângulo)",
            "exec": "Pegada neutra na barra V, puxe até a parte superior do peito levando os cotovelos para baixo e para trás.",
            "erro": "Puxar apenas com os braços sem levar os cotovelos para trás.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Barra fixa pegada supinada (chin-up) — Costas",
            "exec": "Pegada supinada na largura dos ombros, puxe o corpo até o queixo passar da barra.",
            "erro": "Não descer totalmente entre as repetições, perdendo amplitude.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Pull_Ups/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Pull_Ups/1.jpg"
            ]
          },
          {
            "name": "Puxada com pegada fechada pronada",
            "exec": "Pegada fechada na barra reta, puxe até a parte superior do peito mantendo o tronco levemente inclinado para trás.",
            "erro": "Inclinar o tronco em excesso para trás, tirando o trabalho do latíssimo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Pull-around (puxada em arco na polia alta)",
            "exec": "Braço estendido na polia alta, puxe em arco até a lateral da coxa mantendo o cotovelo levemente flexionado.",
            "erro": "Flexionar muito o cotovelo, transformando em remada em vez de pull-around.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Underhand_Cable_Pulldowns/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Underhand_Cable_Pulldowns/1.jpg"
            ]
          },
          {
            "name": "Puxada frontal na máquina articulada (hammer strength pulldown)",
            "exec": "Sentado com as coxas travadas, puxe as alavancas para baixo em direção à parte superior do peitoral, levando os cotovelos para trás e para baixo, e retorne controladamente.",
            "erro": "Puxar usando impulso do tronco para trás em vez da contração do latíssimo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocky_Pull-Ups_Pulldowns/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocky_Pull-Ups_Pulldowns/1.jpg"
            ]
          },
          {
            "name": "Puxada atrás da nuca (pulldown por trás da cabeça)",
            "exec": "Com pegada aberta na barra, puxe-a para baixo até a base da nuca, mantendo o tronco ereto e os cotovelos apontando para baixo, sem forçar a cabeça à frente.",
            "erro": "Puxar a barra abaixo da nuca com amplitude excessiva, comprimindo perigosamente os ombros.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Straight-Arm_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Straight-Arm_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Barra fixa com pegada neutra (barras paralelas)",
            "exec": "Segure as barras paralelas verticais com as palmas voltadas uma para a outra e puxe o corpo para cima até o queixo ultrapassar as mãos, descendo até a extensão quase completa dos braços.",
            "erro": "Usar impulso das pernas (kipping) para completar a repetição.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Assisted_Pull-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Assisted_Pull-Up/1.jpg"
            ]
          },
          {
            "name": "Puxada com pegada supinada fechada",
            "exec": "Na puxada frontal, use a barra reta com pegada supinada e mãos próximas, puxando-a até a altura do peitoral superior e levando os cotovelos junto ao corpo.",
            "erro": "Deixar o bíceps assumir todo o trabalho, com pouca retração escapular no início do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Front_Lat_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Front_Lat_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Puxada unilateral na máquina articulada",
            "exec": "Sentado na máquina, puxe uma alavanca de cada vez em direção ao quadril do mesmo lado, girando levemente o tronco na direção do movimento e controlando o retorno.",
            "erro": "Girar excessivamente o tronco, transformando o movimento em rotação em vez de puxada dorsal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Lat_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Lat_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Puxada com corda na polia alta (pulldown com extensão)",
            "exec": "Segure a corda com pegada neutra e puxe-a para baixo e para fora, separando as pontas ao final do movimento, mantendo os cotovelos próximos ao final do trajeto.",
            "erro": "Separar a corda cedo demais, tirando a tensão constante do latíssimo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Full_Range-Of-Motion_Lat_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Full_Range-Of-Motion_Lat_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Barra fixa assistida na máquina (pegada aberta)",
            "exec": "Ajoelhado ou apoiado na plataforma da máquina assistida, puxe o corpo para cima com pegada aberta até o queixo passar da barra, controlando totalmente a descida.",
            "erro": "Usar contrapeso excessivo que elimina o tempo sob tensão na fase negativa.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Rear_Pull-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Rear_Pull-Up/1.jpg"
            ]
          },
          {
            "name": "Puxada reta de braços estendidos no cabo alto (straight-arm pulldown)",
            "exec": "Em pé de frente para a polia alta, com os braços estendidos e leve flexão de cotovelo, puxe a barra em arco até a linha da coxa, contraindo o latíssimo sem flexionar os cotovelos.",
            "erro": "Flexionar os cotovelos durante a puxada, tirando o trabalho do dorsal e passando para os braços.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Pulldown_Behind_The_Neck/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Pulldown_Behind_The_Neck/1.jpg"
            ]
          },
          {
            "name": "Puxada frontal com faixa elástica (pegada aberta)",
            "exec": "Ancore a faixa elástica em um ponto alto fixo, ajoelhe-se ou sente-se abaixo dela e puxe-a para baixo com pegada aberta até a altura do peitoral, controlando o retorno.",
            "erro": "Deixar o tronco inclinar-se para trás para compensar a resistência da faixa.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Puxada frontal unilateral no cross com banco",
            "exec": "Sentado em um banco de frente para a polia alta do cross, puxe um cabo de cada vez até a altura do ombro do mesmo lado, mantendo o tronco estável sem rotação excessiva.",
            "erro": "Inclinar o tronco para trás para ajudar a puxada em vez de manter a postura ereta."
          },
          {
            "name": "Puxada alta na polia pegada 1-2 (bem aberta, extremidades da barra)",
            "exec": "Segure a barra reta guiada da puxada — numerada de 1 a 7 nas marcações de largura — bem próximo às extremidades, nas posições 1 ou 2, com os braços quase na largura máxima. Puxe até a parte superior do peito levando os cotovelos para baixo e para fora, priorizando a porção superior/externa do latíssimo e o redondo maior, com amplitude de movimento mais curta.",
            "erro": "Encurtar demais o trajeto por causa da pegada muito aberta, parando antes de sentir a contração completa do latíssimo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Puxada alta na polia pegada 3-4 (grip médio na barra numerada)",
            "exec": "Segure a barra reta da puxada nas marcações 3 ou 4, um pouco além da largura dos ombros. Puxe até o peito levando os cotovelos para baixo e para trás, combinando ativação da porção superior e do centro das costas com amplitude intermediária entre as pegadas mais abertas e mais fechadas.",
            "erro": "Variar a largura da pegada de uma série para outra sem perceber, perdendo a consistência do estímulo entre os treinos.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Front_Lat_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Front_Lat_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Puxada alta na polia pegada 5-6 (fechada na barra numerada)",
            "exec": "Segure a barra reta da puxada nas marcações 5 ou 6, próximo à largura dos ombros ou um pouco menor, com as mãos mais próximas do centro. Puxe até o peito com amplitude maior que a pegada aberta, dando mais ênfase à porção inferior/central do latíssimo e aumentando a participação do bíceps.",
            "erro": "Deixar o tronco inclinar demais para trás para compensar a amplitude maior, tirando a tensão do latíssimo e transformando em remada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Full_Range-Of-Motion_Lat_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Full_Range-Of-Motion_Lat_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Puxada alta na polia pegada 7 (fechadíssima, quase unilateral)",
            "exec": "Segure a barra reta da puxada bem no centro, na marcação 7, com as mãos quase se tocando. Puxe até o peito com a maior amplitude de movimento entre as variações numeradas, sentindo forte contração no centro das costas e ativação elevada do bíceps, quase como um movimento unilateral feito com as duas mãos juntas.",
            "erro": "Girar os punhos ou deixar os cotovelos abrirem excessivamente para os lados por causa do pouco espaço entre as mãos."
          }
        ]
      },
      "espessura": {
        "label": "Espessura (Meio das Costas)",
        "exercises": [
          {
            "name": "Remada curvada com barra",
            "exec": "Tronco inclinado a ~45°, puxe a barra até a altura do abdômen mantendo a coluna neutra.",
            "erro": "Usar a lombar para 'jogar' o peso em vez de puxar com as costas.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Bent-Over_Rows/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Bent-Over_Rows/1.jpg"
            ]
          },
          {
            "name": "Remada baixa no cabo (triângulo)",
            "exec": "Sentado no aparelho com os joelhos levemente flexionados, segure o triângulo e puxe em direção ao abdômen, aproximando as escápulas no final do movimento.",
            "erro": "Balançar o tronco para frente e para trás para gerar impulso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/1.jpg"
            ]
          },
          {
            "name": "Remada cavalinho (T-bar row)",
            "exec": "Tronco inclinado sobre o aparelho, puxe a barra em direção ao peito/abdômen.",
            "erro": "Não estabilizar o tronco, gerando compensação lombar.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/1.jpg"
            ]
          },
          {
            "name": "Remada sentada no cabo (baixa)",
            "exec": "Sentado, puxe o cabo em direção ao abdômen mantendo o tronco ereto.",
            "erro": "Inclinar o tronco para trás excessivamente para puxar mais peso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shotgun_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shotgun_Row/1.jpg"
            ]
          },
          {
            "name": "Remada unilateral com halter (serrote)",
            "exec": "Um joelho e uma mão apoiados no banco, puxe o halter em direção ao quadril.",
            "erro": "Girar o tronco em vez de manter estável durante a puxada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/1.jpg"
            ]
          },
          {
            "name": "Remada baixa unilateral no pulley",
            "exec": "Sentado, um braço por vez, puxe o cabo em direção ao quadril contraindo a escápula.",
            "erro": "Girar o tronco para ajudar a puxar mais peso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-arm_Cable_Pulley_Rows/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-arm_Cable_Pulley_Rows/1.jpg"
            ]
          },
          {
            "name": "Remada com barra pegada supinada (Yates row)",
            "exec": "Tronco inclinado, pegada supinada, puxe a barra em direção ao abdômen com leve balanço controlado.",
            "erro": "Transformar em levantamento terra por excesso de carga.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/1.jpg"
            ]
          },
          {
            "name": "Remada na máquina articulada (hammer strength)",
            "exec": "Peito apoiado no encosto, puxe as alavancas em direção ao tronco contraindo as escápulas.",
            "erro": "Não apoiar bem o peito, permitindo compensação da lombar.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Iso_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Iso_Row/1.jpg"
            ]
          },
          {
            "name": "Remada invertida (australian pull-up)",
            "exec": "Deitado sob uma barra fixa baixa, puxe o corpo em direção à barra mantendo o corpo reto.",
            "erro": "Deixar o quadril cair, perdendo o alinhamento corporal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/1.jpg"
            ]
          },
          {
            "name": "Remada curvada com halteres (pegada pronada)",
            "exec": "Com o tronco inclinado a cerca de 45° e os halteres pendendo à frente, puxe-os em direção ao abdômen levando os cotovelos para trás e para cima, contraindo as escápulas.",
            "erro": "Endireitar o tronco a cada repetição, usando as costas lombares como impulso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row/1.jpg"
            ]
          },
          {
            "name": "Remada cavalinho unilateral (T-bar pegada única)",
            "exec": "Posicionado sobre a barra T com uma das mãos segurando a pegada lateral, puxe o peso em direção ao quadril mantendo o tronco fixo e paralelo ao chão.",
            "erro": "Girar o tronco para o lado que está puxando, perdendo a estabilidade da coluna."
          },
          {
            "name": "Remada sentada no cabo com barra reta (pegada pronada)",
            "exec": "Sentado no aparelho com os joelhos levemente flexionados, puxe a barra reta em direção ao abdômen com pegada pronada, mantendo o tronco ereto durante toda a execução.",
            "erro": "Balançar o tronco para frente e para trás para gerar impulso na puxada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Squats/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Squats/1.jpg"
            ]
          },
          {
            "name": "Remada sentada no cabo com pegada larga (foco romboides)",
            "exec": "Usando uma barra reta ou triângulo invertido com pegada bem aberta, puxe em direção à parte superior do abdômen levando os cotovelos para os lados, focando na aproximação das escápulas.",
            "erro": "Puxar apenas com os braços sem retrair as escápulas no final do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elevated_Cable_Rows/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elevated_Cable_Rows/1.jpg"
            ]
          },
          {
            "name": "Remada baixa bilateral no pulley com corda",
            "exec": "Sentado com os pés apoiados na plataforma, puxe a corda em direção ao abdômen abrindo levemente as mãos ao final, mantendo a coluna neutra.",
            "erro": "Arredondar a lombar durante a fase de alongamento do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/1.jpg"
            ]
          },
          {
            "name": "Remada com barra na máquina Smith (bent-over row apoiado)",
            "exec": "Com a barra do smith na altura adequada, incline o tronco à frente mantendo a coluna neutra e puxe a barra em direção ao abdômen, aproveitando a trajetória guiada para estabilidade.",
            "erro": "Usar amplitude reduzida por medo da trajetória fixa, sem completar a contração.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Long_Bar_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Long_Bar_Row/1.jpg"
            ]
          },
          {
            "name": "Remada unilateral na máquina articulada (hammer strength)",
            "exec": "Sentado ou em pé apoiado no encosto da máquina, puxe a alavanca com um braço de cada vez em direção ao quadril, girando levemente o tronco para acompanhar o movimento.",
            "erro": "Usar rotação excessiva do tronco em vez de deixar o braço fazer o trabalho principal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_One-Arm_Upright_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_One-Arm_Upright_Row/1.jpg"
            ]
          },
          {
            "name": "Remada curvada com barra pegada supinada estreita",
            "exec": "Com o tronco inclinado à frente e pegada supinada estreita na barra, puxe-a em direção ao abdômen inferior, levando os cotovelos próximos ao tronco.",
            "erro": "Deixar os ombros arredondarem para frente no início do movimento, perdendo a retração escapular.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_One-Arm_Long_Bar_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_One-Arm_Long_Bar_Row/1.jpg"
            ]
          },
          {
            "name": "Remada no banco inclinado com halteres (chest-supported row)",
            "exec": "Deitado de bruços em um banco inclinado, com os halteres pendendo abaixo dos ombros, puxe-os em direção ao tronco contraindo as escápulas, sem envolver a lombar.",
            "erro": "Levantar o peito do banco para ganhar amplitude, retirando o suporte que protege a lombar.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Upright_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Upright_Row/1.jpg"
            ]
          },
          {
            "name": "Remada no banco inclinado com barra (chest-supported barbell row)",
            "exec": "Apoiado de bruços no banco inclinado com a barra abaixo, puxe-a em direção à parte inferior do peitoral levando os cotovelos para trás, mantendo o tronco totalmente apoiado.",
            "erro": "Fazer o movimento com amplitude curta, sem levar a barra até o contato com o corpo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Rear_Delt_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Rear_Delt_Row/1.jpg"
            ]
          },
          {
            "name": "Remada baixa no cabo com barra reta pegada supinada (foco bíceps/costas inferior)",
            "exec": "Sentado no aparelho de remada baixa, segure a barra reta com pegada supinada (palmas para cima) e puxe-a em direção ao abdômen mantendo os cotovelos junto ao corpo, diferente da pegada pronada ou do triângulo neutro já usados nas outras variações.",
            "erro": "Usar impulso do tronco para trás para compensar a pegada supinada, em vez de puxar controlado com as costas e o bíceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-arm_Cable_Pulley_Rows/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-arm_Cable_Pulley_Rows/1.jpg"
            ]
          }
        ]
      },
      "trapezio": {
        "label": "Trapézio",
        "exercises": [
          {
            "name": "Encolhimento de ombros com barra",
            "exec": "Em pé, segure a barra e eleve os ombros diretamente para cima, sem girar.",
            "erro": "Girar os ombros durante o movimento, o que não traz benefício extra e pode incomodar a articulação.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Shrug/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Shrug/1.jpg"
            ]
          },
          {
            "name": "Encolhimento com halteres",
            "exec": "Halteres ao lado do corpo, eleve os ombros verticalmente e contraia no topo.",
            "erro": "Usar flexão de cotovelo para 'ajudar' a subir o peso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shrug/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shrug/1.jpg"
            ]
          },
          {
            "name": "Remada alta pegada aberta",
            "exec": "Puxe a barra verticalmente até a altura do peito com pegada mais aberta que os ombros.",
            "erro": "Puxar com pegada fechada, sobrecarregando o ombro em vez do trapézio.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Row_-_With_Bands/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Row_-_With_Bands/1.jpg"
            ]
          },
          {
            "name": "Face pull com foco em trapézio superior",
            "exec": "Corda na polia alta, puxe em direção ao rosto elevando levemente os cotovelos acima da linha dos ombros.",
            "erro": "Puxar sem contrair as escápulas no final do movimento."
          },
          {
            "name": "Encolhimento no smith machine",
            "exec": "Barra guiada na altura das coxas, eleve os ombros verticalmente controlando a descida.",
            "erro": "Usar amplitude curta, sem descer totalmente entre as repetições.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shrug/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shrug/1.jpg"
            ]
          },
          {
            "name": "Encolhimento no cabo (polia baixa dupla)",
            "exec": "Segure as alças da polia baixa, eleve os ombros verticalmente contraindo o trapézio.",
            "erro": "Balançar o corpo para gerar impulso na subida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Shrugs/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Shrugs/1.jpg"
            ]
          },
          {
            "name": "Clean pull (puxada alta tipo levantamento olímpico)",
            "exec": "Barra no chão, puxe explosivamente estendendo o corpo e elevando a barra até a altura do peito.",
            "erro": "Arredondar a coluna durante a puxada inicial do chão."
          },
          {
            "name": "Remada alta com halteres",
            "exec": "Halteres à frente do corpo, puxe verticalmente levando os cotovelos acima das mãos.",
            "erro": "Puxar os halteres muito próximos ao corpo, forçando o punho.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Upright_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Upright_Row/1.jpg"
            ]
          },
          {
            "name": "Encolhimento unilateral com halter",
            "exec": "Em pé, segure um halter em uma das mãos e eleve o ombro diretamente para cima em direção à orelha, sem flexionar o cotovelo, e desça controladamente.",
            "erro": "Flexionar o cotovelo durante a elevação, transformando o movimento em um remada em vez de encolhimento."
          },
          {
            "name": "Encolhimento na máquina articulada (shrug machine)",
            "exec": "Posicionado na máquina com os braços apoiados nos suportes, eleve os ombros verticalmente em direção às orelhas e desça controladamente até o alongamento completo.",
            "erro": "Usar amplitude parcial, não permitindo o alongamento total do trapézio na descida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf-Machine_Shoulder_Shrug/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf-Machine_Shoulder_Shrug/1.jpg"
            ]
          },
          {
            "name": "Encolhimento com barra atrás do corpo (behind-the-back shrug)",
            "exec": "Segure a barra atrás do corpo com os braços estendidos ao longo do quadril e eleve os ombros para cima em linha vertical, sem inclinar o tronco à frente.",
            "erro": "Inclinar o tronco para frente para compensar a posição da barra atrás do corpo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Shrug/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Shrug/1.jpg"
            ]
          },
          {
            "name": "Remada alta com barra pegada fechada",
            "exec": "Em pé, segure a barra com pegada fechada e pronada e puxe-a verticalmente até a altura do peitoral superior, levando os cotovelos para cima e para fora.",
            "erro": "Elevar a barra acima da linha dos ombros, gerando impacto excessivo na articulação do ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/1.jpg"
            ]
          },
          {
            "name": "Remada alta no cabo (upright row na polia baixa)",
            "exec": "De frente para a polia baixa com uma barra reta, puxe-a verticalmente junto ao corpo até a altura do peitoral, mantendo os cotovelos acima das mãos durante o trajeto.",
            "erro": "Usar impulso do quadril para iniciar o movimento em vez de puxar apenas com os braços e ombros."
          },
          {
            "name": "Encolhimento no cabo unilateral (polia baixa)",
            "exec": "Em pé ao lado da polia baixa, segure a alça com uma das mãos e eleve o ombro verticalmente, mantendo o braço estendido e o tronco estável.",
            "erro": "Inclinar o tronco para o lado oposto para ajudar na elevação, tirando o trabalho isolado do trapézio."
          },
          {
            "name": "Farmer's walk com halteres",
            "exec": "Segure um halter pesado em cada mão junto ao corpo e caminhe uma distância determinada mantendo os ombros elevados e a postura ereta, sem balançar o tronco.",
            "erro": "Deixar os ombros caírem para frente durante a caminhada, perdendo a ativação constante do trapézio.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/1.jpg"
            ]
          },
          {
            "name": "Encolhimento com kettlebells",
            "exec": "Segure os kettlebells pelas alças ao lado do corpo e eleve os ombros verticalmente em direção às orelhas, retornando de forma controlada até o alongamento completo.",
            "erro": "Realizar o movimento de forma explosiva demais, perdendo o controle na fase excêntrica.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/1.jpg"
            ]
          },
          {
            "name": "Face pull com corda na polia alta (amplitude ampla)",
            "exec": "Com a polia ajustada na altura do rosto, puxe a corda separando as mãos em direção às orelhas e elevando os cotovelos, enfatizando a retração escapular e o trapézio superior.",
            "erro": "Puxar a corda em direção ao peito em vez do rosto, reduzindo a ativação do trapézio superior."
          },
          {
            "name": "Encolhimento isométrico com barra (pausa no topo)",
            "exec": "Eleve os ombros com a barra até o ponto mais alto do movimento e mantenha a posição contraída por 2-3 segundos antes de descer controladamente.",
            "erro": "Relaxar os ombros durante a pausa isométrica, perdendo a tensão constante na musculatura.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug_Behind_The_Back/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug_Behind_The_Back/1.jpg"
            ]
          },
          {
            "name": "Encolhimento no cabo com barra reta (pegada pronada, tensão constante)",
            "exec": "Segure a barra reta presa à polia baixa em vez de halteres e eleve os ombros verticalmente em direção às orelhas, mantendo tensão constante do cabo mesmo na posição mais baixa do movimento, diferente do ponto morto que ocorre com halteres no chão.",
            "erro": "Flexionar os cotovelos para ajudar a puxar a barra para cima, tirando o isolamento do trapézio.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Shrug/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Shrug/1.jpg"
            ]
          },
          {
            "name": "Trap bar carry (caminhada com barra hexagonal)",
            "exec": "Entre dentro do quadro da trap bar (barra hexagonal) carregada, levante-a estendendo quadril e joelhos e caminhe uma distância determinada mantendo os ombros para trás e para baixo, sustentando o peso apenas pela pegada e pelo trapézio.",
            "erro": "Deixar os ombros caírem para frente durante a caminhada, perdendo a ativação constante do trapézio que o exercício busca.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Trap_Bar_Deadlift/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Trap_Bar_Deadlift/1.jpg"
            ]
          },
          {
            "name": "Encolhimento com trap bar (hex bar shrug)",
            "exec": "De pé dentro do quadro da trap bar carregada, segure as pegadas laterais junto ao corpo e eleve os ombros verticalmente em direção às orelhas, sem flexionar os cotovelos — a pegada neutra e centralizada da trap bar permite usar cargas mais pesadas com menos estresse no punho do que a barra reta.",
            "erro": "Girar os ombros durante o movimento ou usar flexão de cotovelo para ajudar a subir o peso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Middle_Back_Shrug/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Middle_Back_Shrug/1.jpg"
            ]
          }
        ]
      }
    }
  },
  "quadriceps": {
    "label": "Quadríceps",
    "portions": {
      "geral": {
        "label": "Quadríceps (Geral)",
        "exercises": [
          {
            "name": "Agachamento livre com barra",
            "exec": "Barra nas costas, desça flexionando quadris e joelhos até pelo menos 90°, suba controlado.",
            "erro": "Deixar os joelhos colapsarem para dentro durante a subida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/1.jpg"
            ]
          },
          {
            "name": "Leg press 45°",
            "exec": "Pés na plataforma na largura dos ombros, desça controlado e empurre sem travar os joelhos no topo.",
            "erro": "Descer demais tirando o quadril do encosto, sobrecarregando a lombar.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/1.jpg"
            ]
          },
          {
            "name": "Hack machine",
            "exec": "Costas apoiadas, desça flexionando os joelhos mantendo os calcanhares no chão.",
            "erro": "Subir apenas parcialmente, reduzindo a amplitude e o estímulo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/1.jpg"
            ]
          },
          {
            "name": "Afundo (lunge) com halteres",
            "exec": "Dê um passo à frente e desça o joelho de trás quase tocando o chão, suba controlado.",
            "erro": "Deixar o joelho da frente ultrapassar muito a ponta do pé de forma instável.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/1.jpg"
            ]
          },
          {
            "name": "Agachamento frontal (front squat)",
            "exec": "Barra apoiada à frente dos ombros, desça mantendo o tronco o mais ereto possível.",
            "erro": "Deixar os cotovelos caírem, perdendo a posição da barra na frente.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat/1.jpg"
            ]
          },
          {
            "name": "Agachamento no smith machine",
            "exec": "Barra guiada nas costas, desça controlado mantendo os pés um pouco à frente do corpo.",
            "erro": "Posicionar os pés muito próximos da linha da barra, forçando os joelhos.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Squat/1.jpg"
            ]
          },
          {
            "name": "Leg press unilateral",
            "exec": "Uma perna por vez na plataforma, desça controlado e empurre sem travar o joelho.",
            "erro": "Deixar o joelho cair para dentro durante o empurrão."
          },
          {
            "name": "Afundo búlgaro com barra",
            "exec": "Pé de trás elevado em banco, barra nas costas, desça o joelho da frente controlando o equilíbrio.",
            "erro": "Usar amplitude muito curta, perdendo o estímulo no quadríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Side_Split_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Side_Split_Squat/1.jpg"
            ]
          },
          {
            "name": "Agachamento Zercher",
            "exec": "Segure a barra na dobra dos cotovelos junto ao tronco e agache mantendo o tronco ereto até as coxas ficarem paralelas ao chão.",
            "erro": "Deixar a barra rolar para longe do corpo, forçando inclinação excessiva do tronco.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat/1.jpg"
            ]
          },
          {
            "name": "Agachamento no cinturão (belt squat)",
            "exec": "Prenda a corrente do cinto de agachamento na cintura, afaste-se do suporte e agache flexionando quadril e joelhos sem carregar a coluna.",
            "erro": "Deixar o quadril subir antes do tronco na fase concêntrica, tirando a carga do quadríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit_Squats/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit_Squats/1.jpg"
            ]
          },
          {
            "name": "Passada (walking lunge) com barra",
            "exec": "Com a barra apoiada nas costas, dê um passo à frente e desça até o joelho de trás quase tocar o chão, alternando as pernas em deslocamento.",
            "erro": "Dar passos curtos demais, sobrecarregando o joelho da perna da frente.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/1.jpg"
            ]
          },
          {
            "name": "Agachamento no aparelho Pendulum",
            "exec": "Posicione os ombros sob as almofadas e agache seguindo o arco guiado do aparelho, mantendo os pés à frente do quadril.",
            "erro": "Posicionar os pés muito atrás, deixando os joelhos ultrapassarem excessivamente a linha da ponta dos pés.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_Jerk/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_Jerk/1.jpg"
            ]
          },
          {
            "name": "Box squat com barra",
            "exec": "Agache até sentar levemente em um banco ou caixa atrás de você, mantendo o quadril para trás, e suba sem usar impulso do banco.",
            "erro": "Relaxar completamente o tronco ao tocar a caixa, perdendo a tensão muscular na transição.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Box_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Box_Squat/1.jpg"
            ]
          },
          {
            "name": "Agachamento overhead com barra",
            "exec": "Segure a barra estendida acima da cabeça com pegada aberta e agache mantendo o tronco vertical e os braços travados.",
            "erro": "Deixar a barra deslocar-se à frente da linha dos ombros, perdendo o equilíbrio.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Squats/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Squats/1.jpg"
            ]
          },
          {
            "name": "Passada no smith machine",
            "exec": "Com a barra guiada apoiada nas costas, dê um passo à frente fixo e flexione os joelhos até o joelho de trás quase encostar no chão.",
            "erro": "Posicionar o pé da frente longe demais do eixo da barra, gerando trajetória instável.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Sprint/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Sprint/1.jpg"
            ]
          },
          {
            "name": "Agachamento sumô com barra",
            "exec": "Com pernas bem afastadas e pés apontados para fora, agache mantendo a barra sobre as costas e os joelhos na direção dos pés.",
            "erro": "Deixar os joelhos colapsarem para dentro durante a subida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/1.jpg"
            ]
          },
          {
            "name": "Leg press horizontal",
            "exec": "Deitado no aparelho, empurre a plataforma estendendo os joelhos sem travá-los totalmente no topo.",
            "erro": "Travar os joelhos com força no topo do movimento, transferindo a carga para a articulação.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Over_Floor_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Over_Floor_Press/1.jpg"
            ]
          },
          {
            "name": "Agachamento no V-squat machine",
            "exec": "Posicione os ombros sob as almofadas do aparelho em V e agache seguindo o trilho guiado, mantendo os calcanhares apoiados.",
            "erro": "Levantar os calcanhares durante a descida, perdendo estabilidade e ativação do quadríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Squat/1.jpg"
            ]
          },
          {
            "name": "Agachamento com cabo duplo (cross-cable squat, contrapeso)",
            "exec": "Segure uma alça de cada polia baixa lateral com os braços estendidos à frente do corpo para contrabalancear, e agache normalmente mantendo o tronco ereto — útil para quem tem dificuldade de equilíbrio no agachamento livre.",
            "erro": "Usar o cabo para se puxar para cima ao subir, tirando o trabalho de força das pernas.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/1.jpg"
            ]
          },
          {
            "name": "Afundo búlgaro com cabo de apoio frontal",
            "exec": "Com uma alça de polia baixa segurada à frente do corpo apenas para equilíbrio, execute o afundo búlgaro apoiando o pé de trás no banco e descendo o joelho da frente.",
            "erro": "Depender do cabo para se puxar ao subir, em vez de usar a força da perna de trabalho.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squats/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squats/1.jpg"
            ]
          },
          {
            "name": "Leg press unilateral com pés baixos e juntos (foco quadríceps distal)",
            "exec": "No leg press, posicione um pé na parte baixa e central da plataforma, próximo ao outro, e empurre estendendo o joelho, dando mais ênfase à porção distal (próxima ao joelho) do quadríceps.",
            "erro": "Deixar o calcanhar levantar da plataforma durante o empurrão, sobrecarregando o joelho."
          },
          {
            "name": "Levantamento terra com trap bar (barra hexagonal)",
            "exec": "Entre dentro do quadro da trap bar (barra hexagonal), segure as pegadas laterais e levante estendendo quadril e joelhos simultaneamente — o centro de carga alinhado ao corpo permite manter o tronco mais ereto e exige menos da lombar do que o levantamento terra com barra reta, tornando o movimento mais dominante de quadríceps.",
            "erro": "Ficar de pé fora do centro exato da barra ou usar as pegadas altas como se fosse uma barra reta, perdendo a vantagem biomecânica de carga centralizada que a trap bar oferece.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Trap_Bar_Deadlift/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Trap_Bar_Deadlift/1.jpg"
            ]
          },
          {
            "name": "Agachamento com safety squat bar (SSB)",
            "exec": "Posicione a barra SSB sobre os trapézios com as almofadas apoiadas e as hastes curvas voltadas para a frente, segure as pegadas neutras à frente do peito e agache mantendo o tronco o mais ereto possível — o formato da barra desloca o centro de gravidade à frente, exigindo mais do core e poupando os ombros de quem tem mobilidade limitada para a barra reta.",
            "erro": "Deixar o peso da barra puxar o tronco para frente sem compensar com maior ativação do core, perdendo a postura ereta que justifica o uso da SSB.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Olympic_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Olympic_Squat/1.jpg"
            ]
          },
          {
            "name": "Box squat com safety squat bar (SSB)",
            "exec": "Com a SSB apoiada nos trapézios, agache até sentar levemente em um banco ou caixa atrás de você, mantendo o quadril para trás, e suba sem usar impulso do banco — a combinação com a SSB reforça ainda mais o padrão de quadril para trás por causa do desequilíbrio à frente gerado pela barra.",
            "erro": "Relaxar completamente o tronco ao tocar a caixa, perdendo a tensão muscular na transição e agravando o desequilíbrio já natural da SSB.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat_with_Bands/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat_with_Bands/1.jpg"
            ]
          }
        ]
      },
      "reto_femoral": {
        "label": "Reto Femoral (Isolado)",
        "exercises": [
          {
            "name": "Cadeira extensora",
            "exec": "Sentado, estenda os joelhos até quase a extensão total e controle a descida.",
            "erro": "Usar impulso e soltar o peso na descida em vez de controlar.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/1.jpg"
            ]
          },
          {
            "name": "Agachamento búlgaro",
            "exec": "Pé de trás elevado em banco, desça o joelho da frente controlando o equilíbrio.",
            "erro": "Apoiar peso excessivo no pé de trás, tirando o estímulo da perna de trabalho.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Split_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Split_Squat/1.jpg"
            ]
          },
          {
            "name": "Extensora unilateral",
            "exec": "Uma perna por vez na cadeira extensora, foco total na contração do quadríceps.",
            "erro": "Compensar com o tronco em vez de isolar a perna.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Leg_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Leg_Extension/1.jpg"
            ]
          },
          {
            "name": "Agachamento sissy",
            "exec": "De pé, incline o tronco para trás flexionando apenas os joelhos, mantendo o quadril estendido.",
            "erro": "Flexionar o quadril junto, transformando em agachamento normal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squat/1.jpg"
            ]
          },
          {
            "name": "Step-up com halteres",
            "exec": "Suba em um banco ou caixote com um pé, estendendo o joelho até ficar em pé sobre ele.",
            "erro": "Impulsionar com a perna de trás em vez de trabalhar a perna de cima.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/1.jpg"
            ]
          },
          {
            "name": "Agachamento com salto (jump squat) — Quadríceps",
            "exec": "Desça em agachamento e salte explosivamente, aterrissando de forma controlada.",
            "erro": "Aterrissar com os joelhos travados, sem amortecer o impacto.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Squat/1.jpg"
            ]
          },
          {
            "name": "Extensora com pausa isométrica no topo",
            "exec": "Estenda os joelhos e segure a contração máxima por 1-2 segundos antes de descer.",
            "erro": "Não segurar a pausa, perdendo o tempo sob tensão.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/1.jpg"
            ]
          },
          {
            "name": "Agachamento taça (goblet squat)",
            "exec": "Segure um halter ou kettlebell junto ao peito, desça em agachamento mantendo o tronco ereto.",
            "erro": "Deixar o peso puxar o tronco para frente durante a descida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Squat/1.jpg"
            ]
          },
          {
            "name": "Extensora com faixa elástica adicional",
            "exec": "Ajuste a faixa elástica presa à base da cadeira extensora e estenda os joelhos vencendo a resistência somada do aparelho e da faixa.",
            "erro": "Usar impulso do tronco para compensar a resistência extra em vez de controlar com o quadríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Leg_Extension/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Leg_Extension/1.jpg"
            ]
          },
          {
            "name": "Step-up com barra no ombro",
            "exec": "Com a barra apoiada nas costas, suba em um step ou banco levando o corpo todo com uma perna e desça controlado.",
            "erro": "Empurrar com a perna de apoio no chão em vez de concentrar o esforço na perna que sobe.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Step_Ups/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Step_Ups/1.jpg"
            ]
          },
          {
            "name": "Split squat estático com halteres",
            "exec": "Com um halter em cada mão, mantenha os pés em posição de afundo fixa e flexione os joelhos até quase tocar o chão, sem deslocar os pés.",
            "erro": "Deixar o joelho da frente ultrapassar muito a ponta do pé, tirando estabilidade do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squat_with_Dumbbells/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squat_with_Dumbbells/1.jpg"
            ]
          },
          {
            "name": "Agachamento taça com pausa isométrica embaixo",
            "exec": "Segure o halter junto ao peito, agache até o final da amplitude e mantenha a posição por dois a três segundos antes de subir.",
            "erro": "Relaxar a tensão muscular durante a pausa, perdendo o controle da postura.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Squat/1.jpg"
            ]
          },
          {
            "name": "Extensora unilateral com pausa na metade do movimento",
            "exec": "Estenda uma perna de cada vez na cadeira extensora e pare por um segundo na metade da amplitude antes de completar a extensão.",
            "erro": "Acelerar a passagem pelo ponto de pausa em vez de controlar a velocidade."
          },
          {
            "name": "Passada estacionária no smith machine",
            "exec": "Com a barra guiada nas costas, mantenha os pés fixos em posição de afundo e realize repetições de descida e subida sem caminhar.",
            "erro": "Deslocar o pé da frente a cada repetição, transformando o exercício em uma passada dinâmica.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Sprint/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Sprint/1.jpg"
            ]
          },
          {
            "name": "Spider squat no hack machine",
            "exec": "De frente para o aparelho hack, com o peito apoiado no encosto, flexione os joelhos deixando-os avançar livremente à frente do corpo.",
            "erro": "Não descer com amplitude completa, limitando o alongamento do quadríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hack_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hack_Squat/1.jpg"
            ]
          },
          {
            "name": "Leg press com pés baixos e afastados",
            "exec": "Posicione os pés na parte inferior da plataforma e um pouco afastados, empurrando com foco na extensão do joelho.",
            "erro": "Apoiar apenas a ponta dos pés na plataforma, sobrecarregando o tornozelo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Leg_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Leg_Press/1.jpg"
            ]
          },
          {
            "name": "Extensora com cadência lenta (tempo 4-0-1-0)",
            "exec": "Realize a extensão do joelho em quatro segundos, sem pausa embaixo, e um segundo no topo antes de descer novamente.",
            "erro": "Perder a cadência combinada e acelerar a fase excêntrica."
          },
          {
            "name": "Subida no step com halteres",
            "exec": "Segurando halteres ao lado do corpo, suba em um step alto conduzindo o movimento com a perna de trabalho até estender totalmente o joelho.",
            "erro": "Impulsionar o corpo com a perna que ficou no chão em vez de usar a perna que sobe.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/1.jpg"
            ]
          },
          {
            "name": "Agachamento sissy assistido no cabo",
            "exec": "De frente para uma polia baixa segurando a alça apenas como apoio de equilíbrio, execute o agachamento sissy inclinando o tronco para trás e flexionando somente os joelhos.",
            "erro": "Usar o cabo para se puxar para cima na subida, tirando o trabalho de isolamento do quadríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zercher_Squats/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zercher_Squats/1.jpg"
            ]
          },
          {
            "name": "Extensora com apoio de tornozelo cruzado (leve rotação interna)",
            "exec": "Na cadeira extensora, gire levemente os pés e tornozelos para dentro antes de estender os joelhos, dando ênfase extra ao vasto medial.",
            "erro": "Girar o tronco em vez de apenas os pés/tornozelos, perdendo o ângulo de trabalho pretendido."
          }
        ]
      }
    }
  },
  "posterior": {
    "label": "Posterior de Coxa",
    "portions": {
      "isquiotibiais": {
        "label": "Isquiotibiais",
        "exercises": [
          {
            "name": "Stiff com barra",
            "exec": "Pernas semi-flexionadas, desça a barra rente às pernas mantendo a coluna neutra, sentindo alongamento no posterior.",
            "erro": "Arredondar a coluna durante a descida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Barbell_Deadlift/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Barbell_Deadlift/1.jpg"
            ]
          },
          {
            "name": "Mesa flexora",
            "exec": "Deitado de bruços, flexione os joelhos trazendo os calcanhares em direção ao glúteo.",
            "erro": "Elevar o quadril do banco durante a execução.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/1.jpg"
            ]
          },
          {
            "name": "Cadeira flexora",
            "exec": "Sentado, flexione os joelhos puxando a almofada para baixo/trás controlando a volta.",
            "erro": "Soltar o peso rapidamente na fase excêntrica.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/1.jpg"
            ]
          },
          {
            "name": "Levantamento terra romeno com halteres",
            "exec": "Halteres à frente das coxas, desça mantendo pernas semi-flexionadas e coluna neutra até sentir alongamento.",
            "erro": "Deixar a barra/halteres se afastarem do corpo durante a descida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/1.jpg"
            ]
          },
          {
            "name": "Good morning",
            "exec": "Barra nas costas, incline o tronco à frente mantendo a coluna neutra e as pernas quase estendidas, sentindo alongamento no posterior.",
            "erro": "Arredondar a coluna durante a inclinação do tronco.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/1.jpg"
            ]
          },
          {
            "name": "Stiff unilateral com halter",
            "exec": "Um halter em uma mão, incline o tronco à frente elevando a perna oposta para trás mantendo o equilíbrio.",
            "erro": "Perder o alinhamento do quadril, girando o tronco durante o movimento."
          },
          {
            "name": "Flexora em pé unilateral (na máquina ou cabo no tornozelo)",
            "exec": "Em pé, flexione o joelho trazendo o calcanhar em direção ao glúteo, uma perna por vez.",
            "erro": "Balançar o corpo para ajudar a completar a flexão."
          },
          {
            "name": "Glute-ham raise (GHR)",
            "exec": "Apoiado no aparelho, desça o tronco controlado à frente e retorne flexionando joelhos e quadril.",
            "erro": "Descer rápido demais sem controle, perdendo a tensão nos isquiotibiais.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Ham_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Ham_Raise/1.jpg"
            ]
          },
          {
            "name": "Mesa flexora unilateral",
            "exec": "Deitado de bruços na mesa flexora, flexione uma perna de cada vez levando o calcanhar em direção ao glúteo sem levantar o quadril.",
            "erro": "Elevar o quadril do banco durante a flexão para compensar a falta de força."
          },
          {
            "name": "Cadeira flexora unilateral",
            "exec": "Sentado na cadeira flexora, flexione uma perna por vez trazendo o tornozelo por trás do joelho, controlando a volta.",
            "erro": "Deixar a perna retornar rápido demais, perdendo o controle excêntrico."
          },
          {
            "name": "Stiff no smith machine",
            "exec": "Com a barra guiada, flexione o quadril mantendo os joelhos levemente flexionados e a coluna neutra até sentir alongamento no posterior de coxa.",
            "erro": "Arredondar a lombar ao descer a barra em vez de dobrar pelo quadril.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Stiff-Legged_Deadlift/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Stiff-Legged_Deadlift/1.jpg"
            ]
          },
          {
            "name": "Flexora deitada com pausa isométrica no topo",
            "exec": "Na mesa flexora, flexione os joelhos até o topo do movimento e segure a contração por dois segundos antes de descer.",
            "erro": "Soltar o movimento rapidamente após a pausa em vez de descer controlado.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ball_Leg_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ball_Leg_Curl/1.jpg"
            ]
          },
          {
            "name": "Good morning no smith machine",
            "exec": "Com a barra guiada apoiada nas costas, incline o tronco à frente flexionando o quadril e mantendo os joelhos levemente flexionados.",
            "erro": "Flexionar excessivamente os joelhos, transformando o movimento em um agachamento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Good_Morning/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Good_Morning/1.jpg"
            ]
          },
          {
            "name": "Levantamento terra sumô com barra",
            "exec": "Com pernas afastadas e pontas dos pés voltadas para fora, segure a barra por dentro das pernas e estenda quadril e joelhos simultaneamente.",
            "erro": "Deixar os joelhos avançarem para dentro durante a subida da barra.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Bands/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Bands/1.jpg"
            ]
          },
          {
            "name": "Flexora sentada unilateral no cabo",
            "exec": "Com tornozeleira presa à polia baixa, flexione o joelho de uma perna trazendo o calcanhar em direção ao glúteo, mantendo o tronco estável.",
            "erro": "Balançar o tronco para ajudar no movimento em vez de isolar o posterior de coxa."
          },
          {
            "name": "Nordic hamstring curl na máquina",
            "exec": "Com os tornozelos presos no aparelho e o corpo ajoelhado, incline o tronco à frente controlando a descida apenas com força dos isquiotibiais.",
            "erro": "Deixar o quadril flexionar durante a descida em vez de manter o corpo em linha reta."
          },
          {
            "name": "Leg curl com halter preso ao tornozelo",
            "exec": "Deitado de bruços em um banco, com um halter preso ao tornozelo por uma tornozeleira, flexione o joelho trazendo o pé em direção ao glúteo.",
            "erro": "Usar embalo do quadril para iniciar o movimento em vez de contração isolada do posterior de coxa."
          },
          {
            "name": "Cadeira flexora com pausa isométrica na contração máxima",
            "exec": "Flexione os joelhos na cadeira flexora até o ponto de maior contração e mantenha essa posição por dois a três segundos antes de retornar.",
            "erro": "Reduzir a amplitude do movimento para facilitar a manutenção da pausa.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/1.jpg"
            ]
          },
          {
            "name": "Stiff no cabo (polia baixa dupla)",
            "exec": "Segure uma alça de cada polia baixa à frente das coxas e desça mantendo as pernas semi-flexionadas e a coluna neutra, sentindo alongamento no posterior, com tensão constante do cabo diferente da barra livre.",
            "erro": "Arredondar a coluna durante a descida em vez de dobrar pelo quadril.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Dumbbell_Deadlift/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Dumbbell_Deadlift/1.jpg"
            ]
          },
          {
            "name": "Cadeira flexora com pés em rotação externa (foco bíceps femoral lateral)",
            "exec": "Na cadeira flexora, gire levemente os pés para fora antes de flexionar os joelhos, dando ênfase à porção lateral do bíceps femoral.",
            "erro": "Girar o quadril inteiro em vez de apenas os pés e tornozelos, perdendo o ângulo de trabalho pretendido.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation_with_Band/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation_with_Band/1.jpg"
            ]
          },
          {
            "name": "Levantamento terra romeno no cabo (unilateral)",
            "exec": "Segure a alça da polia baixa com uma mão, mantenha a perna do mesmo lado ligeiramente flexionada e desça o tronco enquanto a perna oposta se estende para trás, sentindo o alongamento do posterior com tensão constante do cabo.",
            "erro": "Perder o alinhamento do quadril, girando o tronco em vez de manter os quadris nivelados."
          },
          {
            "name": "Good morning com safety squat bar (SSB)",
            "exec": "Com a SSB apoiada nos trapézios, incline o tronco à frente mantendo a coluna neutra e as pernas quase estendidas até sentir alongamento no posterior de coxa — o desequilíbrio à frente gerado pela barra exige mais estabilização do core e da cadeia posterior do que a barra reta.",
            "erro": "Arredondar a coluna durante a inclinação do tronco para compensar a instabilidade extra da barra, em vez de reforçar a ativação abdominal antes de iniciar o movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Good_Mornings/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Good_Mornings/1.jpg"
            ]
          }
        ]
      }
    }
  },
  "gluteos": {
    "label": "Glúteos",
    "portions": {
      "geral": {
        "label": "Glúteo Máximo",
        "exercises": [
          {
            "name": "Hip thrust com barra",
            "exec": "Costas apoiadas no banco, empurre o quadril para cima contraindo o glúteo no topo.",
            "erro": "Hiperestender a lombar no topo do movimento em vez de contrair o glúteo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/1.jpg"
            ]
          },
          {
            "name": "Elevação pélvica no chão",
            "exec": "Deitado, pés apoiados, eleve o quadril contraindo os glúteos no topo.",
            "erro": "Usar impulso das pernas em vez de contração do glúteo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/1.jpg"
            ]
          },
          {
            "name": "Abdução de quadril na máquina",
            "exec": "Sentado, empurre as pernas para fora contra a resistência da máquina.",
            "erro": "Usar amplitude reduzida e movimento rápido demais.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/1.jpg"
            ]
          },
          {
            "name": "Coice no cabo (glúteo no pulley)",
            "exec": "Tornozelo preso ao cabo, empurre a perna para trás contraindo o glúteo, sem arquear a lombar.",
            "erro": "Compensar com a lombar em vez de isolar o glúteo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/1.jpg"
            ]
          },
          {
            "name": "Agachamento sumô",
            "exec": "Pés bem afastados e apontados para fora, desça em agachamento mantendo o tronco ereto.",
            "erro": "Deixar os joelhos colapsarem para dentro durante a subida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Chains/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Chains/1.jpg"
            ]
          },
          {
            "name": "Cadeira abdutora unilateral",
            "exec": "Uma perna por vez, empurre contra a resistência afastando-a do corpo.",
            "erro": "Usar amplitude curta, sem sentir a contração completa do glúteo."
          },
          {
            "name": "Elevação pélvica unilateral",
            "exec": "Deitado, uma perna apoiada e a outra estendida, eleve o quadril contraindo o glúteo da perna de apoio.",
            "erro": "Girar o quadril durante o movimento, perdendo o alinhamento."
          },
          {
            "name": "Caminhada lateral com elástico (banded lateral walk)",
            "exec": "Elástico acima dos joelhos ou tornozelos, dê passos laterais mantendo leve flexão de joelhos.",
            "erro": "Ficar totalmente ereto, perdendo a tensão do elástico e o trabalho do glúteo."
          },
          {
            "name": "Hip thrust na máquina",
            "exec": "Sentado no aparelho específico de hip thrust, apoie a parte superior das costas no encosto e empurre o quadril à frente até a extensão completa.",
            "erro": "Empurrar predominantemente com a lombar em vez de contrair o glúteo na extensão."
          },
          {
            "name": "Hip thrust unilateral com halter",
            "exec": "Com as costas apoiadas em um banco e um halter sobre o quadril, eleve o quadril usando apenas uma perna enquanto a outra fica estendida no ar.",
            "erro": "Rotacionar o quadril para o lado da perna de apoio, perdendo o alinhamento pélvico."
          },
          {
            "name": "Coice na máquina (glute kickback machine)",
            "exec": "Posicione o pé na plataforma do aparelho e empurre para trás e para cima estendendo o quadril, mantendo o tronco apoiado e estável.",
            "erro": "Hiperestender a lombar no final do movimento em vez de limitar a extensão ao quadril.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Kickback/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Kickback/1.jpg"
            ]
          },
          {
            "name": "Abdução de quadril no cabo em pé",
            "exec": "Com a tornozeleira presa à polia baixa, afaste a perna lateralmente mantendo o tronco ereto e o joelho estendido.",
            "erro": "Inclinar o tronco para o lado oposto para ganhar amplitude artificial no movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/1.jpg"
            ]
          },
          {
            "name": "Agachamento sumô com halter",
            "exec": "Segure um halter verticalmente com as duas mãos entre as pernas afastadas e agache mantendo os joelhos alinhados com os pés.",
            "erro": "Descer com pouca amplitude, sem levar o quadril abaixo da linha dos joelhos.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Sumo_Deadlift/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Sumo_Deadlift/1.jpg"
            ]
          },
          {
            "name": "Step-up lateral com halteres",
            "exec": "Ao lado de um step, suba lateralmente com uma perna levando o corpo todo para cima e desça controlado pelo mesmo lado.",
            "erro": "Girar o tronco para frente durante a subida em vez de manter o movimento estritamente lateral."
          },
          {
            "name": "Extensão de quadril na polia baixa (cable pull-through)",
            "exec": "De costas para a polia baixa com a corda entre as pernas, flexione o quadril levando o tronco à frente e depois estenda o quadril contraindo o glúteo.",
            "erro": "Puxar o peso principalmente com os braços em vez de gerar força pela extensão de quadril.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull_Through/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull_Through/1.jpg"
            ]
          },
          {
            "name": "Ponte de glúteo com barra em banco elevado",
            "exec": "Com as costas apoiadas em um banco e a barra sobre o quadril, eleve o quadril até a extensão completa mantendo os pés afastados na largura do quadril.",
            "erro": "Deixar os pés muito próximos do corpo, reduzindo a ativação do glúteo em favor do quadríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/1.jpg"
            ]
          },
          {
            "name": "Cadeira abdutora bilateral com pausa isométrica",
            "exec": "Sentado na cadeira abdutora, afaste as pernas contra a resistência e mantenha a posição de maior abertura por dois segundos.",
            "erro": "Usar impulso na fase inicial do movimento em vez de força constante do glúteo médio."
          },
          {
            "name": "Agachamento sumô no smith machine",
            "exec": "Com a barra guiada apoiada nas costas e pernas bem afastadas, agache mantendo os joelhos alinhados com os pés apontados para fora.",
            "erro": "Deixar o quadril subir antes dos ombros na fase de subida, perdendo tensão no glúteo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/1.jpg"
            ]
          },
          {
            "name": "Coice no cabo com pegada cruzada (perna cruzando a linha central)",
            "exec": "Com a tornozeleira presa à polia baixa, cruze a perna de trabalho por trás da perna de apoio antes de estender o quadril para trás e para fora, aumentando a ativação do glúteo médio.",
            "erro": "Girar o quadril para compensar o cruzamento, em vez de manter o alinhamento pélvico estável.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/1.jpg"
            ]
          },
          {
            "name": "Abdução de quadril no cabo deitado de lado (variação no chão)",
            "exec": "Com a tornozeleira presa na polia baixa, deite de lado no chão próximo ao aparelho e afaste a perna lateralmente contra a resistência do cabo, controlando a volta.",
            "erro": "Deixar o quadril rolar para trás durante a abdução, perdendo o isolamento do glúteo médio."
          },
          {
            "name": "Extensão de quadril no cabo em pé com apoio de banco (single-leg cable hip extension apoiado)",
            "exec": "Apoie as mãos em um banco à frente para estabilidade e, com a tornozeleira presa na polia baixa, estenda o quadril para trás controlando a fase excêntrica.",
            "erro": "Hiperestender a lombar no topo do movimento em vez de limitar a extensão ao quadril.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull_Through/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull_Through/1.jpg"
            ]
          }
        ]
      }
    }
  },
  "panturrilha": {
    "label": "Panturrilha",
    "portions": {
      "gastrocnemio": {
        "label": "Gastrocnêmio",
        "exercises": [
          {
            "name": "Panturrilha em pé na máquina",
            "exec": "De pé, eleve os calcanhares o máximo possível e desça até alongamento completo.",
            "erro": "Fazer o movimento com amplitude curta, sem descer totalmente.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/1.jpg"
            ]
          },
          {
            "name": "Panturrilha em pé com halteres",
            "exec": "Halteres nas mãos, eleve os calcanhares contraindo no topo e descendo controlado.",
            "erro": "Balançar o corpo para gerar impulso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Calf_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Calf_Raise/1.jpg"
            ]
          },
          {
            "name": "Panturrilha no leg press",
            "exec": "Pés na ponta da plataforma, empurre com os calcanhares estendendo os tornozelos.",
            "erro": "Usar amplitude parcial, perdendo o alongamento na descida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Leg_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Leg_Press/1.jpg"
            ]
          },
          {
            "name": "Salto na panturrilha (calf jump)",
            "exec": "Pequenos saltos usando apenas a extensão do tornozelo.",
            "erro": "Absorver o impacto com o joelho em vez do tornozelo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/1.jpg"
            ]
          },
          {
            "name": "Panturrilha no smith machine",
            "exec": "Ponta dos pés em um step sob a barra guiada, eleve os calcanhares controlando toda a amplitude.",
            "erro": "Descer rápido demais sem controlar o alongamento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Calf_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Calf_Raise/1.jpg"
            ]
          },
          {
            "name": "Panturrilha unilateral em pé",
            "exec": "Uma perna por vez, com ou sem apoio de halter, eleve o calcanhar controlando a descida.",
            "erro": "Usar o outro pé para ajudar a empurrar, tirando o isolamento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/1.jpg"
            ]
          },
          {
            "name": "Pular corda com foco na panturrilha",
            "exec": "Pequenos saltos contínuos usando principalmente a extensão do tornozelo.",
            "erro": "Saltar muito alto usando o joelho, perdendo o foco na panturrilha.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Donkey_Calf_Raises/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Donkey_Calf_Raises/1.jpg"
            ]
          },
          {
            "name": "Panturrilha na barra guiada (donkey calf raise)",
            "exec": "Tronco inclinado à frente apoiado, eleve os calcanhares contraindo a panturrilha em toda amplitude.",
            "erro": "Não descer completamente entre as repetições.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/1.jpg"
            ]
          },
          {
            "name": "Panturrilha em pé com barra livre nas costas",
            "exec": "Com a barra apoiada nas costas e a ponta dos pés sobre um anteparo, eleve os calcanhares o máximo possível e desça controlado abaixo da linha do apoio.",
            "erro": "Usar impulso das pernas (flexionando e estendendo joelhos) em vez de mover apenas o tornozelo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocking_Standing_Calf_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocking_Standing_Calf_Raise/1.jpg"
            ]
          },
          {
            "name": "Panturrilha unilateral no step com halter",
            "exec": "Com um halter na mão e a ponta de um pé apoiada na borda de um step, eleve o calcanhar ao máximo e desça até alongar bem a panturrilha.",
            "erro": "Apoiar a mão livre com muito peso no suporte, tirando carga real do exercício.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/1.jpg"
            ]
          },
          {
            "name": "Panturrilha unilateral no leg press",
            "exec": "Com um pé na parte baixa da plataforma do leg press, empurre estendendo o tornozelo enquanto a outra perna fica recolhida sem apoio.",
            "erro": "Deixar o joelho da perna de trabalho flexionar durante o movimento, tirando o foco da panturrilha."
          },
          {
            "name": "Panturrilha em pé no hack machine",
            "exec": "De frente para o aparelho hack, apoie apenas a ponta dos pés na base e eleve os calcanhares empurrando contra as almofadas dos ombros.",
            "erro": "Não descer completamente entre repetições, reduzindo a amplitude de alongamento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Hack_Squats/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Hack_Squats/1.jpg"
            ]
          },
          {
            "name": "Panturrilha no leg press com pausa isométrica no topo",
            "exec": "Empurre a plataforma do leg press estendendo o tornozelo e mantenha a contração máxima por dois segundos antes de descer.",
            "erro": "Perder a tensão na pausa relaxando o tornozelo em vez de sustentar a contração.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Press_On_The_Leg_Press_Machine/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Press_On_The_Leg_Press_Machine/1.jpg"
            ]
          },
          {
            "name": "Panturrilha unilateral no smith machine",
            "exec": "Com a barra guiada apoiada nas costas e a ponta de um pé sobre um anteparo, eleve o calcanhar ao máximo mantendo o joelho estendido.",
            "erro": "Compensar o desequilíbrio apoiando o outro pé no chão durante o movimento."
          },
          {
            "name": "Salto com halteres focando panturrilha (weighted calf jump)",
            "exec": "Segurando halteres leves ao lado do corpo, realize pequenos saltos verticais impulsionando-se principalmente pela extensão do tornozelo.",
            "erro": "Usar flexão excessiva de joelhos para saltar em vez de gerar o impulso pela panturrilha.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raise_On_A_Dumbbell/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raise_On_A_Dumbbell/1.jpg"
            ]
          },
          {
            "name": "Panturrilha na prensa vertical (vertical leg press)",
            "exec": "Deitado no aparelho de prensa vertical, apoie a ponta dos pés na plataforma e estenda os tornozelos empurrando o peso para cima.",
            "erro": "Manter os joelhos travados com rigidez excessiva, transferindo tensão para a articulação.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/1.jpg"
            ]
          },
          {
            "name": "Panturrilha em pé com cinturão de peso",
            "exec": "Com um cinturão de peso preso à cintura e a ponta dos pés sobre um anteparo elevado, eleve os calcanhares controladamente até a amplitude máxima.",
            "erro": "Balançar o quadril para gerar impulso em vez de isolar o movimento no tornozelo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Calf_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Calf_Raise/1.jpg"
            ]
          },
          {
            "name": "Corrida estacionária na ponta dos pés com carga",
            "exec": "Segurando halteres leves, mantenha-se na ponta dos pés e realize passadas rápidas no lugar sem apoiar os calcanhares no chão.",
            "erro": "Apoiar os calcanhares entre as passadas, perdendo a tensão contínua na panturrilha."
          }
        ]
      },
      "soleo": {
        "label": "Sóleo",
        "exercises": [
          {
            "name": "Panturrilha sentado na máquina",
            "exec": "Sentado, joelhos flexionados a 90°, eleve os calcanhares contraindo a panturrilha.",
            "erro": "Usar pouca amplitude de movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/1.jpg"
            ]
          },
          {
            "name": "Panturrilha sentado com halter no joelho",
            "exec": "Sentado, halter apoiado sobre o joelho, eleve o calcanhar controlando a descida.",
            "erro": "Deixar o halter escorregar por falta de apoio estável."
          },
          {
            "name": "Panturrilha unilateral sentado",
            "exec": "Uma perna por vez, foco na contração completa do sóleo.",
            "erro": "Compensar com a perna de apoio em vez de isolar."
          },
          {
            "name": "Panturrilha isométrica (segurar no topo)",
            "exec": "Eleve o calcanhar e segure a contração máxima por alguns segundos antes de descer.",
            "erro": "Soltar rápido demais, perdendo o tempo sob tensão.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raises_-_With_Bands/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raises_-_With_Bands/1.jpg"
            ]
          },
          {
            "name": "Panturrilha sentado na máquina com pausa embaixo",
            "exec": "Sentado, desça o calcanhar até o alongamento máximo e pause 1-2 segundos antes de subir.",
            "erro": "Não pausar embaixo, perdendo o alongamento completo."
          },
          {
            "name": "Panturrilha sentado unilateral com halter",
            "exec": "Uma perna por vez, halter sobre o joelho, eleve o calcanhar controlando toda a amplitude.",
            "erro": "Deixar o joelho se mover durante a execução em vez de manter fixo."
          },
          {
            "name": "Panturrilha sentado com faixa elástica",
            "exec": "Sentado, faixa elástica sob o antepé, eleve o calcanhar contra a resistência da faixa.",
            "erro": "Perder a tensão da faixa no início do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/1.jpg"
            ]
          },
          {
            "name": "Panturrilha sentado com pausa isométrica no topo",
            "exec": "Eleve o calcanhar com joelho flexionado e segure a contração máxima antes de descer.",
            "erro": "Fazer o movimento rápido demais, sem tempo sob tensão."
          },
          {
            "name": "Panturrilha sentada no leg press",
            "exec": "Sentado no leg press com os joelhos flexionados a 90 graus, apoie a ponta dos pés na plataforma e estenda apenas o tornozelo.",
            "erro": "Estender os joelhos junto com o tornozelo, transferindo trabalho para o quadríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Over_Floor_Press/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Over_Floor_Press/1.jpg"
            ]
          },
          {
            "name": "Panturrilha sentada na máquina com cadência lenta",
            "exec": "Na máquina de panturrilha sentado, eleve o calcanhar em quatro segundos, sem pausa, e desça em outros quatro segundos controladamente.",
            "erro": "Acelerar a fase de descida perdendo o controle da cadência combinada."
          },
          {
            "name": "Panturrilha sentada unilateral na máquina",
            "exec": "Sentado, posicione uma perna de cada vez sob a almofada da máquina e eleve o calcanhar isoladamente até a contração máxima.",
            "erro": "Empurrar com o corpo inclinado para o lado, ajudando artificialmente a perna de trabalho."
          },
          {
            "name": "Panturrilha sentada com barra sobre os joelhos",
            "exec": "Sentado em um banco com uma barra apoiada sobre os joelhos e os pés sobre um anteparo, eleve os calcanhares controladamente.",
            "erro": "Posicionar a barra muito próxima aos joelhos, causando desconforto e limitando a amplitude."
          },
          {
            "name": "Panturrilha sentada isométrica na metade do movimento",
            "exec": "Sentado, eleve o calcanhar até a metade da amplitude e mantenha essa posição estática por vários segundos antes de completar o movimento.",
            "erro": "Deixar o calcanhar oscilar durante a pausa em vez de mantê-lo estático."
          },
          {
            "name": "Panturrilha sentada com barra apoiada nos joelhos no banco Scott",
            "exec": "Sentado de frente para o banco Scott, apoie a barra sobre os joelhos e os pés no chão sobre um anteparo, elevando os calcanhares.",
            "erro": "Não estabilizar a barra corretamente, deixando-a deslizar durante a execução."
          },
          {
            "name": "Panturrilha sentada com halteres bilaterais nos joelhos",
            "exec": "Sentado, posicione um halter sobre cada joelho e eleve os calcanhares simultaneamente até a contração máxima do sóleo.",
            "erro": "Deixar os halteres desequilibrarem para os lados por falta de fixação com as mãos."
          },
          {
            "name": "Panturrilha sentada unilateral com faixa elástica",
            "exec": "Sentado com a faixa elástica presa sob o pé e fixada ao chão, eleve o calcanhar de uma perna vencendo a resistência da faixa.",
            "erro": "Usar uma faixa com tensão insuficiente, reduzindo o estímulo no sóleo."
          },
          {
            "name": "Panturrilha sentada na máquina com pausa na fase excêntrica",
            "exec": "Eleve o calcanhar normalmente e, na descida, pare por dois segundos na metade do percurso antes de continuar até o alongamento máximo.",
            "erro": "Ignorar a pausa excêntrica e descer o movimento de forma contínua e rápida."
          },
          {
            "name": "Panturrilha sentada com anilha sobre os joelhos",
            "exec": "Sentado com uma anilha apoiada diretamente sobre os joelhos e os pés sobre um anteparo, eleve os calcanhares até a contração máxima.",
            "erro": "Deixar a anilha deslizar para frente dos joelhos, perdendo a distribuição correta da carga."
          }
        ]
      }
    }
  },
  "abdomen": {
    "label": "Abdômen",
    "portions": {
      "superior": {
        "label": "Reto Abdominal Superior",
        "exercises": [
          {
            "name": "Abdominal supra no solo",
            "exec": "Deitado, joelhos flexionados, eleve o tronco contraindo o abdômen sem puxar o pescoço.",
            "erro": "Puxar a cabeça/pescoço com as mãos em vez de usar o abdômen.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/1.jpg"
            ]
          },
          {
            "name": "Abdominal na máquina (crunch machine)",
            "exec": "Sentado, flexione o tronco contra a resistência contraindo o abdômen.",
            "erro": "Usar carga excessiva que force o uso dos braços.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/1.jpg"
            ]
          },
          {
            "name": "Crunch no cabo (polia alta ajoelhado)",
            "exec": "Ajoelhado de frente para a polia alta, flexione o tronco levando os cotovelos em direção aos joelhos.",
            "erro": "Puxar apenas com os braços em vez de flexionar a coluna com o abdômen.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Crunch/1.jpg"
            ]
          },
          {
            "name": "Abdominal na bola suíça",
            "exec": "Apoiado na bola, flexione o tronco controlando o equilíbrio.",
            "erro": "Perder a estabilidade e transferir esforço para o quadril.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tuck_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tuck_Crunch/1.jpg"
            ]
          },
          {
            "name": "Roda abdominal (ab wheel rollout)",
            "exec": "Ajoelhado, segure a roda e role para frente estendendo o corpo, depois retorne contraindo o abdômen.",
            "erro": "Deixar a lombar arquear ao estender o corpo além do controle.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/1.jpg"
            ]
          },
          {
            "name": "Crunch com peso no peito",
            "exec": "Deitado, segure um disco ou halter sobre o peito, eleve o tronco contraindo o abdômen.",
            "erro": "Usar o peso para gerar embalo em vez de controlar o movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Crunch/1.jpg"
            ]
          },
          {
            "name": "Abdominal na polia deitado",
            "exec": "Deitado de costas para a polia baixa, puxe o cabo flexionando o tronco para cima.",
            "erro": "Puxar mais com os braços do que com a contração abdominal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Crunch/1.jpg"
            ]
          },
          {
            "name": "Toe touch (alcançar os pés deitado)",
            "exec": "Deitado, pernas estendidas para cima, eleve o tronco tentando tocar os pés com as mãos.",
            "erro": "Flexionar os joelhos para facilitar, reduzindo o trabalho abdominal."
          },
          {
            "name": "Crunch na polia alta em pé",
            "exec": "De pé de costas para a polia alta, segurando a corda atrás da cabeça, flexione o tronco trazendo o peito em direção ao quadril contraindo o abdômen.",
            "erro": "Flexionar o quadril e os joelhos para ajudar no movimento em vez de isolar a flexão do tronco.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Reverse_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Reverse_Crunch/1.jpg"
            ]
          },
          {
            "name": "Sit-up no banco declinado com anilha",
            "exec": "Deitado no banco declinado com uma anilha segura junto ao peito, suba o tronco completamente contraindo o abdômen e desça controlado.",
            "erro": "Puxar o pescoço com as mãos ou usar o impulso dos braços em vez da força abdominal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit-Up/1.jpg"
            ]
          },
          {
            "name": "Crunch na bola suíça com halteres",
            "exec": "Apoiado com a lombar na bola suíça e segurando halteres no peito, flexione o tronco elevando os ombros do apoio.",
            "erro": "Perder o equilíbrio sobre a bola e compensar com movimento das pernas.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/1.jpg"
            ]
          },
          {
            "name": "Abdominal na cadeira romana com peso",
            "exec": "Sentado na cadeira romana com um disco segurado no peito, incline o tronco para trás e retorne flexionando o abdômen até a posição inicial.",
            "erro": "Descer além do ponto de controle lombar seguro, perdendo tensão abdominal e sobrecarregando a lombar.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Oblique_Crunches/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Oblique_Crunches/1.jpg"
            ]
          },
          {
            "name": "Crunch na máquina vertical articulada",
            "exec": "Sentado no aparelho de crunch vertical, segure as alças e flexione o tronco para baixo contraindo o abdômen contra a resistência ajustada.",
            "erro": "Usar o peso do corpo em queda livre em vez de controlar o movimento com contração abdominal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/1.jpg"
            ]
          },
          {
            "name": "Abdominal com anilha sobre o peito no step",
            "exec": "Deitado com a parte superior das costas apoiada em um step, segure uma anilha sobre o peito e realize a flexão do tronco.",
            "erro": "Apoiar toda a coluna no step, reduzindo a amplitude útil do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross-Body_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross-Body_Crunch/1.jpg"
            ]
          },
          {
            "name": "Ab Coaster (aparelho de crunch guiado)",
            "exec": "Sentado no aparelho, segure as alças laterais e puxe os joelhos em direção ao peito seguindo o trilho guiado, contraindo o abdômen.",
            "erro": "Puxar principalmente com os braços em vez de conduzir o movimento com a contração do abdômen.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Crunches/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Crunches/1.jpg"
            ]
          },
          {
            "name": "Crunch no cabo com pega em corda ajoelhado",
            "exec": "Ajoelhado de frente para a polia alta, segure a corda ao lado da cabeça e flexione o tronco levando os cotovelos em direção aos joelhos.",
            "erro": "Manter o quadril fixo demais e mover apenas os braços em vez de flexionar a coluna torácica.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Rope_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Rope_Crunch/1.jpg"
            ]
          },
          {
            "name": "Sit-up guiado na máquina de abdominal",
            "exec": "Sentado no aparelho com o encosto móvel, flexione o tronco à frente vencendo a resistência ajustada e retorne controladamente.",
            "erro": "Ajustar uma resistência muito baixa que permita completar o movimento por impulso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/3_4_Sit-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/3_4_Sit-Up/1.jpg"
            ]
          },
          {
            "name": "Crunch com halteres nas mãos estendidas sobre o peito",
            "exec": "Deitado no solo com os braços estendidos segurando halteres acima do peito, flexione o tronco elevando os ombros do chão.",
            "erro": "Flexionar os cotovelos durante o movimento, reduzindo o braço de alavanca e a exigência abdominal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Gorilla_Chin_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Gorilla_Chin_Crunch/1.jpg"
            ]
          },
          {
            "name": "Crunch no cabo com barra reta (pegada pronada acima da cabeça)",
            "exec": "Ajoelhado de frente para a polia alta, segure a barra reta com pegada pronada em vez da corda, posicionando-a acima da cabeça, e flexione o tronco levando a barra em direção às coxas.",
            "erro": "Puxar a barra com os braços em vez de flexionar a coluna com a contração do abdômen.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Exercise_Ball_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Exercise_Ball_Crunch/1.jpg"
            ]
          }
        ]
      },
      "inferior": {
        "label": "Reto Abdominal Inferior",
        "exercises": [
          {
            "name": "Elevação de pernas na barra fixa",
            "exec": "Pendurado na barra, eleve as pernas estendidas ou flexionadas até a horizontal ou mais.",
            "erro": "Usar embalo do corpo em vez de força abdominal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scapular_Pull-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scapular_Pull-Up/1.jpg"
            ]
          },
          {
            "name": "Elevação de joelhos no apoio (captain's chair)",
            "exec": "Apoiado nos antebraços, eleve os joelhos em direção ao peito controlando o movimento.",
            "erro": "Balançar o tronco para gerar impulso.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Leg_Raises/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Leg_Raises/1.jpg"
            ]
          },
          {
            "name": "Abdominal infra no solo (elevação de pernas)",
            "exec": "Deitado, eleve as pernas estendidas até a vertical controlando a descida.",
            "erro": "Deixar a lombar arquear ao descer as pernas.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Leg_Raises/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Leg_Raises/1.jpg"
            ]
          },
          {
            "name": "Reverse crunch",
            "exec": "Deitado, joelhos flexionados ao peito, eleve o quadril do chão contraindo o abdômen inferior.",
            "erro": "Usar impulso das pernas em vez de contrair o abdômen.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Oblique_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Oblique_Crunch/1.jpg"
            ]
          },
          {
            "name": "Dragon flag",
            "exec": "Deitado, apoie os ombros no banco e eleve o corpo todo reto, controlando a descida sem deixar o quadril cair.",
            "erro": "Flexionar o quadril durante a descida, perdendo a rigidez do corpo."
          },
          {
            "name": "Elevação de pernas na cadeira romana",
            "exec": "Apoiado nos antebraços e costas, eleve as pernas estendidas controlando a descida.",
            "erro": "Balançar o corpo para ganhar impulso na subida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Leg_Raises/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Leg_Raises/1.jpg"
            ]
          },
          {
            "name": "Joelhos ao peito em suspensão (TRX)",
            "exec": "Pés presos nas alças de suspensão, em posição de prancha, traga os joelhos em direção ao peito.",
            "erro": "Deixar o quadril subir muito alto, perdendo a tensão abdominal."
          },
          {
            "name": "V-up",
            "exec": "Deitado, eleve simultaneamente tronco e pernas estendidas formando um V, tocando as mãos nos pés.",
            "erro": "Flexionar os joelhos para facilitar o toque nos pés."
          },
          {
            "name": "Elevação de pernas na máquina de abdominal infra",
            "exec": "Sentado ou apoiado no aparelho específico, eleve as pernas estendidas ou flexionadas contra a resistência ajustada, controlando a descida.",
            "erro": "Deixar as pernas caírem rapidamente na fase excêntrica em vez de controlar o retorno.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/1.jpg"
            ]
          },
          {
            "name": "Reverse crunch no banco declinado com anilha nos pés",
            "exec": "Deitado no banco declinado com uma anilha presa entre os pés, flexione o quadril trazendo os joelhos em direção ao peito.",
            "erro": "Usar embalo das pernas para levantar o peso em vez de contrair o abdômen inferior.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Reverse_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Reverse_Crunch/1.jpg"
            ]
          },
          {
            "name": "Elevação de joelhos na barra fixa com halter entre os pés",
            "exec": "Pendurado na barra fixa com um halter pequeno preso entre os pés, eleve os joelhos em direção ao peito de forma controlada.",
            "erro": "Balançar o corpo para gerar impulso em vez de elevar os joelhos apenas com força abdominal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Pull_Ups/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Pull_Ups/1.jpg"
            ]
          },
          {
            "name": "Elevação de pernas na cadeira romana com rotação lateral",
            "exec": "Apoiado na cadeira romana, eleve as pernas estendidas e gire levemente o quadril para um lado a cada repetição, alternando os lados.",
            "erro": "Girar o tronco em vez do quadril, perdendo o foco no abdômen inferior e nos oblíquos.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Lying_Leg_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Lying_Leg_Raise/1.jpg"
            ]
          },
          {
            "name": "V-up com halter nas mãos",
            "exec": "Deitado no solo com um halter leve seguro entre as mãos estendidas, eleve simultaneamente pernas e tronco formando um V, tocando os pés com o halter.",
            "erro": "Flexionar os joelhos excessivamente para facilitar o toque, reduzindo a exigência abdominal."
          },
          {
            "name": "Dragon flag no banco com apoio de disco",
            "exec": "Deitado no banco segurando a borda atrás da cabeça, eleve o corpo todo em linha reta a partir dos ombros, controlando a descida sem tocar o banco.",
            "erro": "Deixar o quadril flexionar durante a descida, quebrando a linha reta do corpo."
          },
          {
            "name": "Elevação de pernas no banco romano unilateral",
            "exec": "Apoiado na cadeira romana, eleve uma perna estendida por vez até a altura do quadril, mantendo a outra estável.",
            "erro": "Compensar com rotação do tronco para elevar a perna mais alto do que a mobilidade permite."
          },
          {
            "name": "Reverse crunch na polia baixa",
            "exec": "Deitado de costas com os pés presos a uma tornozeleira conectada à polia baixa, flexione o quadril levando os joelhos em direção ao peito.",
            "erro": "Puxar o cabo com movimento brusco em vez de contração progressiva do abdômen inferior.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bosu_Ball_Cable_Crunch_With_Side_Bends/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bosu_Ball_Cable_Crunch_With_Side_Bends/1.jpg"
            ]
          },
          {
            "name": "Elevação de joelhos em pé no cabo",
            "exec": "De pé, com a tornozeleira presa à polia baixa, eleve o joelho em direção ao peito mantendo o tronco estável e sem inclinar para trás.",
            "erro": "Inclinar o tronco para trás para ganhar amplitude artificial na elevação do joelho.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Leg_Raises/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Leg_Raises/1.jpg"
            ]
          },
          {
            "name": "Toes to bar na barra fixa",
            "exec": "Pendurado na barra fixa, eleve as pernas estendidas até tocar a barra com os pés, controlando tanto a subida quanto a descida.",
            "erro": "Usar balanço excessivo do corpo (kipping) para tocar a barra em vez de força abdominal controlada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Assisted_Pull-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Assisted_Pull-Up/1.jpg"
            ]
          },
          {
            "name": "Elevação de pernas no cabo deitado (tornozeleira dupla na polia baixa)",
            "exec": "Deitado de costas próximo à polia baixa, com uma tornozeleira dupla presa aos pés, eleve as pernas estendidas contra a resistência do cabo até a vertical, controlando a descida.",
            "erro": "Deixar a lombar arquear ao descer as pernas contra a resistência do cabo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Leg_Raises/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Leg_Raises/1.jpg"
            ]
          }
        ]
      },
      "obliquos": {
        "label": "Oblíquos",
        "exercises": [
          {
            "name": "Prancha lateral",
            "exec": "Apoiado no antebraço lateralmente, mantenha o corpo alinhado e reto por tempo determinado.",
            "erro": "Deixar o quadril cair durante a execução.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/1.jpg"
            ]
          },
          {
            "name": "Abdominal oblíquo (bicicleta)",
            "exec": "Deitado, alterne levando o cotovelo em direção ao joelho oposto de forma controlada.",
            "erro": "Fazer o movimento rápido demais, perdendo a contração dos oblíquos.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Oblique_Crunches_-_On_The_Floor/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Oblique_Crunches_-_On_The_Floor/1.jpg"
            ]
          },
          {
            "name": "Rotação de tronco no cabo (woodchopper)",
            "exec": "Polia alta ou baixa, gire o tronco puxando o cabo na diagonal mantendo o quadril estável.",
            "erro": "Girar o quadril junto ao invés de isolar a rotação do tronco.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Wood_Chop/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Wood_Chop/1.jpg"
            ]
          },
          {
            "name": "Abdominal lateral no solo (side crunch)",
            "exec": "Deitado de lado, flexione o tronco lateralmente contraindo o oblíquo.",
            "erro": "Usar o pescoço/braço para puxar o corpo em vez do oblíquo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch_-_Hands_Overhead/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch_-_Hands_Overhead/1.jpg"
            ]
          },
          {
            "name": "Prancha lateral com rotação (thread the needle)",
            "exec": "Em prancha lateral, gire o tronco passando o braço livre por baixo do corpo e volte à posição inicial.",
            "erro": "Deixar o quadril cair durante a rotação.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/1.jpg"
            ]
          },
          {
            "name": "Russian twist com peso",
            "exec": "Sentado com o tronco levemente inclinado para trás, gire o tronco de um lado para o outro segurando um peso.",
            "erro": "Mover apenas os braços em vez de girar o tronco todo."
          },
          {
            "name": "Elevação lateral do quadril (hip dip) na prancha",
            "exec": "Em prancha lateral, desça e suba o quadril levemente sem tocar o chão.",
            "erro": "Fazer o movimento muito amplo, perdendo o controle e a tensão no oblíquo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Side_Lateral_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Side_Lateral_Raise/1.jpg"
            ]
          },
          {
            "name": "Corte de lenha com halter (chop) unilateral",
            "exec": "Halter acima de um ombro, gire o tronco levando o peso na diagonal até o quadril oposto.",
            "erro": "Girar o quadril junto, ao invés de isolar a rotação do tronco."
          },
          {
            "name": "Woodchopper no cabo de cima para baixo",
            "exec": "Com a polia ajustada acima da cabeça, puxe a corda diagonalmente cruzando o corpo até a altura do quadril oposto, rotacionando o tronco.",
            "erro": "Rotacionar apenas os braços sem girar o tronco e o quadril junto com o movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Wood_Chop/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Wood_Chop/1.jpg"
            ]
          },
          {
            "name": "Rotação de tronco na máquina de rotação",
            "exec": "Sentado no aparelho com o tronco fixado pelas almofadas, gire o tronco de um lado para o outro contra a resistência ajustada.",
            "erro": "Usar movimento brusco e rápido em vez de rotação controlada dentro da amplitude segura."
          },
          {
            "name": "Crunch lateral no cabo em pé",
            "exec": "De pé ao lado da polia baixa, segure a alça na mão mais próxima e flexione lateralmente o tronco contraindo o oblíquo, depois retorne.",
            "erro": "Flexionar o quadril para o lado em vez de isolar a flexão lateral da coluna.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Cable_Crunch_With_Alternating_Oblique_Twists/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Cable_Crunch_With_Alternating_Oblique_Twists/1.jpg"
            ]
          },
          {
            "name": "Flexão lateral de tronco com halter",
            "exec": "De pé com um halter em uma das mãos, incline o tronco lateralmente na direção do halter e retorne à posição ereta contraindo o oblíquo do lado oposto.",
            "erro": "Realizar amplitude excessiva, gerando compressão lombar em vez de trabalho controlado do oblíquo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Wide/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Wide/1.jpg"
            ]
          },
          {
            "name": "Prancha lateral com elevação de perna",
            "exec": "Em prancha lateral apoiado no antebraço, eleve a perna de cima mantendo o quadril estável e alinhado, sem deixá-lo cair.",
            "erro": "Deixar o quadril despencar em direção ao chão durante a elevação da perna."
          },
          {
            "name": "Russian twist na bola suíça com anilha",
            "exec": "Sentado sobre a bola suíça com os pés apoiados no chão e uma anilha nas mãos, gire o tronco de um lado para o outro mantendo o equilíbrio.",
            "erro": "Perder a estabilidade sobre a bola e compensar rolando o quadril em vez de girar o tronco."
          },
          {
            "name": "Abdominal oblíquo na máquina de crunch com giro",
            "exec": "Sentado no aparelho de crunch, flexione o tronco para baixo adicionando uma leve rotação diagonal ao final do movimento, alternando os lados.",
            "erro": "Fazer a rotação apenas com os ombros sem envolver a musculatura oblíqua do tronco."
          },
          {
            "name": "Corte de lenha na polia baixa (low-to-high cable chop)",
            "exec": "Com a polia ajustada baixa, puxe a alça diagonalmente cruzando o corpo até acima do ombro oposto, girando o tronco e o quadril.",
            "erro": "Puxar apenas com os braços sem transferir a força pela rotação do quadril e tronco."
          },
          {
            "name": "Prancha lateral com halter elevado",
            "exec": "Em prancha lateral apoiado no antebraço, segure um halter leve na mão livre e eleve o braço em direção ao teto, girando levemente o tronco.",
            "erro": "Rotacionar o quadril junto com o braço, perdendo o alinhamento da prancha lateral."
          },
          {
            "name": "Rotação de tronco em pé com barra (landmine rotation)",
            "exec": "Com uma extremidade da barra presa ao solo (landmine) e a outra segurada com as duas mãos estendidas à frente, gire o tronco de um lado para o outro em arco.",
            "erro": "Mover apenas os braços em vez de conduzir a rotação pelo quadril e tronco em conjunto."
          },
          {
            "name": "Rotação de tronco no cabo com corda (pegada dupla unilateral)",
            "exec": "Segure as duas pontas da corda com uma mão na polia alta e gire o tronco na diagonal até o quadril oposto, mantendo o quadril estável durante toda a rotação.",
            "erro": "Girar o quadril junto com o tronco em vez de isolar a rotação na região do core."
          }
        ]
      }
    }
  },
  "antebraco": {
    "label": "Antebraço / Pegada",
    "portions": {
      "pegada": {
        "label": "Força de Pegada / Estática",
        "exercises": [
          {
            "name": "Dead hang (suspensão passiva na barra)",
            "exec": "Pendure-se na barra fixa com os braços estendidos e o corpo relaxado, sustentando o peso do corpo apenas pela pegada pelo maior tempo possível.",
            "erro": "Deixar os ombros subirem até as orelhas (encolhidos) em vez de mantê-los ligeiramente ativos e para baixo, o que sobrecarrega desnecessariamente o pescoço."
          },
          {
            "name": "Dead hang unilateral (suspensão com um braço)",
            "exec": "Pendurado na barra fixa, solte uma das mãos e sustente o peso do corpo com um braço só pelo tempo determinado, alternando os lados.",
            "erro": "Balançar o corpo para aliviar a carga da mão de apoio em vez de manter a sustentação estática."
          },
          {
            "name": "Farmer's walk pegada intensificada (halteres pesados, sem straps)",
            "exec": "Segure halteres bem pesados ao lado do corpo, sem usar straps/cinta de apoio, e caminhe uma distância determinada mantendo a postura ereta e a pegada firme até o limite do antebraço.",
            "erro": "Usar cinta de apoio (lifting strap), o que tira justamente o estímulo de pegada que o exercício busca.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/1.jpg"
            ]
          },
          {
            "name": "Farmer's walk unilateral com halter (suitcase carry)",
            "exec": "Segure um halter pesado em uma das mãos ao lado do corpo e caminhe uma distância determinada mantendo o tronco ereto sem inclinar para o lado do peso.",
            "erro": "Inclinar o tronco para o lado oposto ao peso para compensar, transformando o exercício em trabalho de estabilização do tronco em vez de pegada isolada."
          },
          {
            "name": "Aperto de pegador (hand gripper)",
            "exec": "Segure o pegador (hand gripper) na palma da mão e feche os dedos contra a mola até as hastes se tocarem, controlando também a abertura na volta.",
            "erro": "Usar apenas os dedos sem envolver toda a mão, ou soltar a haste de volta rapidamente sem controlar a fase de abertura."
          },
          {
            "name": "Plate pinch (pinça com anilha)",
            "exec": "Segure duas anilhas lisas (faces viradas uma para a outra) apenas com a ponta dos dedos e o polegar, sustentando o aperto pelo tempo determinado sem deixá-las escorregar.",
            "erro": "Deixar as anilhas se apoiarem no antebraço ou no corpo, tirando a exigência de pegada por pinça dos dedos."
          },
          {
            "name": "Rolo de punho com anilha (wrist roller)",
            "exec": "Segure o rolo de punho com os braços estendidos à frente do corpo e enrole a corda girando os punhos até levantar a anilha até o topo, depois desenrole controlando a descida.",
            "erro": "Usar o corpo ou os ombros para ajudar a enrolar a corda em vez de girar apenas os punhos."
          },
          {
            "name": "Suspensão com pegada em toalha (towel hang)",
            "exec": "Pendure uma toalha sobre a barra fixa e segure as duas pontas penduradas, sustentando o peso do corpo apenas pela pegada na toalha em vez de na barra.",
            "erro": "Enrolar a toalha na mão para facilitar o aperto, reduzindo o desafio de pegada que o exercício propõe."
          }
        ]
      },
      "punho": {
        "label": "Flexores e Extensores de Punho",
        "exercises": [
          {
            "name": "Rosca de punho com barra",
            "exec": "Sentado, com os antebraços apoiados nas coxas ou em um banco e os punhos livres além do joelho, flexione apenas o punho elevando a barra e desça controlando o alongamento.",
            "erro": "Usar o cotovelo ou o antebraço para ajudar a levantar a barra em vez de isolar o movimento no punho.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Palm-Up_Barbell_Wrist_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Palm-Up_Barbell_Wrist_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca de punho com halteres",
            "exec": "Antebraços apoiados nas coxas com um halter em cada mão, flexione apenas os punhos elevando os pesos e controle a descida até o alongamento completo.",
            "erro": "Deixar o antebraço se mover junto com o punho, perdendo o isolamento do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Palms-Up_Wrist_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Palms-Up_Wrist_Curl/1.jpg"
            ]
          },
          {
            "name": "Rosca de punho invertida com barra (reverse wrist curl)",
            "exec": "Antebraços apoiados com pegada pronada na barra, estenda o punho para cima contra a resistência controlando bem a descida, já que o extensor do punho é naturalmente mais fraco que o flexor.",
            "erro": "Usar uma carga pensada para a rosca de punho comum, exagerada demais para a musculatura extensora mais fraca.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Wrist_Curl_Over_A_Bench/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Wrist_Curl_Over_A_Bench/1.jpg"
            ]
          },
          {
            "name": "Rosca de punho no cabo (polia baixa)",
            "exec": "Sentado ou ajoelhado de frente para a polia baixa, apoie o antebraço na coxa e flexione apenas o punho puxando a barra reta para cima.",
            "erro": "Puxar com o cotovelo ou o ombro em vez de isolar o movimento no punho.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Wrist_Curl/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Wrist_Curl/1.jpg"
            ]
          },
          {
            "name": "Pronação/supinação de punho com halter",
            "exec": "Segure a ponta de um halter curto com o antebraço apoiado e gire o punho de um lado para o outro controlando toda a amplitude de rotação.",
            "erro": "Usar carga alta demais, perdendo o controle da rotação e forçando o cotovelo a compensar."
          },
          {
            "name": "Extensão de dedos com elástico",
            "exec": "Coloque um elástico ao redor da ponta dos dedos e da mão e abra os dedos contra a resistência, afastando-os uns dos outros, para trabalhar a musculatura antagonista ao aperto.",
            "erro": "Pular esse exercício por completo — negligenciar os extensores dos dedos cria desequilíbrio entre flexores e extensores e aumenta o risco de lesão em quem treina pegada com frequência."
          }
        ]
      }
    }
  }
};

// ===================== POOL DE EXERCÍCIOS — CALISTENIA =====================
// Organized by movement pattern (empurrar/puxar/pernas/core), matching the
// prototype's CALISTHENICS_GROUPS structure — NOT by the MuscleGroupKey set
// above. This is deliberately different from MUSCLE_GROUPS: calisthenics
// exercises aren't tied to whichever muscle groups a given split day
// happens to schedule, they're a standalone set of four movement patterns
// selectable on ANY training day (see `alwaysGroups` on this WORKOUT_TYPES
// entry below, and app/treino/TreinoBoard.tsx's `renderGroups` handling).
// Reuses the existing `portions` structure (the same one MUSCLE_GROUPS uses
// for anatomical sub-splits) rather than inventing a parallel concept: here
// each "portion" is a movement pattern instead of an anatomical region.
export type CalistPortionKey = "empurrar" | "puxar" | "pernas" | "core";

export const CALIST_GROUPS: Record<"calistenia", MuscleGroup> = {
  "calistenia": {
    "label": "Calistenia",
    "portions": {
      "empurrar": {
        "label": "Empurrar (Push)",
        "exercises": [
          {
            "name": "Flexão de braço tradicional",
            "exec": "Mãos na largura dos ombros, corpo alinhado, desça o peito quase até o chão e empurre de volta.",
            "erro": "Deixar o quadril cair ou subir, perdendo o alinhamento do corpo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Medium/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Medium/1.jpg"
            ]
          },
          {
            "name": "Flexão diamante",
            "exec": "Mãos juntas formando um losango sob o peito, desça controlando os cotovelos próximos ao corpo.",
            "erro": "Abrir os cotovelos para os lados, tirando o foco do tríceps.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Close-Grip/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Close-Grip/1.jpg"
            ]
          },
          {
            "name": "Flexão inclinada (mãos elevadas)",
            "exec": "Mãos apoiadas em um banco ou step, desça o peito em direção às mãos.",
            "erro": "Deixar o quadril cair durante a descida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Depth_Jump/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Depth_Jump/1.jpg"
            ]
          },
          {
            "name": "Flexão declinada (pés elevados)",
            "exec": "Pés apoiados em um banco, mãos no chão, desça o peito controlando o movimento.",
            "erro": "Perder o alinhamento do corpo, arqueando a lombar.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_With_Feet_Elevated/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_With_Feet_Elevated/1.jpg"
            ]
          },
          {
            "name": "Mergulho entre bancos (dips)",
            "exec": "Mãos apoiadas em dois bancos ou cadeiras, desça flexionando os cotovelos e suba estendendo.",
            "erro": "Descer demais forçando o ombro além do confortável.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Triceps_Version/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Triceps_Version/1.jpg"
            ]
          },
          {
            "name": "Pike push-up (foco ombro)",
            "exec": "Quadril elevado formando um V invertido, desça a cabeça em direção ao chão flexionando os cotovelos.",
            "erro": "Perder a posição de V, transformando em flexão comum."
          },
          {
            "name": "Flexão arqueiro (archer push-up)",
            "exec": "Mãos bem afastadas, desça o peito em direção a uma das mãos mantendo o outro braço estendido.",
            "erro": "Não descer o suficiente do lado de trabalho.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Reverse_Grip/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Reverse_Grip/1.jpg"
            ]
          },
          {
            "name": "Flexão com palmas (avançado)",
            "exec": "Desça a flexão e empurre com força suficiente para as mãos saírem do chão, batendo palma antes de aterrissar.",
            "erro": "Tentar sem base de força suficiente, arriscando a queda de rosto.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_-_Close_Triceps_Position/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_-_Close_Triceps_Position/1.jpg"
            ]
          },
          {
            "name": "Flexão com pés elevados em banco alto",
            "exec": "Apoie os pés em um banco ou superfície elevada e as mãos no chão, mantendo o corpo alinhado; flexione os cotovelos até o peito se aproximar do chão e empurre de volta.",
            "erro": "Deixar o quadril cair ou subir demais, perdendo o alinhamento entre ombros, quadril e tornozelos.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Push-Up_off_of_a_Dumbbell/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Push-Up_off_of_a_Dumbbell/1.jpg"
            ]
          },
          {
            "name": "Flexão hindu (Hindu push-up)",
            "exec": "Comece na posição de cachorro olhando para baixo, desça o corpo em movimento de mergulho passando próximo ao chão e finalize com o tronco elevado tipo cobra, revertendo o trajeto.",
            "erro": "Executar o movimento de forma segmentada e não fluida, perdendo a mobilidade de ombro e coluna que o exercício exige.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_With_Feet_On_An_Exercise_Ball/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_With_Feet_On_An_Exercise_Ball/1.jpg"
            ]
          },
          {
            "name": "Flexão com apoio unilateral (uma mão elevada)",
            "exec": "Apoie uma mão sobre um step ou halter e a outra no chão; flexione os cotovelos simetricamente, criando maior amplitude do lado mais baixo.",
            "erro": "Rodar o tronco para compensar a diferença de altura em vez de manter os quadris quadrados ao chão.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Push-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Push-Up/1.jpg"
            ]
          },
          {
            "name": "Dips no chão (bench dips)",
            "exec": "Sente na beirada de um banco, mãos ao lado do quadril, pernas estendidas à frente; desça o corpo flexionando os cotovelos a 90° e empurre de volta.",
            "erro": "Deixar os ombros subirem em direção às orelhas ou descer além dos 90°, sobrecarregando a articulação do ombro."
          },
          {
            "name": "Flexão com toque no ombro alternado",
            "exec": "Na posição de prancha alta, execute uma flexão e, no topo, toque o ombro oposto com a mão contrária, alternando os lados.",
            "erro": "Balançar excessivamente o quadril de um lado para o outro ao tocar o ombro, perdendo a estabilidade do core."
          },
          {
            "name": "Flexão com elevação de perna",
            "exec": "Realize a flexão tradicional e, ao subir, eleve uma perna estendida atrás do corpo, alternando a cada repetição.",
            "erro": "Elevar a perna arqueando a lombar em vez de manter o quadril neutro e estável.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Push-up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Push-up/1.jpg"
            ]
          },
          {
            "name": "Pseudo planche push-up",
            "exec": "Incline o corpo à frente com as mãos giradas e os dedos apontando para os pés, cotovelos próximos ao tronco, e realize a flexão nessa posição inclinada.",
            "erro": "Não inclinar o corpo o suficiente para frente, transformando o exercício em uma flexão tradicional sem ênfase no deltoide anterior."
          },
          {
            "name": "Flexão com fechamento e abertura de mãos (wide-close push-up)",
            "exec": "Alterne repetições com as mãos na largura dos ombros e repetições com as mãos próximas formando um diamante, dentro da mesma série.",
            "erro": "Não ajustar o cotovelo à largura da pegada, mantendo o mesmo padrão de movimento independente da posição das mãos.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/1.jpg"
            ]
          },
          {
            "name": "Flexão com resistência elástica",
            "exec": "Passe uma faixa elástica pelas costas e segure as pontas sob as mãos apoiadas no chão; realize a flexão vencendo a resistência extra na fase de subida.",
            "erro": "Usar uma faixa com tensão excessiva que force a compensação da lombar para completar o movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clock_Push-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clock_Push-Up/1.jpg"
            ]
          },
          {
            "name": "Flexão pliométrica com afastamento das mãos",
            "exec": "Realize uma flexão explosiva impulsionando o corpo para cima até as mãos saírem do chão, aterrissando com as mãos mais afastadas que a largura inicial.",
            "erro": "Aterrissar com os cotovelos travados e rígidos, sem amortecer o impacto flexionando levemente os braços.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/1.jpg"
            ]
          }
        ]
      },
      "puxar": {
        "label": "Puxar (Pull)",
        "exercises": [
          {
            "name": "Barra fixa pegada pronada",
            "exec": "Pegada afastada, puxe o corpo até o queixo passar da barra e desça controlado.",
            "erro": "Usar embalo do corpo (kipping) em vez de força controlada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Rear_Pull-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Rear_Pull-Up/1.jpg"
            ]
          },
          {
            "name": "Barra fixa pegada supinada (chin-up)",
            "exec": "Pegada na largura dos ombros com palmas voltadas para você, puxe até o queixo passar da barra.",
            "erro": "Não descer totalmente entre as repetições.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocky_Pull-Ups_Pulldowns/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocky_Pull-Ups_Pulldowns/1.jpg"
            ]
          },
          {
            "name": "Remada invertida em anel ou barra baixa",
            "exec": "Deitado sob a barra/anéis, corpo reto, puxe o peito em direção ao ponto de apoio.",
            "erro": "Deixar o quadril cair, perdendo o alinhamento do corpo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row_with_Straps/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row_with_Straps/1.jpg"
            ]
          },
          {
            "name": "Barra fixa negativa (fase excêntrica)",
            "exec": "Suba com ajuda (pulo ou banco) e desça o mais devagar possível controlando o movimento.",
            "erro": "Descer rápido demais, perdendo o estímulo excêntrico."
          },
          {
            "name": "Puxada escapular (scapular pull)",
            "exec": "Pendurado na barra com braços estendidos, eleve o corpo só com as escápulas, sem flexionar o cotovelo.",
            "erro": "Já flexionar o cotovelo no início, pulando a ativação escapular.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Remada com toalha presa na porta",
            "exec": "Toalha presa em um ponto fixo, incline o corpo para trás e puxe o tronco em direção às mãos.",
            "erro": "Não manter o corpo reto durante a puxada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Row/1.jpg"
            ]
          },
          {
            "name": "Australian pull-up com pés elevados",
            "exec": "Corpo sob uma barra baixa com pés elevados em um banco, puxe o peito em direção à barra.",
            "erro": "Deixar o quadril cair durante a puxada."
          },
          {
            "name": "Progressão para muscle-up (pull-up explosivo + transição)",
            "exec": "Puxe a barra de forma explosiva levando o peito acima dela e comece a rotacionar os punhos para a transição.",
            "erro": "Tentar sem força suficiente de puxada, arriscando lesão no ombro."
          },
          {
            "name": "Barra fixa pegada neutra (paralela)",
            "exec": "Segure a barra com as palmas voltadas uma para a outra e puxe o corpo até o queixo ultrapassar a barra, controlando a descida.",
            "erro": "Usar impulso das pernas ou balanço do tronco (kipping) fora de um treino técnico de muscle-up."
          },
          {
            "name": "Remada australiana com pegada alternada",
            "exec": "Deitado sob uma barra baixa, segure com uma mão pronada e outra supinada, puxe o peito em direção à barra mantendo o corpo reto.",
            "erro": "Deixar o quadril flexionar ou cair durante a puxada, perdendo a linha reta do corpo.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Row/1.jpg"
            ]
          },
          {
            "name": "Puxada na barra com elástico assistido",
            "exec": "Prenda uma faixa elástica na barra e apoie um joelho ou pé nela para reduzir a carga; execute a barra fixa completa com essa assistência.",
            "erro": "Escolher uma faixa com resistência excessiva que elimine todo o esforço muscular do movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Underhand_Cable_Pulldowns/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Underhand_Cable_Pulldowns/1.jpg"
            ]
          },
          {
            "name": "Remada invertida com pés na parede (feet-elevated)",
            "exec": "Em uma barra baixa ou anéis, apoie os pés em uma parede ou banco alto e puxe o peito em direção ao ponto de apoio das mãos.",
            "erro": "Permitir que os cotovelos se abram demais lateralmente, reduzindo o recrutamento das costas em favor do ombro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/1.jpg"
            ]
          },
          {
            "name": "Barra fixa com pausa isométrica no topo",
            "exec": "Puxe o corpo até o queixo passar da barra e mantenha essa posição por 2 a 3 segundos antes de descer controladamente.",
            "erro": "Relaxar a tensão na pausa, deixando o corpo 'pendurar' em vez de manter os músculos das costas ativos."
          },
          {
            "name": "Puxada com toalha em porta (towel row) unilateral",
            "exec": "Prenda uma toalha na porta e puxe com um braço de cada vez, mantendo o corpo inclinado e estável, apoiando os pés firmes no chão.",
            "erro": "Girar excessivamente o tronco durante a puxada unilateral em vez de manter o quadril e ombros alinhados."
          },
          {
            "name": "Flexão de braço invertida na barra (barra baixa, corpo horizontal)",
            "exec": "Posicione-se sob uma barra na altura do quadril, corpo reto como uma prancha, e puxe o peito até a barra alternando o foco em dorsal.",
            "erro": "Não manter o corpo em linha reta, deixando o quadril cair antes de completar a puxada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up/1.jpg"
            ]
          },
          {
            "name": "Escalada de corda (progressão no chão)",
            "exec": "Sentado ou deitado, simule o puxão de uma corda vertical usando uma faixa elástica presa acima, puxando alternadamente com os braços.",
            "erro": "Puxar apenas com os braços sem envolver a contração escapular no início de cada puxada."
          },
          {
            "name": "Remada em anéis com rotação externa (row to external rotation)",
            "exec": "Puxe o corpo em anéis até o peito e, no topo, rotacione os antebraços para fora antes de retornar à posição inicial.",
            "erro": "Executar a rotação apenas com o punho em vez de rodar o ombro, perdendo o benefício para o manguito rotador.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation_with_Cable/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation_with_Cable/1.jpg"
            ]
          },
          {
            "name": "Puxada declinada com faixa elástica (face pull adaptado)",
            "exec": "Prenda a faixa em um ponto alto, puxe em direção ao rosto abrindo os cotovelos para os lados, focando na parte alta das costas e deltoide posterior.",
            "erro": "Puxar em direção ao peito em vez do rosto, reduzindo a ativação da musculatura posterior do ombro."
          }
        ]
      },
      "pernas": {
        "label": "Pernas (Legs)",
        "exercises": [
          {
            "name": "Agachamento livre (peso corporal)",
            "exec": "Pés na largura dos ombros, desça flexionando quadril e joelhos até pelo menos 90° e suba controlado.",
            "erro": "Deixar os joelhos colapsarem para dentro.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/1.jpg"
            ]
          },
          {
            "name": "Afundo (lunge) sem peso",
            "exec": "Dê um passo à frente e desça o joelho de trás quase tocando o chão, suba controlado.",
            "erro": "Deixar o joelho da frente ultrapassar muito a ponta do pé de forma instável.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Pass_Through/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Pass_Through/1.jpg"
            ]
          },
          {
            "name": "Agachamento búlgaro sem peso",
            "exec": "Pé de trás elevado em banco, desça o joelho da frente controlando o equilíbrio.",
            "erro": "Apoiar peso excessivo no pé de trás.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Single-Leg_Split_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Single-Leg_Split_Squat/1.jpg"
            ]
          },
          {
            "name": "Pistol squat assistido",
            "exec": "Em uma perna só, com apoio (parede ou objeto), desça o mais controlado possível e suba.",
            "erro": "Perder o equilíbrio e compensar com o tronco em vez de controlar com a perna."
          },
          {
            "name": "Agachamento sumô sem peso",
            "exec": "Pés bem afastados e apontados para fora, desça mantendo o tronco ereto.",
            "erro": "Deixar os joelhos colapsarem para dentro na subida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Bands/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Bands/1.jpg"
            ]
          },
          {
            "name": "Elevação de panturrilha em pé (peso corporal)",
            "exec": "Em pé, eleve os calcanhares o máximo possível e desça controlado.",
            "erro": "Fazer o movimento com amplitude curta.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/1.jpg"
            ]
          },
          {
            "name": "Ponte de glúteo unilateral",
            "exec": "Deitado, uma perna apoiada e a outra estendida, eleve o quadril contraindo o glúteo.",
            "erro": "Girar o quadril durante o movimento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/1.jpg"
            ]
          },
          {
            "name": "Agachamento com salto (jump squat)",
            "exec": "Desça em agachamento e salte explosivamente, aterrissando de forma controlada.",
            "erro": "Aterrissar com os joelhos travados.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/1.jpg"
            ]
          },
          {
            "name": "Afundo búlgaro com salto (sem peso)",
            "exec": "Com o pé de trás apoiado em um banco, desça em afundo e suba explodindo em um pequeno salto, trocando de perna a cada repetição ou por série.",
            "erro": "Aterrissar com o joelho da frente travado ou projetado muito à frente da linha dos dedos do pé.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squats/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squats/1.jpg"
            ]
          },
          {
            "name": "Agachamento cossaco (cossack squat)",
            "exec": "Em pé com pernas bem afastadas, desloque o peso para um lado flexionando esse joelho e mantendo a perna oposta estendida, alternando os lados.",
            "erro": "Perder a base de apoio deixando o calcanhar da perna flexionada subir do chão.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jefferson_Squats/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jefferson_Squats/1.jpg"
            ]
          },
          {
            "name": "Elevação de quadril unilateral (single-leg hip thrust)",
            "exec": "Apoie as costas em um banco, uma perna estendida no ar e a outra com o pé no chão; eleve o quadril contraindo o glúteo do lado de apoio.",
            "erro": "Hiperextender a lombar no topo do movimento em vez de finalizar o movimento com contração glútea."
          },
          {
            "name": "Step-up em banco alto",
            "exec": "Suba em um banco ou caixa alta com uma perna, estendendo completamente o quadril e joelho no topo, e desça controladamente.",
            "erro": "Impulsionar o corpo com a perna de apoio no chão em vez de usar a força da perna que sobe.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Step-up_with_Knee_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Step-up_with_Knee_Raise/1.jpg"
            ]
          },
          {
            "name": "Agachamento com pausa (pause squat)",
            "exec": "Desça ao agachamento livre e mantenha a posição inferior por 2 a 3 segundos antes de subir explosivamente.",
            "erro": "Relaxar a tensão do core durante a pausa, perdendo a postura da coluna na posição mais baixa.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_with_Bands/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_with_Bands/1.jpg"
            ]
          },
          {
            "name": "Afundo lateral (lateral lunge) sem peso",
            "exec": "Dê um passo largo para o lado, flexionando o joelho desse lado e mantendo a perna oposta estendida, depois retorne ao centro.",
            "erro": "Inclinar o tronco excessivamente para frente em vez de manter o peito ereto durante o deslocamento lateral.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Rear_Lunge/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Rear_Lunge/1.jpg"
            ]
          },
          {
            "name": "Elevação de panturrilha unilateral em degrau",
            "exec": "Apoie a ponta de um pé na borda de um degrau, deixando o calcanhar descer abaixo da linha do degrau, e suba na ponta do pé.",
            "erro": "Reduzir a amplitude não descendo o calcanhar abaixo do degrau, limitando o alongamento da panturrilha."
          },
          {
            "name": "Wall sit (cadeira na parede)",
            "exec": "Encoste as costas na parede e deslize até os joelhos formarem 90°, mantendo a posição isométrica pelo tempo determinado.",
            "erro": "Posicionar os joelhos à frente dos tornozelos, sobrecarregando a articulação do joelho."
          },
          {
            "name": "Agachamento com elevação de calcanhar (heel-elevated squat)",
            "exec": "Posicione os calcanhares sobre um anteparo de alguns centímetros e realize o agachamento, permitindo maior profundidade e ênfase no quadríceps.",
            "erro": "Deixar os joelhos colapsarem para dentro (valgo) durante a descida.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_with_Chains/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_with_Chains/1.jpg"
            ]
          },
          {
            "name": "Corrida com elevação de joelhos em afundo (lunge walk)",
            "exec": "Realize afundos alternados avançando para frente a cada passo, como uma caminhada, mantendo o tronco ereto.",
            "erro": "Dar passos muito curtos que limitam a flexão do joelho e reduzem a ativação glútea.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elevated_Back_Lunge/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elevated_Back_Lunge/1.jpg"
            ]
          }
        ]
      },
      "core": {
        "label": "Core",
        "exercises": [
          {
            "name": "Prancha frontal",
            "exec": "Apoiado nos antebraços e pontas dos pés, mantenha o corpo reto e alinhado por tempo determinado.",
            "erro": "Deixar o quadril subir ou cair, perdendo o alinhamento.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"
            ]
          },
          {
            "name": "Prancha lateral — Calistenia",
            "exec": "Apoiado no antebraço lateralmente, mantenha o corpo alinhado por tempo determinado.",
            "erro": "Deixar o quadril cair durante a execução."
          },
          {
            "name": "Abdominal bicicleta",
            "exec": "Deitado, alterne levando o cotovelo em direção ao joelho oposto de forma controlada.",
            "erro": "Fazer o movimento rápido demais, perdendo a contração.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Reverse_Crunch/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Reverse_Crunch/1.jpg"
            ]
          },
          {
            "name": "Elevação de pernas suspenso (na barra)",
            "exec": "Pendurado na barra, eleve as pernas estendidas ou flexionadas até a horizontal ou mais.",
            "erro": "Usar embalo do corpo em vez de força abdominal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Leg_Raises/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Leg_Raises/1.jpg"
            ]
          },
          {
            "name": "Mountain climber",
            "exec": "Em posição de prancha, alterne levando os joelhos em direção ao peito rapidamente.",
            "erro": "Deixar o quadril subir muito alto, perdendo a posição de prancha.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain_Climbers/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain_Climbers/1.jpg"
            ]
          },
          {
            "name": "Superman (extensão lombar)",
            "exec": "Deitado de bruços, eleve simultaneamente braços e pernas contraindo a lombar e os glúteos.",
            "erro": "Elevar demais, hiperestendendo a coluna de forma desconfortável."
          },
          {
            "name": "Dead bug",
            "exec": "Deitado, braços e pernas para cima, estenda um braço e a perna oposta sem deixar a lombar arquear.",
            "erro": "Deixar a lombar descolar do chão durante o movimento."
          },
          {
            "name": "Hollow body hold",
            "exec": "Deitado, eleve levemente ombros e pernas do chão formando uma leve curva, mantendo a lombar colada no chão.",
            "erro": "Deixar a lombar arquear e descolar do chão."
          },
          {
            "name": "Prancha com toque no calcanhar (heel tap plank)",
            "exec": "Na posição de prancha frontal, alterne tocando cada calcanhar com a mão do mesmo lado, girando levemente o quadril.",
            "erro": "Deixar o quadril subir muito alto para facilitar o alcance ao calcanhar, perdendo a tensão abdominal.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"
            ]
          },
          {
            "name": "Russian twist (giro russo)",
            "exec": "Sentado com o tronco levemente inclinado para trás e pés apoiados ou elevados, gire o tronco de um lado para o outro tocando o chão ao lado do quadril.",
            "erro": "Girar apenas os braços sem rotacionar o tronco, retirando o trabalho dos oblíquos."
          },
          {
            "name": "Prancha com puxada de joelho (knee tuck plank)",
            "exec": "Na posição de prancha alta, traga um joelho em direção ao cotovelo do mesmo lado e retorne à posição inicial, alternando.",
            "erro": "Arredondar as costas ao trazer o joelho para frente em vez de manter a coluna neutra.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Straight-Arm_Pulldown/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Straight-Arm_Pulldown/1.jpg"
            ]
          },
          {
            "name": "Abdominal em V (V-up)",
            "exec": "Deitado, eleve simultaneamente pernas e tronco formando um V, tentando tocar os pés com as mãos, e retorne controladamente.",
            "erro": "Usar impulso e balanço em vez de contração abdominal controlada para elevar o tronco e as pernas.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch_-_Legs_On_Exercise_Ball/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch_-_Legs_On_Exercise_Ball/1.jpg"
            ]
          },
          {
            "name": "Prancha com rotação (thread the needle)",
            "exec": "Da posição de prancha lateral ou quatro apoios, passe um braço por baixo do corpo rotacionando o tronco, e retorne à posição inicial.",
            "erro": "Deixar o quadril cair durante a rotação, perdendo a estabilidade da coluna lombar."
          },
          {
            "name": "Elevação de pernas deitado (lying leg raise)",
            "exec": "Deitado de costas, mãos ao lado do corpo, eleve as pernas estendidas até 90° e desça sem tocar o chão completamente.",
            "erro": "Arquear a lombar tirando-a do chão ao descer as pernas em vez de manter a região lombar apoiada.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/1.jpg"
            ]
          },
          {
            "name": "Prancha com deslocamento (plank walk-out)",
            "exec": "Em pé, incline o tronco à frente apoiando as mãos no chão, caminhe com as mãos até a prancha alta e retorne andando até ficar em pé novamente.",
            "erro": "Flexionar os joelhos durante a caminhada das mãos em vez de manter as pernas o mais estendidas possível."
          },
          {
            "name": "Ab wheel rollout (roda abdominal) apoiado nos joelhos",
            "exec": "Ajoelhado, segure a roda abdominal e role para frente estendendo o corpo o máximo possível sem encostar o quadril no chão, depois retorne.",
            "erro": "Deixar a lombar hiperestender (arquear) ao estender o corpo além do controle abdominal disponível.",
            "gif": [
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/0.jpg",
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/1.jpg"
            ]
          },
          {
            "name": "Prancha lateral com rotação de quadril (hip dip)",
            "exec": "Na prancha lateral, abaixe e suba o quadril próximo ao chão repetidamente, mantendo o corpo alinhado.",
            "erro": "Girar o tronco para frente ou para trás durante o movimento em vez de manter o corpo em um único plano."
          },
          {
            "name": "Flutter kick (tesoura de pernas)",
            "exec": "Deitado de costas com a lombar apoiada, eleve levemente as pernas estendidas e alterne batidas curtas para cima e para baixo.",
            "erro": "Elevar as pernas muito alto, retirando a tensão do abdômen inferior e transferindo o esforço para o flexor de quadril."
          }
        ]
      }
    }
  }
};

export type WorkoutType = SharedWorkoutType;

export const WORKOUT_TYPES: Record<WorkoutTypeKey, WorkoutType> = {
  musculacao: { key: "musculacao", label: "🏋️ Musculação", groups: MUSCLE_GROUPS },
  calistenia: {
    key: "calistenia",
    label: "🤸 Calistenia",
    groups: CALIST_GROUPS,
    // Calisthenics here is organized by movement pattern, not by the day's
    // scheduled muscle groups — always show the single "calistenia" pseudo
    // group (with its push/pull/legs/core portions) regardless of which
    // groups `split.week[selectedDay]` lists. See TreinoBoard.tsx's
    // `renderGroups` for how this is consumed.
    alwaysGroups: ["calistenia"],
  },
};

export type SplitKey = "full_body" | "upper_lower" | "abc" | "abcde" | "ppl";

export type Split = SharedSplit;

export const SPLITS: Record<SplitKey, Split> = {
  "full_body": {
    "label": "Full Body (3x/semana)",
    "desc": "Corpo inteiro em cada sessão, ideal para iniciantes ou quem treina poucas vezes por semana.",
    "week": {
      "seg": [
        "peito",
        "costas",
        "ombro",
        "quadriceps",
        "posterior",
        "abdomen",
        "antebraco"
      ],
      "ter": null,
      "qua": [
        "peito",
        "costas",
        "ombro",
        "quadriceps",
        "posterior",
        "abdomen",
        "antebraco"
      ],
      "qui": null,
      "sex": [
        "peito",
        "costas",
        "ombro",
        "quadriceps",
        "posterior",
        "abdomen",
        "antebraco"
      ],
      "sab": null,
      "dom": null
    }
  },
  "upper_lower": {
    "label": "Upper / Lower (4 dias)",
    "desc": "Divide entre membros superiores e inferiores, com descanso entre os blocos.",
    "week": {
      "seg": [
        "peito",
        "costas",
        "ombro",
        "biceps",
        "triceps",
        "antebraco"
      ],
      "ter": [
        "quadriceps",
        "posterior",
        "gluteos",
        "panturrilha",
        "abdomen"
      ],
      "qua": null,
      "qui": [
        "peito",
        "costas",
        "ombro",
        "biceps",
        "triceps",
        "antebraco"
      ],
      "sex": [
        "quadriceps",
        "posterior",
        "gluteos",
        "panturrilha",
        "abdomen"
      ],
      "sab": null,
      "dom": null
    }
  },
  "abc": {
    "label": "ABC (3 dias, com descanso)",
    "desc": "Três treinos divididos por grupos musculares, repetidos ao longo da semana com descanso.",
    "week": {
      "seg": [
        "peito",
        "triceps",
        "ombro"
      ],
      "ter": null,
      "qua": [
        "costas",
        "biceps",
        "antebraco"
      ],
      "qui": null,
      "sex": [
        "quadriceps",
        "posterior",
        "gluteos",
        "panturrilha",
        "abdomen"
      ],
      "sab": null,
      "dom": null
    }
  },
  "abcde": {
    "label": "ABCDE (5 dias seguidos)",
    "desc": "Um grupo muscular principal por dia, cinco dias seguidos, para máximo volume e foco.",
    "week": {
      "seg": [
        "peito"
      ],
      "ter": [
        "costas",
        "antebraco"
      ],
      "qua": [
        "ombro",
        "abdomen"
      ],
      "qui": [
        "biceps",
        "triceps",
        "antebraco"
      ],
      "sex": [
        "quadriceps",
        "posterior",
        "gluteos",
        "panturrilha"
      ],
      "sab": null,
      "dom": null
    }
  },
  "ppl": {
    "label": "Push / Pull / Legs (6 dias)",
    "desc": "Empurrar, puxar e pernas repetidos duas vezes por semana, com um dia de descanso.",
    "week": {
      "seg": [
        "peito",
        "ombro",
        "triceps"
      ],
      "ter": [
        "costas",
        "biceps",
        "antebraco"
      ],
      "qua": [
        "quadriceps",
        "posterior",
        "gluteos",
        "panturrilha",
        "abdomen"
      ],
      "qui": [
        "peito",
        "ombro",
        "triceps"
      ],
      "sex": [
        "costas",
        "biceps",
        "antebraco"
      ],
      "sab": [
        "quadriceps",
        "posterior",
        "gluteos",
        "panturrilha",
        "abdomen"
      ],
      "dom": null
    }
  }
};

export const DEFAULT_REST_SECONDS = 60;

/** Stable per-exercise key used as `workout_log_entries.exercise_id`. */
export function exerciseId(
  dayKey: DayKey,
  typeKey: WorkoutTypeKey,
  groupKey: MuscleGroupKey,
  name: string,
  portionKey?: string
): string {
  return sharedExerciseId(dayKey, typeKey, groupKey, name, portionKey);
}
