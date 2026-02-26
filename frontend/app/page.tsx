"use client";

import { useRouter } from "next/dist/client/components/navigation";
import { useEffect } from "react";
import { useAuth } from "../lib/hooks";

export default function HomePage() {
  const { user, loading } = useAuth(); // Get user and loading state from your auth hook
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login"); // Redirect to login if not authenticated
    } else {
      router.replace("/board"); // Redirect to board if authenticated
    }
  }, [loading, user, router]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking auth
  }
}
