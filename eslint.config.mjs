import convexPlugin from "@convex-dev/eslint-plugin";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...convexPlugin.configs.recommended,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/router",
              importNames: ["useRouter"],
              message:
                "Importing useRouter from 'next/router' is not allowed. Import from `@bprogress/next/app` instead.",
            },
            {
              name: "next/navigation",
              importNames: ["useRouter"],
              message:
                "Importing useRouter from 'next/navigation' is not allowed. Import from `@bprogress/next/app` instead.",
            },
            {
              name: "convex/react",
              importNames: ["useQuery", "usePaginatedQuery"],
              message:
                "Importing useQuery or usePaginatedQuery from 'convex/react' is not allowed. Import from `convex-helpers/react/cache/hooks` instead.",
            },
          ],
        },
      ],
    },
  },
]);
