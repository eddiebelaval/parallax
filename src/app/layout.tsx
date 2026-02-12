"use client";

import { usePathname } from "next/navigation";
import { Source_Serif_4, Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import { ConversationalProvider, useConversationalPanel } from "@/contexts/ConversationalContext";
import { ConversationalPanel } from "@/components/ConversationalPanel";
import type { ConversationalMode } from "@/types/conversation";
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

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { isOpen, mode, openPanel, closePanel } = useConversationalPanel();
  const pathname = usePathname();

  // Route-aware default mode: Guide inside sessions, Explorer everywhere else
  const defaultMode: ConversationalMode = pathname.startsWith("/session/")
    ? "guide"
    : "explorer";

  const buttonLabel =
    defaultMode === "guide" ? "Get help with your session" : "Talk to Parallax";

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm tracking-widest uppercase text-accent">
              Parallax
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>

      {/* Conversational Layer — fixed "?" trigger button */}
      {!isOpen && (
        <button
          onClick={() => openPanel(defaultMode)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center font-mono text-lg text-muted hover:text-accent hover:border-accent transition-all"
          aria-label={buttonLabel}
        >
          ?
        </button>
      )}

      {/* Conversational Panel */}
      <ConversationalPanel
        mode={mode}
        isOpen={isOpen}
        onClose={closePanel}
      />
    </>
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
        className={`${sourceSerif.variable} ${sourceSans.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <ConversationalProvider>
          <LayoutShell>{children}</LayoutShell>
        </ConversationalProvider>
      </body>
    </html>
  );
}
