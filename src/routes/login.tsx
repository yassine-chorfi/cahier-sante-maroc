import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { HeartPulse, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "admin_local") navigate({ to: "/" });
  }, [user, navigate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary-glow/10 p-4">
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-primary-glow/30 blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-border/60 shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <HeartPulse className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Cahier de Santé Maroc</CardTitle>
          <CardDescription>
            Espace sécurisé — Administration Locale
            <br />
            Connectez-vous avec votre compte officiel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email ou matricule LOC</Label>
              <Input
                id="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="LOC-001 ou admin@csm.ma"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <Checkbox defaultChecked /> Se souvenir de moi
              </label>
              <a className="text-primary hover:underline" href="#">
                Mot de passe oublié ?
              </a>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
