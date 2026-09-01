const TEHRAN_OFFSET = "+03:30";
const LOCAL_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

export function parseTehranLocalDateTime(value: string | null | undefined) {
  const normalized = value?.trim();
  if (!normalized) return null;
  if (!LOCAL_DATE_TIME_PATTERN.test(normalized)) {
    throw new Error("تاریخ و ساعت واردشده معتبر نیست.");
  }

  const withSeconds = normalized.length === 16 ? `${normalized}:00` : normalized;
  const date = new Date(`${withSeconds}${TEHRAN_OFFSET}`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("تاریخ و ساعت واردشده معتبر نیست.");
  }
  return date;
}

export function formatTehranLocalDateTime(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
