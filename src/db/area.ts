import { Database } from 'bun:sqlite';

export interface AreaMetadata {
  id: string;
  name: string;
  description?: string;
  urlName: string;
  creatorId?: string;
  createdAt?: number;
  updatedAt?: number;
  isPrivate?: boolean;
  playerCount?: number;
}

export interface AreaMetadataOperations {
  insert: (params: AreaMetadata) => void;
  update: (params: AreaMetadata) => void;
  findById: (id: string) => AreaMetadata | undefined;
  findByUrlName: (urlName: string) => AreaMetadata | undefined;
  search: (term: string, limit: number) => AreaMetadata[];
  updatePlayerCount: (id: string, count: number) => void;
  delete: (id: string) => void;
}

export function initializeAreaTables(db: Database) {
  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS area_metadata (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      url_name TEXT UNIQUE,
      creator_id TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      is_private BOOLEAN DEFAULT false,
      player_count INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_area_metadata_name ON area_metadata(name);
    CREATE INDEX IF NOT EXISTS idx_area_metadata_url_name ON area_metadata(url_name);
    CREATE INDEX IF NOT EXISTS idx_area_metadata_creator ON area_metadata(creator_id);
  `);
}

export function createAreaOperations(db: Database): AreaMetadataOperations {
  return {
    insert: (params) => {
      const stmt = db.prepare(`
        INSERT INTO area_metadata (id, name, description, url_name, creator_id, created_at, updated_at, is_private, player_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        params.id,
        params.name,
        params.description || null,
        params.urlName,
        params.creatorId || null,
        params.createdAt || null,
        params.updatedAt || null,
        params.isPrivate || false,
        params.playerCount || 0
      );
    },

    update: (params) => {
      const stmt = db.prepare(`
        UPDATE area_metadata
        SET name = ?,
            description = ?,
            url_name = ?,
            creator_id = ?,
            updated_at = ?,
            is_private = ?,
            player_count = ?
        WHERE id = ?
      `);
      stmt.run(
        params.name,
        params.description || null,
        params.urlName,
        params.creatorId || null,
        params.updatedAt || null,
        params.isPrivate || false,
        params.playerCount || 0,
        params.id
      );
    },

    findById: (id) => {
      const stmt = db.prepare('SELECT * FROM area_metadata WHERE id = ?');
      return stmt.get(id) as AreaMetadata | undefined;
    },

    findByUrlName: (urlName) => {
      const stmt = db.prepare('SELECT * FROM area_metadata WHERE url_name = ?');
      return stmt.get(urlName) as AreaMetadata | undefined;
    },

    search: (term, limit) => {
      const stmt = db.prepare(`
        SELECT * FROM area_metadata
        WHERE name LIKE ?
        AND (is_private = false OR is_private IS NULL)
        ORDER BY player_count DESC
        LIMIT ?
      `);
      return stmt.all(`%${term}%`, limit) as AreaMetadata[];
    },

    updatePlayerCount: (id, count) => {
      const stmt = db.prepare('UPDATE area_metadata SET player_count = ? WHERE id = ?');
      stmt.run(count, id);
    },

    delete: (id) => {
      const stmt = db.prepare('DELETE FROM area_metadata WHERE id = ?');
      stmt.run(id);
    }
  };
}