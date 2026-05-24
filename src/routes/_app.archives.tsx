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
    <div className="space-y-6">
      <PageHeader
        title="Archives décès"
        description="Dossiers archivés suite à un décès"
        breadcrumb={["Accueil", "Archives"]}
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Dossier</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>CIN</TableHead>
                <TableHead>Date de décès</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.health_record_number}</TableCell>
                  <TableCell>
                    {c.first_name} {c.last_name}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.cin}</TableCell>
                  <TableCell>{c.death?.death_date}</TableCell>
                  <TableCell className="max-w-xs truncate">{c.death?.reason}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/citizens/$id" params={{ id: String(c.id) }}>
                        <Eye className="mr-1 h-4 w-4" /> Voir
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Aucun dossier archivé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
