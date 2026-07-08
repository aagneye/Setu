/**
 * Seed script — run with: npm run seed
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in env.
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VENDORS = [
  {
    name: "Ramesh Rebar Supplies",
    phone: "whatsapp:+919876543210",
    trade: "Rebar",
    preferred_language: "hi",
  },
  {
    name: "Suresh Electricals",
    phone: "whatsapp:+919876543211",
    trade: "Electrical",
    preferred_language: "hi",
  },
  {
    name: "Patel MEP Solutions",
    phone: "whatsapp:+919876543212",
    trade: "MEP",
    preferred_language: "hi",
  },
  {
    name: "Gupta Cement Depot",
    phone: "whatsapp:+919876543213",
    trade: "Cement",
    preferred_language: "hi",
  },
];

async function seed() {
  console.log("🌱 Seeding Setu demo data...\n");

  // Clear existing data (order matters for FK constraints)
  await supabase.from("nudges").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("grns").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("po_updates").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("purchase_orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("vendors").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const { data: vendors, error: vendorError } = await supabase
    .from("vendors")
    .insert(VENDORS)
    .select();

  if (vendorError) throw vendorError;
  console.log(`✓ ${vendors!.length} vendors created`);

  const today = new Date();
  const addDays = (d: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    return date.toISOString().split("T")[0];
  };

  const pos = [
    {
      po_number: "PO-1042",
      vendor_id: vendors![0].id,
      item_description: "TMT Rebar 12mm (Fe500D)",
      quantity: 500,
      unit: "kg",
      due_date: addDays(1),
      status: "confirmed",
      is_critical_path: true,
      current_eta: addDays(1),
      project_site: "Site A — Tower B Level 5",
    },
    {
      po_number: "PO-1043",
      vendor_id: vendors![1].id,
      item_description: "Copper cable 4 sqmm (100m rolls)",
      quantity: 20,
      unit: "rolls",
      due_date: addDays(3),
      status: "ordered",
      is_critical_path: false,
      project_site: "Site A — Electrical Block C",
    },
    {
      po_number: "PO-1044",
      vendor_id: vendors![2].id,
      item_description: "PVC pipes 110mm dia",
      quantity: 150,
      unit: "units",
      due_date: addDays(-2),
      status: "delayed",
      is_critical_path: true,
      current_eta: addDays(2),
      project_site: "Site A — MEP Level 3",
    },
    {
      po_number: "PO-1045",
      vendor_id: vendors![3].id,
      item_description: "OPC 53 Grade Cement",
      quantity: 200,
      unit: "bags",
      due_date: addDays(5),
      status: "confirmed",
      is_critical_path: false,
      project_site: "Site A — General",
    },
    {
      po_number: "PO-1046",
      vendor_id: vendors![0].id,
      item_description: "TMT Rebar 16mm (Fe500D)",
      quantity: 800,
      unit: "kg",
      due_date: addDays(-1),
      status: "in_transit",
      is_critical_path: true,
      current_eta: addDays(0),
      project_site: "Site A — Tower B Level 6",
    },
    {
      po_number: "PO-1047",
      vendor_id: vendors![1].id,
      item_description: "MCB panels 32A",
      quantity: 50,
      unit: "units",
      due_date: addDays(-5),
      status: "ordered",
      is_critical_path: false,
      project_site: "Site A — Electrical",
    },
    {
      po_number: "PO-1048",
      vendor_id: vendors![3].id,
      item_description: "Ready-mix concrete M25",
      quantity: 30,
      unit: "cum",
      due_date: addDays(-3),
      status: "delivered",
      is_critical_path: true,
      project_site: "Site A — Level 5 slab pour",
    },
    {
      po_number: "PO-1049",
      vendor_id: vendors![2].id,
      item_description: "GI fittings 25mm",
      quantity: 300,
      unit: "units",
      due_date: addDays(7),
      status: "ordered",
      is_critical_path: false,
      project_site: "Site A — Plumbing",
    },
  ];

  const { data: insertedPOs, error: poError } = await supabase
    .from("purchase_orders")
    .insert(pos)
    .select();

  if (poError) throw poError;
  console.log(`✓ ${insertedPOs!.length} purchase orders created`);

  // Seed a sample update for PO-1044 (delayed)
  const delayedPO = insertedPOs!.find((p) => p.po_number === "PO-1044");
  if (delayedPO) {
    await supabase.from("po_updates").insert({
      po_id: delayedPO.id,
      source: "vendor_whatsapp",
      raw_message:
        "Bhai PVC pipes do din late hoga, transport mein dikkat hai",
      original_language: "hi",
      extracted_json: {
        po_number: "PO-1044",
        new_status: "delayed",
        new_eta: addDays(2),
        delay_reason: "Transport issue",
        confidence: "high",
        suggested_reply_to_vendor:
          "Samajh gaya — PO-1044 ETA July 10 update kar diya. Site team ko bata dunga.",
      },
      new_status: "delayed",
      new_eta: addDays(2),
      delay_reason: "Transport issue",
    });
    console.log("✓ Sample vendor update seeded for PO-1044");
  }

  console.log("\n✅ Seed complete! Open /dashboard to view.");
  console.log(
    "\n⚠️  Update vendor phone numbers in Supabase to match your Twilio sandbox numbers."
  );
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
