import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Citizen } from "@/lib/mock-store";
import { listAllCitizens } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

export const Route = createFileRoute("/_app/archives")({
  component: ArchivesPage,
});

function ArchivesPage() {
  const [items, setItems] = useState<Citizen[]>([]);
  useEffect(() => {
    listAllCitizens()
      .then((citizens) => setItems(citizens.filter((c) => c.status === "archived")))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Dossiers archivés"
        description="Dossiers archivés suite à un décès"
        breadcrumb={["Accueil", "Archives"]}
      />
      <Card className="gov-card rounded-[1.35rem]">
        <CardContent className="p-4 md:p-5">
          <div className="premium-table overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro dossier</TableHead>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>CIN</TableHead>
                  <TableHead>Date de décès</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id} className="h-16">
                    <TableCell className="font-mono text-xs font-bold text-blue-700">
                      {c.health_record_number}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {c.first_name} {c.last_name}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-600">{c.cin}</TableCell>
                    <TableCell className="text-sm text-slate-600">{c.death?.death_date}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-slate-600">
                      {c.death?.reason}
                    </TableCell>
                    <TableCell>
                      <Badge className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 hover:bg-slate-100">
                        Archivé
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-blue-50 hover:text-blue-700">
                        <Link to="/citizens/$id" params={{ id: String(c.id) }} aria-label="Voir">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-slate-500">
                      Aucun dossier archivé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
