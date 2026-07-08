/**
 * Local health check — verify env and DB without starting server
 * Usage: npx tsx scripts/test-health.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvFile(filename: string) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");

async function main() {
  const { runHealthCheck } = await import("../lib/health/checks");
  const health = await runHealthCheck();
  console.log(JSON.stringify(health, null, 2));
  process.exit(health.status === "error" ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
