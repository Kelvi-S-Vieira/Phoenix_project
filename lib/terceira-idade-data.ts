/**
 * Static reference content for the "treino-terceira-idade" tier (Terceira
 * Idade / 60+), ported verbatim from the prototype
 * (projeto_fenix_app_final.html, the standalone "TERCEIRA IDADE MODULE" IIFE,
 * lines ~11636-12143).
 *
 * Unlike Básico/Intermediário/Avançado, this tier has nothing to do with
 * muscle groups, splits or sets/reps — it's gentle, session-based checklists
 * aimed at 60+ users, explicitly non-competitive (no "recorde"/PR language
 * anywhere, by design — see the prototype's own FEELINGS copy below). Pure
 * reference content, same "data module" pattern as every other exercise pool
 * in this codebase (see the header comment in treino-avancado-data.ts for
 * why this stays a plain TS module instead of a DB table).
 *
 * SESSION_TYPES has exactly 3 entries, each with exactly 10 exercises (30
 * total) — verified with a Node script (brace-matched extraction + vm-eval
 * of the array literal + counting the parsed objects) before hand-converting
 * to this typed array; nothing trimmed or dropped from the prototype's
 * pools:
 *   - mobilidade  (🦴 Mobilidade e Alongamento):        10 exercises
 *   - equilibrio  (⚖️ Equilíbrio e Prevenção de Quedas): 10 exercises
 *   - fortalecimento (💪 Fortalecimento Funcional Leve): 10 exercises
 *
 * Each exercise has its own shape here (name/exec/cuidado/duracaoOuReps)
 * instead of reusing the shared `Exercise` interface from
 * treino-shared-types.ts — that interface's `erro` field (a common-mistake
 * callout, used by every other tier's log/progression UI) doesn't fit this
 * module at all; the prototype itself gives each exercise a `cuidado`
 * ("attention/care" — e.g. "pare se sentir tontura") and a
 * `duracao_ou_reps` (duration-or-reps, since many entries here are
 * time-based, like "1 a 2 minutos", not rep-based) instead. `gif` is
 * optional and reuses the same two-frame demo-photo convention as every
 * other tier (rendered with the existing `ExerciseMedia` component) — only
 * 3 of the 30 exercises have one in the prototype, the rest are plain
 * step-by-step text.
 *
 * FEELINGS is a private, non-comparative "how did this feel" tag the user
 * can set per session — the prototype's own copy for it
 * ("Registrado só para você — não é usado para nenhum tipo de avaliação ou
 * comparação") is preserved verbatim in the UI (see TerceiraIdadeBoard.tsx)
 * because it matters for an elderly-user-facing feature: it is explicitly
 * NOT a performance metric.
 */

export interface SeniorExercise {
  name: string;
  exec: string;
  cuidado: string;
  duracaoOuReps: string;
  gif?: string[];
}

export type SeniorSessionTypeId = "mobilidade" | "equilibrio" | "fortalecimento";

export interface SeniorSessionType {
  id: SeniorSessionTypeId;
  emoji: string;
  label: string;
  desc: string;
  exercises: SeniorExercise[];
}

