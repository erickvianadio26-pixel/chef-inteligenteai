import { useEffect, useState } from "react";
import { Check, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type PaletteId = "forest" | "terracotta" | "mustard" | "olive";

type PaletteDef = {
  id: PaletteId;
  name: string;
  description: string;
  swatches: string[]; // CSS color strings for preview
};

const PALETTES: PaletteDef[] = [
  {
    id: "forest",
    name: "Floresta & Tomate",
    description: "Verde profundo, vermelho tomate, mostarda",
    swatches: [
      "oklch(0.35 0.10 160)",
      "oklch(0.58 0.20 30)",
      "oklch(0.78 0.16 85)",
      "oklch(0.94 0.025 95)",
    ],
  },
  {
    id: "terracotta",
    name: "Terracota & Sálvia",
    description: "Barro quente com toques de sálvia",
    swatches: [
      "oklch(0.56 0.16 40)",
      "oklch(0.45 0.08 145)",
      "oklch(0.74 0.13 75)",
      "oklch(0.93 0.03 70)",
    ],
  },
  {
    id: "mustard",
    name: "Mostarda & Borgonha",
    description: "Vinho profundo e mostarda dourada",
    swatches: [
      "oklch(0.42 0.14 25)",
      "oklch(0.72 0.16 80)",
      "oklch(0.40 0.08 130)",
      "oklch(0.93 0.035 90)",
    ],
  },
  {
    id: "olive",
    name: "Azeitona & Páprica",
    description: "Verde oliva com páprica defumada",
    swatches: [
      "oklch(0.48 0.10 125)",
      "oklch(0.55 0.19 35)",
      "oklch(0.74 0.15 90)",
      "oklch(0.93 0.030 105)",
    ],
  },
];

const STORAGE_KEY = "chef-caseiro-palette";

function applyPalette(id: PaletteId) {
  document.documentElement.dataset.palette = id;
}

export function PaletteSwitcher() {
  const [current, setCurrent] = useState<PaletteId>("forest");

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as PaletteId | null) ?? "forest";
    setCurrent(saved);
    applyPalette(saved);
  }, []);

  const handleSelect = (id: PaletteId) => {
    setCurrent(id);
    applyPalette(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const active = PALETTES.find((p) => p.id === current) ?? PALETTES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-[var(--tomato)]/40 hover:bg-accent"
          aria-label="Trocar paleta de cores"
        >
          <Palette className="h-3.5 w-3.5 text-[var(--tomato)]" />
          <span className="hidden sm:inline">{active.name}</span>
          <span className="flex items-center gap-0.5">
            {active.swatches.slice(0, 4).map((c, i) => (
              <span
                key={i}
                className="h-3 w-3 rounded-full border border-white/40"
                style={{ backgroundColor: c }}
              />
            ))}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-2xl border-2 p-2">
        <DropdownMenuLabel className="px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Paletas artesanais
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PALETTES.map((p) => {
          const isActive = p.id === current;
          return (
            <DropdownMenuItem
              key={p.id}
              onSelect={() => handleSelect(p.id)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5",
                isActive && "bg-accent/60",
              )}
            >
              <div className="flex shrink-0 items-center gap-0.5">
                {p.swatches.map((c, i) => (
                  <span
                    key={i}
                    className="h-6 w-6 rounded-full border-2 border-card shadow-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold">{p.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {p.description}
                </span>
              </div>
              {isActive && (
                <Check className="h-4 w-4 shrink-0 text-[var(--tomato)]" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
