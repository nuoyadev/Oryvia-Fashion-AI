import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/client/state";

export const metadata: Metadata = {
  title: "Oryvia — Ton styliste IA personnel",
  description:
    "Oryvia comprend ton corps, ton visage, tes goûts, ton dressing et ton budget pour créer ton style idéal.",
  applicationName: "Oryvia",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Oryvia", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0e0d12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
