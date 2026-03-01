"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSubmitActivity, useUserSubmissions, useAuth } from "@/lib/hooks";
import { FALLBACK_TASKS } from "@/constants/tasks";
import BingoCell from "./BingoCell";
import type { Activity } from "@/types";

export default function BingoBoard() {
  const { user } = useAuth();
  const demoUser = user ?? { id: "demo-user", email: "demo@example.com" };

  const { submit: submitActivity, loading: submitting } = useSubmitActivity();
  const { submissions } = useUserSubmissions(demoUser?.id);

  const [error, setError] = useState<string | null>(null);

  // Auto-dismiss error toast after 4 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const completedActivityIds = useMemo<Set<string>>(
    () => new Set(submissions?.map((s) => s.activity_id) ?? []),
    [submissions],
  );

  const completedCount = completedActivityIds.size;

  const toggleTask = async (activity: Activity): Promise<void> => {
    if (!demoUser) return;
    try {
      const isCompleted = completedActivityIds.has(activity.id);
      if (!isCompleted) {
        await submitActivity(demoUser.id, activity.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <section className="board-card board-card-main">
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
      <div className="board-header">
        <div>
          <p className="eyebrow">GLOW BINGO</p>
          <h2>My Activity Board</h2>
        </div>
        <div className="progress-pill progress-pill-compact">{completedCount}/25 complete</div>
      </div>

      <div className="board-grid">
        {FALLBACK_TASKS.map((activity) => {
          const done = completedActivityIds.has(activity.id);

          return (
            <BingoCell
              key={activity.id}
              activity={activity}
              done={done}
              disabled={submitting}
              onClick={() => toggleTask(activity)}
            />
          );
        })}
      </div>

      <div style={{ marginTop: "16px", textAlign: "center" }}></div>
    </section>
  );
}
