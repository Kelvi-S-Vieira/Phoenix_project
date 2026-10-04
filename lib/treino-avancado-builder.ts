/**
 * Support module for the Avançado tier's full custom training builder
 * (app/treino/avancado/AvancadoBuilder.tsx) — ported from the prototype's
 * dedicated Avançado IIFE (projeto_fenix_app_final.html, roughly lines
 * 7908-11630: `#page-treino-avancado`). This is everything from that module
 * that ISN'T the exercise pool itself (treino-avancado-data.ts already has
 * MUSCLE_GROUPS/CALIST_GROUPS/SPLITS, ported earlier):
 *
 *   - equipment/training-level FILTERS — the prototype never stores this as
 *     per-exercise metadata; it's detected at render time from the
 *     exercise's own name via keyword lists (`detectEquipment`,
 *     `detectLevel`). Ported verbatim (same keyword lists, same priority
 *     order) rather than re-extracting exercise data with new fields.
 *   - the cardio/sports/warmup activity catalogs (MET tables) and the
 *     calorie-estimate math (`calcKcal`/`kcalForDay`).
 *   - the weekly working-set volume targets per muscle group and the
 *     work-set/warm-up-set suggestion heuristics.
 *   - the AvancadoPlan data shape persisted to `avancado_plans.week` (jsonb)
 *     and its defaults/normalization, used by both the server page and the
 *     client builder.
 *
 * The HIIT/Tabata/HYROX/CrossFit tabs use the curated exercise pools in
 * lib/treino-circuitos-data.ts plus the circuit-builder helpers below
 * (rounds/work/rest presets, random-pick-N, EMOM/Rounds-for-time formats),
 * ported from the prototype's same-named functions (lines ~9478-9593).
 */

import {
  DAYS,
  type DayKey,
  exerciseKey,
  type WorkoutTypeKey,
} from "./treino-shared-types";
import {
  MUSCLE_GROUPS,
  SPLITS,
  type MuscleGroupKey,
  type SplitKey,
} from "./treino-avancado-data";

export const ALL_GROUP_KEYS = Object.keys(MUSCLE_GROUPS) as MuscleGroupKey[];

// ===================== FILTRO POR EQUIPAMENTO =====================
export const EQUIPMENT_TYPES: Record<string, string> = {
  peso_corporal: "🧍 Peso corporal (sem equipamento)",
  barra_fixa: "🏗️ Barra fixa / Paralelas / Anéis",
  peso_livre: "🏋️ Halteres / Anilhas",
  barra_anilhas: "🏋️‍♂️ Barra + Anilhas",
  kettlebell: "🔔 Kettlebell",
  maquina_cabo: "⚙️ Máquina / Cabo / Polia / Smith",
  elastico: "➰ Elástico / Faixa",
};
export const ALL_EQUIPMENT_KEYS = Object.keys(EQUIPMENT_TYPES);

const EQUIPMENT_KEYWORD_PRIORITY: { key: string; words: string[] }[] = [
  {
    key: "maquina_cabo",
    words: [
      "máquina", "maquina", "cabo", "polia", "pulley", "cross-over", "crossover", "cross over",
      "smith", "hack", "leg press", "peck deck", "gravitron", "hammer strength", "pendulum",
      "v-squat", "ghd", "scott", "extensora", "flexora", "abdutora", "coaster", "aparelho",
      "cinturão de agachamento", "belt squat",
    ],
  },
  { key: "kettlebell", words: ["kettlebell"] },
  { key: "elastico", words: ["elástico", "elastico", "faixa"] },
  {
    key: "barra_fixa",
    words: [
      "barra fixa", "paralela", "anéis", "argolas", "trx", "suspensão", "muscle-up", "muscle up",
      "chin-up", "chin up", "pull-up", "pull up",
    ],
  },
  {
    key: "barra_anilhas",
    words: [
      " com barra", "barra reta", "barra w", "barra ez", "barra livre", "trap bar", "hex bar",
      "barra hexagonal", "safety squat bar", "(ssb)", "landmine", "terra romeno",
      "levantamento terra", " clean", "snatch", "thruster", "push press", "arranco", "arremesso",
      "anilha", "disco", "wall ball", "sandbag", "mochila",
    ],
  },
  { key: "peso_livre", words: ["halter", "pegador", "hand gripper", "grip trainer"] },
];

export function detectEquipment(name: string): string {
  const n = name.toLowerCase();
  for (const group of EQUIPMENT_KEYWORD_PRIORITY) {
    if (group.words.some((w) => n.indexOf(w) >= 0)) return group.key;
  }
  return "peso_corporal";
}

export function defaultEquipmentFilter(): Record<string, boolean> {
  const f: Record<string, boolean> = {};
  ALL_EQUIPMENT_KEYS.forEach((k) => (f[k] = true));
  return f;
}

// ===================== FILTRO POR NÍVEL DE TREINO =====================
export const TRAINING_LEVELS: Record<string, string> = {
  iniciante: "🟢 Iniciante",
  intermediario: "🟡 Intermediário",
  avancado: "🔴 Avançado",
  idoso: "🧓 60+ / Baixo impacto",
};
export const ALL_LEVEL_KEYS = Object.keys(TRAINING_LEVELS);

