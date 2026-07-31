import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { authService } from "../services/auth.service";
import { TOKEN_STORAGE_KEY } from "../services/api";
import type { User } from "../types/user";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, team?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_STORAGE_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  const applyAuth = (token: string, authedUser: User) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    setUser(authedUser);
  };

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login({ email, password });

    if ("mfaRequired" in result) {
      const assertion = await startAuthentication({
        optionsJSON: result.options as Parameters<typeof startAuthentication>[0]["optionsJSON"],
      });
      const { token, user: authedUser } = await authService.verifyLoginPasskey(
        result.mfaToken,
        assertion
      );
      applyAuth(token, authedUser);
      return;
    }

    applyAuth(result.token, result.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, team?: string) => {
      const result = await authService.register({ name, email, password, team });
      applyAuth(result.token, result.user);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
