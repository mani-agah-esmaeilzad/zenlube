const COOKIE_NAME = "oilbar_torob_attribution";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const CLICK_ID_PATTERN = /^[A-Za-z0-9_-]{8,200}$/;

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(value: string) {
  if (!/^[a-f0-9]{64}$/.test(value)) return null;
  return Uint8Array.from(value.match(/.{2}/g) ?? [], (part) => Number.parseInt(part, 16));
}

async function signature(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))));
}

export function isValidTorobClickId(value: string | null | undefined): value is string {
  return Boolean(value && CLICK_ID_PATTERN.test(value));
}

export async function createTorobAttributionCookie(clickId: string, secret: string, now = Date.now()) {
  if (!isValidTorobClickId(clickId) || !secret) return null;
  const issuedAt = Math.floor(now / 1000);
  const payload = `v1.${clickId}.${issuedAt}`;
  return `${payload}.${await signature(`oilbar:torob-attribution:${payload}`, secret)}`;
}

export async function readTorobAttributionCookie(value: string | undefined, secret: string, now = Date.now()) {
  if (!value || !secret) return null;
  const [version, clickId, issuedAtRaw, signatureHex, ...extra] = value.split(".");
  if (extra.length || version !== "v1" || !isValidTorobClickId(clickId)) return null;
  const issuedAt = Number(issuedAtRaw);
  const nowSeconds = Math.floor(now / 1000);
  if (!Number.isSafeInteger(issuedAt) || issuedAt > nowSeconds + 60 || nowSeconds - issuedAt > MAX_AGE_SECONDS) return null;
  const suppliedSignature = fromHex(signatureHex ?? "");
  if (!suppliedSignature) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const payload = `v1.${clickId}.${issuedAt}`;
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    suppliedSignature,
    new TextEncoder().encode(`oilbar:torob-attribution:${payload}`),
  );
  return valid ? { clickId, issuedAt } : null;
}

export const TOROB_ATTRIBUTION_COOKIE = COOKIE_NAME;
export const TOROB_ATTRIBUTION_MAX_AGE_SECONDS = MAX_AGE_SECONDS;
