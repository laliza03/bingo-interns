import "./globals.css";

export const metadata = {
  title: "Internship Bingo",
  description: "Intelcom Internship Bingo"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
