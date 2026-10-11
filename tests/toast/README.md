# Workvence toast checks

Run `pnpm exec playwright test --config tests/toast/playwright.config.ts` from the repository root.

The suite bundles the real shared toast renderer and interface with Next's installed webpack and TypeScript. It serves only a local fixture and existing SF Pro font files at `127.0.0.1:3217`; it does not use marketplace APIs, accounts, or a production route. Build output is temporary. Screenshots are saved under `test-results/toast/` (ignored by Git).

Coverage includes notification classification, message normalization, all six variants, loading replacement, actions/dismissal, timing, accessibility attributes, font loading, and the 12 Workvence viewport sizes.

Application code must import `toast` from `@/utils/toast`. Use `toast.success(message)`, `toast.error(message)`, `toast.warning(message)`, `toast.info(message)`, `toast.loading(message)`, or `toast(message)` for neutral feedback. Pass `description`, `id`, and `duration` as needed. Navigation uses `navigation: { label: "Open conversation", onClick: () => router.push(destination) }`; the label is accessible text, not a visible View button. Add `kind: "chat"` for the message icon, including chat notifications without a destination. Keep visual styling in the shared renderer; direct Sonner imports are lint-restricted.
