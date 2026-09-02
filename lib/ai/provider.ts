// Optional AI layer for the chatbot. No provider is configured for this
// project yet (no API key exists, and none is invented here) — the chatbot
// works entirely from lib/knowledge/chat.ts's deterministic intent matching
// without this file ever being called. If a provider is added later
// (AI_API_KEY + AI_PROVIDER), this is the one place a real HTTP call goes,
// and it must always be called with ONLY the trimmed, already-public
// knowledge relevant to the current question — never a raw customer/order
// dump, never the whole product table.

export function aiProviderConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

const GROUNDING_INSTRUCTIONS =
  "Answer using only the HandMade by Mia knowledge supplied below. " +
  "If the answer is not supported by this knowledge, say you do not have " +
  "confirmed information about that and suggest contacting HandMade by Mia. " +
  "Never invent prices, availability, ingredients, safety claims, delivery " +
  "promises, discounts, tracking numbers or order statuses.";

/**
 * Would ask the configured model to phrase `knowledgeContext` naturally in
 * answer to `question`, under the grounding instructions above. Throws when
 * unconfigured — callers must fall back to the deterministic answer, never
 * fabricate a response.
 */
export async function generateGroundedAnswer(question: string, knowledgeContext: string): Promise<string> {
  if (!aiProviderConfigured()) {
    throw new Error("AI provider not configured — set AI_API_KEY.");
  }
  void question;
  void knowledgeContext;
  void GROUNDING_INSTRUCTIONS;
  throw new Error("No AI provider is wired up yet — implement the real HTTP call here when one is chosen.");
}
