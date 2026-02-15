/**
 * Timer audio generation using Web Audio API
 * Creates a warm, pleasant chime sound without external audio files
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext
      || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

/**
 * Play a warm bell/chime sound for timer expiration
 * Two-tone bell with natural decay, ~0.8 seconds duration
 */
export function playTimerChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create oscillators for two-tone bell harmony
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    // Warm bell frequencies (E and B notes for pleasant harmony)
    osc1.frequency.value = 659.25; // E5
    osc2.frequency.value = 987.77; // B5

    // Use triangle wave for warm, less harsh tone
    osc1.type = 'triangle';
    osc2.type = 'triangle';

    // Natural bell decay envelope
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    // Connect audio graph
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(ctx.destination);
    gain2.connect(ctx.destination);

    // Play and cleanup
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.8);
    osc2.stop(now + 0.8);
  } catch (error) {
    // Graceful fallback if Web Audio API unavailable
    console.warn('Timer chime unavailable:', error);
  }
}

/**
 * Preload audio context (call on user interaction to avoid autoplay restrictions)
 */
export function initTimerAudio(): void {
  try {
    getAudioContext();
  } catch (error) {
    console.warn('Audio context initialization failed:', error);
  }
}
