import { createAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";

export const createUser = internalAction({
  args: {
    name: v.string(),
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
        name: args.name,
      },
    });

    const organization = await ctx.runMutation(
      internal.domains.organizations.internalCrud.create,
      {
        name: `${args.name}'s Organization`,
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

    return response;
  },
});
