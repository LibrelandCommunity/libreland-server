import { Database } from 'bun:sqlite';
import { generateObjectId } from '../utils/id';
import { User, CreateUser, UserSchema } from '../types/user';

export interface UserMetadataOperations {
  insert: (params: CreateUser) => Promise<User>;
  findByUsername: (username: string) => User | undefined;
  findById: (id: string) => User | undefined;
  validatePassword: (username: string, password: string) => Promise<User | undefined>;
}

export function initializeUserTables(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_metadata (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER,
      updated_at INTEGER,
      is_findable BOOLEAN DEFAULT true,
      age INTEGER DEFAULT 2226,
      age_secs INTEGER DEFAULT 192371963,
      is_soft_banned BOOLEAN DEFAULT false,
      show_flag_warning BOOLEAN DEFAULT false,
      area_count INTEGER DEFAULT 1,
      thing_tag_count INTEGER DEFAULT 1,
      all_things_clonable BOOLEAN DEFAULT true,
      has_edit_tools BOOLEAN DEFAULT true,
      has_edit_tools_permanently BOOLEAN DEFAULT false,
      edit_tools_expiry_date TEXT DEFAULT '9999-12-31T23:59:59.999Z',
      is_in_edit_tools_trial BOOLEAN DEFAULT true,
      was_edit_tools_trial_activated BOOLEAN DEFAULT true,
      custom_search_words TEXT DEFAULT '',
      attachments TEXT DEFAULT '{"0":{"Tid":"58a983128ca4690c104b6404","P":{"x":0,"y":0,"z":-1.4901161193847656e-7},"R":{"x":0,"y":0,"z":0}},"2":{"Tid":"58965e04569548a0132feb5e","P":{"x":-0.07462535798549652,"y":0.17594149708747864,"z":0.13412480056285858},"R":{"x":87.7847671508789,"y":73.62593841552734,"z":99.06474304199219}},"6":{"Tid":"58a25965b5fa68ae13841fb7","P":{"x":-0.03214322030544281,"y":-0.028440749272704124,"z":-0.3240281939506531},"R":{"x":306.4596862792969,"y":87.87753295898438,"z":94.79550170898438}},"7":{"Tid":"58965dfd9e2733c413d68d05","P":{"x":0.0267937108874321,"y":-0.03752899169921875,"z":-0.14691570401191711},"R":{"x":337.77911376953125,"y":263.3216857910156,"z":78.18708038330078}}}',
      achievements TEXT DEFAULT '[30,7,19,4,20,11,10,5,9,17,13,12,16,37,34,35,44,31,15,27,28]'
    );

    CREATE INDEX IF NOT EXISTS idx_user_metadata_username ON user_metadata(username);
  `);
}

export function createUserOperations(db: Database): UserMetadataOperations {
  return {
    insert: async (params) => {
      const id = generateObjectId();
      const password_hash = await Bun.password.hash(params.password);
      const now = Date.now();

      const stmt = db.prepare(`
        INSERT INTO user_metadata (
          id, username, password_hash, created_at, updated_at,
          is_findable, age, age_secs, is_soft_banned, show_flag_warning,
          area_count, thing_tag_count, all_things_clonable, has_edit_tools,
          has_edit_tools_permanently, edit_tools_expiry_date, is_in_edit_tools_trial,
          was_edit_tools_trial_activated, custom_search_words, attachments, achievements
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        params.username,
        password_hash,
        now,
        now,
        params.is_findable,
        params.age,
        params.age_secs,
        params.is_soft_banned,
        params.show_flag_warning,
        params.area_count,
        params.thing_tag_count,
        params.all_things_clonable,
        params.has_edit_tools,
        params.has_edit_tools_permanently,
        params.edit_tools_expiry_date,
        params.is_in_edit_tools_trial,
        params.was_edit_tools_trial_activated,
        params.custom_search_words,
        params.attachments,
        JSON.stringify(params.achievements)
      );

      const user = {
        id,
        username: params.username,
        password_hash,
        created_at: now,
        updated_at: now,
        is_findable: params.is_findable,
        age: params.age,
        age_secs: params.age_secs,
        is_soft_banned: Boolean(params.is_soft_banned),
        show_flag_warning: Boolean(params.show_flag_warning),
        area_count: params.area_count,
        thing_tag_count: params.thing_tag_count,
        all_things_clonable: Boolean(params.all_things_clonable),
        has_edit_tools: Boolean(params.has_edit_tools),
        has_edit_tools_permanently: Boolean(params.has_edit_tools_permanently),
        edit_tools_expiry_date: params.edit_tools_expiry_date,
        is_in_edit_tools_trial: Boolean(params.is_in_edit_tools_trial),
        was_edit_tools_trial_activated: Boolean(params.was_edit_tools_trial_activated),
        custom_search_words: params.custom_search_words,
        attachments: params.attachments,
        achievements: params.achievements
      };

      return UserSchema.parse(user);
    },

    findByUsername: (username) => {
      const stmt = db.prepare('SELECT *, json(achievements) as achievements FROM user_metadata WHERE username = ?');
      const user = stmt.get(username) as User | undefined;
      if (user) {
        user.achievements = JSON.parse(user.achievements as unknown as string);
        return UserSchema.parse(user);
      }
      return undefined;
    },

    findById: (id) => {
      const stmt = db.prepare('SELECT *, json(achievements) as achievements FROM user_metadata WHERE id = ?');
      const user = stmt.get(id) as User | undefined;
      if (user) {
        user.achievements = JSON.parse(user.achievements as unknown as string);
        return UserSchema.parse(user);
      }
      return undefined;
    },

    validatePassword: async (username, password) => {
      const stmt = db.prepare('SELECT *, json(achievements) as achievements FROM user_metadata WHERE username = ?');
      const user = stmt.get(username) as User | undefined;
      if (!user) return undefined;

      if (user) {
        user.achievements = JSON.parse(user.achievements as unknown as string);
      }

      const valid = await Bun.password.verify(password, user.password_hash);
      return valid ? UserSchema.parse(user) : undefined;
    }
  };
}

// Re-export types from types/user.ts
export type { User, CreateUser } from '../types/user';