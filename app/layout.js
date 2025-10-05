import "./globals.css";

export const metadata = {
  title: "In Loving Memory of Alex — Afterman7",
  description: "A loving and beautifully dempathetic, kind, and creative soul whose presence touched countless lives.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
