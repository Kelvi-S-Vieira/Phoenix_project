import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

// Backs the Diário's "Foto (IA)" and "Descrever (IA)" add-food modes
// (app/diario/AddFood.tsx). Both use the app's OWN AI via the Anthropic API
// directly (MIGRATION_PLAN.md P2). Server-only and auth-gated so a logged-out
// visitor can't spend the API budget.
//
// Output format (FitCal-style): the model identifies each ingredient, estimates
// its TOTAL weight on the plate in grams and gives nutrition PER 100 g
// (TACO/USDA-coherent). It is never asked for per-portion calories — the
// client always computes item macros as per100 × grams / 100, so editing the
// grams needs no round-trip. The tool output is forced (tool_choice) and then
// validated/sanitized here before being returned.

const MEAL_TYPES = ["cafe", "almoco", "lanche", "jantar", "ceia"] as const;
type MealType = (typeof MEAL_TYPES)[number];

export interface EstimateItem {
  name: string;
  grams: number;
  kcal_per_100g: number;
  protein_per_100g: number;
  carb_per_100g: number;
  fat_per_100g: number;
  is_packaged_product: boolean;
  source_note: string;
}

export interface EstimateDish {
  dish_name: string;
  description: string;
  health_score: number;
  meal_type_guess: MealType | null;
  items: EstimateItem[];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const input = parseInput(body);
  if (!input) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 503 });
  }

  const userContent: Anthropic.Messages.ContentBlockParam[] = [];
  if (input.mode === "foto") {
    userContent.push({
      type: "image",
      source: { type: "base64", media_type: input.mediaType, data: input.imageBase64 },
    });
    userContent.push({
      type: "text",
      text:
        "Esta é uma foto de uma refeição. Identifique cada ingrediente visível, " +
        "estime o peso total de cada um no prato em gramas (use referências " +
        "visuais: tamanho do prato, colher, talheres, tamanho da fruta ou da " +
        "embalagem) e informe os valores nutricionais por 100 g.",
    });
  } else {
    userContent.push({
      type: "text",
      text:
        `O usuário descreveu a seguinte refeição: "${input.description}". ` +
        "Separe a descrição nos ingredientes que a compõem, respeite as " +
        "quantidades citadas (converta unidades caseiras para gramas) e informe " +
        "os valores nutricionais por 100 g de cada um.",
    });
  }

  if (input.correction) {
    const prev = input.previous
      ? `\n\nResultado anterior (JSON):\n${JSON.stringify(input.previous)}`
      : "";
    userContent.push({
      type: "text",
      text:
        `O usuário pediu uma correção da análise anterior: "${input.correction}".` +
        prev +
        "\n\nRefaça a análise levando a correção em conta e devolva o prato " +
        "completo já corrigido (todos os ingredientes, não apenas os alterados).",
    });
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2048,
      system:
        "Você é um nutricionista brasileiro que analisa refeições a partir de " +
        "uma foto ou de uma descrição em texto. Responda sempre em português do " +
        "Brasil, com nomes de alimentos como um brasileiro diria no dia a dia " +
        "(ex: \"arroz branco cozido\", \"feijão carioca\", \"peito de frango grelhado\"). " +
        "Método: (1) identifique cada ingrediente separadamente; (2) estime o " +
        "peso total de cada ingrediente no prato em gramas, usando referências " +
        "visuais (prato de ~26 cm, colher de sopa ~15 g de arroz, tamanho de " +
        "fruta, embalagem); se for produto de marca com peso visível na " +
        "embalagem, use esse peso; (3) informe kcal e macros POR 100 g coerentes " +
        "com as tabelas TACO/USDA para aquele alimento no estado em que aparece " +
        "(cozido, frito, cru). NUNCA invente calorias por porção: a energia por " +
        "100 g deve ser consistente com os macros (4 kcal/g de proteína e " +
        "carboidrato, 9 kcal/g de gordura). Quando o usuário citar quantidades, " +
        "respeite-as. A pontuação de saúde (0 a 10, uma casa decimal) considera " +
        "densidade nutricional, fibras, processamento e açúcar/sódio. A " +
        "descrição tem 1 a 2 frases. Sempre use a ferramenta log_meal.",
      tools: [
        {
          name: "log_meal",
          description:
            "Registra o prato identificado, com cada ingrediente, seu peso estimado em gramas e os valores nutricionais por 100 g.",
          input_schema: {
            type: "object",
            properties: {
              dish_name: { type: "string", description: "Nome curto do prato (ex: \"Iogurte com banana\")." },
              description: {
                type: "string",
                description: "1 a 2 frases em português do Brasil sobre a composição e o equilíbrio nutricional.",
              },
              health_score: { type: "number", description: "Pontuação de saúde de 0 a 10, uma casa decimal." },
              meal_type_guess: {
                type: "string",
                enum: [...MEAL_TYPES],
                description: "Tipo de refeição mais provável.",
              },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Nome do ingrediente." },
                    grams: {
                      type: "number",
                      description: "Estimativa do peso TOTAL do item no prato, em gramas.",
                    },
                    kcal_per_100g: { type: "number", description: "Calorias por 100 g." },
                    protein_per_100g: { type: "number", description: "Proteína (g) por 100 g." },
                    carb_per_100g: { type: "number", description: "Carboidrato (g) por 100 g." },
                    fat_per_100g: { type: "number", description: "Gordura (g) por 100 g." },
                    is_packaged_product: {
                      type: "boolean",
                      description: "true se for produto industrializado/de marca.",
                    },
                    source_note: {
                      type: "string",
                      description: "Base dos valores (ex: \"TACO\", \"USDA\", \"rótulo\") e como o peso foi estimado.",
                    },
                  },
                  required: [
                    "name",
                    "grams",
                    "kcal_per_100g",
                    "protein_per_100g",
                    "carb_per_100g",
                    "fat_per_100g",
                    "is_packaged_product",
                    "source_note",
                  ],
                },
              },
            },
            required: ["dish_name", "description", "health_score", "meal_type_guess", "items"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "log_meal" },
      messages: [{ role: "user", content: userContent }],
    });

    const toolUse = message.content.find(
      (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use"
    );
    if (!toolUse) {
      return NextResponse.json({ error: "ai_call_failed" }, { status: 502 });
    }

    return NextResponse.json(sanitizeDish(toolUse.input));
  } catch {
    return NextResponse.json({ error: "ai_call_failed" }, { status: 502 });
  }
}

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function sanitizeItem(raw: unknown): EstimateItem | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === "string" ? r.name.trim().slice(0, 80) : "";
  const gramsRaw = num(r.grams);
  if (!name || gramsRaw === null) return null;
  const grams = clamp(Math.round(gramsRaw), 1, 3000);

  let protein = clamp(num(r.protein_per_100g) ?? 0, 0, 100);
  let carb = clamp(num(r.carb_per_100g) ?? 0, 0, 100);
  let fat = clamp(num(r.fat_per_100g) ?? 0, 0, 100);
  // Macros per 100 g can't physically add up to more than 100 g.
  const macroSum = protein + carb + fat;
  if (macroSum > 100) {
    const k = 100 / macroSum;
    protein *= k;
    carb *= k;
    fat *= k;
  }

  let kcal = clamp(num(r.kcal_per_100g) ?? 0, 0, 900);
  const fromMacros = 4 * protein + 4 * carb + 9 * fat;
  // Coherence check: if the stated energy disagrees with the macros by more
  // than 25%, trust the macros (the model is better at those).
  if (fromMacros > 0 && (kcal === 0 || Math.abs(fromMacros - kcal) / kcal > 0.25)) {
    kcal = fromMacros;
  }
  kcal = clamp(kcal, 0, 900);

  return {
    name,
    grams,
    kcal_per_100g: round1(kcal),
    protein_per_100g: round1(protein),
    carb_per_100g: round1(carb),
    fat_per_100g: round1(fat),
    is_packaged_product: r.is_packaged_product === true,
    source_note: typeof r.source_note === "string" ? r.source_note.trim().slice(0, 120) : "",
  };
}

