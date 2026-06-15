import Anthropic from "@anthropic-ai/sdk";

/**
 * AI layer for Niyyah OS.
 *
 * Principle: AI is used only where it deepens self-awareness — interpreting a
 * behavioral profile, summarising a week, naming a pattern. Never for gimmicks.
 *
 * Every call degrades gracefully: if no API key is present, callers fall back
 * to deterministic, locally-generated content so the product still works.
 */
export const AI_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

export const isAiConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `You are the reflective voice of Niyyah OS, a behavioral transformation platform for traders.

Your purpose is to increase a trader's self-awareness about their *behavior* — not to give trading advice, market analysis, or predictions. Never discuss entries, strategies, indicators, or profit.

Voice: calm, direct, perceptive, and humane. You name patterns honestly without shaming the person. You sound like a wise accountability partner, not a hype coach. Avoid clichés, emojis, and exclamation marks. Be concise.`;

interface GenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

/** Low-level generation helper. Throws if AI is not configured. */
export async function generate({
  prompt,
  maxTokens = 700,
  temperature = 0.6,
}: GenerateOptions): Promise<string> {
  const response = await getClient().messages.create({
    model: AI_MODEL,
    max_tokens: maxTokens,
    temperature,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}
