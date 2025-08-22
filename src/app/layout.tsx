import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalActions from "@/components/GlobalActions";
import ColorInitializer from "@/components/ColorInitializer";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nordic Zeitarbeit GmbH",
  description: "Moderne Zeitarbeit Verwaltung - Effiziente Verwaltung von Zeitarbeitskräften, Kunden und Einsätzen",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#168bd1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-nordic-dark text-nordic-dark dark:text-nordic-light transition-colors duration-200 overflow-x-hidden min-h-screen`}
      >
        <ThemeProvider>
          <ColorInitializer />
          {children}
          <GlobalActions 
            excludeSelectors={['.global-actions', '[data-exclude-from-export="true"]']}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
