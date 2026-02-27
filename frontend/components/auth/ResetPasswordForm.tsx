"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { updatePassword } from "@/lib/api";
import PasswordInput from "@/components/ui/PasswordInput";

export default function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase automatically picks up the recovery token from the URL hash
  // and establishes a session. We wait for that before enabling the form.
  useEffect(() => {
    if (!supabase) return;

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          setSessionReady(true);
        }
      },
    );

    // Also check if there's already a session (e.g. page refresh)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionReady) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <p className="intro-text">Verifying your reset link…</p>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <p className="form-success">
          Password updated successfully! Redirecting to login…
        </p>
      </div>
    );
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}

      <label htmlFor="reset-password">New Password</label>
      <PasswordInput
        id="reset-password"
        placeholder="Enter new password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label htmlFor="reset-confirm-password">Confirm New Password</label>
      <PasswordInput
        id="reset-confirm-password"
        placeholder="Re-enter new password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (error) setError(null);
        }}
      />

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Resetting…" : "Reset Password"}
      </button>

      <button
        className="btn btn-secondary"
        type="button"
        onClick={() => router.push("/login")}
      >
        Back to login
      </button>
    </form>
  );
}
