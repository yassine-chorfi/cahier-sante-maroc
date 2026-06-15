import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Edit3, Eye, FileDown, Filter, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Citizen } from "@/lib/mock-store";
import { listCitizens } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/citizens")({
  component: CitizensRoute,
});

type SortBy = "created_at" | "last_name" | "birth_date" | "health_identifier";
type SortDir = "asc" | "desc";

function CitizensRoute() {
  const path = useRouterState({ select: (state) => state.location.pathname });

  if (path !== "/citizens") {
    return <Outlet />;
  }

  return <CitizensListPage />;
}

function CitizensListPage() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timeout = window.setTimeout(() => {
      listCitizens({
        data: {
          page,
          pageSize,
          search: q,
          status: statusFilter,
          sortBy,
          sortDir,
        },
      })
        .then((result) => {
          setCitizens(result.items);
          setTotal(result.total);
          setPageCount(result.pageCount);
        })
        .catch(() => {
          setCitizens([]);
          setTotal(0);
          setPageCount(1);
          toast.error("Impossible de charger les citoyens depuis MySQL");
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [page, pageSize, q, statusFilter, sortBy, sortDir]);

  function exportCSV() {
    const headers = [
      "CIN",
      "Nom complet",
      "Numero dossier",
      "Date naissance",
      "Telephone",
      "Statut",
    ];
    const rows = citizens.map((c) => [
      c.cin,
      `${c.first_name} ${c.last_name}`,
      c.health_record_number,
      c.birth_date,
      c.phone,
      c.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `citoyens-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  }

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Citoyens"
        description="Liste de tous les citoyens enregistrés dans votre administration"
        breadcrumb={["Accueil", "Citoyens"]}
        actions={
          <>
            <Button variant="outline" onClick={exportCSV} className="rounded-2xl border-slate-200 bg-white shadow-sm hover:bg-blue-50">
              <FileDown className="mr-2 h-4 w-4" /> Exporter
            </Button>
            <Button asChild className="rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-700">
              <Link to="/citizens/new">
                <Plus className="mr-2 h-4 w-4" /> Nouveau citoyen
              </Link>
            </Button>
          </>
        }
      />

      <Card className="gov-card animate-slide-up rounded-[1.35rem]">
        <CardContent className="space-y-5 p-4 md:p-5">
          <div className="grid gap-3 xl:grid-cols-[1fr_180px_190px_150px_110px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Rechercher CIN, nom, numéro, téléphone..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  resetPage();
                }}
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 shadow-inner"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as typeof statusFilter);
                resetPage();
              }}
            >
              <SelectTrigger className="h-12 rounded-2xl border-slate-200">
                <Filter className="mr-2 h-4 w-4 text-blue-600" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v as SortBy);
                resetPage();
              }}
            >
              <SelectTrigger className="h-12 rounded-2xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Création</SelectItem>
                <SelectItem value="last_name">Nom</SelectItem>
                <SelectItem value="birth_date">Naissance</SelectItem>
                <SelectItem value="health_identifier">Dossier</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortDir} onValueChange={(v) => setSortDir(v as SortDir)}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descendant</SelectItem>
                <SelectItem value="asc">Ascendant</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-12 rounded-2xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="premium-table overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CIN</TableHead>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Date naissance</TableHead>
                  <TableHead>Numéro dossier</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizens.map((c) => (
                  <TableRow key={c.id} className="h-16">
                    <TableCell className="font-mono text-xs font-bold text-slate-600">{c.cin}</TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {c.first_name} {c.last_name}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{c.birth_date}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-blue-700">{c.health_record_number}</TableCell>
                    <TableCell className="text-sm text-slate-600">{c.phone}</TableCell>
                    <TableCell>
                      <Badge className={c.status === "active" ? "rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-50" : "rounded-full bg-slate-100 px-3 py-1 text-slate-600 hover:bg-slate-100"}>
                        {c.status === "active" ? "Actif" : "Archivé"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button asChild size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-blue-50 hover:text-blue-700">
                          <Link to="/citizens/$id" params={{ id: String(c.id) }} aria-label="Voir">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-amber-50 hover:text-amber-700">
                          <Link to="/citizens/$id" params={{ id: String(c.id) }} aria-label="Modifier">
                            <Edit3 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-red-50 hover:text-red-600" aria-label="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {citizens.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-slate-500">
                      {loading ? (
                        <span className="inline-flex items-center gap-2 font-medium">
                          <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
                        </span>
                      ) : (
                        "Aucun citoyen trouvé"
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 text-sm font-medium text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              {total} résultat(s) - page {page} / {pageCount}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 bg-white"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 bg-white"
                disabled={page >= pageCount || loading}
                onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
              >
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
