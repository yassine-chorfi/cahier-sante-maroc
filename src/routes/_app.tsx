import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const allowed =
    user?.role === "admin_local" || user?.role === "agent_local" || user?.role === "super_admin";

  useEffect(() => {
    if (user === null) {
      // Wait one tick for localStorage hydration
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Cahier de Santé Maroc</span>
              <span className="mx-2">·</span>
              <span className="capitalize">{path.replace("/", "") || "Tableau de bord"}</span>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
