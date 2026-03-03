import BingoBoard from "@/components/board/BingoBoard";
import Leaderboard from "@/components/board/Leaderboard";

export default function BoardPage() {
  return (
    <main className="main-dual-panels">
      <BingoBoard />
      <Leaderboard />
    </main>
  );
}
