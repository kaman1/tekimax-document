import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { type Infer, v } from "convex/values";

export const CURRENCIES = {
  USD: "usd",
  EUR: "eur",
} as const;
export const currencyValidator = v.union(
  v.literal(CURRENCIES.USD),
  v.literal(CURRENCIES.EUR),
);
export type Currency = Infer<typeof currencyValidator>;

export const INTERVALS = {
  MONTH: "month",
  YEAR: "year",
} as const;
export const intervalValidator = v.union(
  v.literal(INTERVALS.MONTH),
  v.literal(INTERVALS.YEAR),
);
export type Interval = Infer<typeof intervalValidator>;

export const PLANS = {
  FREE: "free",
  PRO: "pro",
} as const;
export const planKeyValidator = v.union(
  v.literal(PLANS.FREE),
  v.literal(PLANS.PRO),
);
export type PlanKey = Infer<typeof planKeyValidator>;

const priceValidator = v.object({
  polarId: v.string(),
  amount: v.number(),
});
const pricesValidator = v.object({
  [CURRENCIES.USD]: priceValidator,
});

export default defineSchema({
  ...authTables,
  users: defineTable({
    // Convex Auth fields
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // custom fields
    username: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    polarId: v.optional(v.string()),
    polarSubscriptionPendingId: v.optional(v.id("_scheduled_functions")),
  })
    .index("email", ["email"])
    .index("polarId", ["polarId"]),

  plans: defineTable({
    key: planKeyValidator,
    polarProductId: v.string(),
    name: v.string(),
    description: v.string(),
    prices: v.object({
      [INTERVALS.MONTH]: v.optional(pricesValidator),
      [INTERVALS.YEAR]: v.optional(pricesValidator),
    }),
  })
    .index("key", ["key"])
    .index("polarProductId", ["polarProductId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    workspaceId: v.optional(v.id("workspaces")),
    planId: v.id("plans"),
    polarId: v.string(),
    polarPriceId: v.string(),
    currency: currencyValidator,
    interval: intervalValidator,
    status: v.string(),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  })
    .index("userId", ["userId"])
    .index("workspaceId", ["workspaceId"])
    .index("polarId", ["polarId"]),

  workspaces: defineTable({
    name: v.string(),
    type: v.union(v.literal("personal"), v.literal("team"), v.literal("marketing"), v.literal("custom"), v.literal("workspace")),
    customType: v.optional(v.string()),
    ownerId: v.id("users"),
    members: v.array(v.object({
      userId: v.id("users"),
      role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
      joinedAt: v.number(),
    })),
    settings: v.object({
      logoId: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
    }),
  })
    .index("by_owner", ["ownerId"])
    .index("by_member", ["members"]),

  workspaceTypes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"]),
    
  documents: defineTable({
    title: v.string(),
    content: v.string(),
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    lastEditedBy: v.id("users"),
    parentId: v.optional(v.id("documents")),
    isArchived: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_parent", ["parentId", "workspaceId"])
    .index("by_creator", ["createdBy", "workspaceId"]),

  comments: defineTable({
    content: v.string(),
    documentId: v.id("documents"),
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    parentId: v.optional(v.id("comments")),
    isResolved: v.optional(v.boolean()),
  })
    .index("by_document", ["documentId", "workspaceId"])
    .index("by_parent", ["parentId", "workspaceId"])
    .index("by_workspace", ["workspaceId"]),

  invites: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("read"), v.literal("write"), v.literal("owner")),
    workspaceId: v.id("workspaces"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired")),
    otp: v.optional(v.string()),
    token: v.optional(v.string()),
    expiresAt: v.number(),
    createdBy: v.id("users"),
  }).index("by_email", ["email"])
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["status"])
    .index("by_workspace_and_status", ["workspaceId", "status"]),
    
});
