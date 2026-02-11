"use client";

import { useState, useCallback, useEffect } from "react";
import { PersonPanel } from "./PersonPanel";
import { OrbStrip } from "./OrbStrip";
import { NameEntry } from "./NameEntry";
import { WaitingState } from "./WaitingState";
import { SessionSummary } from "./SessionSummary";
import { OnboardingFlow } from "./inperson/OnboardingFlow";
import { XRayView } from "./inperson/XRayView";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";

type InputMode = "text" | "voice";

interface SessionViewProps {
  roomCode: string;
}

export function SessionView({ roomCode }: SessionViewProps) {
  const { session, loading: sessionLoading, createSession, joinSession, advanceOnboarding } = useSession(roomCode);
  const { messages, sendMessage, currentTurn } = useMessages(session?.id);

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
      const created = await createSession(name);
      if (created) setLocalSideA(name);
    } else {
      const joined = await joinSession(name, 'a');
      if (joined) setLocalSideA(name);
    }
  }, [session, createSession, joinSession]);

  const handleNameB = useCallback(async (name: string) => {
    if (!session) return;
    const joined = await joinSession(name, 'b');
    if (joined) setLocalSideB(name);
  }, [session, joinSession]);

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

  // End the session — status change flows through Realtime to both sides
  const endSession = useCallback(async () => {
    try {
      await fetch(`/api/sessions/${roomCode}/end`, { method: "POST" });
    } catch {
      // Session end failed — Realtime won't fire, no-op
    }
  }, [roomCode]);

  const handleSendA = useCallback(async (content: string) => {
    setMediationError(null);
    const sent = await sendMessage('person_a', content);
    if (sent) triggerMediation(sent.id);
  }, [sendMessage, triggerMediation]);

  const handleSendB = useCallback(async (content: string) => {
    setMediationError(null);
    const sent = await sendMessage('person_b', content);
    if (sent) triggerMediation(sent.id);
  }, [sendMessage, triggerMediation]);

  const bothJoined = session?.status === 'active';
  const isCompleted = session?.status === 'completed';

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

    if (session.onboarding_step !== 'complete') {
      return <OnboardingFlow session={session} roomCode={roomCode} advanceOnboarding={advanceOnboarding} />;
    }

    return (
      <XRayView
        session={session}
        roomCode={roomCode}
        messages={messages}
        sendMessage={sendMessage}
        currentTurn={currentTurn}
        triggerMediation={triggerMediation}
        endSession={endSession}
        analyzingMessageId={analyzingMessageId}
        mediationError={mediationError}
        setMediationError={setMediationError}
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

  return (
    <div className="flex-1 flex flex-col">
      {bothJoined && (
        <OrbStrip
          personAName={personAName}
          personBName={personBName}
          currentTurn={currentTurn}
          isAnalyzing={analyzingMessageId != null}
        />
      )}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
      <PersonPanel
        side="A"
        name={personAName}
        otherName={personBName}
        isMyTurn={currentTurn === 'person_a'}
        onSend={handleSendA}
        inputMode={inputModeA}
        onInputModeChange={setInputModeA}
        roomCode={roomCode}
        bothJoined={bothJoined}
        onEndSession={endSession}
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
        isMyTurn={currentTurn === 'person_b'}
        onSend={handleSendB}
        inputMode={inputModeB}
        onInputModeChange={setInputModeB}
        roomCode={roomCode}
        bothJoined={bothJoined}
        onEndSession={endSession}
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
