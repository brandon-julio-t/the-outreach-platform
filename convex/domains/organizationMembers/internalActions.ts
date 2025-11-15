import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";

export const addOrganizationMemberAction = internalAction({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await ctx.runAction(
      internal.admin.console.functions.createUser,
      {
        name: args.name,
        email: args.email,
        password: args.email,
      },
    );

    await ctx.runMutation(
      internal.domains.organizationMembers.internalCrud.create,
      {
        organizationId: args.organizationId,
        userId: response.user._id,
      },
    );
  },
});
