"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { SignalCard } from "./inperson/SignalCard";
import { ActionPanel } from "./inperson/ActionPanel";
import { ActiveSpeakerBar } from "./inperson/ActiveSpeakerBar";
import { CoachingPanel } from "./CoachingPanel";
import { useMessages } from "@/hooks/useMessages";
import { useSession } from "@/hooks/useSession";
import { useIssues } from "@/hooks/useIssues";
import { useCoaching } from "@/hooks/useCoaching";
import { CONTEXT_MODE_INFO } from "@/lib/context-modes";
import type {
  Session,
  ContextMode,
  ConductorPhase,
  OnboardingContext,
  MessageSender,
} from "@/types/database";

function getEffectiveTurn(
  conductorPhase: ConductorPhase | undefined,
  normalTurn: MessageSender,
): "person_a" | "person_b" | "mediator" {
  switch (conductorPhase) {
    case "greeting":
    case "synthesize":
    case "waiting_for_b":
      return "mediator";
    case "gather_a":
      return "person_a";
    case "gather_b":
      return "person_b";
    case "active":
    default:
      return normalTurn;
  }
}

const PHASE_LABELS: Partial<
  Record<ConductorPhase, (a: string, b: string) => string>
> = {
  greeting: () => "Parallax is joining...",
  gather_a: (a) => `${a}, share what brought you here`,
  waiting_for_b: () => "Waiting for the other person to join",
  gather_b: (_a, b) => `${b}, share your perspective`,
  synthesize: () => "Parallax is listening...",
};

interface RemoteViewProps {
  session: Session;
  roomCode: string;
  localSide: "a" | "b";
}

