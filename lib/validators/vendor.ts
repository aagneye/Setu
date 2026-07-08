import { normalizeWhatsAppPhone } from "@/lib/format/phone";

export interface CreateVendorInput {
  name: string;
  phone: string;
  trade?: string | null;
  preferred_language?: string;
}

export function validateCreateVendor(body: unknown): CreateVendorInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.name !== "string" || typeof b.phone !== "string") return null;
  if (!b.name.trim() || !b.phone.trim()) return null;

  return {
    name: b.name.trim(),
    phone: normalizeWhatsAppPhone(b.phone.trim()),
    trade: typeof b.trade === "string" ? b.trade : null,
    preferred_language:
      typeof b.preferred_language === "string" ? b.preferred_language : "hi",
  };
}
