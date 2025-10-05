import "./globals.css";

export const metadata = {
  title: "In Loving Memory of Alex – Afterman7",
  description: "Community memorial site for Alex (Afterman7)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]">
        {children}
      </body>
    </html>
  );
}
