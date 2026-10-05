/**
 * Static supplement reference catalog for the Suplementação page.
 *
 * Ported verbatim from the prototype's `SUPPLEMENTS` constant
 * (projeto_fenix_app_final.html, ~lines 15411-15657) via a brace-matched
 * extraction + vm eval (not hand-transcribed). The extraction found 79
 * entries (confirmed independently by counting `name:` occurrences inside
 * the array's exact bracket span) — informational content, no dosing
 * decisions were made up.
 *
 * This is reference content, not user data, so it stays static TS data
 * rather than a Supabase table (see lib/marmita-suggestions.ts for the
 * same rationale).
 */

export interface Supplement {
  name: string;
  tags: string[];
  desc: string;
  dose: string;
}

// Ported from `SUP_CATEGORIES` (projeto_fenix_app_final.html, ~line 15401).
export const SUPPLEMENT_CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "hipertrofia", label: "Hipertrofia / Massa" },
  { key: "forca", label: "Força / Performance" },
  { key: "emagrecimento", label: "Emagrecimento / Definição" },
  { key: "recuperacao", label: "Recuperação / Saúde geral" },
  { key: "pretreino", label: "Pré-treino / Energia" },
];

// Ported from `GOAL_TO_CATEGORY` (projeto_fenix_app_final.html, ~line 15658)
// — used to pre-select a filter category from the profile's `goal`. Only
// used to pre-filter the Suplementação browse page's category tabs
// (SupplementsBrowser no longer even does that — see that file's own
// comment on the 2026-10-04 "stuck on one category" fix); kept exported in
// case something else wants a single category guess from a goal.
export const GOAL_TO_SUPPLEMENT_CATEGORY: Record<string, string> = {
  perder: "emagrecimento",
  ganhar: "hipertrofia",
  manter: "recuperacao",
  recomp: "recuperacao",
};

