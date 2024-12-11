import { getAuthUserId } from "@convex-dev/auth/server";
import { asyncMap } from "convex-helpers";
import { v } from "convex/values";
import { z } from "zod";
import { mutation, query } from "./_generated/server";
import { username } from "./utils/validators";
import { Id } from "./_generated/dataModel";

export const getUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return;
    }
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();
    const plan = subscription?.planId
      ? await ctx.db.get(subscription.planId)
      : undefined;
    return {
      ...user,
      name: user.username || user.name,
      subscription,
      plan,
      avatarUrl: user.imageId
        ? await ctx.storage.getUrl(user.imageId as Id<"_storage">)
        : undefined,
    };
  },
});

export const updateUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }
    const validatedUsername = username.safeParse(args.username);

    if (!validatedUsername.success) {
      throw new Error(validatedUsername.error.message);
    }
    await ctx.db.patch(userId, { username: validatedUsername.data });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateUserImage = mutation({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }
    ctx.db.patch(userId, { imageId: args.imageId });
  },
});

export const removeUserImage = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }
    ctx.db.patch(userId, { imageId: undefined, image: undefined });
  },
});

export const deleteCurrentUserAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();
    if (!subscription) {
      console.error("No subscription found");
    } else {
      await ctx.db.delete(subscription._id);
    }
    await asyncMap(
      ["google" /* add other providers as needed */],
      async (provider) => {
        const authAccount = await ctx.db
          .query("authAccounts")
          .withIndex("userIdAndProvider", (q) =>
            q.eq("userId", userId).eq("provider", provider),
          )
          .unique();
        if (!authAccount) {
          return;
        }
        await ctx.db.delete(authAccount._id);
      },
    );
    await ctx.db.delete(userId);
  },
});

export const me = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.tokenIdentifier))
      .first();

    return user;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Create new user
    const user = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      image: args.image,

      username: "",
    });

    return user;
  },
});

export const update = mutation({
  args: {
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
    defaultWorkspaceId: v.optional(v.id("workspaces")),
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

    const updates: any = {};

    if (args.username !== undefined) {
      // Validate username
      if (args.username.length < 3) {
        throw new Error("Username must be at least 3 characters");
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(args.username)) {
        throw new Error("Username can only contain letters, numbers, underscores, and hyphens");
      }

      // Check if username is taken
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => 
          q.and(
            q.eq(q.field("username"), args.username),
            q.neq(q.field("_id"), user._id)
          )
        )
        .first();

      if (existingUser) {
        throw new Error("Username is already taken");
      }

      updates.username = args.username;
    }

    if (args.name !== undefined) updates.name = args.name;
    if (args.image !== undefined) updates.image = args.image;
    if (args.onboardingComplete !== undefined) updates.onboardingComplete = args.onboardingComplete;
    if (args.defaultWorkspaceId !== undefined) {
      // Verify workspace exists and user is a member
      const workspace = await ctx.db.get(args.defaultWorkspaceId);
      if (!workspace) {
        throw new Error("Workspace not found");
      }
      const isMember = workspace.members.some(m => m.userId === user._id);
      if (!isMember) {
        throw new Error("User is not a member of this workspace");
      }
      updates.defaultWorkspaceId = args.defaultWorkspaceId;
    }

    const updated = await ctx.db.patch(user._id, updates);
    return updated;
  },
});

export const listByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get the workspace to check permissions
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Check if user is a member of the workspace
    const currentUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!currentUser) {
      throw new Error("User not found");
    }

    const isMember = workspace.members.some(member => member.userId === currentUser._id);
    if (!isMember) {
      throw new Error("Not a member of this workspace");
    }

    // If it's a personal workspace, only return the owner
    if (workspace.type === "personal") {
      const owner = await ctx.db.get(workspace.ownerId);
      return owner ? [owner] : [];
    }

    // For team workspaces, get all members
    const memberIds = workspace.members.map(member => member.userId);
    const users = await Promise.all(
      memberIds.map(async (userId) => {
        const user = await ctx.db.get(userId);
        if (!user) return null;

        // Get user's avatar URL if they have one
        const avatarUrl = user.imageId 
          ? await ctx.storage.getUrl(user.imageId as Id<"_storage">)
          : undefined;

        return {
          ...user,
          name: user.username || user.name,
          avatarUrl,
        };
      })
    );

    // Filter out any null values and sort by name
    return users
      .filter((user): user is NonNullable<typeof user> => user !== null)
      .sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      });
  },
});
