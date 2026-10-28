import { defineConfig } from "vitest/config";
export default defineConfig({ resolve: { tsconfigPaths: true }, test: { environment: "node", include: ["tests/unit/launch-security.test.ts", "tests/unit/checkout-quote.test.ts", "tests/unit/community*.test.ts", "tests/unit/chat-knowledge.test.ts", "tests/unit/admin-cleanup.test.ts", "tests/unit/staff*.test.ts", "tests/unit/traffic*.test.ts"] } });
