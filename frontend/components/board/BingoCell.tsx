"use client";

import type { Activity, DBActivity } from "@/types";

interface BingoCellProps {
  activity: DBActivity;
  done: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function BingoCell({
  activity,
  done,
  disabled,
  onClick,
}: BingoCellProps) {
  return (
    <button
      type="button"
      className={`board-cell ${done ? "completed" : ""}`}
      onClick={onClick}
      aria-pressed={done}
      disabled={disabled}
    >
      <p className="task-title">{activity.title}</p>
      {done && <span className="cell-done-label">✓ Done</span>}
      {done && <div className="cell-check-badge">✓</div>}
      <div className="cell-hover-overlay">
        <span>Open</span>
      </div>
    </button>
  );
}
