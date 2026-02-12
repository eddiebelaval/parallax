"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Cormorant_Garamond, Raleway, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import { CursorSpotlight } from "@/components/CursorSpotlight";
import type { NarrationPhase } from "@/hooks/useNarrationController";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const bitcount = localFont({
  src: "../fonts/BitcountPropSingle.ttf",
  variable: "--font-bitcount",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

function ThemeToggle() {
  const [isLight, setIsLight] = useState(true);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add("light");
      localStorage.setItem("parallax-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("parallax-theme", "dark");
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="p-2 rounded-lg border border-border text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
    >
      {isLight ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </button>
  );
}

function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSessionPage = pathname?.startsWith("/session/");
  const [narrationPhase, setNarrationPhase] = useState<NarrationPhase>("complete");

  // Listen for narration phase changes from page.tsx
  useEffect(() => {
    function handlePhase(e: Event) {
      const phase = (e as CustomEvent<NarrationPhase>).detail;
      setNarrationPhase(phase);
    }
    window.addEventListener("parallax-narration-phase", handlePhase);
    return () => window.removeEventListener("parallax-narration-phase", handlePhase);
  }, []);

  const isLandingNarrating = narrationPhase === "idle" || narrationPhase === "narrating" || narrationPhase === "chat";

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={`border-b border-border px-6 py-4 grid grid-cols-3 items-center transition-opacity duration-500 ${
          isLandingNarrating ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <a href="/" className="text-lg tracking-widest uppercase text-accent hover:text-foreground transition-colors" style={{ fontFamily: 'var(--font-bitcount)' }}>
            Parallax
          </a>
        </div>
        <div className="flex justify-center">
          {narrationPhase === "complete" && !isSessionPage && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("parallax-replay-narration"))}
              className="liquid-glass liquid-glass--sm rounded-full font-serif text-sm text-foreground/80 hover:text-foreground transition-colors"
            >
              <span className="liquid-glass__bg" />
              <span className="liquid-glass__fresnel" />
              <span className="relative z-10 px-5 py-1.5">Listen</span>
            </button>
          )}
        </div>
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

/**
 * Blocking script that runs before paint to set the theme class.
 * Prevents flash of wrong theme on page load.
 * Default: light mode (matches user preference data).
 *
 * NOTE: This uses a static string literal with zero user input.
 * The content is hardcoded — no dynamic values, no user data.
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
        <script
          // SAFE: static string literal, no user input — prevents theme flash
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body
        className={`${cormorantGaramond.variable} ${raleway.variable} ${ibmPlexMono.variable} ${bitcount.variable} antialiased`}
      >
        <CursorSpotlight />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
