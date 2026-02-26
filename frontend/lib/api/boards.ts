/**
 * lib/api/boards.ts
 */

import type { Board, BoardProgress } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export async function getBoard(boardId: string): Promise<Board> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}`);
  if (!response.ok) throw new Error("Failed to fetch board");
  return response.json();
}

export async function getAllBoards(): Promise<Board[]> {
  const response = await fetch(`${API_BASE_URL}/boards`);
  if (!response.ok) throw new Error("Failed to fetch boards");
  return response.json();
}

export async function getUserBoardProgress(
  userId: string,
  boardId: string,
): Promise<BoardProgress> {
  const response = await fetch(
    `${API_BASE_URL}/boards/${boardId}/user-progress/${userId}`,
  );
  if (!response.ok) throw new Error("Failed to fetch user progress");
  return response.json();
}
