import { defineConfig } from "vitest/config";
export default defineConfig({ resolve: { tsconfigPaths: true }, test: { environment: "node", include: ["tests/unit/launch-security.test.ts"] } });
