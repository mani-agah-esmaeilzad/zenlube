const PHONE_ACCOUNT_EMAIL_SUFFIX = "@phone.accounts.oilbar.local";

export function buildPhoneAccountEmail(normalizedPhone: string) {
  const digits = normalizedPhone.replace(/\D/g, "");
  return `phone-${digits}${PHONE_ACCOUNT_EMAIL_SUFFIX}`;
}

export function isPhoneAccountEmail(email: string | null | undefined) {
  return Boolean(email?.endsWith(PHONE_ACCOUNT_EMAIL_SUFFIX));
}
