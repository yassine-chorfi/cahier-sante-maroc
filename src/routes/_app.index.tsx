import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Activity, Archive, ArrowUpRight, FolderOpen, Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getDashboard } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";

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

  const stats = [
    {
      label: "Total citoyens",
      value: dashboard?.stats.total ?? 0,
      icon: Users,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Dossiers actifs",
      value: dashboard?.stats.active ?? 0,
      icon: FolderOpen,
      tone: "bg-success/10 text-success",
    },
    {
      label: "Dossiers archives",
      value: dashboard?.stats.archived ?? 0,
      icon: Archive,
      tone: "bg-muted text-muted-foreground",
    },
    {
      label: "Activites 24h",
      value: dashboard?.stats.activity24h ?? 0,
      icon: Activity,
      tone: "bg-warning/15 text-warning-foreground",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de l'activite de votre administration locale"
        actions={
          <Button asChild>
            <Link to="/citizens/new">
              <ArrowUpRight className="mr-2 h-4 w-4" /> Nouveau citoyen
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.tone}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement des donnees MySQL...
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Inscriptions mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ total: { label: "Citoyens", color: "var(--primary)" } }}
              className="h-72 w-full"
            >
              <BarChart data={dashboard?.monthlyChart ?? []}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statut des dossiers</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                active: { label: "Actifs", color: "var(--success)" },
                archived: { label: "Archives", color: "var(--muted-foreground)" },
              }}
              className="h-72 w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={dashboard?.statusChart ?? []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Derniers citoyens enregistres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(dashboard?.recentCitizens ?? []).map((c) => (
              <Link
                key={c.id}
                to="/citizens/$id"
                params={{ id: String(c.id) }}
                className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted"
              >
                <div>
                  <p className="text-sm font-medium">
                    {c.first_name} {c.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.health_record_number} - CIN {c.cin}
                  </p>
                </div>
                <Badge variant={c.status === "active" ? "default" : "secondary"}>
                  {c.status === "active" ? "Actif" : "Archive"}
                </Badge>
              </Link>
            ))}
            {!loading && (dashboard?.recentCitizens ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucun citoyen enregistre
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dernieres activites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(dashboard?.recentLogs ?? []).map((l) => (
              <div key={l.id} className="flex items-start gap-3 rounded-md p-2 hover:bg-muted">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm">{l.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.user_name} - {new Date(l.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {l.action}
                </Badge>
              </div>
            ))}
            {!loading && (dashboard?.recentLogs ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucune activite enregistree
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
