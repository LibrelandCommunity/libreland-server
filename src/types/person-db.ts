import z from 'zod';
import { sqliteBoolean, SqliteBoolean } from './db';

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
  wasSeenByReceiver: sqliteBoolean,
  isPrivate: sqliteBoolean
}).strict()

export const PersonAreaSchema = z.object({
  personId: z.string(),
  areaId: z.string(),
  areaName: z.string(),
  playerCount: z.number(),
  isPrivate: sqliteBoolean
}).strict()

// Export TypeScript types
export interface PersonMetadata {
  id: string;
  screen_name: string;
  age?: number;
  status_text?: string;
  is_findable?: SqliteBoolean;
  is_banned?: SqliteBoolean;
  last_activity_on?: string;
}

export interface PersonGift {
  id: string;
  personId: string;
  thingId: string;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  dateSent: string;
  senderId: string;
  senderName: string;
  wasSeenByReceiver: SqliteBoolean;
  isPrivate: SqliteBoolean;
}

export interface PersonArea {
  personId: string;
  areaId: string;
  areaName: string;
  playerCount: number;
  isPrivate: SqliteBoolean;
}