const LEVEL_KEYWORD_PRIORITY: { key: string; words: string[] }[] = [
  {
    key: "avancado",
    words: [
      "salto", "jump", "pliométric", "pliometric", "plyo", "explosiv", "explosão", "muscle-up",
      "muscle up", "clean", "snatch", "arranco", "arremesso", "thruster", "push press",
      "agachamento frontal", "front squat", "agachamento overhead", "overhead squat", "zercher",
      "sissy", "box jump", "battle rope", "corda naval", "sled", "trenó",
      "arrasto de pneu", "carrinho de compras carregado", "kettlebell swing", "swing",
      "kettlebell snatch", "dragon flag", "toes to bar", "pistol", "archer", "arqueiro",
      "planche", "handstand", "burpee", "sprint", "double-under", "broad jump", "wall ball",
      "wall balls", "safety squat bar", "(ssb)",
    ],
  },
  {
    key: "iniciante",
    words: [
      "máquina", "maquina", "cabo", "polia", "pulley", "cross-over", "crossover", "cross over",
      "smith", "hack", "leg press", "peck deck", "gravitron", "hammer strength", "pendulum",
      "v-squat", "ghd", "scott", "extensora", "flexora", "abdutora", "coaster", "aparelho",
      "cinturão de agachamento", "belt squat", "guiad", "elástico", "elastico", "faixa",
      "(peso corporal)", "sem peso", "sem carga", "prancha", "elevação pélvica",
      "ponte de glúteo", "panturrilha", "cadeira na parede", "wall sit", "mobilidade",
      "alongamento", "respiração", "rosca de punho", "extensão de dedos", "punho",
    ],
  },
];

function detectPrimaryLevel(name: string): string {
  const n = name.toLowerCase();
  for (const group of LEVEL_KEYWORD_PRIORITY) {
    if (group.words.some((w) => n.indexOf(w) >= 0)) return group.key;
  }
  return "intermediario";
}

const IDOSO_SAFE_WORDS = [
  "máquina", "maquina", "cabo", "polia", "pulley", "crossover", "cross-over", "cross over",
  "elástico", "elastico", "faixa", "sentad", "apoiad", "cadeira", "leg press", "extensora",
  "flexora", "abdutora", "peck deck", "puxada", "mobilidade", "alongamento", "respiração",
  "relaxamento", "panturrilha", "prancha", "elevação pélvica", "ponte de glúteo", "punho",
];
const IDOSO_EXCLUDE_WORDS = [
  "salto", "jump", "pliométric", "pliometric", "plyo", "explosiv", "sprint", "burpee",
  "box jump", "corda naval", "battle rope", "sled", "trenó", "clean", "snatch", "arranco",
  "arremesso", "muscle-up", "muscle up", "levantamento terra", "thruster", "push press",
  "zercher", "sissy", "agachamento frontal", "front squat", "overhead squat", "overhead carry",
  "dragon flag", "toes to bar", "archer", "arqueiro", "planche", "pistol", "handstand",
  "hollow body", "mountain climber", "russian twist", "double-under", "broad jump", "wall ball",
  "kettlebell swing", "swing", "com barra livre", "cinturão de peso", "hack machine",
  "com barra", "com halteres pesad", "smith machine", "agachamento sumô com barra",
  "agachamento búlgaro", "afundo búlgaro", "step-up", "escalada de corda", "v-up", "dips",
  "mergulho", "flexão de braço", "barra fixa", "chin-up", "pull-up", "good morning", "stiff",
  "hip thrust", "supino", "rosca", "desenvolvimento militar", "desenvolvimento atrás da nuca",
  "farmer", "corrida", "afundo", "lunge", "box squat", "flexão", "escalador", "polichinelo",
  "chute", "soco", "boxing", "carry", "corda", "rolo de punho", "wrist roller", "dead hang",
  "towel hang",
];

function isIdosoEligible(name: string): boolean {
  const n = name.toLowerCase();
  const isWristCurl = n.indexOf("punho") >= 0;
  if (
    IDOSO_EXCLUDE_WORDS.some((w) => {
      if (w === "rosca" && isWristCurl) return false;
      return n.indexOf(w) >= 0;
    })
  ) {
    return false;
  }
  return IDOSO_SAFE_WORDS.some((w) => n.indexOf(w) >= 0);
}

export function detectLevel(name: string): string[] {
  const primary = detectPrimaryLevel(name);
  const levels = [primary];
  if (primary !== "avancado" && isIdosoEligible(name)) levels.push("idoso");
  return levels;
}

export function defaultLevelFilter(): Record<string, boolean> {
  const f: Record<string, boolean> = {};
  ALL_LEVEL_KEYS.forEach((k) => (f[k] = true));
  return f;
}

/**
 * Single-level filter derived from the profile's `avancado_level` (decided
 * once at cadastro/onboarding, see TierPicker.tsx) instead of the old
 * always-visible multi-select LevelFilterBox. Only the chosen level passes
 * — idoso-eligible exercises still pass for a non-"idoso" level via
 * `detectLevel`'s own primary+idoso dual-tagging, this just picks which
 * single level is the "home" level for this profile.
 */
export function levelFilterForLevel(level: string): Record<string, boolean> {
  const f: Record<string, boolean> = {};
  ALL_LEVEL_KEYS.forEach((k) => (f[k] = k === level));
  return f;
}

export function exercisePassesFilters(
  name: string,
  equipmentFilter: Record<string, boolean>,
  levelFilter: Record<string, boolean>
): boolean {
  const eq = detectEquipment(name);
  if (equipmentFilter[eq] === false) return false;
  const levels = detectLevel(name);
  return levels.some((lv) => levelFilter[lv] !== false);
}

