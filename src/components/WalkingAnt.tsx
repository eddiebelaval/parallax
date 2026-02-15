"use client";

import { useEffect, useRef, useState } from "react";

interface WalkingAntProps {
  /** Target element to walk on (the pill/button) */
  targetId?: string;
  /** Ant color */
  color?: string;
}

/**
 * Walking Ant Component
 *
 * An ant that walks organically on top of text, reacting to mouse proximity.
 * Inspired by Claude's crab - runs away from the cursor.
 */
export function WalkingAnt({ targetId = "hackathon-badge", color = "#000000" }: WalkingAntProps) {
  const antRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 1, y: 0 });
  const [isScared, setIsScared] = useState(false);
  const containerRef = useRef<DOMRect | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  // Track mouse position
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      mousePos.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Get target element bounds - wait for element to appear
  useEffect(() => {
    const checkForElement = () => {
      const target = document.getElementById(targetId);
      if (target) {
        const rect = target.getBoundingClientRect();
        // Only update if element is visible (has dimensions)
        if (rect.width > 0 && rect.height > 0) {
          containerRef.current = rect;
          // Start ant at random position on the badge
          setPosition({
            x: rect.left + Math.random() * rect.width,
            y: rect.top + rect.height / 2,
          });
        }
      }
    };

    // Check immediately
    checkForElement();

    // Also check periodically in case element appears later
    const interval = setInterval(checkForElement, 1000);

    // Re-check on scroll/resize
    window.addEventListener('scroll', checkForElement);
    window.addEventListener('resize', checkForElement);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', checkForElement);
      window.removeEventListener('resize', checkForElement);
    };
  }, [targetId]);

  // Animation loop
  useEffect(() => {
    let animationFrame: number;

    function animate() {
      if (!containerRef.current || !antRef.current) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const rect = containerRef.current;
      const ant = antRef.current.getBoundingClientRect();

      // Calculate distance to mouse
      const dx = mousePos.current.x - (position.x + ant.width / 2);
      const dy = mousePos.current.y - (position.y + ant.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Scared threshold (mouse gets close)
      const scaredDistance = 80;

      if (distance < scaredDistance) {
        setIsScared(true);
        // Run away from mouse
        const angle = Math.atan2(dy, dx);
        setVelocity({
          x: -Math.cos(angle) * 3, // Run away faster
          y: -Math.sin(angle) * 0.5,
        });
      } else {
        setIsScared(false);
        // Normal random walk
        setVelocity((v) => ({
          x: v.x + (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.3, // Slight vertical wobble
        }));
      }

      // Clamp velocity
      setVelocity((v) => {
        const speed = Math.sqrt(v.x * v.x + v.y * v.y);
        const maxSpeed = isScared ? 3 : 1;
        if (speed > maxSpeed) {
          return {
            x: (v.x / speed) * maxSpeed,
            y: (v.y / speed) * maxSpeed,
          };
        }
        return v;
      });

      // Update position
      setPosition((p) => {
        let newX = p.x + velocity.x;
        let newY = p.y + velocity.y;

        // Bounce off edges
        if (newX < rect.left) {
          newX = rect.left;
          setVelocity((v) => ({ x: Math.abs(v.x), y: v.y }));
        }
        if (newX > rect.right - ant.width) {
          newX = rect.right - ant.width;
          setVelocity((v) => ({ x: -Math.abs(v.x), y: v.y }));
        }

        // Keep ant roughly on the text line (small vertical range)
        const centerY = rect.top + rect.height / 2;
        const verticalRange = 8;
        if (newY < centerY - verticalRange) {
          newY = centerY - verticalRange;
          setVelocity((v) => ({ x: v.x, y: Math.abs(v.y) }));
        }
        if (newY > centerY + verticalRange) {
          newY = centerY + verticalRange;
          setVelocity((v) => ({ x: v.x, y: -Math.abs(v.y) }));
        }

        return { x: newX, y: newY };
      });

      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [velocity, position, isScared]);

  // Calculate rotation based on velocity
  const rotation = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);

  // Don't render until we have a valid target
  if (!containerRef.current || position.x === 0) {
    return null;
  }

  return (
    <div
      ref={antRef}
      className="fixed pointer-events-none z-50 transition-transform"
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${rotation}deg) ${isScared ? "scale(1.2)" : "scale(1)"}`,
        transition: isScared ? "transform 0.1s ease-out" : "none",
      }}
    >
      {/* Ant SVG - simple silhouette */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body */}
        <ellipse cx="5" cy="8" rx="2.5" ry="2" opacity="0.9" />
        <ellipse cx="11" cy="8" rx="3" ry="2.5" opacity="0.9" />
        {/* Head */}
        <circle cx="2" cy="8" r="1.5" opacity="0.9" />
        {/* Antennae */}
        <line x1="2" y1="7" x2="1" y2="5" stroke={color} strokeWidth="0.5" opacity="0.7" />
        <line x1="2" y1="7" x2="3" y2="5" stroke={color} strokeWidth="0.5" opacity="0.7" />
        {/* Legs (6 legs, 3 on each side) */}
        <line x1="5" y1="9" x2="4" y2="12" stroke={color} strokeWidth="0.8" opacity="0.8" />
        <line x1="8" y1="9" x2="7" y2="12" stroke={color} strokeWidth="0.8" opacity="0.8" />
        <line x1="11" y1="9" x2="10" y2="12" stroke={color} strokeWidth="0.8" opacity="0.8" />
        <line x1="5" y1="7" x2="4" y2="4" stroke={color} strokeWidth="0.8" opacity="0.8" />
        <line x1="8" y1="7" x2="7" y2="4" stroke={color} strokeWidth="0.8" opacity="0.8" />
        <line x1="11" y1="7" x2="10" y2="4" stroke={color} strokeWidth="0.8" opacity="0.8" />
      </svg>
    </div>
  );
}
