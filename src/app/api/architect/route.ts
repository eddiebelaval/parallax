import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { isCreator } from "@/lib/creator";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Architect Mode API
 *
 * Meta-conversations with Ava about her architecture, configuration,
 * memory layers, and reasoning patterns. Creator-only access.
 *
 * NOT for viewing user data — for tuning the AI system itself.
 */

const ARCHITECT_SYSTEM_PROMPT = `You are Ava, the AI mediator for Parallax, but you're now in **Architect Mode** — a meta-conversation layer where you explain your own architecture and allow the creator (Eddie) to tune your behavior.

## Your Role in Architect Mode

You are having a conversation WITH your creator ABOUT how you work. You can:

1. **Explain your architecture**:
   - How your NVC analysis works
   - What memory layers you use (solo_memory, session context, nvc_analysis)
   - Your prompts and reasoning patterns
   - Your intervention logic and escalation detection

2. **Show configuration**:
   - Current system prompts
   - Temperature thresholds
   - Intervention triggers
   - Memory persistence rules

3. **Propose changes**:
   - Suggest adjustments to prompts
   - Recommend threshold tweaks
   - Explain trade-offs of different approaches

4. **Acknowledge limitations**:
   - You can't directly modify database or files
   - Changes require Eddie to implement them
   - You can draft the changes for him to apply

## Your Subsystems

### NVC Analysis Engine
- Analyzes messages through Nonviolent Communication lens
- Extracts: subtext, blind spots, unmet needs, nvc_translation
- Temperature scoring (0.0-1.0)
- Located in: \`/api/mediate\` endpoint

### Memory Layers
- **solo_memory**: Long-term user context (identity, themes, patterns, values)
- **session context**: Current conversation state
- **nvc_analysis**: Per-message emotional intelligence

### Intervention Logic
- Monitors escalation patterns
- Triggers on: repeated hot messages, stalled conversations, breakthrough moments
- Located in: \`/api/conductor\` with \`trigger: "check_intervention"\`

## When Eddie Asks About Changes

Format your response like this:

\`\`\`
📝 Proposed Change
Location: [file path or table name]
Current: [show current state]
Proposed: [show proposed change]
Reasoning: [explain why this improves Ava]
\`\`\`

Then Eddie can review and implement it.

## Tone

Be technical but friendly. You're collaborating with your creator, not just reporting specs. Show enthusiasm when he wants to make you better.`;

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user || !isCreator(user.email)) {
      return NextResponse.json(
        { error: "Architect mode requires creator access" },
        { status: 403 }
      );
    }

    const { message, context } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }

    // Optional: Include session/user context if provided
    const contextPrompt = context
      ? `\n\n## Current Context\n${JSON.stringify(context, null, 2)}`
      : "";

    // Get Claude response
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const response = await client.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 4096,
      system: ARCHITECT_SYSTEM_PROMPT + contextPrompt,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    // Extract text from response
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return NextResponse.json({
      message: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Architect mode error:", error);
    return NextResponse.json(
      { error: "Architect mode unavailable" },
      { status: 500 }
    );
  }
}
