import { useCurrentFrame, useVideoConfig } from "remotion";
import { useRef, useEffect } from "react";

interface AvaOrbProps {
  /** Size in pixels (diameter) */
  size: number;
  /** Current energy level 0-1 (should be pre-smoothed) */
  energy: number;
  /** Real FFT frequency data from visualizeAudio (128 bins) */
  waveform?: number[] | null;
  /** Whether to show orbiting particles */
  particles?: boolean;
}

/**
 * AvaOrb — the Parallax teal orb, ported for Remotion.
 *
 * Faithful port of ParallaxOrb.tsx preserving ALL organic behavior:
 *   1. Outer glow — radius and opacity scale with liveEnergy
 *   2. Orb body — teal radial gradient with edge stroke
 *   3. Inner waveform — dual-harmonic sine waves, amplitude = liveEnergy
 *   4. Specular highlight — subtle white reflection
 *   5. Orbiting particles — orbit speed, alpha, glow all energy-reactive
 *
 * Key: energy prop should be pre-smoothed by the parent (DemoVideo).
 * The orb adds its own organic modulation on top (idleWave, sine breathing).
 * Particle visibility fades proportionally with energy — no binary snapping.
 */
export const AvaOrb: React.FC<AvaOrbProps> = ({
  size,
  energy,
  waveform,
  particles: showParticles,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const enableParticles = showParticles !== undefined ? showParticles : size >= 40;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = 2;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const w = size;
    const h = size;
    const cx = w / 2;
    const cy = h / 2;
    const radius = (size / 2) * 0.65;

    // Deterministic time — matches ParallaxOrb's timeRef accumulation
    const t = frame / fps;
    const e = energy; // Already smoothed by parent

    // ── Organic energy modulation (identical to ParallaxOrb) ──
    const idleWave = 0.25 + 0.1 * Math.sin(t * 0.8);
    let liveEnergy: number;
    if (e > 0.1) {
      // Speaking — organic pulsing with dual-sine modulation
      liveEnergy = Math.max(
        idleWave,
        e * (0.6 + 0.4 * Math.sin(t * 3.7) * Math.sin(t * 1.3))
      );
    } else {
      // Silent — gentle breathing, never flat
      liveEnergy = idleWave;
    }

    // Particle visibility fades proportionally — no binary snap
    const particleFade = Math.min(1, e * 4); // 0 at e=0, 1 at e>=0.25
    const particleSpeed = 0.3;

    ctx.clearRect(0, 0, w * dpr, h * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    // ── 1. Outer glow ──
    const glowRadius = radius * (1.3 + liveEnergy * 0.4);
    const glowGrad = ctx.createRadialGradient(
      cx, cy, radius * 0.8,
      cx, cy, glowRadius
    );
    glowGrad.addColorStop(0, `rgba(106, 171, 142, ${0.2 + liveEnergy * 0.25})`);
    glowGrad.addColorStop(0.5, `rgba(106, 171, 142, ${0.08 + liveEnergy * 0.1})`);
    glowGrad.addColorStop(1, "rgba(106, 171, 142, 0)");
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // ── 2. Orb body ──
    const bodyGrad = ctx.createRadialGradient(
      cx - radius * 0.25, cy - radius * 0.25, 0,
      cx, cy, radius
    );
    bodyGrad.addColorStop(0, "rgba(106, 171, 142, 0.5)");
    bodyGrad.addColorStop(0.6, "rgba(106, 171, 142, 0.25)");
    bodyGrad.addColorStop(1, "rgba(106, 171, 142, 0.15)");
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Orb edge
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(106, 171, 142, ${0.5 + liveEnergy * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── 3. Inner waveform line ──
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
    ctx.clip();

    const wavePoints = 80;
    const waveWidth = radius * 2;
    const startX = cx - radius;

    // Primary waveform — glowing white line
    ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
    ctx.shadowBlur = Math.max(4, 8 * liveEnergy);

    const hasRealWaveform = waveform && waveform.length > 0;

    ctx.beginPath();
    for (let i = 0; i <= wavePoints; i++) {
      const x = startX + (i / wavePoints) * waveWidth;
      const progress = i / wavePoints;
      const envelope = Math.sin(progress * Math.PI);

      let displacement: number;
      if (hasRealWaveform) {
        // REAL waveform: sample FFT bins mapped to waveform points
        const binIndex = Math.floor(progress * (waveform.length - 1));
        const binNext = Math.min(binIndex + 1, waveform.length - 1);
        const binFrac = progress * (waveform.length - 1) - binIndex;
        // Interpolate between bins for smooth shape
        const amplitude = waveform[binIndex] * (1 - binFrac) + waveform[binNext] * binFrac;
        // Add subtle time-based phase shift so waveform flows, not static
        const phase = Math.sin(progress * 4 + t * 3) * 0.15;
        displacement = (amplitude + phase) * liveEnergy * radius * 0.6;
      } else {
        // Fallback: synthetic sine waves (idle/no audio)
        const wave1 = Math.sin(progress * 8 + t * 4) * liveEnergy * radius * 0.25;
        const wave2 = Math.sin(progress * 12 + t * 6.3) * liveEnergy * radius * 0.12;
        const wave3 = Math.sin(progress * 5 + t * 2.1) * liveEnergy * radius * 0.08;
        displacement = wave1 + wave2 + wave3;
      }

      const y = cy + displacement * envelope;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + liveEnergy * 0.4})`;
    ctx.lineWidth = Math.max(1, 1.5 * (radius / 60));
    ctx.stroke();

    // Second harmonic — offset version of real data for depth
    ctx.shadowBlur = Math.max(2, 4 * liveEnergy);
    ctx.beginPath();
    for (let i = 0; i <= wavePoints; i++) {
      const x = startX + (i / wavePoints) * waveWidth;
      const progress = i / wavePoints;
      const envelope = Math.sin(progress * Math.PI);

      let displacement: number;
      if (hasRealWaveform) {
        // Sample from a different region of the FFT for visual depth
        const offset = Math.floor(waveform.length * 0.3);
        const binIndex = Math.floor(progress * (waveform.length - 1));
        const shiftedBin = (binIndex + offset) % waveform.length;
        const amplitude = waveform[shiftedBin];
        const phase = Math.sin(progress * 3 + t * 2.1 + 1) * 0.1;
        displacement = (amplitude * 0.6 + phase) * liveEnergy * radius * 0.4;
      } else {
        const wave1 = Math.sin(progress * 6 + t * 3.2 + 1) * liveEnergy * radius * 0.15;
        const wave2 = Math.sin(progress * 10 + t * 5.1 + 2) * liveEnergy * radius * 0.08;
        displacement = wave1 + wave2;
      }

      const y = cy + displacement * envelope;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + liveEnergy * 0.3})`;
    ctx.lineWidth = Math.max(0.5, 1 * (radius / 60));
    ctx.stroke();

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.restore();

    // ── 4. Specular highlight ──
    const specGrad = ctx.createRadialGradient(
      cx - radius * 0.3, cy - radius * 0.3, 0,
      cx - radius * 0.3, cy - radius * 0.3, radius * 0.6
    );
    specGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
    specGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = specGrad;
    ctx.fill();

    // ── 5. Orbiting particles ──
    if (enableParticles && particleFade > 0.01) {
      const pCount = Math.max(8, Math.floor(size / 8));

      for (let p = 0; p < pCount; p++) {
        const angle =
          (p / pCount) * Math.PI * 2 +
          t * (particleSpeed + (p % 3) * particleSpeed * 0.5);
        const orbitR =
          radius * (1.4 + (p % 4) * 0.15 + Math.sin(t * 0.7 + p) * 0.1);
        const px = cx + Math.cos(angle) * orbitR;
        const py = cy + Math.sin(angle) * orbitR * 0.7;

        const pSize = 1 + (p % 3) * 0.8;
        const pAlpha =
          particleFade * (0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + p * 0.7)));

        // Particle glow
        const pGlow = ctx.createRadialGradient(px, py, 0, px, py, pSize * 4);
        pGlow.addColorStop(0, `rgba(106, 171, 142, ${pAlpha * 0.5})`);
        pGlow.addColorStop(1, "rgba(106, 171, 142, 0)");
        ctx.beginPath();
        ctx.arc(px, py, pSize * 4, 0, Math.PI * 2);
        ctx.fillStyle = pGlow;
        ctx.fill();

        // Particle core
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(106, 171, 142, ${pAlpha})`;
        ctx.fill();
      }
    }

    ctx.restore();
  }, [frame, fps, size, energy, waveform, enableParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
    />
  );
};
