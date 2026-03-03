"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = (): void => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="navbar">
      <Link href="/board" className="navbar-brand">
        🎯 Internship Bingo
      </Link>

      <div className="navbar-links">
        <Link href="/board">Board</Link>
        <Link href="/leaderboard">Leaderboard</Link>
      </div>

      <div className="navbar-user">
        {user && <span className="navbar-email">{user.email}</span>}
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
