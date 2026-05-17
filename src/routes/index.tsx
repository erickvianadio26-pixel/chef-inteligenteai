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
  UtensilsCrossed,
  CookingPot,
  Salad,
  Soup,
  Zap,
  Search,
  ArrowRight,
  Carrot,
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
import { PaletteSwitcher } from "@/components/palette-switcher";
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
  { id: "Vegano", icon: Leaf, color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { id: "Vegetariano", icon: Salad, color: "bg-green-100 text-green-800 border-green-200" },
  { id: "Sem Glúten", icon: CookingPot, color: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: "Sem Lactose", icon: Soup, color: "bg-sky-100 text-sky-800 border-sky-200" },
  { id: "Low Carb", icon: Carrot, color: "bg-orange-100 text-orange-800 border-orange-200" },
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
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="text-foreground/70 hover:text-foreground" />
          <UtensilsCrossed className="h-5 w-5 text-[var(--tomato)]" />
          <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground/80">
            Histórico
          </span>
          <div className="ml-auto">
            <PaletteSwitcher />
          </div>
        </header>

        <main className="px-4 pb-24 pt-8 sm:pt-14">
          <div className="mx-auto max-w-3xl">
            {/* Hero Header */}
            <header className="mb-12 text-center">
              <div
                className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--mustard)] text-[var(--forest)] shadow-xl shadow-[var(--mustard)]/30"
                style={{ animation: "float 4s ease-in-out infinite" }}
              >
                <ChefHat className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                O que vamos criar{" "}
                <span className="italic text-[var(--tomato)] underline decoration-[var(--mustard)]/40">
                  hoje?
                </span>
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-lg text-muted-foreground">
                Combine seus ingredientes e descubra novas sensações.
              </p>
            </header>

            {/* Input Card */}
            <form
              onSubmit={onSubmit}
              className="relative rounded-[2rem] border-2 border-border bg-card p-6 shadow-2xl shadow-foreground/5 sm:p-8"
            >
              {/* Decorative suggestion */}
              <div className="absolute -top-4 right-6 hidden items-center gap-2 rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-xs font-semibold italic text-[var(--forest)] sm:flex">
                <Zap className="h-3.5 w-3.5" />
                Sugestão: cebola roxa, mel e alecrim
              </div>

              <label
                htmlFor="ingredients"
                className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground"
              >
                <UtensilsCrossed className="h-5 w-5 text-[var(--tomato)]" />
                O que tem na sua geladeira?
              </label>

              <div className="relative">
                <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--tomato)]">
                  <Search className="h-5 w-5" />
                </div>
                <Textarea
                  id="ingredients"
                  value={ingredients}
                  onChange={(e) => {
                    setIngredients(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="2 tomates, cebola, alho, frango, arroz, manjericão fresco..."
                  rows={4}
                  aria-invalid={!!validationError}
                  aria-describedby={validationError ? "ingredients-error" : undefined}
                  className={cn(
                    "min-h-[100px] resize-none rounded-[1.5rem] border-2 border-border bg-background/60 pl-16 text-lg leading-relaxed placeholder:text-muted-foreground/60 focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/20",
                    validationError && "border-destructive focus-visible:border-destructive",
                  )}
                />
              </div>

              {validationError && (
                <div
                  id="ingredients-error"
                  role="alert"
                  className="mt-4 flex items-start gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Restrictions */}
              <div className="mt-7">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Flame className="h-4 w-4 text-[var(--tomato)]" />
                  Restrições alimentares
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {RESTRICTIONS.map(({ id, icon: Icon, color }) => {
                    const active = selected.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggle(id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-bold transition-all",
                          active
                            ? `${color} shadow-sm scale-[1.02]`
                            : "border-border bg-secondary text-secondary-foreground hover:border-[var(--primary)]/40 hover:bg-accent",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={mutation.isPending || !deviceId}
                aria-busy={mutation.isPending}
                className="mt-8 h-14 w-full rounded-[1.5rem] bg-[var(--tomato)] text-lg font-bold text-white shadow-xl shadow-[var(--tomato)]/20 transition-all hover:bg-[var(--tomato)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Results Section */}
            <section className="mt-12">
              {mutation.isError && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
                  {(mutation.error as Error)?.message ?? "Algo deu errado."}
                </div>
              )}

              {mutation.isPending && (
                <div className="space-y-5">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className="h-52 animate-pulse rounded-[2rem] border-2 border-border bg-card/60"
                    />
                  ))}
                </div>
              )}

              {display && !mutation.isPending && (
                <div className="space-y-7">
                  {view?.kind === "history" && display.meta && (
                    <div className="rounded-2xl border-2 border-border bg-card/60 px-6 py-4">
                      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--tomato)]">
                        <HistoryIcon className="h-3.5 w-3.5" />
                        Do histórico
                      </p>
                      <p className="mt-1.5 text-sm text-foreground/90">
                        <span className="font-semibold">Ingredientes:</span>{" "}
                        {display.meta.ingredients}
                      </p>
                      {display.meta.restrictions.length > 0 && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Restrições: {display.meta.restrictions.join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  {display.notice && (
                    <div className="flex items-start gap-3.5 rounded-2xl border-2 border-[var(--mustard)]/50 bg-[var(--accent-soft)]/60 px-6 py-4 text-sm text-foreground">
                      <ChefHat className="mt-0.5 h-5 w-5 shrink-0 text-[var(--tomato)]" />
                      <p className="leading-relaxed">{display.notice}</p>
                    </div>
                  )}

                  {display.recipes.length > 0 && (
                    <>
                      <h2 className="text-3xl font-semibold tracking-tight">
                        {view?.kind === "history" ? "Receitas salvas" : "Suas receitas"}
                      </h2>
                      {display.assumedPantry.length > 0 && (
                        <p className="-mt-5 text-sm text-muted-foreground">
                          Considerei que você tem na despensa:{" "}
                          <span className="font-semibold text-foreground">
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
      className="overflow-hidden rounded-[2rem] border-2 border-border bg-card shadow-xl shadow-foreground/5 transition-all hover:-translate-y-1 hover:shadow-2xl"
      style={{ animation: `fadeIn 0.5s ease ${index * 0.1}s both` }}
    >
      <div className="border-b-2 border-border bg-gradient-to-br from-[var(--accent)]/80 to-[var(--secondary)]/60 px-7 py-6">
        <h3 className="text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">
          {recipe.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{recipe.description}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-foreground/80">
          <Meta icon={Clock} label={recipe.time} />
          <Meta icon={Flame} label={recipe.difficulty} />
          <Meta icon={Users} label={recipe.servings} />
        </div>
      </div>

      <div className="grid gap-7 px-7 py-7 sm:grid-cols-[1fr_1.5fr]">
        <div>
          <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--tomato)]">
            <Carrot className="h-3.5 w-3.5" />
            Ingredientes
          </h4>
          <ul className="space-y-2 text-sm text-foreground/90">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tomato)]" />
                {ing}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--tomato)]">
            <CookingPot className="h-3.5 w-3.5" />
            Modo de preparo
          </h4>
          <ol className="space-y-3.5 text-sm leading-relaxed text-foreground/90">
            {recipe.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--tomato)]/10 text-xs font-bold text-[var(--tomato)]">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{step}</span>
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
    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 border border-border">
      <Icon className="h-3.5 w-3.5 text-[var(--tomato)]" />
      {label}
    </span>
  );
}
