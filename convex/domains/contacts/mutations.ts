import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUserWithOrgId } from "../core/ensureUserWithOrgId";

export const createContact = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ensureUserWithOrgId({ ctx });

    await ctx.db.insert("contacts", {
      ...args,
      organizationId: user.organizationId,
    });
  },
});

export const patchContact = mutation({
  args: {
    id: v.id("contacts"),
    patch: v.object({
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ensureUserWithOrgId({ ctx });

    await ctx.db.patch(args.id, args.patch);
  },
});

export const deleteContact = mutation({
  args: {
    id: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    await ensureUserWithOrgId({ ctx });

    await ctx.db.delete(args.id);
  },
});
