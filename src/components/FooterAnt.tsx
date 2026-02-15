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

type AntState = "trapped" | "escaping" | "entering" | "wandering" | "exiting";

/**
 * FooterAnt - The Great Escape
 *
 * NARRATIVE:
 * 1. Starts trapped inside "Built with Claude Code" badge on landing page
 * 2. Click to release (no message, just freedom!)
 * 3. Runs off screen, appears on another page
 * 4. Click again = joke message
 * 5. Click again = thank you message
 */
export function FooterAnt({ allowedPaths = ["/"] }: FooterAntProps) {
  const antRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [antState, setAntState] = useState<AntState>("trapped");
  const [isPaused, setIsPaused] = useState(false);
  const [isReleased, setIsReleased] = useState(false);
  const [encounterCount, setEncounterCount] = useState(0);
  const stateTimer = useRef<number>(0);
  const targetPoint = useRef({ x: 0, y: 0 });
  const directionChangeTimer = useRef<number>(0);
  const nextDirectionChange = useRef<number>(3000);
  const mousePos = useRef({ x: 0, y: 0 });

  // Track mouse position for evasion
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      mousePos.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Check release status and visibility
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentPath = window.location.pathname;

    // BLACKLIST: Never show on session pages
    if (currentPath.startsWith("/session")) {
      setIsVisible(false);
      return;
    }

    // WHITELIST: Only on landing, profile, settings
    const isAllowedPage = allowedPaths.includes(currentPath);
    if (!isAllowedPage) {
      setIsVisible(false);
      return;
    }

    // Check if ant has been released
    const releasedFlag = localStorage.getItem("parallax-ant-released");
    const released = releasedFlag === "true";
    setIsReleased(released);

    // Check encounter count
    const encounters = parseInt(localStorage.getItem("parallax-ant-encounters") || "0", 10);
    setEncounterCount(encounters);

    if (!released) {
      // Ant not released yet - only visible on landing page, trapped state
      setIsVisible(currentPath === "/");
      setAntState("trapped");
    } else {
      // Ant released - hide it (no wandering, just gone!)
      setIsVisible(false);
    }
  }, [allowedPaths]);

  // Initialize ant position
  useEffect(() => {
    if (!isVisible) return;

    // Only initialize position for trapped and entering states
    // Don't re-run for escaping/wandering/exiting
    if (antState === "escaping" || antState === "wandering" || antState === "exiting") {
      return;
    }

    const spawnAnt = () => {
      if (antState === "trapped") {
        // Find the badge and position ant inside it - ONCE
        let intervalId: ReturnType<typeof setInterval> | null = null;
        const findBadge = () => {
          const badge = document.getElementById("claude-code-badge");
          if (badge) {
            const rect = badge.getBoundingClientRect();
            setPosition({
              x: rect.left + rect.width / 2 - 7, // Center (ant is ~14px wide)
              y: rect.top + rect.height / 2 - 7,
            });
            // Clear interval once badge is found - prevents jumping!
            if (intervalId) clearInterval(intervalId);
          }
        };

        findBadge();
        // Re-check in case badge hasn't rendered yet, but stop once found
        intervalId = setInterval(findBadge, 500);
        setTimeout(() => { if (intervalId) clearInterval(intervalId); }, 3000);
      } else if (antState === "entering") {
        // Enter from random edge (released ant on other pages)
        const edge = Math.floor(Math.random() * 4);
        const w = window.innerWidth;
        const h = window.innerHeight;

        let startX = 0, startY = 0, targetX = 0, targetY = 0;

        switch (edge) {
          case 0:
            startX = Math.random() * w;
            startY = -200; // Start WAY off screen
            targetX = w * (0.2 + Math.random() * 0.6);
            targetY = h * (0.3 + Math.random() * 0.4);
            break;
          case 1:
            startX = w + 200; // Start WAY off screen
            startY = Math.random() * h;
            targetX = w * (0.4 + Math.random() * 0.4);
            targetY = h * (0.2 + Math.random() * 0.6);
            break;
          case 2:
            startX = Math.random() * w;
            startY = h + 200; // Start WAY off screen
            targetX = w * (0.2 + Math.random() * 0.6);
            targetY = h * (0.4 + Math.random() * 0.4);
            break;
          case 3:
            startX = -200; // Start WAY off screen
            startY = Math.random() * h;
            targetX = w * (0.2 + Math.random() * 0.4);
            targetY = h * (0.2 + Math.random() * 0.6);
            break;
        }

        setPosition({ x: startX, y: startY });
        targetPoint.current = { x: targetX, y: targetY };
        stateTimer.current = 0;
      }
    };

    spawnAnt();
  }, [isVisible, antState]);

  // Main animation loop with state machine
  useEffect(() => {
    if (!isVisible || isPaused) return; // Don't animate when paused!

    let animationFrame: number;
    const WANDER_MAX_TIME = 15000; // Force exit after 15 seconds

    function animate() {
      stateTimer.current += 16; // ~60fps
      directionChangeTimer.current += 16;

      // State machine
      if (antState === "trapped") {
        // Ant is trapped - but watching for the mouse!
        const dx = mousePos.current.x - position.x;
        const dy = mousePos.current.y - position.y;
        const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
        const scaredDistance = 100; // Feels mouse from 100px away

        if (distanceToMouse < scaredDistance) {
          // MOUSE DETECTED! ESCAPE NOW!
          console.log("🐜 MOUSE DETECTED - ESCAPING!");
          localStorage.setItem("parallax-ant-released", "true");
          localStorage.setItem("parallax-ant-encounters", "0");
          setIsReleased(true);

          // Set exit target (run directly away from mouse)
          const angle = Math.atan2(-dy, -dx); // Opposite direction from mouse
          const w = window.innerWidth;
          const h = window.innerHeight;

          // Run to nearest edge in the opposite direction
          targetPoint.current = {
            x: position.x + Math.cos(angle) * 1000, // Run far!
            y: position.y + Math.sin(angle) * 1000,
          };

          setAntState("escaping");
          stateTimer.current = 0;
        }
        return;
      } else if (antState === "escaping") {
        // Ant has been released! Run to freedom!
        const dx = targetPoint.current.x - position.x;
        const dy = targetPoint.current.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        console.log('🐜 ESCAPING:', { position, target: targetPoint.current, distance, velocity });

        if (distance < 50) {
          // Escaped! Gone forever (no wandering)
          console.log('🐜 ESCAPE COMPLETE - ant is free!');
          setIsVisible(false);
          return;
        } else {
          // Sprint toward freedom!
          const speed = 5; // Faster!
          const targetVelX = (dx / distance) * speed;
          const targetVelY = (dy / distance) * speed;

          setVelocity((v) => ({
            x: v.x + (targetVelX - v.x) * 0.5, // More aggressive lerp
            y: v.y + (targetVelY - v.y) * 0.5,
          }));
        }
      } else if (antState === "entering") {
        // Walk toward target point
        const dx = targetPoint.current.x - position.x;
        const dy = targetPoint.current.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 50) {
          // Reached target, start wandering
          setAntState("wandering");
          stateTimer.current = 0;
          directionChangeTimer.current = 0;
          nextDirectionChange.current = 2000 + Math.random() * 2000;
        } else {
          // Move toward target (smooth)
          const speed = 1.2;
          const targetVelX = (dx / distance) * speed;
          const targetVelY = (dy / distance) * speed;

          // Smooth lerp toward target velocity
          setVelocity((v) => ({
            x: v.x + (targetVelX - v.x) * 0.1,
            y: v.y + (targetVelY - v.y) * 0.1,
          }));
        }
      } else if (antState === "wandering") {
        // ELUSIVENESS: Run away from mouse (slow enough to catch!)
        const dx = mousePos.current.x - position.x;
        const dy = mousePos.current.y - position.y;
        const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
        const scaredDistance = 80; // Smaller detection radius (you can sneak up!)

        if (distanceToMouse < scaredDistance) {
          // Run away, but ant-speed (catchable!)
          const angle = Math.atan2(dy, dx);
          const targetVelX = -Math.cos(angle) * 1.2; // Slow enough to catch
          const targetVelY = -Math.sin(angle) * 1.2;

          setVelocity((v) => ({
            x: v.x + (targetVelX - v.x) * 0.15,
            y: v.y + (targetVelY - v.y) * 0.15,
          }));
        }

        // FORCE EXIT after max time (guaranteed to leave!)
        if (stateTimer.current > WANDER_MAX_TIME) {
          // Pick random exit edge
          const w = window.innerWidth;
          const h = window.innerHeight;
          const edge = Math.floor(Math.random() * 4);

          switch (edge) {
            case 0: targetPoint.current = { x: Math.random() * w, y: -200 }; break; // WAY off top
            case 1: targetPoint.current = { x: w + 200, y: Math.random() * h }; break; // WAY off right
            case 2: targetPoint.current = { x: Math.random() * w, y: h + 200 }; break; // WAY off bottom
            case 3: targetPoint.current = { x: -200, y: Math.random() * h }; break; // WAY off left
          }

          setAntState("exiting");
          stateTimer.current = 0;
        } else if (directionChangeTimer.current > nextDirectionChange.current) {
          // Time for smooth direction change
          directionChangeTimer.current = 0;
          nextDirectionChange.current = 2000 + Math.random() * 2000;

          // Pick new target direction (smooth)
          const targetVelX = (Math.random() - 0.5) * 1.5;
          const targetVelY = (Math.random() - 0.5) * 1.5;

          // Lerp toward new direction over multiple frames
          setVelocity((v) => ({
            x: v.x + (targetVelX - v.x) * 0.15,
            y: v.y + (targetVelY - v.y) * 0.15,
          }));
        } else {
          // Gradually slow down and speed up (organic feel)
          setVelocity((v) => ({
            x: v.x * 0.98 + (Math.random() - 0.5) * 0.05,
            y: v.y * 0.98 + (Math.random() - 0.5) * 0.05,
          }));
        }
      } else if (antState === "exiting") {
        // Walk toward exit point (faster and more direct)
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
          // Smooth acceleration toward exit
          const speed = 2.5;
          const targetVelX = (dx / distance) * speed;
          const targetVelY = (dy / distance) * speed;

          setVelocity((v) => ({
            x: v.x + (targetVelX - v.x) * 0.2,
            y: v.y + (targetVelY - v.y) * 0.2,
          }));
        }
      }

      // Update position (always smooth)
      setPosition((p) => ({
        x: p.x + velocity.x,
        y: p.y + velocity.y,
      }));

      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, isPaused, velocity, position, antState, allowedPaths]);

  // Handle ant click (no-op - trapped escapes on hover, no wandering state)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Ant escapes on hover, doesn't need click handler
  };

  if (!isVisible) {
    return null;
  }

  // Don't render if position hasn't been set yet (except for trapped state)
  if (position.x === -100 && position.y === -100 && antState !== "trapped") {
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
        className={`fixed z-50 ${antState === "trapped" ? "" : "cursor-pointer hover:scale-125"} transition-transform`}
        style={{
          left: position.x,
          top: position.y,
          transform: `rotate(${rotation}deg)`,
        }}
        title={antState === "trapped" ? "Hover to scare me!" : "Click me!"}
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

      {/* Easter egg message - SUPER VISIBLE */}
      {showMessage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
          onClick={() => {
            setShowMessage(false);
            setIsPaused(false);
          }}
        >
          {/* Message card - WHITE in light, DARK in dark mode */}
          <div
            className="relative rounded-lg max-w-lg p-8 shadow-2xl animate-[scale-in_0.2s_ease-out]"
            style={{
              backgroundColor: document.documentElement.classList.contains("light") ? "#ffffff" : "#1a1410",
              border: "3px solid " + (document.documentElement.classList.contains("light") ? "#000000" : "#d4a040"),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowMessage(false);
                setIsPaused(false);
              }}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors font-bold text-xl"
              style={{
                color: document.documentElement.classList.contains("light") ? "#000000" : "#c9b9a3",
              }}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="pr-10 mb-6">
              <p
                className="text-base leading-relaxed"
                style={{
                  color: document.documentElement.classList.contains("light") ? "#000000" : "#c9b9a3",
                }}
              >
                {message}
              </p>
            </div>
            <button
              onClick={() => {
                setShowMessage(false);
                setIsPaused(false);
              }}
              className="w-full px-6 py-3 rounded font-mono text-sm uppercase tracking-wider transition-colors"
              style={{
                backgroundColor: document.documentElement.classList.contains("light") ? "#000000" : "#d4a040",
                color: document.documentElement.classList.contains("light") ? "#ffffff" : "#000000",
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
