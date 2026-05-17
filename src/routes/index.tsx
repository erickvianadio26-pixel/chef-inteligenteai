import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ChefHat, Sparkles, Clock, Users, Flame, Leaf, Loader2 } from "lucide-react";
import { generateRecipes, type Recipe } from "@/lib/recipes.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Chef Caseiro — Receitas com o que você tem em casa" },
      {
        name: "description",
        content:
          "Digite os ingredientes que você tem em casa e receba receitas caseiras personalizadas, com opções vegano, sem glúten e sem lactose.",
      },
    ],
  }),
});

const RESTRICTIONS = [
  { id: "Vegano", icon: Leaf },
  { id: "Vegetariano", icon: Leaf },
  { id: "Sem Glúten", icon: Flame },
  { id: "Sem Lactose", icon: Flame },
  { id: "Low Carb", icon: Flame },
];

function Index() {
  const fn = useServerFn(generateRecipes);
  const [ingredients, setIngredients] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (vars: { ingredients: string; restrictions: string[] }) =>
      fn({ data: vars }),
  });

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.trim().length < 2) return;
    mutation.mutate({ ingredients: ingredients.trim(), restrictions: selected });
  };

  return (
    <main className="min-h-screen px-4 pb-24 pt-10 sm:pt-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ChefHat className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Chef <span className="italic text-primary">Caseiro</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
            Diga o que tem na sua geladeira e a gente inventa o jantar.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-foreground/5 sm:p-7"
        >
          <label
            htmlFor="ingredients"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Ingredientes que você tem em casa
          </label>
          <Textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Ex: 2 tomates, cebola, alho, frango, arroz, manjericão fresco..."
            rows={5}
            className="resize-none border-input bg-background/60 text-base leading-relaxed focus-visible:ring-primary"
          />

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-foreground">
              Restrições alimentares
            </p>
            <div className="flex flex-wrap gap-2">
              {RESTRICTIONS.map(({ id, icon: Icon }) => {
                const active = selected.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle(id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-secondary text-secondary-foreground hover:border-primary/40 hover:bg-accent",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {id}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending || ingredients.trim().length < 2}
            className="mt-7 h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.01] hover:bg-primary/95 disabled:opacity-60"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cozinhando ideias...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Gerar receitas
              </>
            )}
          </Button>
        </form>

        <section className="mt-10">
          {mutation.isError && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
              {(mutation.error as Error)?.message ?? "Algo deu errado."}
            </div>
          )}

          {mutation.isPending && (
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-2xl border border-border bg-card/60"
                />
              ))}
            </div>
          )}

          {mutation.data && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                Suas receitas
              </h2>
              {mutation.data.recipes.map((r, i) => (
                <RecipeCard key={i} recipe={r} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function RecipeCard({ recipe, index }: { recipe: Recipe; index: number }) {
  return (
    <article
      className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg shadow-foreground/5 transition-transform hover:-translate-y-0.5"
      style={{ animation: `fadeIn 0.4s ease ${index * 0.08}s both` }}
    >
      <div className="border-b border-border bg-gradient-to-br from-accent/60 to-secondary/40 px-6 py-5">
        <h3 className="text-2xl font-semibold tracking-tight text-card-foreground">
          {recipe.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{recipe.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-foreground/80">
          <Meta icon={Clock} label={recipe.time} />
          <Meta icon={Flame} label={recipe.difficulty} />
          <Meta icon={Users} label={recipe.servings} />
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 sm:grid-cols-[1fr_1.5fr]">
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
            Ingredientes
          </h4>
          <ul className="space-y-1.5 text-sm text-foreground/90">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                {ing}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
            Modo de preparo
          </h4>
          <ol className="space-y-3 text-sm leading-relaxed text-foreground/90">
            {recipe.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  );
}

function Meta({ icon: Icon, label }: { icon: typeof Clock; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {label}
    </span>
  );
}
