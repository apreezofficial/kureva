import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Kureva — Wish for it. Share it. Make it yours.",
  description: "Kureva makes it easy to collect the things you love, organize your wishes, and share them with the people who matter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-white selection:bg-accent/10 selection:text-accent">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
