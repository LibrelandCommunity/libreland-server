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

// New schemas for database
export const ThingDefSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  version: z.string().optional(),
  attributes: z.array(z.union([z.string(), z.number()])).optional(),
  parts: z.array(z.object({
    blockType: z.union([z.string(), z.number()]),
    shapes: z.array(z.object({
      position: z.array(z.number()).length(3),
      rotation: z.array(z.number()).length(3),
      scale: z.array(z.number()).length(3),
      color: z.array(z.number()).length(3),
    }))
  }))
}).strict()

export const ThingInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  creatorId: z.string(),
  creatorName: z.string().nullable(),
  createdDaysAgo: z.number(),
  collectedCount: z.number(),
  placedCount: z.number(),
  clonedFromId: z.string().optional(),
  allCreatorsThingsClonable: z.boolean(),
  isUnlisted: z.boolean()
}).strict()

export const ThingTagSchema = z.object({
  id: z.string(),
  tags: z.array(z.object({
    tag: z.string(),
    userId: z.string().optional(),
    userName: z.string().optional()
  }))
}).strict()

// Export TypeScript types
export type PlacementInfo = z.infer<typeof PlacementInfoSchema>
export type ItemInfo = z.infer<typeof ItemInfoSchema>
export type ItemTags = z.infer<typeof ItemTagsSchema>
export type ThingSearch = z.infer<typeof ThingSearchSchema>
export type ThingDef = z.infer<typeof ThingDefSchema>
export type ThingInfo = z.infer<typeof ThingInfoSchema>
export type ThingTag = z.infer<typeof ThingTagSchema>