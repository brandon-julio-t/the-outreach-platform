import { ConvexError, v } from "convex/values";
import { internal } from "../../_generated/api";
import { mutation } from "../../_generated/server";
import { ensureUserWithOrgId } from "../core/ensureUserWithOrgId";

export const addOrganizationMember = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ensureUserWithOrgId({ ctx });

    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    console.log("existingUser", existingUser);

    if (!existingUser) {
      console.log("User does not exists, creating user through action...");

      await ctx.scheduler.runAfter(
        0,
        internal.domains.organizationMembers.internalActions
          .addOrganizationMemberAction,
        {
          organizationId: user.organizationId,
          email: args.email,
          name: args.name,
        },
      );

      return;
    }

    console.log("User exists, adding member...");

    await ctx.db.insert("organizationMembers", {
      organizationId: user.organizationId,
      userId: existingUser._id,
    });
  },
});

export const patchOrganizationMember = mutation({
  args: {
    id: v.id("organizationMembers"),
    patch: v.object({
      email: v.optional(v.string()),
      name: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ensureUserWithOrgId({ ctx });

    const organizationMember = await ctx.db.get(args.id);
    if (!organizationMember) {
      throw new ConvexError("Organization member not found");
    }

    if (organizationMember.organizationId !== user.organizationId) {
      throw new ConvexError(
        "You are not authorized to patch this organization member",
      );
    }

    await ctx.db.patch(organizationMember.userId, args.patch);
  },
});

export const deleteOrganizationMember = mutation({
  args: {
    organizationMemberId: v.id("organizationMembers"),
  },
  handler: async (ctx, args) => {
    const user = await ensureUserWithOrgId({ ctx });

    const organizationMember = await ctx.db.get(args.organizationMemberId);
    if (!organizationMember) {
      throw new ConvexError("Organization member not found");
    }

    if (organizationMember.organizationId !== user.organizationId) {
      throw new ConvexError(
        "You are not authorized to delete this organization member",
      );
    }

    await ctx.db.delete(args.organizationMemberId);
  },
});
