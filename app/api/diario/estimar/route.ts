import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

// Backs the Diário's "Foto (IA)" and "Descrever (IA)" add-food modes
// (app/diario/AddFood.tsx). Product decision (MIGRATION_PLAN.md P2,
// 2026-10-04): both use the app's OWN AI via the Anthropic API directly —
// deliberately NOT a specialized third-party food-vision/nutrition API —
// so this is the one server-side place that talks to Anthropic for the
// Diário. Server-only (ANTHROPIC_API_KEY is never exposed to the browser;
// see .env.local.example), and auth-gated the same way as the only other
// Route Handler in this app (app/api/export-data/route.ts) so a
// logged-out visitor can't spend the app's API budget.
//
// The model's output is forced through tool-use (`tool_choice: { type:
// "tool", name: "log_meal_items" }`) rather than parsed from free text —
// this guarantees a parseable, uniformly-shaped response (an array of
// {name, quantity_desc, kcal, protein, carb, fat}) regardless of how the
// model would otherwise phrase its answer, and the quantities are always
// per the described/visible portion (not per 100g), matching what
// AddFood's review list and the `diary_entries` insert expect.
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

  const userContent: Anthropic.Messages.ContentBlockParam[] =
    input.mode === "foto"
      ? [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: input.mediaType,
              data: input.imageBase64,
            },
          },
          {
            type: "text",
            text:
              "Esta é uma foto de um prato de comida. Identifique cada alimento " +
              "visível e estime, para a porção mostrada na foto (não por 100g), " +
              "as calorias e macros de cada um.",
          },
        ]
      : [
          {
            type: "text",
            text:
              `O usuário descreveu a seguinte refeição: "${input.description}". ` +
              "Separe essa descrição nos alimentos que a compõem e estime, para a " +
              "porção descrita (não por 100g), as calorias e macros de cada um.",
          },
        ];

  const anthropic = new Anthropic({ apiKey });

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1536,
      system:
        "Você é um assistente de nutrição brasileiro que ajuda a estimar a " +
        "composição nutricional de refeições a partir de uma foto do prato ou " +
        "de uma descrição em texto livre. Responda sempre em português do " +
        "Brasil, com nomes de alimentos como um brasileiro diria no dia a dia " +
        "(ex: \"arroz branco\", \"feijão carioca\", \"peito de frango grelhado\"). " +
        "Suas estimativas são aproximações razoáveis, não medições de " +
        "laboratório — está tudo bem arredondar. Sempre use a ferramenta " +
        "log_meal_items para responder.",
      tools: [
        {
          name: "log_meal_items",
          description:
            "Registra os alimentos identificados em uma refeição, com a " +
            "estimativa de calorias e macronutrientes de cada um para a " +
            "porção descrita ou visível (não por 100g).",
          input_schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "Nome do alimento (ex: \"arroz branco\").",
                    },
                    quantity_desc: {
                      type: "string",
                      description:
                        "Descrição curta da porção estimada (ex: \"2 colheres de servir\", \"1 filé médio\").",
                    },
                    kcal: { type: "number", description: "Calorias estimadas da porção." },
                    protein: { type: "number", description: "Proteína em gramas da porção." },
                    carb: { type: "number", description: "Carboidrato em gramas da porção." },
                    fat: { type: "number", description: "Gordura em gramas da porção." },
                  },
                  required: ["name", "quantity_desc", "kcal", "protein", "carb", "fat"],
                },
              },
            },
            required: ["items"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "log_meal_items" },
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const toolUse = message.content.find(
      (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use"
    );
    if (!toolUse) {
      return NextResponse.json({ error: "ai_call_failed" }, { status: 502 });
    }

    const parsedInput = toolUse.input as { items?: unknown };
    const items = Array.isArray(parsedInput.items) ? parsedInput.items : [];

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "ai_call_failed" }, { status: 502 });
  }
}

type EstimarInput =
  | { mode: "foto"; imageBase64: string; mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" }
  | { mode: "texto"; description: string };

function parseInput(body: unknown): EstimarInput | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  if (b.mode === "foto") {
    if (typeof b.imageBase64 !== "string" || b.imageBase64.length === 0) return null;
    if (typeof b.mediaType !== "string") return null;
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
    const mediaType = allowed.find((m) => m === b.mediaType);
    if (!mediaType) return null;
    return { mode: "foto", imageBase64: b.imageBase64, mediaType };
  }

  if (b.mode === "texto") {
    if (typeof b.description !== "string" || b.description.trim().length === 0) return null;
    return { mode: "texto", description: b.description.trim() };
  }

  return null;
}