// ===================== VOLUME SEMANAL POR GRUPO MUSCULAR =====================
export const WEEKLY_VOLUME_TARGETS: Record<string, [number, number]> = {
  peito: [12, 20],
  costas: [12, 20],
  quadriceps: [12, 20],
  posterior: [12, 20],
  gluteos: [12, 20],
  ombro: [8, 12],
  biceps: [8, 12],
  triceps: [8, 12],
  panturrilha: [8, 12],
  abdomen: [8, 15],
  antebraco: [6, 10],
};
export const HIGH_VOLUME_GROUPS = ["peito", "costas", "quadriceps", "posterior", "gluteos"];

const COMPOUND_KEYWORDS = [
  "supino", "agachamento", "levantamento terra", "terra romeno", "stiff", "remada", "puxada",
  "desenvolvimento", "leg press", "afundo", "avanço", "passada", "bulgaro", "búlgaro",
  "barra fixa", "paralelas", "dips", "thruster", "clean", "arranco", "arremesso", "push press",
  "hack", "good morning", "step up", "flexão de braço", "elevação pélvica",
];
const ISOLATION_KEYWORDS = [
  "crucifixo", "rosca", "extensão", "elevação lateral", "elevação frontal", "cadeira extensora",
  "cadeira flexora", "mesa flexora", "abdução", "adução", "voador", "peck deck", "panturrilha",
  "gêmeos", "encolhimento", "crossover", "cross over", "pulley", "kickback", "face pull",
  "abdominal", "prancha", "flexão de punho", "gravitron isolado",
];

export function isCompoundExercise(name: string): boolean {
  const n = name.toLowerCase();
  if (COMPOUND_KEYWORDS.some((k) => n.indexOf(k) >= 0)) return true;
  if (ISOLATION_KEYWORDS.some((k) => n.indexOf(k) >= 0)) return false;
  return true;
}

export function suggestWarmupSets(exName: string): number {
  return isCompoundExercise(exName) ? 2 : 1;
}

/** Sugere séries de TRABALHO para um exercício recém-marcado (ver prototype `suggestWorkSets`). */
export function suggestWorkSets(
  week: Record<DayKey, { groups: MuscleGroupKey[]; selections: Record<string, unknown> }>,
  dayKey: DayKey,
  groupKey: MuscleGroupKey
): number {
  const range = WEEKLY_VOLUME_TARGETS[groupKey] || [8, 12];
  const mid = (range[0] + range[1]) / 2;
  const freq = Math.max(1, DAYS.filter((d) => (week[d.key]?.groups || []).includes(groupKey)).length);
  const perSession = mid / freq;
  const exercisesThisDay =
    Object.keys(week[dayKey]?.selections || {}).filter((k) => keyGroup(k) === groupKey).length + 1;
  const perExercise = Math.round(perSession / exercisesThisDay);
  return Math.max(2, Math.min(6, perExercise || 3));
}

function keyGroup(key: string): string {
  // exerciseKey("musculacao", groupKey, name, portionKey?) -> groupKey
  return key.split("::")[1] || "";
}

// ===================== MET / CALORIAS =====================
export function calcKcal(met: number, weightKg: number | null, minutes: number): number {
  if (!met || !weightKg || !minutes) return 0;
  return Math.round(met * weightKg * (minutes / 60));
}

export const MET_MUSCULACAO = 5;
export const MET_CALISTENIA = 8;

export type Intensity = "leve" | "moderado" | "intenso";

