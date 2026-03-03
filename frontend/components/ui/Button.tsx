"use client";

import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonType = "button" | "submit" | "reset";

interface ButtonProps {
  variant?: ButtonVariant;
  type?: ButtonType;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  type = "button",
  disabled = false,
  className = "",
  onClick,
  children
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
