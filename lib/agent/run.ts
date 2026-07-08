import {
  findStalePOs,
  shouldEscalate,
  shouldSendNudge,
} from "@/lib/agent/stale-pos";
import { sendNudge } from "@/lib/agent/nudge-sender";
import { escalatePOWithAlert } from "@/lib/agent/escalation-with-alert";
import { logger } from "@/lib/logger";
import type { AgentRunResult } from "@/lib/pipeline/types";
import type { Vendor } from "@/lib/types";

export async function runAgentLoop(): Promise<AgentRunResult> {
  const stalePOs = await findStalePOs();
  const actions: AgentRunResult["actions"] = [];

  logger.info("Agent loop started", {
    pipeline: "agent",
    event: "agent_run_start",
  });

  for (const stale of stalePOs) {
    const vendor = stale.po.vendors as Vendor | undefined;
    if (!vendor?.phone) continue;

    if (shouldEscalate(stale)) {
      const action = await escalatePOWithAlert(stale);
      actions.push(action);
      continue;
    }

    if (shouldSendNudge(stale)) {
      const nudgeNumber = stale.nudgeCount + 1;
      const action = await sendNudge(stale.po, vendor, nudgeNumber);
      actions.push(action);
    }
  }

  logger.info("Agent loop complete", {
    pipeline: "agent",
    event: "agent_run_complete",
  });

  return { checked: stalePOs.length, actions };
}
