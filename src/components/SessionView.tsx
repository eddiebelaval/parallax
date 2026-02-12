"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { PersonPanel } from "./PersonPanel";
import { OrbStrip } from "./OrbStrip";
import { NameEntry } from "./NameEntry";
import { WaitingState } from "./WaitingState";
import { SessionSummary } from "./SessionSummary";
import { XRayGlanceView } from "./inperson/XRayGlanceView";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { CONTEXT_MODE_INFO } from "@/lib/context-modes";
import type { ContextMode, ConductorPhase, OnboardingContext, MessageSender } from "@/types/database";

type InputMode = "text" | "voice";

function getEffectiveTurn(
  conductorPhase: ConductorPhase | undefined,
  normalTurn: MessageSender,
): 'person_a' | 'person_b' | 'mediator' {
  switch (conductorPhase) {
    case 'greeting':
    case 'synthesize':
      return 'mediator'       // No one can type
    case 'gather_a':
      return 'person_a'       // Only A can type
    case 'gather_b':
      return 'person_b'       // Only B can type
    case 'active':
    default:
      return normalTurn       // Normal alternation
  }
}

const PHASE_LABELS: Partial<Record<ConductorPhase, (a: string, b: string) => string>> = {
  greeting: () => 'Parallax is joining...',
  gather_a: (a) => `${a}, share what brought you here`,
  gather_b: (_a, b) => `${b}, share your perspective`,
  synthesize: () => 'Parallax is listening...',
}

interface SessionViewProps {
  roomCode: string;
}

