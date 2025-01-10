import z from 'zod'
import { Gift } from './gift'

export const PersonInfoSchema = z.union([
  z.object({
    id: z.string(),
    screenName: z.string(),
    age: z.number(),
    statusText: z.string(),
    isFindable: z.boolean(),
    isBanned: z.boolean(),
    lastActivityOn: z.string().datetime(),
    isFriend: z.boolean(),
    isEditorHere: z.boolean(),
    isListEditorHere: z.boolean(),
    isOwnerHere: z.boolean(),
    isAreaLocked: z.boolean(),
    isOnline: z.boolean()
  }).strict(),
  // self
  z.object({
    id: z.string(),
    screenName: z.string(),
    age: z.number(),
    statusText: z.string(),
    isFindable: z.boolean(),
    isBanned: z.boolean(),
    lastActivityOn: z.string().datetime(),
    isEditorHere: z.boolean(),
    isListEditorHere: z.boolean(),
    isOwnerHere: z.boolean(),
    isAreaLocked: z.boolean(),
  }).strict(),
  // either deleted/nonexistent players, or some kind of unfindable setting?
  z.object({
    isFriend: z.boolean(),
    isEditorHere: z.boolean(),
    isListEditorHere: z.boolean(),
    isOwnerHere: z.boolean(),
    isAreaLocked: z.boolean(),
    isOnline: z.boolean()
  }).strict(),
  // why
  z.object({
    isFriend: z.boolean(),
    isEditorHere: z.boolean(),
    isAreaLocked: z.boolean(),
    isOnline: z.boolean()
  }).strict(),
])

export const PersonGiftsReceived = z.union([
  z.object({
    gifts: z.array(Gift)
  }),
  z.object({}).strict()
]);

// Export TypeScript types
export type PersonInfo = z.infer<typeof PersonInfoSchema>
export type PersonGifts = z.infer<typeof PersonGiftsReceived>