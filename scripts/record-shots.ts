import { chromium, Browser, BrowserContext, Page } from "playwright";
import { resolve, join } from "path";
import { mkdirSync, renameSync } from "fs";

/**
 * Automated screen recording for the Parallax demo video.
 *
 * Captures discrete shots from the live app at localhost:3000.
 * Each shot uses CSS-transform-based zoom to focus tightly on
 * the relevant UI element rather than showing the full page.
 *
 * Prerequisites:
 *   - Dev server running: npm run dev
 *   - Supabase connected (for session data)
 *
 * Run: npx tsx scripts/record-shots.ts
 */

const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = resolve(__dirname, "../public/demo-shots");
const VIEWPORT = { width: 1920, height: 1080 };

interface ShotConfig {
  name: string;
  shotNumber: number;
  durationMs: number;
  actions: (page: Page) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Zoom helpers
// ---------------------------------------------------------------------------

/**
 * Zoom the viewport to center on a specific element using CSS transforms.
 *
 * After navigating and scrolling the target into view, applies
 * `transform: translate(tx, ty) scale(S)` on <body> with origin 0,0.
 * This centers the element in the 1920x1080 viewport at the desired
 * zoom level — the video recorder captures the zoomed result.
 *
 * @param page      Playwright page
 * @param selector  CSS selector for the zoom target
 * @param scale     Override scale factor (auto-calculated if omitted)
 * @param padding   Fraction of viewport to leave as margin (default 0.1 = 10%)
 */
async function zoomToElement(
  page: Page,
  selector: string,
  scale?: number,
  padding = 0.1,
) {
  await page.waitForSelector(selector, { timeout: 5000 }).catch(() => {
    console.log(`    Selector not found: ${selector} — skipping zoom`);
  });

  const el = page.locator(selector).first();
  if (!(await el.isVisible().catch(() => false))) {
    console.log(`    Element not visible: ${selector} — skipping zoom`);
    return;
  }

  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  await page.evaluate(
    ({ sel, overrideScale, pad, vpW, vpH }) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const rect = el.getBoundingClientRect();

      // Auto-calculate scale to fill viewport with padding, or use override
      const padFactor = 1 - pad * 2;
      const autoScale = Math.min(
        (vpW * padFactor) / rect.width,
        (vpH * padFactor) / rect.height,
      );
      const s = overrideScale ?? autoScale;

      // Element center in viewport coords
      const elCx = rect.left + rect.width / 2;
      const elCy = rect.top + rect.height / 2;

      // After scale(S) around origin (0,0), element center moves to (elCx*S, elCy*S).
      // Translate to put it at viewport center:
      const tx = vpW / 2 - elCx * s;
      const ty = vpH / 2 - elCy * s;

      document.body.style.transformOrigin = "0px 0px";
      document.body.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    },
    {
      sel: selector,
      overrideScale: scale ?? null,
      pad: padding,
      vpW: VIEWPORT.width,
      vpH: VIEWPORT.height,
    },
  );

  await page.waitForTimeout(200);
}

/**
 * Reset any CSS zoom applied by zoomToElement.
 */
async function resetZoom(page: Page) {
  await page.evaluate(() => {
    document.body.style.transform = "";
    document.body.style.transformOrigin = "";
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  });
}

/**
 * Force all narration-hidden sections visible on the landing page.
 * The narration controller starts sections with .section-hidden (opacity: 0).
 * For recording we want everything visible immediately.
 */
async function forceAllSectionsVisible(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll(".section-hidden").forEach((el) => {
      (el as HTMLElement).classList.remove("section-hidden");
      (el as HTMLElement).style.opacity = "1";
      (el as HTMLElement).style.transform = "translateY(0)";
    });
  });
}

// ---------------------------------------------------------------------------
// Recording context
// ---------------------------------------------------------------------------

async function createRecordingContext(
  browser: Browser,
): Promise<BrowserContext> {
  return browser.newContext({
    recordVideo: {
      dir: OUTPUT_DIR,
      size: VIEWPORT,
    },
    viewport: VIEWPORT,
    colorScheme: "dark",
  });
}

/**
 * Record a single shot: open context, run actions, wait duration, close.
 */
async function recordShot(
  browser: Browser,
  shot: ShotConfig,
): Promise<void> {
  console.log(
    `  Recording Shot ${shot.shotNumber}: ${shot.name} (${shot.durationMs / 1000}s)`,
  );

  const context = await createRecordingContext(browser);
  const page = await context.newPage();

  try {
    await shot.actions(page);
    await page.waitForTimeout(shot.durationMs);
  } catch (err) {
    console.error(`  Error in shot ${shot.shotNumber}:`, err);
  }

  await page.close();

  const video = page.video();
  if (video) {
    const videoPath = await video.path();
    if (videoPath) {
      const targetPath = join(
        OUTPUT_DIR,
        `shot-${String(shot.shotNumber).padStart(2, "0")}-${shot.name}.webm`,
      );
      try {
        renameSync(videoPath, targetPath);
        console.log(`  Saved: ${targetPath}`);
      } catch {
        console.log(`  Video saved at: ${videoPath}`);
      }
    }
  }

  await context.close();
}

