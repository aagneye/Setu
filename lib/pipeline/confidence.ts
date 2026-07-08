import type { ExtractionResult } from "@/lib/types";

export type ConfidenceLevel = "high" | "medium" | "low";

export function shouldAutoApply(extraction: ExtractionResult): boolean {
  return extraction.confidence === "high" && extraction.po_number !== null;
}

export function needsReview(extraction: ExtractionResult): boolean {
  return (
    extraction.confidence === "low" ||
    extraction.new_status === "unclear" ||
    !extraction.po_number
  );
}

export function confidenceLabel(level: ConfidenceLevel): string {
  const labels: Record<ConfidenceLevel, string> = {
    high: "High confidence",
    medium: "Medium — review recommended",
    low: "Low — manual review required",
  };
  return labels[level];
}
