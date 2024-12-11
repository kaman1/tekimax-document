"use client";

import { api } from "@v1/backend/convex/_generated/api";
import { Doc, Id } from "@v1/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type WorkspaceContextType = {
  activeWorkspaceId: Id<"workspaces"> | undefined;
  setActiveWorkspaceId: (id: Id<"workspaces">) => void;
  activeWorkspace: Doc<"workspaces"> | undefined;
  isLoading: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const workspaces = useQuery(api.workspaces.list);
  const user = useQuery(api.users.getUser);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<Id<"workspaces">>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (workspaces === undefined || user === undefined) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);
    
    if (workspaces.length > 0 && !activeWorkspaceId) {
      // First try to find a personal workspace
      const personalWorkspace = workspaces?.find(w => w.ownerId === user?._id as Id<"users"> && w.type === "personal");
      if (personalWorkspace) {
        setActiveWorkspaceId(personalWorkspace._id);
      } else {
        // If no personal workspace, use the first available workspace
        setActiveWorkspaceId(workspaces[0]?._id as Id<"workspaces">);
      }
    }
  }, [workspaces, user, activeWorkspaceId]);

  const activeWorkspace = workspaces?.find(w => w._id === activeWorkspaceId);

  const value = {
    activeWorkspaceId,
    setActiveWorkspaceId,
    activeWorkspace,
    isLoading
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === null) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