export function SessionView({ roomCode }: SessionViewProps) {
  const { session, loading: sessionLoading, createSession, joinSession, advanceOnboarding, refreshSession } = useSession(roomCode);
  const { messages, sendMessage, currentTurn } = useMessages(session?.id);
  const { user } = useAuth();

  // Track which side the local user has claimed (for same-device split-screen)
  const [localSideA, setLocalSideA] = useState<string | null>(null);
  const [localSideB, setLocalSideB] = useState<string | null>(null);

  // Input mode toggle (independent per side)
  const [inputModeA, setInputModeA] = useState<InputMode>("text");
  const [inputModeB, setInputModeB] = useState<InputMode>("text");

  // Track which message is currently being analyzed by Claude
  const [analyzingMessageId, setAnalyzingMessageId] = useState<string | null>(null);

  // Mediation error — shown inline, cleared on next send
  const [mediationError, setMediationError] = useState<string | null>(null);

  // Ending session — prevents double-click on End button
  const [endingSession, setEndingSession] = useState(false);

  const bothJoined = session?.status === 'active';
  const isCompleted = session?.status === 'completed';

  // Conductor: derive phase from session's onboarding_context
  const onboarding = (session?.onboarding_context ?? {}) as OnboardingContext;
  const conductorPhase = onboarding.conductorPhase;
  const effectiveTurn = getEffectiveTurn(conductorPhase, currentTurn);

  // Conductor: fire greeting when both join (remote mode only)
  const conductorFired = useRef(false);
  useEffect(() => {
    if (
      bothJoined &&
      session?.mode !== 'in_person' &&
      !conductorFired.current &&
      !conductorPhase // Only fire if no phase set yet (first time)
    ) {
      conductorFired.current = true;
      fetch('/api/conductor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session?.id,
          trigger: 'session_active',
        }),
      }).then(() => {
        // Refresh session to pick up onboarding_context (Realtime may not deliver)
        refreshSession();
      }).catch(() => {
        // Graceful degradation: if conductor fails, conversation still works
        conductorFired.current = false;
      });
    }
  }, [bothJoined, session?.id, session?.mode, conductorPhase, refreshSession]);

  // Clear analyzing state when the message receives its nvc_analysis via Realtime UPDATE
  useEffect(() => {
    if (!analyzingMessageId) return;
    const msg = messages.find((m) => m.id === analyzingMessageId);
    if (msg?.nvc_analysis) {
      setAnalyzingMessageId(null);
    }
  }, [messages, analyzingMessageId]);

  // Sync local state with Realtime session updates
  useEffect(() => {
    if (session?.person_a_name && !localSideA) {
      setLocalSideA(session.person_a_name);
    }
    if (session?.person_b_name && !localSideB) {
      setLocalSideB(session.person_b_name);
    }
  }, [session?.person_a_name, session?.person_b_name, localSideA, localSideB]);

  const handleNameA = useCallback(async (name: string) => {
    if (!session) {
      const created = await createSession(name, user?.id);
      if (created) setLocalSideA(name);
    } else {
      const joined = await joinSession(name, 'a', user?.id);
      if (joined) setLocalSideA(name);
    }
  }, [session, createSession, joinSession, user?.id]);

  const handleNameB = useCallback(async (name: string) => {
    if (!session) return;
    const joined = await joinSession(name, 'b', user?.id);
    if (joined) setLocalSideB(name);
  }, [session, joinSession, user?.id]);

  // Trigger NVC mediation for a message (fire-and-forget — result arrives via Realtime UPDATE)
  const triggerMediation = useCallback(async (messageId: string) => {
    if (!session?.id) return;
    setAnalyzingMessageId(messageId);
    setMediationError(null);
    try {
      const res = await fetch("/api/mediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          message_id: messageId,
        }),
      });
      if (!res.ok) {
        setMediationError("Analysis unavailable — message saved");
        setAnalyzingMessageId(null);
      }
    } catch {
      setMediationError("Connection lost — analysis skipped");
      setAnalyzingMessageId(null);
    }
  }, [session?.id]);

  // End the session — refresh to pick up status change (Realtime may not deliver)
  const endSession = useCallback(async () => {
    if (endingSession) return;
    setEndingSession(true);
    try {
      await fetch(`/api/sessions/${roomCode}/end`, { method: "POST" });
      refreshSession();
    } catch {
      setEndingSession(false);
    }
  }, [roomCode, endingSession, refreshSession]);

  // Call conductor for onboarding messages (no NVC analysis during gather phases)
  const triggerConductor = useCallback(async (messageId: string) => {
    if (!session?.id) return;
    try {
      const res = await fetch('/api/conductor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          trigger: 'message_sent',
          message_id: messageId,
        }),
      });
      if (!res.ok) {
        setMediationError('Conductor unavailable — message saved');
      }
      // Refresh session to pick up phase transitions
      refreshSession();
    } catch {
      setMediationError('Connection lost — conductor skipped');
    }
  }, [session?.id, refreshSession]);

  // Check for intervention after mediation during active phase
  const triggerInterventionCheck = useCallback(async () => {
    if (!session?.id) return;
    try {
      await fetch('/api/conductor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          trigger: 'check_intervention',
        }),
      });
    } catch {
      // Intervention check failure is silent — not critical
    }
  }, [session?.id]);

  const handleSendA = useCallback(async (content: string) => {
    setMediationError(null);
    const sent = await sendMessage('person_a', content);
    if (!sent) return;

    // During onboarding, call conductor instead of mediate
    if (conductorPhase === 'gather_a' || conductorPhase === 'gather_b') {
      triggerConductor(sent.id);
    } else {
      triggerMediation(sent.id);
      // Chain intervention check after a delay to let analysis complete
      setTimeout(() => triggerInterventionCheck(), 5000);
    }
  }, [sendMessage, triggerMediation, triggerConductor, triggerInterventionCheck, conductorPhase]);

  const handleSendB = useCallback(async (content: string) => {
    setMediationError(null);
    const sent = await sendMessage('person_b', content);
    if (!sent) return;

    // During onboarding, call conductor instead of mediate
    if (conductorPhase === 'gather_a' || conductorPhase === 'gather_b') {
      triggerConductor(sent.id);
    } else {
      triggerMediation(sent.id);
      setTimeout(() => triggerInterventionCheck(), 5000);
    }
  }, [sendMessage, triggerMediation, triggerConductor, triggerInterventionCheck, conductorPhase]);

  const personAName = session?.person_a_name ?? "Person A";
  const personBName = session?.person_b_name ?? "Person B";

  if (sessionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
      </div>
    );
  }

  // --- In-Person Mode Branch ---
  if (session?.mode === 'in_person') {
    if (isCompleted) {
      return (
        <div className="flex-1 flex flex-col">
          <SessionSummary
            roomCode={roomCode}
            personAName={personAName}
            personBName={personBName}
          />
        </div>
      );
    }

    return (
      <XRayGlanceView
        session={session}
        roomCode={roomCode}
      />
    );
  }

  // --- Remote Mode (existing flow, unchanged) ---

  // When session is completed, show the summary spanning the full width
  if (isCompleted) {
    return (
      <div className="flex-1 flex flex-col">
        <SessionSummary
          roomCode={roomCode}
          personAName={personAName}
          personBName={personBName}
        />
      </div>
    );
  }

  // Pre-join content for Person A
  const preJoinA = !session?.person_a_name ? (
    <NameEntry onSubmit={handleNameA} side="A" />
  ) : (
    <WaitingState roomCode={roomCode} />
  );

  // Pre-join content for Person B (extra state: no session yet)
  const preJoinB = !session ? (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-muted text-sm">Waiting for Person A to create the session</p>
    </div>
  ) : !session.person_b_name ? (
    <NameEntry onSubmit={handleNameB} side="B" />
  ) : (
    <WaitingState roomCode={roomCode} />
  );

  const contextMode = (session?.context_mode as ContextMode) || 'intimate';
  const contextModeLabel = CONTEXT_MODE_INFO[contextMode]?.name || 'Intimate Partners';

  return (
    <div className="flex-1 flex flex-col">
      {bothJoined && (
        <>
          <OrbStrip
            personAName={personAName}
            personBName={personBName}
            currentTurn={currentTurn}
            isAnalyzing={analyzingMessageId != null}
          />
          <div className="flex justify-center py-1 gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ember-600 px-2 py-0.5 border border-border rounded-sm">
              {contextModeLabel}
            </span>
            {conductorPhase && PHASE_LABELS[conductorPhase] && (
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-success px-2 py-0.5 border border-success/30 rounded-sm animate-pulse">
                {PHASE_LABELS[conductorPhase]!(personAName, personBName)}
              </span>
            )}
          </div>
        </>
      )}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
      <PersonPanel
        side="A"
        name={personAName}
        otherName={personBName}
        isMyTurn={effectiveTurn === 'person_a'}
        onSend={handleSendA}
        inputMode={inputModeA}
        onInputModeChange={setInputModeA}
        roomCode={roomCode}
        bothJoined={bothJoined}
        onEndSession={endSession}
        endingSession={endingSession}
        messages={messages}
        personAName={personAName}
        personBName={personBName}
        analyzingMessageId={analyzingMessageId}
        mediationError={mediationError}
        preJoinContent={preJoinA}
        className="border-b md:border-b-0 md:border-r border-border"
      />
      <PersonPanel
        side="B"
        name={personBName}
        otherName={personAName}
        isMyTurn={effectiveTurn === 'person_b'}
        onSend={handleSendB}
        inputMode={inputModeB}
        onInputModeChange={setInputModeB}
        roomCode={roomCode}
        bothJoined={bothJoined}
        onEndSession={endSession}
        endingSession={endingSession}
        messages={messages}
        personAName={personAName}
        personBName={personBName}
        analyzingMessageId={analyzingMessageId}
        mediationError={mediationError}
        preJoinContent={preJoinB}
      />
      </div>
    </div>
  );
}
