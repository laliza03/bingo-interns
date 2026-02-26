import { useState, useEffect } from "react";
import { getBoard, getAllBoards } from "@/lib/api";
import type { Board } from "@/types";

interface UseBoardResult {
  board: Board | null;
  loading: boolean;
  error: string | null;
}

interface UseBoardsResult {
  boards: Board[];
  loading: boolean;
  error: string | null;
}

export function useBoard(boardId: string | null): UseBoardResult {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState<boolean>(!!boardId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!boardId) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await getBoard(boardId);
        if (!cancelled) setBoard(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch board",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boardId]);

  return { board, loading, error };
}

export function useBoards(): UseBoardsResult {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getAllBoards();
        if (!cancelled) setBoards(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch boards",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { boards, loading, error };
}
