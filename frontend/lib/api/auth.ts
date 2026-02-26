/**
 * lib/api/auth.ts
 */

import type { User } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_id");
}

export async function registerUser(
  email: string,
  password: string,
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Registration failed");
  }

  const user: User = await response.json();
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", user.id);
    localStorage.setItem("user_id", user.id);
    localStorage.setItem("user_email", user.email);
  }
  return user;
}

// TODO: replace with a dedicated /login endpoint when available
export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
  }

  const user: User = await response.json();
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", user.id);
    localStorage.setItem("user_id", user.id);
    localStorage.setItem("user_email", user.email);
  }
  return user;
}

export function logoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
  }
}
