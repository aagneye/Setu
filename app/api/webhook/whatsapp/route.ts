import { NextResponse } from "next/server";
import { extractPOUpdate, verifyDeliveryPhoto } from "@/lib/claude";
import { transcribeAudio, downloadTwilioMedia } from "@/lib/deepgram";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendWhatsAppMessage, parseTwilioWebhook } from "@/lib/twilio";
import type { POStatus } from "@/lib/types";

const VALID_STATUSES: POStatus[] = [
  "ordered",
  "confirmed",
  "in_transit",
  "delayed",
  "delivered",
];

function mapStatus(status: string): POStatus | null {
  if (VALID_STATUSES.includes(status as POStatus)) return status as POStatus;
  return null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const { from, body, numMedia, mediaUrl, mediaContentType } =
      parseTwilioWebhook(formData);

    const supabase = getSupabaseAdmin();

    const { data: vendor } = await supabase
      .from("vendors")
      .select("*")
      .eq("phone", from)
      .single();

    if (!vendor) {
      await sendWhatsAppMessage(
        from,
        "Namaste! Aap registered vendor nahi hain. Site team se contact karein."
      );
      return new NextResponse("OK", { status: 200 });
    }

    const { data: openPOs } = await supabase
      .from("purchase_orders")
      .select("*")
      .eq("vendor_id", vendor.id)
      .neq("status", "delivered");

    const openPOList = openPOs ?? [];

    // Photo path — delivery verification
    if (numMedia > 0 && mediaUrl) {
      const { buffer } = await downloadTwilioMedia(
        mediaUrl,
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!
      );

      const isImage = mediaContentType?.startsWith("image/");
      const targetPO =
        openPOList.find((po) =>
          body.toLowerCase().includes(po.po_number.toLowerCase())
        ) ?? openPOList[0];

      if (!targetPO) {
        await sendWhatsAppMessage(
          from,
          "Photo mila, lekin koi open PO nahi mila. PO number bataiye."
        );
        return new NextResponse("OK", { status: 200 });
      }

      if (isImage) {
        const base64 = Buffer.from(buffer).toString("base64");
        const mediaType = (mediaContentType?.includes("png")
          ? "image/png"
          : mediaContentType?.includes("webp")
            ? "image/webp"
            : "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";

        const vision = await verifyDeliveryPhoto(base64, mediaType, targetPO);

        await supabase.from("grns").insert({
          po_id: targetPO.id,
          photo_url: mediaUrl,
          verified_quantity: vision.estimated_quantity_visible
            ? parseFloat(vision.estimated_quantity_visible)
            : null,
          verified_item_match: vision.item_match,
          mismatch_notes: vision.mismatch_notes,
          vision_raw_response: vision,
        });

        if (vision.grn_recommendation === "approve") {
          await supabase
            .from("purchase_orders")
            .update({ status: "delivered", updated_at: new Date().toISOString() })
            .eq("id", targetPO.id);
        }

        await supabase.from("po_updates").insert({
          po_id: targetPO.id,
          source: "vendor_whatsapp",
          raw_message: body || "[Photo delivery]",
          media_url: mediaUrl,
          extracted_json: vision,
          new_status:
            vision.grn_recommendation === "approve" ? "delivered" : null,
        });

        const reply =
          vision.grn_recommendation === "approve"
            ? `✅ ${targetPO.po_number} delivery verified. GRN approved. Dhanyavaad!`
            : `📋 ${targetPO.po_number} photo received — flagged for review. Team will check.`;

        await sendWhatsAppMessage(from, reply);
        return new NextResponse("OK", { status: 200 });
      }

      // Voice note
      if (mediaContentType?.startsWith("audio/")) {
        const transcript = await transcribeAudio(buffer, mediaContentType);
        return await handleTextUpdate(
          supabase,
          vendor,
          openPOList,
          transcript,
          from,
          mediaUrl
        );
      }
    }

    // Text message path
    if (body.trim()) {
      return await handleTextUpdate(
        supabase,
        vendor,
        openPOList,
        body,
        from
      );
    }

    await sendWhatsAppMessage(from, "Message samajh nahi aaya. Text ya voice note bhejein.");
    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new NextResponse("Error", { status: 500 });
  }
}

async function handleTextUpdate(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  vendor: { id: string; phone: string },
  openPOs: Array<{
    id: string;
    po_number: string;
    item_description: string;
    quantity: number | null;
    unit: string | null;
    due_date: string;
    status: string;
  }>,
  messageText: string,
  replyTo: string,
  mediaUrl?: string | null
) {
  const extraction = await extractPOUpdate(messageText, openPOs as never);

  const matchedPO = openPOs.find(
    (po) => po.po_number === extraction.po_number
  );

  if (!matchedPO) {
    await sendWhatsAppMessage(
      replyTo,
      extraction.suggested_reply_to_vendor ||
        "Kaunsa PO? PO number bataiye jaise PO-1042."
    );
    return new NextResponse("OK", { status: 200 });
  }

  const newStatus = mapStatus(extraction.new_status);
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (newStatus) updates.status = newStatus;
  if (extraction.new_eta) updates.current_eta = extraction.new_eta;

  await supabase
    .from("purchase_orders")
    .update(updates)
    .eq("id", matchedPO.id);

  await supabase.from("po_updates").insert({
    po_id: matchedPO.id,
    source: "vendor_whatsapp",
    raw_message: messageText,
    extracted_json: extraction,
    new_status: newStatus,
    new_eta: extraction.new_eta,
    delay_reason: extraction.delay_reason,
    media_url: mediaUrl,
  });

  // Mark nudges as responded
  await supabase
    .from("nudges")
    .update({ responded: true })
    .eq("po_id", matchedPO.id)
    .eq("responded", false);

  await sendWhatsAppMessage(
    replyTo,
    extraction.suggested_reply_to_vendor
  );

  return new NextResponse("OK", { status: 200 });
}
