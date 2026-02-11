"use client";

import { useState, useCallback } from "react";
import { VoiceInput } from "@/components/VoiceInput";
import type { Session, OnboardingStep, OnboardingContext } from "@/types/database";

interface OnboardingFlowProps {
  session: Session;
  roomCode: string;
  advanceOnboarding: (payload: Record<string, unknown>) => Promise<Session | null>;
}

const STEP_LABELS: Record<string, { number: string; title: string; subtitle: string }> = {
  introductions: {
    number: "01",
    title: "Introductions",
    subtitle: "Who's here today?",
  },
  set_stage: {
    number: "02",
    title: "Set the Stage",
    subtitle: "What are we trying to work through?",
  },
  set_goals: {
    number: "03",
    title: "Set Goals",
    subtitle: "What do we need to resolve?",
  },
};

export function OnboardingFlow({ session, roomCode, advanceOnboarding }: OnboardingFlowProps) {
  const step = (session.onboarding_step ?? "introductions") as OnboardingStep;
  const meta = STEP_LABELS[step] ?? STEP_LABELS.introductions;

  return (
    <div className="flex-1 flex flex-col">
      {/* Step indicator */}
      <div className="px-6 pt-8 pb-4">
        <div className="max-w-md mx-auto">
          <StepIndicator current={step} />
        </div>
      </div>

      {/* Step header */}
      <div className="px-6 pb-6">
        <div className="max-w-md mx-auto text-center">
          <p className="section-indicator mb-3 justify-center">
            Step {meta.number}
          </p>
          <h2 className="text-2xl mb-2">{meta.title}</h2>
          <p className="text-muted text-sm">{meta.subtitle}</p>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center px-6 pb-8">
        <div className="max-w-md w-full">
          {step === "introductions" && (
            <IntroStep session={session} advanceOnboarding={advanceOnboarding} />
          )}
          {step === "set_stage" && (
            <StageStep session={session} advanceOnboarding={advanceOnboarding} />
          )}
          {step === "set_goals" && (
            <GoalsStep session={session} advanceOnboarding={advanceOnboarding} />
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: OnboardingStep }) {
  const steps: OnboardingStep[] = ["introductions", "set_stage", "set_goals"];
  const currentIndex = steps.indexOf(current);

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`w-2 h-2 rounded-full transition-colors ${
            i === currentIndex
              ? "bg-accent"
              : i < currentIndex
                ? "bg-ember-500"
                : "bg-ember-800"
          }`}
        />
      ))}
    </div>
  );
}

// --- Step 1: Introductions ---

