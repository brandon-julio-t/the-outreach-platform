import { createAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalAction } from "../../_generated/server";

export const createUser = internalAction({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    return await createAccount(ctx, {
      provider: "password",
      account: {
        id: args.email,
        secret: args.password,
      },
      profile: {
        email: args.email,
      },
    });
  },
});
