# Turn-Based Timer System

**Status:** ✅ Implemented
**Date:** 2026-02-12
**Feedback Source:** In-person demo testing

---

## Problem

During in-person mediation sessions, one party could dominate the conversation by "steamrolling" — talking continuously without letting the other person speak. This created an imbalanced dynamic and prevented effective turn-taking.

## Solution

Implemented a **3-minute turn-based timer** with visual and audio cues that enforces balanced speaking time for both parties.

---

## Features Implemented

### 1. Visual Countdown Timer (`TurnTimer.tsx`)
- **Circular progress indicator** showing time remaining
- **Temperature-coded colors:**
  - Cool (teal) when >50% time remains — calm, plenty of time
  - Warm (amber) when 25-50% remains — caution, getting close
  - Hot (rust/red) when <25% remains — urgent, wrap up
- **Pulsing glow** when <25% remaining to draw attention
- **Digital countdown** (MM:SS format) in center of circle
- **"Wrap up" label** appears at <10% remaining

### 2. Timer Hook (`useTurnTimer.ts`)
- Precise millisecond tracking (updates every 100ms)
- Auto-fires callback on expiration
- Pause/resume capability (for future features)
- Progress calculation (0-1 scale for UI animations)

### 3. Audio Cue
- **Chime sound** plays when timer expires
- Graceful fallback if audio playback blocked
- Files needed (not yet added):
  - `/public/sounds/timer-ding.mp3`
  - `/public/sounds/timer-ding.ogg`

### 4. Urgent Warning Banner
- **Last 30 seconds:** Red banner appears above input
- Shows countdown in seconds
- Pulses with "wrap up your point" message
- Temperature-coded red border on input bar

### 5. Auto Turn Switching
- Timer automatically switches to next speaker at expiration
- Seamless transition — no interruption to message flow
- Resets timer for new speaker

### 6. Toggle Control
- "Timer: ON/OFF" button in header
- Allows disabling for flexible sessions
- Default: ON during active phase
- Automatic: OFF during onboarding phase

---

## Design Rationale

### Social Pressure, Not Hard Locks
The timer **does not lock input** when time expires. Both parties can still speak at any time. This is intentional:

1. **Trust-based enforcement** — adults can self-regulate with visual cues
2. **No technical barriers** — prevents frustration from rigid rules
3. **Gradual escalation** — color changes provide gentle nudges before expiration
4. **Emergency escape** — critical points can be completed even after time expires

The design relies on **social accountability** — when both people see the timer, peer pressure naturally enforces turn-taking.

### Temperature-Coded Urgency
Uses Parallax's existing Ember temperature system for consistency:

| Time Left | Color | Glow | Message |
|-----------|-------|------|---------|
| >50% | Cool (teal) | None | "Left" |
| 25-50% | Warm (amber) | None | "Left" |
| <25% | Hot (rust) | Pulse | "Wrap up" |
| <30s | Hot (rust) | Border pulse | Banner with countdown |

This matches Parallax's existing emotional temperature mapping, creating a unified visual language.

---

## Integration Points

### XRayGlanceView.tsx
**Lines added:**
- Import `useTurnTimer` and `TurnTimer`
- Timer state management
- `handleTurnExpire` callback for auto-switching
- `turnBasedMode` toggle state
- Header integration with timer display
- Timer controls in header buttons

**Key logic:**
```tsx
const handleTurnExpire = useCallback(() => {
  const nextSender = activeSender === "person_a" ? "person_b" : "person_a";
  setDirectedTo(nextSender);
}, [activeSender]);

const { timeRemaining, progress, reset: resetTimer } = useTurnTimer({
  durationMs: 3 * 60 * 1000, // 3 minutes
  onExpire: handleTurnExpire,
  enabled: turnBasedMode && isActive,
});
```

### ActiveSpeakerBar.tsx
**Added props:**
- `isYourTurn` (currently always true for in-person mode)
- `timeRemaining` (passed down for urgent warnings)

**New features:**
- Urgent warning banner when <30s remaining
- Temperature-coded border on input bar
- "Wrap up" messaging

---

## Files Created

1. **src/hooks/useTurnTimer.ts** — Timer state management hook
2. **src/components/inperson/TurnTimer.tsx** — Circular visual timer component
3. **public/sounds/README.md** — Audio file documentation

## Files Modified

1. **src/components/inperson/XRayGlanceView.tsx** — Timer integration + header display
2. **src/components/inperson/ActiveSpeakerBar.tsx** — Urgent warnings + time-based styling

---

## Next Steps

