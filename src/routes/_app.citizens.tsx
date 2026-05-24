import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, FileDown, Loader2, Plus, Search } from "lucide-react";
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
    toast.success("Export CSV telecharge");
  }

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Citoyens"
        description="Liste de tous les citoyens enregistres dans votre administration"
        breadcrumb={["Accueil", "Citoyens"]}
        actions={
          <>
            <Button variant="outline" onClick={exportCSV}>
              <FileDown className="mr-2 h-4 w-4" /> Exporter
            </Button>
            <Button asChild>
              <Link to="/citizens/new">
                <Plus className="mr-2 h-4 w-4" /> Nouveau citoyen
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_190px_150px_110px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher CIN, nom, numero, telephone..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  resetPage();
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as typeof statusFilter);
                resetPage();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="archived">Archive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v as SortBy);
                resetPage();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Creation</SelectItem>
                <SelectItem value="last_name">Nom</SelectItem>
                <SelectItem value="birth_date">Naissance</SelectItem>
                <SelectItem value="health_identifier">Dossier</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortDir} onValueChange={(v) => setSortDir(v as SortDir)}>
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CIN</TableHead>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>N dossier</TableHead>
                  <TableHead>Date naissance</TableHead>
                  <TableHead>Telephone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizens.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.cin}</TableCell>
                    <TableCell className="font-medium">
                      {c.first_name} {c.last_name}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{c.health_record_number}</TableCell>
                    <TableCell>{c.birth_date}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "active" ? "default" : "secondary"}>
                        {c.status === "active" ? "Actif" : "Archive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/citizens/$id" params={{ id: String(c.id) }}>
                          <Eye className="mr-1 h-4 w-4" /> Voir
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {citizens.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
                        </span>
                      ) : (
                        "Aucun citoyen trouve"
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>
              {total} resultat(s) - page {page} / {pageCount}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Precedent
              </Button>
              <Button
                variant="outline"
                size="sm"
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
