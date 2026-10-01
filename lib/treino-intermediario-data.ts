/**
 * Static reference data for the "treino-intermediario" (Intermediário tier)
 * workout module, ported verbatim from the prototype
 * (projeto_fenix_app_final.html, the treino-intermediario IIFE around lines
 * 6876-7906): MUSCLE_GROUPS, CALIST_GROUPS, WORKOUT_TYPES and SPLITS.
 * Pure reference content (exercise pool + weekly split templates) — see
 * treino-basico-data.ts for the shared shape and treino-shared-types.ts for
 * the interfaces reused across tiers.
 */

import {
  type Exercise,
  type MuscleGroup,
  type DayKey,
  type DayInfo,
  DAYS,
  type WorkoutTypeKey,
  type WorkoutType as SharedWorkoutType,
  type Split as SharedSplit,
  exerciseId as sharedExerciseId,
} from "./treino-shared-types";

export type { Exercise, MuscleGroup, DayKey, DayInfo, WorkoutTypeKey };
export { DAYS };

export type MuscleGroupKey =
  | "peito"
  | "costas"
  | "ombro"
  | "biceps"
  | "triceps"
  | "quadriceps"
  | "posterior"
  | "gluteos"
  | "panturrilha"
  | "abdomen"
  | "antebraco";

