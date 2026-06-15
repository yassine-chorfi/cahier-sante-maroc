import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loginUser, logoutUser } from "./api";
import type { User } from "./mock-store";

const AUTH_KEY = "csm_auth_v1";

function hasLocalAccess(user: User | null) {
  return (
    !!user &&
    (user.role === "admin_local" || user.role === "agent_local") &&
    user.employee_number.toUpperCase().startsWith("LOC-")
  );
}

interface AuthCtx {
  user: User | null;
  login: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(AUTH_KEY) : null;
    if (raw) {
      try {
        const storedUser = JSON.parse(raw) as User;
        if (hasLocalAccess(storedUser)) {
          setUser(storedUser);
        } else {
          localStorage.removeItem(AUTH_KEY);
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  async function login(identifier: string, password: string) {
    const dbUser = await loginUser({ data: { identifier, password } });
    if (!dbUser) return { ok: false, error: "Acces reserve aux comptes LOC actifs" };
    setUser(dbUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(dbUser));
    return { ok: true };
  }

  async function logout() {
    if (user) {
      await logoutUser({ data: { user_id: user.id, name: user.full_name } });
    }
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
