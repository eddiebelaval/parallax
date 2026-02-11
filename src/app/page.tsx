"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { isValidRoomCode } from "@/lib/room-code";
import type { SessionMode } from "@/types/database";

/* ─── Scroll Reveal ─── */

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ─── Page ─── */

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState<SessionMode | null>(null);

  async function handleCreate(mode: SessionMode) {
    setCreating(mode);
    setError("");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) {
        setError("Failed to create session");
        return;
      }
      const session = await res.json();
      router.push(`/session/${session.room_code}`);
    } catch {
      setError("Failed to create session");
    } finally {
      setCreating(null);
    }
  }

  function handleJoin() {
    const trimmed = joinCode.trim().toUpperCase();
    if (!isValidRoomCode(trimmed)) {
      setError("Enter a valid 6-character room code");
      return;
    }
    setError("");
    router.push(`/session/${trimmed}`);
  }

  return (
    <div className="flex flex-1 flex-col">

      {/* ─── Hero ─── */}
      <section className="px-6 pt-20 sm:pt-32 pb-20 sm:pb-28">
        <div className="max-w-2xl mx-auto hero-stagger">
          <p className="section-indicator mb-6">Real-time Conflict Resolution</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-6">
            See the conversation{" "}
            you&apos;re actually having
          </h1>
          <div className="w-12 h-px bg-accent mb-8" />
          <p className="text-muted text-base sm:text-lg leading-relaxed max-w-xl">
            When two people argue, there are always two conversations happening —
            the words on the surface, and the feelings underneath. Parallax gives
            you X-ray vision into both.
          </p>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

      {/* ─── The Problem ─── */}
      <section className="px-6 py-16 sm:py-24">
        <Reveal>
          <div className="max-w-2xl mx-auto">
            <p className="section-indicator mb-6">The Problem</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl leading-[1.15] mb-8">
              Most conflicts never get help
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-start">
              <div className="hidden sm:block">
                <p className="font-mono text-4xl md:text-5xl text-accent leading-none">$300</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600 mt-1">per hour</p>
              </div>
              <div className="space-y-4 text-ember-400 text-sm leading-relaxed">
                <p>
                  Professional mediation costs $300-500/hr. Therapy waitlists stretch for months.
                  Most people just keep arguing the same way — talking past each other, building
                  resentment, never seeing the pattern.
                </p>
                <p>
                  The problem isn&apos;t that people don&apos;t care. It&apos;s that in the heat of
                  a conflict, nobody can see their own blind spots. You can&apos;t read the label
                  from inside the bottle.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Divider ─── */}
      <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

      {/* ─── How It Works ─── */}
      <section className="px-6 py-16 sm:py-24">
        <Reveal>
          <div className="max-w-2xl mx-auto">
            <p className="section-indicator mb-6">How It Works</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl leading-[1.15] mb-10">
              Three layers of understanding
            </h2>
            <div className="space-y-8 relative">
              {/* Vertical connecting line */}
              <div className="absolute left-3 top-4 bottom-4 w-px bg-border hidden sm:block" />
              <ProcessStep
                number="01"
                title="You speak your truth"
                description="Each person takes turns expressing what they feel — by typing or speaking out loud. No filters, no performance. Just honesty."
              />
              <ProcessStep
                number="02"
                title="Claude sees what's beneath"
                description="Every message is analyzed through the lens of Nonviolent Communication. Claude identifies the subtext, the blind spots, the unmet needs, and rewrites the message in a way the other person could actually hear."
              />
              <ProcessStep
                number="03"
                title="The conversation transforms"
                description="Your raw words dissolve and reform into structured insight — a visual transformation we call The Melt. What was defensive becomes vulnerable. What was accusation becomes need."
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Divider ─── */}
      <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

      {/* ─── What You See ─── */}
      <section className="px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <p className="section-indicator mb-6">What You See</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl leading-[1.15] mb-10">
              Every message, inside and out
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Reveal delay={0}>
              <FeatureCard
                label="Subtext"
                description="What they're really saying beneath the words — the emotional translation, direct and compassionate."
              />
            </Reveal>
            <Reveal delay={60}>
              <FeatureCard
                label="Blind Spots"
                description="Patterns the speaker can't see — defensive framing, assumptions, absolute language — served as invitations, not judgments."
              />
            </Reveal>
            <Reveal delay={120}>
              <FeatureCard
                label="Unmet Needs"
                description="The universal human needs driving the emotion — respect, safety, autonomy, to be seen. Named precisely."
              />
            </Reveal>
            <Reveal delay={180}>
              <FeatureCard
                label="NVC Translation"
                description="The message rewritten using Nonviolent Communication — vulnerable, warm, human. Not clinical. Something you'd actually say."
              />
            </Reveal>
            <Reveal delay={240}>
              <FeatureCard
                label="Temperature"
                description="A 0-1 emotional charge reading on every message. Track the heat of the conversation in real-time through a color-coded timeline."
              />
            </Reveal>
            <Reveal delay={300}>
              <FeatureCard
                label="X-Ray Scoreboard"
                description="In-person mode tracks discrete issues as they're raised. Watch cards turn green (addressed) or red (made worse) as the conversation progresses."
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

      {/* ─── In Practice ─── */}
      <section className="px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <p className="section-indicator mb-6">In Practice</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl leading-[1.15] mb-10">
              A moment from a real session
            </h2>
          </Reveal>

          {/* Example message with analysis */}
          <Reveal delay={100}>
            <div className="border border-border">
              {/* Raw message */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-blue-400">Sarah</span>
                  <span className="font-mono text-[10px] text-ember-700">2:34 PM</span>
                  <span className="ml-auto px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-temp-warm border border-temp-warm/30">
                    0.72
                  </span>
                </div>
                <p className="text-sm leading-relaxed">
                  &ldquo;You always say you&apos;ll help but then nothing changes. I&apos;m tired of being
                  the only one who cares about this house.&rdquo;
                </p>
              </div>

              {/* Analysis divider */}
              <div className="flex items-center gap-3 px-4 sm:px-6">
                <div className="flex-1 h-px bg-accent/30" />
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent">
                  Parallax Analysis
                </span>
                <div className="flex-1 h-px bg-accent/30" />
              </div>

              {/* Analysis sections */}
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600 mb-1">Subtext</p>
                  <p className="text-ember-400 text-xs leading-relaxed">
                    I keep putting my trust in your promises and getting let down. I&apos;m not just frustrated about chores — I&apos;m questioning whether my needs matter to you.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600 mb-1">Blind Spots</p>
                  <p className="text-ember-400 text-xs leading-relaxed">
                    &ldquo;Always&rdquo; and &ldquo;only one who cares&rdquo; are absolutes that erase any effort the other person has made — even if it wasn&apos;t enough.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600 mb-1">NVC Translation</p>
                  <p className="text-temp-cool text-xs leading-relaxed italic">
                    &ldquo;When we agree on something and it doesn&apos;t happen, I feel hurt and invisible. I need to know that my time and energy matter. Could we make a concrete plan together — one we both actually commit to?&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-ember-600 text-xs font-mono uppercase tracking-wider text-center mt-6">
              Same person. Same feeling. Completely different conversation.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="mx-6"><div className="max-w-2xl mx-auto h-px bg-border" /></div>

      {/* ─── Two Modes ─── */}
      <section className="px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <p className="section-indicator mb-6">Choose Your Mode</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl leading-[1.15] mb-4">
              Two ways to have the conversation
            </h2>
            <p className="text-muted text-sm leading-relaxed max-w-xl mb-10">
              Whether you&apos;re sitting next to each other or across the internet,
              Parallax adapts to how you need to talk.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <ModeCard
                title="In-Person"
                description="Same device, shared screen"
                features={[
                  "Guided onboarding — set names, context, goals",
                  "Single shared view — no split screen",
                  "X-Ray Scoreboard tracks issues live",
                  "Turn-based — one person speaks at a time",
                ]}
                onClick={() => handleCreate("in_person")}
                loading={creating === "in_person"}
                disabled={creating !== null}
                accent="orange"
              />
              <ModeCard
                title="Remote"
                description="Different devices, split screen"
                features={[
                  "Share a 6-character room code",
                  "Split-screen — each person has their own panel",
                  "NVC analysis on every message",
                  "Session summary when you're done",
                ]}
                onClick={() => handleCreate("remote")}
                loading={creating === "remote"}
                disabled={creating !== null}
                accent="teal"
              />
            </div>
          </Reveal>

          {/* Join existing session */}
          <Reveal delay={200}>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-muted font-mono text-xs uppercase tracking-wider">
                or join an existing session
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="max-w-sm mx-auto space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase().slice(0, 6));
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  placeholder="ROOM CODE"
                  maxLength={6}
                  className="flex-1 px-4 py-4 bg-surface border border-border text-foreground font-mono text-sm tracking-widest text-center rounded placeholder:text-ember-600 focus:border-ember-600 focus:outline-none transition-colors"
                />
                <button
                  onClick={handleJoin}
                  className="px-6 py-4 border border-border text-foreground font-mono text-sm uppercase tracking-wider rounded hover:border-ember-600 transition-colors"
                >
                  Join
                </button>
              </div>
              {error && (
                <p className="text-accent font-mono text-xs text-center">{error}</p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <section className="px-6 py-12 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-ember-600 text-xs font-mono uppercase tracking-wider mb-2">
            Built for the Claude Code Hackathon
          </p>
          <p className="text-ember-700 text-xs">
            Parallax uses Claude Opus 4.6 for NVC analysis. No conversations are stored beyond the session.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ─── Sub-components ─── */

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 relative">
      <div className="flex-shrink-0 w-6 flex justify-center">
        <span className="font-mono text-[10px] text-accent tracking-widest pt-1">{number}</span>
      </div>
      <div>
        <p className="font-mono text-sm uppercase tracking-wider text-foreground mb-1.5">
          {title}
        </p>
        <p className="text-ember-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="px-4 py-4 border border-border hover:border-ember-600 transition-colors">
      <p className="font-mono text-xs uppercase tracking-wider text-accent mb-1.5">
        {label}
      </p>
      <p className="text-ember-400 text-xs leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function ModeCard({
  title,
  description,
  features,
  onClick,
  loading,
  disabled,
  accent = "orange",
}: {
  title: string;
  description: string;
  features: string[];
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  accent?: "orange" | "teal";
}) {
  const topBorder = accent === "orange"
    ? "border-t-accent"
    : "border-t-success";
  const hoverText = accent === "orange"
    ? "group-hover:text-accent"
    : "group-hover:text-success";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group text-left border border-border border-t-2 ${topBorder} hover:border-ember-600 transition-colors disabled:opacity-60 flex flex-col`}
    >
      <div className="px-5 py-4 border-b border-border">
        <p className="font-mono text-sm uppercase tracking-wider text-foreground mb-1">
          {loading ? "Creating..." : title}
        </p>
        <p className="text-muted text-sm">{description}</p>
      </div>
      <div className="px-5 py-3 flex-1">
        <ul className="space-y-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-ember-600 mt-1.5 flex-shrink-0" />
              <span className="text-ember-500 text-xs leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-5 py-3 border-t border-border">
        <span className={`font-mono text-[10px] uppercase tracking-widest text-ember-600 ${hoverText} transition-colors`}>
          Start session
        </span>
      </div>
    </button>
  );
}
