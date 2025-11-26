import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import schema from "../../schema";
import { ensureUserWithOrgId } from "../core/ensureUserWithOrgId";

const vContact = v.object({
  name: v.string(),
  phone: v.string(),
});

export const createContact = mutation({
  args: vContact,
  handler: async (ctx, args) => {
    const user = await ensureUserWithOrgId({ ctx });

    const existingByPhone = await ctx.db
      .query("contacts")
      .withIndex("by_organizationId_phone", (q) =>
        q.eq("organizationId", user.organizationId).eq("phone", args.phone),
      )
      .first();

    if (existingByPhone) {
      throw new ConvexError("Contact with this phone number already exists");
    }

    await ctx.db.insert("contacts", {
      ...args,
      organizationId: user.organizationId,
    });
  },
});

export const createContactsBulk = mutation({
  args: {
    contacts: v.array(vContact),
  },
  handler: async (ctx, args) => {
    const user = await ensureUserWithOrgId({ ctx });

    await Promise.all(
      args.contacts.map(async (contact) => {
        const existingByPhone = await ctx.db
          .query("contacts")
          .withIndex("by_organizationId_phone", (q) =>
            q
              .eq("organizationId", user.organizationId)
              .eq("phone", contact.phone),
          )
          .first();

        if (existingByPhone) {
          await ctx.db.patch(existingByPhone._id, {
            ...contact,
            lastUpdateTime: Date.now(),
          });
        } else {
          await ctx.db.insert("contacts", {
            ...contact,
            organizationId: user.organizationId,
          });
        }
      }),
    );
  },
});

export const patchContact = mutation({
  args: {
    id: v.id("contacts"),
    patch: v.object(schema.tables.contacts.validator.fields).partial(),
  },
  handler: async (ctx, args) => {
    await ensureUserWithOrgId({ ctx });

    await ctx.db.patch(args.id, {
      ...args.patch,
      lastUpdateTime: Date.now(),
    });
  },
});

export const deleteContact = mutation({
  args: {
    id: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    const user = await ensureUserWithOrgId({ ctx });
    console.log("user", user);

    await ctx.db.delete(args.id);
    console.log("deleted contact", args.id);

    const messages = await ctx.db
      .query("twilioMessages")
      .withIndex("by_organizationId_contactId", (q) =>
        q.eq("organizationId", user.organizationId).eq("contactId", args.id),
      )
      .collect();

    console.log("deleting messages", messages.length);

    await Promise.all(
      messages.map(async (message) => {
        console.log("deleted message", message._id);
        await ctx.db.delete(message._id);
      }),
    );
  },
});
