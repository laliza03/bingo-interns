"use client";

import { useAuth } from "@/lib/hooks";

interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  completed: number;
  total: number;
}

const DUMMY_DATA: LeaderboardEntry[] = [
  {
    id: "1",
    name: "Priya Sharma",
    email: "priya.s@example.com",
    completed: 23,
    total: 25,
  },
  {
    id: "2",
    name: "Marcus Lee",
    email: "marcus.l@example.com",
    completed: 20,
    total: 25,
  },
  {
    id: "3",
    name: "Sofia Reyes",
    email: "sofia.r@example.com",
    completed: 19,
    total: 25,
  },
  {
    id: "4",
    name: "Jordan Mitchell",
    email: "jordan.m@example.com",
    completed: 17,
    total: 25,
  },
  {
    id: "5",
    name: "Aisha Okonkwo",
    email: "aisha.o@example.com",
    completed: 15,
    total: 25,
  },
  {
    id: "6",
    name: "Ethan Brooks",
    email: "ethan.b@example.com",
    completed: 12,
    total: 25,
  },
  {
    id: "7",
    name: "Lily Chen",
    email: "lily.c@example.com",
    completed: 10,
    total: 25,
  },
  {
    id: "8",
    name: "demo@example.com",
    email: "demo@example.com",
    completed: 7,
    total: 25,
  },
  {
    id: "9",
    name: "Noah Patel",
    email: "noah.p@example.com",
    completed: 5,
    total: 25,
  },
  {
    id: "10",
    name: "Emma Wilson",
    email: "emma.w@example.com",
    completed: 3,
    total: 25,
  },
];

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const RANK_CLASS: Record<number, string> = {
  1: "rank-gold",
  2: "rank-silver",
  3: "rank-bronze",
};

export default function Leaderboard() {
  const { user } = useAuth();

  const sorted = [...DUMMY_DATA].slice(0, 5).sort((a, b) => b.completed - a.completed);

  return (
    <section className="board-card leaderboard-card">
      {/* Header */}
      <div className="board-header">
        <div>
          <p className="eyebrow">GLOW BINGO</p>
          <h2>Leaderboard</h2>
        </div>
        <div className="progress-pill">{DUMMY_DATA.length} interns</div>
      </div>

      {/* Top 3 Podium */}
      <div className="podium">
        {sorted.slice(0, 3).map((entry, i) => {
          const rank = i + 1;
          const pct = Math.round((entry.completed / entry.total) * 100);
          const isMe = entry.email === user?.email;
          return (
            <div key={entry.id} className={`podium-card podium-${rank}${isMe ? " is-me" : ""}`}>
              <span className="podium-medal">{MEDAL[rank]}</span>
              <p className="podium-name">
                {entry.name}
                {isMe && <span className="you-badge">you</span>}
              </p>
              <p className="podium-score">
                {entry.completed}/{entry.total}
              </p>
              <div className="lb-bar-track">
                <div className="lb-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Ranking List */}
      <div className="lb-list">
        {sorted.map((entry, i) => {
          const rank = i + 1;
          const pct = Math.round((entry.completed / entry.total) * 100);
          const isMe = entry.email === user?.email;
          return (
            <div key={entry.id} className={`lb-row${isMe ? " is-me" : ""}${rank <= 3 ? " lb-row-top" : ""}`}>
              {/* Rank badge */}
              <span className={`lb-rank ${RANK_CLASS[rank] ?? ""}`}>{rank <= 3 ? MEDAL[rank] : rank}</span>

              {/* Name + email */}
              <div className="lb-identity">
                <span className="lb-name">
                  {entry.name}
                  {isMe && <span className="you-badge">you</span>}
                </span>
                <span className="lb-email">{entry.email}</span>
              </div>

              {/* Score */}
              <span className="lb-score">
                {entry.completed}
                <span className="lb-total">/{entry.total}</span>
              </span>

              {/* Progress bar */}
              <div className="lb-bar-track lb-bar-inline">
                <div className="lb-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
