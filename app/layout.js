import { Inter } from "next/font/google"; // or any other font
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata = {
  title: "In Loving Memory of Alex — Afterman7",
  description: "A bright, kind, and creative soul whose presence touched countless lives.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
import "./globals.css";

export const metadata = {
  title: "In Loving Memory of Alex — Afterman7",
  description: "A bright, kind, and creative soul whose presence touched countless lives.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* NOTE: the 'page' class is used to anchor the footer at the bottom */}
      <body className="page">{children}</body>
    </html>
  );
}
