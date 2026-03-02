/**
 * lib/api/leaderboard.ts
 */

export interface LeaderboardEntry {
  user_id: string;
  name: string | null;
  completed_activities: number;
  rank: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export async function getTopUsers(
  limit: number = 5,
): Promise<LeaderboardEntry[]> {
  const response = await fetch(
    `${API_BASE_URL}/leaderboard/top?limit=${limit}`,
  );
  if (!response.ok) throw new Error("Failed to fetch leaderboard");
  return response.json();
}
