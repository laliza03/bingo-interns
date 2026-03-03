"use client";

import type { Activity } from "@/types";

interface BingoCellProps {
  activity: Activity;
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
      <div className="cell-hover-overlay">
        <span>Open</span>
      </div>
    </button>
  );
}
