export const WORKSPACE_TYPES = {
  PERSONAL: "personal",
  TEAM: "team",
  MARKETING: "marketing",
  CUSTOM: "custom",
} as const;

export const DEFAULT_WORKSPACE_TYPES = [
  {
    id: WORKSPACE_TYPES.PERSONAL,
    name: "Personal Workspace",
    description: "For individual use and personal projects",
  },
  {
    id: WORKSPACE_TYPES.TEAM,
    name: "Team Workspace",
    description: "For team collaboration and shared projects",
  },
  {
    id: WORKSPACE_TYPES.MARKETING,
    name: "Marketing Workspace",
    description: "For marketing teams and campaigns",
  },
] as const;
