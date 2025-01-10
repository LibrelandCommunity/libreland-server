import z from 'zod'

export const PlacementInfoSchema = z.object({
  placerId: z.string(),
  placerName: z.string().nullable(), // Might only be null for ground 000000000000000000000001
  placedDaysAgo: z.number(),
  copiedVia: z.string().optional(),
}).strict()

export const ItemInfoSchema = z.object({
  name: z.string(),
  creatorId: z.string(),
  creatorName: z.string().nullable(), // Might only be null for ground 000000000000000000000001
  createdDaysAgo: z.number(),
  collectedCount: z.number(),
  placedCount: z.number(),
  clonedFromId: z.string().optional(),
  allCreatorsThingsClonable: z.boolean(),
  isUnlisted: z.boolean(),
}).strict().nullable()

export const ItemTagsSchema = z.object({
  tags: z.array(z.object({
    tag: z.string(),
    userIds: z.array(z.string()),
  }).strict())
}).strict()

export const ThingSearchSchema = z.object({
  thingIds: z.array(z.string())
}).strict()

// Export TypeScript types
export type PlacementInfo = z.infer<typeof PlacementInfoSchema>
export type ItemInfo = z.infer<typeof ItemInfoSchema>
export type ItemTags = z.infer<typeof ItemTagsSchema>
export type ThingSearch = z.infer<typeof ThingSearchSchema>