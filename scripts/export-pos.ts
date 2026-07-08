/**
 * Export all POs as JSON — usage: npx tsx scripts/export-pos.ts > pos.json
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
  const { listAllPOs } = await import("../lib/db/purchase-orders");
  const pos = await listAllPOs();
  console.log(JSON.stringify(pos, null, 2));
}

main().catch(console.error);
