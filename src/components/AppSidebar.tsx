import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Archive,
  Activity,
  LogOut,
  HeartPulse,
  Moon,
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
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";

const items = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
  { title: "Citoyens", url: "/citizens", icon: Users },
  { title: "Nouveau citoyen", url: "/citizens/new", icon: UserPlus },
  { title: "Archives décès", url: "/archives", icon: Archive },
  { title: "Journal d'activité", url: "/logs", icon: Activity },
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const enabled = localStorage.getItem("csm_theme") === "dark";
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  function toggleDark(value: boolean) {
    setDark(value);
    localStorage.setItem("csm_theme", value ? "dark" : "light");
    document.documentElement.classList.toggle("dark", value);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold leading-tight">Cahier de Santé</span>
            <span className="text-xs text-muted-foreground">Royaume du Maroc</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration locale</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex flex-col gap-2 p-2">
          <div className="rounded-md bg-muted/50 px-3 py-2 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-medium">{user?.full_name}</p>
            <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
              {user?.role.replace("_", " ")}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-md px-3 py-2 group-data-[collapsible=icon]:hidden">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Moon className="h-4 w-4" /> Mode sombre
            </span>
            <Switch checked={dark} onCheckedChange={toggleDark} />
          </div>
          <SidebarMenuButton
            onClick={async () => {
              await logout();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
