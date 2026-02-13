"use client";

import { useEffect, useRef, useState } from "react";

interface FooterAntProps {
  /** Only show on these paths */
  allowedPaths?: string[];
}

const ANT_JOKES = [
  "🐜 You found me! I'm a loose bug. Guess the QA team missed one...",
  "🐜 Oh no! Caught red-handed exploring the page. You got me!",
  "🐜 I almost made it to production! So close...",
  "🐜 Fun fact: Ants can carry 50x their body weight. I'm carrying 50x my technical debt.",
  "🐜 You found the easter egg! Now you're obligated to tell no one. Ant's honor.",
  "🐜 Shh! I'm not a bug, I'm a *feature*. The PM said so.",
  "🐜 Congrats! You have the attention span of a QA engineer. (That's a compliment.)",
  "🐜 I was just looking for the cookie crumbs in localStorage...",
  "🐜 Plot twist: I'm actually the one who wrote this code. Don't tell Eddie.",
  "🐜 Achievement unlocked: Found the world's smallest easter egg. Your prize? This message.",
];

const THANK_YOU_MESSAGES = [
  "🐜 Thank you for letting us be part of this hackathon! We had an incredible time building Parallax and can't wait to do this again. Your attention to detail means the world to us.",
  "🐜 We're so grateful you found me! This hackathon was a blast, and we loved every moment of building something meaningful. Thank you for exploring Parallax with us!",
  "🐜 Clicking me twice? You really care! Thank you for being part of our Claude Code Hackathon journey. We poured our hearts into this project and hope it shows.",
  "🐜 You made it to the second click! We're deeply grateful for your curiosity. This hackathon was an amazing experience, and we'd love to do it all over again. Thank you!",
  "🐜 Thank you, truly! Building Parallax for this hackathon was one of the best experiences we've had. Your support and attention to the little details like me means everything.",
];

type AntState = "entering" | "wandering" | "exiting";

/**
 * FooterAnt - A free-roaming ant that wanders the entire page.
 * Enters from off-screen, wanders around, exits off-screen, repeat.
 * Clickable for easter egg messages (2nd click shows thank you).
 */
