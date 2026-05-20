import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Jest config files must use CommonJS require() — disable the rule for them.
  {
    files: ["jest.config.js", "jest.setup.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Migrated persona code — relax strict rules that were never enforced in the
  // source apps and would require large-scale refactoring to fix.
  {
    files: [
      "src/app/(admin)/**/*.{ts,tsx}",
      "src/app/(donor)/**/*.{ts,tsx}",
      "src/app/(campaign-manager)/**/*.{ts,tsx}",
      "src/app/(beneficiary)/**/*.{ts,tsx}",
      "src/admin-lib/**/*.{ts,tsx}",
      "src/admin-components/**/*.{ts,tsx}",
      "src/donor-lib/**/*.{ts,tsx}",
      "src/donor-components/**/*.{ts,tsx}",
      "src/donor-hooks/**/*.{ts,tsx}",
      "src/donor-contexts/**/*.{ts,tsx}",
      "src/campaign-manager-components/**/*.{ts,tsx}",
      "src/campaign-manager-utils/**/*.{ts,tsx}",
      "src/campaign-manager-types/**/*.{ts,tsx}",
      "src/beneficiary-lib/**/*.{ts,tsx}",
      "src/beneficiary-components/**/*.{ts,tsx}",
      "src/beneficiary-utils/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-html-link-for-pages": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
]);

export default eslintConfig;
