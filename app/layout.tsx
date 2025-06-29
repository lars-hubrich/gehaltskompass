import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AuthProvider from "./providers/AuthProvider";

export const metadata: Metadata = {
  title: "GehaltsKompass",
  description: "GehaltsKompass made by Telekom computer science Students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-200 text-gray-900">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
