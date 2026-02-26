import { useState, useEffect } from "react";
import { getUserId, registerUser, loginUser, logoutUser } from "@/lib/api";
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

  useEffect(() => {
    const userId = getUserId();
    const userEmail =
      typeof window !== "undefined" ? localStorage.getItem("user_email") : null;
    if (userId && userEmail) {
      setUser({ id: userId, email: userEmail });
    }
    setLoading(false);
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

  const logout = (): void => {
    logoutUser();
    setUser(null);
  };

  return { user, loading, error, register, login, logout, isLoggedIn: !!user };
}
