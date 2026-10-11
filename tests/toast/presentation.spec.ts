import { test, expect } from "@playwright/test";
import type {} from "./fixture";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Notifications alt+T" })).toHaveCount(1);
});

test("all variants share SF Pro, geometry, semantic icons and colors", async ({ page }) => {
  const variants = [
    ["success", "rgb(22, 163, 74)", "lucide-circle-check"],
    ["error", "rgb(220, 38, 38)", "lucide-circle-alert"],
    ["warning", "rgb(217, 119, 6)", "lucide-triangle-alert"],
    ["info", "rgb(37, 99, 235)", "lucide-info"],
    ["loading", "rgb(37, 99, 235)", "lucide-loader"],
    ["default", "rgb(82, 82, 91)", "lucide-bell"],
  ] as const;
  for (const [type, color, iconClass] of variants) {
    await page.evaluate((type) => {
      const { toast } = window.toastTest;
      (type === "default" ? toast : toast[type])("Saved changes", { id: type, duration: Infinity });
    }, type);
    const card = page.locator("[data-sonner-toast]").last();
    await expect(card.locator("[data-title]")).toHaveText("Saved changes");
    await expect(card).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(card).toHaveCSS("width", "440px");
    await expect(card).toHaveCSS("border-radius", "14px");
    await expect(card.locator("[data-title]")).toHaveCSS("font-size", "15px");
    await expect(card.locator("[data-icon]")).toHaveCSS("color", color);
    await expect(card.locator("[data-icon]")).toHaveCSS("width", "40px");
    await expect(card.locator("[data-icon]")).toHaveCSS("height", "40px");
    await expect(card.locator("[data-icon]")).toHaveCSS("border-radius", "6px");
    await expect(card.locator("[data-icon] svg")).toHaveAttribute("class", new RegExp(iconClass));
    await expect(card.locator("[data-icon] svg")).toHaveCSS("width", "20px");
    expect(await card.evaluate((el) => getComputedStyle(el).fontFamily)).toContain("SF Pro");
    if (type === "loading") await expect(card.locator("[data-close-button]")).toHaveCount(0);
    await page.evaluate(() => window.toastTest.toast.dismiss());
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
  }
  expect(await page.evaluate(async () => {
    await document.fonts.load('600 14px "SF Pro"');
    return Array.from(document.fonts).some((font) => font.family === "SF Pro" && font.status === "loaded");
  })).toBe(true);
});

