"use client";

import { WorkspaceProvider as WorkspaceContextProvider } from "@/contexts/workspace-context";
import { ReactNode } from "react";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  return <WorkspaceContextProvider>{children}</WorkspaceContextProvider>;
}