function IntroStep({
  session,
  advanceOnboarding,
}: {
  session: Session;
  advanceOnboarding: (payload: Record<string, unknown>) => Promise<Session | null>;
}) {
  const [nameA, setNameA] = useState(session.person_a_name ?? "");
  const [nameB, setNameB] = useState(session.person_b_name ?? "");
  const [submitting, setSubmitting] = useState(false);

  const advance = useCallback(async () => {
    if (!nameA.trim() || !nameB.trim()) return;
    setSubmitting(true);
    try {
      await advanceOnboarding({
        person_a_name: nameA.trim(),
        person_b_name: nameB.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  }, [nameA, nameB, advanceOnboarding]);

  return (
    <div className="space-y-6">
      <NameField
        label="Person A"
        value={nameA}
        onChange={setNameA}
        placeholder="First name"
      />
      <NameField
        label="Person B"
        value={nameB}
        onChange={setNameB}
        placeholder="First name"
      />
      <button
        onClick={advance}
        disabled={!nameA.trim() || !nameB.trim() || submitting}
        className="w-full px-6 py-4 bg-accent text-ember-black font-mono text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {submitting ? "..." : "Continue"}
      </button>
    </div>
  );
}

function NameField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block font-mono text-xs uppercase tracking-wider text-ember-500 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={30}
        className="w-full px-4 py-3 bg-surface border border-border text-foreground text-sm placeholder:text-ember-600 focus:border-ember-600 focus:outline-none transition-colors"
      />
    </div>
  );
}

// --- Step 2: Set the Stage ---

function StageStep({
  session,
  advanceOnboarding,
}: {
  session: Session;
  advanceOnboarding: (payload: Record<string, unknown>) => Promise<Session | null>;
}) {
  const context = (session.onboarding_context ?? {}) as OnboardingContext;
  const [description, setDescription] = useState(context.stageDescription ?? "");
  const [submitting, setSubmitting] = useState(false);

  const advance = useCallback(async () => {
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      await advanceOnboarding({
        onboarding_context: { stageDescription: description.trim() },
      });
    } finally {
      setSubmitting(false);
    }
  }, [description, advanceOnboarding]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-mono text-xs uppercase tracking-wider text-ember-500 mb-2">
          What&apos;s going on?
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the situation both of you are here to talk about..."
          rows={4}
          className="w-full px-4 py-3 bg-surface border border-border text-foreground text-sm placeholder:text-ember-600 focus:border-ember-600 focus:outline-none transition-colors resize-none"
        />
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-ember-500 mb-2">
          Or speak it
        </p>
        <VoiceInput
          onTranscript={(text) => setDescription((prev) => prev ? prev + " " + text : text)}
        />
      </div>
      <button
        onClick={advance}
        disabled={!description.trim() || submitting}
        className="w-full px-6 py-4 bg-accent text-ember-black font-mono text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {submitting ? "..." : "Continue"}
      </button>
    </div>
  );
}

// --- Step 3: Set Goals ---

function GoalsStep({
  session,
  advanceOnboarding,
}: {
  session: Session;
  advanceOnboarding: (payload: Record<string, unknown>) => Promise<Session | null>;
}) {
  const context = (session.onboarding_context ?? {}) as OnboardingContext;
  const [goals, setGoals] = useState<string[]>(context.goals ?? []);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addGoal = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || goals.includes(trimmed)) return;
    setGoals((prev) => [...prev, trimmed]);
    setInput("");
  }, [input, goals]);

  const removeGoal = useCallback((goal: string) => {
    setGoals((prev) => prev.filter((g) => g !== goal));
  }, []);

  const advance = useCallback(async () => {
    if (goals.length === 0) return;
    setSubmitting(true);
    try {
      await advanceOnboarding({
        onboarding_context: { goals },
      });
    } finally {
      setSubmitting(false);
    }
  }, [goals, advanceOnboarding]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-mono text-xs uppercase tracking-wider text-ember-500 mb-2">
          Resolution goals
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
            placeholder="e.g. Agree on a fair schedule"
            className="flex-1 px-4 py-3 bg-surface border border-border text-foreground text-sm placeholder:text-ember-600 focus:border-ember-600 focus:outline-none transition-colors"
          />
          <button
            onClick={addGoal}
            disabled={!input.trim()}
            className="px-4 py-3 border border-border text-foreground font-mono text-xs uppercase tracking-wider hover:border-ember-600 transition-colors disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>

      {/* Voice input for goals */}
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-ember-500 mb-2">
          Or speak a goal
        </p>
        <VoiceInput
          onTranscript={(text) => {
            const trimmed = text.trim();
            if (trimmed && !goals.includes(trimmed)) {
              setGoals((prev) => [...prev, trimmed]);
            }
          }}
        />
      </div>

      {/* Goal tags */}
      {goals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {goals.map((goal) => (
            <span
              key={goal}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-border text-sm"
            >
              {goal}
              <button
                onClick={() => removeGoal(goal)}
                className="text-ember-600 hover:text-foreground transition-colors text-xs"
                aria-label={`Remove goal: ${goal}`}
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        onClick={advance}
        disabled={goals.length === 0 || submitting}
        className="w-full px-6 py-4 bg-accent text-ember-black font-mono text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {submitting ? "..." : "Begin Session"}
      </button>
    </div>
  );
}
