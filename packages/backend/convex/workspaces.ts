import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("personal"), v.literal("team"), v.literal("marketing"), v.literal("custom")),
    customType: v.optional(v.string()),
    settings: v.optional(v.object({
      logoId: v.string(),
      logoUrl: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    // Handle logo storage and URL if provided
    let settings = args.settings;
    if (args.settings?.logoId) {
      try {
        const logoUrl = await ctx.storage.getUrl(args.settings.logoId);
        settings = {
          ...args.settings,
          logoUrl
        };
      } catch (error) {
        console.error("Error getting logo URL:", error);
        throw new Error("Invalid logo storage ID");
      }
    }

    const workspaceData = {
      name: args.name,
      type: args.type,
      customType: args.type === "custom" ? args.customType : undefined,
      settings: settings || {},
    };

    if (!user) {
      // Create user if not exists
      const userId = await ctx.db.insert("users", {
        name: identity.name ?? identity.email?.split("@")[0] ?? "Anonymous",
        email: identity.email!,
        image: identity.pictureUrl,
        username: identity.email?.split("@")[0],
      });
      
      // Create workspace
      return await ctx.db.insert("workspaces", {
        ...workspaceData,
        ownerId: userId,
        members: [{
          userId: userId,
          role: "owner",
          joinedAt: Date.now(),
        }],
      });
    }

    // Create workspace for existing user
    return await ctx.db.insert("workspaces", {
      ...workspaceData,
      ownerId: user._id,
      members: [{
        userId: user._id,
        role: "owner",
        joinedAt: Date.now(),
      }],
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    // Return empty list if user doesn't exist yet
    if (!user) {
      return [];
    }

    // Get workspaces where user is owner
    const ownedWorkspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    // Get all workspaces first
    const allWorkspaces = await ctx.db
      .query("workspaces")
      .collect();

    // Filter for member workspaces in memory
    const memberWorkspaces = allWorkspaces.filter(
      workspace => 
        workspace.ownerId !== user._id &&
        workspace.members.some(member => member.userId === user._id)
    );

    return [...ownedWorkspaces, ...memberWorkspaces];
  },
});

export const get = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const workspace = await ctx.db.get(args.id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return workspace;
  },
});

export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("personal"), v.literal("team"), v.literal("marketing"), v.literal("custom"))),
    customType: v.optional(v.string()),
    settings: v.optional(v.object({
      logoUrl: v.optional(v.string()),
      logoId: v.optional(v.string()),
      color: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const workspace = await ctx.db.get(args.id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Check if user is owner or admin
    const member = workspace.members.find(m => m.userId === user._id);
    if (!member || !["owner", "admin"].includes(member.role)) {
      throw new Error("Unauthorized");
    }

    const updates: any = {};

    if (args.name) updates.name = args.name;
    if (args.type) updates.type = args.type;
    if (args.customType && args.type === "custom") updates.customType = args.customType;
    
    // Handle settings update with logo
    if (args.settings) {
      const currentSettings = workspace.settings || {};
      let newSettings = { ...currentSettings };

      // If new logo ID is provided, get its URL
      if (args.settings.logoId) {
        try {
          const logoUrl = await ctx.storage.getUrl(args.settings.logoId);
          newSettings = {
            ...newSettings,
            ...args.settings,
            logoUrl
          };
        } catch (error) {
          console.error("Error getting logo URL:", error);
          throw new Error("Invalid logo storage ID");
        }
      } else {
        // If no new logo ID, just merge the settings
        newSettings = {
          ...newSettings,
          ...args.settings
        };
      }

      updates.settings = newSettings;
    }

    const updatedWorkspace = await ctx.db.patch(args.id, updates);
    return updatedWorkspace;
  },
});

export const generateUploadUrl = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // If workspaceId is provided, verify permissions
    if (args.workspaceId) {
      const workspace = await ctx.db.get(args.workspaceId);
      if (!workspace) {
        throw new Error("Workspace not found");
      }

      // Check if user is owner or admin
      const member = workspace.members.find(m => m.userId === user._id);
      if (!member || !["owner", "admin"].includes(member.role)) {
        throw new Error("Unauthorized");
      }
    }

    // Generate upload URL with storage configuration for images
    const uploadUrl = await ctx.storage.generateUploadUrl();

    return uploadUrl;
  },
});

export const remove = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const workspace = await ctx.db.get(args.id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Check if user is owner
    const member = workspace.members.find(m => m.userId === user._id);
    if (!member || member.role !== "owner") {
      throw new Error("Only workspace owners can delete workspaces");
    }

    await ctx.db.delete(args.id);
  },
});
