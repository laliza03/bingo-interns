import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Internship Bingo",
  description: "Intelcom Internship Bingo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="app-shell">
          <div className="blob blob-top-left" />
          <div className="blob blob-bottom-right" />
          {children}
        </main>
      </body>
    </html>
  );
}
