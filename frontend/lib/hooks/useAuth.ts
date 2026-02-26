import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { registerUser, loginUser, logoutUser } from "@/lib/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoggedIn: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // On mount: read current Supabase session & subscribe to auth changes
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get the current user once
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? "" });
      }
      setLoading(false);
    });

    // Listen for sign-in / sign-out / token refresh
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? "" });
        } else {
          setUser(null);
        }
      },
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const register = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await registerUser(email, password);
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
  };

  const login = async (email: string, password: string): Promise<User> => {
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
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
    } catch {
      // best-effort
    }
    setUser(null);
  };

  return { user, loading, error, register, login, logout, isLoggedIn: !!user };
}