export const SESSION_TYPES: SeniorSessionType[] = [
  {
    id: "mobilidade",
    emoji: "🦴",
    label: "Mobilidade e Alongamento",
    desc: "Um circuito gentil de mobilidade articular para pescoço, ombros, quadril, joelhos e tornozelos. Movimente-se dentro de uma amplitude confortável, sem forçar.",
    exercises: [
    { name: "Rotação de pescoço", exec: "Sentado(a) ou em pé, com a coluna ereta, incline a cabeça suavemente para um lado, depois para o outro, e em seguida para frente. Evite jogar a cabeça para trás.", cuidado: "Faça movimentos lentos e pare se sentir tontura ou dor.", duracaoOuReps: "5 repetições em cada direção" },
    { name: "Círculos de ombros", exec: "Em pé ou sentado(a), eleve os ombros em direção às orelhas e faça um movimento circular para trás, depois para frente.", cuidado: "Mantenha os braços relaxados ao lado do corpo durante o movimento.", duracaoOuReps: "10 repetições em cada direção", gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Circles/0.jpg", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Circles/1.jpg"] },
    { name: "Abertura de braços cruzados", exec: "Com os braços à frente do corpo na altura do peito, abra-os lateralmente como se fosse abraçar o ar, sentindo o alongamento no peito e nos ombros.", cuidado: "Não prenda a respiração durante o movimento.", duracaoOuReps: "10 repetições" },
    { name: "Rotação de tronco sentado(a)", exec: "Sentado(a) em uma cadeira firme, com os pés apoiados no chão, gire suavemente o tronco para um lado apoiando a mão no encosto ou na perna, depois para o outro lado.", cuidado: "Gire apenas até onde for confortável, sem forçar a coluna.", duracaoOuReps: "5 repetições em cada lado" },
    { name: "Mobilidade de quadril sentado(a)", exec: "Sentado(a), levante um joelho em direção ao peito com a ajuda das mãos, se necessário, e desça novamente. Alterne as pernas.", cuidado: "Segure em uma superfície estável se sentir necessidade de apoio extra.", duracaoOuReps: "8 repetições de cada lado" },
    { name: "Extensão de joelho sentado(a)", exec: "Sentado(a) na cadeira, estenda uma perna lentamente até ficar reta, segure um instante e volte à posição inicial.", cuidado: "Movimente-se com controle, sem 'jogar' a perna.", duracaoOuReps: "10 repetições em cada perna" },
    { name: "Círculos de tornozelo", exec: "Sentado(a), levante levemente um pé do chão e faça círculos com o tornozelo, em um sentido e depois no outro.", cuidado: "Movimentos pequenos e controlados são suficientes.", duracaoOuReps: "10 círculos em cada direção, cada pé", gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ankle_Circles/0.jpg", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ankle_Circles/1.jpg"] },
    { name: "Alongamento de panturrilha na parede", exec: "De frente para uma parede, com as mãos apoiadas nela, leve uma perna para trás mantendo o calcanhar no chão, sentindo o alongamento na panturrilha.", cuidado: "Mantenha o joelho da frente alinhado com o pé, sem ultrapassar demais a ponta dos dedos.", duracaoOuReps: "20 a 30 segundos em cada perna", gif: ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Stretch_Hands_Against_Wall/0.jpg", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Stretch_Hands_Against_Wall/1.jpg"] },
    { name: "Elevação de braços com apoio", exec: "Em pé ou sentado(a), com apoio de uma cadeira ou parede se necessário, eleve os dois braços lentamente à frente do corpo até a altura dos ombros e desça.", cuidado: "Pare se sentir qualquer desconforto no ombro.", duracaoOuReps: "10 repetições" },
    { name: "Respiração e relaxamento final", exec: "Sentado(a) confortavelmente, feche os olhos se preferir, inspire profundamente pelo nariz e expire lentamente pela boca, relaxando os ombros a cada expiração.", cuidado: "Use este momento para perceber como o corpo está se sentindo, sem julgamento.", duracaoOuReps: "1 a 2 minutos" },
    ],
  },
  {
    id: "equilibrio",
    emoji: "⚖️",
    label: "Equilíbrio e Prevenção de Quedas",
    desc: "Exercícios para fortalecer o equilíbrio e reduzir o risco de quedas no dia a dia. Sempre tenha uma cadeira firme ou parede por perto para se apoiar.",
    exercises: [
    { name: "Apoio unipodal com suporte", exec: "Em pé, próximo a uma cadeira ou bancada, segure com uma das mãos e levante um pé do chão, mantendo o equilíbrio por alguns segundos. Troque de perna.", cuidado: "Nunca solte totalmente o apoio se não se sentir seguro(a); é normal balançar um pouco no início.", duracaoOuReps: "10 a 15 segundos em cada perna" },
    { name: "Marcha lateral com apoio", exec: "Ao lado de uma bancada ou parede, dê pequenos passos laterais para um lado e depois para o outro, mantendo uma das mãos próxima ao apoio.", cuidado: "Dê passos curtos e olhe para frente, não para os pés.", duracaoOuReps: "8 passos para cada lado" },
    { name: "Transferência de peso lateral", exec: "Em pé, com os pés afastados na largura do quadril e apoio próximo, transfira o peso do corpo para um lado e depois para o outro, sem tirar os pés do chão.", cuidado: "Movimente-se devagar, sentindo o equilíbrio em cada lado.", duracaoOuReps: "10 repetições" },
    { name: "Transferência de peso frente e trás", exec: "Em pé com apoio próximo, incline o peso do corpo levemente para frente, sobre a ponta dos pés, e depois para trás, sobre os calcanhares.", cuidado: "Faça o movimento com pequena amplitude para evitar desequilíbrio.", duracaoOuReps: "10 repetições" },
    { name: "Sentar e levantar da cadeira com controle", exec: "Sentado(a) em uma cadeira firme, com os pés apoiados no chão, levante-se devagar usando as pernas e, se precisar, as mãos apoiadas nos braços da cadeira. Sente-se novamente com controle.", cuidado: "Escolha uma cadeira estável, sem rodinhas, e evite se jogar para trás ao sentar.", duracaoOuReps: "8 repetições" },
    { name: "Caminhada em linha (marcha tandem)", exec: "Próximo a uma parede ou bancada, caminhe colocando um pé praticamente à frente do outro, como se estivesse em uma linha reta.", cuidado: "Faça poucos passos de cada vez e mantenha o apoio sempre por perto.", duracaoOuReps: "5 a 8 passos" },
    { name: "Elevação de joelho com apoio", exec: "Em pé, segurando um apoio, eleve um joelho em direção ao quadril como se estivesse marchando bem devagar, e desça. Alterne as pernas.", cuidado: "Eleve o joelho apenas até uma altura confortável.", duracaoOuReps: "8 repetições em cada perna" },
    { name: "Giro de cabeça em pé com apoio", exec: "Em pé, com apoio próximo, gire a cabeça lentamente para observar um lado e depois o outro, mantendo o corpo estável.", cuidado: "Se sentir tontura, pare e sente-se imediatamente.", duracaoOuReps: "5 repetições em cada lado" },
    { name: "Postura em pé com base reduzida", exec: "Em pé, próximo a um apoio, aproxime um pouco mais os pés um do outro do que o habitual, mantendo o equilíbrio nessa posição.", cuidado: "Use o apoio sempre que sentir necessidade; não é preciso arriscar.", duracaoOuReps: "15 a 20 segundos" },
    { name: "Caminhada curta com atenção plena", exec: "Caminhe por um trajeto curto e seguro dentro de casa, prestando atenção em cada passo e na forma como os pés tocam o chão.", cuidado: "Use calçados firmes e evite pisos escorregadios ou tapetes soltos.", duracaoOuReps: "1 a 2 minutos" },
    ],
  },
  {
    id: "fortalecimento",
    emoji: "💪",
    label: "Fortalecimento Funcional Leve",
    desc: "Fortalecimento leve com o peso do próprio corpo ou faixa elástica leve, sempre com a opção de apoio, para dar mais força e autonomia aos movimentos do dia a dia.",
    exercises: [
    { name: "Sentar e levantar da cadeira", exec: "Sentado(a) em uma cadeira firme, com os pés apoiados no chão, levante-se usando a força das pernas e sente-se novamente de forma controlada.", cuidado: "Se precisar, use os braços da cadeira como apoio; não force os joelhos.", duracaoOuReps: "8 a 10 repetições" },
    { name: "Elevação de panturrilha com apoio", exec: "Em pé, segurando o encosto de uma cadeira ou uma bancada, eleve os calcanhares do chão ficando na ponta dos pés, e desça devagar.", cuidado: "Mantenha o movimento controlado, sem pressa na descida.", duracaoOuReps: "10 a 12 repetições" },
    { name: "Elevação lateral de perna com apoio", exec: "Em pé, segurando um apoio, eleve uma perna esticada lateralmente, sem inclinar o tronco, e desça devagar. Alterne as pernas.", cuidado: "Mantenha o joelho da perna de apoio levemente flexionado, sem travar.", duracaoOuReps: "8 a 10 repetições em cada lado" },
    { name: "Elevação de perna para trás com apoio", exec: "Em pé, segurando um apoio, leve uma perna esticada para trás, sem inclinar o tronco para frente, e retorne à posição inicial.", cuidado: "Movimento pequeno e controlado é suficiente para sentir o trabalho muscular.", duracaoOuReps: "8 a 10 repetições em cada perna" },
    { name: "Flexão de braço na parede", exec: "De frente para uma parede, com as mãos apoiadas na altura dos ombros, flexione os cotovelos aproximando o corpo da parede e depois empurre de volta.", cuidado: "Mantenha o corpo alinhado, sem arquear as costas.", duracaoOuReps: "8 a 10 repetições" },
    { name: "Remada sentada com faixa elástica leve", exec: "Sentado(a), com a faixa elástica presa em um ponto fixo à frente ou envolvida nos pés, puxe as extremidades em direção à cintura, aproximando as escápulas.", cuidado: "Use uma faixa bem leve e priorize o movimento correto à quantidade de repetições.", duracaoOuReps: "10 repetições" },
    { name: "Elevação frontal de braço com peso leve ou sem peso", exec: "Sentado(a) ou em pé, eleve um braço à frente até a altura do ombro e desça devagar. Pode ser feito sem peso ou com um peso bem leve, como uma garrafinha de água.", cuidado: "Se sentir desconforto no ombro, reduza a amplitude do movimento.", duracaoOuReps: "8 repetições em cada braço" },
    { name: "Abdução de quadril deitado(a)", exec: "Deitado(a) de lado sobre um tapete ou cama firme, com a cabeça apoiada no braço, eleve a perna de cima lentamente e desça.", cuidado: "Mantenha o quadril estável, sem girar o corpo para trás.", duracaoOuReps: "8 repetições em cada lado" },
    { name: "Ponte de quadril leve", exec: "Deitado(a) de costas, com os joelhos dobrados e os pés apoiados no chão, eleve o quadril levemente e desça com controle.", cuidado: "Eleve apenas até onde for confortável para a lombar.", duracaoOuReps: "8 a 10 repetições" },
    { name: "Aperto de mão com bola macia ou toalha", exec: "Segure uma bolinha macia ou uma toalha enrolada e aperte-a com a mão, segurando por alguns segundos, depois solte.", cuidado: "Não force se houver dor nas articulações das mãos.", duracaoOuReps: "10 repetições em cada mão" },
    ],
  },];

export type SeniorFeelingId = "otima" | "ok" | "dificil";

export interface SeniorFeeling {
  id: SeniorFeelingId;
  label: string;
}

export const FEELINGS: SeniorFeeling[] = [
  { id: "otima", label: "Ótima 😊" },
  { id: "ok", label: "Tranquila 🙂" },
  { id: "dificil", label: "Difícil 😕" },
];

export function getSeniorSessionById(id: string): SeniorSessionType {
  return SESSION_TYPES.find((s) => s.id === id) ?? SESSION_TYPES[0];
}

// Note: the prototype also has a getWeekKey() (ISO-week-number based) used
// purely to key its localStorage weeklyLog object. This port doesn't need an
// equivalent — the DB-backed weekly window is lib/date-br.ts's
// weekRangeBR(), which gives the same Monday-Sunday boundary as plain date
// strings and is what's used to count this week's completions against
// profiles.senior_freq_goal (see TerceiraIdadeBoard.tsx).
// completions (see TerceiraIdadeBoard.tsx / app/treino/page.tsx).
