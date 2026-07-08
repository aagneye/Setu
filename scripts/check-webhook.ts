/**
 * Check webhook verify endpoint — usage: npx tsx scripts/check-webhook.ts [baseUrl]
 */
const base = process.argv[2] ?? "http://localhost:3000";

async function main() {
  const res = await fetch(`${base}/api/webhook/whatsapp/verify`);
  const data = await res.json();
  console.log(`Status: ${res.status}`);
  console.log(JSON.stringify(data, null, 2));
  process.exit(res.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
