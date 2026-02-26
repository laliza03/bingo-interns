"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks";

export default function LoginForm() {
  const router = useRouter();
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/board");
    } catch {
      // error is already captured in the hook
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}

      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        type="password"
        placeholder="Enter password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <button
        className="btn btn-secondary"
        type="button"
        onClick={() => router.push("/signup")}
      >
        Need an account? Sign up
      </button>
    </form>
  );
}

