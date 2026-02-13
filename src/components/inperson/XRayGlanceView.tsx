"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ParallaxPresence } from "./ParallaxPresence";
import { SignalCard } from "./SignalCard";
import { ActionPanel } from "./ActionPanel";
import { IssueDrawer } from "./IssueDrawer";
import { ActiveSpeakerBar } from "./ActiveSpeakerBar";
import { TurnTimer } from "./TurnTimer";
import { TurnProgressBar } from "./TurnProgressBar";
import { TimerSettings } from "./TimerSettings";
import { useMessages } from "@/hooks/useMessages";
import { useSession } from "@/hooks/useSession";
import { useIssues } from "@/hooks/useIssues";
import { useParallaxVoice } from "@/hooks/useParallaxVoice";
import { useTurnTimer } from "@/hooks/useTurnTimer";
import { useAutoListen } from "@/hooks/useAutoListen";
import { useConversationInsights } from "@/hooks/useConversationInsights";
import { SoloSidebar } from "@/components/SoloSidebar";
import { buildSessionSummaryHtml } from "@/lib/export-html";
import { useRouter } from "next/navigation";
import type {
  Session,
  OnboardingContext,
  SessionSummaryData,
} from "@/types/database";

interface XRayGlanceViewProps {
  session: Session;
  roomCode: string;
}

