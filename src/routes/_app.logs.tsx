import { createFileRoute } from "@tanstack/react-router";
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
import { Badge } from "@/components/ui/badge";
import type { ActivityLog } from "@/lib/types";
import { listLogs } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/logs")({
  component: LogsPage,
});

function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  useEffect(() => {
    listLogs()
      .then(setLogs)
      .catch(() => setLogs([]));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal d'activité"
        description="Historique des actions effectuées par les agents de l'administration"
        breadcrumb={["Accueil", "Journal"]}
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Citoyen</TableHead>
                <TableHead>Date / Heure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.user_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {l.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{l.description}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {l.citizen_id ? `#${l.citizen_id}` : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleString("fr-FR")}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Aucune activité enregistrée
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
