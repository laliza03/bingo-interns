/**
 * lib/api/activities.ts
 */

import type { Activity } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export async function getActivities(): Promise<Activity[]> {
  const response = await fetch(`${API_BASE_URL}/activities`);
  if (!response.ok) throw new Error("Failed to fetch activities");
  return response.json();
}

export async function getActivity(activityId: string): Promise<Activity> {
  const response = await fetch(`${API_BASE_URL}/activities/${activityId}`);
  if (!response.ok) throw new Error("Failed to fetch activity");
  return response.json();
}