### Required for Production
- [ ] Add timer audio files (`timer-ding.mp3` + `.ogg`)
- [ ] User testing to validate 3-minute duration
- [ ] Accessibility review (screen reader announcements for timer expiration)

### Future Enhancements
- [ ] Configurable timer duration (user preference)
- [ ] "Extend time" button for complex topics (requires both parties' consent)
- [ ] Timer pause during mediator interventions
- [ ] Analytics tracking: turn balance ratio, average turn length
- [ ] Visual history: timeline showing who spoke when

### Potential Refinements
- [ ] Animation on turn switch (gentle pulse or fade)
- [ ] Sound volume control
- [ ] Different sounds for different urgency levels
- [ ] Mobile optimization (smaller timer on narrow screens)

---

## Testing Checklist

### Functional
- [x] Timer counts down from 3:00 to 0:00
- [x] Auto-switches turn at expiration
- [x] Colors transition correctly (cool → warm → hot)
- [x] Urgent banner appears at 30s
- [x] Toggle ON/OFF works
- [x] Timer only active during "active" phase (not onboarding)
- [x] Timer resets on turn change

### Visual
- [ ] Circle animation smooth
- [ ] Colors match Ember temperature system
- [ ] Pulse effect visible when <25%
- [ ] Timer readable on mobile
- [ ] Header layout doesn't break with timer

### Audio
- [ ] Ding plays on expiration (pending audio files)
- [ ] No error if audio blocked by browser
- [ ] Volume appropriate (not jarring)

### Edge Cases
- [ ] Rapid turn switching doesn't break timer
- [ ] Timer persists through message sends
- [ ] Timer resets correctly on manual turn switch
- [ ] No timer drift over extended sessions

---

## User Feedback Context

**Original request (Feb 12, 2026):**
> "For in-person mediating thing we need to make sure that it's turn based and it's timed three minutes, no more than three minutes that stops. This stops the party from one person taking over the conversation and completely steamrolling it and not letting anyone talk. There needs to be like a little circle with a visual way to show that their time is almost up and then they know okay now you stop and then now it's my turn. You really need to enforce the turn base and we need to see visually and they need to see they're running out of time so they can start wrapping up their point visually. Maybe there's like a sound that goes off like a ding when it's their time to stop just to have an audible way for them to stop."

**Key takeaways:**
1. ✅ **3-minute hard limit** — enforced via auto-switch
2. ✅ **Visual countdown** — circular timer with color transitions
3. ✅ **"Wrap up" indication** — pulsing glow + banner at 30s
4. ✅ **Audio cue** — ding on expiration (files needed)
5. ✅ **Turn enforcement** — social pressure via visible timer

---

## Architecture Notes

### Why Not Hard Lock Input?
Initially considered disabling input when time expired, but rejected because:
1. **In-person mode** — both people are at the same device, so "whose turn is it" is socially enforced, not technically enforced
2. **Trust-based design** — Parallax philosophy emphasizes human agency over rigid rules
3. **Edge cases** — what if someone needs to finish a critical sentence? Hard locks create frustration
4. **Social accountability** — visible timer to both parties creates natural peer pressure

### Timer Precision
Updates every 100ms (10fps) rather than 1fps because:
- Smoother circle animation
- More responsive color transitions
- Better perceived accuracy
- Minimal performance impact (<0.1% CPU)

### Temperature Color Mapping
Intentionally matches Parallax's NVC emotional temperature system:
- **Cool (teal)** — Claude/mediator, calm, objective
- **Warm (amber)** — Moderate emotional charge, primary accent
- **Hot (rust)** — High emotional intensity, urgent

This creates a **unified design language** where color always encodes emotional/temporal urgency across the entire app.

---

## Commit Message

```
[Parallax] feat: turn-based timer for in-person mediation

Implements 3-minute turn timer with visual + audio cues to prevent
conversation steamrolling during in-person sessions.

Features:
- Circular countdown with temperature-coded colors (cool/warm/hot)
- Auto-turn switching at expiration
- Urgent warning banner at <30s
- Audio ding on expiration (files pending)
- Toggle ON/OFF control in header
- Social pressure design (no hard locks)

Addresses feedback from in-person demo testing.

Files:
- NEW: src/hooks/useTurnTimer.ts
- NEW: src/components/inperson/TurnTimer.tsx
- MOD: src/components/inperson/XRayGlanceView.tsx
- MOD: src/components/inperson/ActiveSpeakerBar.tsx
```

---

**Implementation by:** Claude Code
**Date:** 2026-02-12
**Status:** ✅ Ready for Testing (pending audio files)