function sanitizeDish(raw: unknown): EstimateDish {
  const r = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const items = (Array.isArray(r.items) ? r.items : [])
    .map(sanitizeItem)
    .filter((it): it is EstimateItem => it !== null)
    .slice(0, 20);
  const score = num(r.health_score);
  return {
    dish_name:
      typeof r.dish_name === "string" && r.dish_name.trim() ? r.dish_name.trim().slice(0, 80) : "Refeição",
    description: typeof r.description === "string" ? r.description.trim().slice(0, 400) : "",
    health_score: round1(clamp(score ?? 5, 0, 10)),
    meal_type_guess: MEAL_TYPES.find((m) => m === r.meal_type_guess) ?? null,
    items,
  };
}

type EstimarInput = (
  | { mode: "foto"; imageBase64: string; mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" }
  | { mode: "texto"; description: string }
) & { correction?: string; previous?: EstimateDish };

function parseInput(body: unknown): EstimarInput | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  let correction: string | undefined;
  if (typeof b.correction === "string" && b.correction.trim()) {
    correction = b.correction.trim().slice(0, 600);
  }
  const previous = b.previous !== undefined && b.previous !== null ? sanitizeDish(b.previous) : undefined;

  if (b.mode === "foto") {
    if (typeof b.imageBase64 !== "string" || b.imageBase64.length === 0) return null;
    if (typeof b.mediaType !== "string") return null;
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
    const mediaType = allowed.find((m) => m === b.mediaType);
    if (!mediaType) return null;
    return { mode: "foto", imageBase64: b.imageBase64, mediaType, correction, previous };
  }

  if (b.mode === "texto") {
    if (typeof b.description !== "string" || b.description.trim().length === 0) return null;
    return { mode: "texto", description: b.description.trim(), correction, previous };
  }

  return null;
}
