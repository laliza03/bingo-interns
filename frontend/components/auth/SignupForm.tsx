"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks";

export default function SignupForm() {
  const router = useRouter();
  const { register, loading, error } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await register(email, password);
      router.push("/board");
    } catch {
      // error is already captured in the hook
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}

      <label htmlFor="signup-email">Email</label>
      <input
        id="signup-email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="signup-password">Password</label>
      <input
        id="signup-password"
        type="password"
        placeholder="Create a password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </button>

      <button
        className="btn btn-secondary"
        type="button"
        onClick={() => router.push("/login")}
      >
        Already have an account? Sign in
      </button>
    </form>
  );
}

