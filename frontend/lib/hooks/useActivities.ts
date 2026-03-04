import { useState, useEffect, useCallback } from "react";
import { getActivities } from "@/lib/api";
import type { Activity } from "@/types";

interface UseActivitiesResult {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useActivities(): UseActivitiesResult {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

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
  }, [tick]);

  return { activities, loading, error, refetch };
}
