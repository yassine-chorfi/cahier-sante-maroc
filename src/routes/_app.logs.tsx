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
import type { ActivityLog } from "@/lib/mock-store";
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
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Historique"
        description="Historique des actions effectuées par les agents de l'administration"
        breadcrumb={["Accueil", "Historique"]}
      />
      <Card className="gov-card rounded-[1.35rem]">
        <CardContent className="p-4 md:p-5">
          <div className="premium-table overflow-x-auto">
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
                  <TableRow key={l.id} className="h-16">
                    <TableCell className="font-bold text-slate-900">{l.user_name}</TableCell>
                    <TableCell>
                      <Badge className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50">
                        {l.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-sm text-slate-600">
                      {l.description}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-600">
                      {l.citizen_id ? `#${l.citizen_id}` : "-"}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-500">
                      {new Date(l.created_at).toLocaleString("fr-FR")}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-sm text-slate-500">
                      Aucune activité enregistrée
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
