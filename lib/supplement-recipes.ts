/**
 * Static fitness recipe catalog (shakes, pancakes, etc. using supplements)
 * for the Receitas Fit page.
 *
 * Ported verbatim from the prototype's `SUPPLEMENT_RECIPES` constant
 * (projeto_fenix_app_final.html, ~lines 15772-16263) via a brace-matched
 * extraction + vm eval (not hand-transcribed) across 53 entries.
 *
 * This is reference content, not user data, so it stays static TS data
 * rather than a Supabase table (see lib/marmita-suggestions.ts for the
 * same rationale).
 */

export interface SupplementRecipeIngredient {
  qty: number;
  unit: string;
  name: string;
}

export interface SupplementRecipe {
  name: string;
  goal: string;
  yield: number;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  supplements: string[];
  ingredients: SupplementRecipeIngredient[];
  prep: string[];
}

// Ported from `RS_GOALS` (projeto_fenix_app_final.html, ~line 15767). Note
// these keys ("ganho"/"emagrecimento"/"geral") are this page's own goal
// labels, distinct from the profile's Goal type (perder/ganhar/manter/
// recomp) in lib/database.types.ts — the prototype never unified them, so
// this port keeps them separate rather than inventing a mapping.
export const SUPPLEMENT_RECIPE_GOALS: { key: string; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "ganho", label: "Ganho de massa" },
  { key: "emagrecimento", label: "Emagrecimento" },
  { key: "geral", label: "Geral / Manutenção" },
];

