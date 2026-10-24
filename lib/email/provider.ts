// Thin transactional-email provider abstraction. Talks to Resend's HTTP API
// directly (no SDK dependency needed for a single POST) so swapping to
// Postmark or another provider later only means changing this one file.
//
// Server-only: EMAIL_API_KEY must never be read from client code.

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type EmailSendResult = { providerMessageId: string | null };

export function emailProviderConfigured(): boolean {
  return Boolean(process.env.EMAIL_API_KEY && process.env.EMAIL_FROM_ADDRESS);
}

/**
 * Sends one email via the configured provider. Throws (rather than
 * pretending to succeed) whenever the provider isn't configured or the
 * provider API rejects the request — callers must treat a thrown error as
 * "not delivered", never fabricate a success result.
 */
export async function sendEmail(message: EmailMessage): Promise<EmailSendResult> {
  if (!emailProviderConfigured()) {
    throw new Error("Email provider not configured — set EMAIL_API_KEY and EMAIL_FROM_ADDRESS.");
  }

  const fromName = process.env.EMAIL_FROM_NAME || "Support Your Local Patriot";
  const fromAddress = process.env.EMAIL_FROM_ADDRESS;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${fromName} <${fromAddress}>`,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });

  if (!res.ok) {
    // Never include the API key or raw headers in the thrown message —
    // this text can end up in OrderNotification.errorMessage, which is
    // readable from the admin order page.
    const body = await res.text().catch(() => "");
    throw new Error(`Email provider request failed (status ${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { providerMessageId: data.id ?? null };
}