// ===================== POOL DE EXERCÍCIOS — MUSCULAÇÃO =====================
export const MUSCLE_GROUPS: Record<MuscleGroupKey, MuscleGroup> = {
  "peito": {
    "label": "Peito",
    "exercises": [
      {
        "name": "Supino reto com barra",
        "exec": "Retração escapular antes de descer, barra toca o peito na linha dos mamilos, cotovelos a ~45° do tronco.",
        "erro": "Quicar a barra no peito ou perder a retração escapular no meio da série.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_with_Chains/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_with_Chains/1.jpg"
        ]
      },
      {
        "name": "Supino inclinado com barra",
        "exec": "Banco a 30-45°, barra desce até a parte superior do peito, sem estufar demais a lombar.",
        "erro": "Inclinar o banco além de 45°, transferindo o trabalho para o ombro.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/1.jpg"
        ]
      },
      {
        "name": "Supino declinado com barra",
        "exec": "Pés travados, barra desce à linha inferior do peito, trajetória levemente diagonal.",
        "erro": "Amplitude curta por medo da carga, perdendo estímulo na porção inferior.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/1.jpg"
        ]
      },
      {
        "name": "Supino reto com halteres",
        "exec": "Halteres descem até o alongamento confortável do peito, trajetória em arco, sem travar cotovelo com força no topo.",
        "erro": "Deixar os halteres 'colidirem' de forma descontrolada no topo do movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/1.jpg"
        ]
      },
      {
        "name": "Supino inclinado com halteres",
        "exec": "Mesmo padrão do reto, banco inclinado, foco na contração no topo antes de descer devagar.",
        "erro": "Usar impulso das pernas/quadril para ajudar a subir o peso.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Grip_Incline_DB_Bench_Press/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Grip_Incline_DB_Bench_Press/1.jpg"
        ]
      },
      {
        "name": "Crucifixo com halteres (banco reto)",
        "exec": "Cotovelos levemente flexionados o tempo todo, abertura até sentir alongamento, sem descer além do confortável no ombro.",
        "erro": "Estender totalmente o cotovelo, transformando o crucifixo em supino disfarçado.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/1.jpg"
        ]
      },
      {
        "name": "Crucifixo inclinado com halteres",
        "exec": "Mesmo padrão do crucifixo reto, banco a 30°, foco na porção superior do peito.",
        "erro": "Carga alta demais, forçando compensação do ombro na descida.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes/1.jpg"
        ]
      },
      {
        "name": "Crossover no cabo (polia alta)",
        "exec": "Leve inclinação de tronco à frente, cabos cruzam abaixo da linha do umbigo, contração final com braços quase estendidos.",
        "erro": "Fazer o movimento só com os braços, sem inclinar o tronco para ativar o peito.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/1.jpg"
        ]
      },
      {
        "name": "Crossover no cabo (polia baixa)",
        "exec": "Puxada de baixo para cima e para dentro, foco na porção superior/clavicular do peito.",
        "erro": "Usar as costas para 'jogar' o peso em vez de controlar com o peito.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Crossover/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Crossover/1.jpg"
        ]
      },
      {
        "name": "Peck deck (crucifixo na máquina)",
        "exec": "Cotovelos na altura do ombro, junta as almofadas na frente do corpo, pausa de 1s na contração.",
        "erro": "Deixar o corpo saltar do banco para ajudar a fechar o movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/1.jpg"
        ]
      },
      {
        "name": "Supino máquina (press na máquina)",
        "exec": "Ajuste do banco para que os manípulos fiquem na linha do peito, empurre em trajetória controlada.",
        "erro": "Assento mal ajustado, tirando o ângulo correto de empurrada.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/1.jpg"
        ]
      },
      {
        "name": "Flexão de braço tradicional",
        "exec": "Corpo reto da cabeça aos pés, mãos pouco além da largura dos ombros, peito quase toca o chão.",
        "erro": "Cotovelos abertos a 90° do tronco, sobrecarregando o ombro.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Push-up/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Push-up/1.jpg"
        ]
      },
      {
        "name": "Flexão declinada (pés elevados)",
        "exec": "Pés apoiados num banco/step, corpo reto, mesma trajetória da flexão tradicional com mais ênfase na porção superior.",
        "erro": "Deixar o quadril subir para compensar a dificuldade extra.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/1.jpg"
        ]
      },
      {
        "name": "Flexão com pegada fechada",
        "exec": "Mãos próximas, cotovelos colados ao tronco na descida, foco extra em tríceps e peito interno.",
        "erro": "Abrir os cotovelos igual à flexão tradicional, perdendo o estímulo desejado.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/1.jpg"
        ]
      },
      {
        "name": "Pullover com halter",
        "exec": "Deitado transversalmente no banco, halter desce atrás da cabeça em arco, cotovelos levemente flexionados fixos.",
        "erro": "Dobrar e esticar o cotovelo durante o movimento em vez de mantê-lo fixo.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Dumbbell_Pullover/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Dumbbell_Pullover/1.jpg"
        ]
      },
      {
        "name": "Supino com pegada fechada (barra)",
        "exec": "Pegada na largura dos ombros ou pouco menor, cotovelos próximos ao tronco na descida.",
        "erro": "Pegada excessivamente fechada, forçando o punho.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_Powerlifting/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_Powerlifting/1.jpg"
        ]
      },
      {
        "name": "Chest press unilateral no cabo",
        "exec": "Um braço de cada vez, tronco estável, empurra à frente controlando a rotação do tronco.",
        "erro": "Girar o tronco para ajudar a empurrar em vez de isolar o peito."
      },
      {
        "name": "Fly no cabo em pé (cable fly de pé)",
        "exec": "Postura atlética, leve inclinação à frente, braços se encontram à frente do peito em arco.",
        "erro": "Usar as pernas e o quadril para gerar impulso.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Cable_Flye/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Cable_Flye/1.jpg"
        ]
      }
    ]
  },
  "costas": {
    "label": "Costas",
    "exercises": [
      {
        "name": "Remada curvada com barra",
        "exec": "Tronco a ~45°, barra puxa em direção ao umbigo/abdômen baixo, cotovelos próximos ao corpo.",
        "erro": "Erguer o tronco a cada repetição, transformando a remada num movimento de lombar.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/1.jpg"
        ]
      },
      {
        "name": "Remada curvada com halteres (unilateral)",
        "exec": "Apoio de joelho e mão no banco, halter puxa junto ao quadril, cotovelo passa perto das costelas.",
        "erro": "Girar o tronco durante a puxada em vez de manter os ombros paralelos ao chão."
      },
      {
        "name": "Puxada frontal pegada aberta",
        "exec": "Puxa até a linha do queixo/peito superior, cotovelos apontando para baixo e ligeiramente atrás.",
        "erro": "Usar o peso do corpo jogando-se para trás em vez de puxar com as costas.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Lat_Pulldown/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Lat_Pulldown/1.jpg"
        ]
      },
      {
        "name": "Puxada frontal pegada supinada",
        "exec": "Pegada na largura dos ombros, puxada até o peito, contração forte das costas no final.",
        "erro": "Puxar majoritariamente com o bíceps, sem ativar o latíssimo.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/1.jpg"
        ]
      },
      {
        "name": "Puxada frontal pegada neutra",
        "exec": "Barra em V ou pegada neutra, trajetória reta até o peito superior.",
        "erro": "Amplitude incompleta, parando muito antes do peito.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Front_Lat_Pulldown/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Front_Lat_Pulldown/1.jpg"
        ]
      },
      {
        "name": "Barra fixa (pull-up)",
        "exec": "Pegada pronada além da largura dos ombros, sobe até o queixo passar a barra, desce controlado até extensão quase total.",
        "erro": "Fazer meia repetição (kipping excessivo) para completar mais reps.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scapular_Pull-Up/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scapular_Pull-Up/1.jpg"
        ]
      },
      {
        "name": "Remada baixa no cabo (triângulo)",
        "exec": "Tronco ereto, puxa o triângulo até o abdômen, escápulas se aproximam no final.",
        "erro": "Balançar o tronco para frente e para trás para gerar impulso.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/1.jpg"
        ]
      },
      {
        "name": "Remada cavalinho (T-bar row)",
        "exec": "Peito apoiado ou tronco inclinado fixo, puxa a barra junto ao corpo, foco na espessura das costas.",
        "erro": "Usar amplitude curta e deixar a lombar assumir o esforço.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/1.jpg"
        ]
      },
      {
        "name": "Remada máquina articulada",
        "exec": "Peito apoiado, puxa os manípulos levando cotovelos atrás do corpo, aperta as escápulas no final.",
        "erro": "Não travar o peito no apoio, deixando o corpo balançar.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Iso_Row/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Iso_Row/1.jpg"
        ]
      },
      {
        "name": "Pulldown com corda",
        "exec": "Puxa a corda até o peito, mãos se afastam levemente no fim do movimento.",
        "erro": "Carga alta demais forçando o corpo inteiro a puxar.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pulldown/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pulldown/1.jpg"
        ]
      },
      {
        "name": "Levantamento terra convencional",
        "exec": "Barra próxima às canelas, quadril e ombros sobem juntos, coluna neutra do início ao fim.",
        "erro": "Arredondar a lombar para 'arrancar' o peso do chão.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Car_Deadlift/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Car_Deadlift/1.jpg"
        ]
      },
      {
        "name": "Face pull no cabo",
        "exec": "Polia na altura dos olhos, puxa a corda em direção ao rosto separando as mãos, cotovelos altos.",
        "erro": "Puxar com os braços baixos, virando um remada em vez de um face pull.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/1.jpg"
        ]
      },
      {
        "name": "Remada unilateral no banco com apoio",
        "exec": "Tronco apoiado num banco inclinado, puxa o halter mantendo o ombro estável, sem rotação do tronco.",
        "erro": "Deixar o ombro subir junto com o cotovelo (encolher) durante a puxada.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/1.jpg"
        ]
      },
      {
        "name": "Puxada máquina articulada (pulldown machine)",
        "exec": "Segura os apoios e puxa em direção ao corpo, peito para frente, sem curvar as costas.",
        "erro": "Curvar as costas para trás tentando puxar mais peso.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/1.jpg"
        ]
      },
      {
        "name": "Encolhimento com barra",
        "exec": "Sobe os ombros em direção às orelhas em linha reta, sem rolar para frente ou para trás.",
        "erro": "Rodar os ombros em círculo em vez de subir e descer.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Shrug/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Shrug/1.jpg"
        ]
      },
      {
        "name": "Remada invertida com barra no smith",
        "exec": "Corpo reto sob a barra, puxa o peito até a barra controlando a descida.",
        "erro": "Deixar o quadril cair, perdendo a linha reta do corpo.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/1.jpg"
        ]
      },
      {
        "name": "Puxada pegada larga na polia alta",
        "exec": "Pegada bem além da largura dos ombros, puxa até a parte superior do peito.",
        "erro": "Amplitude curta por causa da pegada muito aberta limitar o movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Underhand_Cable_Pulldowns/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Underhand_Cable_Pulldowns/1.jpg"
        ]
      },
      {
        "name": "Levantamento terra romeno com barra",
        "exec": "Quadril empurra para trás, barra desliza rente às pernas, joelhos com flexão leve e fixa.",
        "erro": "Dobrar muito os joelhos, transformando o RDL num agachamento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/1.jpg"
        ]
      }
    ]
  },
  "ombro": {
    "label": "Ombro",
    "exercises": [
      {
        "name": "Desenvolvimento militar com barra",
        "exec": "Em pé ou sentado, barra sobe em linha quase vertical à frente do rosto até estender os braços.",
        "erro": "Arquear excessivamente a lombar para compensar a falta de mobilidade de ombro.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/1.jpg"
        ]
      },
      {
        "name": "Desenvolvimento com halteres sentado",
        "exec": "Costas apoiadas, halteres sobem até quase estender o cotovelo, sem bater um no outro no topo.",
        "erro": "Descer os halteres rápido demais, perdendo controle na fase excêntrica.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/1.jpg"
        ]
      },
      {
        "name": "Desenvolvimento Arnold",
        "exec": "Inicia com palmas voltadas para o rosto e gira os punhos conforme sobe, terminando com palmas à frente.",
        "erro": "Fazer a rotação rápido demais, perdendo tensão no ombro anterior.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/1.jpg"
        ]
      },
      {
        "name": "Elevação lateral com halteres",
        "exec": "Cotovelos levemente flexionados, eleva até a altura do ombro, leve inclinação do halter (mindinho mais alto).",
        "erro": "Usar impulso do tronco (balançar) para levantar mais peso do que consegue controlar.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/1.jpg"
        ]
      },
      {
        "name": "Elevação lateral no cabo",
        "exec": "De lado para a polia baixa, eleva o braço mantendo tensão constante do cabo, inclusive na descida.",
        "erro": "Afastar-se demais do aparelho, perdendo o ângulo de resistência correto.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/1.jpg"
        ]
      },
      {
        "name": "Elevação lateral na máquina",
        "exec": "Braços apoiados nas almofadas, eleva controlando também a fase de descida.",
        "erro": "Deixar o peso 'cair' rápido na volta sem controle excêntrico.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Side_Lateral_Raise/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Side_Lateral_Raise/1.jpg"
        ]
      },
      {
        "name": "Elevação frontal com halteres",
        "exec": "Eleva um braço (ou os dois) até a altura do ombro à frente do corpo, sem balançar o tronco.",
        "erro": "Usar embalo do quadril para ajudar a subir o peso.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/1.jpg"
        ]
      },
      {
        "name": "Elevação frontal com barra",
        "exec": "Pegada pronada, eleva a barra até a altura dos ombros mantendo cotovelos quase estendidos.",
        "erro": "Elevar acima da linha do ombro, tirando a tensão do deltoide anterior.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise_And_Pullover/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise_And_Pullover/1.jpg"
        ]
      },
      {
        "name": "Face pull no cabo — Ombro",
        "exec": "Puxa a corda em direção ao rosto separando as mãos, cotovelos na altura dos ombros.",
        "erro": "Puxar com carga alta demais, perdendo a postura ereta.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/1.jpg"
        ]
      },
      {
        "name": "Remada alta com barra",
        "exec": "Pegada na largura dos ombros, cotovelos sobem acima da linha dos punhos, barra sobe rente ao corpo.",
        "erro": "Pegada muito fechada, aumentando o risco de impacto no ombro.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/1.jpg"
        ]
      },
      {
        "name": "Remada alta com halteres",
        "exec": "Mesmo padrão da remada alta com barra, halteres sobem em paralelo rente ao corpo.",
        "erro": "Elevar demais os cotovelos acima da linha dos ombros.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Upright_Row/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Upright_Row/1.jpg"
        ]
      },
      {
        "name": "Crucifixo invertido (peck deck invertido)",
        "exec": "Peito apoiado no aparelho, abre os braços para trás contraindo a parte posterior do ombro.",
        "erro": "Usar amplitude curta e carga alta, tirando o foco do deltoide posterior.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes/1.jpg"
        ]
      },
      {
        "name": "Crucifixo invertido com halteres (bent-over)",
        "exec": "Tronco inclinado à frente, halteres abrem para os lados com leve flexão de cotovelo.",
        "erro": "Erguer o tronco durante o movimento, aliviando o trabalho do ombro.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes_With_External_Rotation/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes_With_External_Rotation/1.jpg"
        ]
      },
      {
        "name": "Desenvolvimento na máquina",
        "exec": "Empurra os manípulos para cima em trajetória guiada, sem travar o cotovelo com força.",
        "erro": "Elevar os ombros em direção às orelhas em vez de empurrar só com o braço.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shoulder_Press/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shoulder_Press/1.jpg"
        ]
      },
      {
        "name": "Encolhimento com halteres",
        "exec": "Sobe os ombros em linha reta em direção às orelhas, pausa breve no topo.",
        "erro": "Girar os ombros em círculo em vez de subir e descer.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shrug/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shrug/1.jpg"
        ]
      },
      {
        "name": "Elevação lateral inclinado (lean-away)",
        "exec": "Apoiado numa estrutura fixa, inclina o corpo para o lado oposto para aumentar a tensão na fase inicial.",
        "erro": "Inclinar tanto que o movimento vira um balanço do tronco.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise_-_With_Bands/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise_-_With_Bands/1.jpg"
        ]
      },
      {
        "name": "Push press com barra",
        "exec": "Usa um pequeno impulso das pernas para iniciar o movimento e completa a extensão dos braços acima da cabeça.",
        "erro": "Depender só das pernas e não completar a extensão do ombro."
      },
      {
        "name": "Elevação Y no cabo baixo",
        "exec": "Cabo baixo, eleva o braço em diagonal formando um 'Y', foco no deltoide posterior/trapézio inferior.",
        "erro": "Fazer o movimento com o braço quase reto e carga alta, perdendo controle."
      }
    ]
  },
  "biceps": {
    "label": "Bíceps",
    "exercises": [
      {
        "name": "Rosca direta com barra reta",
        "exec": "Cotovelos fixos ao lado do corpo, barra sobe até quase a altura do ombro, desce controlada.",
        "erro": "Balançar o corpo para trás e para frente para ajudar a levantar o peso.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca direta com barra W",
        "exec": "Pegada na parte angulada da barra, mesmo padrão da rosca reta, mais confortável para o punho.",
        "erro": "Não estender totalmente o braço na descida, encurtando a amplitude.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_High_Bench_Barbell_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_High_Bench_Barbell_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca alternada com halteres",
        "exec": "Alterna os braços, gira o punho (supinação) conforme sobe.",
        "erro": "Levantar o cotovelo do lado do corpo, tirando o esforço do bíceps.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Alternate_Bicep_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Alternate_Bicep_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca martelo com halteres",
        "exec": "Pegada neutra o tempo todo, cotovelos fixos, sobe até a altura do ombro.",
        "erro": "Girar o punho durante o movimento — a pegada deve ficar neutra.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/1.jpg"
        ]
      },
      {
        "name": "Rosca Scott (barra W)",
        "exec": "Braço apoiado na almofada inclinada, desce até quase estender o cotovelo, sem tirar o braço do apoio.",
        "erro": "Não descer completamente, cortando a amplitude do movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca Scott com halter unilateral",
        "exec": "Mesmo padrão da rosca Scott, um braço de cada vez, foco total no braço que trabalha.",
        "erro": "Girar o tronco para ajudar o braço oposto a compensar.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Preacher_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Preacher_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca concentrada",
        "exec": "Sentado, cotovelo apoiado na parte interna da coxa, sobe o halter isolando o bíceps.",
        "erro": "Tirar o cotovelo do apoio durante o movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/1.jpg"
        ]
      },
      {
        "name": "Rosca no cabo (barra reta)",
        "exec": "Cotovelos parados ao lado do corpo, puxa a barra em direção ao peito.",
        "erro": "Deixar o corpo se inclinar para trás para ajudar a puxar o peso.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/High_Cable_Curls/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/High_Cable_Curls/1.jpg"
        ]
      },
      {
        "name": "Rosca no cabo (corda)",
        "exec": "Puxa a corda separando as mãos perto do topo, foco no pico de contração.",
        "erro": "Usar carga alta demais e perder o controle na descida.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Cable_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Cable_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca 21",
        "exec": "7 repetições parciais na metade inferior, 7 na metade superior e 7 completas, sem pausa entre os blocos.",
        "erro": "Reduzir a carga demais e perder a intensidade nas parciais.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Standing_Barbell_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Standing_Barbell_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca spider (banco inclinado)",
        "exec": "Peito apoiado no banco inclinado, braços pendem à frente, sobe isolando o bíceps sem ajuda do ombro.",
        "erro": "Deixar o ombro se mover para frente e para trás durante a rosca.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drag_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drag_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca inversa com barra",
        "exec": "Pegada pronada, sobe a barra até perto do peito — trabalha também antebraço.",
        "erro": "Usar peso muito alto — essa pegada é naturalmente mais fraca.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca no cross (polia dupla)",
        "exec": "De pé entre as duas polias baixas, sobe os dois braços simultaneamente ou alternando.",
        "erro": "Afastar os cotovelos do corpo para 'ajudar' o movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Preacher_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Preacher_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca com halteres no banco inclinado",
        "exec": "Banco a 45-60°, braços pendem atrás do corpo, aumenta o alongamento do bíceps no início.",
        "erro": "Balançar o ombro para frente para compensar a posição alongada.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca com elástico",
        "exec": "Pisando o elástico, mesmo padrão da rosca direta, tensão crescente conforme sobe.",
        "erro": "Escolher um elástico fraco demais, perdendo o estímulo no topo.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca Zottman",
        "exec": "Sobe com pegada supinada e desce com pegada pronada, trabalhando bíceps e antebraço na mesma repetição.",
        "erro": "Girar o punho rápido demais, perdendo o controle na fase excêntrica.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spider_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spider_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca no cabo unilateral",
        "exec": "Um braço de cada vez na polia baixa, foco total e comparação entre os lados.",
        "erro": "Girar o tronco para ajudar o braço que está trabalhando.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Cable_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Cable_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca com barra atrás do corpo (drag curl)",
        "exec": "A barra sobe rente ao corpo, cotovelos vão para trás em vez de ficarem fixos à frente.",
        "erro": "Fazer a trajetória igual à rosca comum, perdendo o estímulo específico do drag curl.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Finger_Curls/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Finger_Curls/1.jpg"
        ]
      }
    ]
  },
  "triceps": {
    "label": "Tríceps",
    "exercises": [
      {
        "name": "Tríceps testa com barra W",
        "exec": "Deitado, barra desce em direção à testa/topo da cabeça, cotovelos fixos apontando para cima.",
        "erro": "Abrir os cotovelos para os lados durante a descida.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Lying_Triceps_Extension/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Lying_Triceps_Extension/1.jpg"
        ]
      },
      {
        "name": "Tríceps testa com halteres",
        "exec": "Mesmo padrão da testa com barra, halteres permitem maior amplitude e ajuste individual dos braços.",
        "erro": "Deixar os halteres se aproximarem demais da cabeça, perdendo controle.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Dumbbell_Tricep_Extension/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Dumbbell_Tricep_Extension/1.jpg"
        ]
      },
      {
        "name": "Tríceps corda na polia alta",
        "exec": "Cotovelos colados ao corpo, estica os braços separando as mãos no final.",
        "erro": "Afastar os cotovelos do corpo durante a extensão.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/1.jpg"
        ]
      },
      {
        "name": "Tríceps barra reta na polia alta",
        "exec": "Cotovelos fixos, empurra a barra para baixo até quase estender totalmente o braço.",
        "erro": "Usar o peso do corpo para empurrar em vez de isolar o tríceps.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_EZ_Bar_Triceps_Extension/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_EZ_Bar_Triceps_Extension/1.jpg"
        ]
      },
      {
        "name": "Tríceps francês com halter unilateral",
        "exec": "Halter atrás da cabeça, cotovelo aponta para cima e fixo, estica o braço controlado.",
        "erro": "Abrir o cotovelo para o lado durante o movimento."
      },
      {
        "name": "Supino fechado com barra",
        "exec": "Pegada na largura dos ombros, cotovelos próximos ao tronco na descida, foco no tríceps.",
        "erro": "Pegada excessivamente fechada, sobrecarregando o punho.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Barbell_Bench_Press/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Barbell_Bench_Press/1.jpg"
        ]
      },
      {
        "name": "Mergulho em paralelas (dips)",
        "exec": "Tronco ligeiramente inclinado à frente reduz ombro, desce até 90° no cotovelo e empurra de volta.",
        "erro": "Descer além do confortável, forçando demais a articulação do ombro.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ring_Dips/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ring_Dips/1.jpg"
        ]
      },
      {
        "name": "Mergulho no banco",
        "exec": "Mãos na beirada do banco, pernas estendidas à frente, desce dobrando os cotovelos e empurra de volta.",
        "erro": "Descer rápido demais, forçando o ombro além do confortável.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/1.jpg"
        ]
      },
      {
        "name": "Kickback com halteres",
        "exec": "Tronco inclinado, cotovelo fixo e colado ao corpo, estende o braço para trás.",
        "erro": "Balançar o braço em vez de fazer o movimento controlado."
      },
      {
        "name": "Extensão unilateral no cabo",
        "exec": "Um braço de cada vez na polia alta, cotovelo fixo, permite comparar força entre os lados.",
        "erro": "Deixar o cotovelo se afastar do corpo durante o movimento."
      },
      {
        "name": "Tríceps coice no cabo",
        "exec": "Cabo na altura do quadril, estende o braço para trás mantendo o cotovelo alto e fixo.",
        "erro": "Deixar o cotovelo cair durante o movimento, perdendo tensão.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/1.jpg"
        ]
      },
      {
        "name": "Extensão de tríceps na máquina",
        "exec": "Empurra os manípulos para baixo/frente, dependendo do modelo, até quase estender o braço.",
        "erro": "Deixar o peso 'bater' rápido na volta em vez de controlar.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/1.jpg"
        ]
      },
      {
        "name": "Tríceps overhead com corda",
        "exec": "De costas para a polia baixa, corda passa por trás da cabeça, estica os braços para cima.",
        "erro": "Arquear a lombar para compensar a posição do braço acima da cabeça.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Triceps_Extension/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Triceps_Extension/1.jpg"
        ]
      },
      {
        "name": "Push-down com pegada V",
        "exec": "Pegada em V (barra angulada), empurra para baixo até quase estender o braço.",
        "erro": "Usar o tronco para empurrar em vez de isolar o cotovelo."
      },
      {
        "name": "Tríceps na polia com barra reta (pegada supinada)",
        "exec": "Pegada supinada muda o ângulo de trabalho, cotovelos fixos, empurra para baixo.",
        "erro": "Usar carga igual à pegada pronada sem ajustar — essa pegada é mais fraca.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Triceps_Pushdown/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Triceps_Pushdown/1.jpg"
        ]
      },
      {
        "name": "Extensão de tríceps com halter (dois braços)",
        "exec": "Um halter seguro com as duas mãos atrás da cabeça, estica os braços para cima em conjunto.",
        "erro": "Abrir demais os cotovelos para os lados durante o movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Triceps_Press/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Triceps_Press/1.jpg"
        ]
      },
      {
        "name": "Dip máquina (assistida)",
        "exec": "Ajusta o contrapeso conforme a fase de progressão, mesma trajetória dos dips livres.",
        "erro": "Usar assistência excessiva, retirando todo o estímulo do exercício."
      },
      {
        "name": "Tríceps testa na polia baixa (deitado)",
        "exec": "Deitado de frente para a polia baixa, cabo passa por trás da cabeça, estica os braços para cima.",
        "erro": "Levantar o tronco do banco para ajudar a completar o movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Lying_Triceps_Extension/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Lying_Triceps_Extension/1.jpg"
        ]
      }
    ]
  },
  "quadriceps": {
    "label": "Quadríceps",
    "exercises": [
      {
        "name": "Agachamento livre com barra",
        "exec": "Barra apoiada no trapézio, desce até quadril abaixo do joelho, joelhos seguem a direção dos pés.",
        "erro": "Deixar os joelhos 'caírem' para dentro (valgo) na subida com carga.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/1.jpg"
        ]
      },
      {
        "name": "Agachamento frontal com barra",
        "exec": "Barra apoiada nos deltoides anteriores, tronco mais ereto que no agachamento tradicional.",
        "erro": "Deixar os cotovelos caírem, fazendo a barra escorregar para frente.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat/1.jpg"
        ]
      },
      {
        "name": "Agachamento no smith",
        "exec": "Barra guiada, pés um pouco à frente da linha da barra para manter trajetória vertical do tronco.",
        "erro": "Posicionar os pés na mesma linha da barra, perdendo o padrão natural do movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Squat/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Squat/1.jpg"
        ]
      },
      {
        "name": "Leg press 45°",
        "exec": "Pés na largura dos ombros na plataforma, desce até 90° de joelho sem tirar o quadril do banco.",
        "erro": "Descer demais e arredondar a lombar, tirando o apoio do banco.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/1.jpg"
        ]
      },
      {
        "name": "Cadeira extensora",
        "exec": "Tornozelos sob o rolo, estende as pernas com pausa de contração no topo.",
        "erro": "Usar impulso do tronco para completar a extensão.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/1.jpg"
        ]
      },
      {
        "name": "Afundo búlgaro com halteres",
        "exec": "Pé de trás elevado num banco, desce controlando o joelho da frente, halteres nas mãos.",
        "erro": "Deixar o joelho da frente ultrapassar muito a ponta do pé de forma instável.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squat_with_Dumbbells/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squat_with_Dumbbells/1.jpg"
        ]
      },
      {
        "name": "Afundo com halteres (walking lunge)",
        "exec": "Passos alternados à frente, joelho de trás desce quase ao chão a cada passada.",
        "erro": "Dar passos curtos demais, sobrecarregando o joelho da frente.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/1.jpg"
        ]
      },
      {
        "name": "Agachamento sumô com halter/barra",
        "exec": "Pés bem afastados, pontas para fora, tronco ereto, desce mantendo os joelhos na direção dos pés.",
        "erro": "Não abrir os joelhos na mesma direção dos pés durante a descida.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/1.jpg"
        ]
      },
      {
        "name": "Agachamento hack (hack squat machine)",
        "exec": "Costas apoiadas no encosto inclinado, desce controlado até 90°, empurra de volta sem travar o joelho.",
        "erro": "Travar totalmente os joelhos no topo, sobrecarregando a articulação.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/1.jpg"
        ]
      },
      {
        "name": "Passada com barra (barbell lunge)",
        "exec": "Barra nas costas, dá um passo à frente controlando o equilíbrio, volta à posição inicial.",
        "erro": "Usar carga alta antes de dominar bem o equilíbrio do movimento sem peso.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/1.jpg"
        ]
      },
      {
        "name": "Step up com halteres",
        "exec": "Sobe num step/banco com uma perna até ficar em pé sobre ele, desce controlado.",
        "erro": "Usar a perna de trás para 'empurrar' o corpo para cima em vez da perna de apoio.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/1.jpg"
        ]
      },
      {
        "name": "Agachamento goblet",
        "exec": "Halter/anilha junto ao peito, agacha mantendo o tronco ereto, cotovelos passam por dentro dos joelhos.",
        "erro": "Deixar o tronco cair para frente por causa do peso à frente do corpo.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat/1.jpg"
        ]
      },
      {
        "name": "Leg press unilateral",
        "exec": "Uma perna de cada vez na plataforma, controla o equilíbrio e a trajetória do joelho.",
        "erro": "Deixar o joelho colapsar para dentro por falta de estabilidade unilateral."
      },
      {
        "name": "Agachamento com pausa (pause squat)",
        "exec": "Pausa de 2-3s no ponto mais baixo antes de subir, elimina o rebote elástico.",
        "erro": "Relaxar completamente na pausa, perdendo a tensão e a postura.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit_Squats/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit_Squats/1.jpg"
        ]
      },
      {
        "name": "Agachamento búlgaro no smith",
        "exec": "Mesmo padrão do búlgaro livre, barra guiada ajuda no equilíbrio para focar na perna de trabalho.",
        "erro": "Posicionar o pé de apoio longe demais, tirando o ângulo correto do movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Single-Leg_Split_Squat/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Single-Leg_Split_Squat/1.jpg"
        ]
      },
      {
        "name": "Extensora unilateral",
        "exec": "Uma perna de cada vez na cadeira extensora, foco em corrigir desequilíbrios entre os lados.",
        "erro": "Compensar com o tronco em vez de isolar a perna que trabalha.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Leg_Extension/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Leg_Extension/1.jpg"
        ]
      },
      {
        "name": "Agachamento sissy",
        "exec": "Joelhos à frente, tronco reto, desce enquanto os calcanhares saem levemente do chão, foco no quadríceps distal.",
        "erro": "Perder o equilíbrio para trás por falta de apoio ou controle do core.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_Jerk/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_Jerk/1.jpg"
        ]
      },
      {
        "name": "Agachamento com salto (jump squat)",
        "exec": "Agacha e explode para cima saindo do chão, aterrissa suave flexionando os joelhos.",
        "erro": "Aterrissar com as pernas travadas, sobrecarregando joelhos e tornozelos.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Squat/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Squat/1.jpg"
        ]
      }
    ]
  },
  "posterior": {
    "label": "Posterior de Coxa",
    "exercises": [
      {
        "name": "Levantamento terra romeno (RDL) com barra",
        "exec": "Joelhos com flexão leve e fixa, quadril empurra para trás, barra desliza rente às pernas.",
        "erro": "Dobrar os joelhos como num agachamento em vez de dobrar pelo quadril.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift_from_Deficit/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift_from_Deficit/1.jpg"
        ]
      },
      {
        "name": "Stiff com barra",
        "exec": "Pernas quase estendidas, desce mantendo a barra colada às pernas, para no ponto de alongamento máximo confortável.",
        "erro": "Arredondar a lombar para 'ganhar' mais amplitude.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Barbell_Deadlift/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Barbell_Deadlift/1.jpg"
        ]
      },
      {
        "name": "Stiff com halteres",
        "exec": "Mesmo padrão do stiff com barra, halteres pendem ao lado das pernas na descida.",
        "erro": "Deixar os halteres se afastarem do corpo, perdendo alavanca e postura.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Dumbbell_Deadlift/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Dumbbell_Deadlift/1.jpg"
        ]
      },
      {
        "name": "Cadeira flexora",
        "exec": "Tornozelos sob o rolo, traz o calcanhar em direção ao glúteo com controle.",
        "erro": "Levantar o quadril do banco durante o movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/1.jpg"
        ]
      },
      {
        "name": "Mesa flexora",
        "exec": "Deitado de bruços, dobra os joelhos trazendo os calcanhares em direção ao bumbum.",
        "erro": "Fazer o movimento rápido demais, perdendo controle na volta.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/1.jpg"
        ]
      },
      {
        "name": "Flexora em pé unilateral",
        "exec": "Apoiado no aparelho, dobra o joelho de uma perna de cada vez com controle total.",
        "erro": "Inclinar o quadril para o lado para 'ajudar' o movimento."
      },
      {
        "name": "Levantamento terra romeno com halteres",
        "exec": "Mesmo padrão do RDL com barra, halteres permitem maior amplitude e ajuste unilateral.",
        "erro": "Deixar os halteres colidirem nas canelas por falta de controle.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/1.jpg"
        ]
      },
      {
        "name": "Good morning com barra",
        "exec": "Barra nas costas, quadril dobra para trás mantendo a coluna neutra, tronco desce até quase paralelo.",
        "erro": "Usar carga alta antes de dominar bem o movimento sem peso.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/1.jpg"
        ]
      },
      {
        "name": "Flexora sentado",
        "exec": "Sentado, tornozelos apoiados à frente do rolo, flexiona o joelho trazendo o calcanhar para baixo do banco.",
        "erro": "Usar impulso do tronco para completar o movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ball_Leg_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ball_Leg_Curl/1.jpg"
        ]
      },
      {
        "name": "Terra romeno unilateral com halter",
        "exec": "Uma perna de apoio, halter na mão oposta, tronco desce enquanto a perna livre sobe atrás, equilíbrio controlado.",
        "erro": "Girar o quadril para o lado em vez de mantê-lo alinhado."
      },
      {
        "name": "Glute-ham raise (GHR) na máquina",
        "exec": "Quadril e joelho trabalham juntos para elevar o tronco de volta à posição ereta com controle.",
        "erro": "Usar impulso brusco em vez de controlar toda a fase excêntrica.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Ham_Raise/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Ham_Raise/1.jpg"
        ]
      },
      {
        "name": "Nordic curl assistido",
        "exec": "Joelhos fixos, desce o tronco à frente controlando com os posteriores, com ajuda de banda ou parceiro.",
        "erro": "Cair sem controle na fase final por falta de força excêntrica ainda."
      },
      {
        "name": "Stiff unilateral com halter",
        "exec": "Uma perna de apoio, halter na mesma mão ou oposta, quadril dobra mantendo a coluna neutra.",
        "erro": "Perder o alinhamento do quadril tentando manter o equilíbrio."
      },
      {
        "name": "Cabo flexão de perna deitado",
        "exec": "Deitado de bruços, cabo preso no tornozelo, flexiona o joelho trazendo o calcanhar ao glúteo.",
        "erro": "Levantar o quadril do banco durante a flexão.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clock_Push-Up/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clock_Push-Up/1.jpg"
        ]
      },
      {
        "name": "Levantamento terra sumô",
        "exec": "Pés bem afastados, pegada entre as pernas, quadril e ombros sobem juntos com coluna neutra.",
        "erro": "Deixar os joelhos colapsarem para dentro na subida.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Bands/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Bands/1.jpg"
        ]
      },
      {
        "name": "Ponte de glúteo com barra (hip thrust)",
        "exec": "Costas apoiadas num banco, barra sobre o quadril, empurra o quadril para cima até a extensão total.",
        "erro": "Hiperestender a lombar no topo em vez de travar com o glúteo.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/1.jpg"
        ]
      },
      {
        "name": "Elevação de quadril unilateral com halter",
        "exec": "Uma perna estendida, halter sobre o quadril, eleva usando só a perna apoiada.",
        "erro": "Girar o quadril para o lado da perna estendida."
      },
      {
        "name": "Flexora deitado unilateral na máquina",
        "exec": "Uma perna de cada vez, foco total em corrigir desequilíbrios de força entre os lados.",
        "erro": "Compensar com o tronco em vez de isolar o posterior de coxa."
      }
    ]
  },
  "gluteos": {
    "label": "Glúteos",
    "exercises": [
      {
        "name": "Hip thrust com barra",
        "exec": "Escápulas apoiadas no banco, barra sobre o quadril, empurra até a extensão total travando o glúteo.",
        "erro": "Hiperestender a lombar no topo em vez de travar com o glúteo.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/1.jpg"
        ]
      },
      {
        "name": "Ponte de glúteo com barra",
        "exec": "Costas no chão, barra sobre o quadril, eleva apertando o glúteo no topo.",
        "erro": "Empurrar com a lombar em vez de apertar o glúteo para subir o quadril.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/1.jpg"
        ]
      },
      {
        "name": "Agachamento sumô com halter/barra — Glúteos",
        "exec": "Pés bem afastados, pontas para fora, ativa bastante o glúteo além do quadríceps.",
        "erro": "Não descer o suficiente, encurtando a amplitude do movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Chains/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Chains/1.jpg"
        ]
      },
      {
        "name": "Abdução de quadril na máquina",
        "exec": "Pernas apoiadas por dentro das almofadas, abre contra a resistência com pausa na abertura máxima.",
        "erro": "Usar impulso do tronco para ajudar a abrir as pernas.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/1.jpg"
        ]
      },
      {
        "name": "Coice no cabo (cable kickback)",
        "exec": "Cabo no tornozelo, leva a perna para trás apertando o glúteo, joelho levemente flexionado.",
        "erro": "Arquear muito a lombar para ganhar mais amplitude aparente.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/1.jpg"
        ]
      },
      {
        "name": "Afundo búlgaro com halteres — Glúteos",
        "exec": "Pé de trás elevado, desce controlando o joelho da frente, foco em glúteo e quadríceps.",
        "erro": "Colocar o apoio alto demais antes de dominar o equilíbrio do movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squat_with_Dumbbells/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squat_with_Dumbbells/1.jpg"
        ]
      },
      {
        "name": "Passada lateral com elástico",
        "exec": "Elástico nos joelhos ou tornozelos, dá passos laterais mantendo leve flexão de joelho.",
        "erro": "Ficar muito ereto, tirando a tensão contínua do glúteo médio.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Sprint/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Sprint/1.jpg"
        ]
      },
      {
        "name": "Cadeira abdutora",
        "exec": "Sentado, pernas apoiadas por dentro das almofadas, abre contra a resistência controlando a volta.",
        "erro": "Usar amplitude curta e carga alta, perdendo a contração completa.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/1.jpg"
        ]
      },
      {
        "name": "Elevação pélvica unilateral",
        "exec": "Uma perna estendida, eleva o quadril com a perna apoiada, mantendo o quadril nivelado.",
        "erro": "Deixar o lado da perna estendida cair, perdendo o alinhamento do quadril."
      },
      {
        "name": "Step up alto com halteres",
        "exec": "Step ou banco alto, sobe com uma perna até ficar totalmente em pé sobre ele.",
        "erro": "Usar impulso da perna de trás em vez da perna que está no step.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/1.jpg"
        ]
      },
      {
        "name": "Agachamento sumô com kettlebell",
        "exec": "Kettlebell entre as pernas, pés afastados, desce mantendo tronco ereto e joelhos alinhados aos pés.",
        "erro": "Deixar o kettlebell 'puxar' o tronco para frente.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Sumo_Deadlift/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Sumo_Deadlift/1.jpg"
        ]
      },
      {
        "name": "Extensão de quadril no cabo em pé",
        "exec": "De pé, cabo no tornozelo, empurra a perna para trás apertando o glúteo no final.",
        "erro": "Fazer o movimento rápido demais, perdendo o foco no glúteo.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull_Through/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull_Through/1.jpg"
        ]
      },
      {
        "name": "Frog pump (ponte com pés unidos)",
        "exec": "Pés unidos e joelhos abertos, eleva o quadril apertando o glúteo com amplitude curta e controlada.",
        "erro": "Fazer repetições rápidas demais sem pausa de contração no topo."
      },
      {
        "name": "Cross-body glute kickback na máquina",
        "exec": "Perna cruza levemente o corpo e vai para trás e para o lado, ativando o glúteo em ângulo diferente.",
        "erro": "Girar o quadril inteiro em vez de mover só a perna de trabalho."
      },
      {
        "name": "Good morning sumô",
        "exec": "Pés afastados, barra nas costas, quadril dobra para trás mantendo a coluna neutra.",
        "erro": "Perder a postura ereta na volta ao ponto inicial.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Good_Morning/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Good_Morning/1.jpg"
        ]
      },
      {
        "name": "Levantamento terra romeno pegada sumô",
        "exec": "Pés afastados, pegada entre as pernas, quadril dobra para trás mantendo joelhos levemente flexionados.",
        "erro": "Deixar os joelhos colapsarem para dentro durante a descida.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift_from_Deficit/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift_from_Deficit/1.jpg"
        ]
      },
      {
        "name": "Elevação de quadril com banda (banded hip thrust)",
        "exec": "Banda elástica acima dos joelhos durante o hip thrust, adiciona resistência à abdução.",
        "erro": "Deixar os joelhos fecharem para dentro contra a banda."
      },
      {
        "name": "Agachamento com passada lateral (curtsy lunge)",
        "exec": "Uma perna cruza para trás e para o lado, desce controlando o joelho da frente.",
        "erro": "Perder o equilíbrio lateral por falta de controle do core.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/1.jpg"
        ]
      }
    ]
  },
  "panturrilha": {
    "label": "Panturrilha",
    "exercises": [
      {
        "name": "Panturrilha em pé na máquina",
        "exec": "Sobe o máximo possível na ponta dos pés, desce até sentir alongamento leve, pausa breve embaixo.",
        "erro": "Fazer o movimento rápido demais, sem descer completamente entre repetições.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/1.jpg"
        ]
      },
      {
        "name": "Panturrilha sentado na máquina",
        "exec": "Joelhos sob a almofada, sobe na ponta dos pés e desce com controle total.",
        "erro": "Usar amplitude curta, subindo só um pouco a cada repetição.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/1.jpg"
        ]
      },
      {
        "name": "Panturrilha no leg press",
        "exec": "Só a ponta dos pés na plataforma, estende os tornozelos sem mexer os joelhos.",
        "erro": "Deixar os joelhos dobrarem e esticarem junto, tirando o foco da panturrilha.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Over_Floor_Press/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Over_Floor_Press/1.jpg"
        ]
      },
      {
        "name": "Panturrilha em pé com barra",
        "exec": "Barra nas costas, sobe na ponta dos pés com amplitude completa e controlada.",
        "erro": "Usar carga alta demais antes de dominar bem a amplitude do movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocking_Standing_Calf_Raise/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocking_Standing_Calf_Raise/1.jpg"
        ]
      },
      {
        "name": "Panturrilha em pé com halteres",
        "exec": "Halteres ao lado do corpo, sobe na ponta dos pés o máximo possível e desce devagar.",
        "erro": "Apoiar-se com força demais em algo em vez de deixar a panturrilha trabalhar.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Calf_Raise/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Calf_Raise/1.jpg"
        ]
      },
      {
        "name": "Panturrilha unilateral no degrau com halter",
        "exec": "Ponta de um pé na borda de um degrau, halter na mesma mão, alonga embaixo e sobe forte.",
        "erro": "Fazer o movimento com pressa, sem controlar a descida.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/1.jpg"
        ]
      },
      {
        "name": "Panturrilha no smith",
        "exec": "Barra do smith apoiada nos ombros, ponta dos pés numa anilha/step, sobe e desce com amplitude total.",
        "erro": "Usar carga alta antes de dominar bem a amplitude do movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Calf_Raise/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Calf_Raise/1.jpg"
        ]
      },
      {
        "name": "Panturrilha donkey (donkey calf raise)",
        "exec": "Tronco inclinado à frente e apoiado, sobe na ponta dos pés com esse ângulo diferente de trabalho.",
        "erro": "Não descer o suficiente para sentir o alongamento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Donkey_Calf_Raises/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Donkey_Calf_Raises/1.jpg"
        ]
      },
      {
        "name": "Panturrilha sentado com halteres nos joelhos",
        "exec": "Halter apoiado sobre cada joelho, sobe na ponta dos pés e desce devagar.",
        "erro": "Deixar o halter escorregar do joelho por falta de apoio firme.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/1.jpg"
        ]
      },
      {
        "name": "Panturrilha unilateral na máquina em pé",
        "exec": "Uma perna de cada vez, foco em corrigir desequilíbrios entre os lados.",
        "erro": "Compensar com a perna de apoio em vez de isolar a perna de trabalho."
      },
      {
        "name": "Panturrilha isométrica (hold no topo)",
        "exec": "Sobe na ponta dos pés e segura a posição por alguns segundos antes de descer.",
        "erro": "Relaxar durante o hold em vez de manter a contração.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raise_On_A_Dumbbell/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raise_On_A_Dumbbell/1.jpg"
        ]
      },
      {
        "name": "Panturrilha no hack squat",
        "exec": "Só a ponta dos pés na plataforma do hack, estende os tornozelos com amplitude completa.",
        "erro": "Deixar os joelhos participarem do movimento em vez de isolar o tornozelo.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raises_-_With_Bands/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raises_-_With_Bands/1.jpg"
        ]
      },
      {
        "name": "Panturrilha com salto (pliometria leve)",
        "exec": "Pequenos saltos usando principalmente o tornozelo, aterrissagem suave na ponta dos pés.",
        "erro": "Aterrissar com o pé todo achatado, perdendo o estímulo elástico.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/1.jpg"
        ]
      },
      {
        "name": "Panturrilha unilateral no leg press",
        "exec": "Uma perna de cada vez na plataforma, ponta do pé apoiada, controla toda a amplitude.",
        "erro": "Empurrar com o joelho em vez de isolar o tornozelo."
      },
      {
        "name": "Panturrilha com apoio na plataforma da extensora",
        "exec": "Ponta dos pés na plataforma adaptada, sobe e desce controlando a amplitude.",
        "erro": "Usar amplitude curta por instabilidade no apoio improvisado.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/1.jpg"
        ]
      },
      {
        "name": "Panturrilha com elástico",
        "exec": "Elástico sob o antepé, estica o tornozelo contra a resistência crescente.",
        "erro": "Escolher um elástico fraco demais, perdendo o estímulo no fim do movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raises_-_With_Bands/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raises_-_With_Bands/1.jpg"
        ]
      }
    ]
  },
  "abdomen": {
    "label": "Abdômen",
    "exercises": [
      {
        "name": "Prancha com variações (elevação alternada de perna)",
        "exec": "Prancha padrão, eleva uma perna por vez sem deixar o quadril girar ou cair.",
        "erro": "Rodar o quadril para o lado ao levantar a perna."
      },
      {
        "name": "Prancha lateral com elevação de quadril",
        "exec": "Prancha lateral, sobe e desce o quadril controlando a linha do corpo.",
        "erro": "Deixar o quadril cair completamente entre as repetições.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/1.jpg"
        ]
      },
      {
        "name": "Abdominal na máquina (crunch machine)",
        "exec": "Tronco e pernas apoiados nas almofadas, flexiona o tronco contraindo a barriga, com carga progressiva.",
        "erro": "Usar carga alta e puxar com o braço em vez da barriga.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/1.jpg"
        ]
      },
      {
        "name": "Abdominal na polia alta (cable crunch)",
        "exec": "Ajoelhado de frente para a polia alta, flexiona o tronco em direção ao quadril mantendo os quadris fixos.",
        "erro": "Mover o quadril para trás em vez de flexionar a coluna.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Crunch/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Crunch/1.jpg"
        ]
      },
      {
        "name": "Elevação de pernas na barra fixa",
        "exec": "Suspenso na barra, eleva as pernas estendidas (ou joelhos, conforme progressão) até a horizontal ou mais.",
        "erro": "Balançar o corpo (kipping) para 'ajudar' a elevar as pernas.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Pull_Ups/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Pull_Ups/1.jpg"
        ]
      },
      {
        "name": "Elevação de joelhos na barra fixa",
        "exec": "Suspenso na barra, traz os joelhos em direção ao peito controlando o balanço do corpo.",
        "erro": "Usar impulso das pernas para compensar a força abdominal.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Assisted_Pull-Up/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Assisted_Pull-Up/1.jpg"
        ]
      },
      {
        "name": "Roda abdominal (ab wheel rollout)",
        "exec": "Joelhos no chão, rola a roda à frente mantendo o abdômen contraído e a lombar neutra.",
        "erro": "Deixar a lombar arquear ao estender o corpo além do controle.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/1.jpg"
        ]
      },
      {
        "name": "Abdominal infra no banco declinado",
        "exec": "Preso pelos pés no banco declinado, flexiona o quadril elevando o tronco.",
        "erro": "Usar o impulso das pernas em vez da contração abdominal.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Leg_Raises/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Leg_Raises/1.jpg"
        ]
      },
      {
        "name": "Abdominal supra no banco declinado",
        "exec": "Mesmo banco declinado, flexiona só a parte superior do tronco, sem puxar o pescoço.",
        "erro": "Puxar o pescoço com as mãos para ajudar a subir.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tuck_Crunch/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tuck_Crunch/1.jpg"
        ]
      },
      {
        "name": "Rotação de tronco no cabo (woodchopper)",
        "exec": "Polia alta ou baixa, gira o tronco de um lado ao outro mantendo o quadril mais estável.",
        "erro": "Girar o quadril junto com o tronco, tirando o trabalho dos oblíquos.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Wood_Chop/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Wood_Chop/1.jpg"
        ]
      },
      {
        "name": "Prancha com toque no ombro",
        "exec": "Prancha alta (mãos no chão), toca o ombro oposto alternando as mãos sem balançar o quadril.",
        "erro": "Deixar o quadril balançar de um lado para o outro a cada toque.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"
        ]
      },
      {
        "name": "Abdominal bicicleta (bicycle crunch)",
        "exec": "Leva o cotovelo em direção ao joelho oposto alternando os lados, com controle da rotação.",
        "erro": "Fazer o movimento rápido demais, sem realmente girar o tronco.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/1.jpg"
        ]
      },
      {
        "name": "V-up",
        "exec": "Deitado, eleva tronco e pernas ao mesmo tempo formando um 'V', mãos tocam os pés ou próximo deles.",
        "erro": "Usar embalo do corpo em vez de contrair o abdômen para subir."
      },
      {
        "name": "Dragon flag (progressão)",
        "exec": "Apoiado pelos ombros num banco, eleva o corpo reto controlando a descida — usar progressões mais fáceis antes da versão completa.",
        "erro": "Deixar o quadril dobrar durante o movimento em vez de manter o corpo rígido."
      },
      {
        "name": "Prancha com apoio instável (bola suíça)",
        "exec": "Antebraços na bola, mantém o corpo reto controlando o equilíbrio extra.",
        "erro": "Deixar o quadril subir demais para compensar a instabilidade.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"
        ]
      },
      {
        "name": "Elevação de pernas deitado com carga entre os pés",
        "exec": "Deitado, halter leve entre os pés, eleva e desce as pernas sem encostar totalmente no chão.",
        "erro": "Arquear a lombar durante a descida das pernas com carga.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Leg_Raises/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Leg_Raises/1.jpg"
        ]
      },
      {
        "name": "Russian twist com peso",
        "exec": "Tronco levemente inclinado para trás, gira de um lado para o outro segurando um peso.",
        "erro": "Fazer o giro só com os braços, sem envolver o tronco."
      },
      {
        "name": "Stir the pot (prancha com bola suíça)",
        "exec": "Antebraços na bola, faz pequenos círculos com os cotovelos mantendo o corpo estável.",
        "erro": "Deixar o quadril balançar seguindo o movimento dos braços.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/1.jpg"
        ]
      }
    ]
  },
  "antebraco": {
    "label": "Antebraço",
    "exercises": [
      {
        "name": "Rosca de punho com barra",
        "exec": "Antebraços apoiados nas coxas ou num banco, flexiona só o punho para cima.",
        "erro": "Usar o cotovelo para ajudar a levantar a barra.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Palm-Up_Barbell_Wrist_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Palm-Up_Barbell_Wrist_Curl/1.jpg"
        ]
      },
      {
        "name": "Rosca de punho invertida",
        "exec": "Pegada pronada, estende o punho para cima contra a resistência.",
        "erro": "Usar carga alta demais — o extensor do punho é naturalmente mais fraco.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Wrist_Curl_Over_A_Bench/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Wrist_Curl_Over_A_Bench/1.jpg"
        ]
      },
      {
        "name": "Rosca inversa com barra — Antebraço",
        "exec": "Pegada pronada, flexiona o cotovelo trabalhando antebraço e bíceps ao mesmo tempo.",
        "erro": "Balançar o corpo para compensar a carga elevada.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/1.jpg"
        ]
      },
      {
        "name": "Farmer's walk",
        "exec": "Um halter/kettlebell pesado em cada mão, caminha mantendo a postura ereta e o core firme.",
        "erro": "Deixar os ombros caírem para frente durante a caminhada.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/1.jpg"
        ]
      },
      {
        "name": "Fixação na barra (dead hang)",
        "exec": "Suspenso na barra com os braços estendidos, mantém a pegada o máximo de tempo possível.",
        "erro": "Relaxar totalmente os ombros, deixando-os 'afundarem' sem controle.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Clean/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Clean/1.jpg"
        ]
      },
      {
        "name": "Rosca de punho com halteres",
        "exec": "Antebraço apoiado, flexiona só o punho segurando um halter em cada mão.",
        "erro": "Mover o antebraço junto com o punho em vez de mantê-lo fixo.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Palms-Up_Wrist_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Palms-Up_Wrist_Curl/1.jpg"
        ]
      },
      {
        "name": "Extensão de punho com halter",
        "exec": "Pegada pronada, estende o punho para cima com carga leve e controlada.",
        "erro": "Usar carga alta demais para esse movimento naturalmente mais fraco."
      },
      {
        "name": "Pinch grip com anilhas",
        "exec": "Segura duas anilhas juntas pelas bordas lisas só com os dedos, mantém o quanto conseguir.",
        "erro": "Deixar as anilhas escorregarem por falta de aquecimento prévio da pegada."
      },
      {
        "name": "Rosca antebraço no banco Scott invertida",
        "exec": "Braço apoiado, pegada pronada, flexiona o punho controlando toda a amplitude.",
        "erro": "Não descer completamente, cortando a amplitude do movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zottman_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zottman_Curl/1.jpg"
        ]
      },
      {
        "name": "Enrolamento de pulso (wrist roller)",
        "exec": "Enrola a corda com o peso na ponta girando os punhos, sobe e depois desce controlando.",
        "erro": "Usar peso alto demais logo de início, sem construir resistência gradual."
      },
      {
        "name": "Rosca punho unilateral no cabo",
        "exec": "Um braço de cada vez na polia baixa, flexiona só o punho mantendo o antebraço apoiado.",
        "erro": "Mover o cotovelo para ajudar em vez de isolar o punho.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Cable_Curl/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Cable_Curl/1.jpg"
        ]
      },
      {
        "name": "Preensão com hand gripper",
        "exec": "Fecha o gripper com força controlada, sem soltar bruscamente na abertura.",
        "erro": "Soltar rápido demais, perdendo o controle excêntrico."
      },
      {
        "name": "Suspensão na barra com pegada alternada",
        "exec": "Uma mão pronada e outra supinada na barra, mantém a suspensão o máximo de tempo possível.",
        "erro": "Deixar o corpo balançar, gastando energia à toa em vez de focar na pegada."
      },
      {
        "name": "Rosca antebraço com halter apoiado na coxa",
        "exec": "Antebraço apoiado na própria coxa, flexiona o punho com controle total da amplitude.",
        "erro": "Levantar o cotovelo da coxa durante o movimento.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Hammer_Curls/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Hammer_Curls/1.jpg"
        ]
      },
      {
        "name": "Rotação de punho com halter (pronação/supinação)",
        "exec": "Segura a ponta de um halter curto, gira o punho de um lado para o outro controlando o movimento.",
        "erro": "Usar carga alta demais, perdendo o controle da rotação."
      },
      {
        "name": "Farmer's walk unilateral",
        "exec": "Carga pesada só de um lado, caminha resistindo à inclinação lateral do tronco.",
        "erro": "Deixar o tronco inclinar para o lado sem carga em vez de manter-se ereto."
      }
    ]
  }
};

