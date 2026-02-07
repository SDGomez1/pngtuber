import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  expressions: defineTable({
    userId: v.id("users"),
    label: v.string(),
    image: v.id("_storage"),
  }),
  users: defineTable({
    name: v.string(),
  }),
  usersConfig: defineTable({
    userId: v.id("users"),
    threshold: v.number(),
  }),
});
