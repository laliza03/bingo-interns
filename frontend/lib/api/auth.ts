/**
 * lib/api/auth.ts
 *
 * Auth functions powered by Supabase Auth.
 * No more manual localStorage or custom backend /login endpoints.
 */

import { supabase } from "@/lib/supabaseClient";
import type { User } from "@/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

/** Map a Supabase user object to our app's User shape */
function toAppUser(su: SupabaseUser): User {
  return {
    id: su.id,
    email: su.email ?? "",
  };
}

function requireClient() {
  if (!supabase) throw new Error("Supabase client is not configured");
  return supabase;
}

export async function registerUser(email: string, password: string): Promise<User> {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({ email, password });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Registration failed — no user returned");

  const user = toAppUser(data.user);
  //   await syncProfileToBackend(user);
  return user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Login failed — no user returned");

  const user = toAppUser(data.user);
  //   await syncProfileToBackend(user);
  return user;
}

export async function logoutUser(): Promise<void> {
  const client = requireClient();
  const { error } = await client.auth.signOut();
  if (error) throw new Error(error.message);
}

/** Send a password-reset email via Supabase */
export async function resetPassword(email: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw new Error(error.message);
}

/** Update the user's password (called after clicking the reset link) */
export async function updatePassword(newPassword: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

/** Get the current session's access token (for backend API calls) */
export async function getAuthToken(): Promise<string | null> {
  const client = requireClient();
  const { data } = await client.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Get the current user's ID from the active session */
export async function getUserId(): Promise<string | null> {
  const client = requireClient();
  const { data } = await client.auth.getUser();
  return data.user?.id ?? null;
}
