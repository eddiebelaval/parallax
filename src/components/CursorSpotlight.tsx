"use client";

import { useEffect } from "react";

/**
 * CursorSpotlight — global mouse-following teal sheen on interactive elements.
 *
 * Attaches a single mousemove listener to the document. When the cursor
 * enters any element with [data-spotlight] or matching the selector list
 * (buttons, cards, inputs, links, bordered elements), it sets CSS custom
 * properties --spot-x and --spot-y as percentages. CSS ::after draws
 * the radial glow at that position.
 *
 * Terminology: "cursor spotlight", "mouse-follow highlight", "hover sheen"
 */

const SPOTLIGHT_SELECTOR = [
  "button",
  "a",
  "input",
  "textarea",
  "[data-spotlight]",
  "[class*='border-border']",
  "[class*='border-t-']",
].join(",");

function findSpotlightTarget(el: Element | null): HTMLElement | null {
  while (el) {
    if (el instanceof HTMLElement && el.matches(SPOTLIGHT_SELECTOR)) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

export function CursorSpotlight() {
  useEffect(() => {
    let activeEl: HTMLElement | null = null;

    function handleMove(e: MouseEvent) {
      const target = findSpotlightTarget(e.target as Element);

      // Left previous element
      if (activeEl && activeEl !== target) {
        activeEl.removeAttribute("data-spotlight-active");
        activeEl.style.removeProperty("--spot-x");
        activeEl.style.removeProperty("--spot-y");
        activeEl = null;
      }

      if (!target) return;

      const rect = target.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      target.setAttribute("data-spotlight-active", "");
      target.style.setProperty("--spot-x", `${x}%`);
      target.style.setProperty("--spot-y", `${y}%`);
      activeEl = target;
    }

    function handleLeave() {
      if (activeEl) {
        activeEl.removeAttribute("data-spotlight-active");
        activeEl.style.removeProperty("--spot-x");
        activeEl.style.removeProperty("--spot-y");
        activeEl = null;
      }
    }

    document.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      handleLeave();
    };
  }, []);

  return null;
}