export const CARDIO_ACTIVITIES: Record<string, { label: string; met: Record<Intensity, number>; dica: string }> = {
  corrida_rua: { label: "Corrida (rua)", met: { leve: 8, moderado: 9.8, intenso: 11.8 }, dica: "Leve ≈ 7-8 min/km · Moderado ≈ 6 min/km · Intenso ≈ 5 min/km ou menos" },
  corrida_esteira: { label: "Corrida (esteira)", met: { leve: 8, moderado: 9.8, intenso: 11.8 }, dica: "Ajuste velocidade e inclinação da esteira para a intensidade desejada" },
  caminhada_rua: { label: "Caminhada (rua)", met: { leve: 2.8, moderado: 3.5, intenso: 4.8 }, dica: "Leve = passo tranquilo · Intenso = passada rápida ou com subida" },
  caminhada_esteira: { label: "Caminhada (esteira)", met: { leve: 2.8, moderado: 3.5, intenso: 4.8 }, dica: "Use inclinação de 5-10% para aumentar a intensidade sem correr" },
  bike_rua: { label: "Bicicleta (rua)", met: { leve: 4, moderado: 8, intenso: 10 }, dica: "Leve = passeio · Moderado ≈ 20 km/h · Intenso > 25 km/h ou subidas" },
  bike_ergometrica: { label: "Bicicleta (ergométrica)", met: { leve: 3.5, moderado: 7, intenso: 10.5 }, dica: "Ajuste a carga/resistência da bike" },
  eliptico: { label: "Elíptico", met: { leve: 5, moderado: 7, intenso: 9 }, dica: "Aumente resistência e ritmo dos braços/pernas" },
  escada_step: { label: "Escada / Step mill", met: { leve: 4, moderado: 8, intenso: 9 }, dica: "Step mill na academia ou subir escadas reais" },
  pular_corda: { label: "Pular corda", met: { leve: 8.8, moderado: 11.8, intenso: 12.3 }, dica: "Ritmo de saltos por minuto" },
  natacao: { label: "Natação", met: { leve: 6, moderado: 8.3, intenso: 10 }, dica: "Nado leve, moderado ou intenso/competitivo" },
  remo_ergometro: { label: "Remo ergométrico", met: { leve: 4.8, moderado: 7.0, intenso: 8.5 }, dica: "Priorize a técnica: empurre com as pernas antes de puxar com os braços, evitando sobrecarregar a lombar." },
  polichinelo_continuo: { label: "Polichinelo contínuo (cardio)", met: { leve: 4.0, moderado: 6.0, intenso: 8.0 }, dica: "Mantenha os joelhos levemente flexionados na aterrissagem para reduzir o impacto nas articulações." },
  spinning: { label: "Spinning (bike indoor em aula)", met: { leve: 5.5, moderado: 8.5, intenso: 10.5 }, dica: "Ajuste o selim na altura do quadril para evitar sobrecarga no joelho durante o pedal." },
  hiking_trilha: { label: "Caminhada em trilha (hiking)", met: { leve: 4.5, moderado: 6.0, intenso: 7.5 }, dica: "Em subidas acentuadas, reduza o passo e aumente a cadência para poupar energia." },
  danca_cardio: { label: "Dança aeróbica (cardio dance)", met: { leve: 4.5, moderado: 6.5, intenso: 8.5 }, dica: "Hidrate-se bem antes da aula, pois o ritmo contínuo eleva rapidamente a frequência cardíaca." },
  boxe_cardio: { label: "Boxe cardio (sem contato, aula)", met: { leve: 5.5, moderado: 7.5, intenso: 9.5 }, dica: "Mantenha a guarda alta durante toda a série para também trabalhar ombros e core." },
  stand_up_paddle: { label: "Stand-up paddle (SUP)", met: { leve: 3.0, moderado: 5.0, intenso: 6.5 }, dica: "Ative o core para manter o equilíbrio, isso melhora o rendimento e reduz a fadiga nos braços." },
  circuito_funcional: { label: "Circuito funcional (estações)", met: { leve: 5.0, moderado: 7.0, intenso: 9.0 }, dica: "Controle o tempo de transição entre estações para manter a frequência cardíaca elevada." },
  cama_elastica: { label: "Cama elástica (jump fitness)", met: { leve: 4.5, moderado: 6.5, intenso: 8.5 }, dica: "Aterrisse sempre com os joelhos alinhados aos pés para proteger as articulações." },
  caminhada_inclinada: { label: "Caminhada inclinada em esteira", met: { leve: 5.0, moderado: 7.0, intenso: 9.0 }, dica: "Aumente a inclinação gradualmente em vez de aumentar a velocidade para poupar as articulações do joelho." },
};
export const ALL_CARDIO_KEYS = Object.keys(CARDIO_ACTIVITIES);

export const SPORTS_ACTIVITIES: Record<string, { label: string; met: number }> = {
  futsal: { label: "Futsal", met: 7 },
  futebol_campo: { label: "Futebol (campo)", met: 7.5 },
  basquete: { label: "Basquete", met: 6.5 },
  volei: { label: "Vôlei", met: 4 },
  volei_praia: { label: "Vôlei de praia", met: 8 },
  escalada_indoor: { label: "Escalada (indoor)", met: 8 },
  escalada_outdoor: { label: "Escalada (outdoor)", met: 11 },
  tenis: { label: "Tênis", met: 7 },
  muaythai_boxe: { label: "Muay Thai / Boxe", met: 9 },
  danca: { label: "Dança", met: 5 },
  patinacao_skate: { label: "Patinação / Skate", met: 7 },
  handebol: { label: "Handebol", met: 8 },
  rugby: { label: "Rugby", met: 10 },
  judo: { label: "Judô", met: 10.3 },
  jiujitsu: { label: "Jiu-jitsu", met: 10 },
  squash: { label: "Squash", met: 12 },
  badminton: { label: "Badminton", met: 7 },
  hoquei: { label: "Hóquei", met: 8 },
  surf: { label: "Surf", met: 5 },
  luta_olimpica: { label: "Luta olímpica", met: 6 },
  remo_competitivo: { label: "Remo (competitivo)", met: 12 },
  ciclismo_mountain_bike: { label: "Mountain bike", met: 8.5 },
  golfe: { label: "Golfe (a pé, carregando taco)", met: 4.8 },
  ciclismo_bmx: { label: "BMX / Ciclismo freestyle", met: 8.5 },
  slackline: { label: "Slackline", met: 3.0 },
  tenis_mesa: { label: "Tênis de mesa (ping-pong)", met: 4.0 },
  frisbee: { label: "Frisbee / Ultimate", met: 6.5 },
  kitesurf: { label: "Kitesurf", met: 6.0 },
  canoagem: { label: "Canoagem / caiaque", met: 5.0 },
  esgrima: { label: "Esgrima", met: 6.0 },
  atletismo_pista: { label: "Atletismo (pista, corrida de velocidade)", met: 9.5 },
  ginastica_artistica: { label: "Ginástica artística", met: 4.5 },
  wakeboard: { label: "Wakeboard / esqui aquático", met: 6.0 },
};
export const ALL_SPORTS_KEYS = Object.keys(SPORTS_ACTIVITIES);

