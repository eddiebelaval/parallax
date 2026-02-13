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

function SoloWireframe() {
  return (
    <svg
      viewBox="0 0 200 160"
      className="w-full h-auto"
      aria-label="Solo mode wireframe — coaching view with intelligence sidebar"
    >
      {/* Background */}
      <rect width="200" height="160" rx="3" fill="var(--ember-surface)" stroke="var(--ember-border)" strokeWidth="1" />

      {/* === LEFT COLUMN: Orb + Chat === */}

      {/* Orb */}
      <circle cx="55" cy="20" r="8" fill="none" stroke="var(--temp-cool)" strokeWidth="1" opacity="0.6" />
      <circle cx="55" cy="20" r="4" fill="var(--temp-cool)" opacity="0.3" />

      {/* Parallax message */}
      <rect x="12" y="34" width="80" height="6" rx="1" fill="var(--ember-border)" opacity="0.7" />
      <rect x="12" y="43" width="60" height="4" rx="1" fill="var(--ember-border)" opacity="0.4" />

      {/* User message */}
      <rect x="30" y="54" width="75" height="6" rx="1" fill="var(--ember-accent)" opacity="0.2" />
      <rect x="35" y="63" width="65" height="4" rx="1" fill="var(--ember-accent)" opacity="0.12" />

      {/* Parallax reply */}
      <rect x="12" y="74" width="85" height="6" rx="1" fill="var(--ember-border)" opacity="0.7" />
      <rect x="12" y="83" width="70" height="4" rx="1" fill="var(--ember-border)" opacity="0.4" />

      {/* User reply */}
      <rect x="25" y="94" width="78" height="6" rx="1" fill="var(--ember-accent)" opacity="0.2" />

      {/* Input bar with waveform */}
      <rect x="8" y="110" width="100" height="16" rx="2" fill="var(--ember-elevated)" stroke="var(--ember-border)" strokeWidth="0.5" />
      <line x1="14" y1="115" x2="14" y2="121" stroke="var(--temp-cool)" strokeWidth="1" opacity="0.5" />
      <line x1="18" y1="113" x2="18" y2="123" stroke="var(--temp-cool)" strokeWidth="1" opacity="0.6" />
      <line x1="22" y1="115" x2="22" y2="121" stroke="var(--temp-cool)" strokeWidth="1" opacity="0.4" />
      <line x1="26" y1="114" x2="26" y2="122" stroke="var(--temp-cool)" strokeWidth="1" opacity="0.5" />
      <rect x="36" y="116" width="30" height="4" rx="1" fill="var(--ember-border)" opacity="0.3" />

      {/* === VERTICAL DIVIDER === */}
      <line x1="116" y1="8" x2="116" y2="130" stroke="var(--ember-border)" strokeWidth="0.5" opacity="0.6" />

      {/* === RIGHT COLUMN: Intelligence Sidebar === */}

      {/* Identity — name + emotion dot */}
      <rect x="122" y="10" width="28" height="4" rx="1" fill="var(--ember-accent)" opacity="0.5" />
      <circle cx="155" cy="12" r="2" fill="var(--temp-warm)" opacity="0.6" />

      {/* Section: Situation */}
      <rect x="122" y="22" width="36" height="3" rx="1" fill="var(--ember-muted)" opacity="0.4" />
      <rect x="122" y="28" width="68" height="3" rx="1" fill="var(--ember-border)" opacity="0.5" />
      <rect x="122" y="34" width="55" height="3" rx="1" fill="var(--ember-border)" opacity="0.35" />

      {/* Section: Themes — tag chips */}
      <rect x="122" y="44" width="26" height="3" rx="1" fill="var(--ember-muted)" opacity="0.4" />
      <rect x="122" y="50" width="22" height="7" rx="1" fill="none" stroke="var(--ember-border)" strokeWidth="0.5" opacity="0.5" />
      <rect x="148" y="50" width="18" height="7" rx="1" fill="none" stroke="var(--ember-border)" strokeWidth="0.5" opacity="0.5" />
      <rect x="170" y="50" width="20" height="7" rx="1" fill="none" stroke="var(--ember-border)" strokeWidth="0.5" opacity="0.5" />

      {/* Section: Patterns — border-left items */}
      <rect x="122" y="64" width="30" height="3" rx="1" fill="var(--ember-muted)" opacity="0.4" />
      <line x1="122" y1="70" x2="122" y2="78" stroke="var(--temp-warm)" strokeWidth="1.5" opacity="0.5" />
      <rect x="126" y="71" width="60" height="3" rx="1" fill="var(--ember-border)" opacity="0.4" />
      <line x1="122" y1="80" x2="122" y2="88" stroke="var(--temp-warm)" strokeWidth="1.5" opacity="0.5" />
      <rect x="126" y="81" width="50" height="3" rx="1" fill="var(--ember-border)" opacity="0.4" />

      {/* Section: Action Items — checkboxes */}
      <rect x="122" y="96" width="32" height="3" rx="1" fill="var(--ember-muted)" opacity="0.4" />
      <rect x="122" y="103" width="5" height="5" rx="0.5" fill="none" stroke="var(--ember-border)" strokeWidth="0.5" opacity="0.5" />
      <rect x="130" y="104" width="55" height="3" rx="1" fill="var(--ember-border)" opacity="0.4" />
      <rect x="122" y="112" width="5" height="5" rx="0.5" fill="none" stroke="var(--ember-border)" strokeWidth="0.5" opacity="0.5" />
      <rect x="130" y="113" width="45" height="3" rx="1" fill="var(--ember-border)" opacity="0.4" />
      <rect x="122" y="121" width="5" height="5" rx="0.5" fill="none" stroke="var(--temp-cool)" strokeWidth="0.5" opacity="0.5" />
      <line x1="123" y1="123.5" x2="126" y2="125.5" stroke="var(--temp-cool)" strokeWidth="0.5" opacity="0.6" />
      <line x1="126" y1="125.5" x2="130" y2="121.5" stroke="var(--temp-cool)" strokeWidth="0.5" opacity="0.6" />
      <rect x="130" y="122" width="40" height="3" rx="1" fill="var(--ember-border)" opacity="0.25" />

      {/* Label */}
      <text x="100" y="152" textAnchor="middle" className="font-mono" fill="var(--ember-muted)" fontSize="6" letterSpacing="0.1em">
        1:1 COACHING VIEW
      </text>
    </svg>
  );
}

export function ModePreview({ mode }: { mode: "in_person" | "remote" | "solo" }) {
  if (mode === "in_person") return <InPersonWireframe />;
  if (mode === "solo") return <SoloWireframe />;
  return <RemoteWireframe />;
}
