"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/hooks";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, loading } = useAuth(); // Assuming useAuth provides user and loading state
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login"); // Redirect to login if not authenticated
    }
  }, [loading, user, router]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking auth
  }

  if (!user) {
    return null; // Prevent rendering if user is not authenticated
  }

  return (
    <div className="main-layout">
      {children}
    </div>
  );
}