// ===================== POOL DE EXERCÍCIOS — CALISTENIA =====================
export const CALIST_GROUPS: Record<MuscleGroupKey, MuscleGroup> = {
  "peito": {
    "label": "Peito",
    "exercises": [
      {
        "name": "Flexão declinada",
        "exec": "Pés apoiados num banco/step, corpo reto, desce com o peito quase tocando o chão.",
        "erro": "Deixar o quadril subir para compensar a dificuldade extra.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/1.jpg"
        ]
      },
      {
        "name": "Flexão diamante",
        "exec": "Mãos próximas formando um triângulo, cotovelos colados ao corpo na descida, foco em tríceps/peito interno.",
        "erro": "Abrir os cotovelos como numa flexão normal, perdendo o estímulo específico.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Close-Grip/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Close-Grip/1.jpg"
        ]
      },
      {
        "name": "Flexão arqueiro (archer push-up)",
        "exec": "Um braço estende para o lado enquanto o outro flexiona e sustenta o peso do corpo.",
        "erro": "Deixar o quadril girar em vez de manter o corpo alinhado.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up/1.jpg"
        ]
      },
      {
        "name": "Flexão com pés elevados no step",
        "exec": "Pés num step baixo, mesma trajetória da flexão tradicional com ênfase superior no peito.",
        "erro": "Escolher uma altura alta demais antes de estar pronto, comprometendo a forma."
      },
      {
        "name": "Flexão hindu (hindu push-up)",
        "exec": "Movimento fluido entre posição de cobra e cachorro olhando para baixo, trabalha peito, ombro e mobilidade.",
        "erro": "Fazer o movimento rápido demais sem controlar a transição entre as posições.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Push-Up/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Push-Up/1.jpg"
        ]
      }
    ]
  },
  "costas": {
    "label": "Costas",
    "exercises": [
      {
        "name": "Remada australiana",
        "exec": "Corpo reto sob uma barra baixa, puxa o peito até a barra mantendo o alinhamento do corpo.",
        "erro": "Deixar o quadril cair durante a puxada.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Row/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Row/1.jpg"
        ]
      },
      {
        "name": "Remada australiana pegada supinada",
        "exec": "Mesmo padrão da remada australiana, pegada supinada muda o ângulo e recruta mais o bíceps.",
        "erro": "Puxar só com o braço sem envolver as costas.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shotgun_Row/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shotgun_Row/1.jpg"
        ]
      },
      {
        "name": "Barra fixa (pull-up) — Calistenia",
        "exec": "Pegada pronada, sobe até o queixo passar a barra, desce controlado quase à extensão total.",
        "erro": "Fazer meia repetição (kipping excessivo) para completar mais reps.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Rear_Pull-Up/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Rear_Pull-Up/1.jpg"
        ]
      },
      {
        "name": "Barra fixa pegada supinada (chin-up)",
        "exec": "Pegada supinada, recruta mais o bíceps junto com as costas, mesma trajetória da pull-up.",
        "erro": "Usar impulso das pernas para 'ajudar' a subida.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocky_Pull-Ups_Pulldowns/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocky_Pull-Ups_Pulldowns/1.jpg"
        ]
      },
      {
        "name": "Remada invertida com TRX",
        "exec": "Corpo reto, alças na altura ajustável, puxa o peito em direção às mãos.",
        "erro": "Deixar os ombros subirem em direção às orelhas durante a puxada.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row_with_Straps/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row_with_Straps/1.jpg"
        ]
      }
    ]
  },
  "ombro": {
    "label": "Ombro",
    "exercises": [
      {
        "name": "Pike push-up",
        "exec": "Quadril elevado formando um 'V' invertido, desce a cabeça em direção ao chão entre as mãos.",
        "erro": "Deixar o quadril descer, perdendo o ângulo que trabalha o ombro."
      },
      {
        "name": "Flexão pike elevada (pés elevados)",
        "exec": "Pés num banco/step, mesmo padrão do pike push-up, com mais carga no ombro.",
        "erro": "Escolher altura alta demais antes de dominar a versão no chão.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Handstand_Push-Ups/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Handstand_Push-Ups/1.jpg"
        ]
      },
      {
        "name": "Handstand hold com apoio na parede",
        "exec": "Parada de mãos apoiada na parede, mantém a posição controlando a respiração e o alinhamento do corpo.",
        "erro": "Arquear excessivamente as costas para manter o equilíbrio."
      }
    ]
  },
  "biceps": {
    "label": "Bíceps",
    "exercises": [
      {
        "name": "Chin-up (foco bíceps)",
        "exec": "Pegada supinada e mais fechada, sobe focando na contração do bíceps além das costas.",
        "erro": "Usar amplitude parcial para completar mais repetições."
      }
    ]
  },
  "triceps": {
    "label": "Tríceps",
    "exercises": [
      {
        "name": "Mergulho em paralelas (dips) — Calistenia",
        "exec": "Tronco ligeiramente à frente, desce até 90° no cotovelo e empurra de volta.",
        "erro": "Descer além do confortável, forçando demais o ombro.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dip_Machine/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dip_Machine/1.jpg"
        ]
      },
      {
        "name": "Flexão diamante — Tríceps",
        "exec": "Mãos próximas formando um triângulo, cotovelos colados ao corpo, foco extra em tríceps.",
        "erro": "Abrir os cotovelos, perdendo o estímulo específico do exercício.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Stretch/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Stretch/1.jpg"
        ]
      },
      {
        "name": "Dip no banco",
        "exec": "Mãos na beirada do banco, pernas estendidas à frente, desce e sobe controlando o cotovelo.",
        "erro": "Descer rápido demais, forçando o ombro além do confortável."
      }
    ]
  },
  "quadriceps": {
    "label": "Quadríceps",
    "exercises": [
      {
        "name": "Agachamento pistol assistido",
        "exec": "Uma perna estendida à frente, desce com apoio (mão numa estrutura fixa) até onde o controle permitir.",
        "erro": "Descer sem apoio antes de ter força e equilíbrio suficientes.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Squats/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Squats/1.jpg"
        ]
      },
      {
        "name": "Afundo búlgaro (peso corporal)",
        "exec": "Pé de trás elevado num banco, desce controlando o joelho da frente, sem carga extra.",
        "erro": "Deixar o joelho da frente ultrapassar muito a ponta do pé de forma instável.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squats/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squats/1.jpg"
        ]
      },
      {
        "name": "Agachamento com salto (jump squat) — Calistenia",
        "exec": "Agacha e explode para cima saindo do chão, aterrissa suave flexionando os joelhos.",
        "erro": "Aterrissar com as pernas travadas, sobrecarregando as articulações.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Olympic_Squat/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Olympic_Squat/1.jpg"
        ]
      },
      {
        "name": "Afundo caminhando",
        "exec": "Passos alternados à frente, joelho de trás desce quase ao chão a cada passada.",
        "erro": "Dar passos curtos demais, sobrecarregando o joelho da frente.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Pass_Through/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Pass_Through/1.jpg"
        ]
      }
    ]
  },
  "posterior": {
    "label": "Posterior de Coxa",
    "exercises": [
      {
        "name": "Nordic curl negativo",
        "exec": "Joelhos fixos e presos, desce o tronco à frente o mais devagar possível controlando com os posteriores.",
        "erro": "Cair sem controle na fase final por falta de força excêntrica ainda."
      },
      {
        "name": "Ponte de glúteo unilateral",
        "exec": "Uma perna estendida, eleva o quadril usando só a perna apoiada, mantendo o quadril nivelado.",
        "erro": "Girar o quadril para o lado da perna estendida.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/1.jpg"
        ]
      },
      {
        "name": "Glute bridge march",
        "exec": "Na posição de ponte, alterna elevar um joelho de cada vez sem deixar o quadril cair.",
        "erro": "Deixar o quadril balançar de um lado para o outro a cada troca."
      }
    ]
  },
  "gluteos": {
    "label": "Glúteos",
    "exercises": [
      {
        "name": "Ponte de glúteo unilateral — Glúteos",
        "exec": "Uma perna estendida, eleva o quadril com a perna apoiada, aperta o glúteo no topo.",
        "erro": "Girar o quadril para o lado da perna estendida.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/1.jpg"
        ]
      },
      {
        "name": "Hip thrust peso corporal com pausa",
        "exec": "Costas apoiadas num banco, eleva o quadril e segura 2-3s no topo apertando o glúteo.",
        "erro": "Relaxar durante a pausa em vez de manter a contração."
      },
      {
        "name": "Frog pump (peso corporal)",
        "exec": "Pés unidos e joelhos abertos, eleva o quadril com amplitude curta e controlada.",
        "erro": "Fazer repetições rápidas demais sem pausa de contração no topo."
      }
    ]
  },
  "panturrilha": {
    "label": "Panturrilha",
    "exercises": [
      {
        "name": "Panturrilha em pé unilateral (peso corporal)",
        "exec": "Uma perna de cada vez, sobe na ponta do pé com amplitude completa e controlada.",
        "erro": "Fazer rápido demais só para completar mais repetições."
      },
      {
        "name": "Panturrilha com salto (pliometria leve) — Calistenia",
        "exec": "Pequenos saltos usando principalmente o tornozelo, aterrissagem suave na ponta dos pés.",
        "erro": "Aterrissar com o pé todo achatado, perdendo o estímulo elástico.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Calf_Raise/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Calf_Raise/1.jpg"
        ]
      }
    ]
  },
  "abdomen": {
    "label": "Abdômen",
    "exercises": [
      {
        "name": "Prancha com variações (elevação alternada de perna) — Calistenia",
        "exec": "Prancha padrão, eleva uma perna por vez sem deixar o quadril girar ou cair.",
        "erro": "Rodar o quadril para o lado ao levantar a perna."
      },
      {
        "name": "Dragon flag (progressão) — Calistenia",
        "exec": "Apoiado pelos ombros num banco, eleva o corpo reto controlando a descida — usar progressões mais fáceis antes da versão completa.",
        "erro": "Deixar o quadril dobrar durante o movimento em vez de manter o corpo rígido."
      },
      {
        "name": "Hollow body hold",
        "exec": "Deitado, lombar colada ao chão, eleva pernas e ombros formando uma leve curva, mantém a posição.",
        "erro": "Deixar a lombar descolar do chão, perdendo a ativação correta."
      },
      {
        "name": "L-sit (progressão)",
        "exec": "Apoiado em paralelas ou no chão, eleva as pernas estendidas à frente mantendo o tronco ereto.",
        "erro": "Curvar as costas para trás para 'ajudar' a elevar as pernas."
      },
      {
        "name": "Elevação de pernas na barra fixa — Calistenia",
        "exec": "Suspenso na barra, eleva as pernas estendidas (ou joelhos, conforme progressão) até a horizontal.",
        "erro": "Balançar o corpo (kipping) para 'ajudar' a elevar as pernas.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scapular_Pull-Up/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scapular_Pull-Up/1.jpg"
        ]
      }
    ]
  },
  "antebraco": {
    "label": "Antebraço",
    "exercises": [
      {
        "name": "Fixação na barra (dead hang) — Calistenia",
        "exec": "Suspenso na barra com os braços estendidos, mantém a pegada o máximo de tempo possível.",
        "erro": "Relaxar totalmente os ombros, deixando-os 'afundarem' sem controle.",
        "gif": [
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Snatch/0.jpg",
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Snatch/1.jpg"
        ]
      },
      {
        "name": "Fixação com toalha (towel hang)",
        "exec": "Toalha enrolada na barra, segura pelas pontas em vez da barra direto, aumenta a exigência de pegada.",
        "erro": "Escolher uma toalha grossa demais antes de ter pegada suficiente."
      }
    ]
  }
};

