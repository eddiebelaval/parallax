"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Cormorant_Garamond, Raleway, IBM_Plex_Mono } from "next/font/google";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import localFont from "next/font/local";
import { CursorSpotlight } from "@/components/CursorSpotlight";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FloatingHelpButton } from "@/components/FloatingHelpButton";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { FooterAnt } from "@/components/FooterAnt";
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

function AuthSlot() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href="/auth"
        className="font-mono text-xs text-muted hover:text-foreground transition-colors"
      >
        Sign In
      </Link>
    );
  }

  const initial = (user.user_metadata?.display_name?.[0] ?? user.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/home"
        className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center font-mono text-xs"
      >
        {initial}
      </Link>
      <button
        onClick={() => signOut()}
        className="font-mono text-xs text-muted hover:text-foreground transition-colors"
      >
        Sign Out
      </button>
    </div>
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

  const isLandingNarrating = narrationPhase === "idle" || narrationPhase === "expanding" || narrationPhase === "narrating" || narrationPhase === "collapsing" || narrationPhase === "chat";

  const { user } = useAuth();
  const isAuthenticated = !!user;
  const isLandingPage = pathname === "/";

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header
        className={`border-b border-border px-6 py-3 flex items-center justify-between transition-opacity duration-500 flex-shrink-0 ${
          isLandingNarrating ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <a href="/" className="text-lg tracking-widest uppercase text-accent hover:text-foreground transition-colors" style={{ fontFamily: 'var(--font-bitcount)' }}>
            Parallax
          </a>
          {isAuthenticated && !isSessionPage && (
            <nav className="hidden sm:flex items-center gap-4">
              <Link
                href="/home"
                className={`font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  pathname === "/home" ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                Home
              </Link>
              <Link
                href="/profile"
                className={`font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  pathname === "/profile" ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className={`font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  pathname === "/settings" ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                Settings
              </Link>
            </nav>
          )}
        </div>

        {/* Center: spacer (NarrationPanel owns the pill in complete state) */}
        <div className="flex justify-center" />

        {/* Right: Auth + Theme */}
        <div className="flex items-center gap-3">
          <AuthSlot />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">{children}</main>
      <FloatingHelpButton />
      {/* Footer — visible on non-session pages */}
      {!isSessionPage && (
        <footer className="border-t border-border px-6 py-3 flex items-center justify-between flex-shrink-0">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
            Parallax by id8Labs
          </span>
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <Link href="/home" className="font-mono text-[9px] uppercase tracking-widest text-muted hover:text-foreground transition-colors">
                  Home
                </Link>
                <Link href="/profile" className="font-mono text-[9px] uppercase tracking-widest text-muted hover:text-foreground transition-colors">
                  Profile
                </Link>
                <Link href="/settings" className="font-mono text-[9px] uppercase tracking-widest text-muted hover:text-foreground transition-colors">
                  Settings
                </Link>
              </>
            )}
            <span className="font-mono text-[9px] tracking-widest text-ember-700">
              Claude Code Hackathon 2026
            </span>
          </div>
        </footer>
      )}
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
        <FooterAnt allowedPaths={["/", "/profile", "/settings"]} />
        <SettingsProvider>
          <LayoutShell>{children}</LayoutShell>
        </SettingsProvider>
      </body>
    </html>
  );
}
