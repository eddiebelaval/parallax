export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <p className="section-indicator justify-center mb-6">
          Conflict Resolution
        </p>
        <h1 className="text-4xl mb-4">
          See the other side
        </h1>
        <p className="text-muted text-lg leading-relaxed mb-10">
          Real-time two-person sessions that help you understand each
          other through structured, turn-based dialogue.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="px-6 py-3 bg-accent text-factory-black font-mono text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
            Create Session
          </button>
          <button className="px-6 py-3 border border-border text-foreground font-mono text-sm uppercase tracking-wider hover:border-factory-gray-600 transition-colors">
            Join Session
          </button>
        </div>
      </div>
    </div>
  );
}
