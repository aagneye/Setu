import Anthropic from "@anthropic-ai/sdk";
import type { ExtractionResult, PurchaseOrder, VisionResult } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function parseJson<T>(text: string): T {
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as T;
}

export async function extractPOUpdate(
  messageText: string,
  openPOs: PurchaseOrder[]
): Promise<ExtractionResult> {
  const openPosJson = JSON.stringify(
    openPOs.map((po) => ({
      po_number: po.po_number,
      item: po.item_description,
      quantity: po.quantity,
      unit: po.unit,
      due_date: po.due_date,
      status: po.status,
    }))
  );

  const prompt = `You are a construction procurement assistant reading a message from a supplier in India.
The message may be in Hindi, Tamil, Telugu, English, or a mix (Hinglish). Transcripts from
voice notes may have minor errors — infer intent.

Here are the vendor's open purchase orders:
${openPosJson}

Message from vendor (transcript or text):
"${messageText}"

Return ONLY valid JSON, no preamble, no markdown fences:
{
  "po_number": "<best matching PO number from the list above, or null if unclear>",
  "new_status": "<one of: confirmed, in_transit, delayed, delivered, unclear>",
  "new_eta": "<YYYY-MM-DD if a new date is mentioned or inferable, else null>",
  "delay_reason": "<short reason if delayed, else null>",
  "confidence": "<high|medium|low>",
  "suggested_reply_to_vendor": "<a short, warm, 1-sentence WhatsApp reply in the SAME language/style as their message, confirming what you understood>"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");
  return parseJson<ExtractionResult>(block.text);
}

export async function verifyDeliveryPhoto(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp",
  po: Pick<PurchaseOrder, "po_number" | "item_description" | "quantity" | "unit">
): Promise<VisionResult> {
  const prompt = `You are verifying a delivery against a purchase order for a construction site in India.

Expected delivery per PO:
- Item: ${po.item_description}
- Quantity: ${po.quantity} ${po.unit}
- PO number: ${po.po_number}

The attached image is a photo sent by the vendor of the delivered goods / delivery challan.

Look at the image and return ONLY valid JSON:
{
  "item_visible": "<what you can identify in the image>",
  "item_match": <true|false>,
  "estimated_quantity_visible": "<your best estimate if countable/visible, else null>",
  "quantity_match_confidence": "<high|medium|low|cannot_determine>",
  "mismatch_notes": "<anything that looks off, or null>",
  "grn_recommendation": "<approve|flag_for_review>"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");
  return parseJson<VisionResult>(block.text);
}

export async function generateNudgeMessage(
  poNumber: string,
  itemDescription: string,
  dueDate: string,
  daysOverdue: number,
  nudgeNumber: number
): Promise<string> {
  const prompt = `Write a short, friendly WhatsApp message (max 2 sentences) in Hindi/Hinglish (match the vendor's
usual style if known, else default Hinglish) nudging a supplier for a status update on:
PO ${poNumber}, ${itemDescription}, originally due ${dueDate}, currently ${daysOverdue} days
overdue with no update. Tone: warm, not accusatory, like a colleague checking in — this is
nudge #${nudgeNumber} of 2 before we loop in the project manager.
Return only the message text, nothing else.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");
  return block.text.trim();
}
