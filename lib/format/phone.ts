/** Normalize Indian phone numbers to Twilio whatsapp: format */
export function normalizeWhatsAppPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (cleaned.startsWith("whatsapp:")) return cleaned;
  if (cleaned.startsWith("+")) return `whatsapp:${cleaned}`;
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `whatsapp:+${cleaned}`;
  }
  if (cleaned.length === 10) return `whatsapp:+91${cleaned}`;
  return `whatsapp:${cleaned}`;
}

export function displayPhone(phone: string): string {
  return phone.replace("whatsapp:", "");
}
