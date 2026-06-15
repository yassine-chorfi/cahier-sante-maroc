import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ChevronLeft, Save, Upload } from "lucide-react";
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
      toast.success(`Dossier ${created.health_record_number} créé avec succès`);
      navigate({ to: "/citizens/$id", params: { id: String(created.id) } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("CIN_ALREADY_EXISTS")) {
        toast.error("Ce CIN existe déjà dans la base de données");
        return;
      }
      toast.error("Impossible d'enregistrer le citoyen dans la base de données");
    }
  }

  const bloods = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Créer un dossier santé"
        description="Enregistrement complet d'un nouveau citoyen"
        breadcrumb={["Accueil", "Citoyens", "Nouveau"]}
        actions={
          <Button
            variant="ghost"
            className="rounded-2xl hover:bg-blue-50 hover:text-blue-700"
            onClick={() => navigate({ to: "/citizens" })}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="mr-[50px] space-y-6">
        <FormSection title="1. Informations du citoyen" description="Identité civile officielle">
          <Field label="CIN *">
            <Input value={form.cin} onChange={(e) => setField("cin", e.target.value)} required />
          </Field>
          <Field label="Téléphone *">
            <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} required />
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
        </FormSection>

        <FormSection title="2. Informations des parents">
          <Field label="CIN du père">
            <Input value={form.father_cin} onChange={(e) => setField("father_cin", e.target.value)} />
          </Field>
          <Field label="Nom du père">
            <Input value={form.father_name} onChange={(e) => setField("father_name", e.target.value)} />
          </Field>
          <Field label="CIN de la mère">
            <Input value={form.mother_cin} onChange={(e) => setField("mother_cin", e.target.value)} />
          </Field>
          <Field label="Nom de la mère">
            <Input value={form.mother_name} onChange={(e) => setField("mother_name", e.target.value)} />
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
        </FormSection>

        <FormSection title="3. Informations santé" description="Données médicales initiales">
          <Field label="Groupe sanguin (enfant)">
            <Select
              value={form.child_blood_type}
              onValueChange={(v) => setField("child_blood_type", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="-" />
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
                <SelectValue placeholder="-" />
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
                <SelectValue placeholder="-" />
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
        </FormSection>

        <Card className="gov-card hover-lift rounded-[1.35rem]">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold text-slate-950">4. Documents officiels</CardTitle>
            <CardDescription>
              Certificat de naissance, CIN parents, documents médicaux (PDF/JPG/PNG)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.25rem] border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <Upload className="h-7 w-7" />
              </span>
              <span className="text-sm font-bold text-slate-900">Cliquez pour ajouter des fichiers</span>
              <span className="text-xs font-medium text-slate-500">PDF, JPG, PNG - max 10MB</span>
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
                  <li key={f.name} className="rounded-xl bg-slate-100 px-3 py-2 font-mono text-xs text-slate-600">
                    {f.name}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col justify-end gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-2xl border-slate-200 bg-white px-6"
            onClick={() => navigate({ to: "/citizens" })}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="h-12 rounded-2xl bg-blue-600 px-6 shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            <Save className="mr-2 h-4 w-4" /> Créer le dossier santé
          </Button>
        </div>
      </form>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gov-card hover-lift rounded-[1.35rem]">
      <CardHeader>
        <CardTitle className="text-xl font-extrabold text-slate-950">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</CardContent>
    </Card>
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
    <div className={`floating-field ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
