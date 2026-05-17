import { ChefHat, Clock, History, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { HistoryEntry } from "@/lib/recipes.functions";
import { cn } from "@/lib/utils";

type Props = {
  history: HistoryEntry[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (entry: HistoryEntry) => void;
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diffMin = Math.round((now - d.getTime()) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin} min atrás`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} h atrás`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function HistorySidebar({ history, isLoading, selectedId, onSelect }: Props) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border bg-[oklch(0.35_0.10_160)] text-white/90"
    >
      <SidebarHeader className="border-b border-white/10 px-3 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[oklch(0.78_0.16_85)] text-[oklch(0.35_0.10_160)] shadow-lg"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            <ChefHat className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display text-lg font-bold leading-tight text-white">
                Chef Caseiro
              </p>
              <p className="truncate text-xs text-white/60">
                Suas receitas recentes
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-1.5 text-white/50">
            <History className="h-3.5 w-3.5" />
            {!collapsed && <span>Últimas 5 receitas</span>}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading && !collapsed && (
                <div className="space-y-2 px-2 py-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded-xl bg-white/10"
                    />
                  ))}
                </div>
              )}

              {!isLoading && history.length === 0 && !collapsed && (
                <p className="px-3 py-2 text-xs leading-relaxed text-white/50">
                  Suas receitas geradas aparecerão aqui automaticamente.
                </p>
              )}

              {history.map((entry) => {
                const title = entry.recipes[0]?.title ?? "Receita";
                const active = entry.id === selectedId;
                return (
                  <SidebarMenuItem key={entry.id}>
                    <SidebarMenuButton
                      onClick={() => onSelect(entry)}
                      isActive={active}
                      tooltip={collapsed ? title : undefined}
                      className={cn(
                        "h-auto items-start gap-2 rounded-xl py-2.5 text-white/70 hover:bg-white/10 hover:text-white",
                        active && "bg-white/15 text-white",
                      )}
                    >
                      <Sparkles
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          active ? "text-[oklch(0.78_0.16_85)]" : "text-white/40",
                        )}
                      />
                      {!collapsed && (
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate text-sm font-medium">
                            {title}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-white/50">
                            <Clock className="h-3 w-3" />
                            {formatWhen(entry.createdAt)}
                          </span>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
