import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Archive,
  Bell,
  FileCheck2,
  FileText,
  FolderArchive,
  FolderOpen,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import logoImage from "../../photo/logo.png";

const items = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
  { title: "Citoyens", url: "/citizens", icon: Users },
  { title: "Nouveau citoyen", url: "/citizens/new", icon: UserPlus },
  { title: "Dossiers actifs", url: "/citizens", icon: FolderOpen },
  { title: "Dossiers archivés", url: "/archives", icon: FolderArchive },
  { title: "Documents", url: "/citizens", icon: FileText },
  { title: "Certificats de décès", url: "/archives", icon: FileCheck2 },
  { title: "Historique", url: "/logs", icon: History },
  { title: "Paramètres", url: "/", icon: Settings },
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 bg-transparent p-3 data-[state=collapsed]:p-2"
    >
      <div className="flex h-full flex-col rounded-[1.35rem] border border-slate-200/90 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <SidebarHeader className="border-b border-slate-100 px-3 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-blue-600/15 ring-1 ring-slate-200">
              <img src={logoImage} alt="Cahier de Santé Maroc" className="h-full w-full object-contain p-1" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-extrabold tracking-tight text-slate-950">
                Cahier de Santé Maroc
              </p>
              <p className="truncate text-xs font-medium text-slate-500">Administration Locale</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/80 p-3 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              Plateforme sécurisée
            </div>
            <p className="mt-1 text-[11px] leading-4 text-slate-500">Arrondissement / Ville</p>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="mt-2 gap-1.5">
                {items.map((item) => {
                  const active = path === item.url || (item.url !== "/" && path.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={`${item.title}-${item.url}`}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className="group relative h-11 rounded-2xl px-3 text-slate-600 hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-50 data-[active=true]:font-bold data-[active=true]:text-blue-700 data-[active=true]:shadow-sm"
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <span className="absolute left-0 h-5 w-1 rounded-r-full bg-blue-600 opacity-0 transition-opacity group-data-[active=true]:opacity-100" />
                          <item.icon className="h-4.5 w-4.5 shrink-0" />
                          <span className="truncate group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="mt-auto border-t border-slate-100 p-3">
          <div className="rounded-2xl bg-slate-50 p-3 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-400 text-sm font-bold text-white">
                  {(user?.full_name ?? "AL").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900">{user?.full_name}</p>
                  <Badge className="mt-1 rounded-full bg-blue-100 px-2 py-0 text-[10px] font-bold text-blue-700 hover:bg-blue-100">
                    {user?.role.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <SidebarMenuButton
            className="mt-2 h-10 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600"
            onClick={async () => {
              await logout();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </SidebarMenuButton>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