export function XRayGlanceView({ session: initialSession, roomCode }: XRayGlanceViewProps) {
  const { session, refreshSession } = useSession(roomCode);
  const activeSession = session || initialSession;
  const { messages, loading: messagesLoading, sendMessage, currentTurn, refreshMessages } = useMessages(activeSession.id);
  const { personAIssues, personBIssues, refreshIssues, updateIssueStatus } = useIssues(activeSession.id);
  const { speak, isSpeaking, cancel: cancelSpeech, waveform: voiceWaveform, energy: voiceEnergy } = useParallaxVoice();
  const { insights: conversationInsights } = useConversationInsights(messages);

  const [issueDrawerOpen, setIssueDrawerOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [conductorLoading, setConductorLoading] = useState(false);
  const [directedTo, setDirectedTo] = useState<"person_a" | "person_b">("person_a");
  const [mediationError, setMediationError] = useState<string | null>(null);
  const [isMicHot, setIsMicHot] = useState(false);
  const [turnBasedMode, setTurnBasedMode] = useState(true);
  const [timerSettingsOpen, setTimerSettingsOpen] = useState(false);
  const [handsFree, setHandsFree] = useState(true); // Hands-free (auto-listen) vs tap-to-talk
  const [muted, setMuted] = useState(false); // Mute mic in hands-free mode
  const [timerFlash, setTimerFlash] = useState(false); // Full-screen red flash on timer expire
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const router = useRouter();

  // Track last spoken mediator message to avoid double-speak
  const lastSpokenRef = useRef<string | null>(null);
  const conductorFired = useRef(false);
  const prevPhaseRef = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onboarding = (activeSession.onboarding_context ?? {}) as OnboardingContext;
  const conductorPhase = onboarding.conductorPhase;
  const isOnboarding = conductorPhase === "onboarding";
  const isActive = conductorPhase === "active";
  const isCompleted = activeSession.status === "completed";

  const personAName = activeSession.person_a_name ?? "Person A";
  const personBName = activeSession.person_b_name ?? "Person B";

  const activeSender = isOnboarding ? directedTo : currentTurn;
  const activeSpeaker = activeSender === "person_a" ? personAName : personBName;

  const hasIssues = personAIssues.length > 0 || personBIssues.length > 0;

  // Turn-based timer: configurable duration (defaults to 3 minutes)
  const DEFAULT_TURN_DURATION_MS = 3 * 60 * 1000; // 3 minutes
  const timerDuration = activeSession.timer_duration_ms ?? DEFAULT_TURN_DURATION_MS;

  // Interruption messages — Parallax takes command of the room
  const TURN_OVER_MESSAGES = [
    (current: string, next: string) =>
      `${current}, I need to pause you there. Let's give ${next} a chance to respond now.`,
    (current: string, next: string) =>
      `Thank you ${current}. Let's hear from ${next} now — ${next}, what's on your mind?`,
    (current: string, next: string) =>
      `I appreciate you sharing, ${current}. ${next}, it's your turn — take your time.`,
    (current: string, next: string) =>
      `Let's pause here, ${current}. ${next}, I'd love to hear your perspective on this.`,
  ];

  const handleTurnExpire = useCallback(() => {
    const currentName = activeSender === "person_a" ? personAName : personBName;
    const nextSender = activeSender === "person_a" ? "person_b" : "person_a";
    const nextName = nextSender === "person_a" ? personAName : personBName;

    // 1. Flash the screen red
    setTimerFlash(true);
    setTimeout(() => setTimerFlash(false), 1500);

    // 2. Parallax speaks to take control of the room
    const msg = TURN_OVER_MESSAGES[Math.floor(Math.random() * TURN_OVER_MESSAGES.length)];
    speak(msg(currentName, nextName));

    // 3. Switch to next speaker
    setDirectedTo(nextSender);
  }, [activeSender, personAName, personBName, speak]);

  const handleTimerDurationChange = useCallback(async (newDuration: number) => {
    try {
      await fetch(`/api/sessions/${roomCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timer_duration_ms: newDuration }),
      });
      refreshSession();
    } catch (error) {
      console.error("Failed to update timer duration:", error);
    }
  }, [roomCode, refreshSession]);

  const { timeRemaining, progress, reset: resetTimer } = useTurnTimer({
    durationMs: timerDuration,
    onExpire: handleTurnExpire,
    enabled: turnBasedMode && isActive,
  });

  // Reset timer when turn changes
  useEffect(() => {
    if (turnBasedMode && isActive) {
      resetTimer();
    }
  }, [activeSender, turnBasedMode, isActive, resetTimer]);

  function senderColor(sender: string): string {
    if (sender === "mediator") return "text-temp-cool";
    if (sender === "person_a") return "text-temp-warm";
    return "text-temp-hot";
  }

  function senderLabel(sender: string): string {
    if (sender === "mediator") return "Parallax";
    if (sender === "person_a") return personAName;
    return personBName;
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Fetch summary when session is completed
  const summaryFetched = useRef(false);
  useEffect(() => {
    if (!isCompleted || summaryFetched.current) return;
    summaryFetched.current = true;
    setSummaryLoading(true);
    fetch(`/api/sessions/${roomCode}/summary`, { method: "POST" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.summary) setSummaryData(data.summary);
      })
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  }, [isCompleted, roomCode]);

  // Export summary as HTML download
  const handleExportSummary = useCallback(() => {
    if (!summaryData) return;
    const html = buildSessionSummaryHtml(summaryData, roomCode, personAName, personBName, "in_person");
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parallax-${roomCode.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.html`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, [summaryData, roomCode, personAName, personBName]);

  // Fire conductor on mount (greeting) for in-person mode
  // Wait for messagesLoading to finish so we know if messages already exist (reload case)
  useEffect(() => {
    if (messagesLoading) return; // Wait for initial fetch before deciding
    if (conductorFired.current || !activeSession.id || !isOnboarding) return;
    if (messages.length > 0) return; // Already have messages (reload), don't re-greet

    conductorFired.current = true;
    setConductorLoading(true);

    fetch("/api/conductor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: activeSession.id,
        trigger: "in_person_message",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.directed_to) setDirectedTo(data.directed_to);
        refreshSession();
        refreshMessages();
      })
      .catch(() => {
        conductorFired.current = false;
      })
      .finally(() => setConductorLoading(false));
  }, [activeSession.id, isOnboarding, messagesLoading, messages.length, refreshSession, refreshMessages]);

  // When transitioning from onboarding → active, run retroactive issue analysis
  // on the last human messages so the panels seed immediately
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = conductorPhase;

    if (prev === "onboarding" && conductorPhase === "active") {
      // Find the last 2 human messages to analyze retroactively
      const humanMessages = messages.filter((m) => m.sender !== "mediator");
      const toAnalyze = humanMessages.slice(-2);
      for (const msg of toAnalyze) {
        fetch("/api/issues/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: activeSession.id,
            message_id: msg.id,
          }),
        })
          .then(() => refreshIssues())
          .catch(() => {});
      }
    }
  }, [conductorPhase, activeSession.id, messages, refreshIssues]);

  // Poll for new issues every 8 seconds during active phase
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      refreshIssues();
    }, 8000);
    return () => clearInterval(interval);
  }, [isActive, refreshIssues]);

  // Speak new mediator messages via TTS
  useEffect(() => {
    if (messages.length === 0) return;
    const latest = messages[messages.length - 1];
    if (latest.sender !== "mediator") return;
    if (lastSpokenRef.current === latest.id) return;

    lastSpokenRef.current = latest.id;
    speak(latest.content);
  }, [messages, speak]);

  // Fire conductor or mediation on message send
  const handleSend = useCallback(
    async (content: string) => {
      setMediationError(null);
      const sent = await sendMessage(activeSender, content);
      if (!sent) return;

      if (isOnboarding) {
        // During onboarding: fire adaptive conductor
        setConductorLoading(true);
        try {
          const res = await fetch("/api/conductor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: activeSession.id,
              trigger: "in_person_message",
            }),
          });
          const data = await res.json();
          if (data.directed_to) setDirectedTo(data.directed_to);
          refreshSession();
          await refreshMessages();
        } catch {
          setMediationError("Conductor unavailable -- message saved");
        } finally {
          setConductorLoading(false);
        }
      } else {
        // During active phase: fire NVC mediation + issue analysis
        setIsAnalyzing(true);
        try {
          const res = await fetch("/api/mediate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: activeSession.id,
              message_id: sent.id,
            }),
          });
          if (!res.ok) {
            setMediationError("Analysis unavailable -- message saved");
          }
          // Refresh to pick up NVC analysis update + any mediator messages
          await refreshMessages();
        } catch {
          setMediationError("Connection lost -- analysis skipped");
        } finally {
          setIsAnalyzing(false);
        }

        // Issue analysis — refresh issues when done
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

        // Intervention check after delay (includes resolution detection)
        setTimeout(async () => {
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
              await refreshMessages();
              refreshIssues();
            }
          } catch {}
        }, 5000);
      }
    },
    [activeSession.id, activeSender, isOnboarding, sendMessage, refreshSession, refreshMessages, refreshIssues],
  );

  // Auto-listen: hands-free from session start (togglable)
  const autoListen = useAutoListen({
    enabled: handsFree && !muted && !conductorLoading && !isAnalyzing,
    isTTSPlaying: isSpeaking,
    onTranscript: handleSend,
    silenceTimeoutMs: 3500,
  });

  const endSession = useCallback(async () => {
    cancelSpeech();
    try {
      await fetch(`/api/sessions/${roomCode}/end`, { method: "POST" });
      refreshSession();
    } catch {}
  }, [roomCode, refreshSession, cancelSpeech]);

  const totalIssues = personAIssues.length + personBIssues.length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header with visual temperature scoreboard */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <span className="font-mono text-[10px] text-ember-700">{roomCode}</span>

          {/* Issue Scoreboard with temperature coding */}
          {isActive && hasIssues && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-ember-500">
                    {personAName}
                  </span>
                  <div className="flex gap-0.5">
                    {personAIssues.map((issue) => {
                      const tempColor = issue.status === "well_addressed"
                        ? "var(--temp-cool)"
                        : issue.status === "poorly_addressed"
                        ? "var(--temp-hot)"
                        : "var(--temp-warm)";
                      return (
                        <div
                          key={issue.id}
                          className="w-2 h-2 rounded-sm transition-all duration-300"
                          style={{
                            backgroundColor: tempColor,
                            boxShadow: `0 0 6px ${tempColor}`
                          }}
                          title={issue.label}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-ember-500">
                    {personBName}
                  </span>
                  <div className="flex gap-0.5">
                    {personBIssues.map((issue) => {
                      const tempColor = issue.status === "well_addressed"
                        ? "var(--temp-cool)"
                        : issue.status === "poorly_addressed"
                        ? "var(--temp-hot)"
                        : "var(--temp-warm)";
                      return (
                        <div
                          key={issue.id}
                          className="w-2 h-2 rounded-sm transition-all duration-300"
                          style={{
                            backgroundColor: tempColor,
                            boxShadow: `0 0 6px ${tempColor}`
                          }}
                          title={issue.label}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Turn Timer with temperature pulse (active phase only) */}
          {turnBasedMode && isActive && (
            <div className="flex items-center gap-2">
              <div className="w-px h-6 bg-border" />
              <TurnTimer
                timeRemaining={timeRemaining}
                progress={progress}
                speakerName={activeSpeaker}
                isActive={true}
              />
            </div>
          )}

          {/* Onboarding indicator */}
          {isOnboarding && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="absolute inset-0 w-2 h-2 rounded-full bg-accent animate-ping opacity-30" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                {activeSpeaker} • Gathering context
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isOnboarding && (
            <button
              onClick={() => setIssueDrawerOpen(true)}
              className="font-mono text-[10px] uppercase tracking-wider text-ember-600 hover:text-foreground transition-colors"
            >
              X-Ray View {totalIssues > 0 ? `(${totalIssues})` : ""}
            </button>
          )}
          {turnBasedMode && isActive && (
            <button
              onClick={() => setTimerSettingsOpen(true)}
              className="font-mono text-[10px] uppercase tracking-wider text-ember-600 hover:text-foreground transition-colors"
              title="Timer settings"
            >
              Timer
            </button>
          )}
          {isCompleted ? (
            <span className="font-mono text-[10px] uppercase tracking-wider text-ember-500">
              Session ended
            </span>
          ) : (
            <button
              onClick={endSession}
              className="font-mono text-[10px] uppercase tracking-wider text-ember-600 hover:text-foreground transition-colors"
            >
              End
            </button>
          )}
        </div>
      </div>

      {/* ParallaxPresence */}
      <div className="flex-shrink-0 border-b border-border">
        <ParallaxPresence
          isAnalyzing={isAnalyzing || conductorLoading}
          isSpeaking={isSpeaking}
          statusLabel={
            autoListen.isListening
              ? autoListen.isSpeechActive
                ? "Listening..."
                : "Waiting..."
              : isMicHot
              ? "Recording..."
              : undefined
          }
          voiceWaveform={voiceWaveform}
          voiceEnergy={voiceEnergy}
        />
      </div>

      {/* Three-column layout: Insight panels + Messages */}
      <div className="flex-1 flex min-h-0">
        {/* Left panel — Conversation insights + Person A signals (desktop only) */}
        <div className="hidden md:block w-56 flex-shrink-0 overflow-y-auto">
          <SoloSidebar insights={conversationInsights} />
          <div className="space-y-1 p-2">
            {messages
              .filter((m) => m.sender === "person_a" && m.nvc_analysis)
              .map((m) => (
                <SignalCard
                  key={`signal-${m.id}`}
                  analysis={m.nvc_analysis!}
                  side="left"
                />
              ))}
          </div>
          <ActionPanel
            personName={personAName}
            issues={personAIssues}
            side="left"
            onUpdateStatus={updateIssueStatus}
          />
        </div>

        {/* Center column — Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
          <div className="max-w-2xl mx-auto px-3 py-3 space-y-2">
            {messages.map((msg) => {
              const isPersonA = msg.sender === "person_a";
              const isMediator = msg.sender === "mediator";

              return (
                <div key={msg.id} className="signal-card-enter">
                  <div
                    className={`px-3 py-2 rounded ${
                      isMediator ? "bg-transparent" : "bg-surface"
                    }`}
                  >
                    {/* Sender label */}
                    <span
                      className={`font-mono text-[9px] uppercase tracking-widest ${
                        senderColor(msg.sender)
                      }`}
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
                </div>
              );
            })}

            {/* Loading indicator */}
            {(conductorLoading || isAnalyzing) && (
              <div className="flex justify-center py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-temp-cool animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Right panel — Person B signals + issues (desktop only) */}
        <div className="hidden md:block w-56 flex-shrink-0 overflow-y-auto">
          <div className="space-y-1 p-2">
            {messages
              .filter((m) => m.sender === "person_b" && m.nvc_analysis)
              .map((m) => (
                <SignalCard
                  key={`signal-${m.id}`}
                  analysis={m.nvc_analysis!}
                  side="right"
                />
              ))}
          </div>
          <ActionPanel
            personName={personBName}
            issues={personBIssues}
            side="right"
            onUpdateStatus={updateIssueStatus}
          />
        </div>
      </div>

      {/* Mobile: issue panels below messages */}
      {hasIssues && (
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

      {/* Mediation error */}
      {mediationError && (
        <div className="px-4 py-1.5 border-t border-border flex-shrink-0">
          <p className="font-mono text-xs text-accent">{mediationError}</p>
        </div>
      )}

      {/* Session completed — inline summary + export */}
      {isCompleted && (
        <div className="flex-shrink-0 border-t border-border">
          {summaryLoading && (
            <div className="px-4 py-6 flex items-center justify-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-ember-500">
                Generating summary...
              </span>
            </div>
          )}
          {summaryData && (
            <div className="px-4 py-4 space-y-4 max-h-[50vh] overflow-y-auto">
              <div className="border-l-2 border-accent pl-4 py-1">
                <p className="text-foreground text-sm leading-relaxed font-serif">
                  {summaryData.overallInsight}
                </p>
              </div>
              {summaryData.keyMoments.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
                    Key Moments
                  </p>
                  <ul className="space-y-1.5">
                    {summaryData.keyMoments.map((moment, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-ember-300">
                        <span className="mt-1 block w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                        {moment}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleExportSummary}
                  className="font-mono text-[10px] uppercase tracking-widest text-ember-600 hover:text-foreground transition-colors border border-border px-4 py-2 hover:border-foreground/20"
                >
                  Export
                </button>
                <button
                  onClick={() => router.push("/home")}
                  className="font-mono text-[10px] uppercase tracking-widest text-accent hover:text-foreground transition-colors border border-accent/30 px-4 py-2 hover:border-foreground/20"
                >
                  Home
                </button>
              </div>
            </div>
          )}
          {!summaryLoading && !summaryData && (
            <div className="px-4 py-4 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ember-500">
                Session ended
              </span>
              <button
                onClick={() => router.push("/home")}
                className="font-mono text-[10px] uppercase tracking-widest text-accent hover:text-foreground transition-colors"
              >
                Home
              </button>
            </div>
          )}
        </div>
      )}

      {/* Turn progress bar — right above input for maximum visibility */}
      {!isCompleted && turnBasedMode && isActive && (
        <TurnProgressBar
          progress={progress}
          timeRemaining={timeRemaining}
          speakerName={activeSpeaker}
          isActive={true}
        />
      )}

      {/* Input bar — hidden when session is completed */}
      {!isCompleted && (
      <div className="flex-shrink-0">
        <ActiveSpeakerBar
          activeSpeakerName={activeSpeaker}
          onSend={handleSend}
          disabled={conductorLoading}
          onMicStateChange={setIsMicHot}
          isYourTurn={true}
          timeRemaining={turnBasedMode && isActive ? timeRemaining : undefined}
          autoListen={handsFree}
          autoListenState={{
            isListening: autoListen.isListening,
            interimText: autoListen.interimText,
            isSpeechActive: autoListen.isSpeechActive,
            silenceCountdown: autoListen.silenceCountdown,
          }}
          isTTSSpeaking={isSpeaking}
          isProcessing={isAnalyzing || conductorLoading}
          isMuted={muted}
          onToggleMute={() => setMuted((v) => !v)}
          onModeChange={(mode) => {
            if (mode === "auto") {
              setHandsFree(true);
              setMuted(false);
            } else {
              setHandsFree(false);
              setMuted(false);
            }
          }}
        />
      </div>
      )}

      {/* Issue drawer */}
      <IssueDrawer
        open={issueDrawerOpen}
        onClose={() => setIssueDrawerOpen(false)}
        personAIssues={personAIssues}
        personBIssues={personBIssues}
        personAName={personAName}
        personBName={personBName}
      />

      {/* Timer settings */}
      {timerSettingsOpen && (
        <TimerSettings
          currentDuration={timerDuration}
          onChange={handleTimerDurationChange}
          onClose={() => setTimerSettingsOpen(false)}
        />
      )}

      {/* Full-screen red flash when timer expires */}
      {timerFlash && <div className="timer-expire-overlay" />}
    </div>
  );
}
