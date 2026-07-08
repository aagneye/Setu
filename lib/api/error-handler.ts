import { isPipelineError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { serverError } from "@/lib/api/response";

export function handleApiError(err: unknown, context?: string) {
  const message = isPipelineError(err)
    ? err.message
    : err instanceof Error
      ? err.message
      : String(err);

  logger.error("API error", { pipeline: context ?? "api", error: message });

  if (isPipelineError(err) && err.code === "UNAUTHORIZED") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return serverError(message);
}
