import z from 'zod'
import { sqliteBoolean } from './db'

/**
 * User-related type definitions
 */

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  password_hash: z.string(),
  created_at: z.number(),
  updated_at: z.number(),
  person_id: z.string().optional(),
  is_findable: sqliteBoolean,
  age: z.number(),
  age_secs: z.number(),
  is_soft_banned: sqliteBoolean,
  show_flag_warning: sqliteBoolean,
  area_count: z.number(),
  thing_tag_count: z.number(),
  all_things_clonable: sqliteBoolean,
  has_edit_tools: sqliteBoolean,
  has_edit_tools_permanently: sqliteBoolean,
  edit_tools_expiry_date: z.string(),
  is_in_edit_tools_trial: sqliteBoolean,
  was_edit_tools_trial_activated: sqliteBoolean,
  custom_search_words: z.string(),
  attachments: z.string(),
  achievements: z.array(z.number()),
  status_text: z.string()
}).strict()

export const CreateUserSchema = UserSchema.omit({
  id: true,
  password_hash: true,
  created_at: true,
  updated_at: true
}).extend({
  password: z.string()
})

export const UserSessionSchema = z.object({
  id: z.string(),
  username: z.string()
}).strict()

export const UserAuthResponseSchema = z.object({
  vMaj: z.number(),
  vMinSrv: z.number(),
  personId: z.string(),
  homeAreaId: z.string(),
  screenName: z.string(),
  statusText: z.string(),
  isFindable: z.boolean(),
  age: z.number(),
  ageSecs: z.number(),
  attachments: z.string(),
  isSoftBanned: z.boolean(),
  showFlagWarning: z.boolean(),
  flagTags: z.array(z.string()),
  areaCount: z.number(),
  thingTagCount: z.number(),
  allThingsClonable: z.boolean(),
  achievements: z.array(z.number()),
  hasEditTools: z.boolean(),
  hasEditToolsPermanently: z.boolean(),
  editToolsExpiryDate: z.string(),
  isInEditToolsTrial: z.boolean(),
  wasEditToolsTrialEverActivated: z.boolean(),
  customSearchWords: z.string()
}).strict()

// Export TypeScript types
export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UserSession = z.infer<typeof UserSessionSchema>
export type UserAuthResponse = z.infer<typeof UserAuthResponseSchema>