// ---------------------------------------------------------------------------
// Shot definitions
// ---------------------------------------------------------------------------

const SHOTS: ShotConfig[] = [
  // ── Block 1: Open ──────────────────────────────────────────────────────

  // Shot 1: Orb on black — tight on the orb/pill in the hero
  {
    name: "orb-on-black",
    shotNumber: 1,
    durationMs: 4000,
    actions: async (page) => {
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      await forceAllSectionsVisible(page);
      await page.waitForTimeout(1000);
      // Zoom tight on the header orb pill
      await zoomToElement(page, ".ava-pill-orb", 2.5);
    },
  },

  // Shot 2: Landing page hero — tagline + orb visible
  {
    name: "landing-page",
    shotNumber: 2,
    durationMs: 3000,
    actions: async (page) => {
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      await forceAllSectionsVisible(page);
      await page.waitForTimeout(1000);
      await zoomToElement(
        page,
        'section[data-narration-id="hero"]',
        1.5,
      );
    },
  },

  // ── Block 2: Core Experience ───────────────────────────────────────────

  // Shot 4: Heated message — zoom on center message column, type message
  {
    name: "heated-message",
    shotNumber: 4,
    durationMs: 10000,
    actions: async (page) => {
      await page.goto(`${BASE_URL}/session/9X594W`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(2000);
      // Zoom to the message area (center column)
      await zoomToElement(
        page,
        ".flex-1.overflow-y-auto.min-h-0",
        2,
      );
      // Type a heated message
      const input = page
        .locator(
          '[data-testid="message-input"], textarea, input[type="text"]',
        )
        .first();
      if (await input.isVisible().catch(() => false)) {
        await input.fill(
          "You always say you're going to help and then you just disappear. I'm done asking.",
        );
        await page.waitForTimeout(1000);
        const sendBtn = page
          .locator('[data-testid="send-button"], button[type="submit"]')
          .first();
        if (await sendBtn.isVisible().catch(() => false)) {
          await sendBtn.click();
        }
      }
      await page.waitForTimeout(4000);
    },
  },

  // Shot 5: The Melt — tight on the most recent analysis card
  {
    name: "the-melt",
    shotNumber: 5,
    durationMs: 12000,
    actions: async (page) => {
      await page.goto(`${BASE_URL}/session/9X594W`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(3000);
      // Zoom tight on the last analysis-reveal element (the Melt target)
      await zoomToElement(page, ".analysis-reveal:last-of-type", 2.5);
      // Let the Melt dissolve animation breathe
      await page.waitForTimeout(7000);
    },
  },

  // Shot 6: NVC analysis expanded
  {
    name: "nvc-analysis",
    shotNumber: 6,
    durationMs: 8000,
    actions: async (page) => {
      await page.goto(`${BASE_URL}/session/9X594W`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(2000);
      // Zoom to the analysis card area
      await zoomToElement(page, ".analysis-reveal", 2);
      // Click to expand analysis if available
      const analysisCard = page
        .locator('[data-testid="analysis-card"], .analysis-reveal')
        .first();
      if (await analysisCard.isVisible().catch(() => false)) {
        await analysisCard.click();
      }
      await page.waitForTimeout(5000);
    },
  },

  // Shot 7: Turn mechanics — timer + turn indicator at bottom
  {
    name: "turn-mechanics",
    shotNumber: 7,
    durationMs: 8000,
    actions: async (page) => {
      await page.goto(`${BASE_URL}/session/9X594W`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(2000);
      // Zoom to the ActiveSpeakerBar wrapper at the bottom
      // It's the last .flex-shrink-0 child in the session view
      await zoomToElement(
        page,
        ".flex-shrink-0:has(textarea, input, [data-testid='message-input'])",
        2,
      );
      await page.waitForTimeout(5000);
    },
  },

  // Shot 8: Signal Rail — rail alongside messages, not just the rail
  {
    name: "signal-rail",
    shotNumber: 8,
    durationMs: 5000,
    actions: async (page) => {
      await page.goto(`${BASE_URL}/session/9X594W`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(1000);
      // Zoom on the flex wrapper containing both SignalRail and messages
      await zoomToElement(page, ".flex.gap-3", 2.5);
      await page.waitForTimeout(2000);
    },
  },

  // Shot 9: X-Ray Glance — mild zoom to crop page margins
  {
    name: "xray-glance",
    shotNumber: 9,
    durationMs: 5000,
    actions: async (page) => {
      await page.goto(`${BASE_URL}/session/9X594W`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(2000);
      // Mild zoom — show 3-column layout but crop browser margins
      await zoomToElement(page, "main", 1.3);
      await page.waitForTimeout(2000);
    },
  },

  // ── Block 3: Intelligence ──────────────────────────────────────────────

  // Shot 10: Interview — Ava asking questions
  {
    name: "interview",
    shotNumber: 10,
    durationMs: 8000,
    actions: async (page) => {
      await page.goto(`${BASE_URL}/interview`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(2000);
      // Zoom into the conversation messages area
      await zoomToElement(
        page,
        ".flex-1.overflow-y-auto.px-8.py-6.space-y-8",
        1.8,
      );
      await page.waitForTimeout(5000);
    },
  },

  // Shot 11: Profile dashboard
  {
    name: "profile-dashboard",
    shotNumber: 11,
    durationMs: 5000,
    actions: async (page) => {
      await page.goto(`${BASE_URL}/profile`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(1000);
      // Zoom to profile content
      await zoomToElement(page, ".max-w-2xl.mx-auto.px-6.py-10", 1.8);
      await page.waitForTimeout(3000);
    },
  },

  // Shot 12: Lens grid / temperature showcase
  {
    name: "lens-grid",
    shotNumber: 12,
    durationMs: 6000,
    actions: async (page) => {
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      await forceAllSectionsVisible(page);
      await page.waitForTimeout(1000);
      // Scroll to and zoom on the temperature showcase section
      await zoomToElement(
        page,
        'section[data-narration-id="temperature-showcase"]',
        2,
      );
      await page.waitForTimeout(3000);
    },
  },

  // ── Block 4: Entity ────────────────────────────────────────────────────

  // Shot 14: Orb quick cuts — 4 rapid navigations, zoom to orb each time
  {
    name: "orb-quick-cuts",
    shotNumber: 14,
    durationMs: 8000,
    actions: async (page) => {
      const pages = ["/", "/home", "/session/9X594W", "/interview"];
      for (const path of pages) {
        await page.goto(`${BASE_URL}${path}`, {
          waitUntil: "domcontentloaded",
        });
        await page.waitForTimeout(300);
        // Force sections visible on landing page
        if (path === "/") {
          await forceAllSectionsVisible(page);
        }
        // Zoom to the orb on each page
        await zoomToElement(page, ".ava-pill-orb", 2.5);
        await page.waitForTimeout(1200);
        await resetZoom(page);
      }
    },
  },

  // Shot 15: Three doors — mode selection
  {
    name: "three-doors",
    shotNumber: 15,
    durationMs: 4000,
    actions: async (page) => {
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      await forceAllSectionsVisible(page);
      await page.waitForTimeout(1000);
      await zoomToElement(
        page,
        'section[data-narration-id="the-door"]',
        2,
      );
      await page.waitForTimeout(2000);
    },
  },

  // Shot 16: In-person mode
  {
    name: "in-person-mode",
    shotNumber: 16,
    durationMs: 4000,
    actions: async (page) => {
      await page.goto(`${BASE_URL}/session/9X594W`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(1000);
      await zoomToElement(page, "main", 1.5);
      await page.waitForTimeout(2000);
    },
  },

  // Shot 17: Remote mode
  {
    name: "remote-mode",
    shotNumber: 17,
    durationMs: 4000,
    actions: async (page) => {
      await page.goto(`${BASE_URL}/session/TEST02`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(1000);
      await zoomToElement(page, "main", 1.5);
      await page.waitForTimeout(2000);
    },
  },

  // Shot 18: Solo mode
  {
    name: "solo-mode",
    shotNumber: 18,
    durationMs: 4000,
    actions: async (page) => {
      await page.goto(`${BASE_URL}/session/SOLO01`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(1000);
      await zoomToElement(page, "main", 1.5);
      await page.waitForTimeout(2000);
    },
  },

  // ── Block 5: Close ─────────────────────────────────────────────────────

  // Shot 19: GitHub repo — zoom past chrome to repo content
  {
    name: "github-montage",
    shotNumber: 19,
    durationMs: 4000,
    actions: async (page) => {
      await page.goto("https://github.com/eddiebelaval/parallax", {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(1000);
      // Zoom to the main repo content area
      await zoomToElement(page, "div.application-main", 1.5);
      await page.waitForTimeout(2000);
    },
  },

  // Shot 20: Final orb — tightest zoom, intimate close-up
  {
    name: "final-orb",
    shotNumber: 20,
    durationMs: 6000,
    actions: async (page) => {
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      await forceAllSectionsVisible(page);
      await page.waitForTimeout(1000);
      // Tightest zoom of the entire video — 3x on the orb
      await zoomToElement(page, ".ava-pill-orb", 3);
      await page.waitForTimeout(4000);
    },
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("Starting Parallax demo shot recording (zoomed framing)...");
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Viewport: ${VIEWPORT.width}x${VIEWPORT.height}\n`);

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    for (const shot of SHOTS) {
      await recordShot(browser, shot);
    }
    console.log("\nAll shots recorded successfully.");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
