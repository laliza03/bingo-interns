import { useState, useEffect } from "react";
import { getActivities } from "@/lib/api";
import type { Activity, DBActivity } from "@/types";

interface UseActivitiesResult {
  activities: DBActivity[];
  loading: boolean;
  error: string | null;
}

export function useActivities(): UseActivitiesResult {
  const [activities, setActivities] = useState<DBActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getActivities();
        if (!cancelled) setActivities(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch activities",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { activities, loading, error };
}
