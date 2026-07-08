/**
 * Local pipeline test — simulates agent nudge without WhatsApp
 * Usage: npx tsx scripts/test-agent.ts
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
  const { findStalePOs } = await import("../lib/agent/stale-pos");
  const stale = await findStalePOs();

  console.log(`Found ${stale.length} stale PO(s):\n`);
  for (const s of stale) {
    console.log(
      `  ${s.po.po_number} — nudges: ${s.nudgeCount}, responded: ${s.latestNudgeResponded}`
    );
  }

  if (stale.length === 0) {
    console.log("\nNo stale POs. Agent would take no action.");
    return;
  }

  console.log("\nRun full agent with: curl -X POST 'http://localhost:3000/api/agent/nudge?secret=YOUR_SECRET'");
}

main().catch(console.error);
