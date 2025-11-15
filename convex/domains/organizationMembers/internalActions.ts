import { createAccount } from "@convex-dev/auth/server";
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
    const response = await createAccount(ctx, {
      provider: "password",
      account: {
        id: args.email,
        secret: args.email,
      },
      profile: {
        email: args.email,
        name: args.name,
      },
    });

    await ctx.runMutation(
      internal.domains.organizationMembers.internalCrud.create,
      {
        organizationId: args.organizationId,
        userId: response.user._id,
      },
    );
  },
});
