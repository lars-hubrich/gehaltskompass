import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Providers from "./providers";

export const metadata: Metadata = {
  title: "GehaltsKompass",
  description:
    "Unsere Website ermöglicht es dir, deine Gehaltsabrechnungen hochzuladen und zu speichern, um dir aufbereitete Graphen und Statistiken zu bieten. Mit KI-gestützten Antworten erhältst du wertvolle Informationen zu all deinen Gehaltsfragen, und unsere benutzerfreundliche Oberfläche sorgt für eine nahtlose Erfahrung auf allen Geräten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-200 text-gray-900">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
