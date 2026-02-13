'use client'

import { useSettings, type ParallaxSettings } from '@/hooks/useSettings'
import { ParallaxFAB } from '@/components/home/ParallaxFAB'

const CONTEXT_MODE_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: 'intimate', label: 'Intimate', desc: 'Partners, close relationships' },
  { value: 'family', label: 'Family', desc: 'Parent-child, siblings, family dynamics' },
  { value: 'professional_peer', label: 'Professional (Peer)', desc: 'Colleagues, collaborators' },
  { value: 'professional_hierarchical', label: 'Professional (Hierarchical)', desc: 'Manager-report, mentor-mentee' },
  { value: 'transactional', label: 'Transactional', desc: 'Service providers, brief exchanges' },
  { value: 'civil_structural', label: 'Civil / Structural', desc: 'Legal, institutional, systemic' },
]

function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 border border-border rounded-lg">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted mt-1">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-success' : 'bg-border'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-foreground transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings()

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Settings
          </span>
        </div>
        <h1 className="font-serif text-3xl text-foreground tracking-tight">
          Preferences
        </h1>
        <p className="text-sm text-muted mt-2">
          Adjust how Parallax works for you. Changes take effect immediately.
        </p>
      </div>

      {/* Display Name */}
      <div className="mb-8">
        <h2 className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">
          Identity
        </h2>
        <div className="p-4 border border-border rounded-lg">
          <label className="block text-sm text-foreground mb-2">Display Name</label>
          <input
            type="text"
            value={settings.display_name}
            onChange={(e) => updateSetting('display_name', e.target.value)}
            maxLength={50}
            className="w-full px-3 py-2 bg-surface border border-border text-foreground text-sm rounded placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
            placeholder="Your name"
          />
          <p className="text-xs text-muted mt-2">Shown on your messages during sessions</p>
        </div>
      </div>

      {/* Input */}
      <div className="mb-8">
        <h2 className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">
          Input
        </h2>
        <ToggleSwitch
          label="Voice Input"
          description="Show the microphone button for voice-based input"
          checked={settings.voice_enabled}
          onChange={(val) => updateSetting('voice_enabled', val)}
        />
      </div>

      {/* Analysis Display */}
      <div className="mb-8">
        <h2 className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">
          Analysis Display
        </h2>
        <div className="space-y-3">
          <ToggleSwitch
            label="Show Analysis"
            description="Display NVC analysis sections (subtext, blind spots, needs, translation) on messages"
            checked={settings.show_analysis}
            onChange={(val) => updateSetting('show_analysis', val)}
          />
          <ToggleSwitch
            label="Show Temperature"
            description="Display emotional temperature scores and the Signal Rail timeline"
            checked={settings.show_temperature}
            onChange={(val) => updateSetting('show_temperature', val)}
          />
          <ToggleSwitch
            label="Auto-Expand Analysis"
            description="Automatically expand the analysis section after The Melt animation settles"
            checked={settings.auto_expand}
            onChange={(val) => updateSetting('auto_expand', val)}
          />
        </div>
      </div>

      {/* Context Mode */}
      <div className="mb-8">
        <h2 className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">
          Default Context Mode
        </h2>
        <p className="text-xs text-muted mb-4">
          Different relationships activate different analytical lenses. Choose the default for new sessions.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONTEXT_MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSetting('context_mode', opt.value)}
              className={`text-left p-3 border rounded-lg transition-colors ${
                settings.context_mode === opt.value
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-ember-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    settings.context_mode === opt.value ? 'bg-accent' : 'bg-border'
                  }`}
                />
                <span className="text-sm text-foreground">{opt.label}</span>
              </div>
              <p className="text-xs text-muted pl-4">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Parallax Guide FAB */}
      <ParallaxFAB />
    </div>
  )
}
