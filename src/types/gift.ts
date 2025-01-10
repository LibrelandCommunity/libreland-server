import z from 'zod'

export const Gift = z.object({
  id: z.string(),
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
  isPrivate: z.boolean(),
}).strict();

export type Gift = z.infer<typeof Gift>;