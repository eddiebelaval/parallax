"use client";

import { useRef, useEffect } from "react";

type SceneType = "inperson" | "remote" | "solo";

interface ModeCardSceneProps {
  type: SceneType;
  height?: number;
}

/**
 * Canvas-rendered orb scene for mode selection cards.
 * Draws filled, glowing orbs with the exact same rendering
 * as the approved HTML prototype.
 */
export function ModeCardScene({ type, height = 160 }: ModeCardSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const widthRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!canvas || !container) return;
      const w = container.clientWidth;
      const h = height;
      widthRef.current = w;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    resize();

    // Watch for container resize
    const observer = new ResizeObserver(() => resize());
    observer.observe(container);

    const w = widthRef.current;
    const h = height;

    function drawPersonOrb(
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      radius: number,
      color: string,
      t: number,
    ) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      // Glow
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.4);
      glow.addColorStop(0, `rgba(${r},${g},${b}, 0.25)`);
      glow.addColorStop(1, `rgba(${r},${g},${b}, 0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Body
      const body = ctx.createRadialGradient(
        cx - radius * 0.2, cy - radius * 0.2, 0,
        cx, cy, radius,
      );
      body.addColorStop(0, `rgba(${r},${g},${b}, 0.5)`);
      body.addColorStop(1, `rgba(${r},${g},${b}, 0.15)`);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();

      // Edge
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b}, 0.5)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner waveform line (subtle)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
      ctx.clip();

      const idle = 0.15 + 0.05 * Math.sin(t * 0.9 + cx * 0.1);
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const x = cx - radius + (i / 40) * radius * 2;
        const progress = i / 40;
        const envelope = Math.sin(progress * Math.PI);
        const wave = Math.sin(progress * 6 + t * 2.5) * idle * radius * 0.3;
        const y = cy + wave * envelope;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${r},${g},${b}, 0.35)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    function drawParallaxOrb(
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      radius: number,
      t: number,
    ) {
      const idle = 0.25 + 0.1 * Math.sin(t * 0.8);

      // Outer glow
      const glowR = radius * (1.4 + idle * 0.3);
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, glowR);
      glowGrad.addColorStop(0, `rgba(106, 171, 142, ${0.2 + idle * 0.15})`);
      glowGrad.addColorStop(0.5, `rgba(106, 171, 142, ${0.06 + idle * 0.06})`);
      glowGrad.addColorStop(1, "rgba(106, 171, 142, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Body
      const bodyGrad = ctx.createRadialGradient(
        cx - radius * 0.25, cy - radius * 0.25, 0,
        cx, cy, radius,
      );
      bodyGrad.addColorStop(0, "rgba(106, 171, 142, 0.5)");
      bodyGrad.addColorStop(0.6, "rgba(106, 171, 142, 0.25)");
      bodyGrad.addColorStop(1, "rgba(106, 171, 142, 0.12)");
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Edge
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(106, 171, 142, ${0.5 + idle * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner waveform — primary
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
      ctx.clip();

      // Glowing white waveform
      ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
      ctx.shadowBlur = Math.max(3, 6 * idle);

      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const x = cx - radius + (i / 60) * radius * 2;
        const progress = i / 60;
        const envelope = Math.sin(progress * Math.PI);
        const w1 = Math.sin(progress * 8 + t * 4) * idle * radius * 0.25;
        const w2 = Math.sin(progress * 12 + t * 6.3) * idle * radius * 0.12;
        const w3 = Math.sin(progress * 5 + t * 2.1) * idle * radius * 0.08;
        const y = cy + (w1 + w2 + w3) * envelope;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + idle * 0.3})`;
      ctx.lineWidth = Math.max(1, 1.5 * (radius / 30));
      ctx.stroke();

      // Second harmonic — softer
      ctx.shadowBlur = Math.max(2, 3 * idle);
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const x = cx - radius + (i / 60) * radius * 2;
        const progress = i / 60;
        const envelope = Math.sin(progress * Math.PI);
        const w1 = Math.sin(progress * 6 + t * 3.2 + 1) * idle * radius * 0.15;
        const w2 = Math.sin(progress * 10 + t * 5.1 + 2) * idle * radius * 0.08;
        const y = cy + (w1 + w2) * envelope;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + idle * 0.2})`;
      ctx.lineWidth = Math.max(0.5, 1 * (radius / 30));
      ctx.stroke();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.restore();

      // Specular
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
    }

    function drawBridgeParticles(
      ctx: CanvasRenderingContext2D,
      x1: number, y1: number,
      x2: number, y2: number,
      count: number,
      t: number,
    ) {
      for (let i = 0; i < count; i++) {
        const progress = ((t * 0.3 + i / count) % 1);
        const px = x1 + (x2 - x1) * progress;
        const py = y1 + (y2 - y1) * progress + Math.sin(progress * Math.PI * 3 + t * 2) * 8;
        const alpha = Math.sin(progress * Math.PI) * 0.6;

        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(106, 171, 142, ${alpha})`;
        ctx.fill();
      }
    }

    function frame() {
      if (!canvas) return;
      const t = timeRef.current;
      timeRef.current += 0.016;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Use live width from ResizeObserver
      const fw = widthRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const cx = fw / 2;
      const cy = h / 2;
      // Scale orb sizes and spacing relative to card width
      const scale = Math.min(fw / 300, 1.6); // Scale orbs relative to card width
      const orbR = Math.round(24 * scale);
      const parallaxR = Math.round(20 * scale);
      const spread = Math.round(fw * 0.22); // 22% of width between center and side orbs

      if (type === "inperson") {
        drawPersonOrb(ctx, cx - spread, cy, orbR, "#d4a040", t);
        drawParallaxOrb(ctx, cx, cy, parallaxR, t);
        drawPersonOrb(ctx, cx + spread, cy, orbR, "#c45c3c", t);
        drawBridgeParticles(ctx, cx - spread, cy, cx + spread, cy, 10, t);
      } else if (type === "remote") {
        const remoteSpread = Math.round(fw * 0.26);
        drawPersonOrb(ctx, cx - remoteSpread, cy, orbR, "#d4a040", t);
        drawParallaxOrb(ctx, cx, cy, Math.round(16 * scale), t);
        drawPersonOrb(ctx, cx + remoteSpread, cy, orbR, "#c45c3c", t);
        drawBridgeParticles(ctx, cx - remoteSpread + orbR, cy, cx + remoteSpread - orbR, cy, 14, t);
      } else {
        const soloGap = Math.round(fw * 0.12);
        drawPersonOrb(ctx, cx - soloGap, cy, Math.round(28 * scale), "#d4a040", t);
        drawParallaxOrb(ctx, cx + soloGap, cy, Math.round(24 * scale), t);
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
    };
  }, [type, height]);

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