export function RemoteView({
  session: initialSession,
  roomCode,
  localSide,
}: RemoteViewProps) {
  const { session, refreshSession } = useSession(roomCode);
  const activeSession = session || initialSession;
  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    currentTurn,
    refreshMessages,
  } = useMessages(activeSession.id);
  const { personAIssues, personBIssues, refreshIssues, updateIssueStatus } =
    useIssues(activeSession.id);

  const localPerson: MessageSender =
    localSide === "a" ? "person_a" : "person_b";
  const coaching = useCoaching(activeSession.id, localPerson);

  const [analyzingMessageId, setAnalyzingMessageId] = useState<string | null>(
    null,
  );
  const [conductorLoading, setConductorLoading] = useState(false);
  const [mediationError, setMediationError] = useState<string | null>(null);
  const [endingSession, setEndingSession] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const conductorFired = useRef(false);

  // Derived state
  const onboarding = (activeSession.onboarding_context ?? {}) as OnboardingContext;
  const conductorPhase = onboarding.conductorPhase;
  const effectiveTurn = getEffectiveTurn(conductorPhase, currentTurn);
  const isActive = conductorPhase === "active";

  const personAName = activeSession.person_a_name ?? "Person A";
  const personBName = activeSession.person_b_name ?? "Person B";
  const localName = localSide === "a" ? personAName : personBName;

  const contextMode =
    (activeSession.context_mode as ContextMode) || "intimate";
  const contextModeLabel =
    CONTEXT_MODE_INFO[contextMode]?.name || "Intimate Partners";

  const isMyTurn = effectiveTurn === localPerson;
  const hasIssues = personAIssues.length > 0 || personBIssues.length > 0;

  // Active speaker name for ActiveSpeakerBar
  const activeSpeaker = isMyTurn
    ? localName
    : effectiveTurn === "mediator"
      ? "Parallax"
      : effectiveTurn === "person_a"
        ? personAName
        : personBName;

  // Helper for sender display
  function senderLabel(sender: string): string {
    if (sender === "mediator") return "Parallax";
    if (sender === "person_a") return personAName;
    return personBName;
  }

  function senderColor(sender: string): string {
    if (sender === "mediator") return "text-temp-cool";
    if (sender === "person_a") return "text-temp-warm";
    return "text-temp-hot";
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Clear analyzing state when analysis arrives via Realtime
  useEffect(() => {
    if (!analyzingMessageId) return;
    const msg = messages.find((m) => m.id === analyzingMessageId);
    if (msg?.nvc_analysis) {
      setAnalyzingMessageId(null);
    }
  }, [messages, analyzingMessageId]);

  // Fire conductor on mount based on side
  // Wait for messagesLoading to finish so we know if messages already exist (reload case)
  useEffect(() => {
    if (messagesLoading) return; // Wait for initial fetch before deciding
    if (conductorFired.current || !activeSession.id) return;

    // Don't fire if session already has an active or later phase
    if (conductorPhase && conductorPhase !== "waiting_for_b") return;

    // Don't fire if messages already exist (page reload)
    if (messages.length > 0 && conductorPhase !== "waiting_for_b") return;

    // Person A arrives: fire person_a_ready (if no phase set yet)
    if (localSide === "a" && !conductorPhase) {
      conductorFired.current = true;
      setConductorLoading(true);
      fetch("/api/conductor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeSession.id,
          trigger: "person_a_ready",
        }),
      })
        .then(() => {
          refreshSession();
          refreshMessages();
        })
        .catch(() => {
          conductorFired.current = false;
        })
        .finally(() => setConductorLoading(false));
    }

    // Person B arrives: fire person_b_joined (when phase is waiting_for_b)
    if (localSide === "b" && conductorPhase === "waiting_for_b") {
      conductorFired.current = true;
      setConductorLoading(true);
      fetch("/api/conductor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeSession.id,
          trigger: "person_b_joined",
        }),
      })
        .then(() => {
          refreshSession();
          refreshMessages();
        })
        .catch(() => {
          conductorFired.current = false;
        })
        .finally(() => setConductorLoading(false));
    }
  }, [
    activeSession.id,
    localSide,
    conductorPhase,
    messagesLoading,
    messages.length,
    refreshSession,
    refreshMessages,
  ]);

  // Poll for issues every 8 seconds during active phase
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => refreshIssues(), 8000);
    return () => clearInterval(interval);
  }, [isActive, refreshIssues]);

  // Trigger NVC mediation for a message
  const triggerMediation = useCallback(
    async (messageId: string) => {
      if (!activeSession.id) return;
      setAnalyzingMessageId(messageId);
      setMediationError(null);
      try {
        const res = await fetch("/api/mediate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: activeSession.id,
            message_id: messageId,
          }),
        });
        if (!res.ok) {
          setMediationError("Analysis unavailable -- message saved");
          setAnalyzingMessageId(null);
        }
      } catch {
        setMediationError("Connection lost -- analysis skipped");
        setAnalyzingMessageId(null);
      }
    },
    [activeSession.id],
  );

  // Call conductor for onboarding messages
  const triggerConductor = useCallback(
    async (messageId: string) => {
      if (!activeSession.id) return;
      setConductorLoading(true);
      try {
        const res = await fetch("/api/conductor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: activeSession.id,
            trigger: "message_sent",
            message_id: messageId,
          }),
        });
        if (!res.ok) {
          setMediationError("Conductor unavailable -- message saved");
        }
        refreshSession();
        await refreshMessages();
      } catch {
        setMediationError("Connection lost -- conductor skipped");
      } finally {
        setConductorLoading(false);
      }
    },
    [activeSession.id, refreshSession, refreshMessages],
  );

  // Check for intervention after mediation
  const triggerInterventionCheck = useCallback(async () => {
    if (!activeSession.id) return;
    try {
      const intRes = await fetch("/api/conductor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeSession.id,
          trigger: "check_intervention",
        }),
      });
      const intData = await intRes.json();
      if (intData.intervened) {
        refreshMessages();
      }
    } catch {
      // Intervention check failure is silent
    }
  }, [activeSession.id, refreshMessages]);

  // Handle message send
  const handleSend = useCallback(
    async (content: string) => {
      setMediationError(null);
      const sent = await sendMessage(localPerson, content);
      if (!sent) return;

      // During onboarding, call conductor instead of mediate
      if (
        conductorPhase === "gather_a" ||
        conductorPhase === "gather_b"
      ) {
        triggerConductor(sent.id);
      } else {
        triggerMediation(sent.id);
        // Issue analysis
        fetch("/api/issues/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: activeSession.id,
            message_id: sent.id,
          }),
        })
          .then(() => refreshIssues())
          .catch(() => {});
        // Intervention check after delay
        setTimeout(() => triggerInterventionCheck(), 5000);
      }
    },
    [
      localPerson,
      conductorPhase,
      activeSession.id,
      sendMessage,
      triggerConductor,
      triggerMediation,
      triggerInterventionCheck,
      refreshIssues,
    ],
  );

  // End session
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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-ember-700">
            {roomCode}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ember-600 px-2 py-0.5 border border-border rounded-sm">
            {contextModeLabel}
          </span>
          {conductorPhase && PHASE_LABELS[conductorPhase] && (
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-success px-2 py-0.5 border border-success/30 rounded-sm animate-pulse">
              {PHASE_LABELS[conductorPhase]!(personAName, personBName)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Coaching button — visible during active phase */}
          {isActive && (
            <button
              onClick={() => coaching.setIsOpen(!coaching.isOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-[10px] uppercase tracking-wider transition-all rounded-sm ${
                coaching.isOpen
                  ? "border-success text-success bg-success/10"
                  : "border-success/30 text-success hover:bg-success/10"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-success" />
              {coaching.isOpen ? "Close coach" : "Private coach"}
            </button>
          )}
          {isActive && (
            <button
              onClick={endSession}
              disabled={endingSession}
              className="font-mono text-[10px] uppercase tracking-wider text-ember-600 hover:text-foreground transition-colors disabled:opacity-40"
            >
              {endingSession ? "Ending..." : "End"}
            </button>
          )}
        </div>
      </div>

      {/* Main content: messages + sidebar */}
      <div className="flex-1 flex min-h-0">
        {/* Center column — Messages */}
        <div className="flex-1 flex flex-col min-h-0">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto min-h-0"
          >
            <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">
              {messages.map((msg) => {
                const isMediator = msg.sender === "mediator";
                return (
                  <div key={msg.id} className="signal-card-enter">
                    <div
                      className={`px-3 py-2 rounded ${
                        isMediator ? "bg-transparent" : "bg-surface"
                      }`}
                    >
                      <span
                        className={`font-mono text-[9px] uppercase tracking-widest ${senderColor(
                          msg.sender,
                        )}`}
                      >
                        {senderLabel(msg.sender)}
                      </span>
                      <p
                        className={`text-sm mt-0.5 leading-relaxed ${
                          isMediator
                            ? "text-temp-cool/80 italic"
                            : "text-foreground"
                        }`}
                      >
                        {msg.content}
                      </p>
                    </div>
                    {analyzingMessageId === msg.id && !msg.nvc_analysis && (
                      <div className="pl-4 mt-1 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600">
                          Analyzing
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Waiting for B — prominent room code display */}
              {conductorPhase === "waiting_for_b" && localSide === "a" && (
                <div className="text-center py-8">
                  <p className="font-mono text-xs uppercase tracking-wider text-ember-500 mb-3">
                    Share this code with the other person
                  </p>
                  <p className="font-mono text-4xl tracking-[0.3em] text-foreground">
                    {roomCode}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ember-600 mt-3">
                    Waiting for them to join...
                  </p>
                </div>
              )}

              {/* Loading indicators */}
              {(conductorLoading ||
                conductorPhase === "greeting" ||
                conductorPhase === "synthesize") && (
                <div className="flex justify-center py-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-temp-cool animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* Mediation error */}
          {mediationError && (
            <div className="px-4 py-1.5 border-t border-border flex-shrink-0">
              <p className="font-mono text-xs text-accent">
                {mediationError}
              </p>
            </div>
          )}

          {/* Coaching panel (slides up above input) */}
          {coaching.isOpen && (
            <CoachingPanel
              messages={coaching.messages}
              loading={coaching.loading}
              error={coaching.error}
              onSend={coaching.sendMessage}
              onClose={() => coaching.setIsOpen(false)}
            />
          )}

          {/* Input bar — same ActiveSpeakerBar as in-person */}
          <div className="flex-shrink-0">
            <ActiveSpeakerBar
              activeSpeakerName={activeSpeaker}
              onSend={handleSend}
              disabled={!isMyTurn || conductorLoading}
            />
          </div>
        </div>

        {/* Right sidebar — Signal cards + Action panels (desktop only, active phase) */}
        {isActive && (
          <div className="hidden md:flex md:flex-col w-64 border-l border-border overflow-y-auto flex-shrink-0">
            {/* Signal cards */}
            <div className="space-y-1 p-2">
              {messages
                .filter(
                  (m) =>
                    m.sender === localPerson && m.nvc_analysis,
                )
                .map((m) => (
                  <SignalCard
                    key={`signal-${m.id}`}
                    analysis={m.nvc_analysis!}
                    side="right"
                  />
                ))}
            </div>

            {/* Action panels */}
            <ActionPanel
              personName={personAName}
              issues={personAIssues}
              side="left"
              onUpdateStatus={updateIssueStatus}
            />
            <ActionPanel
              personName={personBName}
              issues={personBIssues}
              side="right"
              onUpdateStatus={updateIssueStatus}
            />
          </div>
        )}
      </div>

      {/* Mobile: issue panels below messages (active phase only) */}
      {isActive && hasIssues && (
        <div className="md:hidden flex-shrink-0 border-t border-border">
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="max-h-40 overflow-y-auto">
              <ActionPanel
                personName={personAName}
                issues={personAIssues}
                side="left"
                onUpdateStatus={updateIssueStatus}
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              <ActionPanel
                personName={personBName}
                issues={personBIssues}
                side="right"
                onUpdateStatus={updateIssueStatus}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
