import z from 'zod'

const sqliteBoolean = z.union([z.boolean(), z.number()]).transform(val => Boolean(val))

/**
 * User-related type definitions
 */

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  password_hash: z.string(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
  is_findable: sqliteBoolean.default(true),
  age: z.number().default(2226),
  age_secs: z.number().default(192371963),
  is_soft_banned: sqliteBoolean.default(false),
  show_flag_warning: sqliteBoolean.default(false),
  area_count: z.number().default(1),
  thing_tag_count: z.number().default(1),
  all_things_clonable: sqliteBoolean.default(true),
  has_edit_tools: sqliteBoolean.default(true),
  has_edit_tools_permanently: sqliteBoolean.default(false),
  edit_tools_expiry_date: z.string().default('9999-12-31T23:59:59.999Z'),
  is_in_edit_tools_trial: sqliteBoolean.default(true),
  was_edit_tools_trial_activated: sqliteBoolean.default(true),
  custom_search_words: z.string().default(''),
  attachments: z.string().default('{"0":{"Tid":"58a983128ca4690c104b6404","P":{"x":0,"y":0,"z":-1.4901161193847656e-7},"R":{"x":0,"y":0,"z":0}},"2":{"Tid":"58965e04569548a0132feb5e","P":{"x":-0.07462535798549652,"y":0.17594149708747864,"z":0.13412480056285858},"R":{"x":87.7847671508789,"y":73.62593841552734,"z":99.06474304199219}},"6":{"Tid":"58a25965b5fa68ae13841fb7","P":{"x":-0.03214322030544281,"y":-0.028440749272704124,"z":-0.3240281939506531},"R":{"x":306.4596862792969,"y":87.87753295898438,"z":94.79550170898438}},"7":{"Tid":"58965dfd9e2733c413d68d05","P":{"x":0.0267937108874321,"y":-0.03752899169921875,"z":-0.14691570401191711},"R":{"x":337.77911376953125,"y":263.3216857910156,"z":78.18708038330078}}}'),
  achievements: z.array(z.number()).default([30, 7, 19, 4, 20, 11, 10, 5, 9, 17, 13, 12, 16, 37, 34, 35, 44, 31, 15, 27, 28])
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