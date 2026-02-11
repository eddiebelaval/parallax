"use client";

import type {
  LensId,
  GottmanResult,
  CbtResult,
  TkiResult,
  DramaTriangleResult,
  NarrativeResult,
  AttachmentResult,
  RestorativeResult,
  ScarfResult,
  OrgJusticeResult,
  PsychSafetyResult,
  JehnsResult,
  PowerResult,
  IbrResult,
} from "@/types/database";
import { LENS_METADATA } from "@/lib/context-modes";

type AnyLensResult =
  | GottmanResult
  | CbtResult
  | TkiResult
  | DramaTriangleResult
  | NarrativeResult
  | AttachmentResult
  | RestorativeResult
  | ScarfResult
  | OrgJusticeResult
  | PsychSafetyResult
  | JehnsResult
  | PowerResult
  | IbrResult;

interface LensDetailPanelProps {
  lensId: LensId;
  result: AnyLensResult;
  onClose: () => void;
}

export function LensDetailPanel({
  lensId,
  result,
  onClose,
}: LensDetailPanelProps) {
  const meta = LENS_METADATA[lensId];

  return (
    <div className="border border-border rounded-sm p-3 mb-2 bg-surface/50">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ember-500">
          {meta.name}
        </p>
        <button
          onClick={onClose}
          className="text-ember-600 hover:text-ember-300 transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M2 2L8 8M8 2L2 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="text-xs leading-relaxed">
        {renderLensContent(lensId, result)}
      </div>
    </div>
  );
}

function renderLensContent(lensId: LensId, result: AnyLensResult) {
  switch (lensId) {
    case "gottman":
      return <GottmanDisplay result={result as GottmanResult} />;
    case "cbt":
      return <CbtDisplay result={result as CbtResult} />;
    case "tki":
      return <TkiDisplay result={result as TkiResult} />;
    case "dramaTriangle":
      return <DramaTriangleDisplay result={result as DramaTriangleResult} />;
    case "narrative":
      return <NarrativeDisplay result={result as NarrativeResult} />;
    case "attachment":
      return <AttachmentDisplay result={result as AttachmentResult} />;
    case "restorative":
      return <RestorativeDisplay result={result as RestorativeResult} />;
    case "scarf":
      return <ScarfDisplay result={result as ScarfResult} />;
    case "orgJustice":
      return <OrgJusticeDisplay result={result as OrgJusticeResult} />;
    case "psychSafety":
      return <PsychSafetyDisplay result={result as PsychSafetyResult} />;
    case "jehns":
      return <JehnsDisplay result={result as JehnsResult} />;
    case "power":
      return <PowerDisplay result={result as PowerResult} />;
    case "ibr":
      return <IbrDisplay result={result as IbrResult} />;
    default:
      return <GenericDisplay result={result} />;
  }
}

/* ─── Per-Lens Renderers ─── */

function GottmanDisplay({ result }: { result: GottmanResult }) {
  return (
    <div className="space-y-2">
      {result.horsemen.length > 0 && (
        <div>
          <Label>Horsemen Detected</Label>
          <div className="flex flex-wrap gap-1.5">
            {result.horsemen.map((h, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 border border-temp-hot/30 text-temp-hot rounded-sm"
              >
                <span className="font-mono text-[10px] uppercase">
                  {h.type}
                </span>
              </span>
            ))}
          </div>
          <div className="mt-1.5 space-y-1">
            {result.horsemen.map((h, i) => (
              <p key={i} className="text-ember-400">
                <span className="text-ember-500 font-mono text-[10px] uppercase">
                  {h.type}:
                </span>{" "}
                {h.evidence}
              </p>
            ))}
          </div>
        </div>
      )}
      {result.repairAttempts.length > 0 && (
        <div>
          <Label>Repair Attempts</Label>
          {result.repairAttempts.map((r, i) => (
            <p key={i} className="text-temp-cool">
              {r}
            </p>
          ))}
        </div>
      )}
      <div className="flex gap-4">
        <div>
          <Label>Ratio</Label>
          <p className="text-ember-400">{result.positiveToNegativeRatio}</p>
        </div>
        <div>
          <Label>Startup</Label>
          <StartupBadge type={result.startupType} />
        </div>
      </div>
    </div>
  );
}