const viewports = [
  [375, 812], [390, 844], [414, 896], [480, 900], [640, 960], [768, 1024],
  [834, 1194], [1024, 768], [1280, 800], [1440, 900], [1680, 1050], [1920, 1080],
];
for (const [width, height] of viewports) {
  test(`wrapping, safe controls, and no overflow at ${width}x${height}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => window.toastTest.toast.error(
      ["Please complete your project details before submitting.", "A project title and description are required."],
      { duration: Infinity, description: "https://workvence.test/" + "long-path".repeat(18), navigation: { label: "Open notification", onClick: () => { window.toastTest.actionCount++; } } },
    ));
    const card = page.locator("[data-sonner-toast]");
    await expect(card).toHaveAttribute("data-mounted", "true");
    await expect(card.locator("[data-action]")).toHaveCount(0);
    await expect(card.getByText("View", { exact: true })).toHaveCount(1);
    await expect(card.locator(".workvence-toast-title")).toHaveCSS("white-space", "nowrap");
    await expect(card.locator(".workvence-toast-title")).toHaveCSS("text-overflow", "ellipsis");
    await expect(card.locator(".workvence-toast-title")).toHaveText(/A project title and description are required/);
    const bounds = await card.evaluate((el) => {
      const rect = (selector: string) => el.querySelector(selector)!.getBoundingClientRect().toJSON();
      return { card: el.getBoundingClientRect().toJSON(), content: rect(".workvence-toast-copy"), action: rect(".workvence-toast-action-btn"), close: rect("[data-close-button]"), scroll: document.documentElement.scrollWidth, viewport: innerWidth };
    });
    expect(bounds.scroll).toBeLessThanOrEqual(bounds.viewport);
    expect(bounds.card.left).toBeGreaterThanOrEqual(15);
    expect(bounds.card.right).toBeLessThanOrEqual(width - 15);
    expect(bounds.content.right).toBeLessThanOrEqual(bounds.action.left + 1);
    expect(bounds.action.right).toBeLessThanOrEqual(bounds.close.left + 1);
    expect(bounds.action.height).toBeCloseTo(36, 1);
    expect(bounds.close.width).toBeCloseTo(36, 1);
    await page.screenshot({ path: testInfo.outputPath(`toast-${width}.png`) });
    await card.getByRole("button", { name: "Open notification", exact: true }).click();
    expect(await page.evaluate(() => window.toastTest.actionCount)).toBe(1);
    await expect(card).toHaveCount(0);
  });
}

test("content wraps without internal scrollbars while actions and close remain accessible", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => window.toastTest.toast.error("Validation failed", {
    duration: Infinity, description: Array.from({ length: 10 }, (_, i) => `Required field ${i}`),
    navigation: { label: "Open notification", onClick: () => {} },
  }));
  const content = page.locator(".workvence-toast-copy");
  await expect(content).toHaveCSS("overflow-y", "hidden");
  await expect(page.getByRole("button", { name: "Open notification", exact: true })).toBeInViewport();
  await expect(page.getByRole("button", { name: "Dismiss notification" })).toBeInViewport();
  await page.getByRole("button", { name: "Dismiss notification" }).click();
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
});

test("IDs replace loading toasts and callbacks, React content, and normalization survive", async ({ page }) => {
  await page.evaluate(() => {
    const { toast } = window.toastTest;
    const id = toast.loading("Uploading...", { id: "upload" });
    toast.success("Uploaded", { id, duration: Infinity });
  });
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
  await expect(page.locator("[data-sonner-toast]")).toHaveAttribute("data-type", "success");
  await page.evaluate(() => {
    window.toastTest.toast.loading("Retrying...", { id: "upload" });
    window.toastTest.toast.error("Upload failed", { id: "upload" });
  });
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
  await expect(page.locator("[data-sonner-toast]")).toHaveAttribute("data-type", "error");
  await page.evaluate(() => window.toastTest.toast.error({ raw: "not renderable" }, {
    id: "upload", duration: Infinity, onDismiss: () => { window.toastTest.dismissCount++; },
  }));
  await expect(page.locator("[data-title]")).toHaveText("Unable to display notification details.");
  await page.getByRole("button", { name: "Dismiss notification" }).click();
  expect(await page.evaluate(() => window.toastTest.dismissCount)).toBe(1);
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
  await page.evaluate(() => window.toastTest.reactContent());
  await expect(page.locator("[data-title] strong")).toHaveText("React content preserved");
});

test("stack limit, accessible region, keyboard action and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => {
    for (let i = 0; i < 4; i++) window.toastTest.toast.info(`Notification ${i}`, { duration: Infinity });
  });
  await expect(page.locator('[data-sonner-toast][data-visible="true"]')).toHaveCount(3);
  await expect(page.locator('[aria-live="polite"]')).toHaveCount(1);
  await page.evaluate(() => window.toastTest.toast.dismiss());
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
  await page.evaluate(() => window.toastTest.toast.loading("Loading", { id: "keyboard" }));
  await expect(page.locator(".workvence-toast-spinner")).toHaveCSS("animation-name", "none");
  await page.evaluate(() => window.toastTest.toast.info("Open notification", {
    id: "keyboard", duration: Infinity,
    navigation: { label: "Open notification", onClick: () => { window.toastTest.actionCount++; } },
  }));
  const action = page.getByRole("button", { name: "Open notification", exact: true });
  await action.focus();
  await expect(action).toBeFocused();
  await expect(action).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => window.toastTest.actionCount)).toBe(1);
});

test("short chat is compact, aligned, and has independent body and close targets", async ({ page }, testInfo) => {
  await page.evaluate(() => window.toastTest.toast.info("naim", {
    kind: "chat", description: "hi", duration: Infinity,
    navigation: { label: "Open conversation with naim", onClick: () => { window.toastTest.actionCount++; } },
    onDismiss: () => { window.toastTest.dismissCount++; },
  }));
  const card = page.locator("[data-sonner-toast]");
  const actionBtn = page.getByRole("button", { name: "Open conversation with naim" });
  const close = page.getByRole("button", { name: "Dismiss notification" });
  await expect(card.locator("[data-icon] svg")).toHaveAttribute("class", /lucide-message-square/);
  await expect(card.locator(".workvence-toast-icon-badge")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(card.locator(".workvence-toast-icon-badge")).toHaveCSS("border-radius", "6px");
  await expect(card.locator(".workvence-toast-action-btn")).toHaveText("View");
  await expect(card.locator(".workvence-toast-action-btn")).toHaveCSS("border-radius", "8px");
  await expect(card.locator(".workvence-toast-action-btn")).toHaveCSS("height", "36px");
  await expect(card.locator("button button")).toHaveCount(0);
  await expect(close.locator("svg")).toHaveCSS("width", "16px");
  const box = await card.boundingBox();
  expect(box!.height).toBeLessThanOrEqual(76);
  await actionBtn.hover();
  await expect(actionBtn).toHaveCSS("background-color", "rgb(249, 250, 251)");
  await close.hover();
  await expect(close).toHaveCSS("background-color", "rgb(243, 244, 246)");
  await page.screenshot({ path: testInfo.outputPath("compact-chat.png") });
  await close.click();
  await expect(card).toHaveCount(0);
  expect(await page.evaluate(() => window.toastTest.actionCount)).toBe(0);
  expect(await page.evaluate(() => window.toastTest.dismissCount)).toBe(1);
});

test("non-navigation chat and status toasts have no clickable body", async ({ page }) => {
  await page.evaluate(() => window.toastTest.toast.info("naim", { kind: "chat", description: "hi", duration: Infinity }));
  await expect(page.locator("[data-icon] svg")).toHaveAttribute("class", /lucide-message-square/);
  await expect(page.locator(".workvence-toast-action-btn")).toHaveCount(0);
  await expect(page.locator("[data-content]")).not.toHaveCSS("cursor", "pointer");
  await page.locator("[data-title]").click();
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
  await page.evaluate(() => window.toastTest.toast.success("Saved", { duration: Infinity }));
  await expect(page.locator(".workvence-toast-action-btn")).toHaveCount(0);
});

test("body keyboard activation runs once for Enter and Space", async ({ page }) => {
  for (const key of ["Enter", "Space"]) {
    await page.evaluate(() => window.toastTest.toast.info("New message", {
      kind: "chat", duration: Infinity,
      navigation: { label: "Open conversation", onClick: () => { window.toastTest.actionCount++; } },
    }));
    const body = page.getByRole("button", { name: "Open conversation", exact: true });
    await body.focus();
    await expect(body).toBeFocused();
    await page.keyboard.press(key);
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
  }
  expect(await page.evaluate(() => window.toastTest.actionCount)).toBe(2);
});

test("dragging the preview does not navigate while click activates", async ({ page }) => {
  await page.evaluate(() => window.toastTest.toast.info("New message", {
    kind: "chat", duration: Infinity, description: "Short preview text",
    navigation: { label: "Open conversation", onClick: () => { window.toastTest.actionCount++; } },
  }));
  const action = page.getByRole("button", { name: "Open conversation", exact: true });
  const card = page.locator("[data-sonner-toast]");
  const box = await card.boundingBox();
  await page.mouse.move(box!.x + 50, box!.y + 30);
  await page.mouse.down();
  await page.mouse.move(box!.x + 50, box!.y + 75, { steps: 8 });
  await page.mouse.up();
  expect(await page.evaluate(() => window.toastTest.actionCount)).toBe(0);
  await expect(card).toBeVisible();
  await action.click();
  expect(await page.evaluate(() => window.toastTest.actionCount)).toBe(1);
  await expect(card).toHaveCount(0);
});

test("duration overrides and hover pause are preserved", async ({ page }) => {
  await page.evaluate(() => window.toastTest.toast.success("Saved", { duration: 1000 }));
  const card = page.locator("[data-sonner-toast]");
  await card.hover();
  await page.waitForTimeout(1200);
  await expect(card).toHaveCount(1);
  await page.mouse.move(0, 0);
  await expect(card).toHaveCount(0, { timeout: 3000 });
});

test("updating an ID retains existing navigation and descriptions; keyboard toast focus pauses dismissal", async ({ page }) => {
  await page.evaluate(() => {
    const { toast } = window.toastTest;
    toast("Working", {
      id: "retained", duration: 1000, description: "Keep these details",
      navigation: { label: "Open notification", onClick: () => { window.toastTest.actionCount++; } },
    });
    toast.success("Done", { id: "retained" });
  });
  await expect(page.locator("[data-description]")).toHaveText("Keep these details");
  await expect(page.locator("[data-icon] svg")).toHaveAttribute("class", /lucide-circle-check/);
  const action = page.getByRole("button", { name: "Open notification", exact: true });
  // Sonner's built-in keyboard shortcut expands the stack and pauses its timers.
  await page.keyboard.press("Alt+t");
  await action.focus();
  await page.waitForTimeout(1200);
  await expect(action).toBeVisible();
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => window.toastTest.actionCount)).toBe(1);
});
