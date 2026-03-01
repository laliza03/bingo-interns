/**
 * lib/api/submissions.ts
 */

import type { Submission } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export async function submitActivity(userId: string, activityId: string, imageUrl: string = ""): Promise<Submission> {
  const response = await fetch(`${API_BASE_URL}/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      activity_id: activityId,
      image_url: imageUrl || "image place holder text",
      status: "pending",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Submission failed");
  }

  return response.json();
}

export async function getUserSubmissions(userId: string): Promise<Submission[]> {
  const response = await fetch(`${API_BASE_URL}/submissions?user_id=${userId}`);
  if (!response.ok) throw new Error("Failed to fetch submissions");
  return response.json();
}
