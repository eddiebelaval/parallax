export function WaitingState({ roomCode }: { roomCode: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      <div className="w-2 h-2 rounded-full bg-accent animate-pulse mb-6" />
      <p className="text-foreground font-mono text-sm uppercase tracking-wider mb-2">
        Waiting for partner
      </p>
      <p className="text-muted text-sm mb-8">
        Share this room code to get started
      </p>
      <div className="px-6 py-3 border border-border rounded font-mono text-2xl tracking-[0.3em] text-foreground select-all">
        {roomCode}
      </div>
    </div>
  );
}
