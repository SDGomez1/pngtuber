import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getExpressions = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    if (!user) {
      return { idle: null, speaking: null };
    }

    const idleExpression = await ctx.db
      .query("expressions")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .filter((q) => q.eq(q.field("label"), "idle"))
      .first();

    const speakingExpression = await ctx.db
      .query("expressions")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .filter((q) => q.eq(q.field("label"), "speaking"))
      .first();

    const idleImageUrl = idleExpression ? await ctx.storage.getUrl(idleExpression.image) : null;
    const speakingImageUrl = speakingExpression ? await ctx.storage.getUrl(speakingExpression.image) : null;

    return {
      idle: idleExpression ? { ...idleExpression, url: idleImageUrl } : null,
      speaking: speakingExpression ? { ...speakingExpression, url: speakingImageUrl } : null,
    };
  },
});

export const saveExpression = mutation({
  args: { label: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").first();
    if (!user) {
      throw new Error("User not found");
    }

    const existingExpression = await ctx.db
      .query("expressions")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .filter((q) => q.eq(q.field("label"), args.label))
      .first();

    if (existingExpression) {
      await ctx.db.patch(existingExpression._id, { image: args.storageId });
    } else {
      await ctx.db.insert("expressions", {
        userId: user._id,
        label: args.label,
        image: args.storageId,
      });
    }
  },
});
