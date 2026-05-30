import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loginUser, logoutUser } from "./api";
import type { User } from "./types";

const AUTH_KEY = "csm_auth_v1";
const LEGACY_STORE_KEY = "csm_store_v1";

interface AuthCtx {
  user: User | null;
  login: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LEGACY_STORE_KEY);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  async function login(identifier: string, password: string) {
    const result = await loginUser({ data: { identifier: identifier.trim(), password } });
    if (!result.ok) {
      return {
        ok: false,
        error:
          result.reason === "forbidden"
            ? "Acces refuse: ce site est reserve aux utilisateurs LOC."
            : "Identifiants invalides",
      };
    }
    setUser(result.user);
    return { ok: true };
  }

  async function logout() {
    if (user) {
      await logoutUser({ data: { user_id: user.id, name: user.full_name } });
    }
    setUser(null);
  }

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
