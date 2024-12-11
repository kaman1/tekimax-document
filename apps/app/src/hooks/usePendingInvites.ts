import { api } from "@v1/backend/convex/_generated/api";
import { Id } from "@v1/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function usePendingInvites(workspaceId: Id<"workspaces"> | undefined) {
  return useQuery(
    api.invites.getPendingByWorkspace,
    workspaceId ? { workspaceId } : "skip"
  );
}
