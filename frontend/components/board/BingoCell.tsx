"use client";

import { memo } from "react";
import type { Activity } from "@/types";

interface BingoCellProps {
  activity: Activity;
  done: boolean;
  disabled: boolean;
  onClick: () => void;
}

function BingoCellInner({ activity, done, disabled, onClick }: BingoCellProps) {
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

const BingoCell = memo(BingoCellInner);
export default BingoCell;
