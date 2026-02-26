"use client";

import { useMemo, useState } from "react";
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
      <div className="board-header">
        <div>
          <p className="eyebrow">GLOW BINGO</p>
          <h2>My Activity Board</h2>
        </div>
        <div className="progress-pill progress-pill-compact">
          {completedCount}/25 complete
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="board-grid">
        {FALLBACK_TASKS.map((task, index) => {
          const activity: Activity = { id: `activity-${index}`, title: task };
          const done = completedActivityIds.has(activity.id);

          return (
            <BingoCell
              key={`${task}-${index}`}
              task={task}
              done={done}
              disabled={submitting}
              onClick={() => toggleTask(activity)}
            />
          );
        })}
      </div>

      <div style={{ marginTop: "16px", textAlign: "center" }}>
        <button
          className="btn btn-secondary"
          onClick={() => window.location.reload()}
          style={{ width: "100%", maxWidth: "200px" }}
        >
          Reset
        </button>
      </div>
    </section>
  );
}
