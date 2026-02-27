"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks";
import PasswordInput from "@/components/ui/PasswordInput";

export default function LoginForm() {
  const router = useRouter();
  const { login, resetPassword, loading, error, successMessage } = useAuth();

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

  const handleResetPassword = async () => {
    if (!email) {
      return;
    }
    try {
      await resetPassword(email);
    } catch {
      // error is already captured in the hook
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}

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
      <PasswordInput
        id="login-password"
        placeholder="Enter password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <button
        className="btn btn-link"
        type="button"
        disabled={loading}
        onClick={handleResetPassword}
      >
        Forgot password?
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
