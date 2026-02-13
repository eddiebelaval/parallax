"use client";

import { useState, useEffect } from "react";
import { SessionSummary } from "./SessionSummary";
import { XRayGlanceView } from "./inperson/XRayGlanceView";
import { RemoteView } from "./RemoteView";
import { SoloView } from "./SoloView";
import { useSession } from "@/hooks/useSession";

interface SessionViewProps {
  roomCode: string;
}

/**
 * SideChooser — shown when someone navigates directly to /session/CODE
 * without going through TheDoor (no localStorage side identity).
 */
function SideChooser({
  roomCode,
  onChoose,
}: {
  roomCode: string;
  onChoose: (side: "a" | "b") => void;
}) {
  function chooseSide(side: "a" | "b") {
    if (typeof window !== "undefined") {
      localStorage.setItem(`parallax-side-${roomCode}`, side);
    }
    onChoose(side);
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="max-w-sm mx-auto text-center space-y-6">
        <p className="font-mono text-xs uppercase tracking-wider text-ember-500">
          Session {roomCode}
        </p>
        <p className="text-foreground text-sm">
          How are you joining this conversation?
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => chooseSide("a")}
            className="px-6 py-4 border border-border text-foreground font-mono text-sm uppercase tracking-wider rounded hover:border-accent transition-colors"
          >
            I started this
          </button>
          <button
            onClick={() => chooseSide("b")}
            className="px-6 py-4 border border-border text-foreground font-mono text-sm uppercase tracking-wider rounded hover:border-success transition-colors"
          >
            I was invited
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * SessionView — pure router for session rendering.
 *
 * Routing logic:
 * 1. Loading → spinner
 * 2. Completed → SessionSummary
 * 3. Solo → SoloView
 * 4. In-person → XRayGlanceView
 * 5. Remote with localSide → RemoteView
 * 6. Remote without localSide → SideChooser
 */
export function SessionView({ roomCode }: SessionViewProps) {
  const { session, loading: sessionLoading } = useSession(roomCode);

  // Read localSide from localStorage
  const [localSide, setLocalSide] = useState<"a" | "b" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(`parallax-side-${roomCode}`);
    if (saved === "a" || saved === "b") {
      setLocalSide(saved);
    }
  }, [roomCode]);

  const personAName = session?.person_a_name ?? "Person A";
  const personBName = session?.person_b_name ?? "Person B";
  const isCompleted = session?.status === "completed";

  // 1. Loading
  if (sessionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
      </div>
    );
  }

  // 2. Completed — remote/in-person stay inline (summary shown within the session view)
  //    Only solo uses the standalone SessionSummary page
  if (isCompleted && session?.mode === 'solo') {
    return (
      <div className="flex-1 flex flex-col">
        <SessionSummary
          roomCode={roomCode}
          personAName={personAName}
          personBName={personBName}
          mode="remote"
        />
      </div>
    );
  }

  // 3. Solo mode — delegate to SoloView (skip SideChooser entirely)
  if (session?.mode === "solo") {
    return <SoloView session={session} roomCode={roomCode} />;
  }

  // 4. In-person mode — delegate to XRayGlanceView
  if (session?.mode === "in_person") {
    return (
      <XRayGlanceView
        session={session}
        roomCode={roomCode}
      />
    );
  }

  // 5. Remote mode with localSide → RemoteView
  if (localSide && session) {
    return (
      <RemoteView
        session={session}
        roomCode={roomCode}
        localSide={localSide}
      />
    );
  }

  // 6. Remote mode without localSide (direct URL visit) → SideChooser
  return (
    <SideChooser
      roomCode={roomCode}
      onChoose={setLocalSide}
    />
  );
}
