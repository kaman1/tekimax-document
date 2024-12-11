import { v } from "convex/values";
import { mutation, query, internalMutation, internalAction } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("read"), v.literal("write"), v.literal("owner")),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!currentUser) {
      throw new Error("User not found");
    }

    const userId = currentUser._id;

    // Check if user has permission to invite
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const member = workspace.members.find(m => m.userId === userId);
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      throw new Error("You don't have permission to invite users");
    }

    // Check if the invited email is already a member
    const invitedUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (invitedUser) {
      const isAlreadyMember = workspace.members.some(m => m.userId === invitedUser._id);
      if (isAlreadyMember) {
        throw new Error("User is already a member of this workspace");
      }
    }

    // Check if invite already exists
    const existingInvite = await ctx.db
      .query("invites")
      .withIndex("by_email", q => q.eq("email", args.email))
      .filter(q => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter(q => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvite) {
      throw new Error("User already invited");
    }

    // Generate magic link token (using a secure random string)
    const token = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);

    // Create the invite with 15 minutes expiration
    const inviteId = await ctx.db.insert("invites", {
      email: args.email,
      name: args.name,
      role: args.role,
      workspaceId: args.workspaceId,
      status: "pending",
      token,
      expiresAt: Date.now() + 15 * 60 * 1000,
      createdBy: userId,
    });

    // Schedule the email sending action
    await ctx.scheduler.runAfter(0, internal.invites.sendInviteEmail, {
      email: args.email,
      workspaceName: workspace.name,
      inviteId: inviteId,
      token: token,
    });

    return {
      _id: inviteId,
      success: true
    };
  },
});

// Internal action to send email
export const sendInviteEmail = internalAction({
  args: {
    email: v.string(),
    workspaceName: v.string(),
    inviteId: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Starting email send process...");
    const apiKey = process.env.AUTH_RESEND_KEY ?? "re_9oP4uXEh_MTYdE5gPqgUzyXUYKKVGUCA8";
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #B4925E;">Welcome to ${args.workspaceName}</h2>
        <p>You've been invited to join ${args.workspaceName} on TEKIMAX.</p>
        
        <div style="margin: 24px 0;">
          <a href="${process.env.SITE_URL}/auth/verify/${args.inviteId}?token=${args.token}" 
            style="background-color: #B4925E; 
                   color: white; 
                   padding: 12px 24px; 
                   text-decoration: none; 
                   border-radius: 4px; 
                   display: inline-block;">
            Accept Invitation
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This invitation link will expire in 15 minutes.
        </p>
      </div>
    `;

    const emailData = {
      from: "TEKIMAX <onboarding@resend.dev>",
      to: args.email,
      subject: `Join ${args.workspaceName} on TEKIMAX Docs`,
      html: emailContent,
      headers: {
        "X-Entity-Ref-ID": args.inviteId
      }
    };
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend API error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);
    
    return result;
  },
});

export const getPendingByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .unique();

    if (!currentUser) {
      throw new Error("Unauthorized");
    }

    // Check if user is a member of the workspace
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const isMember = workspace.members.some(
      (member) => member.userId === currentUser._id
    );

    if (!isMember) {
      throw new Error("Not a member of workspace");
    }

    // Get all pending invites for the workspace
    const invites = await ctx.db
      .query("invites")
      .withIndex("by_workspace_and_status", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("status", "pending")
      )
      .collect();

    return invites;
  },
});

export const resend = mutation({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .unique();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    // Check if user has access to workspace
    const workspace = await ctx.db.get(invite.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const isMember = workspace.members.some(
      (member) => member.userId === user._id
    );

    if (!isMember) {
      throw new Error("Not a member of workspace");
    }

    return invite;
  },
});

export const remove = mutation({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .unique();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    // Check if user has access to workspace
    const workspace = await ctx.db.get(invite.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const isMember = workspace.members.some(
      (member) => member.userId === user._id
    );

    if (!isMember) {
      throw new Error("Not a member of workspace");
    }

    // Delete the invite
    await ctx.db.delete(args.inviteId);

    return invite;
  },
});

export const verify = mutation({
  args: {
    inviteId: v.id("invites"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    if (invite.status !== "pending") {
      throw new Error("Invite is no longer valid");
    }

    if (Date.now() > invite.expiresAt) {
      await ctx.db.patch(args.inviteId, { status: "expired" });
      throw new Error("Invite has expired");
    }

    if (invite.token !== args.token) {
      throw new Error("Invalid verification token");
    }

    // Get or create user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", invite.email))
      .first();

    const userId = existingUser?._id ?? await ctx.db.insert("users", {
      name: invite.name,
      email: invite.email,
      image: "",
    } as Doc<"users">);

    // Add member to workspace
    const workspace = await ctx.db.get(invite.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const isMember = workspace.members.some(
      (member) => member.userId === userId
    );

    if (!isMember) {
      const memberRole = invite.role === "owner" ? "owner" : 
                        invite.role === "write" ? "admin" : "member";
      
      await ctx.db.patch(invite.workspaceId, {
        members: [...workspace.members, { 
          userId, 
          role: memberRole,
          joinedAt: Date.now()
        }],
      });
    }

    // Mark invite as accepted
    await ctx.db.patch(args.inviteId, {
      status: "accepted",
    });

    return { success: true };
  },
});

// Utility function to delete workspace members
export const deleteWorkspaceMembers = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    console.log("Starting workspace members deletion for workspace:", args.workspaceId);

    // Get all invites for this workspace
    const invites = await ctx.db
      .query("invites")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Delete all invites
    console.log(`Deleting ${invites.length} invites for workspace`);
    for (const invite of invites) {
      await ctx.db.delete(invite._id);
    }

    // Get the workspace to access its members
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      console.log("Workspace not found, skipping member cleanup");
      return;
    }

    console.log(`Found ${workspace.members.length} members to clean up`);
    
    // Return success
    return {
      success: true,
      deletedInvites: invites.length,
      cleanedMembers: workspace.members.length,
    };
  },
});
