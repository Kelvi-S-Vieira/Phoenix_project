/**
 * Static meal-prep ("marmita") suggestion catalog for the Marmitas page.
 *
 * Ported verbatim from the prototype's `SUGGESTED_RECIPES` constant
 * (projeto_fenix_app_final.html, ~lines 12971-15163) via a brace-matched
 * extraction + vm eval (not hand-transcribed) to avoid transcription errors
 * across 145 entries.
 *
 * This is reference content (meal ideas), not user data, so it stays
 * static TS data rather than a Supabase table — same pattern as
 * lib/food-database.ts and the treino-*-data.ts exercise pools. A user
 * "adds" one of these to their own list by inserting a copy into the
 * `user_recipes` table (see app/alimentacao/marmitas).
 */

export interface MarmitaIngredient {
  name: string;
  qty: number;
  unit: string;
}

export interface MarmitaSuggestion {
  category: string;
  name: string;
  yield: number;
  kcal: number;
  protein: number;
  fast?: boolean;
  vegan?: boolean;
  ingredients: MarmitaIngredient[];
  prep: string[];
}

// Ported from `SUGG_CATEGORIES` (projeto_fenix_app_final.html, ~line 15036).
export const MARMITA_CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "almoco", label: "Almoço / Jantar" },
  { key: "cafe", label: "Café da manhã" },
  { key: "lanche", label: "Lanche / Pré-treino" },
  { key: "sanduiche", label: "Sanduíches" },
  { key: "vegetariana", label: "🌱 Vegetariana/Vegana" },
  { key: "sobremesa", label: "🍰 Sobremesas Fit" },
];

