import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ChefHat,
  Sparkles,
  Clock,
  Users,
  Flame,
  Leaf,
  Loader2,
  AlertCircle,
  History as HistoryIcon,
} from "lucide-react";
import {
  generateRecipes,
  getRecipeHistory,
  type Recipe,
  type HistoryEntry,
  type RecipesResponse,
} from "@/lib/recipes.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { HistorySidebar } from "@/components/history-sidebar";
import { useDeviceId } from "@/hooks/use-device-id";
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

type ViewState =
  | { kind: "fresh"; data: RecipesResponse }
  | { kind: "history"; entry: HistoryEntry }
  | null;

function Index() {
  const deviceId = useDeviceId();
  const queryClient = useQueryClient();
  const generate = useServerFn(generateRecipes);
  const fetchHistory = useServerFn(getRecipeHistory);

  const [ingredients, setIngredients] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const historyQuery = useQuery({
    queryKey: ["recipe-history", deviceId],
    queryFn: () => fetchHistory({ data: { deviceId: deviceId! } }),
    enabled: !!deviceId,
  });

  const mutation = useMutation({
    mutationFn: (vars: { ingredients: string; restrictions: string[] }) =>
      generate({ data: { ...vars, deviceId: deviceId! } }),
    onSuccess: (data) => {
      setView({ kind: "fresh", data });
      setSelectedHistoryId(null);
      queryClient.invalidateQueries({ queryKey: ["recipe-history", deviceId] });
    },
  });

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.trim().length === 0) {
      setValidationError(
        "Por favor, digite pelo menos um ingrediente para que o Chef possa te ajudar!",
      );
      return;
    }
    if (!deviceId) return;
    setValidationError(null);
    mutation.mutate({ ingredients: ingredients.trim(), restrictions: selected });
  };

  const onSelectHistory = (entry: HistoryEntry) => {
    setView({ kind: "history", entry });
    setSelectedHistoryId(entry.id);
  };

  const display = useMemo(() => {
    if (!view) return null;
    if (view.kind === "fresh") {
      return {
        recipes: view.data.recipes,
        notice: view.data.notice ?? null,
        assumedPantry: view.data.assumedPantry ?? [],
        meta: null as null | { ingredients: string; restrictions: string[] },
      };
    }
    return {
      recipes: view.entry.recipes,
      notice: view.entry.notice,
      assumedPantry: view.entry.assumedPantry,
      meta: {
        ingredients: view.entry.ingredients,
        restrictions: view.entry.restrictions,
      },
    };
  }, [view]);

  return (
    <SidebarProvider defaultOpen>
      <HistorySidebar
        history={historyQuery.data ?? []}
        isLoading={historyQuery.isLoading}
        selectedId={selectedHistoryId}
        onSelect={onSelectHistory}
      />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur">
          <SidebarTrigger />
          <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <HistoryIcon className="h-4 w-4" />
            Histórico
          </span>
        </header>

        <main className="px-4 pb-24 pt-8 sm:pt-12">
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
                onChange={(e) => {
                  setIngredients(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Ex: 2 tomates, cebola, alho, frango, arroz, manjericão fresco..."
                rows={5}
                aria-invalid={!!validationError}
                aria-describedby={validationError ? "ingredients-error" : undefined}
                className={cn(
                  "resize-none border-input bg-background/60 text-base leading-relaxed focus-visible:ring-primary",
                  validationError && "border-destructive focus-visible:ring-destructive",
                )}
              />

              {validationError && (
                <div
                  id="ingredients-error"
                  role="alert"
                  className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

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
                disabled={mutation.isPending || !deviceId}
                aria-busy={mutation.isPending}
                className="mt-7 h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.01] hover:bg-primary/95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    O Chef está pensando na sua receita...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Buscar Receitas
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

              {display && !mutation.isPending && (
                <div className="space-y-6">
                  {view?.kind === "history" && display.meta && (
                    <div className="rounded-2xl border border-border bg-card/60 px-5 py-4 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Do histórico
                      </p>
                      <p className="mt-1 text-foreground/90">
                        <span className="font-medium">Ingredientes:</span>{" "}
                        {display.meta.ingredients}
                      </p>
                      {display.meta.restrictions.length > 0 && (
                        <p className="mt-1 text-muted-foreground">
                          Restrições: {display.meta.restrictions.join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  {display.notice && (
                    <div className="flex items-start gap-3 rounded-2xl border border-accent bg-accent/40 px-5 py-4 text-sm text-accent-foreground">
                      <ChefHat className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p className="leading-relaxed">{display.notice}</p>
                    </div>
                  )}

                  {display.recipes.length > 0 && (
                    <>
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {view?.kind === "history" ? "Receitas salvas" : "Suas receitas"}
                      </h2>
                      {display.assumedPantry.length > 0 && (
                        <p className="-mt-3 text-sm text-muted-foreground">
                          Considerei que você tem na despensa:{" "}
                          <span className="font-medium text-foreground">
                            {display.assumedPantry.join(", ")}
                          </span>
                          .
                        </p>
                      )}
                      {display.recipes.map((r, i) => (
                        <RecipeCard key={i} recipe={r} index={i} />
                      ))}
                    </>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
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
