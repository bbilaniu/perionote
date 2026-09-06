import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    // Next.js 16 adds these diagnostics to the recommended preset. Keep them
    // visible while existing hydration and draft-lifecycle code is reviewed;
    // the framework upgrade preserves the previous lint gate.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
    },
  },
  {
    ignores: [
      ".next/**",
      ".next-*/**",
      "node_modules/**",
      "out/**",
      "coverage/**",
      "test-results/**",
      "playwright-report/**",
      "next-env.d.ts",
    ]
  }
];

export default config;
