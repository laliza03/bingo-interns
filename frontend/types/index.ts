/**
 * types/index.ts
 *
 * Shared domain types used across the frontend.
 * These mirror the shape returned by the backend API.
 */

export interface User {
  id: string;
  email: string;
}

export interface DBActivity {
  id: string;
  title: string;
  description: string;
  isImageRequired: boolean;
  created_at: string;
  index: number;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  requiresImage: boolean;
  completed: boolean;
  image: File | null;
}

export interface Submission {
  id?: string;
  user_id: string;
  activity_id: string;
  image_url?: string;
  created_at?: string;
}
