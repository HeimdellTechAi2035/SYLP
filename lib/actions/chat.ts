"use server";

import { getCustomerSession } from "@/lib/customer-auth";
import { askChatbot, type ChatResponse } from "@/lib/knowledge/chat";
import { getClientIp, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";

const MAX_INPUT_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_MESSAGES = 30; // generous — a real back-and-forth conversation, not a spam-bot's

/**
 * The only entry point the chat widget calls. customerId is read from the
 * verified session cookie here — never accepted as an argument from the
 * client, so a message body can't impersonate another customer.
 */
export async function sendChatMessage(
  message: string,
  context?: { orderNumber?: string; email?: string; lastProductSlug?: string }
): Promise<ChatResponse> {
  const ip = await getClientIp();
  const rateLimitKey = `chat:${ip}`;

  if (isRateLimited(rateLimitKey, RATE_LIMIT_MAX_MESSAGES, RATE_LIMIT_WINDOW_MS)) {
    return {
      text: "You're sending messages a little quickly — please wait a moment and try again.",
      links: [],
      resolved: false,
    };
  }
  recordFailedAttempt(rateLimitKey, RATE_LIMIT_WINDOW_MS);

  if (typeof message !== "string" || message.trim().length === 0) {
    return { text: "Please type a question and I'll do my best to help.", links: [], resolved: false };
  }

  const safeMessage = message.slice(0, MAX_INPUT_LENGTH);
  const session = await getCustomerSession();

  return askChatbot(safeMessage, {
    customerId: session?.sub ?? null,
    orderNumber: context?.orderNumber?.slice(0, 60),
    email: context?.email?.slice(0, 200),
    lastProductSlug: context?.lastProductSlug,
  });
}
