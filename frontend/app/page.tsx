"use client";

import { useRouter } from "next/dist/client/components/navigation";
import { useEffect } from "react";
import { useAuth } from "../lib/hooks";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else {
      router.replace("/board");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="loading-screen">
        <LoadingSpinner message="Loading your board…" size="lg" />
      </div>
    );
  }
}
