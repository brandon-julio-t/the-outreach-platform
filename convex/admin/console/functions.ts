import { createAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";

export const createUser = internalAction({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await createAccount(ctx, {
      provider: "password",
      account: {
        id: args.email,
        secret: args.password,
      },
      profile: {
        email: args.email,
      },
    });

    const organization = await ctx.runMutation(
      internal.domains.organizations.internalCrud.create,
      {
        name: "Personal",
      },
    );

    await ctx.runMutation(
      internal.domains.organizationMembers.internalCrud.create,
      {
        organizationId: organization._id,
        userId: response.user._id,
      },
    );

    await ctx.runMutation(internal.domains.users.internalCrud.update, {
      id: response.user._id,
      patch: {
        organizationId: organization._id,
      },
    });
  },
});