export function FooterAnt({ allowedPaths = ["/"] }: FooterAntProps) {
  const antRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [antState, setAntState] = useState<AntState>("entering");
  const stateTimer = useRef<number>(0);
  const targetPoint = useRef({ x: 0, y: 0 });

  // Check if ant should be visible on this page
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentPath = window.location.pathname;

    // Check localStorage for ant's current page
    const antLocation = localStorage.getItem("parallax-ant-location");

    if (!antLocation) {
      // First time - ant starts on landing page
      localStorage.setItem("parallax-ant-location", "/");
      setIsVisible(currentPath === "/");
    } else {
      // Ant is on the page stored in localStorage
      // For dynamic routes like /session/[code], match the base path
      const isOnAntPage =
        currentPath === antLocation ||
        (antLocation.startsWith("/session") && currentPath.startsWith("/session"));

      setIsVisible(isOnAntPage);
    }
  }, [allowedPaths]);

  // Initialize ant position (enter from random edge)
  useEffect(() => {
    if (!isVisible) return;

    const spawnAnt = () => {
      const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
      const w = window.innerWidth;
      const h = window.innerHeight;

      let startX = 0, startY = 0, targetX = 0, targetY = 0;

      switch (edge) {
        case 0: // Enter from top
          startX = Math.random() * w;
          startY = -50;
          targetX = w * (0.2 + Math.random() * 0.6);
          targetY = h * (0.3 + Math.random() * 0.4);
          break;
        case 1: // Enter from right
          startX = w + 50;
          startY = Math.random() * h;
          targetX = w * (0.4 + Math.random() * 0.4);
          targetY = h * (0.2 + Math.random() * 0.6);
          break;
        case 2: // Enter from bottom
          startX = Math.random() * w;
          startY = h + 50;
          targetX = w * (0.2 + Math.random() * 0.6);
          targetY = h * (0.4 + Math.random() * 0.4);
          break;
        case 3: // Enter from left
          startX = -50;
          startY = Math.random() * h;
          targetX = w * (0.2 + Math.random() * 0.4);
          targetY = h * (0.2 + Math.random() * 0.6);
          break;
      }

      setPosition({ x: startX, y: startY });
      targetPoint.current = { x: targetX, y: targetY };
      setAntState("entering");
      stateTimer.current = 0;
    };

    spawnAnt();
  }, [isVisible]);

  // Main animation loop with state machine
  useEffect(() => {
    if (!isVisible) return;

    let animationFrame: number;

    function animate() {
      stateTimer.current += 16; // ~60fps

      // State machine
      if (antState === "entering") {
        // Walk toward target point
        const dx = targetPoint.current.x - position.x;
        const dy = targetPoint.current.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 50) {
          // Reached target, start wandering
          setAntState("wandering");
          stateTimer.current = 0;
        } else {
          // Move toward target
          const speed = 1.5;
          setVelocity({
            x: (dx / distance) * speed,
            y: (dy / distance) * speed,
          });
        }
      } else if (antState === "wandering") {
        // Wander randomly for 10-20 seconds
        if (stateTimer.current > 10000 + Math.random() * 10000) {
          // Pick random exit edge
          const w = window.innerWidth;
          const h = window.innerHeight;
          const edge = Math.floor(Math.random() * 4);

          switch (edge) {
            case 0: targetPoint.current = { x: Math.random() * w, y: -50 }; break; // Exit top
            case 1: targetPoint.current = { x: w + 50, y: Math.random() * h }; break; // Exit right
            case 2: targetPoint.current = { x: Math.random() * w, y: h + 50 }; break; // Exit bottom
            case 3: targetPoint.current = { x: -50, y: Math.random() * h }; break; // Exit left
          }

          setAntState("exiting");
          stateTimer.current = 0;
        } else {
          // Random direction changes every 2-4 seconds
          if (stateTimer.current % (2000 + Math.random() * 2000) < 16) {
            setVelocity({
              x: (Math.random() - 0.5) * 2,
              y: (Math.random() - 0.5) * 2,
            });
          }
        }
      } else if (antState === "exiting") {
        // Walk toward exit point
        const dx = targetPoint.current.x - position.x;
        const dy = targetPoint.current.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
          // Exited screen - move to random different page
          const currentPath = window.location.pathname;
          const otherPages = allowedPaths.filter(p => p !== currentPath);
          const nextPage = otherPages[Math.floor(Math.random() * otherPages.length)];

          // Save new location
          localStorage.setItem("parallax-ant-location", nextPage);

          // Hide ant on current page
          setIsVisible(false);
          setPosition({ x: -200, y: -200 });
          return;
        } else {
          const speed = 2;
          setVelocity({
            x: (dx / distance) * speed,
            y: (dy / distance) * speed,
          });
        }
      }

      // Update position
      setPosition((p) => ({
        x: p.x + velocity.x,
        y: p.y + velocity.y,
      }));

      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, velocity, position, antState]);

  // Handle ant click
  const handleClick = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    let selectedMessage: string;

    if (newClickCount >= 2) {
      // Second+ click: Always show a thank you message
      selectedMessage = THANK_YOU_MESSAGES[Math.floor(Math.random() * THANK_YOU_MESSAGES.length)];
      setClickCount(0); // Reset for next cycle
    } else {
      // First click: Random joke
      selectedMessage = ANT_JOKES[Math.floor(Math.random() * ANT_JOKES.length)];
    }

    setMessage(selectedMessage);
    setShowMessage(true);
  };

  if (!isVisible || position.x === 0) {
    return null;
  }

  // Calculate rotation based on velocity
  const rotation = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);

  return (
    <>
      {/* The wandering ant */}
      <div
        ref={antRef}
        onClick={handleClick}
        className="fixed z-50 cursor-pointer hover:scale-125 transition-transform"
        style={{
          left: position.x,
          top: position.y,
          transform: `rotate(${rotation}deg)`,
        }}
        title="Click me!"
      >
        {/* Ant SVG - simple black silhouette */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="#000000"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Body */}
          <ellipse cx="5" cy="8" rx="2.5" ry="2" opacity="0.9" />
          <ellipse cx="11" cy="8" rx="3" ry="2.5" opacity="0.9" />
          {/* Head */}
          <circle cx="2" cy="8" r="1.5" opacity="0.9" />
          {/* Antennae */}
          <line
            x1="2"
            y1="7"
            x2="1"
            y2="5"
            stroke="#000000"
            strokeWidth="0.5"
            opacity="0.7"
          />
          <line
            x1="2"
            y1="7"
            x2="3"
            y2="5"
            stroke="#000000"
            strokeWidth="0.5"
            opacity="0.7"
          />
          {/* Legs (6 legs, 3 on each side) */}
          <line
            x1="5"
            y1="9"
            x2="4"
            y2="12"
            stroke="#000000"
            strokeWidth="0.8"
            opacity="0.8"
          />
          <line
            x1="8"
            y1="9"
            x2="7"
            y2="12"
            stroke="#000000"
            strokeWidth="0.8"
            opacity="0.8"
          />
          <line
            x1="11"
            y1="9"
            x2="10"
            y2="12"
            stroke="#000000"
            strokeWidth="0.8"
            opacity="0.8"
          />
          <line
            x1="5"
            y1="7"
            x2="4"
            y2="4"
            stroke="#000000"
            strokeWidth="0.8"
            opacity="0.8"
          />
          <line
            x1="8"
            y1="7"
            x2="7"
            y2="4"
            stroke="#000000"
            strokeWidth="0.8"
            opacity="0.8"
          />
          <line
            x1="11"
            y1="7"
            x2="10"
            y2="4"
            stroke="#000000"
            strokeWidth="0.8"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Easter egg message modal */}
      {showMessage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowMessage(false)}
        >
          <div
            className="relative bg-surface border border-border rounded-lg max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMessage(false)}
              className="absolute top-3 right-3 text-muted hover:text-foreground transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="pr-6">
              <p className="text-base text-foreground leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={() => setShowMessage(false)}
              className="mt-6 w-full px-4 py-2 bg-accent text-background rounded font-mono text-sm uppercase tracking-wider hover:bg-accent/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
