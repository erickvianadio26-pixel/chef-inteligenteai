import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  ingredients: z.string().min(2).max(2000),
  restrictions: z.array(z.string()).max(10).default([]),
});

const RecipeSchema = z.object({
  recipes: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        time: z.string(),
        difficulty: z.string(),
        servings: z.string(),
        ingredients: z.array(z.string()),
        steps: z.array(z.string()),
      }),
    )
    .min(1),
});

export type Recipe = z.infer<typeof RecipeSchema>["recipes"][number];

export const generateRecipes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente.");

    const restrictionsText =
      data.restrictions.length > 0
        ? `Restrições alimentares obrigatórias: ${data.restrictions.join(", ")}.`
        : "Sem restrições alimentares.";

    const systemPrompt = `Você é o "Chef Caseiro", um chef brasileiro criativo e prático. Gere de 2 a 3 receitas caseiras usando principalmente os ingredientes informados pelo usuário (pode assumir sal, açúcar, água, óleo, pimenta-do-reino e azeite como básicos). Respeite estritamente as restrições alimentares. Responda APENAS com JSON válido no formato exato solicitado, em português do Brasil.`;

    const userPrompt = `Ingredientes disponíveis: ${data.ingredients}\n${restrictionsText}\n\nResponda APENAS com JSON neste formato:\n{\n  "recipes": [\n    {\n      "title": "Nome da receita",\n      "description": "Descrição curta e apetitosa (1 frase)",\n      "time": "ex: 30 min",\n      "difficulty": "Fácil | Médio | Difícil",\n      "servings": "ex: 2 porções",\n      "ingredients": ["item 1 com quantidade", "item 2 com quantidade"],\n      "steps": ["passo 1", "passo 2"]\n    }\n  ]\n}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (response.status === 429) {
      throw new Error("Limite de requisições atingido. Tente novamente em instantes.");
    }
    if (response.status === 402) {
      throw new Error("Créditos esgotados. Adicione créditos no Lovable AI.");
    }
    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("Falha ao gerar receitas. Tente novamente.");
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Resposta inválida do modelo.");
    }

    const validated = RecipeSchema.parse(parsed);
    return validated;
  });