function CbtDisplay({ result }: { result: CbtResult }) {
  return (
    <div className="space-y-2">
      {result.distortions.length > 0 && (
        <div>
          <Label>Cognitive Distortions</Label>
          <div className="space-y-1.5">
            {result.distortions.map((d, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 border border-temp-hot/30 text-temp-hot font-mono text-[9px] uppercase tracking-wider rounded-sm whitespace-nowrap mt-0.5">
                  {d.type}
                </span>
                <span className="text-ember-400">{d.evidence}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {result.coreBeliefHint && (
        <div>
          <Label>Core Belief Hint</Label>
          <p className="text-ember-300 italic">{result.coreBeliefHint}</p>
        </div>
      )}
    </div>
  );
}

function TkiDisplay({ result }: { result: TkiResult }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="px-2 py-0.5 border border-accent/30 text-accent font-mono text-[10px] uppercase tracking-wider rounded-sm">
          {result.mode}
        </span>
        {result.modeShift && (
          <span className="text-ember-500 text-[10px]">
            (shifted: {result.modeShift})
          </span>
        )}
      </div>
      <div className="flex gap-4">
        <div>
          <Label>Assertiveness</Label>
          <MiniBar value={result.assertiveness} color="var(--temp-warm)" />
        </div>
        <div>
          <Label>Cooperativeness</Label>
          <MiniBar value={result.cooperativeness} color="var(--temp-cool)" />
        </div>
      </div>
    </div>
  );
}

function DramaTriangleDisplay({ result }: { result: DramaTriangleResult }) {
  return (
    <div className="space-y-2">
      {result.role && (
        <div>
          <Label>Current Role</Label>
          <span className="px-2 py-0.5 border border-temp-warm/30 text-temp-warm font-mono text-[10px] uppercase tracking-wider rounded-sm">
            {result.role}
          </span>
        </div>
      )}
      {result.roleShifts.length > 0 && (
        <div>
          <Label>Role Shifts</Label>
          {result.roleShifts.map((s, i) => (
            <p key={i} className="text-ember-400">
              {s}
            </p>
          ))}
        </div>
      )}
      {result.rescuerTrap && (
        <p className="text-temp-hot text-[11px]">
          Rescuer trap detected — helping to avoid own discomfort
        </p>
      )}
    </div>
  );
}

function NarrativeDisplay({ result }: { result: NarrativeResult }) {
  return (
    <div className="space-y-2">
      {result.totalizingNarratives.length > 0 && (
        <div>
          <Label>Totalizing Narratives</Label>
          {result.totalizingNarratives.map((n, i) => (
            <p key={i} className="text-ember-400 italic">
              &ldquo;{n}&rdquo;
            </p>
          ))}
        </div>
      )}
      {result.identityClaims.length > 0 && (
        <div>
          <Label>Identity Claims</Label>
          {result.identityClaims.map((c, i) => (
            <p key={i} className="text-ember-400">
              {c}
            </p>
          ))}
        </div>
      )}
      {result.reauthoringSuggestion && (
        <div>
          <Label>Re-authoring</Label>
          <p className="text-temp-cool">{result.reauthoringSuggestion}</p>
        </div>
      )}
    </div>
  );
}

function AttachmentDisplay({ result }: { result: AttachmentResult }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Label>Style</Label>
        <span className="px-2 py-0.5 border border-border text-foreground font-mono text-[10px] uppercase tracking-wider rounded-sm">
          {result.style}
        </span>
      </div>
      {result.pursueWithdrawDynamic && (
        <p className="text-temp-warm text-[11px]">
          Pursue-withdraw pattern active
        </p>
      )}
      <p className="text-ember-400">{result.activationSignal}</p>
    </div>
  );
}

function RestorativeDisplay({ result }: { result: RestorativeResult }) {
  return (
    <div className="space-y-2">
      <div>
        <Label>Harm Identified</Label>
        <p className="text-ember-400">{result.harmIdentified}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Needs of Harmed</Label>
          <ul className="space-y-0.5">
            {result.needsOfHarmed.map((n, i) => (
              <li key={i} className="text-ember-400 flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-temp-warm mt-1.5 flex-shrink-0" />
                {n}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Label>Needs of Harmer</Label>
          <ul className="space-y-0.5">
            {result.needsOfHarmer.map((n, i) => (
              <li key={i} className="text-ember-400 flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-ember-600 mt-1.5 flex-shrink-0" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <Label>Repair Pathway</Label>
        <p className="text-temp-cool">{result.repairPathway}</p>
      </div>
    </div>
  );
}

function ScarfDisplay({ result }: { result: ScarfResult }) {
  return (
    <div className="space-y-2">
      <div>
        <Label>Threats Detected</Label>
        <div className="space-y-1">
          {result.threats.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ember-400 w-20">
                {t.domain}
              </span>
              <MiniBar value={t.severity} color="var(--temp-hot)" />
            </div>
          ))}
        </div>
      </div>
      <p className="text-ember-300">
        <span className="text-ember-600 font-mono text-[10px] uppercase">
          Primary:
        </span>{" "}
        {result.primaryThreat}
      </p>
    </div>
  );
}

function OrgJusticeDisplay({ result }: { result: OrgJusticeResult }) {
  return (
    <div className="space-y-2">
      {result.justiceType && (
        <div className="flex items-center gap-2">
          <Label>Type</Label>
          <span className="px-2 py-0.5 border border-border text-foreground font-mono text-[10px] uppercase tracking-wider rounded-sm">
            {result.justiceType}
          </span>
        </div>
      )}
      <div>
        <Label>Perceived Violation</Label>
        <p className="text-ember-400">{result.perceivedViolation}</p>
      </div>
      <div>
        <Label>Fairness Frame</Label>
        <p className="text-ember-400">{result.fairnessFrame}</p>
      </div>
    </div>
  );
}

function PsychSafetyDisplay({ result }: { result: PsychSafetyResult }) {
  const safetyColor =
    result.safetyLevel === "high"
      ? "text-temp-cool"
      : result.safetyLevel === "low"
        ? "text-temp-hot"
        : "text-temp-warm";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>Safety Level</Label>
        <span className={`font-mono text-[10px] uppercase ${safetyColor}`}>
          {result.safetyLevel}
        </span>
      </div>
      {result.riskSignals.length > 0 && (
        <div>
          <Label>Risk Signals</Label>
          {result.riskSignals.map((s, i) => (
            <p key={i} className="text-ember-400">
              {s}
            </p>
          ))}
        </div>
      )}
      {result.silencedTopics.length > 0 && (
        <div>
          <Label>Silenced Topics</Label>
          {result.silencedTopics.map((t, i) => (
            <p key={i} className="text-ember-400 italic">
              {t}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function JehnsDisplay({ result }: { result: JehnsResult }) {
  const riskColor =
    result.escalationRisk === "low"
      ? "text-temp-cool"
      : result.escalationRisk === "high"
        ? "text-temp-hot"
        : "text-temp-warm";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div>
          <Label>Conflict Type</Label>
          <span className="font-mono text-[10px] uppercase text-foreground">
            {result.conflictType}
          </span>
        </div>
        <div>
          <Label>Escalation Risk</Label>
          <span className={`font-mono text-[10px] uppercase ${riskColor}`}>
            {result.escalationRisk}
          </span>
        </div>
      </div>
      {result.taskToRelationshipSpillover && (
        <p className="text-temp-hot text-[11px]">
          Task-to-relationship spillover detected
        </p>
      )}
    </div>
  );
}

function PowerDisplay({ result }: { result: PowerResult }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>Dynamic</Label>
        <span className="font-mono text-[10px] uppercase text-foreground">
          {result.powerDynamic}
        </span>
      </div>
      {result.powerMoves.length > 0 && (
        <div>
          <Label>Power Moves</Label>
          {result.powerMoves.map((m, i) => (
            <p key={i} className="text-ember-400">
              {m}
            </p>
          ))}
        </div>
      )}
      {result.silencingPatterns.length > 0 && (
        <div>
          <Label>Silencing Patterns</Label>
          {result.silencingPatterns.map((p, i) => (
            <p key={i} className="text-temp-hot">
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function IbrDisplay({ result }: { result: IbrResult }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Positions (Stated)</Label>
          {result.positions.map((p, i) => (
            <p key={i} className="text-ember-400">
              {p}
            </p>
          ))}
        </div>
        <div>
          <Label>Interests (Hidden)</Label>
          {result.interests.map((int, i) => (
            <p key={i} className="text-temp-cool">
              {int}
            </p>
          ))}
        </div>
      </div>
      <div>
        <Label>Interest Behind Position</Label>
        <p className="text-ember-300">{result.interestBehindPosition}</p>
      </div>
      {result.commonGround && (
        <div>
          <Label>Common Ground</Label>
          <p className="text-temp-cool">{result.commonGround}</p>
        </div>
      )}
    </div>
  );
}

function GenericDisplay({ result }: { result: AnyLensResult }) {
  return (
    <pre className="text-ember-400 text-[10px] overflow-auto">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

/* ─── Shared Sub-components ─── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-0.5">
      {children}
    </p>
  );
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-ember-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.round(value * 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="font-mono text-[10px] text-ember-500">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function StartupBadge({ type }: { type: string }) {
  const color =
    type === "harsh"
      ? "text-temp-hot border-temp-hot/30"
      : type === "soft"
        ? "text-temp-cool border-temp-cool/30"
        : "text-ember-400 border-border";

  return (
    <span
      className={`px-2 py-0.5 border font-mono text-[10px] uppercase tracking-wider rounded-sm ${color}`}
    >
      {type}
    </span>
  );
}
