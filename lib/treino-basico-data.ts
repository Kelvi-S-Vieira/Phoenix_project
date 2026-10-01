/**
 * Static reference data for the "treino-basico" (Básico tier) workout module,
 * ported verbatim from the prototype (projeto_fenix_app_final.html, the
 * treino-basico IIFE around lines 6169-6880): MUSCLE_GROUPS, CALIST_GROUPS,
 * WORKOUT_TYPES and SPLITS. This is pure reference content (exercise pool +
 * weekly split templates) — it does not need a database table. Only the
 * user's per-day log (checked/sets/reps/load) is dynamic, stored in the
 * `workout_log_entries` table (see supabase/schema.sql).
 *
 * Intermediário/Avançado tiers live in their own sibling modules
 * (treino-intermediario-data.ts, treino-avancado-data.ts), reusing the
 * shared shape from treino-shared-types.ts.
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
  | "abdomen";

// ===================== POOL DE EXERCÍCIOS — MUSCULAÇÃO =====================
export const MUSCLE_GROUPS: Record<MuscleGroupKey, MuscleGroup> = {
    peito: {
      label: "Peito",
      exercises: [
        { name: "Supino reto na máquina", exec: "Sente-se no aparelho com as costas apoiadas no encosto, segure os manípulos na altura do peito e empurre para a frente até quase esticar os braços, sem travar os cotovelos. Volte devagar até a posição inicial.", erro: "Deixar o corpo escorregar para baixo no banco durante o movimento, perdendo o apoio das costas." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/1.jpg"] },
        { name: "Supino inclinado na máquina", exec: "Igual ao supino reto na máquina, mas no aparelho com o banco inclinado — isso trabalha um pouco mais a parte de cima do peito. Empurre para cima e para frente, sem travar os cotovelos.", erro: "Usar uma carga alta demais e arquear o pescoço para trás para ajudar a empurrar." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Incline_Bench_Press/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Incline_Bench_Press/1.jpg"] },
        { name: "Supino com halteres no banco reto", exec: "Deitado no banco, um halter em cada mão na altura do peito, palmas voltadas para os pés. Empurre os dois halteres para cima ao mesmo tempo até quase esticar os braços, depois desça devagar.", erro: "Descer os halteres rápido demais e sem controle, o que pode machucar o ombro." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/1.jpg"] },
        { name: "Crucifixo na máquina (peck deck)", exec: "Sentado no aparelho, com os antebraços apoiados nas almofadas, junte os braços à sua frente como se estivesse abraçando algo. Volte devagar até sentir um alongamento leve no peito.", erro: "Abrir os braços além do confortável, forçando demais o ombro na volta do movimento." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/1.jpg"] },
        { name: "Crossover no cabo (polia alta)", exec: "Em pé entre as duas polias altas, segure um cabo em cada mão e puxe-os para baixo e para frente do corpo, cruzando levemente na altura da cintura. Volte controlando o peso.", erro: "Usar o corpo inteiro para 'jogar' o peso em vez de controlar o movimento só com o peito e o braço." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/1.jpg"] },
        { name: "Flexão de braço apoiada nos joelhos", exec: "Deite de bruços, apoie as mãos no chão na largura dos ombros e os joelhos no chão. Mantenha o corpo reto da cabeça aos joelhos e empurre o chão para cima até quase esticar os braços.", erro: "Deixar o quadril cair ou subir demais, perdendo o alinhamento do corpo." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Push-up/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Push-up/1.jpg"] },
        { name: "Flexão de braço completa", exec: "Igual à flexão apoiada nos joelhos, mas com o corpo todo esticado, apoiado só nas mãos e nas pontas dos pés. Desça até quase encostar o peito no chão e empurre de volta.", erro: "Deixar o quadril 'cair', arqueando a lombar durante o movimento." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/1.jpg"] },
        { name: "Supino declinado na máquina", exec: "No aparelho com o banco levemente inclinado para baixo, empurre os manípulos para cima e para frente, sem travar os cotovelos no topo.", erro: "Ajustar o assento na altura errada, fazendo o movimento sair torto em vez de reto." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/1.jpg"] }
      ]
    },
    costas: {
      label: "Costas",
      exercises: [
        { name: "Puxada frontal na polia (pegada aberta)", exec: "Sentado no aparelho de puxada, segure a barra bem mais aberta que os ombros e puxe-a para baixo até a altura do queixo, levando os cotovelos para baixo e para trás. Volte controlando.", erro: "Puxar a barra atrás da nuca — isso força demais o ombro; sempre puxe pela frente." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Lat_Pulldown/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Lat_Pulldown/1.jpg"] },
        { name: "Puxada frontal pegada supinada", exec: "Mesmo aparelho de puxada, mas com as palmas das mãos voltadas para você, pegada mais fechada. Puxe até a altura do peito, apertando as costas no final.", erro: "Usar só os braços para puxar, sem sentir as costas trabalhando." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/1.jpg"] },
        { name: "Remada baixa no cabo (sentado)", exec: "Sentado no aparelho de remada, pés apoiados na plataforma, puxe o cabo em direção à barriga mantendo as costas retas, sem inclinar o tronco para trás.", erro: "Balançar o tronco para frente e para trás para 'ajudar' a puxar o peso." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/1.jpg"] },
        { name: "Remada na máquina (articulada)", exec: "Sentado com o peito apoiado no aparelho, puxe os manípulos para trás, levando os cotovelos atrás do corpo e apertando as escápulas (as 'omoplatas') no final.", erro: "Não apoiar o peito direito no aparelho, deixando o corpo balançar durante a puxada." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/1.jpg"] },
        { name: "Remada com halteres apoiado no banco", exec: "Com um joelho e uma mão apoiados no banco, segure um halter na outra mão e puxe-o para cima, junto ao corpo, até a altura da cintura. Desça devagar.", erro: "Girar o tronco durante a puxada em vez de manter as costas paralelas ao chão." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Incline_Row/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Incline_Row/1.jpg"] },
        { name: "Pulldown com corda", exec: "No aparelho de puxada com uma corda no lugar da barra, puxe a corda para baixo, abrindo levemente as mãos perto do final do movimento, na altura do peito.", erro: "Usar carga muito alta e puxar com o corpo inteiro em vez das costas." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pulldown/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pulldown/1.jpg"] },
        { name: "Puxada na máquina articulada (pulldown machine)", exec: "Sentado, segure os apoios e puxe-os para baixo em direção ao corpo, mantendo as costas retas e o peito para frente.", erro: "Curvar as costas para trás para tentar puxar mais peso." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/1.jpg"] },
        { name: "Remada invertida com barra baixa (smith ou suporte)", exec: "Deite-se de costas para o chão, embaixo de uma barra fixada baixa (no smith ou num suporte), segure-a com as mãos afastadas na largura dos ombros e puxe o peito em direção à barra, mantendo o corpo reto.", erro: "Deixar o quadril cair durante a puxada, perdendo o corpo alinhado." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/1.jpg"] }
      ]
    },
    ombro: {
      label: "Ombro",
      exercises: [
        { name: "Desenvolvimento na máquina", exec: "Sentado no aparelho, com as costas apoiadas, empurre os manípulos para cima até quase esticar os braços, sem bater os cotovelos com força no topo.", erro: "Levantar os ombros em direção às orelhas em vez de empurrar só com o braço." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shoulder_Press/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shoulder_Press/1.jpg"] },
        { name: "Desenvolvimento com halteres sentado", exec: "Sentado com apoio nas costas, um halter em cada mão na altura dos ombros, empurre os dois para cima ao mesmo tempo até quase esticar os braços.", erro: "Arquear a lombar para ajudar a empurrar o peso." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/1.jpg"] },
        { name: "Elevação lateral com halteres", exec: "Em pé, um halter leve em cada mão ao lado do corpo, eleve os dois braços para os lados até a altura dos ombros, com os cotovelos levemente dobrados. Desça devagar.", erro: "Usar impulso do corpo (balançar) para levantar o peso em vez de controlar com o ombro." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/1.jpg"] },
        { name: "Elevação frontal com halteres", exec: "Em pé, halteres à frente das coxas, eleve um braço de cada vez (ou os dois juntos) até a altura dos ombros, à sua frente. Desça controlando.", erro: "Levantar o peso rápido demais, usando embalo do corpo." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/1.jpg"] },
        { name: "Elevação lateral na máquina", exec: "Sentado no aparelho, com os braços apoiados nas almofadas, eleve os braços para os lados controlando também a descida.", erro: "Deixar o peso 'cair' rápido na volta, sem controlar." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Side_Lateral_Raise/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Side_Lateral_Raise/1.jpg"] },
        { name: "Encolhimento de ombros com halteres", exec: "Em pé, um halter em cada mão ao lado do corpo, suba os ombros em direção às orelhas e depois desça devagar. Trabalha a região entre pescoço e ombro (trapézio).", erro: "Girar os ombros em círculo em vez de só subir e descer." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shrug/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shrug/1.jpg"] },
        { name: "Elevação lateral no cabo", exec: "De lado para a polia baixa, segure o cabo com a mão mais distante e eleve o braço lateralmente até a altura do ombro. Troque de lado depois.", erro: "Afastar-se demais do aparelho, perdendo o ângulo correto de puxada." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/1.jpg"] },
        { name: "Face pull no cabo (posterior do ombro)", exec: "Na polia alta com uma corda, puxe-a em direção ao rosto separando as mãos, mantendo os cotovelos na altura dos ombros.", erro: "Puxar com carga alta demais e perder a postura ereta." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/1.jpg"] }
      ]
    },
    biceps: {
      label: "Bíceps",
      exercises: [
        { name: "Rosca direta com halteres", exec: "Em pé, um halter em cada mão, palmas voltadas para frente, dobre os cotovelos levando os halteres em direção aos ombros. Desça devagar.", erro: "Balançar o corpo para trás e para frente para ajudar a levantar o peso." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/1.jpg"] },
        { name: "Rosca alternada com halteres", exec: "Igual à rosca direta, mas alternando um braço de cada vez, com as palmas girando para cima conforme o braço sobe.", erro: "Levantar o cotovelo do lado do corpo, tirando o esforço do bíceps." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Alternate_Bicep_Curl/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Alternate_Bicep_Curl/1.jpg"] },
        { name: "Rosca no aparelho Scott", exec: "Sentado com os braços apoiados na almofada inclinada, dobre os cotovelos levando o peso em direção ao ombro, sem tirar o braço do apoio.", erro: "Não descer o braço até o final do movimento, encurtando a amplitude." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drag_Curl/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drag_Curl/1.jpg"] },
        { name: "Rosca no cabo (barra reta)", exec: "Em pé, de frente para a polia baixa, segure a barra e dobre os cotovelos puxando-a em direção ao peito, mantendo os cotovelos parados ao lado do corpo.", erro: "Deixar o corpo se inclinar para trás para ajudar a puxar o peso." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/High_Cable_Curls/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/High_Cable_Curls/1.jpg"] },
        { name: "Rosca martelo com halteres", exec: "Em pé, halteres com as palmas voltadas uma para a outra (como se fossem segurar um martelo), dobre os cotovelos levando o peso até o ombro.", erro: "Girar o punho durante o movimento — na rosca martelo a pegada fica neutra o tempo todo." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/1.jpg"] },
        { name: "Rosca concentrada sentado", exec: "Sentado, cotovelo apoiado na parte interna da coxa, segure o halter e dobre o braço levando-o em direção ao ombro. Faça um lado de cada vez.", erro: "Tirar o cotovelo do apoio da coxa durante o movimento." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/1.jpg"] },
        { name: "Rosca na polia baixa (corda)", exec: "De frente para a polia baixa com uma corda, dobre os cotovelos puxando a corda em direção aos ombros, mantendo os cotovelos parados.", erro: "Usar carga alta demais e perder o controle na descida." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Cable_Curl/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Cable_Curl/1.jpg"] },
        { name: "Rosca inversa com barra", exec: "Em pé, segure a barra com as palmas voltadas para baixo e dobre os cotovelos levando a barra até perto do peito. Trabalha também o antebraço.", erro: "Usar peso muito alto — essa pegada é naturalmente mais fraca que a pegada normal." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/1.jpg"] }
      ]
    },
    triceps: {
      label: "Tríceps",
      exercises: [
        { name: "Tríceps na polia alta (corda)", exec: "De frente para a polia alta com uma corda, cotovelos colados ao corpo, estique os braços para baixo até quase travar os cotovelos, depois volte devagar.", erro: "Afastar os cotovelos do corpo durante o movimento." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/1.jpg"] },
        { name: "Tríceps na polia alta (barra reta)", exec: "Igual ao anterior, mas com uma barra reta no lugar da corda. Empurre a barra para baixo até quase esticar os braços.", erro: "Usar o peso do corpo para empurrar em vez de isolar o tríceps." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Triceps_Pushdown/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Triceps_Pushdown/1.jpg"] },
        { name: "Tríceps francês com halter sentado", exec: "Sentado, segure um halter com as duas mãos atrás da cabeça, cotovelos apontando para cima, e estique os braços para cima devagar.", erro: "Abrir demais os cotovelos para os lados durante o movimento." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Overhead_Triceps_Extension/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Overhead_Triceps_Extension/1.jpg"] },
        { name: "Tríceps testa com halteres deitado", exec: "Deitado no banco, halteres esticados acima do peito, dobre só os cotovelos descendo o peso em direção à testa, depois estique de volta.", erro: "Mexer o ombro durante o movimento — só o cotovelo deve dobrar." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Dumbbell_Tricep_Extension/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Dumbbell_Tricep_Extension/1.jpg"] },
        { name: "Mergulho no banco (apoio de braços)", exec: "Sente na beirada de um banco, mãos apoiadas ao lado do corpo, pernas esticadas à frente. Desça o corpo dobrando os cotovelos e suba de volta empurrando o banco.", erro: "Descer rápido demais, forçando o ombro além do confortável." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ring_Dips/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ring_Dips/1.jpg"] },
        { name: "Extensão de tríceps unilateral no cabo", exec: "De lado para a polia alta, segure o cabo com uma mão e estique o braço para baixo, um lado de cada vez.", erro: "Deixar o cotovelo se afastar do corpo durante o movimento." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_One_Arm_Tricep_Extension/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_One_Arm_Tricep_Extension/1.jpg"] },
        { name: "Tríceps coice com halteres (kickback)", exec: "Incline o tronco à frente, cotovelo dobrado e colado ao corpo, estique o braço para trás até ficar reto, depois volte devagar.", erro: "Balançar o braço em vez de fazer o movimento controlado." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Kickback/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Kickback/1.jpg"] },
        { name: "Tríceps na máquina (extensão)", exec: "Sentado no aparelho, empurre os manípulos para baixo (ou para frente, dependendo do modelo) até quase esticar os braços.", erro: "Deixar o peso 'bater' rápido na volta ao invés de controlar." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/1.jpg"] }
      ]
    },
    quadriceps: {
      label: "Quadríceps",
      exercises: [
        { name: "Agachamento livre (peso corporal)", exec: "Pés na largura dos ombros, desça como se fosse sentar numa cadeira, mantendo o peito para cima e o peso nos calcanhares, até as coxas ficarem paralelas ao chão (ou o quanto for confortável). Suba de volta.", erro: "Deixar os joelhos 'caírem' para dentro durante a descida." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/1.jpg"] },
        { name: "Agachamento no smith (barra guiada)", exec: "Com a barra apoiada na parte de trás dos ombros, agache como no agachamento livre — a barra guiada ajuda a manter o equilíbrio, ótimo para quem está aprendendo o movimento.", erro: "Posicionar os pés muito à frente ou muito atrás da linha da barra, tirando o equilíbrio do movimento." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Squat/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Squat/1.jpg"] },
        { name: "Leg press 45°", exec: "Sentado no aparelho, pés na plataforma na largura dos ombros, dobre os joelhos trazendo a plataforma em direção ao corpo, depois empurre de volta sem travar os joelhos.", erro: "Travar totalmente os joelhos no topo do movimento, sobrecarregando a articulação." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/1.jpg"] },
        { name: "Cadeira extensora", exec: "Sentado no aparelho, com os tornozelos apoiados no rolo, estique as pernas até ficarem retas e desça devagar.", erro: "Usar impulso das costas ou do tronco para completar o movimento." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/1.jpg"] },
        { name: "Agachamento com halter (goblet squat)", exec: "Segure um halter (ou uma anilha) junto ao peito com as duas mãos e agache mantendo o tronco ereto, o halter ajuda a manter o equilíbrio.", erro: "Deixar o tronco cair para frente por causa do peso na frente do corpo." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squat/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squat/1.jpg"] },
        { name: "Afundo (passada estática)", exec: "Dê um passo à frente, desça dobrando os dois joelhos até formarem dois ângulos de 90 graus, e volte à posição inicial empurrando com a perna da frente.", erro: "Deixar o joelho da frente ultrapassar muito a ponta do pé, perdendo o equilíbrio." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Sprint/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Sprint/1.jpg"] },
        { name: "Passada caminhando com halteres", exec: "Segurando um halter em cada mão, dê passos à frente alternando as pernas, descendo o joelho de trás quase até o chão a cada passo.", erro: "Dar passos muito curtos, o que sobrecarrega o joelho da frente." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/1.jpg"] },
        { name: "Agachamento sumô com halter", exec: "Pés bem afastados, pontas viradas para fora, segure um halter com as duas mãos entre as pernas e agache mantendo o tronco ereto.", erro: "Não abrir os joelhos na mesma direção dos pés durante a descida." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/1.jpg"] },
        { name: "Step up (subida no step ou banco baixo)", exec: "Suba em um step ou banco baixo com uma perna, empurrando o corpo para cima até ficar em pé sobre ele, depois desça controlado. Alterne as pernas.", erro: "Usar a perna de trás para 'empurrar' e subir, em vez de fazer a força só com a perna que está no step." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Step_Ups/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Step_Ups/1.jpg"] }
      ]
    },
    posterior: {
      label: "Posterior de Coxa",
      exercises: [
        { name: "Cadeira flexora", exec: "Sentado ou deitado no aparelho, com os tornozelos apoiados no rolo, dobre os joelhos trazendo o rolo em direção ao corpo, depois volte devagar.", erro: "Levantar o quadril do banco durante o movimento." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/1.jpg"] },
        { name: "Mesa flexora", exec: "Deitado de bruços no aparelho, tornozelos sob o rolo, dobre os joelhos trazendo os calcanhares em direção ao bumbum.", erro: "Fazer o movimento rápido demais, perdendo o controle na volta." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/1.jpg"] },
        { name: "Stiff com halteres (carga leve)", exec: "Em pé, halteres à frente das coxas, incline o tronco para frente mantendo as costas retas e os joelhos levemente dobrados, descendo o peso até sentir alongar atrás da coxa. Volte subindo o tronco.", erro: "Arredondar as costas durante a descida — mantenha a coluna sempre reta." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Dumbbell_Deadlift/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Dumbbell_Deadlift/1.jpg"] },
        { name: "Levantamento terra romeno na máquina", exec: "Se disponível na academia, siga o mesmo padrão do stiff, mas guiado pelo aparelho, o que ajuda a manter a postura correta enquanto você aprende o movimento.", erro: "Descer além do confortável só para 'ganhar amplitude', perdendo a postura." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/1.jpg"] },
        { name: "Flexora em pé unilateral (máquina)", exec: "Em pé, apoiado no aparelho, com o tornozelo sob o rolo, dobre o joelho trazendo o calcanhar em direção ao bumbum, uma perna de cada vez.", erro: "Inclinar o quadril para o lado para 'ajudar' o movimento." },
        { name: "Ponte de glúteo (foco no posterior)", exec: "Deitado de costas, joelhos dobrados e pés apoiados no chão, eleve o quadril apertando o bumbum e a parte de trás da coxa, depois desça devagar.", erro: "Arquear demais a lombar no topo do movimento em vez de usar o quadril." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/1.jpg"] },
        { name: "Good morning com barra leve", exec: "Com uma barra bem leve apoiada nos ombros (ou sem peso no começo), incline o tronco à frente mantendo as costas retas, como no stiff, mas com a barra nas costas.", erro: "Usar carga antes de dominar bem o movimento sem peso — comece sem barra." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/1.jpg"] },
        { name: "Flexora deitado unilateral", exec: "Deitado de bruços no aparelho, dobre uma perna de cada vez trazendo o calcanhar em direção ao bumbum.", erro: "Levantar o quadril do banco para compensar a falta de força." }
      ]
    },
    gluteos: {
      label: "Glúteos",
      exercises: [
        { name: "Ponte de glúteo", exec: "Deitado de costas, joelhos dobrados, pés apoiados no chão na largura do quadril, eleve o quadril apertando bem o bumbum no topo, depois desça devagar.", erro: "Empurrar com a lombar em vez de apertar o glúteo para subir o quadril." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/1.jpg"] },
        { name: "Elevação pélvica com apoio no banco", exec: "Com as costas apoiadas na beirada de um banco e os pés no chão, eleve o quadril até o corpo formar uma linha reta dos ombros aos joelhos.", erro: "Não apoiar bem as escápulas no banco, perdendo o equilíbrio." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/1.jpg"] },
        { name: "Abdução de quadril na máquina (cadeira abdutora)", exec: "Sentado no aparelho, com as pernas apoiadas por dentro das almofadas, abra as pernas para os lados contra a resistência, depois volte devagar.", erro: "Usar impulso do tronco para ajudar a abrir as pernas." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/1.jpg"] },
        { name: "Coice na polia baixa (glúteo)", exec: "De pé, de frente para o aparelho, com o cabo preso no tornozelo, leve a perna para trás mantendo o joelho levemente dobrado, apertando o glúteo no final.", erro: "Arquear muito a lombar para ganhar mais amplitude no movimento." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/1.jpg"] },
        { name: "Agachamento sumô", exec: "Pés bem afastados e virados para fora, agache mantendo o tronco ereto — essa postura ativa bastante o glúteo além da coxa.", erro: "Não descer o suficiente, fazendo um movimento muito curto." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Bands/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Bands/1.jpg"] },
        { name: "Afundo com apoio (búlgaro facilitado)", exec: "Com o pé de trás apoiado num banco baixo (ou só no chão, se preferir mais fácil), desça dobrando o joelho da frente e suba de volta.", erro: "Colocar o apoio muito alto antes de estar confortável com o equilíbrio do movimento." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/1.jpg"] },
        { name: "Extensão de quadril no cabo (coice em pé)", exec: "Em pé, segurando um apoio para o equilíbrio, com o cabo preso no tornozelo, empurre a perna para trás apertando o glúteo.", erro: "Fazer o movimento rápido demais, perdendo o controle e o foco no glúteo." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull_Through/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull_Through/1.jpg"] },
        { name: "Passada lateral com mini elástico", exec: "Com um elástico leve ao redor das pernas, na altura dos joelhos ou tornozelos, dê passos para o lado mantendo uma leve flexão nos joelhos.", erro: "Ficar muito ereto, sem manter os joelhos levemente dobrados, o que tira a tensão do glúteo." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Pass_Through/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Pass_Through/1.jpg"] }
      ]
    },
    panturrilha: {
      label: "Panturrilha",
      exercises: [
        { name: "Panturrilha em pé na máquina", exec: "Em pé no aparelho, com os ombros sob as almofadas e a ponta dos pés na plataforma, suba o máximo possível na ponta dos pés e desça até sentir um alongamento leve.", erro: "Fazer o movimento muito rápido, sem descer completamente entre uma repetição e outra." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/1.jpg"] },
        { name: "Panturrilha sentado na máquina", exec: "Sentado, com os joelhos sob a almofada e a ponta dos pés na plataforma, suba na ponta dos pés e desça devagar.", erro: "Usar amplitude curta, subindo só um pouquinho a cada repetição." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/1.jpg"] },
        { name: "Panturrilha no leg press", exec: "No aparelho de leg press, com só a ponta dos pés apoiada na plataforma, estique os tornozelos empurrando a plataforma com os pés, sem mexer os joelhos.", erro: "Deixar os joelhos dobrarem e esticarem junto, o que tira o foco da panturrilha." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Over_Floor_Press/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Over_Floor_Press/1.jpg"] },
        { name: "Panturrilha em pé com halteres", exec: "Em pé, um halter em cada mão ao lado do corpo, suba na ponta dos pés o máximo possível e desça devagar.", erro: "Apoiar-se em algo com força demais em vez de deixar a panturrilha fazer o trabalho." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Calf_Raise/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Calf_Raise/1.jpg"] },
        { name: "Panturrilha unilateral no degrau", exec: "Com a ponta de um pé na borda de um degrau, suba na ponta do pé e desça abaixo do nível do degrau, sentindo o alongamento. Troque de perna.", erro: "Fazer o movimento com pressa, sem controlar a descida." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/1.jpg"] },
        { name: "Panturrilha guiada no smith", exec: "Com a barra do smith apoiada nos ombros e a ponta dos pés numa anilha ou step, suba na ponta dos pés e desça controlado.", erro: "Usar carga alta demais antes de dominar bem a amplitude do movimento." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Calf_Raise/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Calf_Raise/1.jpg"] },
        { name: "Panturrilha sentado com halteres nos joelhos", exec: "Sentado numa cadeira, com um halter apoiado sobre cada joelho, suba na ponta dos pés e desça devagar.", erro: "Deixar o halter escorregar do joelho por falta de apoio firme." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/1.jpg"] },
        { name: "Panturrilha em pé sem peso (alta repetição)", exec: "Em pé, sem nenhum peso, suba na ponta dos pés bem devagar e desça controlado, fazendo bastante repetições — ótimo para aprender o movimento antes de adicionar carga.", erro: "Fazer rápido demais só para completar mais repetições, sem sentir o músculo trabalhar." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocking_Standing_Calf_Raise/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocking_Standing_Calf_Raise/1.jpg"] }
      ]
    },
    abdomen: {
      label: "Abdômen",
      exercises: [
        { name: "Abdominal supra (crunch) no chão", exec: "Deitado de costas, joelhos dobrados e pés no chão, mãos atrás da cabeça sem puxar o pescoço, suba só os ombros do chão contraindo a barriga, depois desça devagar.", erro: "Puxar o pescoço com as mãos para 'ajudar' a subir." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/1.jpg"] },
        { name: "Prancha (isometria)", exec: "Apoie os antebraços e a ponta dos pés no chão, mantendo o corpo reto da cabeça aos pés, como se fosse uma tábua. Segure a posição pelo tempo que conseguir sem deixar o quadril cair.", erro: "Deixar o quadril subir ou descer, perdendo a linha reta do corpo." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"] },
        { name: "Elevação de pernas deitado", exec: "Deitado de costas, pernas esticadas, eleve as duas pernas juntas até formarem 90 graus com o chão, depois desça devagar sem encostar totalmente no chão.", erro: "Arquear a lombar durante a descida das pernas." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Leg_Raises/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Leg_Raises/1.jpg"] },
        { name: "Abdominal na máquina (crunch machine)", exec: "Sentado no aparelho, com o tronco e as pernas apoiados nas almofadas, dobre o tronco para frente contraindo a barriga, depois volte devagar.", erro: "Usar carga alta e fazer o movimento com o braço em vez da barriga." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/1.jpg"] },
        { name: "Prancha lateral", exec: "Deitado de lado, apoie um antebraço e a lateral do pé no chão, eleve o quadril mantendo o corpo reto. Segure e depois troque de lado.", erro: "Deixar o quadril cair em direção ao chão durante o exercício." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/1.jpg"] },
        { name: "Abdominal bicicleta (cotovelo no joelho)", exec: "Deitado de costas, mãos atrás da cabeça, leve um cotovelo em direção ao joelho oposto enquanto estica a outra perna, alternando os lados.", erro: "Fazer o movimento rápido demais, sem realmente girar o tronco." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Crunch/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Crunch/1.jpg"] },
        { name: "Abdominal infra com pernas na cadeira", exec: "Deitado de costas com as pernas apoiadas numa cadeira ou banco (joelhos a 90 graus), contraia a barriga levando o quadril levemente para cima.", erro: "Usar as pernas para empurrar em vez de contrair a barriga." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Leg_Raises/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Leg_Raises/1.jpg"] },
        { name: "Rotação de tronco no cabo (oblíquos)", exec: "Em pé, de lado para a polia, segure o cabo com as duas mãos na altura do peito e gire o tronco de um lado para o outro, mantendo o quadril parado.", erro: "Girar o quadril junto com o tronco, o que tira o trabalho dos oblíquos." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Russian_Twists/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Russian_Twists/1.jpg"] },
        { name: "Prancha com apoio nos joelhos (versão facilitada)", exec: "Igual à prancha normal, mas com os joelhos apoiados no chão em vez da ponta dos pés — ótima forma de começar antes de fazer a prancha completa.", erro: "Deixar o quadril subir demais, tirando a tensão da barriga." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"] }
      ]
    }
  };

// ===================== POOL DE EXERCÍCIOS — CALISTENIA (peso corporal) =====================
// Alguns grupos (ombro, bíceps) não têm um exercício básico só de peso
// corporal e ficam com `exercises: []` de propósito — a UI mostra uma nota
// de fallback e sugere a aba de Musculação nesses casos.
export const CALIST_GROUPS: Record<MuscleGroupKey, MuscleGroup> = {
    peito: {
      label: "Peito",
      exercises: [
        { name: "Flexão de joelhos (apoiada)", exec: "Apoie as mãos no chão na largura dos ombros e os joelhos no chão, mantendo o corpo reto da cabeça aos joelhos. Desça o peito em direção ao chão e empurre de volta.", erro: "Deixar o quadril cair, perdendo o alinhamento do corpo." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clock_Push-Up/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clock_Push-Up/1.jpg"] },
        { name: "Flexão de braço completa — Calistenia", exec: "Corpo todo esticado, apoiado nas mãos e nas pontas dos pés, desça até quase encostar o peito no chão e empurre de volta.", erro: "Arquear a lombar durante o movimento em vez de manter o corpo reto." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/1.jpg"] },
        { name: "Flexão inclinada (mãos elevadas)", exec: "Apoie as mãos numa superfície elevada (um banco, uma escada, uma parede baixa) e faça o movimento de flexão — quanto mais alto o apoio, mais fácil o exercício.", erro: "Escolher uma altura baixa demais antes de estar pronto, tornando o exercício muito difícil e a forma ruim." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up/1.jpg"] }
      ]
    },
    costas: {
      label: "Costas",
      exercises: [
        { name: "Remada invertida com mesa ou TRX", exec: "Deite-se embaixo de uma mesa firme (ou use um TRX/fita de suspensão), segure a borda com as duas mãos e puxe o peito em direção a ela, mantendo o corpo reto.", erro: "Deixar o quadril cair durante a puxada." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row_with_Straps/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row_with_Straps/1.jpg"] },
        { name: "Superman (extensão lombar)", exec: "Deitado de bruços no chão, eleve ao mesmo tempo os braços, o peito e as pernas alguns centímetros do chão, segure um instante e desça devagar.", erro: "Elevar rápido demais, com movimento brusco em vez de controlado." }
      ]
    },
    ombro: { label: "Ombro", exercises: [] },
    biceps: { label: "Bíceps", exercises: [] },
    triceps: {
      label: "Tríceps",
      exercises: [
        { name: "Mergulho de tríceps no banco", exec: "Sente na beirada de um banco ou cadeira firme, mãos ao lado do corpo, pernas esticadas à frente. Desça o corpo dobrando os cotovelos e suba empurrando o banco.", erro: "Descer rápido demais, forçando o ombro além do confortável." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/1.jpg"] }
      ]
    },
    quadriceps: {
      label: "Quadríceps",
      exercises: [
        { name: "Agachamento livre (peso corporal) — Calistenia", exec: "Pés na largura dos ombros, desça como se fosse sentar numa cadeira, peito para cima e peso nos calcanhares, depois suba de volta.", erro: "Deixar os joelhos 'caírem' para dentro durante a descida." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/1.jpg"] },
        { name: "Afundo (passada estática) — Calistenia", exec: "Dê um passo à frente e desça dobrando os dois joelhos até formarem 90 graus, depois volte à posição inicial.", erro: "Deixar o joelho da frente ultrapassar muito a ponta do pé." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Rear_Lunge/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Rear_Lunge/1.jpg"] }
      ]
    },
    posterior: {
      label: "Posterior de Coxa",
      exercises: [
        { name: "Ponte de glúteo (foco no posterior) — Calistenia", exec: "Deitado de costas, joelhos dobrados e pés no chão, eleve o quadril apertando o bumbum e a parte de trás da coxa, depois desça devagar.", erro: "Arquear demais a lombar em vez de usar o quadril para subir." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/1.jpg"] }
      ]
    },
    gluteos: {
      label: "Glúteos",
      exercises: [
        { name: "Ponte de glúteo — Calistenia", exec: "Deitado de costas, joelhos dobrados, pés apoiados no chão, eleve o quadril apertando bem o bumbum no topo, depois desça devagar.", erro: "Empurrar com a lombar em vez de apertar o glúteo para subir o quadril." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/1.jpg"] },
        { name: "Elevação de quadril unilateral", exec: "Na mesma posição da ponte de glúteo, estique uma perna para cima e eleve o quadril usando só a perna apoiada no chão.", erro: "Girar o quadril para o lado em vez de mantê-lo alinhado." }
      ]
    },
    panturrilha: {
      label: "Panturrilha",
      exercises: [
        { name: "Panturrilha em pé (peso corporal)", exec: "Em pé, sem peso, suba na ponta dos pés bem devagar e desça controlado, repetindo bastante — ótimo para aprender o movimento antes de adicionar carga.", erro: "Fazer rápido demais só para completar mais repetições, sem sentir o músculo trabalhar." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Calf_Raise/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Calf_Raise/1.jpg"] }
      ]
    },
    abdomen: {
      label: "Abdômen",
      exercises: [
        { name: "Prancha (isometria) — Calistenia", exec: "Apoie os antebraços e a ponta dos pés no chão, corpo reto da cabeça aos pés. Segure a posição sem deixar o quadril cair.", erro: "Deixar o quadril subir ou descer, perdendo a linha reta do corpo." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/1.jpg"] },
        { name: "Abdominal básico (crunch no chão)", exec: "Deitado de costas, joelhos dobrados e pés no chão, mãos atrás da cabeça sem puxar o pescoço, suba só os ombros contraindo a barriga.", erro: "Puxar o pescoço com as mãos para 'ajudar' a subir." , gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tuck_Crunch/0.jpg","https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tuck_Crunch/1.jpg"] },
        { name: "Prancha lateral — Calistenia", exec: "Deitado de lado, apoie um antebraço e a lateral do pé no chão, eleve o quadril mantendo o corpo reto. Segure e troque de lado.", erro: "Deixar o quadril cair em direção ao chão durante o exercício." }
      ]
    }
  };

export type WorkoutType = SharedWorkoutType;

export const WORKOUT_TYPES: Record<WorkoutTypeKey, WorkoutType> = {
  musculacao: { key: "musculacao", label: "🏋️ Musculação", groups: MUSCLE_GROUPS },
  calistenia: { key: "calistenia", label: "🤸 Calistenia", groups: CALIST_GROUPS },
};

export type SplitKey = "full_2x" | "full_3x" | "div_5x";

export type Split = SharedSplit;

export const SPLITS: Record<SplitKey, Split> = {
    full_2x: {
      label: "Full Body 2x/semana",
      desc: "Ideal para quem está começando agora do zero: dois dias de treino de corpo inteiro, bem espaçados, com bastante descanso entre eles.",
      week: {
        seg: ["peito", "costas", "quadriceps", "abdomen"],
        ter: null,
        qua: null,
        qui: ["ombro", "posterior", "gluteos", "biceps", "triceps", "panturrilha"],
        sex: null,
        sab: null,
        dom: null
      }
    },
    full_3x: {
      label: "Full Body 3x/semana",
      desc: "A divisão clássica para iniciantes: três treinos de corpo inteiro por semana, em dias alternados (por exemplo segunda, quarta e sexta).",
      week: {
        seg: ["peito", "costas", "quadriceps", "abdomen"],
        ter: null,
        qua: ["ombro", "posterior", "gluteos", "biceps", "triceps"],
        qui: null,
        sex: ["peito", "costas", "quadriceps", "panturrilha", "abdomen"],
        sab: null,
        dom: null
      }
    },
    div_5x: {
      label: "5x/semana (treinos menores)",
      desc: "Cinco treinos mais curtos por semana, cada um focado em só 2 grupos musculares — bom pra quem já pegou o hábito de treinar e prefere sessões mais rápidas e frequentes em vez de treinos longos com poucos dias.",
      week: {
        seg: ["peito", "triceps"],
        ter: ["costas", "biceps"],
        qua: ["ombro", "abdomen"],
        qui: ["quadriceps", "gluteos"],
        sex: ["posterior", "panturrilha"],
        sab: null,
        dom: null
      }
    }
  };

export const DEFAULT_REST_SECONDS = 60;

/** Stable per-exercise key used as `workout_log_entries.exercise_id`. */
export function exerciseId(
  dayKey: DayKey,
  typeKey: WorkoutTypeKey,
  groupKey: MuscleGroupKey,
  name: string
): string {
  return sharedExerciseId(dayKey, typeKey, groupKey, name);
}
