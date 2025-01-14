import { Database } from 'bun:sqlite';
import { PersonMetadataSchema, PersonGiftSchema, PersonAreaSchema, PersonTopBySchema, PersonMetadata, PersonGift, PersonArea } from '../types/person-db';

export interface PersonMetadataOperations {
  insert: (params: PersonMetadata) => void;
  findById: (id: string) => PersonMetadata | undefined;
  findByScreenName: (screenName: string) => PersonMetadata | undefined;
  insertGift: (gift: PersonGift) => void;
  getGifts: (personId: string) => PersonGift[];
  insertArea: (area: PersonArea) => void;
  getAreas: (personId: string) => PersonArea[];
  insertTopBy: (personId: string, thingId: string, rank: number) => void;
  getTopBy: (personId: string) => string[];
  insertFriend: (personId: string, friendId: string, strength?: number) => void;
  getFriendsByStrength: (personId: string) => Array<PersonMetadata & { strength?: number, isOnline: boolean }>;
}

export function initializePersonTables(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS person_metadata (
      id TEXT PRIMARY KEY,
      screen_name TEXT NOT NULL,
      age INTEGER,
      status_text TEXT,
      is_findable BOOLEAN,
      is_banned BOOLEAN,
      last_activity_on TEXT,
      UNIQUE(screen_name)
    );

    CREATE TABLE IF NOT EXISTS person_gifts (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      thing_id TEXT NOT NULL,
      rotation_x REAL NOT NULL,
      rotation_y REAL NOT NULL,
      rotation_z REAL NOT NULL,
      position_x REAL NOT NULL,
      position_y REAL NOT NULL,
      position_z REAL NOT NULL,
      date_sent TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      was_seen_by_receiver BOOLEAN NOT NULL,
      is_private BOOLEAN NOT NULL,
      FOREIGN KEY(person_id) REFERENCES person_metadata(id)
    );

    CREATE TABLE IF NOT EXISTS person_areas (
      person_id TEXT NOT NULL,
      area_id TEXT NOT NULL,
      area_name TEXT NOT NULL,
      player_count INTEGER NOT NULL DEFAULT 0,
      is_private BOOLEAN NOT NULL DEFAULT false,
      PRIMARY KEY(person_id, area_id),
      FOREIGN KEY(person_id) REFERENCES person_metadata(id)
    );

    CREATE TABLE IF NOT EXISTS person_topby (
      person_id TEXT NOT NULL,
      thing_id TEXT NOT NULL,
      rank INTEGER NOT NULL,
      PRIMARY KEY(person_id, thing_id),
      FOREIGN KEY(person_id) REFERENCES person_metadata(id)
    );

    CREATE TABLE IF NOT EXISTS person_friends (
      person_id TEXT NOT NULL,
      friend_id TEXT NOT NULL,
      strength INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(person_id, friend_id),
      FOREIGN KEY(person_id) REFERENCES person_metadata(id),
      FOREIGN KEY(friend_id) REFERENCES person_metadata(id)
    );

    CREATE INDEX IF NOT EXISTS idx_person_metadata_screen_name ON person_metadata(screen_name);
    CREATE INDEX IF NOT EXISTS idx_person_gifts_person_id ON person_gifts(person_id);
    CREATE INDEX IF NOT EXISTS idx_person_areas_person_id ON person_areas(person_id);
    CREATE INDEX IF NOT EXISTS idx_person_topby_person_id ON person_topby(person_id);
    CREATE INDEX IF NOT EXISTS idx_person_friends_person_id ON person_friends(person_id);
  `);
}

export function populateInitialFriendData(db: Database, userId: string, friendsData: any) {
  const ops = createPersonOperations(db);

  // First ensure all friends exist in person_metadata
  const allFriends = [
    ...(friendsData.online?.friends || []),
    ...(friendsData.offline?.friends || [])
  ];

  for (const friend of allFriends) {
    try {
      ops.insert({
        id: friend.id,
        screen_name: friend.screenName,
        status_text: friend.statusText,
        last_activity_on: friend.lastActivityOn
      });
    } catch (e: any) {
      // Ignore duplicate key errors
      if (!e.toString().includes('UNIQUE constraint failed')) {
        throw e;
      }
    }
  }

  // Then create friend relationships
  for (const friend of allFriends) {
    try {
      ops.insertFriend(userId, friend.id, friend.strength);
    } catch (e: any) {
      // Ignore duplicate key errors
      if (!e.toString().includes('UNIQUE constraint failed')) {
        throw e;
      }
    }
  }
}

export function createPersonOperations(db: Database): PersonMetadataOperations {
  return {
    insert: (params) => {
      const validatedParams = PersonMetadataSchema.parse(params);
      const stmt = db.prepare(`
        INSERT INTO person_metadata (
          id, screen_name, age, status_text, is_findable, is_banned, last_activity_on
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        validatedParams.id,
        validatedParams.screen_name,
        validatedParams.age ?? null,
        validatedParams.status_text ?? null,
        validatedParams.is_findable ?? null,
        validatedParams.is_banned ?? null,
        validatedParams.last_activity_on ?? null
      );
    },

    findById: (id) => {
      const stmt = db.prepare('SELECT * FROM person_metadata WHERE id = ?');
      const person = stmt.get(id) as PersonMetadata | undefined;
      return person ? PersonMetadataSchema.parse(person) : undefined;
    },

    findByScreenName: (screenName) => {
      const stmt = db.prepare('SELECT * FROM person_metadata WHERE screen_name = ?');
      const person = stmt.get(screenName) as PersonMetadata | undefined;
      return person ? PersonMetadataSchema.parse(person) : undefined;
    },

    insertGift: (gift) => {
      const validatedGift = PersonGiftSchema.parse(gift);
      const stmt = db.prepare(`
        INSERT INTO person_gifts (
          id, person_id, thing_id, rotation_x, rotation_y, rotation_z,
          position_x, position_y, position_z, date_sent, sender_id,
          sender_name, was_seen_by_receiver, is_private
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        validatedGift.id,
        validatedGift.personId,
        validatedGift.thingId,
        validatedGift.rotationX,
        validatedGift.rotationY,
        validatedGift.rotationZ,
        validatedGift.positionX,
        validatedGift.positionY,
        validatedGift.positionZ,
        validatedGift.dateSent,
        validatedGift.senderId,
        validatedGift.senderName,
        validatedGift.wasSeenByReceiver,
        validatedGift.isPrivate
      );
    },

    getGifts: (personId) => {
      const stmt = db.prepare('SELECT * FROM person_gifts WHERE person_id = ?');
      const gifts = stmt.all(personId) as PersonGift[];
      return gifts.map(gift => PersonGiftSchema.parse(gift));
    },

    insertArea: (area) => {
      const validatedArea = PersonAreaSchema.parse(area);
      const stmt = db.prepare(`
        INSERT INTO person_areas (
          person_id, area_id, area_name, player_count, is_private
        ) VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(
        validatedArea.personId,
        validatedArea.areaId,
        validatedArea.areaName,
        validatedArea.playerCount,
        validatedArea.isPrivate
      );
    },

    getAreas: (personId) => {
      const query = 'SELECT person_id as personId, area_id as areaId, area_name as areaName, player_count as playerCount, is_private as isPrivate FROM person_areas WHERE person_id = ?';
      const stmt = db.prepare(query);
      const areas = stmt.all(personId) as PersonArea[];
      try {
        return areas.map(area => {
          try {
            return PersonAreaSchema.parse(area);
          } catch (e) {
            console.error("Failed to parse area:", area, "Error:", e);
            throw e;
          }
        });
      } catch (e) {
        console.error("Failed to process areas:", e);
        return [];
      }
    },

    insertTopBy: (personId, thingId, rank) => {
      const validatedData = PersonTopBySchema.parse({ person_id: personId, thing_id: thingId, rank });
      const stmt = db.prepare(`
        INSERT INTO person_topby (person_id, thing_id, rank)
        VALUES (?, ?, ?)
      `);

      stmt.run(
        validatedData.person_id,
        validatedData.thing_id,
        validatedData.rank
      );
    },

    getTopBy: (personId) => {
      const stmt = db.prepare('SELECT thing_id FROM person_topby WHERE person_id = ? ORDER BY rank ASC');
      return stmt.all(personId).map(row => (row as { thing_id: string }).thing_id);
    },

    insertFriend: (personId, friendId, strength) => {
      const stmt = db.prepare(`
        INSERT INTO person_friends (person_id, friend_id, strength)
        VALUES (?, ?, ?)
      `);

      stmt.run(personId, friendId, strength ?? null);
    },

    getFriendsByStrength: (personId) => {
      const stmt = db.prepare(`
        SELECT
          pm.*,
          pf.strength,
          false as isOnline
        FROM person_friends pf
        JOIN person_metadata pm ON pm.id = pf.friend_id
        WHERE pf.person_id = ?
        ORDER BY pf.strength DESC NULLS LAST
      `);

      return stmt.all(personId) as Array<PersonMetadata & { strength?: number, isOnline: boolean }>;
    }
  };
}