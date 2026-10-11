import { test, expect } from "@playwright/test";
import { getNotificationDescription, getNotificationToastType } from "../../src/utils/notificationToast";

test("notification outcomes use meaning rather than keyword substrings", () => {
  const cases = [
    ["Refund successful", "success"], ["Refund failed", "error"],
    ["Refund pending", "warning"], ["Extension approved", "success"],
    ["Extension request accepted", "success"], ["Extension request declined", "error"],
    ["Extension pending", "warning"], ["Revision requested", "warning"],
    ["Warning removed", "success"], ["Your warning has been cleared", "success"],
    ["Account unsuspended", "success"], ["Account reinstated", "success"],
    ["Suspension lifted", "success"], ["Account suspended", "error"],
    ["Account locked", "error"], ["Payment not successful", "error"],
    ["Extension was not approved", "error"], ["New order received", "success"],
    ["Support ticket update", "info"], ["New message", "info"],
    ["Latest template updated", "info"], ["Unrecognized notification", "info"],
  ] as const;
  for (const [title, type] of cases) expect(getNotificationToastType({ title }), title).toBe(type);
});

test("recognized actions/events precede semantic types and legacy text", () => {
  expect(getNotificationToastType({ action: "unsuspend", type: "error", title: "Account suspended" })).toBe("success");
  expect(getNotificationToastType({ action: "unknown", event: "refund_failed", type: "success" })).toBe("error");
  expect(getNotificationToastType({ event: "extension_approved", title: "Extension pending" })).toBe("success");
  expect(getNotificationToastType({ type: "info", title: "Warning removed" })).toBe("info");
  expect(getNotificationToastType({ action: "toString", type: "constructor" })).toBe("info");
  expect(getNotificationToastType(null)).toBe("info");
});

test("description aliases are shared by display and classification", () => {
  expect(getNotificationDescription({ message: "primary", desc: "secondary" })).toBe("primary");
  expect(getNotificationDescription({ message: "", desc: "secondary" })).toBe("secondary");
  expect(getNotificationDescription({ description: "fallback" })).toBe("fallback");
  expect(getNotificationToastType({ desc: "Refund successful" })).toBe("success");
});
