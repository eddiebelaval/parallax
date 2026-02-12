"use client";

/**
 * ModePreview — SVG wireframe previews of the two session modes.
 * In-Person: orb at top, center message column, side issue panels, speaker bar.
 * Remote: two side-by-side panels, signal rail between, message input.
 */

function InPersonWireframe() {
  return (
    <svg
      viewBox="0 0 200 140"
      className="w-full h-auto"
      aria-label="In-person mode wireframe"
    >
      {/* Background */}
      <rect width="200" height="140" rx="3" fill="var(--ember-surface)" stroke="var(--ember-border)" strokeWidth="1" />

      {/* Orb at top center */}
      <circle cx="100" cy="22" r="10" fill="none" stroke="var(--ember-accent)" strokeWidth="1" opacity="0.6" />
      <circle cx="100" cy="22" r="5" fill="var(--ember-accent)" opacity="0.3" />

      {/* Center message column */}
      <rect x="50" y="40" width="100" height="8" rx="1" fill="var(--ember-border)" opacity="0.8" />
      <rect x="55" y="52" width="90" height="6" rx="1" fill="var(--ember-border)" opacity="0.5" />
      <rect x="50" y="64" width="100" height="8" rx="1" fill="var(--ember-border)" opacity="0.8" />
      <rect x="55" y="76" width="85" height="6" rx="1" fill="var(--ember-border)" opacity="0.5" />

      {/* Left issue panel */}
      <rect x="8" y="40" width="34" height="44" rx="2" fill="none" stroke="var(--ember-accent)" strokeWidth="0.5" opacity="0.4" />
      <rect x="12" y="44" width="26" height="3" rx="1" fill="var(--ember-accent)" opacity="0.3" />
      <rect x="12" y="50" width="20" height="3" rx="1" fill="var(--ember-accent)" opacity="0.2" />
      <rect x="12" y="56" width="24" height="3" rx="1" fill="var(--ember-accent)" opacity="0.2" />

      {/* Right issue panel */}
      <rect x="158" y="40" width="34" height="44" rx="2" fill="none" stroke="var(--ember-hot)" strokeWidth="0.5" opacity="0.4" />
      <rect x="162" y="44" width="26" height="3" rx="1" fill="var(--ember-hot)" opacity="0.3" />
      <rect x="162" y="50" width="22" height="3" rx="1" fill="var(--ember-hot)" opacity="0.2" />

      {/* Speaker bar at bottom */}
      <rect x="8" y="96" width="184" height="24" rx="2" fill="var(--ember-elevated)" stroke="var(--ember-border)" strokeWidth="0.5" />
      {/* Waveform lines */}
      <line x1="20" y1="104" x2="20" y2="112" stroke="var(--temp-cool)" strokeWidth="1.5" opacity="0.6" />
      <line x1="26" y1="102" x2="26" y2="114" stroke="var(--temp-cool)" strokeWidth="1.5" opacity="0.7" />
      <line x1="32" y1="105" x2="32" y2="111" stroke="var(--temp-cool)" strokeWidth="1.5" opacity="0.5" />
      <line x1="38" y1="103" x2="38" y2="113" stroke="var(--temp-cool)" strokeWidth="1.5" opacity="0.6" />
      <line x1="44" y1="106" x2="44" y2="110" stroke="var(--temp-cool)" strokeWidth="1.5" opacity="0.4" />
      {/* Speaker name */}
      <rect x="60" y="105" width="40" height="5" rx="1" fill="var(--ember-border)" opacity="0.6" />

      {/* Label */}
      <text x="100" y="136" textAnchor="middle" className="font-mono" fill="var(--ember-muted)" fontSize="6" letterSpacing="0.1em">
        X-RAY GLANCE VIEW
      </text>
    </svg>
  );
}

function RemoteWireframe() {
  return (
    <svg
      viewBox="0 0 200 160"
      className="w-full h-auto"
      aria-label="Remote mode wireframe — single panel view"
    >
      {/* Background — single panel (one person's view) */}
      <rect width="200" height="160" rx="3" fill="var(--ember-surface)" stroke="var(--ember-border)" strokeWidth="1" />

      {/* Signal rail — thin left edge */}
      <rect x="8" y="8" width="5" height="120" rx="1" fill="var(--ember-elevated)" />
      <rect x="9" y="10" width="3" height="12" rx="1" fill="var(--temp-cool)" opacity="0.5" />
      <rect x="9" y="26" width="3" height="14" rx="1" fill="var(--temp-warm)" opacity="0.5" />
      <rect x="9" y="44" width="3" height="10" rx="1" fill="var(--temp-warm)" opacity="0.6" />
      <rect x="9" y="58" width="3" height="16" rx="1" fill="var(--temp-hot)" opacity="0.5" />
      <rect x="9" y="78" width="3" height="12" rx="1" fill="var(--temp-cool)" opacity="0.5" />
      <rect x="9" y="94" width="3" height="14" rx="1" fill="var(--temp-cool)" opacity="0.6" />
      <rect x="9" y="112" width="3" height="10" rx="1" fill="var(--temp-cool)" opacity="0.4" />

      {/* Message from other person */}
      <rect x="22" y="10" width="120" height="7" rx="1" fill="var(--ember-border)" opacity="0.7" />
      <rect x="22" y="20" width="90" height="5" rx="1" fill="var(--ember-border)" opacity="0.4" />

      {/* Your message */}
      <rect x="60" y="34" width="130" height="7" rx="1" fill="var(--ember-accent)" opacity="0.2" />
      <rect x="70" y="44" width="120" height="5" rx="1" fill="var(--ember-accent)" opacity="0.12" />

      {/* Analysis reveal — NVC translation of your message */}
      <rect x="22" y="56" width="168" height="38" rx="2" fill="var(--temp-cool)" opacity="0.06" />
      <rect x="28" y="62" width="30" height="3" rx="1" fill="var(--temp-cool)" opacity="0.35" />
      <rect x="28" y="68" width="150" height="3" rx="1" fill="var(--temp-cool)" opacity="0.2" />
      <rect x="28" y="74" width="40" height="3" rx="1" fill="var(--temp-cool)" opacity="0.35" />
      <rect x="28" y="80" width="130" height="3" rx="1" fill="var(--temp-cool)" opacity="0.2" />
      <rect x="28" y="86" width="80" height="3" rx="1" fill="var(--temp-cool)" opacity="0.15" />

      {/* Another message from other person */}
      <rect x="22" y="102" width="100" height="7" rx="1" fill="var(--ember-border)" opacity="0.7" />
      <rect x="22" y="112" width="140" height="5" rx="1" fill="var(--ember-border)" opacity="0.4" />

      {/* Input bar at bottom */}
      <rect x="8" y="132" width="184" height="18" rx="3" fill="var(--ember-elevated)" stroke="var(--ember-border)" strokeWidth="0.5" />
      <rect x="16" y="138" width="60" height="5" rx="1" fill="var(--ember-border)" opacity="0.3" />

      {/* Label */}
      <text x="100" y="156" textAnchor="middle" className="font-mono" fill="var(--ember-muted)" fontSize="6" letterSpacing="0.1em">
        THERAPIST REVIEW VIEW
      </text>
    </svg>
  );
}

export function ModePreview({ mode }: { mode: "in_person" | "remote" }) {
  return mode === "in_person" ? <InPersonWireframe /> : <RemoteWireframe />;
}
