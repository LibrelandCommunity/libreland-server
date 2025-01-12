import z from 'zod';

const sqliteBoolean = z.union([z.boolean(), z.number()]).transform(val => Boolean(val))

export const PersonTopBySchema = z.object({
  person_id: z.string(),
  thing_id: z.string(),
  rank: z.number()
}).strict()

export const PersonMetadataSchema = z.object({
  id: z.string(),
  screen_name: z.string(),
  age: z.number().optional(),
  status_text: z.string().optional(),
  is_findable: sqliteBoolean.optional(),
  is_banned: sqliteBoolean.optional(),
  last_activity_on: z.string().optional()
}).strict()

export const PersonGiftSchema = z.object({
  id: z.string(),
  personId: z.string(),
  thingId: z.string(),
  rotationX: z.number(),
  rotationY: z.number(),
  rotationZ: z.number(),
  positionX: z.number(),
  positionY: z.number(),
  positionZ: z.number(),
  dateSent: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  wasSeenByReceiver: z.boolean(),
  isPrivate: z.boolean()
}).strict()

export const PersonAreaSchema = z.object({
  personId: z.string(),
  areaId: z.string(),
  areaName: z.string(),
  playerCount: z.number(),
  isPrivate: sqliteBoolean
}).strict()

// Export TypeScript types
export type PersonMetadata = z.infer<typeof PersonMetadataSchema>
export type PersonGift = z.infer<typeof PersonGiftSchema>
export type PersonArea = z.infer<typeof PersonAreaSchema>