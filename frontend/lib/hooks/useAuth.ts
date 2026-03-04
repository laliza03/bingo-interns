/**
 * lib/hooks/useAuth.ts
 *
 * Re-exports the shared auth context hook so existing imports
 * (`import { useAuth } from "@/lib/hooks"`) keep working.
 */
export { useAuthContext as useAuth } from "@/components/auth/AuthProvider";
