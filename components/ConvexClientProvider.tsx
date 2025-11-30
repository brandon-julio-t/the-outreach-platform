"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import { ConvexReactClient } from "convex/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProgressProvider
      height="2px"
      color="var(--primary)"
      options={
        {
          //
        }
      }
      shallowRouting
    >
      <ConvexAuthNextjsProvider client={convex}>
        <ConvexQueryCacheProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </ConvexQueryCacheProvider>
      </ConvexAuthNextjsProvider>
    </ProgressProvider>
  );
}
