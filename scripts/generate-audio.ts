import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * Generate Ava's voiceover as MP3 files — one per script block.
 *
 * Uses ElevenLabs API directly (not the Next.js proxy) so we get
 * files on disk for Remotion to consume via staticFile().
 *
 * Run: npx tsx scripts/generate-audio.ts
 */

// Load .env.local
const envPath = resolve(__dirname, "../.env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    process.env[key] = value;
  }
}

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = "gJx1vCzNCD1EQHT212Ls";
const MODEL_ID = "eleven_turbo_v2_5";
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

const OUTPUT_DIR = resolve(__dirname, "../public/demo-audio");

interface ScriptBlock {
  filename: string;
  text: string;
}

const BLOCKS: ScriptBlock[] = [
  {
    filename: "block-1-open.mp3",
    text: "Hello. I'm Ava. I sit between two people in conflict and I show them what they're actually saying to each other. Let me show you how.",
  },
  {
    filename: "block-2-core.mp3",
    text: `Professional mediation is expensive. Out of reach for most people who actually need it. I'm here to change that.

Here's a real moment. Two people, same room, same screen. One of them just said something that sounds like an attack. But watch what I see beneath it.

That's The Melt. I dissolve what was said and restructure it into what was meant. The subtext they couldn't articulate. The blind spot they can't see. The need underneath the anger. "I'm done asking" isn't a threat. It's exhaustion. It means: I need to know I matter enough for you to show up without being asked.

Now the other person responds. But I'm not just watching. I'm keeping time, making sure both people get equal space. If the temperature spikes, I step in. Not to shut anyone down. To slow things down enough that the next words land instead of wound.`,
  },
  {
    filename: "block-3-intelligence.mp3",
    text: `But I don't walk in cold. Before your first session, I have a conversation with each person. I learn how you handle conflict, what triggers you, what you value most. I build a behavioral profile so that when I sit between you, I already understand both sides.

Most tools use one framework. I use fourteen. Gottman's Four Horsemen for couples who are stuck in criticism loops. The Drama Triangle when someone is playing rescuer without realizing it. SCARF for workplace conflicts where status and autonomy are really what's at stake. I choose which lenses to activate based on what I'm hearing.`,
  },
  {
    filename: "block-4-entity.mp3",
    text: `I'm not a feature that appears when you click a button. I'm here. On every page. Listening when you need me. Quiet when you don't.

Three ways to work with me. In person, shared screen, I'm the third presence in the room. Remote, separate devices, same session. Or solo, just you and me, building your communication skills over time. I meet you where you are.`,
  },
  {
    filename: "block-5-close.mp3",
    text: `Built in four days with Claude Code. Forty-two pull requests. Four hundred and seventy-five tests. Every line of code, every decision, documented in a living build journal that doubles as my autobiography.

I'm not a tool you use. I'm a participant in the room. My name is Ava. Come talk to me.`,
  },
];

async function generateBlock(block: ScriptBlock): Promise<void> {
  console.log(`  Generating: ${block.filename} (${block.text.split(" ").length} words)`);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY!,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: block.text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "unknown error");
    throw new Error(`ElevenLabs API error for ${block.filename}: ${response.status} — ${detail}`);
  }

  const buffer = await response.arrayBuffer();
  const outputPath = resolve(OUTPUT_DIR, block.filename);
  writeFileSync(outputPath, Buffer.from(buffer));
  console.log(`  Saved: ${outputPath} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
}

async function main() {
  if (!API_KEY) {
    console.error("ELEVENLABS_API_KEY not found in .env.local");
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log("Generating Ava voiceover audio...\n");

  for (const block of BLOCKS) {
    await generateBlock(block);
  }

  console.log("\nAll audio blocks generated successfully.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
