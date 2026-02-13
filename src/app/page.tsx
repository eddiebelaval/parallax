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

        {/* ─── Hero ─── */}
        <NarrationSection
          id="hero"
          isComplete={isComplete}
          registerSection={narration.registerSection}
        >
          <div className="px-6 pt-20 sm:pt-32 pb-16 sm:pb-20 min-h-[80vh] flex flex-col justify-center">
            <div className="max-w-2xl mx-auto w-full">
              <p className="section-indicator mb-6">Real-time Conflict Resolution</p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-6">
                See the conversation{" "}
                you&apos;re actually having
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

        {/* ─── Divider ─── */}
        <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

        {/* ─── The Problem ─── */}
        <NarrationSection
          id="the-problem"
          isComplete={isComplete}
          registerSection={narration.registerSection}
        >
          <div className="px-6 py-16 sm:py-24">
            <div className="max-w-2xl mx-auto">
              <p className="section-indicator mb-6">The Problem</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl leading-[1.15] mb-10">
                Most conflicts never get help
              </h2>

              {/* Evidence cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="border border-border p-5 text-center">
                  <p className="font-mono text-3xl sm:text-4xl text-accent leading-none mb-2">$300</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600">
                    per hour for mediation
                  </p>
                </div>
                <div className="border border-border p-5 text-center">
                  <p className="font-mono text-3xl sm:text-4xl text-accent leading-none mb-2">6-18</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600">
                    months on therapy waitlists
                  </p>
                </div>
                <div className="border border-border p-5 text-center">
                  <p className="font-mono text-3xl sm:text-4xl text-accent leading-none mb-2">100%</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600">
                    of conflicts have two conversations
                  </p>
                </div>
              </div>

              <p className="text-ember-400 text-sm leading-relaxed text-center max-w-lg mx-auto">
                You can&apos;t read the label from inside the bottle.
                That&apos;s what Parallax is for.
              </p>
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
          <div className="px-6 py-16 sm:py-24">
            <div className="max-w-2xl mx-auto">
              <p className="section-indicator mb-6">How It Works</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl leading-[1.15] mb-10">
                Three layers of understanding
              </h2>

              {/* Visual nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                {/* Node 1: Speak */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full border border-accent/40 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-wider text-foreground mb-1">Speak</p>
                  <p className="text-ember-500 text-xs leading-relaxed">Voice or text — no filters, just honesty</p>
                </div>

                {/* Node 2: Analyze */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full border border-accent/40 flex items-center justify-center">
                    <span className="font-mono text-lg text-accent">14</span>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-wider text-foreground mb-1">Analyze</p>
                  <p className="text-ember-500 text-xs leading-relaxed">14 lenses see what&apos;s beneath</p>
                </div>

                {/* Node 3: Transform */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full border border-accent/40 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
                      <path d="M7 8l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 3v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M17 16l-5 5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-wider text-foreground mb-1">Transform</p>
                  <p className="text-ember-500 text-xs leading-relaxed">Raw words dissolve into understanding</p>
                </div>
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
          <div className="px-6 py-16 sm:py-24">
            <div className="max-w-2xl mx-auto">
              <p className="section-indicator mb-6">What Parallax Sees</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl leading-[1.15] mb-4">
                Watch a message transform
              </h2>
              <p className="text-muted text-sm leading-relaxed max-w-xl mb-8">
                Raw words dissolve. What crystallizes is the subtext, the blind spots,
                the unmet needs — and a translation the other person could actually hear.
              </p>

              {/* Remotion MeltDemo Player */}
              <div className="border border-border rounded-sm overflow-hidden mb-8">
                <MeltDemoPlayer />
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Temperature",
                  "X-Ray Scoreboard",
                  "Signal Rail",
                  "Session Summary",
                  "14 Lenses",
                  "NVC Translation",
                ].map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1 border border-border text-ember-500 font-mono text-[10px] uppercase tracking-wider"
                  >
                    {feature}
                  </span>
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

        {/* ─── Two Modes ─── */}
        <NarrationSection
          id="two-modes"
          isComplete={isComplete}
          registerSection={narration.registerSection}
        >
          <div className="px-6 py-16 sm:py-24">
            <div className="max-w-2xl mx-auto">
              <p className="section-indicator mb-6">Choose Your Mode</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl leading-[1.15] mb-4">
                Three ways to have the conversation
              </h2>
              <p className="text-muted text-sm leading-relaxed max-w-xl mb-10">
                Whether you&apos;re sitting next to each other, across the internet,
                or just need someone to talk to — Parallax adapts.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* In-Person */}
                <div className="border border-border border-t-2 border-t-accent p-5">
                  <div className="mb-4">
                    <ModePreview mode="in_person" />
                  </div>
                  <p className="font-mono text-sm uppercase tracking-wider text-accent mb-2">In-Person</p>
                  <p className="text-ember-400 text-xs leading-relaxed mb-3">
                    AI Conductor guides the conversation with adaptive 4-phase flow
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      "Voice-first input with real-time waveform",
                      "AI mediator conducts the conversation",
                      "X-Ray Scoreboard tracks discrete issues",
                      "Turn-based — knows when to intervene",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-ember-600 mt-1.5 flex-shrink-0" />
                        <span className="text-ember-500 text-xs leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Remote */}
                <div className="border border-border border-t-2 border-t-success p-5">
                  <div className="mb-4">
                    <ModePreview mode="remote" />
                  </div>
                  <p className="font-mono text-sm uppercase tracking-wider text-success mb-2">Remote</p>
                  <p className="text-ember-400 text-xs leading-relaxed mb-3">
                    Therapist Review — NVC analysis on every message, visible to both
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      "Each person on their own device",
                      "NVC analysis on every message",
                      "Full Melt animation and structured insight",
                      "Session summary when you're done",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-ember-600 mt-1.5 flex-shrink-0" />
                        <span className="text-ember-500 text-xs leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solo */}
                <div className="border border-border border-t-2 border-t-success p-5">
                  <div className="mb-4">
                    <ModePreview mode="solo" />
                  </div>
                  <p className="font-mono text-sm uppercase tracking-wider text-success mb-2">Solo</p>
                  <p className="text-ember-400 text-xs leading-relaxed mb-3">
                    1:1 with Parallax — a friend who listens, remembers, and shows up informed
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      "No second person needed",
                      "Parallax learns your communication style",
                      "Builds your profile over time",
                      "Your advocate in future two-person sessions",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-ember-600 mt-1.5 flex-shrink-0" />
                        <span className="text-ember-500 text-xs leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
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
