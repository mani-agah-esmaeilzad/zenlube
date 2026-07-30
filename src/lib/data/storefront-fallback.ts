import { createPageInfo } from "../pagination";

type NoInfer<T> = [T][T extends unknown ? 0 : never];

const STOREFRONT_DATA_RETRY_AFTER_MS = 30_000;

let storefrontDataUnavailableUntil = 0;
let lastStorefrontDataNoticeAt = 0;

function isStorefrontDataUnavailableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "PrismaClientInitializationError" ||
    error.message.includes("Can't reach database server") ||
    error.message.includes("Connection refused") ||
    error.message.includes("Timed out fetching a new connection")
  );
}

function logStorefrontDataNotice(message: string) {
  const now = Date.now();

  if (now - lastStorefrontDataNoticeAt < 5_000) {
    return;
  }

  lastStorefrontDataNoticeAt = now;
  console.warn(message);
}

export async function withStorefrontDataFallback<T>(label: string, fallback: NoInfer<T>, run: () => Promise<T>) {
  const retryInMs = storefrontDataUnavailableUntil - Date.now();

  if (retryInMs > 0) {
    logStorefrontDataNotice(
      `[storefront-data:${label}] using cached fallback while the database remains unavailable; retrying in ${Math.ceil(retryInMs / 1000)}s.`,
    );
    return fallback;
  }

  try {
    return await run();
  } catch (error) {
    if (!isStorefrontDataUnavailableError(error)) {
      throw error;
    }

    storefrontDataUnavailableUntil = Date.now() + STOREFRONT_DATA_RETRY_AFTER_MS;

    logStorefrontDataNotice(
      `[storefront-data:${label}] falling back because the database is unavailable; pausing new attempts for ${STOREFRONT_DATA_RETRY_AFTER_MS / 1000}s.`,
    );
    return fallback;
  }
}

export function createEmptyPageResult<T>(page: number, pageSize: number) {
  return {
    items: [] as T[],
    pageInfo: createPageInfo(page, pageSize, 0),
  };
}