/** Aquecimento Dinâmico — pool completo (14 exercícios), ported verbatim. */
export const WARMUP_EXERCISES: { name: string; exec: string; erro: string }[] = [
  { name: "Rotação de braços (arm circles)", exec: "Em pé, estenda os braços lateralmente na altura dos ombros e faça pequenos círculos, aumentando gradualmente a amplitude por 20-30 segundos em cada direção.", erro: "Fazer círculos grandes demais logo no início, antes de aquecer gradualmente a articulação do ombro." },
  { name: "Elevação de joelhos (marcha no lugar)", exec: "Em pé, marche ou trote no lugar elevando alternadamente os joelhos até a altura do quadril, em ritmo controlado, por 20-30 segundos.", erro: "Inclinar o tronco para trás durante o movimento em vez de manter a postura ereta." },
  { name: "Agachamento com peso corporal", exec: "Pés na largura dos ombros, agache flexionando quadril e joelhos até onde a mobilidade permitir e suba controlado, sem carga adicional — só para ativar o padrão de movimento.", erro: "Descer rápido demais sem controle, usando embalo em vez de ativar a musculatura das pernas." },
  { name: "Prancha dinâmica (mountain climber leve)", exec: "Em posição de prancha alta, alterne trazendo um joelho de cada vez em direção ao peito em ritmo controlado (não explosivo), mantendo o quadril estável.", erro: "Deixar o quadril subir alto, perdendo o alinhamento da prancha e reduzindo a ativação do core." },
  { name: "Mobilidade de quadril (leg swings)", exec: "Apoiado em uma parede ou suporte, balance uma perna para frente e para trás em arco controlado, depois lateralmente, soltando a articulação do quadril antes de trocar de lado.", erro: "Balançar a perna com força excessiva logo de início, antes de soltar gradualmente a amplitude." },
  { name: "Ativação de glúteo (band walks / caminhada lateral)", exec: "Com um elástico leve acima dos joelhos (ou sem elástico, se não tiver disponível), fique em meio-agachamento e dê passos laterais controlados para um lado e depois para o outro.", erro: "Ficar totalmente ereto durante os passos, perdendo a ativação do glúteo médio que o exercício busca." },
  { name: "Rotação de tronco", exec: "Em pé com os braços estendidos à frente ou nas laterais, gire o tronco suavemente de um lado para o outro, deixando os braços acompanharem o movimento, sem forçar a amplitude.", erro: "Girar bruscamente ou forçar além da mobilidade confortável da coluna logo no aquecimento." },
  { name: "Polichinelos leves", exec: "Realize polichinelos em ritmo leve e controlado por 20-30 segundos, apenas para elevar a frequência cardíaca e aquecer o corpo todo antes do treino.", erro: "Fazer no ritmo máximo desde o início, tratando o aquecimento como se fosse o treino principal." },
  { name: "Cat-cow (gato-camelo)", exec: "Apoiado em quatro apoios (mãos e joelhos), alterne entre arquear a coluna para cima (gato) e para baixo (camelo/vaca), sincronizando o movimento com a respiração.", erro: "Mover apenas a cabeça e o pescoço em vez de mobilizar a coluna inteira, do pescoço até a lombar." },
  { name: "World's greatest stretch", exec: "A partir de uma passada longa à frente, apoie a mão do mesmo lado da perna de trás no chão e gire o tronco erguendo o outro braço para o teto, alternando entre alongar e mobilizar quadril, tronco e ombro em uma sequência só.", erro: "Apressar a transição entre as posições em vez de pausar alguns segundos em cada parte da sequência para realmente mobilizar cada articulação." },
  { name: "Mobilidade de tornozelo (ankle circles + dorsiflexão na parede)", exec: "Apoie a ponta do pé na parede e leve o joelho em direção a ela sem tirar o calcanhar do chão, soltando a dorsiflexão do tornozelo por algumas repetições, depois faça círculos lentos com o pé no ar antes de trocar de lado.", erro: "Deixar o calcanhar levantar do chão durante a dorsiflexão, perdendo a mobilidade real do tornozelo para compensar com o quadril." },
  { name: "Mobilidade de ombro com bastão (pass-through)", exec: "Segure um bastão ou cabo de vassoura com as duas mãos bem afastadas e leve-o por cima da cabeça até as costas, mantendo os cotovelos o mais estendidos possível, e retorne à frente do corpo.", erro: "Aproximar demais as mãos no bastão, forçando o ombro a compensar com uma rotação além da mobilidade confortável." },
  { name: "Mobilidade de quadril 90/90 dinâmico", exec: "Sentado no chão com uma perna dobrada a 90° à frente e a outra a 90° atrás do corpo, alterne girando o quadril de um lado para o outro entre as duas posições, sem apoiar as mãos no chão.", erro: "Usar o impulso dos braços empurrando o chão para girar em vez de mobilizar o quadril de forma ativa." },
  { name: "Inchworm (caminhada das mãos)", exec: "Em pé, incline o tronco e leve as mãos ao chão, caminhe com as mãos para frente até a posição de prancha alta, faça uma pausa e caminhe de volta com os pés até as mãos, repetindo o ciclo.", erro: "Deixar o quadril cair durante a fase de prancha em vez de manter o core ativado durante toda a caminhada." },
];

/** MET tables for warmup + the 4 "generic entry" workout types (hiit/tabata/hyrox/crossfit). */
export const GENERIC_WORKOUT_MET: Record<string, Record<Intensity, number>> = {
  warmup: { leve: 3, moderado: 3.5, intenso: 4.5 },
  hiit: { leve: 7, moderado: 10, intenso: 13.5 },
  tabata: { leve: 8, moderado: 11.5, intenso: 14.5 },
  hyrox: { leve: 9, moderado: 11, intenso: 13 },
  crossfit: { leve: 8, moderado: 10.5, intenso: 13 },
};