export type WorkoutType = SharedWorkoutType;

export const WORKOUT_TYPES: Record<WorkoutTypeKey, WorkoutType> = {
  musculacao: { key: "musculacao", label: "🏋️ Musculação", groups: MUSCLE_GROUPS },
  calistenia: { key: "calistenia", label: "🤸 Calistenia", groups: CALIST_GROUPS },
};

export type SplitKey = "upper_lower" | "abc" | "abcd" | "abcde";

export type Split = SharedSplit;

const UPPER: MuscleGroupKey[] = ["peito", "costas", "ombro", "biceps", "triceps"];
const LOWER: MuscleGroupKey[] = ["quadriceps", "posterior", "gluteos", "panturrilha", "abdomen"];
const ABC_A: MuscleGroupKey[] = ["peito", "triceps", "ombro"];
const ABC_B: MuscleGroupKey[] = ["costas", "biceps", "antebraco"];
const ABC_C: MuscleGroupKey[] = ["quadriceps", "posterior", "gluteos", "panturrilha", "abdomen"];
const ABCD_A: MuscleGroupKey[] = ["peito", "triceps"];
const ABCD_B: MuscleGroupKey[] = ["costas", "biceps", "antebraco"];
const ABCD_C: MuscleGroupKey[] = ["ombro", "abdomen"];
const ABCD_D: MuscleGroupKey[] = ["quadriceps", "posterior", "gluteos", "panturrilha"];
const ABCDE_A: MuscleGroupKey[] = ["peito", "triceps"];
const ABCDE_B: MuscleGroupKey[] = ["costas", "biceps", "antebraco"];
const ABCDE_C: MuscleGroupKey[] = ["ombro", "abdomen"];
const ABCDE_D: MuscleGroupKey[] = ["quadriceps", "panturrilha"];
const ABCDE_E: MuscleGroupKey[] = ["posterior", "gluteos"];

