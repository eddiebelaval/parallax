import { SessionView } from "@/components/SessionView";

interface SessionPageProps {
  params: Promise<{ code: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { code } = await params;

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <SessionView roomCode={code} />
    </div>
  );
}
