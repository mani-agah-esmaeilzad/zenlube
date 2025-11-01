import test from "node:test";
import assert from "node:assert/strict";

import { ensureNotSelf } from "@/lib/auth";

const SESSION_USER_ID = "user-1";

test("ensureNotSelf throws when acting on current user", () => {
  assert.throws(() => ensureNotSelf(SESSION_USER_ID, SESSION_USER_ID));
});

test("ensureNotSelf allows actions on other users", () => {
  assert.doesNotThrow(() => ensureNotSelf("user-2", SESSION_USER_ID));
});