const SUPPLEMENT_RECIPES_BASE: SupplementRecipe[] = [
  {
    name: "Vitamina de whey com banana e aveia",
    goal: "geral",
    yield: 1,
    kcal: 410,
    protein: 36,
    carb: 52,
    fat: 8,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana"
      },
      {
        qty: 3,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 250,
        unit: "ml",
        name: "Leite (integral ou desnatado)"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar homogêneo.",
      "Sirva na hora, gelado se preferir com pedras de gelo."
    ]
  },
  {
    name: "Shake hipercalórico caseiro (ganho de peso)",
    goal: "ganho",
    yield: 1,
    kcal: 900,
    protein: 48,
    carb: 95,
    fat: 32,
    supplements: [
      "Whey Protein",
      "Hipercalórico ou aveia extra"
    ],
    ingredients: [
      {
        qty: 400,
        unit: "ml",
        name: "Leite integral"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein"
      },
      {
        qty: 4,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Pasta de amendoim"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana"
      }
    ],
    prep: [
      "Bata todos os ingredientes no liquidificador até incorporar bem.",
      "Tome logo após bater, é bem calórico e denso — ideal pra quem tem dificuldade de bater kcal do dia."
    ]
  },
  {
    name: "Panqueca proteica de whey e banana",
    goal: "geral",
    yield: 2,
    kcal: 320,
    protein: 28,
    carb: 30,
    fat: 9,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 2,
        unit: "unid",
        name: "Ovos"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana amassada"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein"
      },
      {
        qty: 3,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Fermento em pó"
      }
    ],
    prep: [
      "Misture tudo até formar uma massa homogênea.",
      "Frite em fogo baixo numa frigideira antiaderente, virando quando aparecerem bolhas na superfície.",
      "Sirva com canela ou mel a gosto."
    ]
  },
  {
    name: "Bolinho proteico pós-treino",
    goal: "ganho",
    yield: 8,
    kcal: 145,
    protein: 9,
    carb: 16,
    fat: 5,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 2,
        unit: "unid",
        name: "Ovos"
      },
      {
        qty: 2,
        unit: "dose",
        name: "Whey protein"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana amassada"
      },
      {
        qty: 1,
        unit: "xíc",
        name: "Aveia em flocos"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Fermento em pó"
      }
    ],
    prep: [
      "Misture todos os ingredientes até formar uma massa.",
      "Coloque em forminhas de cupcake e leve ao forno preaquecido (180°C) por 15-18min.",
      "Rende 8 unidades, ótimo pra levar de lanche."
    ]
  },
  {
    name: "Iogurte com whey e granola",
    goal: "geral",
    yield: 1,
    kcal: 340,
    protein: 34,
    carb: 34,
    fat: 8,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 200,
        unit: "g",
        name: "Iogurte natural desnatado"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein"
      },
      {
        qty: 3,
        unit: "colher sopa",
        name: "Granola"
      },
      {
        qty: 1,
        unit: "punhado",
        name: "Frutas vermelhas"
      }
    ],
    prep: [
      "Misture o whey ao iogurte até dissolver bem (sem grumos).",
      "Finalize com a granola e as frutas por cima."
    ]
  },
  {
    name: "Mingau proteico de aveia com whey",
    goal: "ganho",
    yield: 1,
    kcal: 430,
    protein: 38,
    carb: 48,
    fat: 10,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 4,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 300,
        unit: "ml",
        name: "Leite"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Canela em pó"
      }
    ],
    prep: [
      "Cozinhe a aveia no leite em fogo baixo, mexendo, até engrossar.",
      "Retire do fogo, espere amornar um pouco e misture o whey (não adicione com o leite fervendo, pra não empelotar).",
      "Finalize com canela."
    ]
  },
  {
    name: "Brownie fit com whey",
    goal: "geral",
    yield: 9,
    kcal: 130,
    protein: 8,
    carb: 14,
    fat: 5,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 2,
        unit: "dose",
        name: "Whey protein sabor chocolate"
      },
      {
        qty: 3,
        unit: "colher sopa",
        name: "Cacau em pó"
      },
      {
        qty: 2,
        unit: "unid",
        name: "Ovos"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana amassada"
      },
      {
        qty: 100,
        unit: "ml",
        name: "Leite"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Fermento em pó"
      }
    ],
    prep: [
      "Misture todos os ingredientes secos e depois os úmidos, até formar uma massa homogênea.",
      "Despeje em uma forma pequena untada e leve ao forno preaquecido (180°C) por cerca de 20min.",
      "Deixe esfriar antes de cortar em 9 pedaços."
    ]
  },
  {
    name: "Smoothie verde com whey e creatina",
    goal: "geral",
    yield: 1,
    kcal: 290,
    protein: 30,
    carb: 30,
    fat: 5,
    supplements: [
      "Whey Protein",
      "Creatina"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor neutro ou baunilha)"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Creatina (3-5g)"
      },
      {
        qty: 1,
        unit: "punhado",
        name: "Espinafre"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana congelada"
      },
      {
        qty: 250,
        unit: "ml",
        name: "Água ou leite vegetal"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar bem liso.",
      "A creatina não tem sabor forte e dissolve bem — ótimo jeito de já tomar a dose do dia junto com o shake."
    ]
  },
  {
    name: "Overnight oats com whey",
    goal: "geral",
    yield: 1,
    kcal: 380,
    protein: 32,
    carb: 44,
    fat: 9,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 4,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein"
      },
      {
        qty: 200,
        unit: "ml",
        name: "Leite ou iogurte"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Chia (opcional)"
      },
      {
        qty: 1,
        unit: "punhado",
        name: "Frutas picadas"
      }
    ],
    prep: [
      "Misture tudo (menos as frutas) num pote com tampa.",
      "Deixe na geladeira de um dia pro outro.",
      "Pela manhã, misture bem e finalize com as frutas por cima."
    ]
  },
  {
    name: "Bowl proteico pós-treino",
    goal: "ganho",
    yield: 1,
    kcal: 520,
    protein: 40,
    carb: 60,
    fat: 14,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 200,
        unit: "g",
        name: "Iogurte natural"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana fatiada"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Granola"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Pasta de amendoim"
      }
    ],
    prep: [
      "Misture o whey ao iogurte até incorporar.",
      "Coloque num bowl e monte por cima com a banana, granola e pasta de amendoim."
    ]
  },
  {
    name: "Shake de ganho de peso reforçado",
    goal: "ganho",
    yield: 1,
    kcal: 1050,
    protein: 55,
    carb: 120,
    fat: 35,
    supplements: [
      "Hipercalórico",
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Hipercalórico (mass gainer)"
      },
      {
        qty: 400,
        unit: "ml",
        name: "Leite integral"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Pasta de amendoim"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana"
      },
      {
        qty: 3,
        unit: "colher sopa",
        name: "Aveia em flocos"
      }
    ],
    prep: [
      "Bata tudo no liquidificador.",
      "Ideal como reforço extra do dia pra quem tem dificuldade de bater a meta calórica só com comida sólida — não substitui as refeições principais."
    ]
  },
  {
    name: "Vitamina de whey com abacate (hipercalórico natural)",
    goal: "ganho",
    yield: 1,
    kcal: 560,
    protein: 35,
    carb: 38,
    fat: 28,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor neutro ou baunilha"
      },
      {
        qty: 0.5,
        unit: "unid",
        name: "Abacate"
      },
      {
        qty: 250,
        unit: "ml",
        name: "Leite"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Mel"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar cremoso.",
      "O abacate dá densidade calórica e cremosidade sem precisar de mais açúcar."
    ]
  },
  {
    name: "Gelatina proteica com whey",
    goal: "emagrecimento",
    yield: 2,
    kcal: 90,
    protein: 16,
    carb: 5,
    fat: 1,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "pct",
        name: "Gelatina em pó diet/zero"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein"
      },
      {
        qty: 300,
        unit: "ml",
        name: "Água"
      }
    ],
    prep: [
      "Prepare a gelatina conforme instruções da embalagem, mas com um pouco menos de água.",
      "Quando estiver morna (não quente), misture o whey até dissolver.",
      "Leve à geladeira até firmar. Ótima opção de lanche leve e proteico."
    ]
  },
  {
    name: "Café proteico pré-treino",
    goal: "geral",
    yield: 1,
    kcal: 180,
    protein: 26,
    carb: 12,
    fat: 2,
    supplements: [
      "Whey Protein",
      "Cafeína (do café)"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "xíc",
        name: "Café coado ou expresso, frio"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor baunilha ou chocolate"
      },
      {
        qty: 150,
        unit: "ml",
        name: "Leite ou leite vegetal gelado"
      },
      {
        qty: 3,
        unit: "pedra",
        name: "Gelo"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar espumoso.",
      "Bom como pré-treino leve: cafeína pra energia + proteína pra não treinar em jejum de aminoácido."
    ]
  },
  {
    name: "Pudim de chia com whey",
    goal: "emagrecimento",
    yield: 1,
    kcal: 260,
    protein: 28,
    carb: 18,
    fat: 9,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 3,
        unit: "colher sopa",
        name: "Chia"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein"
      },
      {
        qty: 250,
        unit: "ml",
        name: "Leite ou leite vegetal"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Adoçante (opcional)"
      }
    ],
    prep: [
      "Misture o whey no leite até dissolver, depois adicione a chia e mexa bem.",
      "Leve à geladeira por pelo menos 3h (ou de um dia pro outro) até ganhar consistência de pudim.",
      "Baixo carboidrato e alta saciedade, boa opção em fase de emagrecimento."
    ]
  },
  {
    name: "Shake de whey com morango e leite vegetal",
    goal: "emagrecimento",
    yield: 1,
    kcal: 220,
    protein: 27,
    carb: 16,
    fat: 4,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor morango ou baunilha"
      },
      {
        qty: 1,
        unit: "punhado",
        name: "Morangos"
      },
      {
        qty: 250,
        unit: "ml",
        name: "Leite vegetal (amêndoas ou coco light)"
      },
      {
        qty: 3,
        unit: "pedra",
        name: "Gelo"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar cremoso.",
      "Shake leve e refrescante, ótimo em dias mais quentes na fase de déficit calórico."
    ]
  },
  {
    name: "Creatina no suco de uva",
    goal: "geral",
    yield: 1,
    kcal: 60,
    protein: 0,
    carb: 15,
    fat: 0,
    supplements: [
      "Creatina"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Creatina (3-5g)"
      },
      {
        qty: 200,
        unit: "ml",
        name: "Suco de uva ou água"
      }
    ],
    prep: [
      "Misture a creatina no líquido até dissolver bem.",
      "Tome em qualquer horário do dia — o importante é a consistência diária, não o timing."
    ]
  },
  {
    name: "Vitamina de whey com manga e coco",
    goal: "ganho",
    yield: 1,
    kcal: 480,
    protein: 34,
    carb: 58,
    fat: 12,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor coco ou baunilha"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Manga"
      },
      {
        qty: 200,
        unit: "ml",
        name: "Leite de coco"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Aveia em flocos"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar homogêneo.",
      "Boa opção tropical pra somar calorias e proteína no dia."
    ]
  },
  {
    name: "Bolo proteico de caneca",
    goal: "geral",
    yield: 1,
    kcal: 280,
    protein: 26,
    carb: 24,
    fat: 9,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor chocolate"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Ovo"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Leite"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Fermento em pó"
      }
    ],
    prep: [
      "Misture tudo direto na caneca até formar uma massa homogênea.",
      "Leve ao micro-ondas por 1-2min (potência alta), até crescer e firmar.",
      "Sirva morno, é rápido pra um lanche proteico pós-treino."
    ]
  },
  {
    name: "Barrinha proteica caseira de whey e pasta de amendoim",
    goal: "ganho",
    yield: 6,
    kcal: 210,
    protein: 14,
    carb: 18,
    fat: 10,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 3,
        unit: "dose",
        name: "Whey protein sabor baunilha"
      },
      {
        qty: 4,
        unit: "colher sopa",
        name: "Pasta de amendoim"
      },
      {
        qty: 2,
        unit: "xíc",
        name: "Aveia em flocos"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Mel"
      }
    ],
    prep: [
      "Misture todos os ingredientes até formar uma massa consistente (ajuste líquido se estiver seca demais).",
      "Pressione numa forma retangular forrada e leve à geladeira por 1h.",
      "Corte em 6 barras. Boa opção pra levar na bolsa/mochila."
    ]
  },
  {
    name: "Iogurte grego com whey e mel",
    goal: "ganho",
    yield: 1,
    kcal: 350,
    protein: 35,
    carb: 32,
    fat: 8,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 200,
        unit: "g",
        name: "Iogurte grego integral"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Mel"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Castanhas picadas"
      }
    ],
    prep: [
      "Misture o whey ao iogurte até incorporar bem.",
      "Regue com mel e finalize com as castanhas por cima."
    ]
  },
  {
    name: "Água de coco com whey (hidratação pós-treino)",
    goal: "emagrecimento",
    yield: 1,
    kcal: 170,
    protein: 26,
    carb: 10,
    fat: 1,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 300,
        unit: "ml",
        name: "Água de coco"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor neutro ou baunilha"
      }
    ],
    prep: [
      "Bata rapidamente no liquidificador ou misture bem com um shaker.",
      "Repõe eletrólitos e proteína com poucas calorias, boa opção em dias quentes de treino."
    ]
  },
  {
    name: "Mousse proteico de cacau com whey",
    goal: "emagrecimento",
    yield: 2,
    kcal: 150,
    protein: 20,
    carb: 10,
    fat: 4,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor chocolate"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Cacau em pó"
      },
      {
        qty: 150,
        unit: "g",
        name: "Iogurte natural desnatado"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Adoçante (opcional)"
      }
    ],
    prep: [
      "Misture todos os ingredientes até ficar homogêneo e aerado.",
      "Leve à geladeira por 30min antes de servir para firmar um pouco mais."
    ]
  },
  {
    name: "Shake pré-treino com café e creatina",
    goal: "geral",
    yield: 1,
    kcal: 200,
    protein: 25,
    carb: 15,
    fat: 3,
    supplements: [
      "Whey Protein",
      "Creatina",
      "Cafeína (do café)"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "xíc",
        name: "Café coado gelado"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor baunilha"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Creatina (3-5g)"
      },
      {
        qty: 150,
        unit: "ml",
        name: "Leite ou leite vegetal"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar homogêneo.",
      "Combina energia da cafeína com a dose diária de creatina — tome 30-40min antes do treino."
    ]
  },
  {
    name: "Omelete proteico com albumina",
    goal: "geral",
    yield: 1,
    kcal: 260,
    protein: 32,
    carb: 4,
    fat: 12,
    supplements: [
      "Albumina"
    ],
    ingredients: [
      {
        qty: 2,
        unit: "unid",
        name: "Ovos"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Albumina em pó"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Água"
      },
      {
        qty: 1,
        unit: "pitada",
        name: "Sal e temperos a gosto"
      }
    ],
    prep: [
      "Bata os ovos com a albumina e a água até dissolver bem.",
      "Tempere e frite em fogo baixo numa frigideira antiaderente até firmar dos dois lados."
    ]
  },
  {
    name: "Shake hipercalórico de chocolate e amendoim",
    goal: "ganho",
    yield: 1,
    kcal: 820,
    protein: 46,
    carb: 80,
    fat: 30,
    supplements: [
      "Hipercalórico ou aveia extra",
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Hipercalórico sabor chocolate"
      },
      {
        qty: 350,
        unit: "ml",
        name: "Leite integral"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Pasta de amendoim"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Cacau em pó"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar bem cremoso.",
      "Ótimo reforço calórico extra do dia pra quem tem dificuldade de ganhar peso."
    ]
  },
  {
    name: "Salada de frango com proteína vegetal (topping crocante)",
    goal: "emagrecimento",
    yield: 1,
    kcal: 380,
    protein: 42,
    carb: 20,
    fat: 14,
    supplements: [
      "Proteína vegetal (ervilha/arroz)"
    ],
    ingredients: [
      {
        qty: 150,
        unit: "g",
        name: "Peito de frango grelhado"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Proteína vegetal em pó sabor neutro (misturada no molho)"
      },
      {
        qty: 1,
        unit: "punhado",
        name: "Folhas verdes variadas"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Azeite"
      }
    ],
    prep: [
      "Misture a proteína em pó com um pouco de água/limão pra formar um molho e tempere a salada.",
      "Monte a salada com as folhas e o frango fatiado por cima.",
      "Boa forma de aumentar a proteína de uma refeição sem shake."
    ]
  },
  {
    name: "Vitamina low carb de whey e pepino",
    goal: "emagrecimento",
    yield: 1,
    kcal: 150,
    protein: 26,
    carb: 8,
    fat: 2,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor neutro ou limão"
      },
      {
        qty: 0.5,
        unit: "unid",
        name: "Pepino"
      },
      {
        qty: 200,
        unit: "ml",
        name: "Água gelada"
      },
      {
        qty: 1,
        unit: "punhado",
        name: "Hortelã"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar bem líquido.",
      "Opção bem leve e refrescante pra dias de calor em fase de definição."
    ]
  },
  {
    name: "Panqueca de proteína vegetal com frutas vermelhas",
    goal: "geral",
    yield: 2,
    kcal: 300,
    protein: 24,
    carb: 32,
    fat: 8,
    supplements: [
      "Proteína vegetal (ervilha/arroz)"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Proteína vegetal sabor baunilha"
      },
      {
        qty: 3,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana amassada"
      },
      {
        qty: 150,
        unit: "ml",
        name: "Leite vegetal"
      },
      {
        qty: 1,
        unit: "punhado",
        name: "Frutas vermelhas"
      }
    ],
    prep: [
      "Misture todos os ingredientes (menos as frutas) até formar uma massa homogênea.",
      "Frite em fogo baixo numa frigideira antiaderente, virando quando aparecerem bolhas.",
      "Sirva com as frutas vermelhas por cima."
    ]
  },
  {
    name: "Shake noturno de caseína com canela",
    goal: "geral",
    yield: 1,
    kcal: 250,
    protein: 28,
    carb: 20,
    fat: 6,
    supplements: [
      "Caseína"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Caseína sabor baunilha"
      },
      {
        qty: 250,
        unit: "ml",
        name: "Leite ou leite vegetal"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Canela em pó"
      }
    ],
    prep: [
      "Bata a caseína no leite até dissolver bem (fica mais espesa que o whey).",
      "Tome cerca de 30-60min antes de dormir, pra sustentar aminoácidos durante a noite."
    ]
  },
  {
    name: "Smoothie bowl proteico de frutas vermelhas",
    goal: "emagrecimento",
    yield: 1,
    kcal: 260,
    protein: 28,
    carb: 28,
    fat: 5,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor frutas vermelhas ou baunilha"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana congelada"
      },
      {
        qty: 1,
        unit: "punhado",
        name: "Frutas vermelhas congeladas"
      },
      {
        qty: 100,
        unit: "ml",
        name: "Leite ou leite vegetal"
      }
    ],
    prep: [
      "Bata tudo no liquidificador usando pouco líquido, até virar um creme espesso (consistência de sorvete).",
      "Sirva em uma tigela e finalize com frutas frescas, granola ou sementes por cima."
    ]
  },
  {
    name: "Vitamina de whey com manga e hortelã",
    goal: "emagrecimento",
    yield: 1,
    kcal: 210,
    protein: 26,
    carb: 20,
    fat: 3,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor neutro ou baunilha"
      },
      {
        qty: 0.5,
        unit: "unid",
        name: "Manga"
      },
      {
        qty: 250,
        unit: "ml",
        name: "Água gelada"
      },
      {
        qty: 1,
        unit: "punhado",
        name: "Folhas de hortelã"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar bem homogêneo.",
      "Sirva gelado — opção leve e refrescante com poucas calorias."
    ]
  },
  {
    name: "Shake de whey com kiwi e limão",
    goal: "emagrecimento",
    yield: 1,
    kcal: 190,
    protein: 27,
    carb: 14,
    fat: 2,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor limão ou neutro"
      },
      {
        qty: 2,
        unit: "unid",
        name: "Kiwi"
      },
      {
        qty: 200,
        unit: "ml",
        name: "Água gelada"
      },
      {
        qty: 3,
        unit: "pedra",
        name: "Gelo"
      }
    ],
    prep: [
      "Bata todos os ingredientes no liquidificador até ficar homogêneo.",
      "Boa opção ácida e refrescante para dias quentes em fase de definição."
    ]
  },
  {
    name: "Picolé proteico de morango com whey",
    goal: "emagrecimento",
    yield: 4,
    kcal: 70,
    protein: 10,
    carb: 6,
    fat: 1,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor morango"
      },
      {
        qty: 200,
        unit: "g",
        name: "Morangos"
      },
      {
        qty: 200,
        unit: "ml",
        name: "Iogurte natural desnatado"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Adoçante (opcional)"
      }
    ],
    prep: [
      "Bata todos os ingredientes no liquidificador até ficar homogêneo.",
      "Distribua em 4 forminhas de picolé e leve ao freezer por pelo menos 4h.",
      "Ótima sobremesa proteica e baixa caloria."
    ]
  },
  {
    name: "Sorvete fit de whey e banana congelada",
    goal: "emagrecimento",
    yield: 2,
    kcal: 180,
    protein: 24,
    carb: 22,
    fat: 3,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 2,
        unit: "unid",
        name: "Banana congelada (em rodelas)"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor baunilha ou chocolate"
      },
      {
        qty: 50,
        unit: "ml",
        name: "Leite ou leite vegetal"
      }
    ],
    prep: [
      "Bata a banana congelada com o whey e o leite em um processador ou liquidificador potente, parando para raspar as laterais, até virar um creme tipo sorvete.",
      "Sirva na hora ou leve ao freezer por 20-30min para firmar mais."
    ]
  },
  {
    name: "Chia pudding de coco com whey (low carb)",
    goal: "emagrecimento",
    yield: 1,
    kcal: 230,
    protein: 26,
    carb: 12,
    fat: 9,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 3,
        unit: "colher sopa",
        name: "Chia"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor coco"
      },
      {
        qty: 200,
        unit: "ml",
        name: "Leite de coco light"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Coco ralado (opcional)"
      }
    ],
    prep: [
      "Misture o whey no leite de coco até dissolver bem, depois adicione a chia e mexa.",
      "Leve à geladeira por pelo menos 3h até engrossar.",
      "Finalize com coco ralado antes de servir."
    ]
  },
  {
    name: "Sopa cremosa proteica de abóbora com whey sem sabor",
    goal: "emagrecimento",
    yield: 2,
    kcal: 150,
    protein: 18,
    carb: 14,
    fat: 3,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 300,
        unit: "g",
        name: "Abóbora cozida"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor neutro"
      },
      {
        qty: 300,
        unit: "ml",
        name: "Caldo de legumes"
      },
      {
        qty: 1,
        unit: "pitada",
        name: "Sal, pimenta e noz-moscada a gosto"
      }
    ],
    prep: [
      "Bata a abóbora cozida com o caldo de legumes até ficar cremoso.",
      "Aqueça em fogo baixo, retire do fogo e só então misture o whey (sem ferver com o whey, para não talhar).",
      "Tempere e sirva quente."
    ]
  },
  {
    name: "Gelatina proteica de limão com colágeno",
    goal: "emagrecimento",
    yield: 2,
    kcal: 70,
    protein: 12,
    carb: 4,
    fat: 0,
    supplements: [
      "Colágeno"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "pct",
        name: "Gelatina em pó sabor limão diet/zero"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Colágeno hidrolisado em pó (sem sabor)"
      },
      {
        qty: 300,
        unit: "ml",
        name: "Água"
      }
    ],
    prep: [
      "Prepare a gelatina conforme instruções da embalagem.",
      "Quando estiver morna, misture o colágeno até dissolver bem.",
      "Leve à geladeira até firmar completamente."
    ]
  },
  {
    name: "Vitamina verde detox com whey e proteína vegetal",
    goal: "emagrecimento",
    yield: 1,
    kcal: 200,
    protein: 25,
    carb: 16,
    fat: 3,
    supplements: [
      "Whey Protein",
      "Proteína vegetal (ervilha/arroz)"
    ],
    ingredients: [
      {
        qty: 0.5,
        unit: "dose",
        name: "Whey protein sabor neutro"
      },
      {
        qty: 0.5,
        unit: "dose",
        name: "Proteína vegetal sabor neutro"
      },
      {
        qty: 1,
        unit: "punhado",
        name: "Couve"
      },
      {
        qty: 0.5,
        unit: "unid",
        name: "Maçã verde"
      },
      {
        qty: 250,
        unit: "ml",
        name: "Água gelada"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar bem líquido, coando se preferir uma textura mais fina.",
      "Combina as duas proteínas para variar a fonte de aminoácidos no dia."
    ]
  },
  {
    name: "Iogurte proteico com whey e canela (low carb)",
    goal: "emagrecimento",
    yield: 1,
    kcal: 180,
    protein: 28,
    carb: 10,
    fat: 3,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 150,
        unit: "g",
        name: "Iogurte natural desnatado"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor baunilha"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Canela em pó"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Adoçante (opcional)"
      }
    ],
    prep: [
      "Misture o whey ao iogurte até dissolver bem, sem grumos.",
      "Finalize com canela a gosto. Lanche rápido e com poucos carboidratos."
    ]
  },
  {
    name: "Pão proteico de whey e aveia",
    goal: "geral",
    yield: 8,
    kcal: 120,
    protein: 9,
    carb: 12,
    fat: 4,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 2,
        unit: "dose",
        name: "Whey protein sabor neutro ou baunilha"
      },
      {
        qty: 2,
        unit: "xíc",
        name: "Aveia em flocos (batida até virar farinha)"
      },
      {
        qty: 3,
        unit: "unid",
        name: "Ovos"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Fermento em pó"
      },
      {
        qty: 100,
        unit: "ml",
        name: "Leite"
      }
    ],
    prep: [
      "Bata a aveia no liquidificador até virar farinha e misture com os demais ingredientes secos.",
      "Adicione os ovos e o leite e misture até formar uma massa homogênea.",
      "Despeje em uma forma de pão untada e leve ao forno preaquecido (180°C) por cerca de 35-40min.",
      "Deixe esfriar antes de fatiar (rende cerca de 8 fatias)."
    ]
  },
  {
    name: "Biscoito proteico de whey e canela",
    goal: "geral",
    yield: 10,
    kcal: 80,
    protein: 6,
    carb: 8,
    fat: 3,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 2,
        unit: "dose",
        name: "Whey protein sabor baunilha ou canela"
      },
      {
        qty: 1,
        unit: "xíc",
        name: "Aveia em flocos"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana amassada"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Canela em pó"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Água (se necessário)"
      }
    ],
    prep: [
      "Misture todos os ingredientes até formar uma massa que dê para moldar (ajuste com água se estiver seca).",
      "Molde bolinhas achatadas e disponha em uma assadeira forrada.",
      "Asse em forno preaquecido (180°C) por 12-15min, até dourar levemente. Rende cerca de 10 biscoitos."
    ]
  },
  {
    name: "Muffin fit de whey e cenoura",
    goal: "geral",
    yield: 6,
    kcal: 150,
    protein: 11,
    carb: 16,
    fat: 5,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 2,
        unit: "dose",
        name: "Whey protein sabor baunilha"
      },
      {
        qty: 1,
        unit: "xíc",
        name: "Cenoura ralada"
      },
      {
        qty: 2,
        unit: "unid",
        name: "Ovos"
      },
      {
        qty: 1,
        unit: "xíc",
        name: "Aveia em flocos"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Fermento em pó"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Canela em pó"
      }
    ],
    prep: [
      "Misture todos os ingredientes até formar uma massa homogênea.",
      "Distribua em 6 forminhas de muffin untadas.",
      "Leve ao forno preaquecido (180°C) por cerca de 20min, até dourar e firmar no centro."
    ]
  },
  {
    name: "Torta proteica de whey e maçã",
    goal: "geral",
    yield: 8,
    kcal: 170,
    protein: 12,
    carb: 20,
    fat: 5,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 2,
        unit: "dose",
        name: "Whey protein sabor baunilha ou canela"
      },
      {
        qty: 2,
        unit: "unid",
        name: "Maçã (uma ralada, uma em fatias para decorar)"
      },
      {
        qty: 3,
        unit: "unid",
        name: "Ovos"
      },
      {
        qty: 1,
        unit: "xíc",
        name: "Aveia em flocos"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Fermento em pó"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Canela em pó"
      }
    ],
    prep: [
      "Misture o whey, a aveia, a maçã ralada, os ovos, o fermento e a canela até formar uma massa homogênea.",
      "Despeje em uma forma untada e decore com as fatias de maçã por cima.",
      "Asse em forno preaquecido (180°C) por cerca de 30min. Rende 8 fatias."
    ]
  },
  {
    name: "Panqueca salgada de whey sem sabor com queijo",
    goal: "geral",
    yield: 2,
    kcal: 290,
    protein: 30,
    carb: 8,
    fat: 14,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor neutro (sem sabor)"
      },
      {
        qty: 2,
        unit: "unid",
        name: "Ovos"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Queijo ralado"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Água"
      },
      {
        qty: 1,
        unit: "pitada",
        name: "Sal e temperos a gosto"
      }
    ],
    prep: [
      "Bata os ovos com o whey sem sabor e a água até dissolver bem, sem grumos.",
      "Tempere e adicione o queijo ralado à massa.",
      "Frite em fogo baixo numa frigideira antiaderente, virando quando firmar.",
      "Ótima opção salgada para variar do shake doce."
    ]
  },
  {
    name: "Bowl de aveia overnight com whey e frutas tropicais",
    goal: "geral",
    yield: 1,
    kcal: 400,
    protein: 32,
    carb: 50,
    fat: 9,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 4,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor coco ou baunilha"
      },
      {
        qty: 200,
        unit: "ml",
        name: "Leite de coco light ou leite comum"
      },
      {
        qty: 1,
        unit: "punhado",
        name: "Manga e abacaxi picados"
      }
    ],
    prep: [
      "Misture a aveia e o whey no leite dentro de um pote com tampa.",
      "Deixe na geladeira de um dia para o outro.",
      "Pela manhã, finalize com a manga e o abacaxi picados por cima."
    ]
  },
  {
    name: "Shake pós-treino de whey com abacaxi e coco",
    goal: "geral",
    yield: 1,
    kcal: 300,
    protein: 30,
    carb: 34,
    fat: 6,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor coco ou baunilha"
      },
      {
        qty: 1,
        unit: "xíc",
        name: "Abacaxi picado"
      },
      {
        qty: 200,
        unit: "ml",
        name: "Água de coco"
      },
      {
        qty: 3,
        unit: "pedra",
        name: "Gelo"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar bem homogêneo.",
      "Combinação tropical que repõe eletrólitos e proteína logo após o treino."
    ]
  },
  {
    name: "Batida calórica de hipercalórico com manga e leite condensado",
    goal: "ganho",
    yield: 1,
    kcal: 980,
    protein: 50,
    carb: 130,
    fat: 28,
    supplements: [
      "Hipercalórico",
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Hipercalórico (mass gainer) sabor baunilha"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Manga"
      },
      {
        qty: 400,
        unit: "ml",
        name: "Leite integral"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Leite condensado"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar homogêneo.",
      "Batida bem densa em calorias, ideal para quem tem muita dificuldade de ganhar peso — use com moderação, não é para o dia a dia todo."
    ]
  },
  {
    name: "Vitamina hipercalórica de whey com aveia e mel turbinada",
    goal: "ganho",
    yield: 1,
    kcal: 750,
    protein: 44,
    carb: 90,
    fat: 22,
    supplements: [
      "Whey Protein",
      "Hipercalórico ou aveia extra"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor baunilha"
      },
      {
        qty: 5,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Mel"
      },
      {
        qty: 400,
        unit: "ml",
        name: "Leite integral"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até incorporar bem.",
      "Reforço calórico simples de fazer, usando aveia e mel como fonte extra de carboidrato."
    ]
  },
  {
    name: "Shake de creatina e hipercalórico com cacau",
    goal: "ganho",
    yield: 1,
    kcal: 850,
    protein: 42,
    carb: 100,
    fat: 24,
    supplements: [
      "Creatina",
      "Hipercalórico"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Hipercalórico sabor chocolate"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Creatina (3-5g)"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Cacau em pó"
      },
      {
        qty: 400,
        unit: "ml",
        name: "Leite integral"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar homogêneo.",
      "Une o reforço calórico do hipercalórico com a dose diária de creatina em uma única batida."
    ]
  },
  {
    name: "Mingau hipercalórico de aveia com pasta de amendoim e whey",
    goal: "ganho",
    yield: 1,
    kcal: 620,
    protein: 36,
    carb: 62,
    fat: 22,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 5,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 350,
        unit: "ml",
        name: "Leite integral"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein sabor baunilha"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Pasta de amendoim"
      }
    ],
    prep: [
      "Cozinhe a aveia no leite em fogo baixo, mexendo, até engrossar.",
      "Retire do fogo, deixe amornar e misture o whey e a pasta de amendoim.",
      "Café da manhã bem calórico, ótimo para fase de ganho de massa."
    ]
  },
  {
    name: "Bolo proteico de caneca com hipercalórico e banana",
    goal: "ganho",
    yield: 1,
    kcal: 480,
    protein: 28,
    carb: 52,
    fat: 16,
    supplements: [
      "Hipercalórico ou aveia extra"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Hipercalórico sabor chocolate ou baunilha"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Ovo"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana amassada"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Leite integral"
      },
      {
        qty: 1,
        unit: "colher chá",
        name: "Fermento em pó"
      }
    ],
    prep: [
      "Misture tudo direto na caneca até formar uma massa homogênea.",
      "Leve ao micro-ondas por 1-2min (potência alta), até crescer e firmar.",
      "Versão mais calórica do bolo de caneca, boa para fechar a meta de kcal do dia."
    ]
  },
  {
    name: "Shake hipercalórico de banana com castanha-do-pará",
    goal: "ganho",
    yield: 1,
    kcal: 870,
    protein: 45,
    carb: 85,
    fat: 34,
    supplements: [
      "Hipercalórico",
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Hipercalórico sabor baunilha"
      },
      {
        qty: 2,
        unit: "unid",
        name: "Banana"
      },
      {
        qty: 4,
        unit: "unid",
        name: "Castanha-do-pará"
      },
      {
        qty: 400,
        unit: "ml",
        name: "Leite integral"
      }
    ],
    prep: [
      "Bata tudo no liquidificador até ficar bem cremoso.",
      "As castanhas somam gorduras boas e mais densidade calórica à batida."
    ]
  }
];

