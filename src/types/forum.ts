import z from 'zod'

export const ForumListSchema = z.object({
  forums: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      creatorId: z.string(),
      creatorName: z.string(),
      threadCount: z.number(),
      latestCommentDate: z.string().datetime(),
      protectionLevel: z.number(),
      creationDate: z.string().datetime(),
      dialogThingId: z.string().optional(),
      dialogColor: z.string().optional(),
      latestCommentText: z.string().optional(),
      latestCommentUserId: z.string().optional(),
      latestCommentUserName: z.string().optional(),
      id: z.string(),
    }).strict()
  )
}).strict()

export const ForumSchema = z.object({
  name: z.string(),
  description: z.string(),
  creatorId: z.string(),
  creatorName: z.string(),
  threadCount: z.number(),
  latestCommentDate: z.string().datetime(),
  protectionLevel: z.number(),
  creationDate: z.string().datetime(),
  dialogThingId: z.string().optional(),
  dialogColor: z.string().optional(),
  latestCommentText: z.string().optional(),
  latestCommentUserId: z.string().optional(),
  latestCommentUserName: z.string().optional(),
  user_isModerator: z.boolean(),
  user_hasFavorited: z.boolean()
}).strict()

export const ForumForumThreadSchema = z.object({
  forumId: z.string(),
  title: z.string(),
  titleClarification: z.string().optional(),
  creatorId: z.string(),
  creatorName: z.string(),
  latestCommentDate: z.string().datetime(),
  commentCount: z.number(),
  isLocked: z.boolean(),
  isSticky: z.boolean(),
  creationDate: z.string().datetime(),
  latestCommentText: z.string(),
  latestCommentUserId: z.string(),
  latestCommentUserName: z.string(),
  id: z.string()
}).strict()

export const CommentSchema = z.object({
  date: z.string().datetime(),
  userId: z.string(),
  userName: z.string(),
  text: z.string(),
  lastEditedDate: z.string().optional(),
  likes: z.array(z.string()).optional(),
  oldestLikes: z.array(z.object({ id: z.string(), n: z.string() })).optional(),
  newestLikes: z.array(z.object({ id: z.string(), n: z.string() })).optional(),
  totalLikes: z.number().optional(),
  thingId: z.string().optional(),
}).strict()

export const ThreadsSchema = z.object({
  ok: z.boolean(),
  forum: ForumSchema.extend({ id: z.string() }),
  thread: z.object({
    forumId: z.string(),
    title: z.string(),
    titleClarification: z.string().optional(),
    creatorId: z.string(),
    creatorName: z.string(),
    latestCommentDate: z.string().datetime(),
    commentCount: z.number(),
    comments: z.array(CommentSchema),
    isLocked: z.boolean(),
    isSticky: z.boolean(),
    creationDate: z.string().datetime(),
    latestCommentText: z.string(),
    latestCommentUserId: z.string(),
    latestCommentUserName: z.string(),
    id: z.string()
  }).strict()
}).strict()

export const ForumForumSchema = z.object({
  ok: z.boolean(),
  forum: ForumSchema,
  threads: z.array(ForumForumThreadSchema),
  stickies: z.array(ForumForumThreadSchema),
}).strict()

// Export TypeScript types
export type Forum = z.infer<typeof ForumSchema>
export type ForumThread = z.infer<typeof ForumForumThreadSchema>
export type Comment = z.infer<typeof CommentSchema>
export type ForumList = z.infer<typeof ForumListSchema>
export type Threads = z.infer<typeof ThreadsSchema>
export type ForumForum = z.infer<typeof ForumForumSchema>