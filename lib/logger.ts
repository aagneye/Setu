type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  pipeline?: string;
  po_number?: string;
  vendor_phone?: string;
  event?: string;
  [key: string]: unknown;
}

function formatMessage(
  level: LogLevel,
  message: string,
  ctx?: LogContext
): string {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...ctx,
  };
  return JSON.stringify(entry);
}

export const logger = {
  info(message: string, ctx?: LogContext) {
    console.log(formatMessage("info", message, ctx));
  },
  warn(message: string, ctx?: LogContext) {
    console.warn(formatMessage("warn", message, ctx));
  },
  error(message: string, ctx?: LogContext) {
    console.error(formatMessage("error", message, ctx));
  },
  debug(message: string, ctx?: LogContext) {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatMessage("debug", message, ctx));
    }
  },
};
