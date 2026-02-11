import type { Metadata } from "next";
import { Source_Serif_4, Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Parallax",
  description: "Real-time two-person conflict resolution",
};

/**
 * Blocking script that runs before paint to set the theme class.
 * Prevents flash of wrong theme on page load.
 * Default: light mode (matches user preference data).
 *
 * Security note: This is a static string literal with no user input.
 * dangerouslySetInnerHTML is safe here — the content is hardcoded.
 */
const THEME_INIT_SCRIPT = `(function(){var t=localStorage.getItem('parallax-theme')||'light';if(t==='light')document.documentElement.classList.add('light');else document.documentElement.classList.remove('light')})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Static theme init — no user input, safe from XSS */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${sourceSerif.variable} ${sourceSans.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-border px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm tracking-widest uppercase text-accent">
                Parallax
              </span>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
