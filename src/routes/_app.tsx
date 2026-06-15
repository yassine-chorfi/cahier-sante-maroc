import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell, Building2, MapPin, Menu, Search } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const pageTitles: Record<string, string> = {
  "/": "Tableau de bord",
  "/citizens": "Citoyens",
  "/citizens/new": "Nouveau citoyen",
  "/archives": "Dossiers archivés",
  "/logs": "Historique",
};

function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const allowed =
    (user?.role === "admin_local" || user?.role === "agent_local") &&
    user.employee_number.toUpperCase().startsWith("LOC-");

  useEffect(() => {
    if (user === null) {
      const t = setTimeout(() => {
        const raw = localStorage.getItem("csm_auth_v1");
        if (!raw) navigate({ to: "/login" });
      }, 50);
      return () => clearTimeout(t);
    }
    if (user && !allowed) {
      navigate({ to: "/login" });
    }
  }, [user, allowed, navigate]);

  if (user && !allowed) {
    return null;
  }

  const title = pageTitles[path] ?? (path.startsWith("/citizens/") ? "Dossier citoyen" : "Administration locale");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 text-slate-950">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/82 px-3 py-3 shadow-sm backdrop-blur-xl md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-700">
                  <Menu className="h-4 w-4" />
                </SidebarTrigger>
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-extrabold tracking-tight text-slate-950 md:text-2xl">
                    {title}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-600" />
                      Administration Locale
                    </span>
                    <span className="hidden text-slate-300 sm:inline">/</span>
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-blue-600" />
                      Arrondissement / Ville
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden min-w-[16rem] max-w-sm flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner lg:flex">
                <Search className="mr-2 h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">Recherche rapide...</span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="relative h-10 w-10 rounded-2xl border-slate-200 bg-white shadow-sm hover:bg-blue-50"
                >
                  <Bell className="h-4 w-4 text-slate-600" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </Button>
                <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-400 text-sm font-bold text-white">
                    {(user?.full_name ?? "AL").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="max-w-36 truncate text-sm font-bold text-slate-900">
                      {user?.full_name}
                    </p>
                    <Badge className="rounded-full bg-emerald-50 px-2 py-0 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50">
                      {user?.role.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="min-w-0 flex-1 p-4 md:p-6 xl:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
