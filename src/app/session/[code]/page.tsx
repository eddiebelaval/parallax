import { SessionView } from "@/components/SessionView";

interface SessionPageProps {
  params: Promise<{ code: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { code } = await params;

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-57px)]">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <p className="section-indicator">Session</p>
        <span className="font-mono text-xs tracking-widest text-ember-500">
          {code}
        </span>
      </div>
      <SessionView roomCode={code} />
    </div>
  );
}