export const GENERIC_TAB_LABELS: Record<string, string> = {
  hiit: "🔥 HIIT",
  tabata: "⏱️ Tabata",
  hyrox: "🏆 HYROX",
  crossfit: "🏋️‍♀️ CrossFit",
};
export type GenericTypeKey = "hiit" | "tabata" | "hyrox" | "crossfit";
export const GENERIC_TYPE_KEYS: GenericTypeKey[] = ["hiit", "tabata", "hyrox", "crossfit"];

// ===================== CIRCUITO (HIIT / Tabata / HYROX / CrossFit) =====================
// Ported from the prototype's WORKOUT_TYPES/CROSSFIT_CIRCUIT_FORMATS/
// isCircuitFormat/*_INTENSITY_PRESETS/pickRandomExercises/applyCircuitPreset/
// TIME_BUILDER_OPTIONS/exerciseCountForDuration/applyTimeBuilder/
// computeCircuitEstimate (projeto_fenix_app_final.html lines 9478-9593).
// Rewritten as pure functions (no module-level `state`/`saveState()`) since
// the plan lives in AvancadoBuilder's React state instead.
export type CrossfitFormat = "amrap" | "emom" | "for_time" | "rounds";
export const CROSSFIT_FORMATS: { key: CrossfitFormat; label: string }[] = [
  { key: "amrap", label: "AMRAP" },
  { key: "emom", label: "EMOM" },
  { key: "for_time", label: "For Time" },
  { key: "rounds", label: "Rounds for Time" },
];

/** metRest = MET during active-recovery rest between circuit exercises/rounds (hyrox has none — never a circuit format). */
export const CIRCUIT_MET_REST: Partial<Record<GenericTypeKey, number>> = {
  hiit: 3,
  tabata: 3,
  crossfit: 3,
};

// Formats de CrossFit que funcionam como circuito estruturado (rounds com
// trabalho/descanso definidos). AMRAP/For Time são esforço contínuo até o
// tempo/objetivo acabar, sem descanso programado — usam duração × MET direto.
export const CROSSFIT_CIRCUIT_FORMATS: CrossfitFormat[] = ["emom", "rounds"];
export function isCircuitFormat(typeKey: GenericTypeKey, day: { format?: CrossfitFormat }): boolean {
  if (typeKey === "hiit" || typeKey === "tabata") return true;
  if (typeKey === "crossfit") return !!day.format && CROSSFIT_CIRCUIT_FORMATS.includes(day.format);
  return false;
}

export interface CircuitPreset {
  rounds: number;
  workSec: number;
  restSec: number;
  exerciseCount: number;
  exerciseRange: string;
}
export const CIRCUIT_INTENSITY_PRESETS: Record<Intensity, CircuitPreset> = {
  leve: { rounds: 3, workSec: 30, restSec: 30, exerciseCount: 4, exerciseRange: "4 a 5" },
  moderado: { rounds: 4, workSec: 40, restSec: 20, exerciseCount: 5, exerciseRange: "5 a 6" },
  intenso: { rounds: 5, workSec: 45, restSec: 15, exerciseCount: 6, exerciseRange: "6 a 8" },
};
// Tabata tem trabalho/descanso FIXOS por definição (20s/10s) — a intensidade
// varia só o número de rounds/exercícios encadeados.
export const TABATA_INTENSITY_PRESETS: Record<Intensity, CircuitPreset> = {
  leve: { rounds: 8, workSec: 20, restSec: 10, exerciseCount: 4, exerciseRange: "3 a 4" },
  moderado: { rounds: 8, workSec: 20, restSec: 10, exerciseCount: 6, exerciseRange: "5 a 6" },
  intenso: { rounds: 8, workSec: 20, restSec: 10, exerciseCount: 9, exerciseRange: "8 a 10" },
};
export function getIntensityPresets(typeKey: GenericTypeKey): Record<Intensity, CircuitPreset> {
  return typeKey === "tabata" ? TABATA_INTENSITY_PRESETS : CIRCUIT_INTENSITY_PRESETS;
}

