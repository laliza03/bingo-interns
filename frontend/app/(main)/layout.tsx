"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/hooks";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return <LoadingSpinner message="Loading your board…" size="lg" />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {children}
      <div className="main-signout-wrapper">
        <button
          type="button"
          className="btn btn-primary main-signout-btn"
          onClick={async () => {
            await logout();
            router.replace("/login");
          }}
        >
          Sign out
        </button>
      </div>
    </>
  );
}