export const SPLITS: Record<SplitKey, Split> = {
  upper_lower: {
    label: "Upper/Lower (4x/semana)",
    desc: "Quatro treinos por semana alternando entre parte superior (peito, costas, ombro, braços) e parte inferior (pernas e abdômen). Boa frequência para ganhar volume sem exagerar em dias consecutivos.",
    week: {
      seg: UPPER.slice(),
      ter: LOWER.slice(),
      qua: null,
      qui: UPPER.slice(),
      sex: LOWER.slice(),
      sab: null,
      dom: null
    }
  },
  abc: {
    label: "ABC (3x/semana)",
    desc: "Três treinos por semana, cada um focado num conjunto diferente de grupos musculares — bom equilíbrio entre volume por sessão e dias de descanso.",
    week: {
      seg: ABC_A.slice(),
      ter: null,
      qua: ABC_B.slice(),
      qui: null,
      sex: ABC_C.slice(),
      sab: null,
      dom: null
    }
  },
  abcd: {
    label: "ABCD (4x/semana)",
    desc: "Quatro treinos por semana, cada um mais específico que o ABC — mais volume por grupo muscular a cada sessão, ideal para quem já tolera bem a frequência do dia a dia.",
    week: {
      seg: ABCD_A.slice(),
      ter: ABCD_B.slice(),
      qua: null,
      qui: ABCD_C.slice(),
      sex: ABCD_D.slice(),
      sab: null,
      dom: null
    }
  },
  abcde: {
    label: "ABCDE (5x/semana)",
    desc: "Cinco treinos por semana, cada um ainda mais focado que o ABCD — menos grupos musculares por sessão. Ideal pra quem prefere treinos mais curtos e frequentes em vez de sessões longas com menos dias.",
    week: {
      seg: ABCDE_A.slice(),
      ter: ABCDE_B.slice(),
      qua: ABCDE_C.slice(),
      qui: ABCDE_D.slice(),
      sex: ABCDE_E.slice(),
      sab: null,
      dom: null
    }
  }
};

export const DEFAULT_REST_SECONDS = 90;

/** Stable per-exercise key used as `workout_log_entries.exercise_id`. */
export function exerciseId(
  dayKey: DayKey,
  typeKey: WorkoutTypeKey,
  groupKey: MuscleGroupKey,
  name: string
): string {
  return sharedExerciseId(dayKey, typeKey, groupKey, name);
}
