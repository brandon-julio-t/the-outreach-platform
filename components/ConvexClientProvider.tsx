"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { ProgressProvider } from "@bprogress/next/app";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
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
        {children}
      </ProgressProvider>
    </ConvexAuthNextjsProvider>
  );
}
