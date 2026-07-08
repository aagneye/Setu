import { isFullyConfigured, getConfigSafe } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase";

export interface HealthStatus {
  status: "ok" | "degraded" | "error";
  version: string;
  timestamp: string;
  checks: Record<string, { status: string; message?: string }>;
}

export async function runHealthCheck(): Promise<HealthStatus> {
  const checks: HealthStatus["checks"] = {};

  checks.env = {
    status: isFullyConfigured() ? "ok" : "degraded",
    message: isFullyConfigured()
      ? "All required env vars present"
      : "Some env vars missing",
  };

  try {
    const { error } = await getSupabaseAdmin()
      .from("purchase_orders")
      .select("id")
      .limit(1);
    checks.database = {
      status: error ? "error" : "ok",
      message: error ? error.message : "Connected",
    };
  } catch (err) {
    checks.database = { status: "error", message: String(err) };
  }

  const config = getConfigSafe();
  checks.twilio = {
    status: config.twilioAccountSid ? "ok" : "degraded",
    message: config.twilioAccountSid ? "Configured" : "Not configured",
  };
  checks.anthropic = {
    status: config.anthropicApiKey ? "ok" : "degraded",
    message: config.anthropicApiKey ? "Configured" : "Not configured",
  };

  const allOk = Object.values(checks).every((c) => c.status === "ok");
  const anyError = Object.values(checks).some((c) => c.status === "error");

  return {
    status: anyError ? "error" : allOk ? "ok" : "degraded",
    version: "1.0.0-mvp",
    timestamp: new Date().toISOString(),
    checks,
  };
}

export async function runReadinessCheck(): Promise<{
  ready: boolean;
  reason?: string;
}> {
  if (!isFullyConfigured()) {
    return { ready: false, reason: "Environment not fully configured" };
  }

  try {
    const { error } = await getSupabaseAdmin()
      .from("purchase_orders")
      .select("id")
      .limit(1);
    if (error) return { ready: false, reason: error.message };
    return { ready: true };
  } catch (err) {
    return { ready: false, reason: String(err) };
  }
}
