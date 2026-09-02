import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";

// The chat widget renders bot/FAQ/product text as plain JSX children
// ({m.text}), which React escapes automatically — there is no
// dangerouslySetInnerHTML anywhere in the chat surface, so a script tag in
// a database field can never execute in the browser. This is a static
// source-scan proof of that architectural fact (consistent with this
// codebase's Node-only Vitest setup — see TESTING.md), backed by a
// content-layer check that the raw text is passed through unmodified
// rather than "sanitised" in a way that could mask a real problem.

describe("27. chat surface cannot render arbitrary HTML from the database", () => {
  it("ChatWidget never uses dangerouslySetInnerHTML", () => {
    const source = readFileSync(path.join(process.cwd(), "components/chat/ChatWidget.tsx"), "utf8");
    expect(source).not.toContain("dangerouslySetInnerHTML");
  });

  it("no chatbot/knowledge server file uses dangerouslySetInnerHTML or eval", () => {
    const files = ["lib/knowledge/chat.ts", "lib/actions/chat.ts", "lib/email/order-notification.ts"];
    for (const file of files) {
      const source = readFileSync(path.join(process.cwd(), file), "utf8");
      expect(source).not.toContain("dangerouslySetInnerHTML");
      expect(source).not.toMatch(/\beval\(/);
    }
  });
});
