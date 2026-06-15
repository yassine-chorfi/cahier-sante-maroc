import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import loginImage from "@/assets/login-image.png";
import logoImage from "../../photo/logo.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("LOC-001");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim().toUpperCase().startsWith("LOC-")) {
      toast.error("Connexion reservee aux matricules LOC");
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      const res = await login(identifier, password);
      setLoading(false);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur de connexion");
        return;
      }
      toast.success("Connexion réussie");
      navigate({ to: "/" });
    }, 400);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <img
        src={loginImage}
        alt="Arrondissement administratif"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-950/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/45 via-slate-950/10 to-slate-950/35" />

      <main className="relative z-10 grid min-h-screen items-center gap-8 px-5 py-8 lg:grid-cols-[1fr_29rem] lg:pl-12 lg:pr-[50px] xl:pl-20">
        <section className="max-w-3xl text-white">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/30 bg-white/14 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-md">
            Administration Locale
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            Arrondissement administratif
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-7 text-white/82 md:text-lg">
            Cahier de Santé Maroc - espace sécurisé pour la gestion locale des dossiers citoyens.
          </p>
        </section>

        <Card className="w-full rounded-[1.75rem] border border-white/45 bg-white/22 text-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:fixed lg:right-[50px] lg:top-1/2 lg:w-[29rem] lg:-translate-y-1/2">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/85 shadow-lg ring-1 ring-white/45">
              <img src={logoImage} alt="Cahier de Santé Maroc" className="h-full w-full object-contain p-1.5" />
            </div>
            <CardTitle className="text-2xl font-extrabold">Cahier de Santé Maroc</CardTitle>
            <CardDescription className="text-white/78">
              Espace sécurisé - Administration Locale
              <br />
              Connectez-vous avec votre compte officiel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-white/90">
                  Matricule LOC
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="LOC-001"
                  className="h-12 rounded-2xl border-white/35 bg-white/22 text-white shadow-none backdrop-blur-md placeholder:text-white/55 focus-visible:border-white focus-visible:ring-white/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-2xl border-white/35 bg-white/22 text-white shadow-none backdrop-blur-md placeholder:text-white/55 focus-visible:border-white focus-visible:ring-white/30"
                />
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-white/78">
                  <Checkbox defaultChecked /> Se souvenir de moi
                </label>
                <a className="font-semibold text-white hover:underline" href="#">
                  Mot de passe oublié ?
                </a>
              </div>
              <Button
                type="submit"
                className="h-12 w-full rounded-2xl bg-white text-blue-700 shadow-xl shadow-slate-950/20 hover:bg-blue-50"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
