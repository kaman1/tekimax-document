"use client";

import { env } from "@/env.mjs";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { WorkspaceProvider } from "@/contexts/workspace-context";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL, {
  verbose: true,
});

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <WorkspaceProvider>
        {children}
      </WorkspaceProvider>
    </ConvexAuthNextjsProvider>
  );
}
