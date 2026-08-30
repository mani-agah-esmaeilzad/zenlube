import { getIranPhoneLookupVariants, normalizeIranPhone, normalizeOtpCode } from "@/lib/phone";

export type OtpAccountUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

type OtpCredentials = {
  phone?: string | null;
  otpCode?: string | null;
};

type OtpAccountDependencies = {
  authenticateOtp: (input: {
    normalizedPhone: string;
    normalizedCode: string;
    phoneCandidates: string[];
  }) => Promise<OtpAccountUser | null>;
};

export async function authorizeOtpAccount(
  credentials: OtpCredentials,
  dependencies: OtpAccountDependencies,
) {
  if (!credentials.phone || !credentials.otpCode) {
    return null;
  }

  const normalizedPhone = normalizeIranPhone(credentials.phone);
  const normalizedCode = normalizeOtpCode(credentials.otpCode);

  if (!/^\+989\d{9}$/.test(normalizedPhone) || !/^\d{6}$/.test(normalizedCode)) {
    return null;
  }

  return dependencies.authenticateOtp({
    normalizedPhone,
    normalizedCode,
    phoneCandidates: getIranPhoneLookupVariants(normalizedPhone),
  });
}
