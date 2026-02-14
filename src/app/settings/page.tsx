'use client'

import { useState, useEffect } from 'react'
import { useSettings, type ParallaxSettings } from '@/hooks/useSettings'
import { useProfileConcierge } from '@/hooks/useProfileConcierge'


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

function Slider({
  label,
  description,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  description: string
  value: number
  min: number
  max: number
  step: number
  onChange: (val: number) => void
}) {
  return (
    <div className="p-4 border border-border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-foreground">{label}</p>
        <span className="text-sm text-accent font-medium">{value.toFixed(1)}x</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
      />
      <p className="text-xs text-muted mt-2">{description}</p>
    </div>
  )
}

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="mb-6 border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-surface hover:bg-elevated transition-colors"
      >
        <h2 className="font-mono text-[10px] text-muted uppercase tracking-widest">
          {title}
        </h2>
        <svg
          className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="p-4 space-y-3">{children}</div>}
    </div>
  )
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in">
      <div className="bg-surface border border-accent px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <span className="text-accent">✓</span>
        <span className="text-sm text-foreground">{message}</span>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { settings: uiSettings, updateSetting: updateUISetting } = useSettings()
  const profileConcierge = useProfileConcierge()
  const [toast, setToast] = useState<string | null>(null)

  // Helper for profile updates with toast feedback
  const updateProfileSetting = async (key: string, value: unknown) => {
    const success = await profileConcierge.updateSetting(key as any, value)
    setToast(success ? 'Settings saved' : 'Failed to save settings')
  }

  // Wait for profile settings to load
  const profileSettings = profileConcierge.settings
  const isLoadingProfile = !profileSettings

  // Account action handlers
  const handleExportData = async () => {
    try {
      const response = await fetch('/api/profile/export', { method: 'POST' })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `parallax-data-${Date.now()}.json`
        a.click()
        window.URL.revokeObjectURL(url)
        setToast('Data exported successfully')
      } else {
        setToast('Failed to export data')
      }
    } catch {
      setToast('Failed to export data')
    }
  }

  const handleResetInterview = async () => {
    if (!confirm('Reset your interview? This will clear all behavioral signals.')) return
    try {
      const response = await fetch('/api/profile/interview/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: true }),
      })
      const data = await response.json()
      setToast(response.ok ? data.message : 'Failed to reset interview')
    } catch {
      setToast('Failed to reset interview')
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('⚠️ DELETE ACCOUNT? This CANNOT be undone. All data will be permanently deleted.'))
      return
    if (!confirm('Final confirmation: Are you absolutely sure?')) return
    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: true }),
      })
      if (response.ok) {
        window.location.href = '/'
      } else {
        setToast('Failed to delete account')
      }
    } catch {
      setToast('Failed to delete account')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 pb-24">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Settings
          </span>
        </div>
        <h1 className="font-serif text-3xl text-foreground tracking-tight">Preferences</h1>
        <p className="text-sm text-muted mt-2">
          Adjust how Parallax works for you. Changes take effect immediately.
        </p>
      </div>

      {/* UI Settings - Display Name (localStorage) */}
      <div className="mb-8">
        <h2 className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">
          Identity
        </h2>
        <div className="p-4 border border-border rounded-lg">
          <label className="block text-sm text-foreground mb-2">Display Name</label>
          <input
            type="text"
            value={uiSettings.display_name}
            onChange={(e) => updateUISetting('display_name', e.target.value)}
            maxLength={50}
            className="w-full px-3 py-2 bg-surface border border-border text-foreground text-sm rounded placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
            placeholder="Your name"
          />
          <p className="text-xs text-muted mt-2">Shown on your messages during sessions</p>
        </div>
      </div>

      {/* UI Settings - Voice Input (localStorage) */}
      <div className="mb-8">
        <h2 className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">
          Input
        </h2>
        <ToggleSwitch
          label="Voice Input"
          description="Show the microphone button for voice-based input"
          checked={uiSettings.voice_enabled}
          onChange={(val) => updateUISetting('voice_enabled', val)}
        />
      </div>

      {/* UI Settings - Analysis Display (localStorage) */}
      <div className="mb-8">
        <h2 className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">
          Analysis Display
        </h2>
        <div className="space-y-3">
          <ToggleSwitch
            label="Show Analysis"
            description="Display NVC analysis sections (subtext, blind spots, needs, translation) on messages"
            checked={uiSettings.show_analysis}
            onChange={(val) => updateUISetting('show_analysis', val)}
          />
          <ToggleSwitch
            label="Show Temperature"
            description="Display emotional temperature scores and the Signal Rail timeline"
            checked={uiSettings.show_temperature}
            onChange={(val) => updateUISetting('show_temperature', val)}
          />
          <ToggleSwitch
            label="Auto-Expand Analysis"
            description="Automatically expand the analysis section after The Melt animation settles"
            checked={uiSettings.auto_expand}
            onChange={(val) => updateUISetting('auto_expand', val)}
          />
        </div>
      </div>

      {/* UI Settings - Context Mode (localStorage) */}
      <div className="mb-8">
        <h2 className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">
          Default Context Mode
        </h2>
        <p className="text-xs text-muted mb-4">
          Different relationships activate different analytical lenses. Choose the default for new
          sessions.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONTEXT_MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateUISetting('context_mode', opt.value)}
              className={`text-left p-3 border rounded-lg transition-colors ${
                uiSettings.context_mode === opt.value
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-ember-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    uiSettings.context_mode === opt.value ? 'bg-accent' : 'bg-border'
                  }`}
                />
                <span className="text-sm text-foreground">{opt.label}</span>
              </div>
              <p className="text-xs text-muted pl-4">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border my-10" />

      {/* Profile Settings (Database) - Collapsed by Default */}
      <div className="mb-4">
        <h2 className="font-serif text-2xl text-foreground tracking-tight mb-2">
          Account Settings
        </h2>
        <p className="text-xs text-muted mb-6">
          These settings are saved to your profile and synced across devices
        </p>
      </div>

      {isLoadingProfile ? (
        <div className="text-center py-8 text-muted">
          <p>Loading profile settings...</p>
        </div>
      ) : (
        <>
          {/* Profile Identity */}
          <Accordion title="Profile Identity">
        <div className="p-4 border border-border rounded-lg mb-3">
          <label className="block text-sm text-foreground mb-2">Preferred Name</label>
          <input
            type="text"
            value={profileSettings.preferred_name || ''}
            onChange={(e) => updateProfileSetting('preferred_name', e.target.value)}
            maxLength={50}
            className="w-full px-3 py-2 bg-surface border border-border text-foreground text-sm rounded placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
            placeholder="How you'd like to be called"
          />
          <p className="text-xs text-muted mt-2">Used in personalized responses</p>
        </div>
        <div className="p-4 border border-border rounded-lg">
          <label className="block text-sm text-foreground mb-2">Pronouns</label>
          <input
            type="text"
            value={profileSettings.pronouns || ''}
            onChange={(e) => updateProfileSetting('pronouns', e.target.value)}
            maxLength={20}
            className="w-full px-3 py-2 bg-surface border border-border text-foreground text-sm rounded placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
            placeholder="she/her, he/him, they/them, etc."
          />
          <p className="text-xs text-muted mt-2">How Claude should refer to you</p>
        </div>
      </Accordion>

      {/* Notifications */}
      <Accordion title="Notifications">
        <ToggleSwitch
          label="Email Notifications"
          description="Receive session summaries and insights via email"
          checked={profileSettings.email_notifications}
          onChange={(val) => updateProfileSetting('email_notifications', val)}
        />
        <ToggleSwitch
          label="SMS Notifications"
          description="Get text alerts for important updates"
          checked={profileSettings.sms_notifications}
          onChange={(val) => updateProfileSetting('sms_notifications', val)}
        />
        <ToggleSwitch
          label="Push Notifications"
          description="Browser notifications for session reminders"
          checked={profileSettings.push_notifications}
          onChange={(val) => updateProfileSetting('push_notifications', val)}
        />
      </Accordion>

      {/* Session Preferences */}
      <Accordion title="Session Preferences">
        <div className="p-4 border border-border rounded-lg mb-3">
          <label className="block text-sm text-foreground mb-2">Default Session Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => updateProfileSetting('default_session_mode', 'remote')}
              className={`flex-1 px-4 py-2 border rounded text-sm transition-colors ${
                profileSettings.default_session_mode === 'remote'
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-border text-foreground hover:border-accent/50'
              }`}
            >
              Remote
            </button>
            <button
              onClick={() => updateProfileSetting('default_session_mode', 'in-person')}
              className={`flex-1 px-4 py-2 border rounded text-sm transition-colors ${
                profileSettings.default_session_mode === 'in-person'
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-border text-foreground hover:border-accent/50'
              }`}
            >
              In-Person
            </button>
          </div>
          <p className="text-xs text-muted mt-2">Preferred mode for new sessions</p>
        </div>
        <ToggleSwitch
          label="Auto-Record Sessions"
          description="Automatically save session transcripts and analysis"
          checked={profileSettings.auto_record_sessions}
          onChange={(val) => updateProfileSetting('auto_record_sessions', val)}
        />
        <ToggleSwitch
          label="Live Transcription"
          description="Show real-time transcription during voice input"
          checked={profileSettings.enable_live_transcription}
          onChange={(val) => updateProfileSetting('enable_live_transcription', val)}
        />
      </Accordion>

      {/* Privacy & Data */}
      <Accordion title="Privacy & Data">
        <ToggleSwitch
          label="Public Profile"
          description="Allow others to discover your profile"
          checked={profileSettings.public_profile}
          onChange={(val) => updateProfileSetting('public_profile', val)}
        />
        <ToggleSwitch
          label="Share Behavioral Signals"
          description="Allow Parallax to use your patterns for better insights"
          checked={profileSettings.share_behavioral_signals ?? true}
          onChange={(val) => updateProfileSetting('share_behavioral_signals', val)}
        />
        <ToggleSwitch
          label="Allow Research Data Use"
          description="Contribute anonymized data to conflict resolution research"
          checked={profileSettings.allow_research_data_use ?? false}
          onChange={(val) => updateProfileSetting('allow_research_data_use', val)}
        />
      </Accordion>

      {/* Voice & Audio */}
      <Accordion title="Voice & Audio">
        <Slider
          label="Voice Speed"
          description="Adjust playback speed for voice feedback"
          value={profileSettings.voice_speed ?? 1.0}
          min={0.5}
          max={2.0}
          step={0.1}
          onChange={(val) => updateProfileSetting('voice_speed', val)}
        />
      </Accordion>

      {/* Accessibility */}
      <Accordion title="Accessibility">
        <ToggleSwitch
          label="High Contrast Mode"
          description="Increase color contrast for better visibility"
          checked={profileSettings.high_contrast_mode ?? false}
          onChange={(val) => updateProfileSetting('high_contrast_mode', val)}
        />
        <ToggleSwitch
          label="Reduce Motion"
          description="Minimize animations and transitions"
          checked={profileSettings.reduce_motion ?? false}
          onChange={(val) => updateProfileSetting('reduce_motion', val)}
        />
        <ToggleSwitch
          label="Screen Reader Mode"
          description="Optimize for screen reader compatibility"
          checked={profileSettings.screen_reader_mode ?? false}
          onChange={(val) => updateProfileSetting('screen_reader_mode', val)}
        />
      </Accordion>

      {/* Advanced */}
      <Accordion title="Advanced">
        <ToggleSwitch
          label="Experimental Features"
          description="Enable cutting-edge features still in testing"
          checked={profileSettings.experimental_features ?? false}
          onChange={(val) => updateProfileSetting('experimental_features', val)}
        />
        <ToggleSwitch
          label="Beta Access"
          description="Get early access to new Parallax features"
          checked={profileSettings.beta_access ?? false}
          onChange={(val) => updateProfileSetting('beta_access', val)}
        />
      </Accordion>

      {/* Account Actions */}
      <Accordion title="Account Actions">
        <button
          onClick={handleExportData}
          className="w-full p-4 border border-border rounded-lg text-left hover:bg-elevated transition-colors"
        >
          <p className="text-sm text-foreground font-medium">Export My Data</p>
          <p className="text-xs text-muted mt-1">
            Download all your sessions, messages, and settings as JSON
          </p>
        </button>
        <button
          onClick={handleResetInterview}
          className="w-full p-4 border border-border rounded-lg text-left hover:bg-elevated transition-colors"
        >
          <p className="text-sm text-foreground font-medium">Reset Interview</p>
          <p className="text-xs text-muted mt-1">
            Clear behavioral signals and retake your onboarding interview
          </p>
        </button>
        <button
          onClick={handleDeleteAccount}
          className="w-full p-4 border border-red-600 rounded-lg text-left hover:bg-red-600/10 transition-colors"
        >
          <p className="text-sm text-red-600 font-medium">Delete Account</p>
          <p className="text-xs text-muted mt-1">
            Permanently delete your account and all data. This cannot be undone.
          </p>
        </button>
      </Accordion>
        </>
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

    </div>
  )
}