export const SUPPLEMENTS: Supplement[] = [
  {
    name: "Whey Protein Concentrado",
    tags: [
      "hipertrofia",
      "recuperacao"
    ],
    desc: "Proteína do soro do leite de absorção rápida. Ajuda a bater a meta diária de proteína pra ganho e manutenção de massa magra.",
    dose: "1 dose (~25-30g) após o treino ou entre refeições, com água ou leite."
  },
  {
    name: "Whey Protein Isolado",
    tags: [
      "hipertrofia",
      "emagrecimento",
      "recuperacao"
    ],
    desc: "Versão com menos lactose/gordura e mais proteína por dose. Boa opção pra quem tem intolerância leve ou está em déficit calórico.",
    dose: "1 dose (~25-30g) pós-treino ou como lanche de baixa caloria."
  },
  {
    name: "Caseína",
    tags: [
      "hipertrofia",
      "recuperacao"
    ],
    desc: "Proteína do leite de absorção lenta. Libera aminoácidos aos poucos, boa pra período longo sem comer (ex: durante o sono).",
    dose: "1 dose (~25-30g) antes de dormir."
  },
  {
    name: "Hipercalórico / Mass Gainer",
    tags: [
      "hipertrofia"
    ],
    desc: "Mistura de carboidrato + proteína (e às vezes gordura) pra facilitar bater um superávit calórico alto sem precisar comer volume enorme.",
    dose: "1 dose entre refeições ou pós-treino, ajustando a quantidade conforme a meta de kcal do dia."
  },
  {
    name: "Creatina Monohidratada",
    tags: [
      "hipertrofia",
      "forca"
    ],
    desc: "O suplemento mais estudado pra performance: aumenta força, potência e volume de treino, e ajuda na retenção de água intramuscular (mais volume muscular).",
    dose: "3-5g por dia, todos os dias (inclusive em dias sem treino), horário não importa muito."
  },
  {
    name: "Albumina",
    tags: [
      "hipertrofia",
      "recuperacao"
    ],
    desc: "Proteína da clara do ovo em pó, alternativa mais barata ao whey, absorção intermediária.",
    dose: "1 dose (~20-30g) diluída em água ou suco, entre refeições."
  },
  {
    name: "Proteína vegetal (ervilha/arroz)",
    tags: [
      "hipertrofia",
      "recuperacao"
    ],
    desc: "Alternativa ao whey pra quem é vegano/vegetariano ou tem intolerância a lactose. Perfil de aminoácidos um pouco inferior ao whey isolado, mas funcional.",
    dose: "1 dose (~25-30g) pós-treino ou entre refeições."
  },
  {
    name: "Cafeína Anidra",
    tags: [
      "forca",
      "pretreino",
      "emagrecimento"
    ],
    desc: "Estimulante que melhora foco, energia e desempenho no treino, e ajuda um pouco na queima calórica (efeito termogênico leve).",
    dose: "100-200mg cerca de 30-45min antes do treino. Evitar à tarde/noite pra não atrapalhar o sono."
  },
  {
    name: "Pré-treino (fórmula completa)",
    tags: [
      "forca",
      "pretreino"
    ],
    desc: "Mistura de cafeína + beta-alanina + citrulina (e às vezes creatina) pronta pra tomar antes do treino, focada em energia e bomba muscular.",
    dose: "1 dose 20-30min antes do treino, seguindo a recomendação do rótulo (evitar tomar tarde da noite)."
  },
  {
    name: "Beta-Alanina",
    tags: [
      "forca",
      "pretreino"
    ],
    desc: "Reduz a fadiga muscular em exercícios de alta intensidade, permitindo mais repetições/séries antes de \"travar\".",
    dose: "3-5g por dia, pode causar formigamento na pele (normal e inofensivo)."
  },
  {
    name: "Citrulina Malato",
    tags: [
      "forca",
      "pretreino"
    ],
    desc: "Melhora o fluxo sanguíneo (efeito \"bomba\") e reduz a sensação de fadiga durante o treino.",
    dose: "6-8g cerca de 30-40min antes do treino."
  },
  {
    name: "Arginina",
    tags: [
      "forca",
      "pretreino"
    ],
    desc: "Precursor de óxido nítrico, similar à citrulina em efeito de vasodilatação, embora com absorção menos eficiente.",
    dose: "3-5g antes do treino."
  },
  {
    name: "Taurina",
    tags: [
      "forca",
      "pretreino"
    ],
    desc: "Aminoácido presente em muitos pré-treinos, associado a melhora de foco e redução de fadiga, e possível efeito antioxidante.",
    dose: "1-3g antes do treino."
  },
  {
    name: "BCAA",
    tags: [
      "recuperacao",
      "hipertrofia"
    ],
    desc: "Aminoácidos de cadeia ramificada. Se a dieta já tem proteína suficiente no dia, o BCAA isolado agrega pouco — priorize bater a meta de proteína total primeiro.",
    dose: "5-10g durante ou após o treino, se optar por usar."
  },
  {
    name: "EAA (aminoácidos essenciais)",
    tags: [
      "recuperacao",
      "hipertrofia"
    ],
    desc: "Todos os aminoácidos essenciais (inclui os do BCAA + outros), mais completo pra estimular síntese proteica muscular.",
    dose: "10-15g durante ou após o treino."
  },
  {
    name: "Glutamina",
    tags: [
      "recuperacao"
    ],
    desc: "Aminoácido ligado à recuperação muscular e saúde intestinal/imunológica, principalmente em treinos de alto volume.",
    dose: "5g após o treino ou antes de dormir."
  },
  {
    name: "Ômega-3",
    tags: [
      "recuperacao"
    ],
    desc: "Gordura anti-inflamatória (EPA/DHA), apoia recuperação articular, saúde cardiovascular e cognitiva.",
    dose: "1-3g por dia (somando EPA+DHA), junto com uma refeição."
  },
  {
    name: "Multivitamínico",
    tags: [
      "recuperacao"
    ],
    desc: "Cobertura de vitaminas e minerais pra fechar buracos da dieta, especialmente útil em fase de déficit calórico.",
    dose: "1 dose ao dia, junto com uma refeição."
  },
  {
    name: "Magnésio",
    tags: [
      "recuperacao"
    ],
    desc: "Mineral envolvido em função muscular, sono e recuperação. Muita gente que treina pesado tem ingestão baixa via dieta.",
    dose: "200-400mg à noite, de preferência em forma quelada (bisglicinato/citrato)."
  },
  {
    name: "Vitamina D",
    tags: [
      "recuperacao"
    ],
    desc: "Importante pra saúde óssea, imunológica e hormonal — comum estar baixa em quem pega pouco sol.",
    dose: "1000-2000 UI por dia (ideal checar nível no sangue antes de definir a dose com um profissional)."
  },
  {
    name: "Zinco",
    tags: [
      "recuperacao",
      "forca"
    ],
    desc: "Mineral ligado a recuperação, imunidade e função hormonal, relevante em treino de alto volume.",
    dose: "15-25mg por dia, de preferência longe de cálcio/ferro pra melhor absorção."
  },
  {
    name: "Termogênico",
    tags: [
      "emagrecimento"
    ],
    desc: "Combinação de estimulantes (geralmente cafeína + outros) que aumenta levemente o gasto calórico e a disposição durante o déficit. Efeito é modesto — não substitui déficit calórico.",
    dose: "Seguir rótulo, geralmente 1 dose pela manhã ou pré-treino. Evitar uso contínuo por longos períodos sem pausa."
  },
  {
    name: "L-Carnitina",
    tags: [
      "emagrecimento"
    ],
    desc: "Suplemento popular pra \"queima de gordura\", com evidência científica limitada isoladamente — funciona melhor combinada com treino consistente.",
    dose: "1-3g por dia, próximo ao treino."
  },
  {
    name: "Fibras (psyllium)",
    tags: [
      "emagrecimento"
    ],
    desc: "Ajuda na saciedade e no trânsito intestinal durante fases de dieta mais restrita.",
    dose: "5-10g com bastante água, longe de outros suplementos/medicamentos."
  },
  {
    name: "Chá verde (extrato)",
    tags: [
      "emagrecimento"
    ],
    desc: "Fonte de cafeína + catequinas (EGCG), associado a um leve aumento no gasto calórico.",
    dose: "1 dose ao dia conforme rótulo, evitar tomar à noite."
  },
  {
    name: "Colágeno",
    tags: [
      "recuperacao"
    ],
    desc: "Apoia saúde de pele, tendões e articulações — não é uma proteína completa pra hipertrofia, mas soma no cuidado geral do corpo.",
    dose: "10g por dia, em qualquer horário, com vitamina C pra ajudar na síntese."
  },
  {
    name: "Melatonina",
    tags: [
      "recuperacao"
    ],
    desc: "Ajuda a regular o sono, que é onde boa parte da recuperação muscular e hormonal acontece.",
    dose: "1-3mg, 30-60min antes de dormir, uso pontual (não é indicado pra uso contínuo sem orientação)."
  },
  {
    name: "Whey Protein Hidrolisado",
    tags: [
      "hipertrofia",
      "recuperacao",
      "forca"
    ],
    desc: "Whey pré-digerido enzimaticamente, absorção ainda mais rápida que o concentrado/isolado. Costuma ter sabor mais amargo, mas é bem tolerado por quem tem digestão sensível.",
    dose: "1 dose (~25-30g) logo após o treino."
  },
  {
    name: "Proteína vegana blend (ervilha + arroz + outros)",
    tags: [
      "hipertrofia",
      "recuperacao"
    ],
    desc: "Combinação de fontes vegetais pra complementar o perfil de aminoácidos e chegar mais perto do whey em qualidade proteica. Boa opção 100% plant-based.",
    dose: "1 dose (~25-35g) pós-treino ou entre refeições."
  },
  {
    name: "HMB",
    tags: [
      "hipertrofia",
      "recuperacao"
    ],
    desc: "Metabólito da leucina associado à redução de quebra muscular, mais estudado em iniciantes, idosos ou períodos de retorno ao treino.",
    dose: "1-3g por dia, divididos em 2-3 tomadas junto das refeições."
  },
  {
    name: "ZMA (Zinco + Magnésio + B6)",
    tags: [
      "recuperacao",
      "forca"
    ],
    desc: "Combinação de minerais e vitamina B6 usada à noite, associada a melhora do sono e suporte à recuperação em quem treina pesado.",
    dose: "1 dose antes de dormir, de preferência com o estômago vazio (longe de laticínios/cálcio)."
  },
  {
    name: "Waxy Maize",
    tags: [
      "hipertrofia",
      "forca"
    ],
    desc: "Carboidrato de rápida absorção usado no pós-treino pra repor glicogênio e ajudar na entrega de nutrientes junto com a proteína.",
    dose: "30-50g pós-treino, junto ou logo após a dose de proteína."
  },
  {
    name: "Dextrose",
    tags: [
      "hipertrofia",
      "forca"
    ],
    desc: "Açúcar simples de absorção muito rápida, clássico no pós-treino pra repor glicogênio rapidamente, principalmente em quem treina em alto volume.",
    dose: "20-40g logo após o treino, misturado ao shake de proteína."
  },
  {
    name: "Maltodextrina",
    tags: [
      "hipertrofia",
      "pretreino"
    ],
    desc: "Carboidrato complexo de absorção rápida, usado antes, durante ou depois do treino pra sustentar energia em sessões longas.",
    dose: "20-40g antes ou durante treinos mais longos, ou no pós-treino."
  },
  {
    name: "Guaraná em pó",
    tags: [
      "pretreino",
      "forca",
      "emagrecimento"
    ],
    desc: "Fonte natural de cafeína usada como alternativa à cafeína anidra, com liberação um pouco mais gradual.",
    dose: "1-2g cerca de 30-45min antes do treino, evitar à noite."
  },
  {
    name: "Óxido Nítrico (fórmula NO2)",
    tags: [
      "forca",
      "pretreino"
    ],
    desc: "Fórmulas que combinam citrulina, arginina e outros vasodilatadores pra melhorar o \"bombeamento\" e o fluxo sanguíneo durante o treino.",
    dose: "Seguir rótulo, geralmente 1 dose 20-30min antes do treino."
  },
  {
    name: "Colágeno Tipo II",
    tags: [
      "recuperacao"
    ],
    desc: "Forma específica de colágeno voltada à saúde de cartilagem e articulações, usada por quem faz treino de alto impacto ou carga.",
    dose: "40mg por dia (dose bem menor que o colágeno hidrolisado comum), conforme rótulo."
  },
  {
    name: "Glucosamina + Condroitina",
    tags: [
      "recuperacao"
    ],
    desc: "Combinação popular pra suporte articular em quem treina pesado com cargas altas ou impacto (ex: corrida, agachamento).",
    dose: "1 dose ao dia, junto de uma refeição, uso contínuo por períodos prolongados conforme orientação."
  },
  {
    name: "Coenzima Q10",
    tags: [
      "recuperacao"
    ],
    desc: "Antioxidante envolvido na produção de energia celular, usado como suporte geral à disposição e saúde cardiovascular.",
    dose: "100-200mg por dia, junto com uma refeição que tenha gordura pra melhor absorção."
  },
  {
    name: "Ashwagandha",
    tags: [
      "recuperacao",
      "forca"
    ],
    desc: "Adaptógeno tradicional associado a suporte ao gerenciamento do estresse e, em alguns estudos, a pequenos ganhos de força — resposta varia bastante entre pessoas.",
    dose: "300-600mg por dia, conforme padronização do extrato no rótulo."
  },
  {
    name: "Complexo B",
    tags: [
      "recuperacao"
    ],
    desc: "Vitaminas do complexo B envolvidas no metabolismo energético, úteis pra fechar buracos da dieta especialmente em rotina puxada.",
    dose: "1 dose ao dia, junto de uma refeição."
  },
  {
    name: "Ferro Quelado",
    tags: [
      "recuperacao"
    ],
    desc: "Mineral importante pra transporte de oxigênio e disposição, relevante principalmente pra quem tem ingestão baixa via dieta.",
    dose: "Conforme rótulo e necessidade individual, de preferência longe de café/chá que atrapalham a absorção."
  },
  {
    name: "Probióticos",
    tags: [
      "recuperacao",
      "emagrecimento"
    ],
    desc: "Suporte à saúde intestinal, que impacta digestão, absorção de nutrientes e até imunidade geral.",
    dose: "1 dose ao dia, de preferência em jejum ou conforme instrução do rótulo."
  },
  {
    name: "Picolinato de Cromo",
    tags: [
      "emagrecimento"
    ],
    desc: "Mineral associado a suporte no controle de compulsão por doces e sensibilidade à insulina — efeito modesto e isolado.",
    dose: "200-400mcg por dia, junto de uma refeição."
  },
  {
    name: "CLA (Ácido Linoleico Conjugado)",
    tags: [
      "emagrecimento"
    ],
    desc: "Gordura poli-insaturada popularizada como \"queimador\", com evidência limitada e efeito pequeno — não substitui déficit calórico e treino.",
    dose: "1-3g por dia, junto das refeições."
  },
  {
    name: "Yohimbina",
    tags: [
      "emagrecimento",
      "pretreino"
    ],
    desc: "Estimulante usado por quem busca ajuda pontual na queima de gordura localizada, com efeito individual bem variável e sensibilidade a estimulantes a considerar.",
    dose: "Seguir rótulo rigorosamente, geralmente em jejum antes do treino — evitar combinar com outras fontes altas de cafeína."
  },
  {
    name: "Whey isolado sabor zero açúcar",
    tags: [
      "emagrecimento",
      "hipertrofia"
    ],
    desc: "Versão do whey isolado formulada sem açúcar adicional, pensada pra quem está controlando carboidrato/calorias mas não quer abrir mão da praticidade do shake.",
    dose: "1 dose (~25-30g) pós-treino ou como lanche de baixa caloria."
  },
  {
    name: "Caseína Micelar",
    tags: [
      "hipertrofia",
      "recuperacao"
    ],
    desc: "Forma mais pura e de liberação mais lenta da caseína, mantém a estrutura micelar intacta pra um efeito \"sustentado\" ainda mais longo de aminoácidos no sangue.",
    dose: "1 dose (~25-30g) antes de dormir ou em intervalos longos sem refeição."
  },
  {
    name: "Proteína de Ervilha Isolada",
    tags: [
      "hipertrofia",
      "recuperacao"
    ],
    desc: "Fonte vegetal isolada, rica em BCAA (especialmente leucina), boa opção plant-based pra quem prefere uma fonte única em vez de blend.",
    dose: "1 dose (~25-30g) pós-treino ou entre refeições."
  },
  {
    name: "Proteína de Arroz Isolada",
    tags: [
      "hipertrofia",
      "recuperacao"
    ],
    desc: "Fonte vegetal hipoalergênica, perfil de aminoácidos incompleto isoladamente (baixa em lisina), por isso costuma ser combinada com ervilha em blends.",
    dose: "1 dose (~25-30g) pós-treino ou entre refeições."
  },
  {
    name: "Colágeno Tipo I",
    tags: [
      "recuperacao"
    ],
    desc: "Tipo mais abundante no corpo, associado a suporte de pele, tendões e ligamentos — presente na maioria dos colágenos hidrolisados vendidos no mercado.",
    dose: "10g por dia, em qualquer horário, idealmente com vitamina C."
  },
  {
    name: "Colágeno Tipo III",
    tags: [
      "recuperacao"
    ],
    desc: "Costuma aparecer junto do Tipo I em fórmulas hidrolisadas, associado a suporte de pele e tecidos elásticos em geral.",
    dose: "10g por dia, conforme rótulo do produto (geralmente combinado com Tipo I)."
  },
  {
    name: "Cálcio",
    tags: [
      "recuperacao"
    ],
    desc: "Mineral essencial pra saúde óssea e contração muscular, relevante pra quem tem baixo consumo de laticínios/fontes vegetais de cálcio.",
    dose: "500-1000mg por dia, junto de uma refeição, de preferência longe do ferro."
  },
  {
    name: "Vitamina K2",
    tags: [
      "recuperacao"
    ],
    desc: "Frequentemente combinada com vitamina D e cálcio, associada a suporte no direcionamento do cálcio para os ossos.",
    dose: "90-180mcg por dia, junto de uma refeição com gordura."
  },
  {
    name: "Vitamina C",
    tags: [
      "recuperacao"
    ],
    desc: "Antioxidante clássico, envolvido na síntese de colágeno e na função imunológica — relevante em rotina de treino puxada.",
    dose: "500-1000mg por dia, junto de uma refeição."
  },
  {
    name: "Vitamina E",
    tags: [
      "recuperacao"
    ],
    desc: "Antioxidante lipossolúvel, atua junto de outras vitaminas na proteção celular contra o estresse oxidativo gerado pelo treino intenso.",
    dose: "Conforme rótulo (geralmente 15-30mg/dia), junto de uma refeição com gordura."
  },
  {
    name: "Biotina",
    tags: [
      "recuperacao"
    ],
    desc: "Vitamina do complexo B popular pra suporte de cabelo, pele e unhas, também envolvida no metabolismo energético.",
    dose: "Conforme rótulo (geralmente 2.500-5.000mcg/dia), junto de uma refeição."
  },
  {
    name: "Selênio",
    tags: [
      "recuperacao"
    ],
    desc: "Mineral antioxidante envolvido na função da tireoide e no sistema imunológico, em doses baixas pela margem estreita entre benefício e excesso.",
    dose: "50-200mcg por dia, sem exceder o rótulo — mineral com baixa margem de segurança em excesso."
  },
  {
    name: "Tribulus Terrestris",
    tags: [
      "forca",
      "recuperacao"
    ],
    desc: "Erva tradicional popular em suplementos de \"suporte hormonal natural\" e libido, com evidência científica limitada e resultados bem variáveis entre pessoas.",
    dose: "Conforme padronização do extrato no rótulo, geralmente em ciclos de algumas semanas."
  },
  {
    name: "Maca Peruana",
    tags: [
      "forca",
      "recuperacao"
    ],
    desc: "Raiz andina tradicionalmente usada como adaptógeno, associada a suporte de disposição e libido — evidência ainda preliminar.",
    dose: "1.5-3g por dia (pó) ou conforme rótulo do extrato, junto de uma refeição."
  },
  {
    name: "DHEA",
    tags: [
      "recuperacao"
    ],
    desc: "Precursor hormonal vendido como suplemento de \"suporte hormonal\" em algumas farmácias/lojas, geralmente recomendado só com acompanhamento profissional pela sua natureza hormonal.",
    dose: "Seguir rigorosamente o rótulo/orientação profissional — não indicado pra uso livre sem avaliação."
  },
  {
    name: "Isotônico em Pó",
    tags: [
      "pretreino",
      "forca"
    ],
    desc: "Repõe água e eletrólitos perdidos no suor, útil em treinos longos, calor intenso ou volume alto de suor.",
    dose: "1 dose diluída em 500ml-1L de água, durante ou logo após o treino."
  },
  {
    name: "Blend Eletrolítico (Sódio/Potássio/Magnésio)",
    tags: [
      "recuperacao",
      "forca"
    ],
    desc: "Mistura de eletrólitos sem carboidrato, focada em hidratação e função muscular, opção pra quem não quer o açúcar dos isotônicos tradicionais.",
    dose: "1 dose em água durante o treino ou em dias muito quentes."
  },
  {
    name: "Enzimas Digestivas",
    tags: [
      "recuperacao",
      "emagrecimento"
    ],
    desc: "Ajudam na quebra de proteínas, carboidratos e gorduras, úteis pra quem sente desconforto digestivo com dietas de alto volume alimentar.",
    dose: "1 dose junto das principais refeições, conforme rótulo."
  },
  {
    name: "Glicina",
    tags: [
      "recuperacao"
    ],
    desc: "Aminoácido associado a suporte de qualidade do sono e também presente na síntese de colágeno do corpo.",
    dose: "3g cerca de 30-60min antes de dormir."
  },
  {
    name: "Própolis",
    tags: [
      "recuperacao"
    ],
    desc: "Extrato natural popular no suporte à imunidade, usado como complemento geral de saúde em rotina de treino intensa.",
    dose: "Conforme rótulo (gotas ou cápsulas), geralmente 1-2 doses ao dia."
  },
  {
    name: "Extrato de Gengibre",
    tags: [
      "recuperacao",
      "emagrecimento"
    ],
    desc: "Associado a suporte digestivo e efeito termogênico leve, além de uso tradicional contra desconforto estomacal.",
    dose: "Conforme rótulo (cápsula ou pó), geralmente 1-2 doses ao dia junto das refeições."
  },
  {
    name: "L-Teanina",
    tags: [
      "pretreino",
      "forca"
    ],
    desc: "Aminoácido que combinado com cafeína ajuda a suavizar picos de ansiedade/agitação, mantendo o foco sem o \"nervosismo\" excessivo.",
    dose: "100-200mg junto da dose de cafeína pré-treino."
  },
  {
    name: "AAKG (Arginina Alfa-Cetoglutarato)",
    tags: [
      "forca",
      "pretreino"
    ],
    desc: "Forma de arginina combinada com alfa-cetoglutarato, usada em pré-treinos focada em vasodilatação e sensação de \"bomba\".",
    dose: "3-6g cerca de 30min antes do treino."
  },
  {
    name: "Fosfatidilserina",
    tags: [
      "recuperacao",
      "forca"
    ],
    desc: "Fosfolipídio associado a suporte cognitivo e ao controle da resposta ao estresse do treino intenso (cortisol), especialmente em alto volume.",
    dose: "100-300mg por dia, próximo ao treino ou conforme rótulo."
  },
  {
    name: "Cordyceps",
    tags: [
      "forca",
      "pretreino"
    ],
    desc: "Cogumelo funcional tradicionalmente associado a suporte de disposição e capacidade aeróbica, popular em fórmulas pré-treino \"naturais\".",
    dose: "1-3g (pó) ou conforme padronização do extrato no rótulo, antes do treino."
  },
  {
    name: "Rhodiola Rosea",
    tags: [
      "forca",
      "recuperacao"
    ],
    desc: "Adaptógeno tradicional associado a suporte contra fadiga física e mental, usado tanto antes do treino quanto em rotina de recuperação.",
    dose: "200-400mg do extrato padronizado por dia, conforme rótulo."
  },
  {
    name: "Boro",
    tags: [
      "recuperacao",
      "forca"
    ],
    desc: "Mineral-traço envolvido em metabolismo ósseo e hormonal, presente em pequenas quantidades em fórmulas de suporte geral.",
    dose: "3-6mg por dia, conforme rótulo."
  },
  {
    name: "Vitamina B12",
    tags: [
      "recuperacao"
    ],
    desc: "Vitamina essencial pro metabolismo energético e produção de glóbulos vermelhos, especialmente relevante pra veganos/vegetarianos.",
    dose: "Conforme rótulo (comum 500-1000mcg/dia ou dose semanal maior em sublingual)."
  },
  {
    name: "Colágeno com Ácido Hialurônico",
    tags: [
      "recuperacao"
    ],
    desc: "Combinação voltada a hidratação de pele e articulações, soma o suporte estrutural do colágeno com a retenção de água do ácido hialurônico.",
    dose: "10g por dia (colágeno) conforme proporção do rótulo, em qualquer horário."
  },
  {
    name: "Berberina",
    tags: [
      "emagrecimento"
    ],
    desc: "Composto vegetal estudado por seu efeito no metabolismo da glicose, popular em rotinas de controle de peso combinadas com dieta e treino.",
    dose: "500mg, 2-3x ao dia junto das refeições, conforme rótulo."
  },
  {
    name: "Espirulina",
    tags: [
      "recuperacao",
      "emagrecimento"
    ],
    desc: "Alga rica em proteína, antioxidantes e micronutrientes, usada como complemento nutricional geral, principalmente por veganos/vegetarianos.",
    dose: "3-5g por dia (pó ou cápsulas), conforme rótulo."
  },
  {
    name: "Beta-Glucana (Aveia)",
    tags: [
      "recuperacao",
      "emagrecimento"
    ],
    desc: "Fibra solúvel extraída da aveia, associada a saciedade e suporte à saúde cardiovascular, boa adição em fase de dieta mais controlada.",
    dose: "3g por dia, misturada em líquidos ou refeições."
  },
  {
    name: "Cúrcuma (Curcumina)",
    tags: [
      "recuperacao"
    ],
    desc: "Composto anti-inflamatório natural, popular como suporte à recuperação articular e muscular em quem treina pesado — absorção melhora bastante com pimenta-preta.",
    dose: "500-1000mg por dia, junto de uma refeição com gordura e pimenta-preta."
  }
];

