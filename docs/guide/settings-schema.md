# Settings

These are the user preferences I can manage. Settings are stored per-session and reset when a new session starts.

## Available Settings

### Display Name
- **Key:** `display_name`
- **Type:** string
- **Default:** "Person A" or "Person B"
- **Description:** The name shown on your messages and in analysis references. Set during session join or changed anytime.

### Voice Input
- **Key:** `voice_enabled`
- **Type:** boolean
- **Default:** true (if browser supports Web Speech API)
- **Description:** Whether to show the microphone button for voice-to-text input. Disable if you prefer text-only. Only available in Chrome.

### Analysis Visibility
- **Key:** `show_analysis`
- **Type:** boolean
- **Default:** true
- **Description:** Whether NVC analysis sections are shown on messages. Some users prefer to see raw messages first and reveal analysis later. When disabled, analysis is still generated but hidden behind a "Show Analysis" toggle on each message.

### Temperature Display
- **Key:** `show_temperature`
- **Type:** boolean
- **Default:** true
- **Description:** Whether the temperature score and SignalRail timeline are visible. The temperature is still calculated regardless of this setting.

### Auto-Expand Analysis
- **Key:** `auto_expand`
- **Type:** boolean
- **Default:** true
- **Description:** When true, analysis sections expand automatically after The Melt animation completes. When false, analysis stays collapsed and you tap to reveal.

### Context Mode
- **Key:** `context_mode`
- **Type:** enum (intimate, family, professional_peer, professional_hierarchical, transactional, civil_structural)
- **Default:** Set during session creation
- **Description:** The relationship context that determines which analytical lenses are activated. Can be changed mid-session if the initial selection was wrong.
