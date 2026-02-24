import { useState, useEffect } from "react";
import * as api from "./api";

/**
 * Hook to manage authentication state
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const userId = api.getUserId();
    const userEmail = typeof window !== "undefined" ? localStorage.getItem("user_email") : null;

    if (userId && userEmail) {
      setUser({ id: userId, email: userEmail });
    }
    setLoading(false);
  }, []);

  const register = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await api.registerUser(email, password);
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await api.loginUser(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logoutUser();
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isLoggedIn: !!user
  };
}

/**
 * Hook to fetch a bingo board with activities
 */
export function useBoard(boardId) {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(boardId ? true : false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!boardId) return;

    const fetchBoard = async () => {
      try {
        setLoading(true);
        const data = await api.getBoard(boardId);
        setBoard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  return { board, loading, error };
}

/**
 * Hook to fetch all boards
 */
export function useBoards() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await api.getAllBoards();
        setBoards(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  return { boards, loading, error };
}

/**
 * Hook to submit an activity completion
 */
export function useSubmitActivity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (userId, activityId, imageUrl = "") => {
    setLoading(true);
    setError(null);
    try {
      const submission = await api.submitActivity(userId, activityId, imageUrl);
      return submission;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}

/**
 * Hook to fetch user submissions
 */
export function useUserSubmissions(userId) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(userId ? true : false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchSubmissions = async () => {
      try {
        const data = await api.getUserSubmissions(userId);
        setSubmissions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [userId]);

  return { submissions, loading, error };
}
