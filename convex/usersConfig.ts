import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getThreshold = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").first();
    if (!user) {
      return;
    }

    return await ctx.db
      .query("usersConfig")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();
  },
});

export const setThreshold = mutation({
  args: { threshold: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").first();
    if (!user) {
      throw new Error("User not found");
    }

    const userConfig = await ctx.db
      .query("usersConfig")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (userConfig) {
      await ctx.db.patch(userConfig._id, { threshold: args.threshold });
    } else {
      await ctx.db.insert("usersConfig", {
        userId: user._id,
        threshold: args.threshold,
      });
    }
  },
});

