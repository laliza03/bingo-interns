import { useState, useEffect } from "react";
import { submitActivity as apiSubmit, getUserSubmissions } from "@/lib/api";
import type { Submission } from "@/types";

interface UseSubmitActivityResult {
  submit: (
    userId: string,
    activityId: string,
    imageUrl?: string,
  ) => Promise<Submission>;
  loading: boolean;
  error: string | null;
}

interface UseUserSubmissionsResult {
  submissions: Submission[];
  loading: boolean;
  error: string | null;
}

export function useSubmitActivity(): UseSubmitActivityResult {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (
    userId: string,
    activityId: string,
    imageUrl: string = "",
  ): Promise<Submission> => {
    setLoading(true);
    setError(null);
    try {
      const submission = await apiSubmit(userId, activityId, imageUrl);
      return submission;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}

export function useUserSubmissions(
  userId: string | null,
): UseUserSubmissionsResult {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      try {
        const data = await getUserSubmissions(userId);
        if (!cancelled) setSubmissions(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch submissions",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { submissions, loading, error };
}
