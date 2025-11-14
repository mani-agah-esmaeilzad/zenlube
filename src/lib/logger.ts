import { inspect } from "util";

import { config, isProduction } from "./config";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogMeta = Record<string, unknown> | undefined;

function serialize(meta: LogMeta) {
  if (!meta || Object.keys(meta).length === 0) {
    return "";
  }
  return isProduction() ? JSON.stringify(meta) : inspect(meta, { depth: null, colors: false });
}

function log(level: LogLevel, message: string, meta?: LogMeta) {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  const suffix = serialize(meta);
  if (level === "error") {
    console.error(suffix ? `${base} ${suffix}` : base);
  } else if (level === "warn") {
    console.warn(suffix ? `${base} ${suffix}` : base);
  } else if (level === "debug") {
    if (config.NODE_ENV === "development") {
      console.debug(suffix ? `${base} ${suffix}` : base);
    }
  } else {
    console.info(suffix ? `${base} ${suffix}` : base);
  }
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => log("debug", message, meta),
  info: (message: string, meta?: LogMeta) => log("info", message, meta),
  warn: (message: string, meta?: LogMeta) => log("warn", message, meta),
  error: (message: string, meta?: LogMeta) => log("error", message, meta),
};
