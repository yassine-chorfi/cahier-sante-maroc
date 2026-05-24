import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Save, ChevronLeft } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { createCitizen } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/citizens/new")({
  component: NewCitizenPage,
});

const schema = z.object({
  cin: z.string().trim().min(4).max(20),
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  birth_date: z.string().min(1),
  birth_place: z.string().trim().min(1).max(120),
  gender: z.enum(["M", "F"]),
  address: z.string().trim().min(1).max(255),
  phone: z.string().trim().min(6).max(30),
});

function NewCitizenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    cin: "",
    first_name: "",
    last_name: "",
    birth_date: "",
    birth_place: "",
    gender: "M" as "M" | "F",
    address: "",
    phone: "",
    father_cin: "",
    father_name: "",
    mother_cin: "",
    mother_name: "",
    parents_phone: "",
    parents_address: "",
    child_blood_type: "",
    father_blood_type: "",
    mother_blood_type: "",
    allergies: "",
    genetic_diseases: "",
    congenital_disability: "",
    notes: "",
  });

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error("Veuillez corriger les champs obligatoires");
      return;
    }

    try {
      const created = await createCitizen({
        data: {
          user_id: user?.id ?? null,
          establishment_id: user?.local_administration_id ?? null,
          cin: form.cin,
          first_name: form.first_name,
          last_name: form.last_name,
          birth_date: form.birth_date,
          birth_place: form.birth_place,
          gender: form.gender,
          address: form.address,
          phone: form.phone,
          father_cin: form.father_cin,
          father_name: form.father_name,
          mother_cin: form.mother_cin,
          mother_name: form.mother_name,
          parents_phone: form.parents_phone,
          child_blood_type: form.child_blood_type,
          allergies: form.allergies,
          genetic_diseases: form.genetic_diseases,
          congenital_disability: form.congenital_disability,
          notes: [
            form.notes,
            form.parents_address ? `Adresse parents: ${form.parents_address}` : "",
            form.father_blood_type ? `Groupe sanguin pere: ${form.father_blood_type}` : "",
            form.mother_blood_type ? `Groupe sanguin mere: ${form.mother_blood_type}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
          documents: files.map((file) => ({
            document_type: file.name.split(".").pop() ?? "doc",
            file_name: file.name,
          })),
        },
      });
      toast.success(`Dossier ${created.health_record_number} cree avec succes`);
      navigate({ to: "/citizens/$id", params: { id: String(created.id) } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("CIN_ALREADY_EXISTS")) {
        toast.error("Ce CIN existe deja dans la base de donnees");
        return;
      }
      toast.error("Impossible d'enregistrer le citoyen dans la base de donnees");
    }
  }

  const bloods = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Créer un dossier santé"
        description="Enregistrement complet d'un nouveau citoyen"
        breadcrumb={["Accueil", "Citoyens", "Nouveau"]}
        actions={
          <Button variant="ghost" onClick={() => navigate({ to: "/citizens" })}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Informations du citoyen</CardTitle>
            <CardDescription>Identité civile officielle</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="CIN *">
              <Input value={form.cin} onChange={(e) => setField("cin", e.target.value)} required />
            </Field>
            <Field label="Téléphone *">
              <Input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                required
              />
            </Field>
            <Field label="Prénom *">
              <Input
                value={form.first_name}
                onChange={(e) => setField("first_name", e.target.value)}
                required
              />
            </Field>
            <Field label="Nom *">
              <Input
                value={form.last_name}
                onChange={(e) => setField("last_name", e.target.value)}
                required
              />
            </Field>
            <Field label="Date de naissance *">
              <Input
                type="date"
                value={form.birth_date}
                onChange={(e) => setField("birth_date", e.target.value)}
                required
              />
            </Field>
            <Field label="Lieu de naissance *">
              <Input
                value={form.birth_place}
                onChange={(e) => setField("birth_place", e.target.value)}
                required
              />
            </Field>
            <Field label="Sexe *">
              <Select value={form.gender} onValueChange={(v) => setField("gender", v as "M" | "F")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Adresse *" className="md:col-span-2">
              <Input
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                required
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Informations des parents</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="CIN du père">
              <Input
                value={form.father_cin}
                onChange={(e) => setField("father_cin", e.target.value)}
              />
            </Field>
            <Field label="Nom du père">
              <Input
                value={form.father_name}
                onChange={(e) => setField("father_name", e.target.value)}
              />
            </Field>
            <Field label="CIN de la mère">
              <Input
                value={form.mother_cin}
                onChange={(e) => setField("mother_cin", e.target.value)}
              />
            </Field>
            <Field label="Nom de la mère">
              <Input
                value={form.mother_name}
                onChange={(e) => setField("mother_name", e.target.value)}
              />
            </Field>
            <Field label="Téléphone parents">
              <Input
                value={form.parents_phone}
                onChange={(e) => setField("parents_phone", e.target.value)}
              />
            </Field>
            <Field label="Adresse parents">
              <Input
                value={form.parents_address}
                onChange={(e) => setField("parents_address", e.target.value)}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Informations santé</CardTitle>
            <CardDescription>Données médicales initiales</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Field label="Groupe sanguin (enfant)">
              <Select
                value={form.child_blood_type}
                onValueChange={(v) => setField("child_blood_type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {bloods.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Groupe sanguin père">
              <Select
                value={form.father_blood_type}
                onValueChange={(v) => setField("father_blood_type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {bloods.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Groupe sanguin mère">
              <Select
                value={form.mother_blood_type}
                onValueChange={(v) => setField("mother_blood_type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {bloods.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Allergies" className="md:col-span-3">
              <Textarea
                value={form.allergies}
                onChange={(e) => setField("allergies", e.target.value)}
                rows={2}
              />
            </Field>
            <Field label="Maladies génétiques" className="md:col-span-3">
              <Textarea
                value={form.genetic_diseases}
                onChange={(e) => setField("genetic_diseases", e.target.value)}
                rows={2}
              />
            </Field>
            <Field label="Handicap congénital">
              <Input
                value={form.congenital_disability}
                onChange={(e) => setField("congenital_disability", e.target.value)}
                placeholder="Oui / Non / Précisions"
              />
            </Field>
            <Field label="Notes" className="md:col-span-2">
              <Input value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Documents officiels</CardTitle>
            <CardDescription>
              Certificat de naissance, CIN parents, documents médicaux (PDF/JPG/PNG)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/40">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Cliquez pour ajouter des fichiers</span>
              <span className="text-xs text-muted-foreground">PDF, JPG, PNG · max 10MB</span>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
            </label>
            {files.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm">
                {files.map((f) => (
                  <li key={f.name} className="rounded-md bg-muted px-3 py-1.5 font-mono text-xs">
                    {f.name}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/citizens" })}>
            Annuler
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Créer le dossier santé
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
