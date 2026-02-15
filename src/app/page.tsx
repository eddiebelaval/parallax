"use client";

import { useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useNarrationController } from "@/hooks/useNarrationController";
import { NarrationPanel } from "@/components/landing/NarrationPanel";
import { NarrationStage } from "@/components/landing/NarrationStage";
import { TheDoor } from "@/components/landing/TheDoor";
import { HeroPreview } from "@/components/landing/HeroPreview";

// Lazy-load Remotion Player — heavy dep, only needed in "What Parallax Sees"
const MeltDemoPlayer = dynamic(() => import("@/components/landing/MeltDemoPlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-surface border border-border rounded-sm animate-pulse" />
  ),
});

/* --- Section Wrapper --- */

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

/* --- Page --- */

export default function Home() {
  const narration = useNarrationController();
  const isComplete = narration.phase === "complete";
  const isNarrating = narration.phase === "narrating";
  const shouldDim = isNarrating;

  // Dispatch narration phase to layout via custom event
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("parallax-narration-phase", { detail: narration.phase }),
    );
  }, [narration.phase]);

  // Listen for replay request from header (if any external trigger)
  useEffect(() => {
    function handleReplay() {
      narration.replayNarration();
    }
    window.addEventListener("parallax-replay-narration", handleReplay);
    return () => window.removeEventListener("parallax-replay-narration", handleReplay);
  }, [narration]);

  return (
    <div className="flex flex-1 flex-col">

      {/* Unified glass panel — pill, expanding, narrating, collapsing, complete */}
      <NarrationPanel
        phase={narration.phase}
        slidUp={narration.slidUp}
        onStart={narration.startNarration}
        onReplay={narration.replayNarration}
        isLandingPage={true}
        isSpeaking={narration.isSpeaking}
        narrationContent={
          <NarrationStage
            text={narration.displayedText}
            isTyping={narration.isTyping}
            isSpeaking={narration.isSpeaking}
            energy={narration.voiceEnergy}
            isMuted={narration.isMuted}
            onSkip={narration.skipToEnd}
            onToggleMute={narration.toggleMute}
          />
        }
        chatContent={null}
      />

      {/* Skip intro — visible during idle phase */}
      {narration.phase === "idle" && (
        <button
          onClick={narration.skipToEnd}
          className="fixed bottom-8 right-8 z-40 font-mono text-xs text-muted uppercase tracking-widest hover:text-foreground transition-colors px-4 py-2 border border-border rounded-lg bg-background/80 backdrop-blur-sm"
        >
          Skip intro
        </button>
      )}

      {/* Page content — dimmed during narration/chat, blur at top for focus */}
      <div className={`${shouldDim ? "content-dimmed" : ""} ${isNarrating ? "content-blur-top" : ""}`}>

        {/* --- 1. Hero: Centered Text That Scrolls Up --- */}
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

        {/* --- 2. The Shift: Temperature Showcase --- */}
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

        {/* --- Divider --- */}
        <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

        {/* --- 3. The Melt: What Parallax Sees --- */}
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

        {/* --- Divider --- */}
        <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

        {/* --- 4. The Door: Choose Your Path --- */}
        <NarrationSection
          id="the-door"
          isComplete={isComplete}
          registerSection={narration.registerSection}
        >
          <TheDoor />
        </NarrationSection>

        {/* --- 5. Footer: Built with Claude Code --- */}
        <section className="px-6 py-12 border-t border-border">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            {/* Built with Claude Code badge — ant walks on this! */}
            <div
              id="claude-code-badge"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 border border-border rounded-full bg-surface/50 backdrop-blur-sm relative"
            >
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Built with Claude Code
              </span>
            </div>

            <p className="text-ember-600 text-xs font-mono uppercase tracking-wider">
              Claude Code Hackathon, February 2026
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
