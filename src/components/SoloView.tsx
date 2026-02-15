"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ParallaxPresence } from "@/components/inperson/ParallaxPresence";
import { ActiveSpeakerBar } from "@/components/inperson/ActiveSpeakerBar";
import { SoloSidebar } from "@/components/SoloSidebar";
import { useSoloChat } from "@/hooks/useSoloChat";
import { useParallaxVoice } from "@/hooks/useParallaxVoice";
import { useAutoListen } from "@/hooks/useAutoListen";
import { useAuth } from "@/hooks/useAuth";
import { useProfileConcierge } from "@/hooks/useProfileConcierge";
import { useArchitectMode } from "@/hooks/useArchitectMode";
import ConfirmationModal from "./ConfirmationModal";
import { buildExportHtml } from "@/lib/export-html";
import { isCreator } from "@/lib/creator";
import { PlayIcon, CopyIcon, ShareIcon } from "@/components/icons";
import type { Session } from "@/types/database";

interface SoloViewProps {
  session: Session;
  roomCode: string;
}

function SoloMessageBubble({
  sender,
  content,
  userName,
  onReplay,
  onCopy,
  onShare,
}: {
  sender: "person_a" | "mediator";
  content: string;
  userName?: string;
  onReplay?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
}) {
  const isParallax = sender === "mediator";
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className={`px-4 py-3 border-l-2 ${
        isParallax
          ? "border-l-temp-cool bg-temp-cool/5"
          : "border-l-accent bg-accent/5"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600 mb-1">
        {isParallax ? "Ava" : (userName || "You")}
      </p>
      <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
      <div className="flex items-center gap-3 mt-2">
        {isParallax && onReplay && (
          <button
            onClick={onReplay}
            className="text-ember-600 hover:text-foreground transition-colors"
            aria-label="Replay speech"
          >
            <PlayIcon size={14} />
          </button>
        )}
        <button
          onClick={handleCopy}
          className="text-ember-600 hover:text-foreground transition-colors"
          aria-label="Copy message"
        >
          {copied ? (
            <span className="font-mono text-[9px] uppercase tracking-widest text-temp-cool">Copied</span>
          ) : (
            <CopyIcon size={14} />
          )}
        </button>
        {isParallax && onShare && (
          <button
            onClick={onShare}
            className="text-ember-600 hover:text-foreground transition-colors"
            aria-label="Share message"
          >
            <ShareIcon size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export function SoloView({ session, roomCode }: SoloViewProps) {
  const { user } = useAuth();
  const userId = user?.id || session.person_a_user_id || undefined;
  const godmode = isCreator(user?.email);
  const { messages, insights, loading, error, initialLoading, sendMessage, sendGreeting } =
    useSoloChat(session.id, userId);
  const { speak, isSpeaking, waveform, energy } = useParallaxVoice();
  const scrollRef = useRef<HTMLDivElement>(null);
  const greetingTriggered = useRef(false);
  const lastSpokenRef = useRef<string | null>(null);

  const [creatorMode, setCreatorMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [handsFree, setHandsFree] = useState(true);
  const [muted, setMuted] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDangerous?: boolean;
  } | null>(null);
  const profileConcierge = useProfileConcierge();
  const { isActive: architectModeActive } = useArchitectMode();

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

  const handleSend = useCallback(async (content: string) => {
    // Architect mode: meta-conversation with Ava about her architecture
    if (architectModeActive) {
      setCommandFeedback('🏗️ Consulting architecture...');
      try {
        const res = await fetch('/api/architect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content }),
        });

        if (!res.ok) {
          setCommandFeedback('✗ Architect mode unavailable');
          setTimeout(() => setCommandFeedback(null), 5000);
          return;
        }

        const data = await res.json();

        // Show Ava's architectural response in feedback area
        setCommandFeedback(`🏗️ Ava: ${data.message}`);
        // Auto-clear after 30 seconds (long enough to read)
        setTimeout(() => setCommandFeedback(null), 30000);
      } catch {
        setCommandFeedback('✗ Architect mode connection failed');
        setTimeout(() => setCommandFeedback(null), 5000);
      }
      return;
    }

    // Voice command interception: check for profile commands before sending
    if (profileConcierge.isCommand(content)) {
      try {
        const response = await profileConcierge.processCommand(content);
        if (response.requires_confirmation) {
          // Show confirmation modal
          setConfirmationModal({
            isOpen: true,
            title: 'Confirm Action',
            message: response.confirmation_prompt || 'Are you sure?',
            isDangerous: content.toLowerCase().includes('delete'),
            onConfirm: async () => {
              const result = await profileConcierge.confirm();
              setConfirmationModal(null);
              setCommandFeedback(result.success ? `✓ ${result.message}` : `✗ ${result.message}`);
              setTimeout(() => setCommandFeedback(null), 5000);
            },
          });
        } else {
          setCommandFeedback(response.success ? `✓ ${response.message}` : `✗ ${response.message}`);
          setTimeout(() => setCommandFeedback(null), 5000);
        }
      } catch {
        setCommandFeedback('✗ Failed to process profile command');
        setTimeout(() => setCommandFeedback(null), 5000);
      }
      return;
    }
    sendMessage(content);
  }, [sendMessage, profileConcierge, architectModeActive]);

  // Auto-listen: hands-free mode for solo therapy
  const autoListen = useAutoListen({
    enabled: handsFree && !muted && !loading,
    isTTSPlaying: isSpeaking,
    onTranscript: handleSend,
    silenceTimeoutMs: 3500,
  });

  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (messages.length === 0 || exporting) return;
    setExporting(true);

    const prefix = creatorMode ? 'parallax-creator-interview' : `parallax-${roomCode.toLowerCase()}`;
    const filename = `${prefix}-${new Date().toISOString().slice(0, 10)}.html`;

    // Acquire file handle IMMEDIATELY (must happen in user gesture context)
    let fileHandle: FileSystemFileHandle | null = null;
    if ('showSaveFilePicker' in window) {
      try {
        fileHandle = await (window as unknown as { showSaveFilePicker: (opts: Record<string, unknown>) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'HTML Document',
            accept: { 'text/html': ['.html'] },
          }],
        });
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') {
          setExporting(false);
          return;
        }
        // File picker not supported or failed — will fall through to auto-download
      }
    }

    const html = buildExportHtml(messages, insights, roomCode);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });

    // Write to the file handle if we got one
    if (fileHandle) {
      try {
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        setExporting(false);
        return;
      } catch {
        // Fall through to auto-download
      }
    }

    // Fallback: auto-download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    setExporting(false);
  }

  return (
    <div className={`flex-1 flex flex-row h-full ${creatorMode ? 'ring-1 ring-temp-cool/30' : ''}`}>
      {/* Creator mode ambient glow */}
      {creatorMode && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(106, 171, 142, 0.08) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className={`px-4 py-2 border-b flex items-center justify-between flex-shrink-0 ${creatorMode ? 'border-temp-cool/30 bg-temp-cool/[0.03]' : 'border-border'}`}>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wider text-foreground">
              {roomCode}
            </span>
            {godmode && !creatorMode && (
              <span className="font-mono text-[8px] uppercase tracking-widest text-temp-cool/60 border border-temp-cool/20 px-1.5 py-0.5">
                Creator
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={messages.length === 0 || exporting}
              className="font-mono text-[9px] uppercase tracking-widest text-ember-600 hover:text-ember-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {exporting ? 'Preparing...' : 'Export'}
            </button>
            {/* Mobile sidebar toggle */}
            {!creatorMode && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden font-mono text-[9px] uppercase tracking-widest text-ember-600 hover:text-ember-400 transition-colors"
              >
                {sidebarOpen ? "Chat" : "Insights"}
              </button>
            )}
            <span className={`font-mono text-[10px] uppercase tracking-widest ${creatorMode ? 'text-temp-cool' : 'text-temp-cool'}`}>
              {creatorMode ? 'Creator Interview' : 'Solo'}
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
              userName={godmode ? "Eddie" : undefined}
              onReplay={msg.sender === "mediator" ? () => speak(msg.content) : undefined}
              onCopy={() => navigator.clipboard.writeText(msg.content)}
              onShare={msg.sender === "mediator" ? () => {
                if (navigator.share) {
                  navigator.share({ text: msg.content }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(msg.content);
                }
              } : undefined}
            />
          ))}

          {loading && messages.length > 0 && messages[messages.length - 1]?.sender === "person_a" && (
            <div className="px-4 py-3 border-l-2 border-l-temp-cool bg-temp-cool/5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600 mb-1">
                Ava
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

          {commandFeedback && (
            <div className="px-4 py-2 border border-temp-cool/30 bg-temp-cool/5 rounded">
              <p className="font-mono text-xs text-temp-cool">{commandFeedback}</p>
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
          architectMode={architectModeActive}
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

      {/* Desktop Sidebar (hidden in creator mode) */}
      {!creatorMode && (
        <div className="hidden md:block w-72 border-l border-border overflow-y-auto">
          <SoloSidebar insights={insights} />
        </div>
      )}

      {/* Mobile Sidebar Overlay (hidden in creator mode) */}
      {!creatorMode && sidebarOpen && (
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

      {/* Confirmation Modal */}
      {confirmationModal && (
        <ConfirmationModal
          {...confirmationModal}
          onCancel={() => {
            profileConcierge.cancel();
            setConfirmationModal(null);
          }}
        />
      )}
    </div>
  );
}
