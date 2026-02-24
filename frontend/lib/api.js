const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

// Helper to get stored auth token
export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

// Helper to get stored user ID
export function getUserId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_id");
}

// ============= AUTH ENDPOINTS =============
export async function registerUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Registration failed");
  }

  const user = await response.json();
  // Store auth token and user ID locally
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", user.id);
    localStorage.setItem("user_id", user.id);
    localStorage.setItem("user_email", user.email);
  }
  return user;
}

export async function loginUser(email, password) {
  // For now, we'll use a simple approach: check if user exists and password matches
  // In production, implement a proper /login endpoint
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
  }

  const user = await response.json();
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", user.id);
    localStorage.setItem("user_id", user.id);
    localStorage.setItem("user_email", user.email);
  }
  return user;
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
  }
}

// ============= BOARD ENDPOINTS =============
export async function getBoard(boardId) {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch board");
  }

  return response.json();
}

export async function getAllBoards() {
  const response = await fetch(`${API_BASE_URL}/boards`);

  if (!response.ok) {
    throw new Error("Failed to fetch boards");
  }

  return response.json();
}

// ============= SUBMISSION ENDPOINTS =============
export async function submitActivity(userId, activityId, imageUrl = "") {
  const response = await fetch(`${API_BASE_URL}/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      activity_id: activityId,
      image_url: imageUrl || "https://via.placeholder.com/150",
      status: "pending"
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Submission failed");
  }

  return response.json();
}

// ============= USER PROGRESS ENDPOINTS =============
export async function getUserBoardProgress(userId, boardId) {
  const response = await fetch(
    `${API_BASE_URL}/boards/${boardId}/user-progress/${userId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user progress");
  }

  return response.json();
}

// Get all submissions for a user
export async function getUserSubmissions(userId) {
  const response = await fetch(`${API_BASE_URL}/submissions?user_id=${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch submissions");
  }

  return response.json();
}

// ============= ACTIVITIES ENDPOINTS =============
export async function getActivities() {
  const response = await fetch(`${API_BASE_URL}/activities`);

  if (!response.ok) {
    throw new Error("Failed to fetch activities");
  }

  return response.json();
}

export async function getActivity(activityId) {
  const response = await fetch(`${API_BASE_URL}/activities/${activityId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch activity");
  }

  return response.json();
}
