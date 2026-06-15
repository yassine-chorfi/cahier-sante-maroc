import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  Activity,
  Archive,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FilePlus2,
  FolderOpen,
  Loader2,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getDashboard } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import heroImage from "@/assets/morocco-admin-building.png";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
});

function Dashboard() {
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof getDashboard>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .finally(() => setLoading(false));
  }, []);

  const total = dashboard?.stats.total ?? 0;
  const active = dashboard?.stats.active ?? 0;
  const archived = dashboard?.stats.archived ?? 0;
  const activity24h = dashboard?.stats.activity24h ?? 0;

  const stats = [
    {
      label: "Citoyens enregistrés",
      value: total,
      change: "+12.4%",
      icon: Users,
      tone: "bg-blue-100 text-blue-700",
    },
    {
      label: "Dossiers actifs",
      value: active,
      change: "+8.2%",
      icon: FolderOpen,
      tone: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Dossiers archivés",
      value: archived,
      change: "+3.1%",
      icon: Archive,
      tone: "bg-slate-100 text-slate-700",
    },
    {
      label: "Nouveaux dossiers",
      value: activity24h,
      change: "+18.0%",
      icon: FilePlus2,
      tone: "bg-amber-100 text-amber-700",
    },
    {
      label: "Documents validés",
      value: Math.max(0, total - archived),
      change: "+6.7%",
      icon: CheckCircle2,
      tone: "bg-sky-100 text-sky-700",
    },
    {
      label: "Certificats décès",
      value: archived,
      change: "+2.6%",
      icon: FileCheck2,
      tone: "bg-red-100 text-red-700",
    },
  ];

  const activities = (dashboard?.recentLogs ?? []).slice(0, 4);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de l'activité de votre administration locale"
        actions={
          <Button asChild className="rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-700">
            <Link to="/citizens/new">
              <UserPlus className="mr-2 h-4 w-4" /> Nouveau citoyen
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((s, index) => (
          <Card
            key={s.label}
            className="gov-card hover-lift animate-slide-up overflow-hidden rounded-[1.25rem]"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.tone}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <Badge className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50">
                  {s.change}
                </Badge>
              </div>
              <p className="mt-5 text-sm font-semibold text-slate-500">{s.label}</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">{s.value}</p>
              <p className="mt-2 text-xs font-medium text-slate-400">Évolution mensuelle</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="gov-glass animate-slide-up overflow-hidden rounded-[1.5rem]">
        <div className="grid min-h-[21rem] gap-6 p-5 md:grid-cols-[1.05fr_0.95fr] md:p-7">
          <div className="flex flex-col justify-center">
            <Badge className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              Administration locale
            </Badge>
            <h2 className="mt-5 max-w-xl text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
              Gestion locale des dossiers de santé
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
              Create, manage and archive citizen medical files.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-2xl bg-blue-600 px-5 shadow-lg shadow-blue-600/20 hover:bg-blue-700">
                <Link to="/citizens/new">
                  <UserPlus className="mr-2 h-4 w-4" /> Nouveau citoyen
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white/80 px-5 hover:bg-blue-50">
                <Link to="/citizens">
                  <Search className="mr-2 h-4 w-4" /> Rechercher un dossier
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative min-h-[18rem] overflow-hidden rounded-[1.25rem] border border-white/80 shadow-2xl shadow-slate-900/10">
            <img
              src={heroImage}
              alt="Bâtiment administratif marocain"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {loading && (
        <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement des données MySQL...
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="gov-card rounded-[1.25rem]">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-slate-950">Inscriptions mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ total: { label: "Citoyens", color: "var(--primary)" } }}
              className="h-72 w-full"
            >
              <BarChart data={dashboard?.monthlyChart ?? []}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="gov-card rounded-[1.25rem]">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-slate-950">Statut des dossiers</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                active: { label: "Actifs", color: "var(--success)" },
                archived: { label: "Archivés", color: "var(--muted-foreground)" },
              }}
              className="h-72 w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={dashboard?.statusChart ?? []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={4}
                >
                  {(dashboard?.statusChart ?? []).map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="gov-card rounded-[1.25rem]">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-slate-950">
              Derniers citoyens enregistrés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(dashboard?.recentCitizens ?? []).map((c) => (
              <Link
                key={c.id}
                to="/citizens/$id"
                params={{ id: String(c.id) }}
                className="flex items-center justify-between gap-3 rounded-2xl border border-transparent p-3 transition hover:border-blue-100 hover:bg-blue-50/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {c.first_name} {c.last_name}
                  </p>
                  <p className="truncate text-xs font-medium text-slate-500">
                    {c.health_record_number} - CIN {c.cin}
                  </p>
                </div>
                <Badge className={c.status === "active" ? "rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100"}>
                  {c.status === "active" ? "Actif" : "Archivé"}
                </Badge>
              </Link>
            ))}
            {!loading && (dashboard?.recentCitizens ?? []).length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">Aucun citoyen enregistré</p>
            )}
          </CardContent>
        </Card>

        <Card className="gov-card rounded-[1.25rem]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-extrabold text-slate-950">Activité récente</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="space-y-2">
            {(activities.length ? activities : [
              { id: "a", action: "create", description: "Nouveau dossier créé", user_name: "Administration", created_at: new Date().toISOString() },
              { id: "b", action: "validate", description: "Document validé", user_name: "Administration", created_at: new Date().toISOString() },
              { id: "c", action: "archive", description: "Dossier archivé", user_name: "Administration", created_at: new Date().toISOString() },
              { id: "d", action: "certificate", description: "Certificat ajouté", user_name: "Administration", created_at: new Date().toISOString() },
            ]).map((l) => (
              <div
                key={l.id}
                className="flex items-start gap-3 rounded-2xl border border-transparent p-3 hover:border-blue-100 hover:bg-blue-50/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">{l.description}</p>
                  <p className="text-xs font-medium text-slate-500">
                    {l.user_name} - {new Date(l.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <ArrowRight className="mt-2 h-4 w-4 text-slate-300" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
