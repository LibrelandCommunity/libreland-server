import { Database, SQLQueryBindings } from 'bun:sqlite';
import { Forum, ForumThread, Comment } from '../types/forum';
import { SqliteBoolean } from '../types/db';
import { generateObjectId } from '../utils/id';

export interface ForumMetadataOperations {
  insert: (params: Forum & { id: string }) => void;
  update: (params: Forum & { id: string }) => void;
  findById: (id: string) => (Forum & { id: string }) | undefined;
  findByName: (name: string) => (Forum & { id: string }) | undefined;
  insertThread: (params: ForumThread) => void;
  updateThread: (params: ForumThread) => void;
  findThreadById: (id: string) => ForumThread | undefined;
  insertComment: (threadId: string, params: Comment) => void;
  updateComment: (threadId: string, params: Comment) => void;
  findCommentsByThreadId: (threadId: string) => Comment[];
}

export function initializeForumTables(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS forum_metadata (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      creator_name TEXT NOT NULL,
      thread_count INTEGER NOT NULL DEFAULT 0,
      latest_comment_date TEXT,
      protection_level INTEGER NOT NULL DEFAULT 0,
      creation_date TEXT NOT NULL,
      dialog_thing_id TEXT,
      dialog_color TEXT,
      latest_comment_text TEXT,
      latest_comment_user_id TEXT,
      latest_comment_user_name TEXT,
      UNIQUE(name)
    );

    CREATE TABLE IF NOT EXISTS forum_threads (
      id TEXT PRIMARY KEY,
      forum_id TEXT NOT NULL,
      title TEXT NOT NULL,
      title_clarification TEXT,
      creator_id TEXT NOT NULL,
      creator_name TEXT NOT NULL,
      latest_comment_date TEXT,
      comment_count INTEGER NOT NULL DEFAULT 0,
      is_locked BOOLEAN NOT NULL DEFAULT 0,
      is_sticky BOOLEAN NOT NULL DEFAULT 0,
      creation_date TEXT NOT NULL,
      latest_comment_text TEXT,
      latest_comment_user_id TEXT,
      latest_comment_user_name TEXT,
      FOREIGN KEY(forum_id) REFERENCES forum_metadata(id)
    );

    CREATE TABLE IF NOT EXISTS forum_comments (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      date TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      text TEXT NOT NULL,
      last_edited_date TEXT,
      total_likes INTEGER NOT NULL DEFAULT 0,
      thing_id TEXT,
      FOREIGN KEY(thread_id) REFERENCES forum_threads(id)
    );

    CREATE TABLE IF NOT EXISTS forum_comment_likes (
      comment_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      PRIMARY KEY(comment_id, user_id),
      FOREIGN KEY(comment_id) REFERENCES forum_comments(id)
    );

    CREATE INDEX IF NOT EXISTS idx_forum_metadata_name ON forum_metadata(name);
    CREATE INDEX IF NOT EXISTS idx_forum_threads_forum_id ON forum_threads(forum_id);
    CREATE INDEX IF NOT EXISTS idx_forum_comments_thread_id ON forum_comments(thread_id);
    CREATE INDEX IF NOT EXISTS idx_forum_comment_likes_comment_id ON forum_comment_likes(comment_id);
  `);
}

export function createForumOperations(db: Database): ForumMetadataOperations {
  return {
    insert: (params) => {
      const stmt = db.prepare(`
        INSERT INTO forum_metadata (
          id, name, description, creator_id, creator_name, thread_count,
          latest_comment_date, protection_level, creation_date, dialog_thing_id,
          dialog_color, latest_comment_text, latest_comment_user_id, latest_comment_user_name
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        params.id,
        params.name,
        params.description,
        params.creatorId,
        params.creatorName,
        params.threadCount,
        params.latestCommentDate,
        params.protectionLevel,
        params.creationDate,
        params.dialogThingId ?? null,
        params.dialogColor ?? null,
        params.latestCommentText ?? null,
        params.latestCommentUserId ?? null,
        params.latestCommentUserName ?? null
      );
    },

    update: (params) => {
      const stmt = db.prepare(`
        UPDATE forum_metadata
        SET name = ?, description = ?, creator_id = ?, creator_name = ?,
            thread_count = ?, latest_comment_date = ?, protection_level = ?,
            creation_date = ?, dialog_thing_id = ?, dialog_color = ?,
            latest_comment_text = ?, latest_comment_user_id = ?, latest_comment_user_name = ?
        WHERE id = ?
      `);

      stmt.run(
        params.name,
        params.description,
        params.creatorId,
        params.creatorName,
        params.threadCount,
        params.latestCommentDate,
        params.protectionLevel,
        params.creationDate,
        params.dialogThingId ?? null,
        params.dialogColor ?? null,
        params.latestCommentText ?? null,
        params.latestCommentUserId ?? null,
        params.latestCommentUserName ?? null,
        params.id
      );
    },

    insertThread: (params) => {
      const stmt = db.prepare(`
        INSERT INTO forum_threads (
          id, forum_id, title, title_clarification, creator_id, creator_name,
          latest_comment_date, comment_count, is_locked, is_sticky, creation_date,
          latest_comment_text, latest_comment_user_id, latest_comment_user_name
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        params.id,
        params.forumId,
        params.title,
        params.titleClarification ?? null,
        params.creatorId,
        params.creatorName,
        params.latestCommentDate,
        params.commentCount,
        Number(params.isLocked) as SqliteBoolean,
        Number(params.isSticky) as SqliteBoolean,
        params.creationDate,
        params.latestCommentText ?? null,
        params.latestCommentUserId ?? null,
        params.latestCommentUserName ?? null
      );
    },

    updateThread: (params) => {
      const stmt = db.prepare(`
        UPDATE forum_threads
        SET forum_id = ?, title = ?, title_clarification = ?, creator_id = ?,
            creator_name = ?, latest_comment_date = ?, comment_count = ?,
            is_locked = ?, is_sticky = ?, creation_date = ?, latest_comment_text = ?,
            latest_comment_user_id = ?, latest_comment_user_name = ?
        WHERE id = ?
      `);

      stmt.run(
        params.forumId,
        params.title,
        params.titleClarification ?? null,
        params.creatorId,
        params.creatorName,
        params.latestCommentDate,
        params.commentCount,
        Number(params.isLocked) as SqliteBoolean,
        Number(params.isSticky) as SqliteBoolean,
        params.creationDate,
        params.latestCommentText ?? null,
        params.latestCommentUserId ?? null,
        params.latestCommentUserName ?? null,
        params.id
      );
    },

    insertComment: (threadId, params) => {
      const commentId = generateObjectId();

      const stmt = db.prepare(`
        INSERT INTO forum_comments (
          id, thread_id, date, user_id, user_name, text,
          last_edited_date, total_likes, thing_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        commentId,
        threadId,
        params.date,
        params.userId,
        params.userName,
        params.text,
        params.lastEditedDate ?? null,
        params.totalLikes || 0,
        params.thingId ?? null
      );

      if (params.likes && params.likes.length > 0) {
        const likesStmt = db.prepare(`
          INSERT INTO forum_comment_likes (comment_id, user_id, user_name)
          VALUES (?, ?, ?)
        `);

        const oldestLikes = params.oldestLikes || [];
        for (let i = 0; i < params.likes.length; i++) {
          likesStmt.run(
            commentId,
            params.likes[i],
            oldestLikes[i]?.n || ''
          );
        }
      }
    },

    updateComment: (threadId, params) => {
      const stmt = db.prepare(`
        UPDATE forum_comments
        SET date = ?, user_id = ?, user_name = ?, text = ?,
            last_edited_date = ?, total_likes = ?, thing_id = ?
        WHERE thread_id = ? AND user_id = ? AND date = ?
      `);

      stmt.run(
        params.date,
        params.userId,
        params.userName,
        params.text,
        params.lastEditedDate ?? null,
        params.totalLikes || 0,
        params.thingId ?? null,
        threadId,
        params.userId,
        params.date
      );
    },

    findById: (id) => {
      const stmt = db.prepare(`
        SELECT * FROM forum_metadata WHERE id = ?
      `);

      const row = stmt.get(id) as any;
      if (!row) return undefined;

      return {
        id: row.id,
        name: row.name,
        description: row.description,
        creatorId: row.creator_id,
        creatorName: row.creator_name,
        threadCount: row.thread_count,
        latestCommentDate: row.latest_comment_date,
        protectionLevel: row.protection_level,
        creationDate: row.creation_date,
        dialogThingId: row.dialog_thing_id,
        dialogColor: row.dialog_color,
        latestCommentText: row.latest_comment_text,
        latestCommentUserId: row.latest_comment_user_id,
        latestCommentUserName: row.latest_comment_user_name,
        user_isModerator: false,
        user_hasFavorited: false
      };
    },

    findByName: (name) => {
      const stmt = db.prepare(`
        SELECT * FROM forum_metadata WHERE name = ?
      `);

      const row = stmt.get(name) as any;
      if (!row) return undefined;

      return {
        id: row.id,
        name: row.name,
        description: row.description,
        creatorId: row.creator_id,
        creatorName: row.creator_name,
        threadCount: row.thread_count,
        latestCommentDate: row.latest_comment_date,
        protectionLevel: row.protection_level,
        creationDate: row.creation_date,
        dialogThingId: row.dialog_thing_id,
        dialogColor: row.dialog_color,
        latestCommentText: row.latest_comment_text,
        latestCommentUserId: row.latest_comment_user_id,
        latestCommentUserName: row.latest_comment_user_name,
        user_isModerator: false,
        user_hasFavorited: false
      };
    },

    findThreadById: (id) => {
      const stmt = db.prepare(`
        SELECT * FROM forum_threads WHERE id = ?
      `);

      const row = stmt.get(id) as any;
      if (!row) return undefined;

      return {
        id: row.id,
        forumId: row.forum_id,
        title: row.title,
        titleClarification: row.title_clarification,
        creatorId: row.creator_id,
        creatorName: row.creator_name,
        latestCommentDate: row.latest_comment_date,
        commentCount: row.comment_count,
        isLocked: Boolean(row.is_locked),
        isSticky: Boolean(row.is_sticky),
        creationDate: row.creation_date,
        latestCommentText: row.latest_comment_text,
        latestCommentUserId: row.latest_comment_user_id,
        latestCommentUserName: row.latest_comment_user_name
      };
    },

    findCommentsByThreadId: (threadId) => {
      const stmt = db.prepare(`
        SELECT c.*, GROUP_CONCAT(l.user_id) as likes, GROUP_CONCAT(l.user_name) as like_names
        FROM forum_comments c
        LEFT JOIN forum_comment_likes l ON c.id = l.comment_id
        WHERE c.thread_id = ?
        GROUP BY c.id
        ORDER BY c.date ASC
      `);

      const rows = stmt.all(threadId) as any[];
      return rows.map(row => ({
        date: row.date,
        userId: row.user_id,
        userName: row.user_name,
        text: row.text,
        lastEditedDate: row.last_edited_date,
        likes: row.likes ? row.likes.split(',') : [],
        oldestLikes: row.likes ? row.likes.split(',').map((id: string, i: number) => ({
          id,
          n: row.like_names.split(',')[i]
        })) : [],
        newestLikes: [],
        totalLikes: row.total_likes,
        thingId: row.thing_id
      }));
    }
  };
}