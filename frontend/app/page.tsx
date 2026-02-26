"use client";

import { useRouter } from "next/dist/client/components/navigation";
import { useEffect } from "react";
import { useAuth } from "../lib/hooks";

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
    return <div>Loading...</div>;
  }
}