/** Sorteia um substituto aleatório dentre os candidatos (usado pela troca de exercício do Musculação). */
export function pickSwapReplacement<T>(candidates: T[]): T | null {
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** Sorteia N nomes de exercícios de um pool, sem repetição. */
export function pickRandomExercises(exercisePool: { name: string }[], n: number): string[] {
  const names = exercisePool.map((ex) => ex.name).slice();
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  return names.slice(0, Math.min(n, names.length));
}

export interface CircuitDayPlan {
  format?: CrossfitFormat; // crossfit only
  duration: number; // used when NOT a circuit format (AMRAP/For Time/HYROX)
  intensity: Intensity;
  rounds: number;
  workSec: number;
  restSec: number;
  exercises: string[]; // selected exercise names from the pool
}
export function emptyCircuitDay(): CircuitDayPlan {
  return { format: "amrap", duration: 20, intensity: "moderado", rounds: 4, workSec: 40, restSec: 20, exercises: [] };
}

/** Aplica a sugestão da intensidade: rounds/trabalho/descanso + sorteia os exercícios do circuito. */
export function applyCircuitPreset(
  typeKey: GenericTypeKey,
  day: CircuitDayPlan,
  intensity: Intensity,
  exercisePool: { name: string }[]
): CircuitDayPlan {
  const presets = getIntensityPresets(typeKey);
  const preset = presets[intensity] || presets.moderado;
  return {
    ...day,
    intensity,
    rounds: preset.rounds,
    workSec: preset.workSec,
    restSec: preset.restSec,
    exercises: pickRandomExercises(exercisePool, preset.exerciseCount),
  };
}

/** Monta o circuito a partir de uma duração total desejada (10-75+min). */
export const TIME_BUILDER_OPTIONS = [10, 15, 20, 25, 30, 40, 50, 60, 75];
export function exerciseCountForDuration(minutes: number): number {
  if (minutes <= 10) return 3;
  if (minutes <= 15) return 4;
  if (minutes <= 20) return 5;
  if (minutes <= 30) return 6;
  if (minutes <= 45) return 7;
  if (minutes <= 60) return 8;
  return 10;
}
export function applyTimeBuilder(
  typeKey: GenericTypeKey,
  day: CircuitDayPlan,
  targetMinutes: number,
  exercisePool: { name: string }[]
): CircuitDayPlan {
  const presets = getIntensityPresets(typeKey);
  const preset = presets[day.intensity] || presets.moderado;
  const workSec = day.workSec || preset.workSec;
  const restSec = day.restSec || preset.restSec;
  const n = exerciseCountForDuration(targetMinutes);
  const perRoundSeconds = n * (workSec + restSec);
  const roundsNeeded = Math.max(1, Math.round((targetMinutes * 60) / perRoundSeconds));
  return { ...day, exercises: pickRandomExercises(exercisePool, n), workSec, restSec, rounds: roundsNeeded };
}

export interface CircuitEstimate {
  minutes: number;
  kcal: number;
  totalWorkSec: number;
  totalRestSec: number;
}
/** Estima duração/gasto de um circuito a partir da composição real (exercícios × rounds × [trabalho+descanso]), com MET diferente para trabalho e descanso. */
export function computeCircuitEstimate(typeKey: GenericTypeKey, day: CircuitDayPlan, weight: number | null): CircuitEstimate {
  const met = GENERIC_WORKOUT_MET[typeKey];
  const n = day.exercises.length;
  if (n === 0) return { minutes: 0, kcal: 0, totalWorkSec: 0, totalRestSec: 0 };
  const metWork = met[day.intensity] || met.moderado;
  const metRest = CIRCUIT_MET_REST[typeKey] || 3;
  const rounds = day.rounds || 1;
  const workSec = day.workSec || 0;
  const restSec = day.restSec || 0;
  const totalWorkSec = n * rounds * workSec;
  const totalRestSec = n * rounds * restSec;
  const minutes = Math.round((totalWorkSec + totalRestSec) / 60);
  let kcal = 0;
  if (weight) {
    kcal = Math.round(weight * (metWork * (totalWorkSec / 3600) + metRest * (totalRestSec / 3600)));
  }
  return { minutes, kcal, totalWorkSec, totalRestSec };
}

// ===================== PLAN DATA SHAPE =====================
export interface PlanSelection {
  sets: number;
  reps: string;
  warmupSets: number;
}
export interface CardioEntry {
  id: string;
  activityKey: string;
  intensity: Intensity;
  minutes: number;
}
export interface SportEntry {
  id: string;
  activityKey: string;
  minutes: number;
}
export interface DayPlan {
  groups: MuscleGroupKey[];
  selections: Record<string, PlanSelection>; // key: exerciseKey("musculacao", group, name, portion)
  strengthDurationMin: number;
  calistenia: { durationMin: number; exercises: Record<string, { sets: number; reps: string }> }; // key: exercise name
  warmupExercises: string[]; // exercise names
  warmupMinutes: number;
  warmupIntensity: Intensity;
  cardio: CardioEntry[];
  sports: SportEntry[];
  generic: Record<GenericTypeKey, CircuitDayPlan>;
}
export interface AvancadoPlan {
  week: Record<DayKey, DayPlan>;
  equipmentFilter: Record<string, boolean>;
  levelFilter: Record<string, boolean>;
  lastTemplate: SplitKey | null;
}

export function emptyDayPlan(): DayPlan {
  return {
    groups: [],
    selections: {},
    strengthDurationMin: 60,
    calistenia: { durationMin: 30, exercises: {} },
    warmupExercises: [],
    warmupMinutes: 10,
    warmupIntensity: "leve",
    cardio: [],
    sports: [],
    generic: { hiit: emptyCircuitDay(), tabata: emptyCircuitDay(), hyrox: emptyCircuitDay(), crossfit: emptyCircuitDay() },
  };
}

export function defaultPlan(): AvancadoPlan {
  const week = {} as Record<DayKey, DayPlan>;
  DAYS.forEach((d) => {
    week[d.key] = emptyDayPlan();
  });
  return {
    week,
    equipmentFilter: defaultEquipmentFilter(),
    levelFilter: defaultLevelFilter(),
    lastTemplate: null,
  };
}

/** Fills `plan.week[*].groups` from a SPLITS template — everything else about each day stays untouched/editable, matching the prototype's `templateToWeek`. */
export function applyTemplate(plan: AvancadoPlan, splitKey: SplitKey): AvancadoPlan {
  const src = SPLITS[splitKey]?.week || {};
  const week = { ...plan.week };
  DAYS.forEach((d) => {
    const groups = (src[d.key] || []) as MuscleGroupKey[];
    week[d.key] = { ...(week[d.key] || emptyDayPlan()), groups: groups.slice() };
  });
  return { ...plan, week, lastTemplate: splitKey };
}

/** Normalizes a plan loaded from the DB (fills in any missing day/field so the UI never has to null-check). Tolerant of partial/old shapes. */
export function normalizePlan(raw: unknown): AvancadoPlan {
  const base = defaultPlan();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<AvancadoPlan>;
  const week = { ...base.week };
  DAYS.forEach((d) => {
    const rd = (r.week as Record<string, Partial<DayPlan>> | undefined)?.[d.key];
    if (rd) {
      const rdGeneric = (rd.generic || {}) as Partial<Record<GenericTypeKey, Partial<CircuitDayPlan>>>;
      const generic = {} as Record<GenericTypeKey, CircuitDayPlan>;
      GENERIC_TYPE_KEYS.forEach((k) => {
        const rg = rdGeneric[k];
        generic[k] = {
          ...emptyCircuitDay(),
          ...rg,
          exercises: Array.isArray(rg?.exercises) ? rg!.exercises! : [],
        };
      });
      week[d.key] = {
        ...emptyDayPlan(),
        ...rd,
        calistenia: { ...emptyDayPlan().calistenia, ...(rd.calistenia || {}) },
        generic,
      };
    }
  });
  return {
    week,
    equipmentFilter: { ...base.equipmentFilter, ...(r.equipmentFilter || {}) },
    levelFilter: { ...base.levelFilter, ...(r.levelFilter || {}) },
    lastTemplate: r.lastTemplate ?? null,
  };
}

export function weeklyVolumeByGroup(plan: AvancadoPlan): Record<string, number> {
  const totals: Record<string, number> = {};
  ALL_GROUP_KEYS.forEach((g) => (totals[g] = 0));
  DAYS.forEach((d) => {
    Object.entries(plan.week[d.key]?.selections || {}).forEach(([key, sel]) => {
      const g = keyGroup(key);
      if (totals[g] !== undefined) totals[g] += Number(sel.sets) || 0;
    });
  });
  return totals;
}

export function dayHasAnyActivity(day: DayPlan): boolean {
  return (
    day.groups.length > 0 ||
    Object.keys(day.calistenia.exercises).length > 0 ||
    day.warmupExercises.length > 0 ||
    day.cardio.length > 0 ||
    day.sports.length > 0 ||
    GENERIC_TYPE_KEYS.some((k) => day.generic[k].exercises.length > 0)
  );
}

export interface KcalBreakdownItem {
  label: string;
  kcal: number;
}
export function kcalForDay(day: DayPlan, weight: number | null): { total: number; breakdown: KcalBreakdownItem[] } {
  let total = 0;
  const breakdown: KcalBreakdownItem[] = [];

  if (day.groups.length > 0 && weight) {
    const k = calcKcal(MET_MUSCULACAO, weight, day.strengthDurationMin || 60);
    total += k;
    breakdown.push({ label: `Musculação (${day.strengthDurationMin || 60} min)`, kcal: k });
  }
  if (Object.keys(day.calistenia.exercises).length > 0 && weight) {
    const k = calcKcal(MET_CALISTENIA, weight, day.calistenia.durationMin || 30);
    total += k;
    breakdown.push({ label: `Calistenia (${day.calistenia.durationMin || 30} min)`, kcal: k });
  }
  if (day.warmupExercises.length > 0 && weight) {
    const met = GENERIC_WORKOUT_MET.warmup[day.warmupIntensity] || GENERIC_WORKOUT_MET.warmup.leve;
    const k = calcKcal(met, weight, day.warmupMinutes || 10);
    total += k;
    breakdown.push({ label: `Aquecimento (${day.warmupMinutes || 10} min)`, kcal: k });
  }
  day.cardio.forEach((entry) => {
    const act = CARDIO_ACTIVITIES[entry.activityKey];
    if (!act || !weight) return;
    const met = act.met[entry.intensity] || act.met.moderado;
    const k = calcKcal(met, weight, entry.minutes);
    total += k;
    breakdown.push({ label: `${act.label} (${entry.minutes} min)`, kcal: k });
  });
  day.sports.forEach((entry) => {
    const act = SPORTS_ACTIVITIES[entry.activityKey];
    if (!act || !weight) return;
    const k = calcKcal(act.met, weight, entry.minutes);
    total += k;
    breakdown.push({ label: `${act.label} (${entry.minutes} min)`, kcal: k });
  });
  GENERIC_TYPE_KEYS.forEach((typeKey) => {
    const genDay = day.generic[typeKey];
    if (!weight || genDay.exercises.length === 0) return;
    if (isCircuitFormat(typeKey, genDay)) {
      const est = computeCircuitEstimate(typeKey, genDay, weight);
      if (est.kcal <= 0) return;
      total += est.kcal;
      breakdown.push({ label: `${GENERIC_TAB_LABELS[typeKey]} (${est.minutes} min)`, kcal: est.kcal });
    } else {
      const met = GENERIC_WORKOUT_MET[typeKey][genDay.intensity] || GENERIC_WORKOUT_MET[typeKey].moderado;
      const k = calcKcal(met, weight, genDay.duration);
      if (k <= 0) return;
      total += k;
      breakdown.push({ label: `${GENERIC_TAB_LABELS[typeKey]} (${genDay.duration} min)`, kcal: k });
    }
  });

  return { total, breakdown };
}

export function newEntryId(prefix: string): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export { exerciseKey };
export type { WorkoutTypeKey };
