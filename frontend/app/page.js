"use client";

import { useMemo, useState, useEffect } from "react";
import { useAuth, useSubmitActivity, useUserSubmissions } from "../lib/hooks";

// Fallback tasks for when board is not yet loaded from DB
const FALLBACK_TASKS = [
  "Morning stretch",
  "Hydrate with 2L water",
  "Read 20 pages",
  "Cook a new recipe",
  "Declutter one drawer",
  "Walk 8,000 steps",
  "Call a friend",
  "Meditate for 10 min",
  "Journal gratitude",
  "Try a new playlist",
  "No-sugar afternoon",
  "Sunset photo",
  "Plan tomorrow",
  "Learn one new word",
  "Clean your desk",
  "Do 20 squats",
  "Screen-free hour",
  "Pack healthy lunch",
  "Practice a hobby",
  "Do a random kindness",
  "Take a deep-breath break",
  "Review your goals",
  "Make your bed",
  "Write a positive note",
  "Dance to one song"
];

export default function HomePage() {
  // Demo mode: skip authentication, go straight to bingo board
  const [user, setUser] = useState({ id: "demo-user", email: "demo@example.com" });
  const { submit: submitActivity, loading: submitting } = useSubmitActivity();
  const { submissions, loading: submissionsLoading } = useUserSubmissions(user?.id);
  
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState(FALLBACK_TASKS);


  // Derive completed activity IDs from submissions
  const completedActivityIds = useMemo(
    () => new Set(submissions?.map((s) => s.activity_id) || []),
    [submissions]
  );

  const completedCount = completedActivityIds.size;

  // Demo mode: skip login

  // Toggle task completion by submitting/deleting submission
  const toggleTask = async (index, activity) => {
    if (!user) return;

    try {
      const isCompleted = completedActivityIds.has(activity.id);
      
      if (!isCompleted) {
        // Submit activity completion
        await submitActivity(user.id, activity.id);
      }
      // In production, you'd also handle deletion of submissions here
    } catch (err) {
      setError(err.message);
    }
  };

  // Demo mode: always show board
  return (
    <main className="app-shell">
      <div className="blob blob-top-left" />
      <div className="blob blob-bottom-right" />
      <section className="board-card">
        <div className="board-header">
          <div>
            <p className="eyebrow">GLOW BINGO</p>
            <h2>My Activity Board</h2>
          </div>
          <div className="progress-pill">{completedCount}/25 complete</div>
        </div>

        <div className="board-grid">
          {tasks.map((task, index) => {
            // For tracking, we'll use index as a simple activity ID for now
            const activity = { id: `activity-${index}`, title: task };
            const done = completedActivityIds.has(activity.id);

            return (
              <button
                type="button"
                key={`${task}-${index}`}
                className={`board-cell ${done ? "completed" : ""}`}
                onClick={() => toggleTask(index, activity)}
                aria-pressed={done}
                disabled={submitting}
              >
                <p className="task-title">{task}</p>
                <div className={`status-pill ${done ? "done" : ""}`}>
                  {done ? "✓ Done" : "Open"}
                </div>
              </button>
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
    </main>
  );
}
