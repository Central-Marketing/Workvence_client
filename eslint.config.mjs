import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    ignores: ["src/utils/toast.ts", "src/components/ui/WorkvenceToaster/WorkvenceToaster.tsx"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{ name: "sonner", message: "Use @/utils/toast so every notification follows the Workvence design system." }],
        patterns: ["sonner/*"],
      }],
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "replace-green.js",
    "test*.js",
    "tests/**",
  ]),
]);

export default eslintConfig;
