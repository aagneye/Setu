import { STALE_HOURS, NUDGE_WINDOW_DAYS, MAX_NUDGES } from "@/lib/constants";

export const agentConfig = {
  staleHours: STALE_HOURS,
  nudgeWindowDays: NUDGE_WINDOW_DAYS,
  maxNudges: MAX_NUDGES,
  digestHourUtc: 4, // 9:30 AM IST
} as const;

export function isDigestTime(): boolean {
  const hour = new Date().getUTCHours();
  return hour === agentConfig.digestHourUtc;
}
