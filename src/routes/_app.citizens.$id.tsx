import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Archive, ChevronLeft, Download, FileText, Pencil, ShieldAlert } from "lucide-react";
import type { ActivityLog, Citizen } from "@/lib/types";
import { archiveCitizen, getCitizen, updateCitizen } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/citizens/$id")({
  component: CitizenDetailPage,
});

function CitizenDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deathDate, setDeathDate] = useState("");
  const [reason, setReason] = useState("");
  const [certificateFile, setCertificateFile] = useState("");
  const [editForm, setEditForm] = useState({
    address: "",
    phone: "",
    allergies: "",
    genetic_diseases: "",
    congenital_disability: "",
    notes: "",
  });

  useEffect(() => {
    getCitizen({ data: { id: Number(id), user_id: user?.id ?? null } })
      .then((data) => {
        setCitizen(data?.citizen ?? null);
        setLogs(data?.logs ?? []);
        if (data?.citizen) {
          setEditForm({
            address: data.citizen.address,
            phone: data.citizen.phone,
            allergies: data.citizen.health?.allergies ?? "",
            genetic_diseases: data.citizen.health?.genetic_diseases ?? "",
            congenital_disability: data.citizen.health?.congenital_disability ?? "",
            notes: data.citizen.health?.notes ?? "",
          });
        }
      })
      .catch(() => {
        setCitizen(null);
        setLogs([]);
      });
  }, [id, user?.id]);

  if (!citizen) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Dossier introuvable.
      </div>
    );
  }

  const readOnly = citizen.status === "archived";

  async function handleUpdate() {
    try {
      await updateCitizen({
        data: {
          id: citizen!.id,
          user_id: user?.id ?? null,
          ...editForm,
        },
      });
      toast.success("Dossier mis a jour");
      setEditOpen(false);
      const data = await getCitizen({ data: { id: Number(id), user_id: user?.id ?? null } });
      setCitizen(data?.citizen ?? null);
      setLogs(data?.logs ?? []);
    } catch {
      toast.error("Impossible de modifier ce dossier");
    }
  }

  async function handleArchive() {
    if (!deathDate || !reason || !certificateFile) {
      toast.error("Date de décès et motif requis");
      return;
    }
    try {
      await archiveCitizen({
        data: {
          id: citizen!.id,
          user_id: user?.id ?? null,
          death_date: deathDate,
          reason,
          certificate_file: certificateFile,
        },
      });
      toast.success("Dossier archive");
      setArchiveOpen(false);
      const data = await getCitizen({ data: { id: Number(id), user_id: user?.id ?? null } });
      setCitizen(data?.citizen ?? null);
      setLogs(data?.logs ?? []);
    } catch {
      toast.error("Impossible d'archiver le dossier dans la base de donnees");
    }
  }

  function downloadPdf() {
    const txt = `Cahier de Santé Maroc\nDossier: ${citizen!.health_record_number}\nNom: ${citizen!.first_name} ${citizen!.last_name}\nCIN: ${citizen!.cin}\n`;
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${citizen!.health_record_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier téléchargé");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${citizen.first_name} ${citizen.last_name}`}
        description={`Dossier ${citizen.health_record_number} · CIN ${citizen.cin}`}
        breadcrumb={["Accueil", "Citoyens", citizen.health_record_number]}
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link to="/citizens">
                <ChevronLeft className="mr-2 h-4 w-4" /> Liste
              </Link>
            </Button>
            <Button variant="outline" onClick={downloadPdf}>
              <Download className="mr-2 h-4 w-4" /> Télécharger
            </Button>
            {!readOnly && (
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Pencil className="mr-2 h-4 w-4" /> Modifier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modifier le dossier</DialogTitle>
                    <DialogDescription>
                      Les changements sont enregistres dans le journal d'activite.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3">
                    <div>
                      <Label>Telephone</Label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Adresse</Label>
                      <Input
                        value={editForm.address}
                        onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Allergies</Label>
                      <Textarea
                        value={editForm.allergies}
                        onChange={(e) => setEditForm((f) => ({ ...f, allergies: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Notes medicales</Label>
                      <Textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setEditOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleUpdate}>Enregistrer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {!readOnly && (
              <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Archive className="mr-2 h-4 w-4" /> Archiver (décès)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-destructive" /> Archivage du dossier
                    </DialogTitle>
                    <DialogDescription>
                      Cette action est irréversible. Le dossier passera en lecture seule.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Date de décès</Label>
                      <Input
                        type="date"
                        value={deathDate}
                        onChange={(e) => setDeathDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Motif</Label>
                      <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Certificat de deces</Label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setCertificateFile(e.target.files?.[0]?.name ?? "")}
                      />
                      {certificateFile && (
                        <p className="mt-1 text-xs text-muted-foreground">{certificateFile}</p>
                      )}
                    </div>
                    <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                      Le certificat de décès doit être joint (upload simulé).
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setArchiveOpen(false)}>
                      Annuler
                    </Button>
                    <Button variant="destructive" onClick={handleArchive}>
                      Confirmer l'archivage
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </>
        }
      />

      {readOnly && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <ShieldAlert className="h-4 w-4" />
          Dossier archivé — lecture seule. Décès le {citizen.death?.death_date}.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Identité</CardTitle>
            <Badge variant={readOnly ? "secondary" : "default"}>
              {readOnly ? "Archivé" : "Actif"}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2">
            <Info label="CIN" value={citizen.cin} />
            <Info label="Téléphone" value={citizen.phone} />
            <Info label="Date de naissance" value={citizen.birth_date} />
            <Info label="Lieu de naissance" value={citizen.birth_place} />
            <Info label="Sexe" value={citizen.gender === "M" ? "Masculin" : "Féminin"} />
            <Info label="Adresse" value={citizen.address} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Info
              label="Père"
              value={`${citizen.parents?.father_name ?? "—"} (${citizen.parents?.father_cin ?? "—"})`}
            />
            <Info
              label="Mère"
              value={`${citizen.parents?.mother_name ?? "—"} (${citizen.parents?.mother_cin ?? "—"})`}
            />
            <Info label="Téléphone" value={citizen.parents?.phone ?? "—"} />
            <Info label="Adresse" value={citizen.parents?.address ?? "—"} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Informations santé</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-3">
            <Info label="Groupe sanguin enfant" value={citizen.health?.child_blood_type || "—"} />
            <Info label="Groupe sanguin père" value={citizen.health?.father_blood_type || "—"} />
            <Info label="Groupe sanguin mère" value={citizen.health?.mother_blood_type || "—"} />
            <Info
              label="Allergies"
              value={citizen.health?.allergies || "—"}
              className="md:col-span-3"
            />
            <Info
              label="Maladies génétiques"
              value={citizen.health?.genetic_diseases || "—"}
              className="md:col-span-3"
            />
            <Info
              label="Handicap congénital"
              value={citizen.health?.congenital_disability || "—"}
            />
            <Info label="Notes" value={citizen.health?.notes || "—"} className="md:col-span-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(citizen.documents ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun document.</p>
            )}
            {(citizen.documents ?? []).map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <FileText className="h-4 w-4 text-primary" />
                <span className="truncate">{d.file_name}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Historique d'activité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {logs.length === 0 && <p className="text-sm text-muted-foreground">Aucune activité.</p>}
            {logs.map((l) => (
              <div
                key={l.id}
                className="flex items-start justify-between border-b py-2 text-sm last:border-0"
              >
                <div>
                  <p>{l.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.user_name} · {new Date(l.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {l.action}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Separator />
    </div>
  );
}

function Info({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