export const MARMITA_SUGGESTIONS: MarmitaSuggestion[] = [
  {
    category: "almoco",
    name: "Frango grelhado, batata-doce e brócolis",
    yield: 4,
    kcal: 700,
    protein: 69,
    ingredients: [
      {
        name: "Peito de frango",
        qty: 800,
        unit: "g"
      },
      {
        name: "Batata-doce",
        qty: 1200,
        unit: "g"
      },
      {
        name: "Brócolis",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Azeite",
        qty: 2,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Tempere o frango e grelhe em fogo médio até dourar e cozinhar por dentro.",
      "Cozinhe a batata-doce em cubos no vapor ou fervendo até ficar macia.",
      "Refogue o brócolis rapidamente no azeite, sem passar do ponto.",
      "Divida em 4 potes: frango + batata-doce + brócolis."
    ]
  },
  {
    category: "almoco",
    name: "Patinho moído com arroz e legumes",
    yield: 4,
    kcal: 495,
    protein: 54,
    ingredients: [
      {
        name: "Patinho moído (magro)",
        qty: 800,
        unit: "g"
      },
      {
        name: "Arroz",
        qty: 3,
        unit: "xíc"
      },
      {
        name: "Cenoura",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Molho de tomate",
        qty: 200,
        unit: "ml"
      }
    ],
    prep: [
      "Refogue a cebola picada, adicione a carne moída e cozinhe até soltar a água e dourar.",
      "Junte o molho de tomate e a cenoura em cubos pequenos, cozinhe até a cenoura amaciar.",
      "Cozinhe o arroz separadamente.",
      "Monte as marmitas com arroz + carne com legumes."
    ]
  },
  {
    category: "almoco",
    name: "Tilápia com purê de mandioquinha e vagem",
    yield: 4,
    kcal: 403,
    protein: 42,
    ingredients: [
      {
        name: "Filé de tilápia",
        qty: 800,
        unit: "g"
      },
      {
        name: "Mandioquinha",
        qty: 900,
        unit: "g"
      },
      {
        name: "Vagem",
        qty: 400,
        unit: "g"
      },
      {
        name: "Limão",
        qty: 2,
        unit: "unid"
      }
    ],
    prep: [
      "Tempere a tilápia com limão, sal e pimenta e grelhe ou asse até cozinhar por completo.",
      "Cozinhe a mandioquinha até ficar bem macia e amasse até virar purê.",
      "Cozinhe a vagem no vapor até ficar al dente.",
      "Monte as marmitas com peixe + purê + vagem."
    ]
  },
  {
    category: "almoco",
    name: "Frango desfiado com arroz integral e legumes salteados",
    yield: 4,
    kcal: 527,
    protein: 64,
    ingredients: [
      {
        name: "Peito de frango desfiado",
        qty: 800,
        unit: "g"
      },
      {
        name: "Arroz integral",
        qty: 3,
        unit: "xíc"
      },
      {
        name: "Abobrinha",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Pimentão",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Cozinhe o peito de frango, deixe esfriar um pouco e desfie.",
      "Cozinhe o arroz integral normalmente.",
      "Corte abobrinha e pimentão em cubos e salteie em fogo alto.",
      "Monte as marmitas com arroz + legumes + frango desfiado."
    ]
  },
  {
    category: "almoco",
    name: "Atum com macarrão integral e molho leve",
    yield: 3,
    kcal: 494,
    protein: 67,
    ingredients: [
      {
        name: "Atum em lata (água)",
        qty: 6,
        unit: "lata"
      },
      {
        name: "Macarrão integral",
        qty: 450,
        unit: "g"
      },
      {
        name: "Molho de tomate",
        qty: 300,
        unit: "ml"
      },
      {
        name: "Alho",
        qty: 3,
        unit: "dente"
      }
    ],
    prep: [
      "Cozinhe o macarrão integral conforme instruções da embalagem.",
      "Refogue o alho picado, adicione o molho de tomate e deixe reduzir um pouco.",
      "Escorra o atum e misture ao molho já no fim, sem cozinhar demais.",
      "Misture tudo com o macarrão e divida em 3 potes."
    ]
  },
  {
    category: "almoco",
    name: "Carne de panela desfiada com arroz e feijão",
    yield: 4,
    kcal: 726,
    protein: 65,
    ingredients: [
      {
        name: "Acém ou músculo (magro)",
        qty: 800,
        unit: "g"
      },
      {
        name: "Arroz",
        qty: 3,
        unit: "xíc"
      },
      {
        name: "Feijão cozido",
        qty: 500,
        unit: "g"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Louro",
        qty: 2,
        unit: "folha"
      }
    ],
    prep: [
      "Doure a carne em panela de pressão com cebola e louro.",
      "Cubra com água e cozinhe na pressão até desfiar facilmente (~40min).",
      "Desfie a carne e reduza o caldo restante para dar sabor.",
      "Sirva com arroz e feijão já prontos, dividido em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Frango ao curry com arroz integral",
    yield: 4,
    kcal: 562,
    protein: 64,
    ingredients: [
      {
        name: "Peito de frango",
        qty: 800,
        unit: "g"
      },
      {
        name: "Arroz integral",
        qty: 3,
        unit: "xíc"
      },
      {
        name: "Leite de coco light",
        qty: 200,
        unit: "ml"
      },
      {
        name: "Curry em pó",
        qty: 1,
        unit: "colher sopa"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Corte o frango em cubos e doure com a cebola picada.",
      "Junte o curry em pó e refogue por 1 minuto para liberar o aroma.",
      "Adicione o leite de coco e cozinhe em fogo baixo até engrossar levemente.",
      "Sirva com arroz integral, dividido em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Salmão grelhado com quinoa e aspargos",
    yield: 3,
    kcal: 611,
    protein: 44,
    ingredients: [
      {
        name: "Salmão",
        qty: 600,
        unit: "g"
      },
      {
        name: "Quinoa",
        qty: 2.25,
        unit: "xíc"
      },
      {
        name: "Aspargos",
        qty: 2,
        unit: "maço"
      },
      {
        name: "Azeite",
        qty: 2,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Tempere o salmão e grelhe com pele para baixo primeiro, até dourar dos dois lados.",
      "Cozinhe a quinoa conforme instruções da embalagem.",
      "Salteie os aspargos rapidamente no azeite, sem murchar demais.",
      "Monte as marmitas com salmão + quinoa + aspargos."
    ]
  },
  {
    category: "almoco",
    name: "Strogonoff de frango light com arroz",
    yield: 4,
    kcal: 591,
    protein: 70,
    ingredients: [
      {
        name: "Peito de frango",
        qty: 800,
        unit: "g"
      },
      {
        name: "Iogurte natural desnatado",
        qty: 400,
        unit: "g"
      },
      {
        name: "Molho de tomate",
        qty: 200,
        unit: "ml"
      },
      {
        name: "Champignon",
        qty: 200,
        unit: "g"
      },
      {
        name: "Arroz",
        qty: 2,
        unit: "xíc"
      }
    ],
    prep: [
      "Corte o frango em tiras e doure bem.",
      "Adicione o champignon fatiado e o molho de tomate, cozinhe por 5 minutos.",
      "Desligue o fogo e só então misture o iogurte (evita talhar).",
      "Sirva com arroz, dividido em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Peixe assado com batata inglesa e salada",
    yield: 4,
    kcal: 454,
    protein: 44,
    ingredients: [
      {
        name: "Filé de peixe branco",
        qty: 800,
        unit: "g"
      },
      {
        name: "Batata inglesa",
        qty: 1200,
        unit: "g"
      },
      {
        name: "Alface/rúcula",
        qty: 1,
        unit: "maço"
      },
      {
        name: "Tomate cereja",
        qty: 200,
        unit: "g"
      }
    ],
    prep: [
      "Corte a batata em rodelas e asse até dourar.",
      "Tempere o peixe e asse junto (ou separado) até cozinhar por completo.",
      "Monte a salada de folhas com tomate cereja cortado ao meio, à parte.",
      "Divida em 4 potes; a salada é melhor levada separada e montada na hora de comer."
    ]
  },
  {
    category: "almoco",
    name: "Frango xadrez fit com arroz integral",
    yield: 4,
    kcal: 598,
    protein: 67,
    ingredients: [
      {
        name: "Peito de frango",
        qty: 800,
        unit: "g"
      },
      {
        name: "Pimentão",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Molho shoyu light",
        qty: 3,
        unit: "colher sopa"
      },
      {
        name: "Amendoim torrado",
        qty: 50,
        unit: "g"
      },
      {
        name: "Arroz integral",
        qty: 3,
        unit: "xíc"
      }
    ],
    prep: [
      "Corte o frango em cubos e tempere.",
      "Refogue em fogo alto com pimentão e cebola em cubos.",
      "Adicione o molho shoyu light e o amendoim, misture bem.",
      "Sirva com arroz integral."
    ]
  },
  {
    category: "almoco",
    name: "Almôndegas de frango ao molho com purê de abóbora",
    yield: 4,
    kcal: 471,
    protein: 65,
    ingredients: [
      {
        name: "Frango moído",
        qty: 800,
        unit: "g"
      },
      {
        name: "Aveia em flocos (liga)",
        qty: 3,
        unit: "colher sopa"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Molho de tomate",
        qty: 300,
        unit: "ml"
      },
      {
        name: "Abóbora (para purê)",
        qty: 1200,
        unit: "g"
      }
    ],
    prep: [
      "Misture o frango moído com a aveia e a cebola bem picada; tempere e molde as almôndegas.",
      "Doure as almôndegas na frigideira ou no forno.",
      "Finalize cozinhando no molho de tomate por 10 minutos.",
      "Cozinhe a abóbora e amasse até virar purê; sirva junto."
    ]
  },
  {
    category: "almoco",
    name: "Peito de frango recheado com espinafre e arroz",
    yield: 4,
    kcal: 571,
    protein: 71,
    ingredients: [
      {
        name: "Peito de frango (para rechear)",
        qty: 800,
        unit: "g"
      },
      {
        name: "Espinafre",
        qty: 200,
        unit: "g"
      },
      {
        name: "Queijo cottage",
        qty: 200,
        unit: "g"
      },
      {
        name: "Arroz",
        qty: 2,
        unit: "xíc"
      }
    ],
    prep: [
      "Abra o peito de frango em bife (corte borboleta) e tempere.",
      "Recheie com espinafre refogado e queijo cottage, feche com palito de dente.",
      "Grelhe ou asse até cozinhar por completo.",
      "Sirva com arroz, dividido em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Picadinho de carne com legumes e arroz",
    yield: 4,
    kcal: 581,
    protein: 59,
    ingredients: [
      {
        name: "Patinho em cubos",
        qty: 800,
        unit: "g"
      },
      {
        name: "Batata inglesa",
        qty: 300,
        unit: "g"
      },
      {
        name: "Cenoura",
        qty: 200,
        unit: "g"
      },
      {
        name: "Ervilha",
        qty: 200,
        unit: "g"
      },
      {
        name: "Arroz",
        qty: 2,
        unit: "xíc"
      }
    ],
    prep: [
      "Doure a carne em cubos em fogo alto.",
      "Adicione batata e cenoura, cubra com água e cozinhe até os legumes ficarem macios.",
      "Junte a ervilha nos últimos 5 minutos e ajuste o tempero.",
      "Sirva com arroz, dividido em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Abobrinha recheada com frango moído",
    yield: 4,
    kcal: 392,
    protein: 56,
    ingredients: [
      {
        name: "Frango moído",
        qty: 600,
        unit: "g"
      },
      {
        name: "Abobrinha grande",
        qty: 4,
        unit: "unid"
      },
      {
        name: "Queijo muçarela light",
        qty: 150,
        unit: "g"
      },
      {
        name: "Molho de tomate",
        qty: 200,
        unit: "ml"
      }
    ],
    prep: [
      "Corte as abobrinhas ao meio e retire o miolo com uma colher.",
      "Refogue o frango moído com o miolo picado e o molho de tomate.",
      "Recheie as abobrinhas com essa mistura e cubra com queijo.",
      "Asse até a abobrinha ficar macia e o queijo derreter."
    ]
  },
  {
    category: "almoco",
    name: "Carne de panela ao molho de mostarda com arroz integral",
    yield: 4,
    kcal: 549,
    protein: 58,
    ingredients: [
      {
        name: "Patinho em cubos",
        qty: 800,
        unit: "g"
      },
      {
        name: "Mostarda",
        qty: 2,
        unit: "colher sopa"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Caldo de legumes caseiro",
        qty: 300,
        unit: "ml"
      },
      {
        name: "Arroz integral",
        qty: 3,
        unit: "xíc"
      }
    ],
    prep: [
      "Doure a carne em cubos com a cebola picada.",
      "Junte a mostarda e o caldo de legumes, tampe e cozinhe em fogo baixo até a carne ficar macia.",
      "Ajuste o sal e deixe o molho reduzir levemente.",
      "Sirva com arroz integral, dividido em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Frango grelhado com arroz de couve-flor",
    yield: 4,
    kcal: 386,
    protein: 66,
    ingredients: [
      {
        name: "Peito de frango",
        qty: 800,
        unit: "g"
      },
      {
        name: "Couve-flor (para o “arroz”)",
        qty: 1,
        unit: "unid grande"
      },
      {
        name: "Alho",
        qty: 2,
        unit: "dente"
      },
      {
        name: "Azeite",
        qty: 1,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Tempere e grelhe o frango até dourar e cozinhar por completo.",
      "Rale ou processe a couve-flor crua até virar uma farofa fina (“arroz”).",
      "Refogue rapidamente no azeite com alho, por 3-4 minutos, sem deixar murchar demais.",
      "Monte as marmitas com frango + “arroz” de couve-flor."
    ]
  },
  {
    category: "almoco",
    name: "Peixe ensopado com legumes e arroz",
    yield: 4,
    kcal: 418,
    protein: 43,
    ingredients: [
      {
        name: "Filé de peixe branco",
        qty: 800,
        unit: "g"
      },
      {
        name: "Tomate",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Pimentão",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Arroz",
        qty: 3,
        unit: "xíc"
      }
    ],
    prep: [
      "Refogue cebola, pimentão e tomate picados até formar um molho encorpado.",
      "Adicione o peixe em postas e cozinhe em fogo baixo até ficar macio, sem desmanchar demais.",
      "Ajuste o tempero com sal, limão e cheiro-verde.",
      "Sirva com arroz, dividido em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Lombo suíno assado com batata-doce e couve",
    yield: 4,
    kcal: 512,
    protein: 60,
    ingredients: [
      {
        name: "Lombo suíno",
        qty: 800,
        unit: "g"
      },
      {
        name: "Batata-doce",
        qty: 1000,
        unit: "g"
      },
      {
        name: "Couve",
        qty: 1,
        unit: "maço"
      },
      {
        name: "Alho",
        qty: 3,
        unit: "dente"
      }
    ],
    prep: [
      "Tempere o lombo com alho amassado, sal e ervas, e asse coberto até cozinhar por completo.",
      "Descubra nos últimos 15 minutos para dourar.",
      "Asse a batata-doce em cubos junto no forno.",
      "Refogue a couve fatiada rapidamente e monte as marmitas."
    ]
  },
  {
    category: "almoco",
    name: "Frango à parmegiana fit com arroz",
    yield: 4,
    kcal: 574,
    protein: 68,
    ingredients: [
      {
        name: "Filé de frango",
        qty: 800,
        unit: "g"
      },
      {
        name: "Farinha panko",
        qty: 100,
        unit: "g"
      },
      {
        name: "Molho de tomate",
        qty: 300,
        unit: "ml"
      },
      {
        name: "Queijo muçarela light",
        qty: 150,
        unit: "g"
      },
      {
        name: "Arroz",
        qty: 2,
        unit: "xíc"
      }
    ],
    prep: [
      "Empane os filés de frango na farinha panko e leve à air fryer ou forno até dourar.",
      "Cubra com molho de tomate e queijo muçarela light.",
      "Volte ao forno só até o queijo derreter.",
      "Sirva com arroz, dividido em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Berinjela à parmegiana com frango desfiado",
    yield: 4,
    kcal: 401,
    protein: 52,
    ingredients: [
      {
        name: "Berinjela",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Peito de frango desfiado",
        qty: 500,
        unit: "g"
      },
      {
        name: "Molho de tomate",
        qty: 300,
        unit: "ml"
      },
      {
        name: "Queijo muçarela light",
        qty: 120,
        unit: "g"
      }
    ],
    prep: [
      "Fatie a berinjela e grelhe ou asse as fatias até ficarem macias.",
      "Intercale camadas de berinjela, frango desfiado e molho de tomate em um refratário.",
      "Finalize com queijo muçarela light e leve ao forno até gratinar.",
      "Divida em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Camarão ao alho e óleo com arroz integral",
    yield: 3,
    kcal: 447,
    protein: 48,
    ingredients: [
      {
        name: "Camarão limpo",
        qty: 600,
        unit: "g"
      },
      {
        name: "Alho",
        qty: 4,
        unit: "dente"
      },
      {
        name: "Azeite",
        qty: 2,
        unit: "colher sopa"
      },
      {
        name: "Arroz integral",
        qty: 2.25,
        unit: "xíc"
      }
    ],
    prep: [
      "Refogue o alho fatiado no azeite até dourar levemente, sem queimar.",
      "Adicione o camarão e refogue rapidamente, só até ficar rosado e cozido.",
      "Finalize com salsinha picada e um fio de limão.",
      "Sirva com arroz integral, dividido em 3 potes."
    ]
  },
  {
    category: "almoco",
    name: "Kafta de carne assada com purê de batata",
    yield: 4,
    kcal: 486,
    protein: 53,
    ingredients: [
      {
        name: "Patinho moído (magro)",
        qty: 700,
        unit: "g"
      },
      {
        name: "Cebola ralada",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Salsinha picada",
        qty: 3,
        unit: "colher sopa"
      },
      {
        name: "Batata inglesa",
        qty: 1000,
        unit: "g"
      }
    ],
    prep: [
      "Misture a carne moída com cebola ralada, salsinha e temperos, e molde em espetos ou bolinhos.",
      "Asse ou grelhe até dourar e cozinhar por completo.",
      "Cozinhe a batata e amasse até virar purê.",
      "Sirva a kafta com o purê, dividido em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Frango ao molho de mostarda e mel com arroz integral",
    yield: 4,
    kcal: 540,
    protein: 65,
    ingredients: [
      {
        name: "Peito de frango",
        qty: 800,
        unit: "g"
      },
      {
        name: "Mostarda",
        qty: 3,
        unit: "colher sopa"
      },
      {
        name: "Mel",
        qty: 1,
        unit: "colher sopa"
      },
      {
        name: "Arroz integral",
        qty: 3,
        unit: "xíc"
      }
    ],
    prep: [
      "Misture mostarda e mel e pincele sobre o frango temperado.",
      "Grelhe ou asse até dourar e cozinhar por completo, pincelando novamente na metade.",
      "Deixe descansar 2 minutos antes de fatiar.",
      "Sirva com arroz integral, dividido em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Moqueca de peixe fit com arroz",
    yield: 4,
    kcal: 468,
    protein: 45,
    ingredients: [
      {
        name: "Filé de peixe branco",
        qty: 800,
        unit: "g"
      },
      {
        name: "Leite de coco light",
        qty: 200,
        unit: "ml"
      },
      {
        name: "Pimentão",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Tomate",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Azeite de dendê",
        qty: 1,
        unit: "colher sopa"
      },
      {
        name: "Arroz",
        qty: 3,
        unit: "xíc"
      }
    ],
    prep: [
      "Refogue cebola, pimentão e tomate fatiados até murcharem.",
      "Acomode o peixe por cima, regue com leite de coco e azeite de dendê.",
      "Cozinhe em fogo baixo com a panela tampada até o peixe ficar macio, sem mexer demais para não desmanchar.",
      "Finalize com coentro ou cheiro-verde e sirva com arroz, dividido em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Escondidinho de frango com mandioca",
    yield: 4,
    kcal: 489,
    protein: 56,
    ingredients: [
      {
        name: "Peito de frango desfiado",
        qty: 700,
        unit: "g"
      },
      {
        name: "Mandioca",
        qty: 900,
        unit: "g"
      },
      {
        name: "Molho de tomate",
        qty: 150,
        unit: "ml"
      },
      {
        name: "Queijo muçarela light",
        qty: 100,
        unit: "g"
      }
    ],
    prep: [
      "Cozinhe a mandioca até ficar bem macia e amasse até virar um purê.",
      "Refogue o frango desfiado com o molho de tomate.",
      "Em um refratário, monte camadas de purê e frango, finalizando com queijo por cima.",
      "Leve ao forno só até gratinar e divida em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Lentilha ensopada com legumes e arroz",
    yield: 4,
    kcal: 431,
    protein: 24,
    ingredients: [
      {
        name: "Lentilha",
        qty: 400,
        unit: "g"
      },
      {
        name: "Cenoura",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Tomate",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Arroz",
        qty: 2,
        unit: "xíc"
      }
    ],
    prep: [
      "Refogue cebola e tomate picados até formar um molho.",
      "Junte a lentilha (deixada de molho previamente) e a cenoura em cubos, cubra com água.",
      "Cozinhe em fogo baixo até a lentilha ficar macia e o caldo engrossar naturalmente.",
      "Sirva com arroz, dividido em 4 potes; ótima opção vegetariana rica em fibras."
    ]
  },
  {
    category: "almoco",
    name: "Peru assado com farofa de aveia e batata-doce",
    yield: 4,
    kcal: 522,
    protein: 62,
    ingredients: [
      {
        name: "Filé de peito de peru",
        qty: 800,
        unit: "g"
      },
      {
        name: "Aveia em flocos",
        qty: 100,
        unit: "g"
      },
      {
        name: "Batata-doce",
        qty: 900,
        unit: "g"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Tempere o peru e asse até dourar e cozinhar por completo; fatie.",
      "Refogue a cebola picada e junte a aveia, tostando levemente para fazer a farofa.",
      "Asse a batata-doce em cubos até macia.",
      "Monte as marmitas com peru + farofa + batata-doce."
    ]
  },
  {
    category: "almoco",
    name: "Grão-de-bico com espinafre, ovo e arroz integral",
    yield: 4,
    kcal: 447,
    protein: 26,
    ingredients: [
      {
        name: "Grão-de-bico cozido",
        qty: 600,
        unit: "g"
      },
      {
        name: "Espinafre",
        qty: 200,
        unit: "g"
      },
      {
        name: "Ovo cozido",
        qty: 4,
        unit: "unid"
      },
      {
        name: "Alho",
        qty: 2,
        unit: "dente"
      },
      {
        name: "Arroz integral",
        qty: 2,
        unit: "xíc"
      }
    ],
    prep: [
      "Refogue o alho, junte o grão-de-bico e refogue por alguns minutos.",
      "Adicione o espinafre picado e deixe murchar.",
      "Corte os ovos cozidos ao meio e misture por cima ao servir.",
      "Sirva com arroz integral, dividido em 4 potes; opção vegetariana completa em proteína."
    ]
  },
  {
    category: "almoco",
    name: "Frango ensopado com quiabo e arroz",
    yield: 4,
    kcal: 432,
    protein: 44,
    ingredients: [
      {
        name: "Peito de frango em cubos",
        qty: 800,
        unit: "g"
      },
      {
        name: "Quiabo",
        qty: 300,
        unit: "g"
      },
      {
        name: "Arroz",
        qty: 2,
        unit: "xíc"
      },
      {
        name: "Tomate",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Refogue a cebola e o tomate picados, junte o frango em cubos e doure.",
      "Adicione o quiabo fatiado e um pouco de água, cozinhe em fogo baixo até o frango cozinhar por completo.",
      "Cozinhe o arroz separadamente.",
      "Monte as marmitas com arroz e o ensopado por cima."
    ]
  },
  {
    category: "almoco",
    name: "Carne de panela de pressão com mandioca",
    yield: 4,
    kcal: 512,
    protein: 46,
    ingredients: [
      {
        name: "Músculo bovino magro",
        qty: 700,
        unit: "g"
      },
      {
        name: "Mandioca",
        qty: 600,
        unit: "g"
      },
      {
        name: "Cenoura",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Louro",
        qty: 2,
        unit: "folha"
      }
    ],
    prep: [
      "Doure a carne em cubos com cebola na panela de pressão.",
      "Adicione água, louro e cozinhe por cerca de 35-40 minutos após pegar pressão, até a carne ficar macia.",
      "Junte a mandioca e a cenoura nos últimos 15 minutos de cozimento.",
      "Divida a carne com os legumes em 4 potes."
    ]
  },
  {
    category: "almoco",
    name: "Frango grelhado com arroz integral e wok de legumes",
    yield: 4,
    kcal: 468,
    protein: 52,
    ingredients: [
      {
        name: "Peito de frango",
        qty: 800,
        unit: "g"
      },
      {
        name: "Arroz integral",
        qty: 2,
        unit: "xíc"
      },
      {
        name: "Pimentão",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Brócolis",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Shoyu light",
        qty: 2,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Grelhe o frango temperado e corte em tiras.",
      "Cozinhe o arroz integral separadamente.",
      "Refogue os legumes cortados em wok ou frigideira grande, em fogo alto, com o shoyu, por poucos minutos.",
      "Monte as marmitas com arroz, frango e os legumes ainda crocantes."
    ]
  },
  {
    category: "almoco",
    name: "Peixe assado em papelote com legumes",
    yield: 4,
    kcal: 378,
    protein: 40,
    ingredients: [
      {
        name: "Filé de peixe branco",
        qty: 800,
        unit: "g"
      },
      {
        name: "Abobrinha",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Tomate cereja",
        qty: 200,
        unit: "g"
      },
      {
        name: "Limão",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Azeite",
        qty: 1,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Tempere o peixe com limão, sal e azeite.",
      "Monte pacotinhos de papel-alumínio com o peixe e os legumes fatiados.",
      "Asse em forno médio por 20-25 minutos, até o peixe cozinhar por completo.",
      "Divida em 4 marmitas."
    ]
  },
  {
    category: "almoco",
    name: "Frango na pressão com molho de tomate e macarrão integral",
    yield: 4,
    kcal: 486,
    protein: 50,
    ingredients: [
      {
        name: "Sobrecoxa de frango sem pele",
        qty: 800,
        unit: "g"
      },
      {
        name: "Molho de tomate",
        qty: 300,
        unit: "ml"
      },
      {
        name: "Macarrão integral",
        qty: 300,
        unit: "g"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Alho",
        qty: 2,
        unit: "dente"
      }
    ],
    prep: [
      "Doure o frango com cebola e alho na panela de pressão.",
      "Junte o molho de tomate e cozinhe por 15 minutos após pegar pressão.",
      "Cozinhe o macarrão integral à parte.",
      "Monte as marmitas com macarrão e o frango ao molho."
    ]
  },
  {
    category: "almoco",
    name: "Bife de patinho grelhado com arroz e couve refogada",
    yield: 4,
    kcal: 445,
    protein: 48,
    ingredients: [
      {
        name: "Bife de patinho",
        qty: 700,
        unit: "g"
      },
      {
        name: "Arroz",
        qty: 2,
        unit: "xíc"
      },
      {
        name: "Couve",
        qty: 1,
        unit: "maço"
      },
      {
        name: "Alho",
        qty: 2,
        unit: "dente"
      }
    ],
    prep: [
      "Tempere os bifes e grelhe em fogo alto até o ponto desejado.",
      "Refogue a couve fatiada fininha com alho, rapidamente.",
      "Cozinhe o arroz separadamente.",
      "Monte as marmitas com arroz, bife e couve."
    ]
  },
  {
    category: "almoco",
    name: "Frango à indiana (curry de coco) com arroz",
    yield: 4,
    kcal: 512,
    protein: 46,
    ingredients: [
      {
        name: "Peito de frango em cubos",
        qty: 800,
        unit: "g"
      },
      {
        name: "Leite de coco light",
        qty: 200,
        unit: "ml"
      },
      {
        name: "Curry em pó",
        qty: 1,
        unit: "colher sopa"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Arroz",
        qty: 2,
        unit: "xíc"
      }
    ],
    prep: [
      "Refogue a cebola, junte o frango em cubos e doure.",
      "Adicione o curry e o leite de coco, cozinhe em fogo baixo até o frango cozinhar e o molho encorpar.",
      "Cozinhe o arroz separadamente.",
      "Monte as marmitas com arroz e o frango ao curry."
    ]
  },
  {
    category: "almoco",
    name: "Costela suína assada com farofa de couve e mandioca",
    yield: 4,
    kcal: 560,
    protein: 44,
    ingredients: [
      {
        name: "Costela suína magra",
        qty: 800,
        unit: "g"
      },
      {
        name: "Mandioca",
        qty: 500,
        unit: "g"
      },
      {
        name: "Couve",
        qty: 1,
        unit: "maço"
      },
      {
        name: "Farinha de mandioca",
        qty: 3,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Tempere a costela e asse em forno médio, coberta, até ficar macia (cerca de 1h30).",
      "Cozinhe a mandioca até ficar macia.",
      "Refogue a couve fatiada com um pouco de farinha de mandioca para a farofa.",
      "Divida em 4 marmitas."
    ]
  },
  {
    category: "almoco",
    name: "Salmão ao forno com arroz de brócolis",
    yield: 3,
    kcal: 456,
    protein: 40,
    ingredients: [
      {
        name: "Filé de salmão",
        qty: 600,
        unit: "g"
      },
      {
        name: "Arroz",
        qty: 2,
        unit: "xíc"
      },
      {
        name: "Brócolis",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Limão",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Azeite",
        qty: 1,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Tempere o salmão com limão, sal e azeite e asse em forno médio por 15-18 minutos.",
      "Cozinhe o arroz e misture com brócolis picado bem miúdo nos últimos minutos de cozimento.",
      "Divida em 3 marmitas com o salmão por cima."
    ]
  },
  {
    category: "almoco",
    name: "Frango xadrez com legumes no wok e arroz integral",
    yield: 4,
    kcal: 462,
    protein: 48,
    ingredients: [
      {
        name: "Peito de frango em cubos",
        qty: 800,
        unit: "g"
      },
      {
        name: "Pimentão colorido",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Shoyu light",
        qty: 2,
        unit: "colher sopa"
      },
      {
        name: "Arroz integral",
        qty: 2,
        unit: "xíc"
      }
    ],
    prep: [
      "Doure o frango em fogo alto numa wok ou frigideira grande.",
      "Junte os legumes cortados em cubos e o shoyu, refogue rapidamente para manter crocantes.",
      "Cozinhe o arroz integral à parte.",
      "Monte as marmitas com arroz, frango e legumes."
    ]
  },
  {
    category: "cafe",
    name: "Tapioca com frango desfiado",
    yield: 4,
    kcal: 354,
    protein: 37,
    ingredients: [
      {
        name: "Goma de tapioca",
        qty: 400,
        unit: "g"
      },
      {
        name: "Peito de frango desfiado",
        qty: 400,
        unit: "g"
      },
      {
        name: "Queijo cottage",
        qty: 200,
        unit: "g"
      }
    ],
    prep: [
      "Cozinhe o frango, desfie e tempere.",
      "Espalhe a goma de tapioca numa frigideira quente até formar o disco.",
      "Recheie com frango e queijo cottage, dobre ao meio.",
      "Melhor montar as tapiocas frescas no dia; a goma pode ser porcionada e o recheio guardado à parte."
    ]
  },
  {
    category: "cafe",
    name: "Iogurte grego com granola caseira e frutas",
    yield: 4,
    kcal: 480,
    protein: 23,
    fast: true,
    ingredients: [
      {
        name: "Iogurte grego natural",
        qty: 800,
        unit: "g"
      },
      {
        name: "Granola sem açúcar",
        qty: 200,
        unit: "g"
      },
      {
        name: "Morango",
        qty: 300,
        unit: "g"
      },
      {
        name: "Mel",
        qty: 2,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Corte os morangos em pedaços.",
      "Monte em potes: iogurte, morango e granola em camadas.",
      "Adicione o mel só na hora de comer, pra granola não amolecer no pote."
    ]
  },
  {
    category: "cafe",
    name: "Cuscuz de milho com frango desfiado e legumes",
    yield: 4,
    kcal: 268,
    protein: 33,
    ingredients: [
      {
        name: "Flocão de milho (cuscuz)",
        qty: 300,
        unit: "g"
      },
      {
        name: "Peito de frango desfiado",
        qty: 400,
        unit: "g"
      },
      {
        name: "Tomate",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Cozinhe o frango, desfie e refogue com cebola e tomate picados.",
      "Hidrate o flocão de milho com água quente e uma pitada de sal até formar uma farofa úmida.",
      "Misture o frango refogado ao flocão ou sirva por cima.",
      "Finalize com cheiro-verde a gosto."
    ]
  },
  {
    category: "cafe",
    name: "Bowl proteico de frango, batata-doce e abacate",
    yield: 3,
    kcal: 609,
    protein: 67,
    ingredients: [
      {
        name: "Peito de frango desfiado",
        qty: 600,
        unit: "g"
      },
      {
        name: "Batata-doce",
        qty: 600,
        unit: "g"
      },
      {
        name: "Abacate",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Limão",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Tempere e grelhe o frango, depois corte em tiras ou cubos.",
      "Asse ou cozinhe a batata-doce em cubos.",
      "Monte o bowl com frango, batata-doce e fatias de abacate.",
      "Finalize com limão espremido por cima."
    ]
  },
  {
    category: "cafe",
    name: "Panqueca de banana e aveia sem ovo",
    yield: 2,
    kcal: 223,
    protein: 6,
    fast: true,
    ingredients: [
      {
        name: "Banana",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Aveia em flocos",
        qty: 6,
        unit: "colher sopa"
      },
      {
        name: "Leite (ou bebida vegetal)",
        qty: 100,
        unit: "ml"
      },
      {
        name: "Fermento em pó",
        qty: 1,
        unit: "colher chá"
      }
    ],
    prep: [
      "Amasse a banana e misture com a aveia, o leite e o fermento até formar uma massa.",
      "Deixe descansar 5 minutos.",
      "Cozinhe pequenas porções em frigideira antiaderente, virando quando dourar."
    ]
  },
  {
    category: "cafe",
    name: "Sanduíche de frango com requeijão light",
    yield: 3,
    kcal: 416,
    protein: 52,
    ingredients: [
      {
        name: "Pão integral",
        qty: 6,
        unit: "fatia"
      },
      {
        name: "Peito de frango desfiado",
        qty: 400,
        unit: "g"
      },
      {
        name: "Requeijão light",
        qty: 100,
        unit: "g"
      },
      {
        name: "Tomate",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Cozinhe e desfie o frango, tempere a gosto.",
      "Passe o requeijão light nas fatias de pão.",
      "Monte com o frango desfiado e fatias de tomate."
    ]
  },
  {
    category: "cafe",
    name: "Omelete de claras com espinafre e queijo cottage",
    yield: 2,
    kcal: 218,
    protein: 30,
    fast: true,
    ingredients: [
      {
        name: "Clara de ovo",
        qty: 8,
        unit: "unid"
      },
      {
        name: "Espinafre",
        qty: 100,
        unit: "g"
      },
      {
        name: "Queijo cottage",
        qty: 100,
        unit: "g"
      }
    ],
    prep: [
      "Refogue o espinafre rapidamente numa frigideira antiaderente.",
      "Bata as claras levemente e despeje sobre o espinafre.",
      "Adicione o queijo cottage e cozinhe em fogo baixo até firmar, dobrando ao meio."
    ]
  },
  {
    category: "cafe",
    name: "Vitamina de banana com whey e aveia",
    yield: 1,
    kcal: 378,
    protein: 34,
    fast: true,
    ingredients: [
      {
        name: "Banana",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Whey protein",
        qty: 1,
        unit: "scoop"
      },
      {
        name: "Aveia em flocos",
        qty: 3,
        unit: "colher sopa"
      },
      {
        name: "Leite desnatado",
        qty: 250,
        unit: "ml"
      }
    ],
    prep: [
      "Bata todos os ingredientes no liquidificador até ficar homogêneo.",
      "Sirva na hora, gelado."
    ]
  },
  {
    category: "cafe",
    name: "Pão de queijo fit de tapioca e queijo cottage (air fryer)",
    yield: 4,
    kcal: 214,
    protein: 18,
    ingredients: [
      {
        name: "Goma de tapioca hidratada",
        qty: 300,
        unit: "g"
      },
      {
        name: "Queijo cottage",
        qty: 200,
        unit: "g"
      },
      {
        name: "Ovo",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Queijo parmesão ralado",
        qty: 30,
        unit: "g"
      }
    ],
    prep: [
      "Misture a goma de tapioca com o queijo cottage, o ovo e o parmesão até formar uma massa homogênea.",
      "Molde bolinhas pequenas.",
      "Leve à air fryer a 180°C por cerca de 12-15 minutos, até dourar."
    ]
  },
  {
    category: "cafe",
    name: "Mingau de aveia com whey e canela",
    yield: 2,
    kcal: 296,
    protein: 26,
    fast: true,
    ingredients: [
      {
        name: "Aveia em flocos",
        qty: 6,
        unit: "colher sopa"
      },
      {
        name: "Whey protein",
        qty: 1,
        unit: "scoop"
      },
      {
        name: "Leite desnatado",
        qty: 400,
        unit: "ml"
      },
      {
        name: "Canela em pó",
        qty: 1,
        unit: "colher chá"
      }
    ],
    prep: [
      "Aqueça o leite com a aveia em fogo baixo, mexendo até engrossar.",
      "Desligue o fogo e só então misture o whey (evita empelotar).",
      "Finalize com canela em pó."
    ]
  },
  {
    category: "cafe",
    name: "Overnight oats com iogurte e frutas vermelhas",
    yield: 2,
    kcal: 312,
    protein: 20,
    fast: true,
    ingredients: [
      {
        name: "Aveia em flocos",
        qty: 6,
        unit: "colher sopa"
      },
      {
        name: "Iogurte natural desnatado",
        qty: 300,
        unit: "g"
      },
      {
        name: "Frutas vermelhas",
        qty: 150,
        unit: "g"
      },
      {
        name: "Mel",
        qty: 1,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Misture a aveia com o iogurte e o mel num pote com tampa.",
      "Leve à geladeira de um dia para o outro.",
      "Finalize com as frutas vermelhas na hora de comer."
    ]
  },
  {
    category: "cafe",
    name: "Ovos mexidos com batata-doce e queijo branco",
    yield: 3,
    kcal: 356,
    protein: 27,
    ingredients: [
      {
        name: "Ovo",
        qty: 6,
        unit: "unid"
      },
      {
        name: "Batata-doce",
        qty: 450,
        unit: "g"
      },
      {
        name: "Queijo branco (minas)",
        qty: 150,
        unit: "g"
      }
    ],
    prep: [
      "Cozinhe ou asse a batata-doce em cubos até ficar macia.",
      "Mexa os ovos em fogo baixo até cozinhar por completo.",
      "Misture o queijo branco em cubos aos ovos ainda quentes e sirva com a batata-doce."
    ]
  },
  {
    category: "cafe",
    name: "Crepioca de frango",
    yield: 3,
    kcal: 289,
    protein: 34,
    fast: true,
    ingredients: [
      {
        name: "Ovo",
        qty: 3,
        unit: "unid"
      },
      {
        name: "Goma de tapioca",
        qty: 150,
        unit: "g"
      },
      {
        name: "Peito de frango desfiado",
        qty: 300,
        unit: "g"
      }
    ],
    prep: [
      "Bata o ovo com a goma de tapioca até formar uma massa líquida.",
      "Despeje em frigideira antiaderente quente, como uma panqueca fina.",
      "Recheie com frango desfiado temperado e dobre ao meio."
    ]
  },
  {
    category: "cafe",
    name: "Bowl de iogurte, banana e pasta de amendoim",
    yield: 2,
    kcal: 334,
    protein: 18,
    fast: true,
    ingredients: [
      {
        name: "Iogurte natural integral",
        qty: 400,
        unit: "g"
      },
      {
        name: "Banana",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Pasta de amendoim",
        qty: 2,
        unit: "colher sopa"
      },
      {
        name: "Granola sem açúcar",
        qty: 60,
        unit: "g"
      }
    ],
    prep: [
      "Fatie a banana e monte no pote com o iogurte.",
      "Regue com a pasta de amendoim (aquecida por alguns segundos facilita).",
      "Finalize com a granola só na hora de comer, pra manter a crocância."
    ]
  },
  {
    category: "cafe",
    name: "Panqueca de espinafre com ovos e queijo cottage",
    yield: 2,
    kcal: 268,
    protein: 26,
    fast: true,
    ingredients: [
      {
        name: "Ovos",
        qty: 3,
        unit: "unid"
      },
      {
        name: "Espinafre",
        qty: 100,
        unit: "g"
      },
      {
        name: "Queijo cottage",
        qty: 100,
        unit: "g"
      },
      {
        name: "Farinha de aveia",
        qty: 2,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Bata os ovos com a farinha de aveia e o espinafre picado no liquidificador.",
      "Frite pequenas panquecas em frigideira antiaderente, virando quando dourar.",
      "Sirva com queijo cottage por cima ou à parte."
    ]
  },
  {
    category: "cafe",
    name: "Cuscuz marroquino com frango e legumes",
    yield: 4,
    kcal: 372,
    protein: 34,
    fast: true,
    ingredients: [
      {
        name: "Cuscuz marroquino",
        qty: 200,
        unit: "g"
      },
      {
        name: "Peito de frango desfiado",
        qty: 400,
        unit: "g"
      },
      {
        name: "Cenoura ralada",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Ervilha",
        qty: 100,
        unit: "g"
      }
    ],
    prep: [
      "Hidrate o cuscuz marroquino com água quente conforme instruções da embalagem.",
      "Misture o frango desfiado, a cenoura ralada e a ervilha ainda quente.",
      "Tempere com azeite e limão, e divida em potes."
    ]
  },
  {
    category: "cafe",
    name: "Rabanada fit de pão integral (air fryer)",
    yield: 3,
    kcal: 238,
    protein: 16,
    ingredients: [
      {
        name: "Pão integral",
        qty: 6,
        unit: "fatia"
      },
      {
        name: "Ovos",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Leite",
        qty: 100,
        unit: "ml"
      },
      {
        name: "Canela em pó",
        qty: 1,
        unit: "colher chá"
      }
    ],
    prep: [
      "Misture os ovos, o leite e a canela em um prato fundo.",
      "Passe as fatias de pão rapidamente na mistura, sem encharcar demais.",
      "Leve à air fryer preaquecida até dourar dos dois lados.",
      "Polvilhe canela e sirva; guarde as fatias separadas para não amolecerem."
    ]
  },
  {
    category: "cafe",
    name: "Bowl de quinoa com frutas e iogurte",
    yield: 2,
    kcal: 318,
    protein: 18,
    fast: true,
    ingredients: [
      {
        name: "Quinoa em flocos",
        qty: 60,
        unit: "g"
      },
      {
        name: "Iogurte natural",
        qty: 300,
        unit: "g"
      },
      {
        name: "Banana",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Morango",
        qty: 150,
        unit: "g"
      }
    ],
    prep: [
      "Cozinhe a quinoa em flocos com um pouco de água ou leite até engrossar; deixe esfriar.",
      "Monte os bowls com iogurte, quinoa e frutas picadas por cima.",
      "Guarde a fruta separada se for preparar com antecedência."
    ]
  },
  {
    category: "cafe",
    name: "Panqueca americana proteica de aveia e banana",
    yield: 2,
    kcal: 340,
    protein: 22,
    ingredients: [
      {
        name: "Aveia em flocos",
        qty: 80,
        unit: "g"
      },
      {
        name: "Banana",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Ovo",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Whey sabor baunilha",
        qty: 1,
        unit: "scoop"
      }
    ],
    prep: [
      "Bata todos os ingredientes no liquidificador até formar uma massa homogênea.",
      "Frite pequenas porções em frigideira antiaderente, virando quando dourar.",
      "Sirva com fruta picada por cima."
    ]
  },
  {
    category: "cafe",
    name: "Ovos ao forno com espinafre e tomate",
    yield: 3,
    kcal: 280,
    protein: 24,
    ingredients: [
      {
        name: "Ovos",
        qty: 6,
        unit: "unid"
      },
      {
        name: "Espinafre",
        qty: 1,
        unit: "maço"
      },
      {
        name: "Tomate cereja",
        qty: 150,
        unit: "g"
      },
      {
        name: "Queijo branco ralado",
        qty: 50,
        unit: "g"
      }
    ],
    prep: [
      "Refogue o espinafre rapidamente e distribua numa forma refratária.",
      "Quebre os ovos por cima, adicione o tomate cereja cortado e o queijo.",
      "Asse em forno médio por 12-15 minutos, até os ovos firmarem."
    ]
  },
  {
    category: "cafe",
    name: "Tapioca recheada com ovo e queijo cottage",
    yield: 3,
    kcal: 298,
    protein: 20,
    ingredients: [
      {
        name: "Goma de tapioca",
        qty: 180,
        unit: "g"
      },
      {
        name: "Ovo",
        qty: 3,
        unit: "unid"
      },
      {
        name: "Queijo cottage",
        qty: 150,
        unit: "g"
      }
    ],
    prep: [
      "Mexa os ovos em fogo baixo até cozinhar.",
      "Espalhe a goma de tapioca numa frigideira quente até formar o disco.",
      "Recheie com ovos mexidos e queijo cottage, dobre ao meio."
    ]
  },
  {
    category: "cafe",
    name: "Panqueca de aveia e maçã ralada (sem açúcar)",
    yield: 2,
    kcal: 296,
    protein: 16,
    ingredients: [
      {
        name: "Aveia em flocos",
        qty: 70,
        unit: "g"
      },
      {
        name: "Maçã ralada",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Ovo",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Canela em pó",
        qty: 1,
        unit: "pitada"
      }
    ],
    prep: [
      "Misture a aveia, a maçã ralada, os ovos e a canela até formar uma massa.",
      "Deixe descansar 5 minutos.",
      "Cozinhe pequenas porções em frigideira antiaderente, virando quando dourar."
    ]
  },
  {
    category: "cafe",
    name: "Bowl de aveia cozida com whey e frutas (overnight quente)",
    yield: 2,
    kcal: 370,
    protein: 30,
    ingredients: [
      {
        name: "Aveia em flocos",
        qty: 80,
        unit: "g"
      },
      {
        name: "Leite desnatado",
        qty: 300,
        unit: "ml"
      },
      {
        name: "Whey sabor baunilha",
        qty: 1,
        unit: "scoop"
      },
      {
        name: "Frutas picadas",
        qty: 150,
        unit: "g"
      }
    ],
    prep: [
      "Cozinhe a aveia com o leite em fogo baixo até engrossar.",
      "Desligue o fogo e misture o whey, para não empelotar.",
      "Sirva com as frutas picadas por cima."
    ]
  },
  {
    category: "cafe",
    name: "Ovos mexidos com abacate e torrada integral",
    yield: 2,
    kcal: 392,
    protein: 22,
    ingredients: [
      {
        name: "Ovos",
        qty: 4,
        unit: "unid"
      },
      {
        name: "Abacate",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Pão integral",
        qty: 4,
        unit: "fatia"
      }
    ],
    prep: [
      "Mexa os ovos em fogo baixo até cozinhar por completo.",
      "Torre as fatias de pão e amasse o abacate levemente com limão e sal.",
      "Monte com o abacate na torrada e os ovos ao lado."
    ]
  },
  {
    category: "cafe",
    name: "Panqueca de frango e aveia salgada (café reforçado)",
    yield: 3,
    kcal: 388,
    protein: 38,
    ingredients: [
      {
        name: "Peito de frango desfiado",
        qty: 250,
        unit: "g"
      },
      {
        name: "Aveia em flocos",
        qty: 60,
        unit: "g"
      },
      {
        name: "Ovo",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Queijo cottage",
        qty: 80,
        unit: "g"
      }
    ],
    prep: [
      "Cozinhe o frango, desfie e tempere.",
      "Bata a aveia, os ovos e o queijo cottage até formar uma massa; misture o frango.",
      "Frite pequenas porções em frigideira antiaderente, virando quando dourar."
    ]
  },
  {
    category: "lanche",
    name: "Wrap de frango integral",
    yield: 4,
    kcal: 328,
    protein: 36,
    ingredients: [
      {
        name: "Tortilha integral",
        qty: 4,
        unit: "unid"
      },
      {
        name: "Peito de frango desfiado",
        qty: 400,
        unit: "g"
      },
      {
        name: "Alface",
        qty: 1,
        unit: "maço"
      },
      {
        name: "Tomate",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Iogurte natural",
        qty: 100,
        unit: "g"
      }
    ],
    prep: [
      "Cozinhe e desfie o frango, misture com um pouco do iogurte pra dar liga.",
      "Monte a tortilha com alface, tomate e o frango.",
      "Enrole bem apertado e corte ao meio."
    ]
  },
  {
    category: "lanche",
    name: "Shake proteico caseiro (whey, banana, aveia)",
    yield: 1,
    kcal: 392,
    protein: 36,
    fast: true,
    ingredients: [
      {
        name: "Whey protein",
        qty: 1,
        unit: "scoop"
      },
      {
        name: "Banana",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Aveia em flocos",
        qty: 2,
        unit: "colher sopa"
      },
      {
        name: "Leite desnatado",
        qty: 300,
        unit: "ml"
      }
    ],
    prep: [
      "Bata todos os ingredientes no liquidificador até ficar homogêneo.",
      "Sirva na hora — não guarda bem de um dia pro outro."
    ]
  },
  {
    category: "lanche",
    name: "Mix de castanhas e frutas secas",
    yield: 6,
    kcal: 246,
    protein: 6,
    fast: true,
    ingredients: [
      {
        name: "Castanha do Pará",
        qty: 100,
        unit: "g"
      },
      {
        name: "Amêndoas",
        qty: 100,
        unit: "g"
      },
      {
        name: "Damasco seco",
        qty: 100,
        unit: "g"
      }
    ],
    prep: [
      "Misture tudo e separe em porções individuais (potinhos ou sacos).",
      "Guarde em local seco — dura semanas."
    ]
  },
  {
    category: "lanche",
    name: "Sanduíche natural de atum",
    yield: 3,
    kcal: 254,
    protein: 29,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 6,
        unit: "fatia"
      },
      {
        name: "Atum em lata (água)",
        qty: 2,
        unit: "lata"
      },
      {
        name: "Iogurte natural",
        qty: 80,
        unit: "g"
      },
      {
        name: "Cenoura ralada",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Escorra o atum e misture com o iogurte e a cenoura ralada.",
      "Monte os sanduíches e embale bem.",
      "Se for guardar mais de 1 dia, leve o recheio separado do pão."
    ]
  },
  {
    category: "lanche",
    name: "Frango desfiado com biscoito de arroz",
    yield: 4,
    kcal: 245,
    protein: 31,
    ingredients: [
      {
        name: "Peito de frango desfiado",
        qty: 400,
        unit: "g"
      },
      {
        name: "Biscoito de arroz",
        qty: 8,
        unit: "unid"
      },
      {
        name: "Cenoura ralada",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Cozinhe o frango, desfie e tempere levemente.",
      "Separe porções de frango com biscoitos de arroz e cenoura ralada por cima ou ao lado.",
      "Ótimo lanche rápido pra levar ao trabalho."
    ]
  },
  {
    category: "lanche",
    name: "Palitinhos de frango empanado (air fryer) com molho de iogurte",
    yield: 4,
    kcal: 366,
    protein: 51,
    ingredients: [
      {
        name: "Peito de frango em tiras",
        qty: 600,
        unit: "g"
      },
      {
        name: "Farinha panko",
        qty: 100,
        unit: "g"
      },
      {
        name: "Iogurte natural",
        qty: 150,
        unit: "g"
      },
      {
        name: "Páprica",
        qty: 1,
        unit: "colher chá"
      }
    ],
    prep: [
      "Tempere o frango e passe na farinha panko.",
      "Leve à air fryer (ou forno) até dourar e cozinhar por completo, virando na metade do tempo.",
      "Misture o iogurte com a páprica para o molho.",
      "Sirva os palitinhos com o molho ao lado."
    ]
  },
  {
    category: "lanche",
    name: "Barra de proteína caseira (aveia, whey e pasta de amendoim)",
    yield: 8,
    kcal: 166,
    protein: 10,
    ingredients: [
      {
        name: "Aveia em flocos",
        qty: 150,
        unit: "g"
      },
      {
        name: "Whey protein",
        qty: 2,
        unit: "scoop"
      },
      {
        name: "Pasta de amendoim",
        qty: 100,
        unit: "g"
      },
      {
        name: "Mel",
        qty: 2,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Misture todos os ingredientes até formar uma massa homogênea e firme.",
      "Espalhe numa forma forrada e leve à geladeira por 1-2 horas.",
      "Corte em 8 barras e embale individualmente."
    ]
  },
  {
    category: "lanche",
    name: "Ovos cozidos com castanhas",
    yield: 4,
    kcal: 210,
    protein: 16,
    fast: true,
    ingredients: [
      {
        name: "Ovo",
        qty: 8,
        unit: "unid"
      },
      {
        name: "Castanha do Pará",
        qty: 60,
        unit: "g"
      }
    ],
    prep: [
      "Cozinhe os ovos por cerca de 9-10 minutos e resfrie em água gelada.",
      "Descasque e separe em porções de 2 ovos com um punhado de castanhas."
    ]
  },
  {
    category: "lanche",
    name: "Queijo cottage com abacaxi",
    yield: 3,
    kcal: 146,
    protein: 15,
    fast: true,
    ingredients: [
      {
        name: "Queijo cottage",
        qty: 300,
        unit: "g"
      },
      {
        name: "Abacaxi",
        qty: 300,
        unit: "g"
      }
    ],
    prep: [
      "Corte o abacaxi em cubos.",
      "Divida o queijo cottage e o abacaxi em potinhos individuais."
    ]
  },
  {
    category: "lanche",
    name: "Chips de batata-doce assados",
    yield: 4,
    kcal: 138,
    protein: 2,
    ingredients: [
      {
        name: "Batata-doce",
        qty: 600,
        unit: "g"
      },
      {
        name: "Azeite",
        qty: 1,
        unit: "colher sopa"
      },
      {
        name: "Páprica",
        qty: 1,
        unit: "colher chá"
      }
    ],
    prep: [
      "Fatie a batata-doce bem fina, de preferência num fatiador.",
      "Tempere com azeite, sal e páprica.",
      "Asse ou leve à air fryer até ficar crocante, virando na metade do tempo."
    ]
  },
  {
    category: "lanche",
    name: "Bolinho de frango e aveia (air fryer)",
    yield: 4,
    kcal: 198,
    protein: 27,
    ingredients: [
      {
        name: "Peito de frango moído",
        qty: 500,
        unit: "g"
      },
      {
        name: "Aveia em flocos",
        qty: 4,
        unit: "colher sopa"
      },
      {
        name: "Ovo",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Cebola picada",
        qty: 1,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Misture todos os ingredientes até formar uma massa que desgrude das mãos.",
      "Molde bolinhas pequenas.",
      "Leve à air fryer a 180°C por cerca de 12 minutos, virando na metade."
    ]
  },
  {
    category: "lanche",
    name: "Iogurte proteico com granola",
    yield: 3,
    kcal: 228,
    protein: 22,
    fast: true,
    ingredients: [
      {
        name: "Iogurte proteico (ou grego)",
        qty: 600,
        unit: "g"
      },
      {
        name: "Granola sem açúcar",
        qty: 90,
        unit: "g"
      }
    ],
    prep: [
      "Divida o iogurte em potinhos individuais.",
      "Adicione a granola só na hora de comer, para manter a crocância."
    ]
  },
  {
    category: "lanche",
    name: "Rap10 de peito de peru e queijo",
    yield: 2,
    kcal: 232,
    protein: 24,
    fast: true,
    ingredients: [
      {
        name: "Rap10 (tortilha fina)",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Peito de peru fatiado",
        qty: 120,
        unit: "g"
      },
      {
        name: "Queijo branco (minas)",
        qty: 60,
        unit: "g"
      },
      {
        name: "Alface",
        qty: 1,
        unit: "punhado"
      }
    ],
    prep: [
      "Aqueça levemente o rap10 para ficar mais maleável.",
      "Recheie com peito de peru, queijo e alface.",
      "Enrole bem apertado e corte ao meio."
    ]
  },
  {
    category: "lanche",
    name: "Mix proteico de grão-de-bico assado com especiarias",
    yield: 6,
    kcal: 148,
    protein: 8,
    ingredients: [
      {
        name: "Grão-de-bico cozido",
        qty: 400,
        unit: "g"
      },
      {
        name: "Azeite",
        qty: 1,
        unit: "colher sopa"
      },
      {
        name: "Páprica",
        qty: 1,
        unit: "colher chá"
      },
      {
        name: "Cominho",
        qty: 1,
        unit: "colher chá"
      }
    ],
    prep: [
      "Seque bem o grão-de-bico cozido com papel toalha.",
      "Tempere com azeite, páprica e cominho.",
      "Asse ou leve à air fryer até ficar crocante por fora, mexendo na metade do tempo."
    ]
  },
  {
    category: "lanche",
    name: "Bolinho de grão-de-bico assado (falafel fit)",
    yield: 6,
    kcal: 176,
    protein: 9,
    ingredients: [
      {
        name: "Grão-de-bico cozido",
        qty: 400,
        unit: "g"
      },
      {
        name: "Alho",
        qty: 2,
        unit: "dente"
      },
      {
        name: "Cominho",
        qty: 1,
        unit: "colher chá"
      },
      {
        name: "Salsinha picada",
        qty: 2,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Processe o grão-de-bico com alho, cominho e salsinha até formar uma pasta grossa.",
      "Molde bolinhas achatadas e leve à air fryer ou forno até dourar dos dois lados.",
      "Sirva quente ou frio; ótima opção vegetariana de lanche."
    ]
  },
  {
    category: "lanche",
    name: "Espetinho de frango com abacaxi (air fryer)",
    yield: 4,
    kcal: 214,
    protein: 30,
    ingredients: [
      {
        name: "Peito de frango em cubos",
        qty: 500,
        unit: "g"
      },
      {
        name: "Abacaxi em cubos",
        qty: 200,
        unit: "g"
      },
      {
        name: "Pimentão",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Molho shoyu light",
        qty: 1,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Tempere o frango com shoyu light e deixe marinar por 15 minutos.",
      "Monte os espetinhos alternando frango, abacaxi e pimentão.",
      "Leve à air fryer até o frango dourar e cozinhar por completo."
    ]
  },
  {
    category: "lanche",
    name: "Muffin salgado de claras com legumes",
    yield: 6,
    kcal: 92,
    protein: 11,
    ingredients: [
      {
        name: "Claras de ovo",
        qty: 8,
        unit: "unid"
      },
      {
        name: "Cenoura ralada",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Espinafre picado",
        qty: 50,
        unit: "g"
      },
      {
        name: "Queijo cottage",
        qty: 80,
        unit: "g"
      }
    ],
    prep: [
      "Misture as claras com a cenoura, o espinafre e o queijo cottage.",
      "Distribua em forminhas de muffin.",
      "Asse em forno preaquecido (180°C) por cerca de 20 minutos, até firmar."
    ]
  },
  {
    category: "lanche",
    name: "Iogurte com chia e frutas vermelhas",
    yield: 2,
    kcal: 186,
    protein: 14,
    fast: true,
    ingredients: [
      {
        name: "Iogurte natural desnatado",
        qty: 300,
        unit: "g"
      },
      {
        name: "Chia",
        qty: 2,
        unit: "colher sopa"
      },
      {
        name: "Frutas vermelhas",
        qty: 150,
        unit: "g"
      }
    ],
    prep: [
      "Misture o iogurte com a chia e deixe descansar por pelo menos 15 minutos para hidratar.",
      "Finalize com as frutas vermelhas por cima na hora de servir."
    ]
  },
  {
    category: "lanche",
    name: "Banana com pasta de amendoim",
    yield: 1,
    kcal: 260,
    protein: 8,
    fast: true,
    ingredients: [
      {
        name: "Banana",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Pasta de amendoim integral",
        qty: 1,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Corte a banana ao meio no sentido do comprimento.",
      "Espalhe a pasta de amendoim por cima e sirva."
    ]
  },
  {
    category: "lanche",
    name: "Bolinho de atum na frigideira (sem forno)",
    yield: 4,
    kcal: 180,
    protein: 20,
    fast: true,
    ingredients: [
      {
        name: "Atum em lata",
        qty: 2,
        unit: "lata"
      },
      {
        name: "Ovo",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Farinha de aveia",
        qty: 3,
        unit: "colher sopa"
      },
      {
        name: "Cebolinha",
        qty: 1,
        unit: "punhado"
      }
    ],
    prep: [
      "Escorra o atum e misture com o ovo, a farinha de aveia e a cebolinha.",
      "Molde pequenas porções e frite em frigideira antiaderente com pouco óleo, dos dois lados.",
      "Sirva quente ou frio."
    ]
  },
  {
    category: "lanche",
    name: "Copo de gelatina proteica (whey + gelatina zero)",
    yield: 2,
    kcal: 120,
    protein: 18,
    fast: true,
    ingredients: [
      {
        name: "Gelatina em pó sabor zero açúcar",
        qty: 1,
        unit: "pacote"
      },
      {
        name: "Água quente",
        qty: 200,
        unit: "ml"
      },
      {
        name: "Whey sabor baunilha",
        qty: 1,
        unit: "scoop"
      }
    ],
    prep: [
      "Dissolva a gelatina na água quente conforme instruções da embalagem.",
      "Deixe amornar e misture o whey, mexendo bem para não empelotar.",
      "Leve à geladeira até firmar."
    ]
  },
  {
    category: "lanche",
    name: "Mix de frutas picadas com iogurte",
    yield: 2,
    kcal: 190,
    protein: 8,
    fast: true,
    ingredients: [
      {
        name: "Iogurte natural",
        qty: 200,
        unit: "g"
      },
      {
        name: "Frutas picadas variadas",
        qty: 200,
        unit: "g"
      }
    ],
    prep: [
      "Corte as frutas em cubos pequenos.",
      "Misture com o iogurte e divida em potinhos."
    ]
  },
  {
    category: "lanche",
    name: "Sanduíche rápido de queijo branco com tomate",
    yield: 2,
    kcal: 220,
    protein: 14,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 4,
        unit: "fatia"
      },
      {
        name: "Queijo branco fatiado",
        qty: 100,
        unit: "g"
      },
      {
        name: "Tomate",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Monte o sanduíche com o queijo e o tomate fatiado entre o pão.",
      "Embale e leve para o lanche."
    ]
  },
  {
    category: "lanche",
    name: "Ovo cozido com torrada e tomate",
    yield: 2,
    kcal: 210,
    protein: 16,
    ingredients: [
      {
        name: "Ovo",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Pão integral",
        qty: 2,
        unit: "fatia"
      },
      {
        name: "Tomate",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Cozinhe os ovos por cerca de 9-10 minutos e resfrie em água gelada.",
      "Torre o pão e monte com o ovo fatiado e o tomate."
    ]
  },
  {
    category: "lanche",
    name: "Palitos de cenoura e pepino com homus",
    yield: 3,
    kcal: 150,
    protein: 7,
    fast: true,
    ingredients: [
      {
        name: "Cenoura",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Pepino",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Homus",
        qty: 150,
        unit: "g"
      }
    ],
    prep: [
      "Corte a cenoura e o pepino em palitos.",
      "Divida os palitos e o homus em potinhos individuais para dipar."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche natural de frango com cenoura e maionese de iogurte",
    yield: 4,
    kcal: 268,
    protein: 30,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 8,
        unit: "fatia"
      },
      {
        name: "Peito de frango desfiado",
        qty: 400,
        unit: "g"
      },
      {
        name: "Cenoura ralada",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Iogurte natural",
        qty: 100,
        unit: "g"
      },
      {
        name: "Mostarda",
        qty: 1,
        unit: "colher chá"
      }
    ],
    prep: [
      "Misture o frango desfiado com a cenoura ralada, o iogurte e a mostarda.",
      "Monte os sanduíches com o recheio entre as fatias de pão.",
      "Se for guardar mais de 1 dia, leve o recheio separado do pão e monte na hora."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche de peito de peru com queijo branco e rúcula",
    yield: 3,
    kcal: 246,
    protein: 26,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 6,
        unit: "fatia"
      },
      {
        name: "Peito de peru fatiado",
        qty: 240,
        unit: "g"
      },
      {
        name: "Queijo branco (minas)",
        qty: 120,
        unit: "g"
      },
      {
        name: "Rúcula",
        qty: 1,
        unit: "maço"
      }
    ],
    prep: [
      "Toste levemente as fatias de pão, se preferir.",
      "Monte com peito de peru, queijo branco fatiado e rúcula.",
      "Embale bem, com a rúcula por último para não amassar."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche de ricota com peito de peru e tomate seco",
    yield: 3,
    kcal: 258,
    protein: 24,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 6,
        unit: "fatia"
      },
      {
        name: "Ricota amassada",
        qty: 200,
        unit: "g"
      },
      {
        name: "Peito de peru fatiado",
        qty: 180,
        unit: "g"
      },
      {
        name: "Tomate seco",
        qty: 40,
        unit: "g"
      }
    ],
    prep: [
      "Amasse a ricota com um fio de azeite e o tomate seco picado até formar uma pasta.",
      "Passe a pasta de ricota no pão e complete com o peito de peru.",
      "Embale bem para levar."
    ]
  },
  {
    category: "sanduiche",
    name: "Wrap de atum com cream cheese light",
    yield: 3,
    kcal: 276,
    protein: 31,
    fast: true,
    ingredients: [
      {
        name: "Tortilha integral",
        qty: 3,
        unit: "unid"
      },
      {
        name: "Atum em lata (água)",
        qty: 3,
        unit: "lata"
      },
      {
        name: "Cream cheese light",
        qty: 90,
        unit: "g"
      },
      {
        name: "Alface",
        qty: 1,
        unit: "maço"
      }
    ],
    prep: [
      "Escorra bem o atum e misture com o cream cheese light.",
      "Espalhe na tortilha, adicione a alface e enrole bem apertado.",
      "Corte ao meio para servir."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche de omelete no pão integral",
    yield: 2,
    kcal: 296,
    protein: 26,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 4,
        unit: "fatia"
      },
      {
        name: "Ovo",
        qty: 4,
        unit: "unid"
      },
      {
        name: "Queijo muçarela light",
        qty: 60,
        unit: "g"
      },
      {
        name: "Tomate",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Bata os ovos e faça uma omelete fina em frigideira antiaderente.",
      "Dobre a omelete no tamanho do pão e recheie com queijo e tomate.",
      "Monte o sanduíche e sirva morno ou embale para levar."
    ]
  },
  {
    category: "sanduiche",
    name: "Misto quente fit (pão integral, queijo magro e peito de peru)",
    yield: 2,
    kcal: 312,
    protein: 28,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 4,
        unit: "fatia"
      },
      {
        name: "Queijo minas light",
        qty: 80,
        unit: "g"
      },
      {
        name: "Peito de peru fatiado",
        qty: 120,
        unit: "g"
      }
    ],
    prep: [
      "Monte o sanduíche com queijo e peito de peru entre as fatias de pão.",
      "Grelhe na sanduicheira ou frigideira com uma prensa até dourar dos dois lados.",
      "Sirva quente."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche de patê de frango com requeijão light",
    yield: 4,
    kcal: 264,
    protein: 30,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 8,
        unit: "fatia"
      },
      {
        name: "Peito de frango cozido",
        qty: 400,
        unit: "g"
      },
      {
        name: "Requeijão light",
        qty: 80,
        unit: "g"
      },
      {
        name: "Cebolinha",
        qty: 1,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Processe ou desfie bem o frango cozido e misture com o requeijão light e a cebolinha, formando um patê.",
      "Passe o patê generosamente entre as fatias de pão.",
      "Embale e leve à geladeira até a hora de comer."
    ]
  },
  {
    category: "sanduiche",
    name: "Hambúrguer caseiro fit em pão integral com salada",
    yield: 4,
    kcal: 398,
    protein: 40,
    fast: true,
    ingredients: [
      {
        name: "Patinho moído (magro)",
        qty: 600,
        unit: "g"
      },
      {
        name: "Pão integral (tipo hambúrguer)",
        qty: 4,
        unit: "unid"
      },
      {
        name: "Queijo muçarela light",
        qty: 80,
        unit: "g"
      },
      {
        name: "Alface e tomate",
        qty: 1,
        unit: "porção"
      }
    ],
    prep: [
      "Tempere a carne moída e molde os hambúrgueres.",
      "Grelhe em fogo alto até selar dos dois lados e cozinhar por dentro.",
      "Monte no pão com queijo, alface e tomate."
    ]
  },
  {
    category: "sanduiche",
    name: "Baguete integral com frango e rúcula",
    yield: 3,
    kcal: 312,
    protein: 34,
    fast: true,
    ingredients: [
      {
        name: "Baguete integral",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Peito de frango grelhado",
        qty: 400,
        unit: "g"
      },
      {
        name: "Rúcula",
        qty: 1,
        unit: "maço"
      },
      {
        name: "Mostarda e mel",
        qty: 1,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Corte a baguete em 3 partes e abra ao meio.",
      "Fatie o frango grelhado e monte com a rúcula.",
      "Regue com um fio da mistura de mostarda e mel."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche de homus de grão-de-bico com frango grelhado",
    yield: 3,
    kcal: 322,
    protein: 33,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 6,
        unit: "fatia"
      },
      {
        name: "Homus (pasta de grão-de-bico)",
        qty: 150,
        unit: "g"
      },
      {
        name: "Peito de frango grelhado",
        qty: 360,
        unit: "g"
      },
      {
        name: "Alface",
        qty: 1,
        unit: "maço"
      }
    ],
    prep: [
      "Passe uma camada generosa de homus no pão.",
      "Complete com o frango grelhado fatiado e a alface.",
      "Embale bem, levando o homus e o frango separados se for guardar por mais tempo."
    ]
  },
  {
    category: "sanduiche",
    name: "Panini fit de frango e queijo",
    yield: 2,
    kcal: 336,
    protein: 36,
    fast: true,
    ingredients: [
      {
        name: "Pão integral tipo ciabatta",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Peito de frango grelhado",
        qty: 300,
        unit: "g"
      },
      {
        name: "Queijo muçarela light",
        qty: 80,
        unit: "g"
      },
      {
        name: "Tomate",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Corte o pão ao meio e recheie com frango fatiado, queijo e tomate.",
      "Prense numa sanduicheira ou frigideira com peso até dourar e o queijo derreter.",
      "Sirva quente."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche de salmão defumado com cream cheese light",
    yield: 2,
    kcal: 288,
    protein: 26,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 4,
        unit: "fatia"
      },
      {
        name: "Salmão defumado",
        qty: 120,
        unit: "g"
      },
      {
        name: "Cream cheese light",
        qty: 60,
        unit: "g"
      },
      {
        name: "Alcaparras",
        qty: 1,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Passe o cream cheese light nas fatias de pão.",
      "Cubra com o salmão defumado e finalize com alcaparras.",
      "Sirva montado na hora, de preferência, para manter a textura do pão."
    ]
  },
  {
    category: "sanduiche",
    name: "Club sandwich fit (frango, peito de peru, ovo e alface)",
    yield: 2,
    kcal: 386,
    protein: 42,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 6,
        unit: "fatia"
      },
      {
        name: "Peito de frango grelhado",
        qty: 200,
        unit: "g"
      },
      {
        name: "Peito de peru fatiado",
        qty: 80,
        unit: "g"
      },
      {
        name: "Ovo",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Alface e tomate",
        qty: 1,
        unit: "porção"
      }
    ],
    prep: [
      "Cozinhe os ovos e fatie.",
      "Monte em camadas: pão, frango e alface, pão, peito de peru, ovo e tomate, pão.",
      "Corte em triângulos e espete com palitos para firmar."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche de tofu grelhado com legumes",
    yield: 3,
    kcal: 254,
    protein: 20,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 6,
        unit: "fatia"
      },
      {
        name: "Tofu firme",
        qty: 300,
        unit: "g"
      },
      {
        name: "Abobrinha",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Molho shoyu light",
        qty: 1,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Corte o tofu em fatias, tempere com shoyu e grelhe até dourar dos dois lados.",
      "Grelhe também fatias finas de abobrinha.",
      "Monte o sanduíche com tofu e abobrinha grelhados."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche de atum com ovo e maionese de iogurte",
    yield: 3,
    kcal: 266,
    protein: 29,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 6,
        unit: "fatia"
      },
      {
        name: "Atum em lata (água)",
        qty: 2,
        unit: "lata"
      },
      {
        name: "Ovo cozido",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Iogurte natural",
        qty: 60,
        unit: "g"
      }
    ],
    prep: [
      "Escorra o atum e amasse com o ovo cozido picado e o iogurte.",
      "Tempere com sal, pimenta e cheiro-verde a gosto.",
      "Monte os sanduíches e embale bem, levando o recheio separado se for guardar por mais tempo."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche de peru com abacate e ovo",
    yield: 3,
    kcal: 342,
    protein: 28,
    fast: true,
    ingredients: [
      {
        name: "Pão integral",
        qty: 6,
        unit: "fatia"
      },
      {
        name: "Peito de peru fatiado",
        qty: 200,
        unit: "g"
      },
      {
        name: "Abacate",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Ovo cozido",
        qty: 3,
        unit: "unid"
      }
    ],
    prep: [
      "Amasse o abacate levemente com limão e uma pitada de sal.",
      "Monte o sanduíche com pão, peito de peru, ovo fatiado e o abacate.",
      "Leve o abacate separado se for guardar por mais de algumas horas, para não escurecer."
    ]
  },
  {
    category: "sanduiche",
    name: "Wrap vegetariano de grão-de-bico e legumes",
    yield: 3,
    kcal: 288,
    protein: 14,
    fast: true,
    ingredients: [
      {
        name: "Tortilha integral",
        qty: 3,
        unit: "unid"
      },
      {
        name: "Grão-de-bico cozido",
        qty: 300,
        unit: "g"
      },
      {
        name: "Cenoura ralada",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Alface",
        qty: 1,
        unit: "maço"
      }
    ],
    prep: [
      "Amasse levemente o grão-de-bico com azeite, limão e temperos.",
      "Recheie as tortilhas com a pasta de grão-de-bico, cenoura ralada e alface.",
      "Enrole bem apertado e corte ao meio; opção vegetariana rica em fibras."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche de carne suína desfiada fit",
    yield: 4,
    kcal: 356,
    protein: 34,
    ingredients: [
      {
        name: "Lombo suíno desfiado",
        qty: 500,
        unit: "g"
      },
      {
        name: "Pão integral",
        qty: 8,
        unit: "fatia"
      },
      {
        name: "Molho barbecue caseiro light",
        qty: 100,
        unit: "ml"
      },
      {
        name: "Repolho roxo ralado",
        qty: 150,
        unit: "g"
      }
    ],
    prep: [
      "Cozinhe o lombo em panela de pressão até desfiar facilmente e misture com o molho barbecue.",
      "Monte os sanduíches com a carne desfiada e o repolho roxo por cima.",
      "Leve o recheio separado se for guardar por mais tempo."
    ]
  },
  {
    category: "sanduiche",
    name: "Baguete de ricota com tomate seco e manjericão",
    yield: 3,
    kcal: 268,
    protein: 16,
    fast: true,
    ingredients: [
      {
        name: "Baguete integral",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Ricota",
        qty: 250,
        unit: "g"
      },
      {
        name: "Tomate seco",
        qty: 60,
        unit: "g"
      },
      {
        name: "Manjericão fresco",
        qty: 1,
        unit: "punhado"
      }
    ],
    prep: [
      "Amasse a ricota com o tomate seco picado e o manjericão.",
      "Recheie a baguete cortada ao meio com a pasta de ricota.",
      "Corte em porções e embale; opção vegetariana leve."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche de frango barbecue com cebola caramelizada",
    yield: 3,
    kcal: 372,
    protein: 36,
    ingredients: [
      {
        name: "Peito de frango desfiado",
        qty: 400,
        unit: "g"
      },
      {
        name: "Molho barbecue caseiro light",
        qty: 80,
        unit: "ml"
      },
      {
        name: "Cebola",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Pão integral",
        qty: 6,
        unit: "fatia"
      }
    ],
    prep: [
      "Refogue a cebola fatiada em fogo baixo até caramelizar, com um fio de água se necessário.",
      "Misture o frango desfiado com o molho barbecue.",
      "Monte os sanduíches com o frango e a cebola caramelizada por cima."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche de frango grelhado com mostarda e mel",
    yield: 3,
    kcal: 352,
    protein: 38,
    fast: true,
    ingredients: [
      {
        name: "Peito de frango grelhado fatiado",
        qty: 400,
        unit: "g"
      },
      {
        name: "Pão integral",
        qty: 6,
        unit: "fatia"
      },
      {
        name: "Mostarda e mel",
        qty: 2,
        unit: "colher sopa"
      },
      {
        name: "Alface",
        qty: 1,
        unit: "maço"
      }
    ],
    prep: [
      "Misture a mostarda com o mel.",
      "Monte os sanduíches com o frango, a alface e o molho de mostarda e mel."
    ]
  },
  {
    category: "sanduiche",
    name: "Baguete de atum com azeitonas e cream cheese",
    yield: 2,
    kcal: 340,
    protein: 26,
    fast: true,
    ingredients: [
      {
        name: "Baguete integral",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Atum em lata",
        qty: 2,
        unit: "lata"
      },
      {
        name: "Cream cheese light",
        qty: 60,
        unit: "g"
      },
      {
        name: "Azeitonas picadas",
        qty: 30,
        unit: "g"
      }
    ],
    prep: [
      "Escorra o atum e misture com o cream cheese e as azeitonas picadas.",
      "Recheie a baguete cortada ao meio e corte em porções."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche de omelete com peito de peru e queijo",
    yield: 2,
    kcal: 330,
    protein: 28,
    fast: true,
    ingredients: [
      {
        name: "Ovo",
        qty: 3,
        unit: "unid"
      },
      {
        name: "Peito de peru",
        qty: 100,
        unit: "g"
      },
      {
        name: "Queijo branco",
        qty: 60,
        unit: "g"
      },
      {
        name: "Pão integral",
        qty: 4,
        unit: "fatia"
      }
    ],
    prep: [
      "Bata os ovos e faça uma omelete fina em frigideira antiaderente.",
      "Monte o sanduíche com a omelete, o peito de peru e o queijo."
    ]
  },
  {
    category: "sanduiche",
    name: "Wrap de carne moída com queijo e milho",
    yield: 3,
    kcal: 376,
    protein: 32,
    ingredients: [
      {
        name: "Patinho moído magro",
        qty: 400,
        unit: "g"
      },
      {
        name: "Tortilha integral",
        qty: 3,
        unit: "unid"
      },
      {
        name: "Queijo mussarela light",
        qty: 80,
        unit: "g"
      },
      {
        name: "Milho verde",
        qty: 80,
        unit: "g"
      }
    ],
    prep: [
      "Refogue a carne moída temperada até dourar por completo.",
      "Recheie as tortilhas com a carne, o queijo e o milho.",
      "Enrole bem apertado e corte ao meio."
    ]
  },
  {
    category: "sanduiche",
    name: "Sanduíche natural de ricota com peito de peru e rúcula",
    yield: 3,
    kcal: 290,
    protein: 24,
    fast: true,
    ingredients: [
      {
        name: "Ricota amassada",
        qty: 200,
        unit: "g"
      },
      {
        name: "Peito de peru",
        qty: 150,
        unit: "g"
      },
      {
        name: "Rúcula",
        qty: 1,
        unit: "maço"
      },
      {
        name: "Pão integral",
        qty: 6,
        unit: "fatia"
      }
    ],
    prep: [
      "Amasse a ricota com um fio de azeite e sal.",
      "Monte os sanduíches com a ricota, o peito de peru e a rúcula."
    ]
  },
  {
    category: "vegetariana",
    name: "Tofu grelhado com quinoa e legumes",
    yield: 3,
    kcal: 360,
    protein: 24,
    vegan: true,
    ingredients: [
      {
        name: "Tofu firme",
        qty: 400,
        unit: "g"
      },
      {
        name: "Quinoa",
        qty: 1,
        unit: "xíc"
      },
      {
        name: "Abobrinha",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Shoyu light",
        qty: 2,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Corte o tofu em fatias, tempere com shoyu e grelhe até dourar dos dois lados.",
      "Cozinhe a quinoa conforme instruções da embalagem.",
      "Grelhe a abobrinha em fatias.",
      "Monte as marmitas com quinoa, tofu e abobrinha."
    ]
  },
  {
    category: "vegetariana",
    name: "Grão-de-bico ao curry com arroz integral",
    yield: 4,
    kcal: 398,
    protein: 16,
    vegan: true,
    ingredients: [
      {
        name: "Grão-de-bico cozido",
        qty: 500,
        unit: "g"
      },
      {
        name: "Leite de coco light",
        qty: 200,
        unit: "ml"
      },
      {
        name: "Curry em pó",
        qty: 1,
        unit: "colher sopa"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Arroz integral",
        qty: 2,
        unit: "xíc"
      }
    ],
    prep: [
      "Refogue a cebola, junte o grão-de-bico e o curry.",
      "Adicione o leite de coco e cozinhe em fogo baixo por 10 minutos até encorpar.",
      "Cozinhe o arroz integral separadamente.",
      "Monte as marmitas com arroz e o curry de grão-de-bico."
    ]
  },
  {
    category: "vegetariana",
    name: "Feijoada de lentilha fit",
    yield: 4,
    kcal: 340,
    protein: 18,
    vegan: true,
    ingredients: [
      {
        name: "Lentilha",
        qty: 400,
        unit: "g"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Alho",
        qty: 2,
        unit: "dente"
      },
      {
        name: "Louro",
        qty: 2,
        unit: "folha"
      },
      {
        name: "Arroz",
        qty: 2,
        unit: "xíc"
      }
    ],
    prep: [
      "Refogue a cebola e o alho, junte a lentilha lavada, o louro e água.",
      "Cozinhe em fogo baixo até a lentilha ficar macia, cerca de 25-30 minutos.",
      "Cozinhe o arroz separadamente.",
      "Monte as marmitas com arroz e a lentilha."
    ]
  },
  {
    category: "vegetariana",
    name: "Hambúrguer de grão-de-bico com salada",
    yield: 4,
    kcal: 310,
    protein: 14,
    vegan: true,
    ingredients: [
      {
        name: "Grão-de-bico cozido",
        qty: 400,
        unit: "g"
      },
      {
        name: "Aveia em flocos",
        qty: 40,
        unit: "g"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Cominho",
        qty: 1,
        unit: "colher chá"
      },
      {
        name: "Pão integral",
        qty: 4,
        unit: "unid"
      }
    ],
    prep: [
      "Processe o grão-de-bico com a cebola, a aveia e o cominho até formar uma massa que desgrude das mãos.",
      "Molde os hambúrgueres e grelhe em frigideira antiaderente até dourar dos dois lados.",
      "Monte no pão com salada a gosto."
    ]
  },
  {
    category: "vegetariana",
    name: "Omelete de claras com legumes",
    yield: 2,
    kcal: 210,
    protein: 24,
    fast: true,
    ingredients: [
      {
        name: "Claras de ovo",
        qty: 8,
        unit: "unid"
      },
      {
        name: "Abobrinha",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Tomate",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Queijo branco",
        qty: 50,
        unit: "g"
      }
    ],
    prep: [
      "Refogue a abobrinha e o tomate picados rapidamente.",
      "Bata as claras levemente e despeje sobre os legumes.",
      "Adicione o queijo branco e cozinhe em fogo baixo até firmar, dobrando ao meio."
    ]
  },
  {
    category: "vegetariana",
    name: "Bowl de tofu e batata-doce assados",
    yield: 3,
    kcal: 340,
    protein: 20,
    vegan: true,
    ingredients: [
      {
        name: "Tofu firme em cubos",
        qty: 350,
        unit: "g"
      },
      {
        name: "Batata-doce",
        qty: 500,
        unit: "g"
      },
      {
        name: "Azeite",
        qty: 1,
        unit: "colher sopa"
      },
      {
        name: "Páprica",
        qty: 1,
        unit: "colher chá"
      }
    ],
    prep: [
      "Corte o tofu e a batata-doce em cubos e tempere com azeite e páprica.",
      "Asse em forno médio (ou air fryer) até dourar, virando na metade do tempo.",
      "Divida em potes."
    ]
  },
  {
    category: "vegetariana",
    name: "Macarrão de abobrinha com molho de amêndoas",
    yield: 3,
    kcal: 280,
    protein: 12,
    vegan: true,
    ingredients: [
      {
        name: "Abobrinha",
        qty: 4,
        unit: "unid"
      },
      {
        name: "Amêndoas cruas",
        qty: 60,
        unit: "g"
      },
      {
        name: "Alho",
        qty: 1,
        unit: "dente"
      },
      {
        name: "Azeite",
        qty: 1,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Corte a abobrinha em tiras finas (tipo talharim) com um espiralizador ou faca.",
      "Bata as amêndoas com alho, azeite e um pouco de água até formar um molho cremoso.",
      "Misture o molho no macarrão de abobrinha cru ou levemente refogado."
    ]
  },
  {
    category: "vegetariana",
    name: "Proteína de soja (PTS) refogada com arroz",
    yield: 4,
    kcal: 360,
    protein: 28,
    vegan: true,
    ingredients: [
      {
        name: "Proteína de soja texturizada (PTS)",
        qty: 200,
        unit: "g"
      },
      {
        name: "Molho de tomate",
        qty: 250,
        unit: "ml"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Arroz",
        qty: 2,
        unit: "xíc"
      }
    ],
    prep: [
      "Hidrate a PTS em água quente por 10 minutos e escorra bem, espremendo o excesso.",
      "Refogue a cebola, junte a PTS e o molho de tomate, cozinhe por 10 minutos.",
      "Cozinhe o arroz separadamente.",
      "Monte as marmitas com arroz e a PTS refogada."
    ]
  },
  {
    category: "vegetariana",
    name: "Panqueca de grão-de-bico (socca)",
    yield: 2,
    kcal: 250,
    protein: 14,
    vegan: true,
    fast: true,
    ingredients: [
      {
        name: "Farinha de grão-de-bico",
        qty: 100,
        unit: "g"
      },
      {
        name: "Água",
        qty: 150,
        unit: "ml"
      },
      {
        name: "Azeite",
        qty: 1,
        unit: "colher sopa"
      },
      {
        name: "Cebolinha",
        qty: 1,
        unit: "punhado"
      }
    ],
    prep: [
      "Misture a farinha de grão-de-bico com a água e o azeite até formar uma massa lisa.",
      "Adicione a cebolinha picada.",
      "Cozinhe pequenas porções em frigideira antiaderente, virando quando dourar."
    ]
  },
  {
    category: "vegetariana",
    name: "Tofu com shoyu e gergelim",
    yield: 3,
    kcal: 260,
    protein: 20,
    vegan: true,
    fast: true,
    ingredients: [
      {
        name: "Tofu firme",
        qty: 400,
        unit: "g"
      },
      {
        name: "Shoyu light",
        qty: 2,
        unit: "colher sopa"
      },
      {
        name: "Gergelim",
        qty: 1,
        unit: "colher sopa"
      },
      {
        name: "Cebolinha",
        qty: 1,
        unit: "punhado"
      }
    ],
    prep: [
      "Corte o tofu em cubos e grelhe em frigideira antiaderente até dourar.",
      "Regue com shoyu e finalize com gergelim e cebolinha."
    ]
  },
  {
    category: "vegetariana",
    name: "Seitan grelhado com legumes salteados",
    yield: 3,
    kcal: 320,
    protein: 30,
    vegan: true,
    ingredients: [
      {
        name: "Seitan",
        qty: 350,
        unit: "g"
      },
      {
        name: "Pimentão",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Shoyu light",
        qty: 2,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Fatie o seitan e grelhe em frigideira antiaderente com um fio de óleo.",
      "Refogue os legumes com o shoyu, rapidamente para manterem crocantes.",
      "Monte as marmitas com seitan e legumes."
    ]
  },
  {
    category: "vegetariana",
    name: "Salada de quinoa com grão-de-bico e legumes",
    yield: 3,
    kcal: 310,
    protein: 14,
    vegan: true,
    fast: true,
    ingredients: [
      {
        name: "Quinoa cozida",
        qty: 300,
        unit: "g"
      },
      {
        name: "Grão-de-bico cozido",
        qty: 200,
        unit: "g"
      },
      {
        name: "Pepino",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Tomate cereja",
        qty: 150,
        unit: "g"
      },
      {
        name: "Limão",
        qty: 1,
        unit: "unid"
      }
    ],
    prep: [
      "Misture a quinoa e o grão-de-bico já cozidos e frios.",
      "Adicione o pepino e o tomate picados.",
      "Tempere com limão, azeite e sal a gosto."
    ]
  },
  {
    category: "vegetariana",
    name: "Wrap vegano de homus com legumes",
    yield: 3,
    kcal: 280,
    protein: 11,
    vegan: true,
    fast: true,
    ingredients: [
      {
        name: "Tortilha integral",
        qty: 3,
        unit: "unid"
      },
      {
        name: "Homus",
        qty: 200,
        unit: "g"
      },
      {
        name: "Cenoura ralada",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Alface",
        qty: 1,
        unit: "maço"
      }
    ],
    prep: [
      "Espalhe o homus na tortilha.",
      "Adicione a cenoura ralada e a alface.",
      "Enrole bem apertado e corte ao meio."
    ]
  },
  {
    category: "vegetariana",
    name: "Chili vegetariano de feijão preto",
    yield: 4,
    kcal: 330,
    protein: 18,
    vegan: true,
    ingredients: [
      {
        name: "Feijão preto cozido",
        qty: 500,
        unit: "g"
      },
      {
        name: "Milho verde",
        qty: 150,
        unit: "g"
      },
      {
        name: "Molho de tomate",
        qty: 200,
        unit: "ml"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Pimenta em pó",
        qty: 1,
        unit: "colher chá"
      }
    ],
    prep: [
      "Refogue a cebola, junte o feijão, o milho e o molho de tomate.",
      "Tempere com a pimenta e cozinhe em fogo baixo por 15 minutos, amassando parte do feijão para encorpar.",
      "Divida em potes."
    ]
  },
  {
    category: "vegetariana",
    name: "Torta de legumes com tofu (sem farinha)",
    yield: 4,
    kcal: 250,
    protein: 16,
    vegan: true,
    ingredients: [
      {
        name: "Tofu firme",
        qty: 300,
        unit: "g"
      },
      {
        name: "Abobrinha",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Cenoura",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Farinha de aveia",
        qty: 3,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Amasse o tofu com um garfo e misture com os legumes ralados e a farinha de aveia.",
      "Tempere e coloque numa forma untada.",
      "Asse em forno médio por cerca de 30 minutos, até firmar e dourar por cima."
    ]
  },
  {
    category: "vegetariana",
    name: "Risoto de cogumelos fit",
    yield: 3,
    kcal: 340,
    protein: 12,
    ingredients: [
      {
        name: "Arroz arbóreo ou branco",
        qty: 1,
        unit: "xíc"
      },
      {
        name: "Cogumelos fatiados",
        qty: 300,
        unit: "g"
      },
      {
        name: "Cebola",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Queijo parmesão ralado",
        qty: 30,
        unit: "g"
      }
    ],
    prep: [
      "Refogue a cebola e os cogumelos até soltarem água e dourarem.",
      "Junte o arroz e vá adicionando água quente aos poucos, mexendo, até cozinhar (risoto).",
      "Finalize com o parmesão e sirva."
    ]
  },
  {
    category: "vegetariana",
    name: "Ovos mexidos com grão-de-bico e espinafre",
    yield: 2,
    kcal: 320,
    protein: 22,
    ingredients: [
      {
        name: "Ovo",
        qty: 4,
        unit: "unid"
      },
      {
        name: "Grão-de-bico cozido",
        qty: 200,
        unit: "g"
      },
      {
        name: "Espinafre",
        qty: 1,
        unit: "maço"
      }
    ],
    prep: [
      "Refogue o espinafre e o grão-de-bico rapidamente numa frigideira.",
      "Adicione os ovos batidos e mexa em fogo baixo até cozinhar.",
      "Sirva quente ou em marmita."
    ]
  },
  {
    category: "sobremesa",
    name: "Bolo de banana fit",
    yield: 8,
    kcal: 150,
    protein: 5,
    ingredients: [
      {
        name: "Banana",
        qty: 3,
        unit: "unid"
      },
      {
        name: "Aveia em flocos",
        qty: 150,
        unit: "g"
      },
      {
        name: "Ovo",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Fermento em pó",
        qty: 1,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Amasse as bananas e bata com os ovos.",
      "Misture a aveia e o fermento até formar uma massa homogênea.",
      "Asse em forma untada, em forno médio, por cerca de 30-35 minutos.",
      "Corte em 8 fatias."
    ]
  },
  {
    category: "sobremesa",
    name: "Brigadeiro proteico sem leite condensado",
    yield: 10,
    kcal: 60,
    protein: 4,
    fast: true,
    ingredients: [
      {
        name: "Whey sabor chocolate",
        qty: 2,
        unit: "scoop"
      },
      {
        name: "Pasta de amendoim",
        qty: 2,
        unit: "colher sopa"
      },
      {
        name: "Cacau em pó",
        qty: 1,
        unit: "colher sopa"
      },
      {
        name: "Leite",
        qty: 60,
        unit: "ml"
      }
    ],
    prep: [
      "Misture todos os ingredientes até formar uma massa homogênea e moldável, ajustando o leite aos poucos.",
      "Molde bolinhas pequenas.",
      "Passe em cacau em pó, se quiser, e leve à geladeira para firmar."
    ]
  },
  {
    category: "sobremesa",
    name: "Mousse de chocolate com abacate",
    yield: 4,
    kcal: 180,
    protein: 6,
    vegan: true,
    fast: true,
    ingredients: [
      {
        name: "Abacate",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Cacau em pó",
        qty: 3,
        unit: "colher sopa"
      },
      {
        name: "Mel ou adoçante",
        qty: 2,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Bata o abacate, o cacau e o mel no processador até ficar cremoso.",
      "Divida em potinhos e leve à geladeira por pelo menos 30 minutos antes de servir."
    ]
  },
  {
    category: "sobremesa",
    name: "Pudim de chia com leite e baunilha",
    yield: 3,
    kcal: 170,
    protein: 8,
    fast: true,
    ingredients: [
      {
        name: "Chia",
        qty: 4,
        unit: "colher sopa"
      },
      {
        name: "Leite",
        qty: 400,
        unit: "ml"
      },
      {
        name: "Essência de baunilha",
        qty: 1,
        unit: "colher chá"
      }
    ],
    prep: [
      "Misture a chia, o leite e a baunilha num pote.",
      "Leve à geladeira por pelo menos 3 horas (ou de um dia para o outro) até engrossar.",
      "Sirva puro ou com frutas."
    ]
  },
  {
    category: "sobremesa",
    name: "Banana assada com canela",
    yield: 2,
    kcal: 110,
    protein: 2,
    vegan: true,
    fast: true,
    ingredients: [
      {
        name: "Banana",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Canela em pó",
        qty: 1,
        unit: "pitada"
      }
    ],
    prep: [
      "Corte as bananas ao meio no sentido do comprimento, com casca ou sem.",
      "Polvilhe canela e leve à air fryer ou forno quente por 8-10 minutos, até dourar."
    ]
  },
  {
    category: "sobremesa",
    name: "Doce de batata-doce cremoso",
    yield: 6,
    kcal: 120,
    protein: 2,
    vegan: true,
    ingredients: [
      {
        name: "Batata-doce",
        qty: 600,
        unit: "g"
      },
      {
        name: "Canela em pó",
        qty: 1,
        unit: "colher chá"
      },
      {
        name: "Adoçante ou mel",
        qty: 2,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Cozinhe a batata-doce até ficar bem macia.",
      "Amasse ou bata no processador com a canela e o adoçante até ficar cremoso.",
      "Divida em potinhos."
    ]
  },
  {
    category: "sobremesa",
    name: "Brownie de feijão preto (sem farinha)",
    yield: 9,
    kcal: 140,
    protein: 6,
    ingredients: [
      {
        name: "Feijão preto cozido",
        qty: 400,
        unit: "g"
      },
      {
        name: "Cacau em pó",
        qty: 4,
        unit: "colher sopa"
      },
      {
        name: "Ovo",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Adoçante ou açúcar demerara",
        qty: 80,
        unit: "g"
      }
    ],
    prep: [
      "Bata o feijão, o cacau, os ovos e o adoçante no processador até virar uma massa lisa.",
      "Coloque numa forma pequena untada.",
      "Asse em forno médio por cerca de 25 minutos.",
      "Corte em 9 pedaços."
    ]
  },
  {
    category: "sobremesa",
    name: "Cookies de aveia e banana (2 ingredientes)",
    yield: 10,
    kcal: 70,
    protein: 2,
    vegan: true,
    fast: true,
    ingredients: [
      {
        name: "Banana",
        qty: 2,
        unit: "unid"
      },
      {
        name: "Aveia em flocos",
        qty: 120,
        unit: "g"
      }
    ],
    prep: [
      "Amasse as bananas e misture com a aveia até formar uma massa.",
      "Molde cookies achatados numa forma forrada.",
      "Asse em forno médio por cerca de 12-15 minutos, até dourar."
    ]
  },
  {
    category: "sobremesa",
    name: "Gelatina de frutas natural",
    yield: 4,
    kcal: 50,
    protein: 2,
    vegan: true,
    fast: true,
    ingredients: [
      {
        name: "Gelatina em pó sabor zero açúcar",
        qty: 1,
        unit: "pacote"
      },
      {
        name: "Água quente",
        qty: 200,
        unit: "ml"
      },
      {
        name: "Frutas picadas",
        qty: 150,
        unit: "g"
      }
    ],
    prep: [
      "Dissolva a gelatina na água quente conforme instruções da embalagem.",
      "Adicione as frutas picadas e divida em potinhos.",
      "Leve à geladeira até firmar."
    ]
  },
  {
    category: "sobremesa",
    name: "Torta de maçã fit (base de aveia)",
    yield: 8,
    kcal: 160,
    protein: 4,
    ingredients: [
      {
        name: "Maçã",
        qty: 4,
        unit: "unid"
      },
      {
        name: "Aveia em flocos",
        qty: 150,
        unit: "g"
      },
      {
        name: "Ovo",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Canela em pó",
        qty: 1,
        unit: "colher chá"
      }
    ],
    prep: [
      "Misture a aveia, o ovo e a canela para formar a base; pressione numa forma.",
      "Cubra com as maçãs fatiadas finas.",
      "Asse em forno médio por 30-35 minutos, até as maçãs amaciarem e a base dourar."
    ]
  },
  {
    category: "sobremesa",
    name: "Bolinho de cenoura integral com cobertura de chocolate",
    yield: 10,
    kcal: 130,
    protein: 4,
    ingredients: [
      {
        name: "Cenoura",
        qty: 3,
        unit: "unid"
      },
      {
        name: "Farinha integral",
        qty: 150,
        unit: "g"
      },
      {
        name: "Ovo",
        qty: 3,
        unit: "unid"
      },
      {
        name: "Cacau em pó",
        qty: 2,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Bata a cenoura com os ovos no liquidificador.",
      "Misture com a farinha e despeje em forminhas.",
      "Asse em forno médio por 20-25 minutos.",
      "Finalize com uma calda simples de cacau, se quiser."
    ]
  },
  {
    category: "sobremesa",
    name: "Picolé de frutas natural",
    yield: 6,
    kcal: 60,
    protein: 1,
    vegan: true,
    fast: true,
    ingredients: [
      {
        name: "Frutas picadas (manga, morango ou abacaxi)",
        qty: 400,
        unit: "g"
      },
      {
        name: "Água ou suco natural",
        qty: 100,
        unit: "ml"
      }
    ],
    prep: [
      "Bata as frutas com a água ou o suco até ficar homogêneo.",
      "Distribua em forminhas de picolé.",
      "Congele por pelo menos 4 horas antes de servir."
    ]
  },
  {
    category: "sobremesa",
    name: "Barrinha de cereal caseira (aveia, mel e frutas secas)",
    yield: 8,
    kcal: 110,
    protein: 3,
    ingredients: [
      {
        name: "Aveia em flocos",
        qty: 150,
        unit: "g"
      },
      {
        name: "Mel",
        qty: 60,
        unit: "ml"
      },
      {
        name: "Frutas secas picadas",
        qty: 60,
        unit: "g"
      },
      {
        name: "Pasta de amendoim",
        qty: 2,
        unit: "colher sopa"
      }
    ],
    prep: [
      "Aqueça o mel com a pasta de amendoim até ficar líquido.",
      "Misture com a aveia e as frutas secas.",
      "Pressione numa forma forrada e leve à geladeira por 1-2 horas antes de cortar em 8 barras."
    ]
  },
  {
    category: "sobremesa",
    name: "Compota de frutas sem açúcar refinado",
    yield: 6,
    kcal: 70,
    protein: 1,
    vegan: true,
    ingredients: [
      {
        name: "Maçã ou pera picada",
        qty: 500,
        unit: "g"
      },
      {
        name: "Canela em pau",
        qty: 1,
        unit: "unid"
      },
      {
        name: "Água",
        qty: 100,
        unit: "ml"
      }
    ],
    prep: [
      "Cozinhe as frutas picadas com a canela e a água em fogo baixo, mexendo de vez em quando.",
      "Cozinhe até as frutas amaciarem e formarem uma calda, cerca de 15-20 minutos.",
      "Guarde na geladeira em pote fechado."
    ]
  }
];