// Goal-based "1 per role" supplement recommendation — replaces the old
// `SUPPLEMENTS.filter(s => s.tags.includes(category)).slice(0, 4)` approach
// (still visible in git history / GOAL_TO_SUPPLEMENT_CATEGORY above), which
// for "recuperacao" returned 4 near-identical protein products (Whey
// Concentrado, Whey Isolado, Caseína, Albumina) in a row since they all
// share that tag and happen to sit early in the array. Fixed per user
// feedback (2026-10-04: "não está genérico, dois tipos de fontes de
// proteína?"). Picks exactly one item per functional role instead —
// protein source, creatine, caffeine/pre-workout, and one general
// recovery/health item — each varied by goal, and used by both
// components/PlanNutritionSummary.tsx and
// app/montar-plano/PlanRecommendStep.tsx so the two stay in sync.
const PROTEIN_PICK_BY_GOAL: Record<string, string> = {
  perder: "Whey Protein Isolado", // leaner macro profile, fits a deficit
  recomp: "Whey Protein Isolado",
  ganhar: "Hipercalórico / Mass Gainer", // easier path to a calorie surplus
  manter: "Whey Protein Concentrado",
};
const RECOVERY_PICK_BY_GOAL: Record<string, string> = {
  perder: "Multivitamínico", // covers dietary gaps common in a deficit
  recomp: "Ômega-3",
  ganhar: "Ômega-3", // anti-inflammatory support for higher training volume
  manter: "Multivitamínico",
};
// Creatine and caffeine are each recommended as-is regardless of goal —
// both are well-studied for performance, and caffeine's mild thermogenic
// effect fits emagrecimento too (see its own `desc` above).
const CREATINE_NAME = "Creatina Monohidratada";
const CAFFEINE_NAME = "Cafeína Anidra";

