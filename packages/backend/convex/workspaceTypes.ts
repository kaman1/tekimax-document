import { Doc } from './_generated/dataModel.d';
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { DEFAULT_WORKSPACE_TYPES, WORKSPACE_TYPES } from "./constants";

export const list = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get workspace-specific types if workspaceId is provided
    let workspaceTypes: Doc<"workspaceTypes">[] = [];
    if (args.workspaceId !== undefined) {
      const workspaceId = args.workspaceId;  // TypeScript now knows this is not undefined
      workspaceTypes = await ctx.db
        .query("workspaceTypes")
        .withIndex("by_workspace", (q) => 
          q.eq("workspaceId", workspaceId)
        )
        .collect();
    }

    return {
      defaultTypes: DEFAULT_WORKSPACE_TYPES,
      customTypes: workspaceTypes.map(type => ({
        id: `${WORKSPACE_TYPES.CUSTOM}:${type.name}`,
        name: type.name,
        description: type.description,
      }))
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get the workspace to verify permissions
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Get the user ID from the workspace members
    const member = workspace.members.find(m => m.userId && m.role === 'owner');
    if (!member) {
      throw new Error("Workspace owner not found");
    }

    // Check if type already exists
    const existingType = await ctx.db
      .query("workspaceTypes")
      .filter((q) => q.eq(q.field("name"), args.name.trim()))
      .first();

    if (existingType) {
      throw new Error("A workspace type with this name already exists");
    }

    // Create the new workspace type
    const workspaceType = await ctx.db.insert("workspaceTypes", {
      name: args.name.trim(),
      description: args.description?.trim(),
      workspaceId: args.workspaceId,
      createdBy: member.userId,
    });

    return workspaceType;
  },
});

export const remove = mutation({
  args: { id: v.id("workspaceTypes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if type is in use
    const workspacesUsingType = await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("type"), WORKSPACE_TYPES.CUSTOM))
      .collect();

    const typeInUse = workspacesUsingType.some(workspace => workspace.customType === args.id);
    if (typeInUse) {
      throw new Error("Cannot delete a workspace type that is currently in use");
    }

    await ctx.db.delete(args.id);
    return true;
  },
});
