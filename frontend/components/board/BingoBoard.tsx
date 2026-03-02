"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  useSubmitActivity,
  useUserSubmissions,
  useAuth,
  useActivities,
} from "@/lib/hooks";
import { FALLBACK_TASKS } from "@/constants/tasks";
import BingoCell from "./BingoCell";
import ActivityModal from "./ActivityModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Activity } from "@/types";

export default function BingoBoard() {
  const { user } = useAuth();
  const { submit, loading: submitting } = useSubmitActivity();
  const { submissions, refetch: refetchSubmissions } = useUserSubmissions(
    user?.id ?? null,
  );
  const {
    activities,
    loading: activitiesLoading,
    error: activitiesError,
  } = useActivities();

  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  // Optimistic set – instantly mark cells green before server round-trip confirms
  const [optimisticIds, setOptimisticIds] = useState<Set<string>>(new Set());

  const displayActivities = activities.length > 0 ? activities : FALLBACK_TASKS;

  // Surface API errors as a toast
  useEffect(() => {
    if (activitiesError) setError(activitiesError);
  }, [activitiesError]);

  // Auto-dismiss error toast after 4 s
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  // Merge server-known + optimistic completions
  const completedActivityIds = useMemo<Set<string>>(() => {
    const ids = new Set(submissions?.map((s) => s.activity_id) ?? []);
    optimisticIds.forEach((id) => ids.add(id));
    return ids;
  }, [submissions, optimisticIds]);

  const completedCount = completedActivityIds.size;

  const handleSubmit = useCallback(
    async (activityId: string, image: File | null): Promise<void> => {
      if (!user) return;

      setOptimisticIds((prev) => new Set(prev).add(activityId));

      try {
        if (image) {
          const { uploadSubmissionImage } =
            await import("@/lib/api/submissions");
          await uploadSubmissionImage(user.id, activityId, image);
        }

        await submit(user.id, activityId);
        refetchSubmissions();
      } catch (err) {
        setOptimisticIds((prev) => {
          const next = new Set(prev);
          next.delete(activityId);
          return next;
        });
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    },
    [user, submit, refetchSubmissions],
  );

  return (
    <section className="board-card board-card-main">
      {/* Error toast */}
      {error &&
        createPortal(
          <div className="toast-error">
            <span>{error}</span>
            <button className="toast-close" onClick={() => setError(null)}>
              ×
            </button>
          </div>,
          document.body,
        )}

      {/* Header */}
      <div className="board-header">
        <div>
          <p className="eyebrow">GLOW BINGO</p>
          <h2>
            {user?.name ? `${user.name}'s Activity Board` : "My Activity Board"}
          </h2>
        </div>
        <div className="progress-pill progress-pill-compact">
          {completedCount}/25 complete
        </div>
      </div>

      {/* Grid */}
      {activitiesLoading ? (
        <div className="board-grid-loader">
          <LoadingSpinner message="Loading activities…" size="lg" />
        </div>
      ) : (
        <div className="board-grid">
          {displayActivities.map((activity) => (
            <BingoCell
              key={activity.id}
              activity={activity}
              done={completedActivityIds.has(activity.id)}
              disabled={submitting}
              onClick={() => setSelectedActivity(activity)}
            />
          ))}
        </div>
      )}

      {/* Activity detail modal */}
      {selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          onSubmit={handleSubmit}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </section>
  );
}