// Dietary preference (profiles.dietary_preference, set in onboarding).
// "vegetariano"/"vegano" swap the whey/mass-gainer protein pick for the
// plant-based protein for every goal. Creatine (synthetic) and caffeine are
// unaffected.
//
// Recovery pick: Ômega-3's catalog entry is EPA/DHA, which in practice is
// fish oil (the desc doesn't mention an algae source), so for "vegano" ONLY
// (strict: no animal products) it is swapped for Multivitamínico, which is
// already in the catalog with the same "recuperacao" tag. "vegetariano" keeps
// the goal's normal pick (lacto-ovo-vegetarian definition used here; fish-free
// vegetarians are not distinguished by the 3-value preference). Multivitamínico's
// desc makes no animal-free claim, so this is a best-effort catalog choice.
export type DietaryPreference = "onivoro" | "vegetariano" | "vegano";
const PLANT_PROTEIN_NAME = "Proteína vegetal (ervilha/arroz)";

export function pickRecommendedSupplements(
  goal: string | null | undefined,
  dietaryPreference?: DietaryPreference | null
): Supplement[] {
  const g = goal && goal in PROTEIN_PICK_BY_GOAL ? goal : "manter";
  const plantBased = dietaryPreference === "vegetariano" || dietaryPreference === "vegano";
  const protein = plantBased ? PLANT_PROTEIN_NAME : PROTEIN_PICK_BY_GOAL[g];
  let recovery = RECOVERY_PICK_BY_GOAL[g];
  if (dietaryPreference === "vegano" && recovery === "Ômega-3") recovery = "Multivitamínico";
  const names = [protein, CREATINE_NAME, CAFFEINE_NAME, recovery];
  const byName = new Map(SUPPLEMENTS.map((s) => [s.name, s]));
  return names.map((n) => byName.get(n)).filter((s): s is Supplement => !!s);
}
