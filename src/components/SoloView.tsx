"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ParallaxPresence } from "@/components/inperson/ParallaxPresence";
import { ActiveSpeakerBar } from "@/components/inperson/ActiveSpeakerBar";
import { SoloSidebar } from "@/components/SoloSidebar";
import { useSoloChat } from "@/hooks/useSoloChat";
import { useParallaxVoice } from "@/hooks/useParallaxVoice";
import { useAutoListen } from "@/hooks/useAutoListen";
import { useAuth } from "@/hooks/useAuth";
import { buildExportHtml } from "@/lib/export-html";
import type { Session } from "@/types/database";

interface SoloViewProps {
  session: Session;
  roomCode: string;
}

function SoloMessageBubble({
  sender,
  content,
}: {
  sender: "person_a" | "mediator";
  content: string;
}) {
  const isParallax = sender === "mediator";

  return (
    <div
      className={`px-4 py-3 border-l-2 ${
        isParallax
          ? "border-l-temp-cool bg-temp-cool/5"
          : "border-l-accent bg-accent/5"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600 mb-1">
        {isParallax ? "Parallax" : "You"}
      </p>
      <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}

export function SoloView({ session, roomCode }: SoloViewProps) {
  const { user } = useAuth();
  const userId = user?.id || session.person_a_user_id || undefined;
  const { messages, insights, loading, error, initialLoading, sendMessage, sendGreeting } =
    useSoloChat(session.id, userId);
  const { speak, isSpeaking, waveform, energy } = useParallaxVoice();
  const scrollRef = useRef<HTMLDivElement>(null);
  const greetingTriggered = useRef(false);
  const lastSpokenRef = useRef<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [handsFree, setHandsFree] = useState(true);
  const [muted, setMuted] = useState(false);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send greeting once when messages load and none exist
  useEffect(() => {
    if (initialLoading || greetingTriggered.current) return;
    if (messages.length === 0) {
      greetingTriggered.current = true;
      sendGreeting();
    } else {
      greetingTriggered.current = true;
    }
  }, [initialLoading, messages.length, sendGreeting]);

  // Auto-speak Parallax responses
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg.sender === "mediator" &&
      lastMsg.id !== lastSpokenRef.current
    ) {
      lastSpokenRef.current = lastMsg.id;
      speak(lastMsg.content);
    }
  }, [messages, speak]);

  const handleSend = useCallback((content: string) => {
    sendMessage(content);
  }, [sendMessage]);

  // Auto-listen: hands-free mode for solo therapy
  const autoListen = useAutoListen({
    enabled: handsFree && !muted && !loading,
    isTTSPlaying: isSpeaking,
    onTranscript: handleSend,
    silenceTimeoutMs: 5000,
  });

  function handleExport() {
    if (messages.length === 0) return;
    const html = buildExportHtml(messages, insights, roomCode);
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
  }

  return (
    <div className="flex-1 flex flex-row h-full">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2 border-b border-border flex items-center justify-between flex-shrink-0">
          <span className="font-mono text-xs tracking-wider text-foreground">
            {roomCode}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={messages.length === 0}
              className="font-mono text-[9px] uppercase tracking-widest text-ember-600 hover:text-ember-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Export
            </button>
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden font-mono text-[9px] uppercase tracking-widest text-ember-600 hover:text-ember-400 transition-colors"
            >
              {sidebarOpen ? "Chat" : "Insights"}
            </button>
            <span className="font-mono text-[10px] uppercase tracking-widest text-temp-cool">
              Solo
            </span>
          </div>
        </div>

        {/* Parallax Presence Orb */}
        <ParallaxPresence
          isAnalyzing={loading}
          isSpeaking={isSpeaking}
          voiceWaveform={waveform}
          voiceEnergy={energy}
        />

        {/* Message Thread */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        >
          {initialLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-2 h-2 rounded-full bg-temp-cool animate-pulse" />
            </div>
          )}

          {messages.map((msg) => (
            <SoloMessageBubble
              key={msg.id}
              sender={msg.sender}
              content={msg.content}
            />
          ))}

          {loading && messages.length > 0 && messages[messages.length - 1]?.sender === "person_a" && (
            <div className="px-4 py-3 border-l-2 border-l-temp-cool bg-temp-cool/5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600 mb-1">
                Parallax
              </p>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-temp-cool animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-temp-cool animate-pulse delay-75" />
                <span className="w-1.5 h-1.5 rounded-full bg-temp-cool animate-pulse delay-150" />
              </div>
            </div>
          )}

          {error && (
            <div className="px-4 py-2 border border-accent/30 bg-accent/5 rounded">
              <p className="font-mono text-xs text-accent">{error}</p>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ActiveSpeakerBar
          activeSpeakerName="You"
          onSend={handleSend}
          disabled={loading}
          autoListen={handsFree}
          autoListenState={{
            isListening: autoListen.isListening,
            interimText: autoListen.interimText,
            isSpeechActive: autoListen.isSpeechActive,
            silenceCountdown: autoListen.silenceCountdown,
          }}
          isTTSSpeaking={isSpeaking}
          isProcessing={loading}
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

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 border-l border-border overflow-y-auto">
        <SoloSidebar insights={insights} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative ml-auto w-72 bg-background border-l border-border overflow-y-auto">
            <div className="px-4 py-2 border-b border-border flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest text-ember-600">
                Insights
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="font-mono text-[9px] uppercase tracking-widest text-ember-600 hover:text-ember-400"
              >
                Close
              </button>
            </div>
            <SoloSidebar insights={insights} />
          </div>
        </div>
      )}
    </div>
  );
}
