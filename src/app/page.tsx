"use client";

import { useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useNarrationController } from "@/hooks/useNarrationController";
import { useAuth } from "@/hooks/useAuth";
import { HelloButton } from "@/components/landing/HelloButton";
import { NarrationStage } from "@/components/landing/NarrationStage";
import { NarrationControls } from "@/components/landing/NarrationControls";
import { ParallaxAura } from "@/components/landing/ParallaxAura";
import { GlowChatInterface } from "@/components/landing/GlowChatInterface";
import { TheDoor } from "@/components/landing/TheDoor";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { LensGrid } from "@/components/landing/LensGrid";
import { ContextModeCards } from "@/components/landing/ContextModeCards";
import { ModePreview } from "@/components/landing/ModePreview";

// Lazy-load Remotion Player — heavy dep, only needed in "What Parallax Sees"
const MeltDemoPlayer = dynamic(() => import("@/components/landing/MeltDemoPlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-surface border border-border rounded-sm animate-pulse" />
  ),
});

/* ─── Section Wrapper ─── */

function NarrationSection({
  id,
  children,
  isComplete,
  registerSection,
}: {
  id: string;
  children: React.ReactNode;
  isComplete: boolean;
  registerSection: (id: string, el: HTMLElement | null) => void;
}) {
  const refCallback = useCallback(
    (el: HTMLElement | null) => registerSection(id, el),
    [id, registerSection],
  );

  return (
    <section
      ref={refCallback}
      data-narration-id={id}
      className={isComplete ? "" : "section-hidden"}
    >
      {children}
    </section>
  );
}

/* ─── Page ─── */

