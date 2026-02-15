"use client";

import { useRef, useEffect, useCallback } from "react";

interface AvaOrbProps {
  /** Size in pixels (diameter) */
  size: number;
  /** Current energy level 0-1 (from useAvaVoice or useAudioAnalyser) */
  energy: number;
  /** Whether Ava is currently speaking via TTS */
  isSpeaking: boolean;
  /** Whether Ava is analyzing/thinking */
  isAnalyzing?: boolean;
  /** Show orbiting particles (auto-disabled below 40px) */
  particles?: boolean;
}

/**
 * The Ava Orb — teal sphere with thin waveform line inside,
 * orbiting particles when speaking, and energy-reactive glow.
 *
 * States:
 * - Speaking: active waveform, full particles, bright glow
 * - Analyzing: gentle pulse, ghost particles (slow + faint), dim glow
 * - Silent: flat waveform, no particles, minimal glow
 *
 * Renders to a <canvas> for smooth 60fps animation.
 */
export function AvaOrb({
  size,
  energy,
  isSpeaking,
  isAnalyzing = false,
  particles: showParticles,
}: AvaOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const smoothEnergyRef = useRef(0);

  // Auto-disable particles below 40px
  const enableParticles = showParticles !== undefined ? showParticles : size >= 40;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = size;
    const h = size;
    const cx = w / 2;
    const cy = h / 2;
    const radius = (size / 2) * 0.65; // Orb is 65% of canvas to leave room for glow + particles

    const t = timeRef.current;
    timeRef.current += 0.016;

    // Smooth energy interpolation
    const targetEnergy = energy;
    smoothEnergyRef.current += (targetEnergy - smoothEnergyRef.current) * 0.08;
    const e = smoothEnergyRef.current;

    // Always show life — idle breathing waveform baseline
    // Speaking: full energy-driven waveform
    // Analyzing: gentle pulse
    // Silent/idle: slow, calm breathing wave (never flat)
    const idleWave = 0.25 + 0.1 * Math.sin(t * 0.8); // Gentle constant breath
    let liveEnergy: number;
    if (isSpeaking) {
      liveEnergy = Math.max(idleWave, e * (0.6 + 0.4 * Math.sin(t * 3.7) * Math.sin(t * 1.3)));
    } else if (isAnalyzing) {
      liveEnergy = Math.max(idleWave, e * (0.8 + 0.2 * Math.sin(t * 2)));
    } else {
      liveEnergy = idleWave; // Always alive, never flat
    }

    // Particle state
    const particleFade = isSpeaking ? 1 : isAnalyzing ? 0.12 : 0;
    const particleSpeed = isAnalyzing ? 0.08 : 0.3;

    ctx.clearRect(0, 0, w * dpr, h * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    // Detect light mode for opacity boost
    const isLight = typeof document !== "undefined" && document.documentElement.classList.contains("light");
    const boost = isLight ? 1.8 : 1; // Light mode needs stronger colors

    // ── 1. Outer glow ──
    const glowRadius = radius * (1.3 + liveEnergy * 0.4);
    const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, glowRadius);
    glowGrad.addColorStop(0, `rgba(106, 171, 142, ${Math.min(1, (0.2 + liveEnergy * 0.25) * boost)})`);
    glowGrad.addColorStop(0.5, `rgba(106, 171, 142, ${Math.min(1, (0.08 + liveEnergy * 0.1) * boost)})`);
    glowGrad.addColorStop(1, "rgba(106, 171, 142, 0)");
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // ── 2. Orb body ──
    const bodyGrad = ctx.createRadialGradient(
      cx - radius * 0.25, cy - radius * 0.25, 0,
      cx, cy, radius,
    );
    bodyGrad.addColorStop(0, `rgba(106, 171, 142, ${Math.min(1, 0.5 * boost)})`);
    bodyGrad.addColorStop(0.6, `rgba(106, 171, 142, ${Math.min(1, 0.25 * boost)})`);
    bodyGrad.addColorStop(1, `rgba(106, 171, 142, ${Math.min(1, 0.15 * boost)})`);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Orb edge
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(106, 171, 142, ${Math.min(1, (0.5 + liveEnergy * 0.3) * boost)})`;
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

    ctx.beginPath();
    for (let i = 0; i <= wavePoints; i++) {
      const x = startX + (i / wavePoints) * waveWidth;
      const progress = i / wavePoints;
      const envelope = Math.sin(progress * Math.PI);

      const wave1 = Math.sin(progress * 8 + t * 4) * liveEnergy * radius * 0.25;
      const wave2 = Math.sin(progress * 12 + t * 6.3) * liveEnergy * radius * 0.12;
      const wave3 = Math.sin(progress * 5 + t * 2.1) * liveEnergy * radius * 0.08;

      const y = cy + (wave1 + wave2 + wave3) * envelope;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, 0.6 + liveEnergy * 0.4)})`;
    ctx.lineWidth = Math.max(1, 1.5 * (radius / 60));
    ctx.stroke();

    // Second harmonic — thinner, softer white glow
    ctx.shadowBlur = Math.max(2, 4 * liveEnergy);
    ctx.beginPath();
    for (let i = 0; i <= wavePoints; i++) {
      const x = startX + (i / wavePoints) * waveWidth;
      const progress = i / wavePoints;
      const envelope = Math.sin(progress * Math.PI);

      const wave1 = Math.sin(progress * 6 + t * 3.2 + 1) * liveEnergy * radius * 0.15;
      const wave2 = Math.sin(progress * 10 + t * 5.1 + 2) * liveEnergy * radius * 0.08;

      const y = cy + (wave1 + wave2) * envelope;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, 0.3 + liveEnergy * 0.3)})`;
    ctx.lineWidth = Math.max(0.5, 1 * (radius / 60));
    ctx.stroke();

    // Reset shadow for everything else
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    ctx.restore();

    // ── 4. Specular highlight ──
    const specGrad = ctx.createRadialGradient(
      cx - radius * 0.3, cy - radius * 0.3, 0,
      cx - radius * 0.3, cy - radius * 0.3, radius * 0.6,
    );
    specGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
    specGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = specGrad;
    ctx.fill();

    // ── 5. Orbiting particles ──
    if (enableParticles && particleFade > 0) {
      const pCount = Math.max(8, Math.floor(size / 8));

      for (let p = 0; p < pCount; p++) {
        const angle = (p / pCount) * Math.PI * 2 + t * (particleSpeed + (p % 3) * particleSpeed * 0.5);
        const orbitR = radius * (1.4 + (p % 4) * 0.15 + Math.sin(t * 0.7 + p) * 0.1);
        const px = cx + Math.cos(angle) * orbitR;
        const py = cy + Math.sin(angle) * orbitR * 0.7;

        const pSize = 1 + (p % 3) * 0.8;
        const pAlpha = particleFade * (0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + p * 0.7)));

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

    animRef.current = requestAnimationFrame(draw);
  }, [size, energy, isSpeaking, isAnalyzing, enableParticles]);

  // Canvas setup + animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [size, draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      aria-label={
        isSpeaking
          ? "Ava is speaking"
          : isAnalyzing
          ? "Ava is analyzing"
          : "Ava"
      }
    />
  );
}
