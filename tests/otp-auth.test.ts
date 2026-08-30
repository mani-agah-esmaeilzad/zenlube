import test from "node:test";
import assert from "node:assert/strict";

import { buildPhoneAccountEmail, isPhoneAccountEmail } from "@/lib/account-email";
import { authorizeOtpAccount } from "@/lib/otp-auth";

const accountUser = {
  id: "user_1",
  email: "customer@example.com",
  name: "کاربر تست",
  role: "CUSTOMER",
};

test("authorizeOtpAccount supports legacy phone storage and Persian OTP digits", async () => {
  let receivedPhones: string[] = [];
  let receivedVerification: [string, string] | null = null;

  const result = await authorizeOtpAccount(
    { phone: "09123456789", otpCode: "۱۲۳۴۵۶" },
    {
      async authenticateOtp({ normalizedPhone, normalizedCode, phoneCandidates }) {
        receivedPhones = phoneCandidates;
        receivedVerification = [normalizedPhone, normalizedCode];
        return accountUser;
      },
    },
  );

  assert.deepEqual(result, accountUser);
  assert.deepEqual(receivedPhones, [
    "+989123456789",
    "09123456789",
    "989123456789",
    "9123456789",
  ]);
  assert.deepEqual(receivedVerification, ["+989123456789", "123456"]);
});

test("authorizeOtpAccount returns the account provisioned by the atomic OTP handler", async () => {
  const createdUser = { ...accountUser, id: "user_new" };

  const result = await authorizeOtpAccount(
    { phone: "09123456789", otpCode: "123456" },
    {
      async authenticateOtp() {
        return createdUser;
      },
    },
  );

  assert.deepEqual(result, createdUser);
});

test("authorizeOtpAccount rejects malformed codes before querying the account", async () => {
  let lookupCalled = false;

  const result = await authorizeOtpAccount(
    { phone: "09123456789", otpCode: "12ab56" },
    {
      async authenticateOtp() {
        lookupCalled = true;
        return accountUser;
      },
    },
  );

  assert.equal(result, null);
  assert.equal(lookupCalled, false);
});

test("authorizeOtpAccount returns null when the atomic OTP handler rejects credentials", async () => {
  const result = await authorizeOtpAccount(
    { phone: "09123456789", otpCode: "123456" },
    {
      async authenticateOtp() {
        return null;
      },
    },
  );

  assert.equal(result, null);
});

test("authorizeOtpAccount preserves infrastructure failures so the OTP can be retried", async () => {
  await assert.rejects(
    authorizeOtpAccount(
      { phone: "09123456789", otpCode: "123456" },
      {
        async authenticateOtp() {
          throw new Error("database unavailable");
        },
      },
    ),
    /database unavailable/,
  );
});

test("phone-created account emails are deterministic and detectable", () => {
  const email = buildPhoneAccountEmail("+989123456789");

  assert.equal(email, "phone-989123456789@phone.accounts.oilbar.local");
  assert.equal(isPhoneAccountEmail(email), true);
  assert.equal(isPhoneAccountEmail("customer@example.com"), false);
});