/**
 * EXTRA block — 25 additional fit recipes. Macros are PER SERVING (same as the
 * original entries) and were computed offline by summing FOOD_DB values over the
 * ingredient quantities and dividing by `yield`.
 * HONESTY NOTE: the underlying nutrient values come from the author's knowledge of
 * TACO/USDA tables and typical supplement labels (whey ~24 g protein per scoop,
 * collagen/plant protein doses assumed), NOT from an online lookup; check your own
 * product's label for exact numbers.
 */
const SUPPLEMENT_RECIPES_EXTRA: SupplementRecipe[] = [
  {
    name: "Shake de whey com pasta de amendoim e banana",
    goal: "ganho",
    yield: 1,
    kcal: 565,
    protein: 41,
    carb: 57,
    fat: 21,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Pasta de amendoim"
      },
      {
        qty: 300,
        unit: "ml",
        name: "Leite integral"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Aveia em flocos"
      }
    ],
    prep: [
      "Bata todos os ingredientes no liquidificador até ficar cremoso.",
      "Sirva gelado logo após o treino."
    ]
  },
  {
    name: "Vitamina de whey com mamão e linhaça",
    goal: "emagrecimento",
    yield: 1,
    kcal: 329,
    protein: 35,
    carb: 35,
    fat: 6,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 150,
        unit: "g",
        name: "Mamão"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Linhaça"
      },
      {
        qty: 250,
        unit: "ml",
        name: "Leite desnatado"
      }
    ],
    prep: [
      "Bata tudo no liquidificador com gelo.",
      "A linhaça ajuda na saciedade e no trânsito intestinal."
    ]
  },
  {
    name: "Cappuccino proteico gelado",
    goal: "emagrecimento",
    yield: 1,
    kcal: 176,
    protein: 29,
    carb: 10,
    fat: 1,
    supplements: [
      "Whey Protein",
      "Cafeína (do café)"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 100,
        unit: "ml",
        name: "Café forte frio"
      },
      {
        qty: 150,
        unit: "ml",
        name: "Leite desnatado"
      },
      {
        qty: 4,
        unit: "pedra",
        name: "Gelo"
      }
    ],
    prep: [
      "Bata o café frio, o leite, o gelo e o whey no liquidificador.",
      "Sirva imediatamente; ótimo como pré-treino leve."
    ]
  },
  {
    name: "Pudim proteico de iogurte grego e chocolate",
    goal: "geral",
    yield: 2,
    kcal: 217,
    protein: 22,
    carb: 10,
    fat: 10,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 200,
        unit: "g",
        name: "Iogurte grego natural"
      },
      {
        qty: 20,
        unit: "g",
        name: "Chocolate amargo 70%"
      }
    ],
    prep: [
      "Derreta o chocolate e misture ao iogurte e ao whey até ficar liso.",
      "Divida em 2 potes e leve à geladeira por 2 horas."
    ]
  },
  {
    name: "Panqueca proteica de aveia, claras e whey",
    goal: "emagrecimento",
    yield: 2,
    kcal: 256,
    protein: 24,
    carb: 33,
    fat: 3,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 6,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 4,
        unit: "unid",
        name: "Claras de ovo"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana"
      }
    ],
    prep: [
      "Bata aveia, claras, whey e banana no liquidificador.",
      "Cozinhe em frigideira antiaderente, dos dois lados, em 2 porções.",
      "Sirva com frutas."
    ]
  },
  {
    name: "Waffle proteico de whey e aveia",
    goal: "geral",
    yield: 2,
    kcal: 252,
    protein: 21,
    carb: 27,
    fat: 7,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 2,
        unit: "unid",
        name: "Ovos"
      },
      {
        qty: 4,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana"
      }
    ],
    prep: [
      "Bata todos os ingredientes.",
      "Despeje na máquina de waffle untada e asse até dourar."
    ]
  },
  {
    name: "Overnight de caseína com cacau e morango",
    goal: "geral",
    yield: 1,
    kcal: 384,
    protein: 36,
    carb: 43,
    fat: 8,
    supplements: [
      "Caseína"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Caseína"
      },
      {
        qty: 150,
        unit: "ml",
        name: "Leite desnatado"
      },
      {
        qty: 3,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 100,
        unit: "g",
        name: "Morango"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Chia"
      }
    ],
    prep: [
      "Misture caseína, leite, aveia e chia num pote e leve à geladeira por 6 horas.",
      "Cubra com morangos antes de servir."
    ]
  },
  {
    name: "Smoothie de albumina com abacaxi e hortelã",
    goal: "emagrecimento",
    yield: 1,
    kcal: 239,
    protein: 25,
    carb: 36,
    fat: 0,
    supplements: [
      "Albumina"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Albumina"
      },
      {
        qty: 150,
        unit: "g",
        name: "Abacaxi"
      },
      {
        qty: 200,
        unit: "ml",
        name: "Água de coco"
      },
      {
        qty: 5,
        unit: "folha",
        name: "Hortelã"
      }
    ],
    prep: [
      "Bata todos os ingredientes com gelo.",
      "Albumina rende melhor batida: evite aquecer."
    ]
  },
  {
    name: "Sorvete proteico de açaí e whey",
    goal: "geral",
    yield: 2,
    kcal: 180,
    protein: 15,
    carb: 22,
    fat: 5,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 200,
        unit: "g",
        name: "Açaí congelado (sem açúcar)"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana congelada"
      },
      {
        qty: 100,
        unit: "ml",
        name: "Leite desnatado"
      }
    ],
    prep: [
      "Bata o açaí congelado, a banana, o whey e o leite até cremoso.",
      "Divida em 2 taças."
    ]
  },
  {
    name: "Shake de recuperação com whey, banana e mel",
    goal: "ganho",
    yield: 1,
    kcal: 545,
    protein: 36,
    carb: 80,
    fat: 11,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 2,
        unit: "unid",
        name: "Banana"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Mel"
      },
      {
        qty: 300,
        unit: "ml",
        name: "Leite integral"
      }
    ],
    prep: [
      "Bata tudo no liquidificador.",
      "Carboidrato rápido do mel e da banana ajuda a repor o glicogênio."
    ]
  },
  {
    name: "Mingau de aveia com colágeno e canela",
    goal: "geral",
    yield: 1,
    kcal: 280,
    protein: 23,
    carb: 39,
    fat: 3,
    supplements: [
      "Colágeno"
    ],
    ingredients: [
      {
        qty: 4,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 250,
        unit: "ml",
        name: "Leite desnatado"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Colágeno hidrolisado (10 g)"
      },
      {
        qty: 1,
        unit: "pitada",
        name: "Canela"
      }
    ],
    prep: [
      "Cozinhe a aveia com o leite em fogo baixo até engrossar.",
      "Fora do fogo, misture o colágeno e a canela."
    ]
  },
  {
    name: "Creme de abacate proteico com whey e mel",
    goal: "ganho",
    yield: 1,
    kcal: 546,
    protein: 34,
    carb: 43,
    fat: 30,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 150,
        unit: "g",
        name: "Abacate"
      },
      {
        qty: 200,
        unit: "ml",
        name: "Leite integral"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Mel"
      }
    ],
    prep: [
      "Bata o abacate com o leite, o whey e o mel até ficar um creme liso.",
      "Sirva gelado."
    ]
  },
  {
    name: "Shake de proteína vegetal com banana e pasta de amendoim",
    goal: "geral",
    yield: 1,
    kcal: 434,
    protein: 37,
    carb: 41,
    fat: 16,
    supplements: [
      "Proteína vegetal (ervilha/arroz)"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Proteína vegetal (ervilha/arroz)"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Pasta de amendoim"
      },
      {
        qty: 300,
        unit: "ml",
        name: "Bebida de soja"
      }
    ],
    prep: [
      "Bata todos os ingredientes até ficar homogêneo.",
      "Opção sem lactose e sem whey."
    ]
  },
  {
    name: "Panqueca de proteína vegetal e banana",
    goal: "geral",
    yield: 2,
    kcal: 202,
    protein: 16,
    carb: 28,
    fat: 3,
    supplements: [
      "Proteína vegetal (ervilha/arroz)"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Proteína vegetal (ervilha/arroz)"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana"
      },
      {
        qty: 4,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 100,
        unit: "ml",
        name: "Leite de soja"
      }
    ],
    prep: [
      "Bata tudo no liquidificador.",
      "Cozinhe 2 panquecas em frigideira antiaderente."
    ]
  },
  {
    name: "Bolo de caneca de whey e cacau (low carb)",
    goal: "emagrecimento",
    yield: 1,
    kcal: 212,
    protein: 30,
    carb: 7,
    fat: 7,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Ovo"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Cacau em pó"
      },
      {
        qty: 50,
        unit: "ml",
        name: "Leite de amêndoas"
      },
      {
        qty: 1,
        unit: "pitada",
        name: "Fermento em pó"
      }
    ],
    prep: [
      "Misture tudo numa caneca grande.",
      "Micro-ondas por 1 minuto a 1 minuto e meio."
    ]
  },
  {
    name: "Iogurte grego com whey, banana e creatina",
    goal: "ganho",
    yield: 1,
    kcal: 343,
    protein: 31,
    carb: 32,
    fat: 11,
    supplements: [
      "Whey Protein",
      "Creatina"
    ],
    ingredients: [
      {
        qty: 200,
        unit: "g",
        name: "Iogurte grego natural"
      },
      {
        qty: 0.5,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana"
      },
      {
        qty: 5,
        unit: "g",
        name: "Creatina monoidratada"
      }
    ],
    prep: [
      "Misture o iogurte com o whey e a creatina.",
      "Cubra com banana fatiada.",
      "A creatina é sem calorias relevantes; tome diariamente na mesma dose."
    ]
  },
  {
    name: "Shake hipercalórico de aveia, banana e pasta de amendoim",
    goal: "ganho",
    yield: 1,
    kcal: 966,
    protein: 55,
    carb: 114,
    fat: 35,
    supplements: [
      "Whey Protein",
      "Hipercalórico ou aveia extra"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 6,
        unit: "colher sopa",
        name: "Aveia em flocos"
      },
      {
        qty: 2,
        unit: "unid",
        name: "Banana"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Pasta de amendoim"
      },
      {
        qty: 400,
        unit: "ml",
        name: "Leite integral"
      }
    ],
    prep: [
      "Bata tudo até ficar bem cremoso.",
      "Tome entre as refeições para aumentar a ingestão calórica."
    ]
  },
  {
    name: "Vitamina verde proteica com couve e maçã",
    goal: "emagrecimento",
    yield: 1,
    kcal: 290,
    protein: 25,
    carb: 45,
    fat: 2,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 40,
        unit: "g",
        name: "Couve crua"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Maçã"
      },
      {
        qty: 200,
        unit: "ml",
        name: "Água de coco"
      },
      {
        qty: 5,
        unit: "g",
        name: "Gengibre"
      }
    ],
    prep: [
      "Bata a couve, a maçã, o gengibre e a água de coco; por último o whey.",
      "Coe se preferir mais líquido."
    ]
  },
  {
    name: "Pão de queijo proteico de tapioca e whey",
    goal: "geral",
    yield: 8,
    kcal: 99,
    protein: 7,
    carb: 12,
    fat: 3,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 100,
        unit: "g",
        name: "Goma de tapioca"
      },
      {
        qty: 40,
        unit: "g",
        name: "Queijo parmesão ralado"
      },
      {
        qty: 2,
        unit: "unid",
        name: "Ovos"
      },
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 60,
        unit: "ml",
        name: "Leite desnatado"
      }
    ],
    prep: [
      "Misture tudo até formar uma massa que desgrude das mãos.",
      "Modele 8 bolinhas e asse a 200 °C por 20 a 25 minutos."
    ]
  },
  {
    name: "Muffin salgado de albumina e legumes",
    goal: "emagrecimento",
    yield: 6,
    kcal: 109,
    protein: 14,
    carb: 4,
    fat: 4,
    supplements: [
      "Albumina"
    ],
    ingredients: [
      {
        qty: 2,
        unit: "dose",
        name: "Albumina"
      },
      {
        qty: 4,
        unit: "unid",
        name: "Ovos"
      },
      {
        qty: 150,
        unit: "g",
        name: "Abobrinha ralada"
      },
      {
        qty: 100,
        unit: "g",
        name: "Cenoura ralada"
      },
      {
        qty: 100,
        unit: "g",
        name: "Queijo cottage"
      }
    ],
    prep: [
      "Misture todos os ingredientes e tempere.",
      "Distribua em forminhas e asse a 180 °C por 25 minutos."
    ]
  },
  {
    name: "Cookie proteico de aveia e whey",
    goal: "geral",
    yield: 10,
    kcal: 126,
    protein: 8,
    carb: 15,
    fat: 4,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 120,
        unit: "g",
        name: "Aveia em flocos"
      },
      {
        qty: 2,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 2,
        unit: "unid",
        name: "Banana madura"
      },
      {
        qty: 2,
        unit: "colher sopa",
        name: "Pasta de amendoim"
      },
      {
        qty: 30,
        unit: "g",
        name: "Chocolate amargo em gotas"
      }
    ],
    prep: [
      "Amasse as bananas e misture com os demais ingredientes.",
      "Modele 10 cookies e asse a 180 °C por 15 minutos."
    ]
  },
  {
    name: "Mousse de maracujá proteico",
    goal: "emagrecimento",
    yield: 2,
    kcal: 158,
    protein: 24,
    carb: 13,
    fat: 2,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 300,
        unit: "g",
        name: "Iogurte proteico (skyr)"
      },
      {
        qty: 100,
        unit: "g",
        name: "Polpa de maracujá"
      },
      {
        qty: 0.5,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      }
    ],
    prep: [
      "Misture o skyr com a polpa de maracujá e o whey de baunilha.",
      "Leve à geladeira por 1 hora e sirva em 2 taças."
    ]
  },
  {
    name: "Omelete de claras com espinafre e cottage",
    goal: "emagrecimento",
    yield: 1,
    kcal: 219,
    protein: 31,
    carb: 5,
    fat: 8,
    supplements: [
      "Albumina"
    ],
    ingredients: [
      {
        qty: 5,
        unit: "unid",
        name: "Claras de ovo"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Ovo"
      },
      {
        qty: 50,
        unit: "g",
        name: "Espinafre refogado"
      },
      {
        qty: 50,
        unit: "g",
        name: "Queijo cottage"
      }
    ],
    prep: [
      "Bata claras e ovo com sal.",
      "Cozinhe na frigideira antiaderente, recheie com espinafre e cottage e dobre."
    ]
  },
  {
    name: "Shake noturno de caseína com pasta de amendoim",
    goal: "ganho",
    yield: 1,
    kcal: 489,
    protein: 39,
    carb: 43,
    fat: 20,
    supplements: [
      "Caseína"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Caseína"
      },
      {
        qty: 300,
        unit: "ml",
        name: "Leite integral"
      },
      {
        qty: 1,
        unit: "colher sopa",
        name: "Pasta de amendoim"
      },
      {
        qty: 1,
        unit: "unid",
        name: "Banana"
      }
    ],
    prep: [
      "Bata tudo no liquidificador.",
      "A caseína digere devagar: boa opção antes de dormir."
    ]
  },
  {
    name: "Picolé de whey com frutas vermelhas",
    goal: "emagrecimento",
    yield: 4,
    kcal: 76,
    protein: 8,
    carb: 9,
    fat: 1,
    supplements: [
      "Whey Protein"
    ],
    ingredients: [
      {
        qty: 1,
        unit: "dose",
        name: "Whey protein (sabor baunilha ou chocolate)"
      },
      {
        qty: 150,
        unit: "g",
        name: "Morango"
      },
      {
        qty: 100,
        unit: "g",
        name: "Framboesa"
      },
      {
        qty: 150,
        unit: "g",
        name: "Iogurte natural desnatado"
      },
      {
        qty: 100,
        unit: "ml",
        name: "Água"
      }
    ],
    prep: [
      "Bata todos os ingredientes.",
      "Despeje em forminhas de picolé e leve ao freezer por 4 horas."
    ]
  }
];

export const SUPPLEMENT_RECIPES: SupplementRecipe[] = [...SUPPLEMENT_RECIPES_BASE, ...SUPPLEMENT_RECIPES_EXTRA];
