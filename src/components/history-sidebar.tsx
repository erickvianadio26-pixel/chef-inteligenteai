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
    <Sidebar collapsible="icon" className="border-r border-border bg-card/80">
      <SidebarHeader className="border-b border-border px-3 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <ChefHat className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display text-base font-semibold leading-tight">
                Chef Caseiro
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Suas receitas recentes
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-1.5">
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
                      className="h-12 animate-pulse rounded-lg bg-muted"
                    />
                  ))}
                </div>
              )}

              {!isLoading && history.length === 0 && !collapsed && (
                <p className="px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  Suas receitas geradas aparecerão aqui automaticamente.
                </p>
              )}

              {history.map((entry) => {
                const title =
                  entry.recipes[0]?.title ?? "Receita";
                const active = entry.id === selectedId;
                return (
                  <SidebarMenuItem key={entry.id}>
                    <SidebarMenuButton
                      onClick={() => onSelect(entry)}
                      isActive={active}
                      tooltip={collapsed ? title : undefined}
                      className={cn(
                        "h-auto items-start gap-2 py-2.5",
                        active && "bg-primary/10 text-primary",
                      )}
                    >
                      <Sparkles
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      {!collapsed && (
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate text-sm font-medium">
                            {title}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
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
