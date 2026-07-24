import "./globals.css";

export const metadata = {
  title: "Shelved",
  description: "Let RNG pick your game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
