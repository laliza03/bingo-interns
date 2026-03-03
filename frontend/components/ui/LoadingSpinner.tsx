"use client";

type SpinnerSize = "sm" | "md" | "lg";

interface LoadingSpinnerProps {
  message?: string;
  size?: SpinnerSize;
}

export default function LoadingSpinner({
  message = "Loading…",
  size = "md"
}: LoadingSpinnerProps) {
  return (
    <div className={`spinner-wrapper spinner-${size}`} role="status" aria-live="polite">
      <div className="spinner" />
      {message && <p className="spinner-label">{message}</p>}
    </div>
  );
}
