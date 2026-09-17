import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORGE3D",
  description: "AI-powered 3D model generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}