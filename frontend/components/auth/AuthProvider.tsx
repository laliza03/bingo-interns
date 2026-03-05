"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword as resetPasswordApi,
} from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  register: (email: string, password: string, name?: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // On mount: read current Supabase session & subscribe to auth changes (ONCE)
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? "",
          name: (data.user.user_metadata?.name as string) ?? undefined,
        });
      }
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            name: (session.user.user_metadata?.name as string) ?? undefined,
          });
        } else {
          setUser(null);
        }
      },
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string): Promise<User> => {
      setLoading(true);
      setError(null);
      try {
        const newUser = await registerUser(email, password, name);
        setUser(newUser);
        return newUser;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Registration failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      setLoading(true);
      setError(null);
      try {
        const loggedInUser = await loginUser(email, password);
        setUser(loggedInUser);
        return loggedInUser;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await resetPasswordApi(email);
      setSuccessMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send reset email";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutUser();
    } catch {
      // best-effort
    }
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      successMessage,
      register,
      login,
      logout,
      resetPassword,
      isLoggedIn: !!user,
    }),
    [
      user,
      loading,
      error,
      successMessage,
      register,
      login,
      logout,
      resetPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Consume the shared auth context.
 * Must be used inside an <AuthProvider>.
 */
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an <AuthProvider>");
  }
  return ctx;
}
