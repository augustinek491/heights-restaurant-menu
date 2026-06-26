import type { Metadata } from "next";
import "./globals.css";

// Same Google Fonts <link> setup as site/index.html — Fraunces (display),
// Work Sans (body), Space Mono (prices/utility). Loaded via a real <link>
// tag (not next/font) to mirror the prototype's head exactly.
export const metadata: Metadata = {
  title: "Heights Restaurant — Menu",
  description: "Heights Restaurant at Glass Heights Apartments — digital menu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500;1,9..144,600&family=Work+Sans:ital,wght@0,400;0,500;1,400&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
