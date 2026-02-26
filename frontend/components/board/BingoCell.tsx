"use client";

interface BingoCellProps {
  task: string;
  done: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function BingoCell({ task, done, disabled, onClick }: BingoCellProps) {
  return (
    <button
      type="button"
      className={`board-cell ${done ? "completed" : ""}`}
      onClick={onClick}
      aria-pressed={done}
      disabled={disabled}
    >
      <p className="task-title">{task}</p>
      <div className={`status-pill ${done ? "done" : ""}`}>
        {done ? "✓ Done" : "Open"}
      </div>
    </button>
  );
}
