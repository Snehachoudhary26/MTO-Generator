import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MTO Generator",
  description: "Generate Material Take-Off from piping isometric drawings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