export default function Home() {
  const narration = useNarrationController();
  const { user } = useAuth();
  const isComplete = narration.phase === "complete";
  const isNarrating = narration.phase === "narrating";
  const isIdle = narration.phase === "idle";
  const isChat = narration.phase === "chat";
  const shouldDim = isNarrating || isChat;

  // Dispatch narration phase to layout via custom event
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("parallax-narration-phase", { detail: narration.phase }),
    );
  }, [narration.phase]);

  // Listen for replay request from header
  useEffect(() => {
    function handleReplay() {
      narration.replayNarration();
    }
    window.addEventListener("parallax-replay-narration", handleReplay);
    return () => window.removeEventListener("parallax-replay-narration", handleReplay);
  }, [narration]);

  return (
    <div className="flex flex-1 flex-col">

      {/* Hello button — only during idle */}
      <HelloButton
        visible={isIdle}
        onClick={narration.startNarration}
      />

      {/* Skip intro — visible during idle phase */}
      {isIdle && (
        <button
          onClick={narration.skipToEnd}
          className="fixed bottom-8 right-8 z-40 font-mono text-xs text-muted uppercase tracking-widest hover:text-foreground transition-colors px-4 py-2 border border-border rounded-lg bg-background/80 backdrop-blur-sm"
        >
          Skip intro
        </button>
      )}

      {/* Parallax Aura — the teal glow presence */}
      <ParallaxAura visible={narration.auraVisible} chatMode={isChat}>
        {isNarrating && (
          <>
            <NarrationStage
              text={narration.displayedText}
              isTyping={narration.isTyping}
              isSpeaking={narration.isSpeaking}
              waveform={narration.voiceWaveform}
              energy={narration.voiceEnergy}
            />
            <NarrationControls
              isMuted={narration.isMuted}
              onSkip={narration.skipToEnd}
              onToggleMute={narration.toggleMute}
            />
          </>
        )}
        {isChat && (
          <GlowChatInterface onClose={narration.exitChat} />
        )}
      </ParallaxAura>

      {/* Page content — dimmed during narration/chat */}
      <div className={shouldDim ? "content-dimmed" : ""}>

        {/* ─── Hero: Centered Text That Scrolls Up ─── */}
        <NarrationSection
          id="hero"
          isComplete={isComplete}
          registerSection={narration.registerSection}
        >
          <div className="relative min-h-[80vh] flex flex-col justify-center px-6 pt-20 sm:pt-32 pb-16 sm:pb-20">
            {/* Layered atmospheric backgrounds */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212, 160, 64, 0.08) 0%, transparent 60%),
                    radial-gradient(ellipse 60% 40% at 50% 100%, rgba(106, 171, 142, 0.06) 0%, transparent 70%)
                  `,
                }}
              />
              <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-accent/30 animate-pulse" />
              <div className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full bg-success/20 animate-pulse delay-700" />
              <div className="absolute bottom-1/4 right-1/4 w-1 h-1 rounded-full bg-accent/25 animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto w-full">
              <p className="section-indicator mb-6">Real-time Conflict Resolution</p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-6">
                See the conversation{" "}
                <span className="text-accent">you&apos;re actually having</span>
              </h1>
              <div className="w-12 h-px bg-accent mb-6" />
              <p className="text-muted text-base sm:text-lg leading-relaxed max-w-xl">
                14 analytical lenses. Real-time NVC translation.
                Two people talk — Parallax sees what&apos;s underneath.
              </p>
              <HeroPreview />
            </div>
          </div>
        </NarrationSection>

        {/* ─── Temperature Showcase ─── */}
        <NarrationSection
          id="temperature-showcase"
          isComplete={isComplete}
          registerSection={narration.registerSection}
        >
          <div className="px-6 py-16 sm:py-24">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Before: Hot temperature */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-temp-hot/20 to-temp-warm/10 rounded-lg blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative border border-ember-700 bg-surface/80 backdrop-blur-sm p-6 sm:p-8 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-temp-hot" />
                      <p className="font-mono text-xs uppercase tracking-wider text-temp-hot">
                        Before
                      </p>
                    </div>
                    <p className="text-lg text-foreground mb-4 leading-relaxed">
                      &ldquo;You never listen to me.&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-temp-hot rounded-full" />
                      </div>
                      <span className="font-mono text-[10px] text-temp-hot">0.85</span>
                    </div>
                    <p className="mt-3 text-xs text-ember-600 font-mono uppercase tracking-wider">
                      High emotional charge
                    </p>
                  </div>
                </div>

                {/* After: Cool temperature */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-temp-cool/20 to-success/10 rounded-lg blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative border border-ember-700 bg-surface/80 backdrop-blur-sm p-6 sm:p-8 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-temp-cool" />
                      <p className="font-mono text-xs uppercase tracking-wider text-temp-cool">
                        After
                      </p>
                    </div>
                    <p className="text-base text-temp-cool italic mb-4 leading-relaxed">
                      &ldquo;When I share something important and don&apos;t feel heard,
                      I feel invisible. I need to know my words matter to you.&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                        <div className="h-full w-[22%] bg-temp-cool rounded-full" />
                      </div>
                      <span className="font-mono text-[10px] text-temp-cool">0.22</span>
                    </div>
                    <p className="mt-3 text-xs text-ember-600 font-mono uppercase tracking-wider">
                      Structured understanding
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature trio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {[
                  { label: "14 Lenses", desc: "Multi-angle analysis" },
                  { label: "Real-time", desc: "As you speak" },
                  { label: "NVC Core", desc: "Structured translation" },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="text-center p-4 border border-border/50 rounded-lg backdrop-blur-sm bg-surface/30 hover:bg-surface/50 transition-colors"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <p className="font-mono text-sm text-accent mb-1">{item.label}</p>
                    <p className="text-xs text-ember-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </NarrationSection>

        {/* ─── Divider ─── */}
        <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

        {/* ─── The Problem ─── */}
        <NarrationSection
          id="the-problem"
          isComplete={isComplete}
          registerSection={narration.registerSection}
        >
          <div className="relative px-6 py-16 sm:py-24">
            {/* Subtle warning glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 60% 40% at 50% 50%, rgba(196, 92, 60, 0.03) 0%, transparent 70%)`,
                }}
              />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="section-indicator mb-6 justify-center">The Problem</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl leading-[1.15] mb-6">
                  Most conflicts never get help
                </h2>
                <p className="text-lg text-ember-400 max-w-2xl mx-auto leading-relaxed">
                  The systems that work are too expensive. The ones that are accessible have impossible wait times.
                  And meanwhile, the conversation you&apos;re not having is happening anyway.
                </p>
              </div>

              {/* Evidence cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-temp-hot/10 to-transparent rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative border border-border bg-surface/80 backdrop-blur-sm p-8 text-center rounded-lg">
                    <div className="mb-3">
                      <p className="font-mono text-4xl sm:text-5xl text-accent leading-none mb-1">$300</p>
                      <div className="w-12 h-px bg-accent/40 mx-auto" />
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600">
                      per hour for mediation
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-temp-warm/10 to-transparent rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative border border-border bg-surface/80 backdrop-blur-sm p-8 text-center rounded-lg">
                    <div className="mb-3">
                      <p className="font-mono text-4xl sm:text-5xl text-accent leading-none mb-1">6-18</p>
                      <div className="w-12 h-px bg-accent/40 mx-auto" />
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600">
                      months on therapy waitlists
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-temp-hot/10 to-transparent rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative border border-border bg-surface/80 backdrop-blur-sm p-8 text-center rounded-lg">
                    <div className="mb-3">
                      <p className="font-mono text-4xl sm:text-5xl text-accent leading-none mb-1">100%</p>
                      <div className="w-12 h-px bg-accent/40 mx-auto" />
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600">
                      of conflicts have two conversations
                    </p>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="max-w-2xl mx-auto text-center">
                <div className="relative p-8 border border-accent/20 bg-surface/60 backdrop-blur-sm rounded-lg">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent/40 border-4 border-background" />
                  <p className="text-xl sm:text-2xl text-ember-300 leading-relaxed font-serif italic">
                    You can&apos;t read the label from inside the bottle.
                  </p>
                  <p className="text-sm text-ember-600 font-mono uppercase tracking-wider mt-4">
                    That&apos;s what Parallax is for.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </NarrationSection>

        {/* ─── Divider ─── */}
        <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

        {/* ─── How It Works ─── */}
        <NarrationSection
          id="how-it-works"
          isComplete={isComplete}
          registerSection={narration.registerSection}
        >
          <div className="relative px-6 py-16 sm:py-24">
            {/* Cool analytical glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 70% 50% at 50% 50%, rgba(106, 171, 142, 0.05) 0%, transparent 70%)`,
                }}
              />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <p className="section-indicator mb-6 justify-center">How It Works</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl leading-[1.15] mb-6">
                  Three layers of understanding
                </h2>
                <p className="text-lg text-ember-400 max-w-2xl mx-auto leading-relaxed">
                  Your words flow through a sophisticated analytical system.
                  What emerges is clarity — the conversation underneath the conversation.
                </p>
              </div>

              {/* Visual flow nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
                {/* Node 1: Speak */}
                <div className="relative group text-center">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-24 h-24 mx-auto mb-5 rounded-full border-2 border-accent/40 bg-surface/80 backdrop-blur-sm flex items-center justify-center group-hover:border-accent/60 transition-colors">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-accent">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <p className="font-mono text-sm uppercase tracking-wider text-foreground">Speak</p>
                  </div>
                  <p className="text-ember-500 text-sm leading-relaxed max-w-xs mx-auto">
                    Voice or text — no filters, just honesty
                  </p>
                </div>

                {/* Node 2: Analyze */}
                <div className="relative group text-center">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-success/10 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-24 h-24 mx-auto mb-5 rounded-full border-2 border-success/40 bg-surface/80 backdrop-blur-sm flex items-center justify-center group-hover:border-success/60 transition-colors">
                    <span className="font-mono text-2xl text-success">14</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    <p className="font-mono text-sm uppercase tracking-wider text-foreground">Analyze</p>
                  </div>
                  <p className="text-ember-500 text-sm leading-relaxed max-w-xs mx-auto">
                    14 lenses see what&apos;s beneath
                  </p>
                </div>

                {/* Node 3: Transform */}
                <div className="relative group text-center">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-success/10 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-24 h-24 mx-auto mb-5 rounded-full border-2 border-success/40 bg-surface/80 backdrop-blur-sm flex items-center justify-center group-hover:border-success/60 transition-colors">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-success">
                      <path d="M7 8l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 3v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M17 16l-5 5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    <p className="font-mono text-sm uppercase tracking-wider text-foreground">Transform</p>
                  </div>
                  <p className="text-ember-500 text-sm leading-relaxed max-w-xs mx-auto">
                    Raw words dissolve into understanding
                  </p>
                </div>
              </div>

              {/* Connection lines */}
              <div className="relative -mt-8 mb-16">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* LensGrid */}
              <LensGrid />
            </div>
          </div>
        </NarrationSection>

        {/* ─── Divider ─── */}
        <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

        {/* ─── What Parallax Sees ─── */}
        <NarrationSection
          id="what-you-see"
          isComplete={isComplete}
          registerSection={narration.registerSection}
        >
          <div className="relative px-6 py-16 sm:py-24">
            {/* Melt animation glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(ellipse 60% 40% at 30% 50%, rgba(212, 160, 64, 0.04) 0%, transparent 70%),
                    radial-gradient(ellipse 50% 35% at 70% 50%, rgba(106, 171, 142, 0.04) 0%, transparent 70%)
                  `,
                }}
              />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="section-indicator mb-6 justify-center">What Parallax Sees</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl leading-[1.15] mb-6">
                  Watch a message transform
                </h2>
                <p className="text-lg text-ember-400 leading-relaxed max-w-2xl mx-auto mb-4">
                  Raw words dissolve. What crystallizes is the subtext, the blind spots,
                  the unmet needs — and a translation the other person could actually hear.
                </p>
                <p className="text-sm text-ember-600 font-mono uppercase tracking-wider">
                  The Melt — Live analysis in action
                </p>
              </div>

              {/* Remotion MeltDemo Player with frame */}
              <div className="relative mb-12">
                <div className="absolute -inset-1 bg-gradient-to-br from-accent/20 via-success/10 to-accent/20 rounded-lg blur-md opacity-50" />
                <div className="relative border-2 border-border bg-surface/80 backdrop-blur-sm rounded-lg overflow-hidden">
                  <MeltDemoPlayer />
                </div>
              </div>

              {/* Feature grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
                {[
                  { label: "Temperature", color: "accent" },
                  { label: "X-Ray Scoreboard", color: "success" },
                  { label: "Signal Rail", color: "accent" },
                  { label: "Session Summary", color: "success" },
                  { label: "14 Lenses", color: "accent" },
                  { label: "NVC Translation", color: "success" },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="group relative text-center p-3 border border-border bg-surface/50 backdrop-blur-sm rounded-lg hover:bg-surface/70 transition-colors"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full bg-${feature.color} mx-auto mb-2`} />
                    <span className="text-ember-500 font-mono text-[10px] uppercase tracking-wider group-hover:text-foreground transition-colors">
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </NarrationSection>

        {/* ─── Divider ─── */}
        <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

        {/* ─── Context Modes ─── */}
        <NarrationSection
          id="context-modes"
          isComplete={isComplete}
          registerSection={narration.registerSection}
        >
          <div className="px-6 py-16 sm:py-24">
            <div className="max-w-2xl mx-auto">
              <p className="section-indicator mb-6">Context Modes</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl leading-[1.15] mb-4">
                Every relationship is different
              </h2>
              <p className="text-muted text-sm leading-relaxed max-w-xl mb-10">
                Different relationships need different analytical frameworks.
                Parallax selects from 14 lenses based on the context you choose.
              </p>
              <ContextModeCards />
            </div>
          </div>
        </NarrationSection>

        {/* ─── Divider ─── */}
        <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

        {/* ─── Three Modes ─── */}
        <NarrationSection
          id="two-modes"
          isComplete={isComplete}
          registerSection={narration.registerSection}
        >
          <div className="px-6 py-16 sm:py-24">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <p className="section-indicator mb-6 justify-center">Mode Details</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl leading-[1.15] mb-4">
                  Three ways to have the conversation
                </h2>
                <p className="text-ember-400 text-base leading-relaxed max-w-2xl mx-auto">
                  Whether you&apos;re sitting next to each other, across the internet,
                  or just need someone to talk to — Parallax adapts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* In-Person */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative border border-border border-t-4 border-t-accent bg-surface/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg h-full flex flex-col">
                    <div className="mb-4 max-h-[140px] sm:max-h-none">
                      <ModePreview mode="in_person" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <p className="font-mono text-base uppercase tracking-wider text-accent">In-Person</p>
                    </div>
                    <p className="text-ember-400 text-sm leading-relaxed mb-4">
                      AI Conductor guides the conversation with adaptive 4-phase flow
                    </p>
                    <ul className="space-y-2 flex-1">
                      {[
                        "Voice-first input with real-time waveform",
                        "AI mediator conducts the conversation",
                        "X-Ray Scoreboard tracks discrete issues",
                        "Turn-based — knows when to intervene",
                      ].map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                          <span className="text-ember-500 text-xs leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Remote */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-success/20 to-success/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative border border-border border-t-4 border-t-success bg-surface/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg h-full flex flex-col">
                    <div className="mb-4 max-h-[140px] sm:max-h-none">
                      <ModePreview mode="remote" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <p className="font-mono text-base uppercase tracking-wider text-success">Remote</p>
                    </div>
                    <p className="text-ember-400 text-sm leading-relaxed mb-4">
                      Therapist Review — NVC analysis on every message, visible to both
                    </p>
                    <ul className="space-y-2 flex-1">
                      {[
                        "Each person on their own device",
                        "NVC analysis on every message",
                        "Full Melt animation and structured insight",
                        "Session summary when you're done",
                      ].map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-success mt-1.5 flex-shrink-0" />
                          <span className="text-ember-500 text-xs leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Solo */}
                <div className="relative group md:col-span-2 lg:col-span-1">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-success/20 to-success/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative border border-border border-t-4 border-t-success bg-surface/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg h-full flex flex-col">
                    <div className="mb-4 max-h-[140px] sm:max-h-none">
                      <ModePreview mode="solo" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <p className="font-mono text-base uppercase tracking-wider text-success">Solo</p>
                    </div>
                    <p className="text-ember-400 text-sm leading-relaxed mb-4">
                      1:1 with Parallax — a friend who listens, remembers, and shows up informed
                    </p>
                    <ul className="space-y-2 flex-1">
                      {[
                        "No second person needed",
                        "Parallax learns your communication style",
                        "Builds your profile over time",
                        "Your advocate in future two-person sessions",
                      ].map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-success mt-1.5 flex-shrink-0" />
                          <span className="text-ember-500 text-xs leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </NarrationSection>

        {/* ─── Divider ─── */}
        <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

        {/* ─── Intelligence Network ─── */}
        <NarrationSection
          id="intelligence-network"
          isComplete={isComplete}
          registerSection={narration.registerSection}
        >
          <div className="px-6 py-16 sm:py-24">
            <div className="max-w-2xl mx-auto">
              <p className="section-indicator mb-6">Intelligence Network</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl leading-[1.15] mb-4">
                Teach Parallax how you communicate
              </h2>
              <p className="text-muted text-sm leading-relaxed max-w-xl mb-8">
                Complete a 10-minute conversational interview. Parallax extracts your
                communication patterns — attachment style, conflict mode, emotional
                regulation — and uses them to deliver sharper, more personalized
                analysis in every session.
              </p>

              <Link
                href={user ? "/interview" : "/auth"}
                className="inline-block px-6 py-3 border border-accent text-accent font-mono text-sm uppercase tracking-wider hover:bg-accent/10 transition-colors mb-8"
              >
                Build Your Profile
              </Link>

              <div className="flex flex-wrap gap-2 mb-6">
                {["9 Signal Types", "4-Phase Interview", "Session Enrichment"].map((pill) => (
                  <span
                    key={pill}
                    className="px-3 py-1 border border-border text-ember-500 font-mono text-[10px] uppercase tracking-wider"
                  >
                    {pill}
                  </span>
                ))}
              </div>

              <p className="text-ember-600 font-mono text-[10px] uppercase tracking-widest">
                Free. Private. Encrypted.
              </p>
            </div>
          </div>
        </NarrationSection>

        {/* ─── Divider ─── */}
        <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

        {/* ─── The Door ─── */}
        <NarrationSection
          id="the-door"
          isComplete={isComplete}
          registerSection={narration.registerSection}
        >
          <TheDoor onTalkToParallax={narration.enterChat} />
        </NarrationSection>

        {/* ─── Footer ─── */}
        <section className="px-6 py-12 border-t border-border">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <p className="text-ember-600 text-xs font-mono uppercase tracking-wider">
              Built for the Claude Code Hackathon, February 2026
            </p>
            <p className="text-ember-700 text-xs">
              14 analytical lenses | 6 context modes | Zero conversations stored beyond the session
            </p>
            <p className="text-ember-700 text-xs">
              Built by Eddie Belaval / id8Labs — powered by Claude Opus 4.6
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
