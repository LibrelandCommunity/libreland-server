import { Database } from 'bun:sqlite';
import { AreaInfoMetadata, AreaInfoMetadataSchema } from '../types/area';
import * as path from 'node:path';
import * as fs from 'node:fs';

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

export interface AreaInfoMetadataOperations {
  insert: (params: AreaInfoMetadata) => void;
  update: (params: AreaInfoMetadata) => void;
  findById: (id: string) => AreaInfoMetadata | undefined;
  findByUrlName: (urlName: string) => AreaInfoMetadata | undefined;
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

    CREATE TABLE IF NOT EXISTS area_info_metadata (
      id TEXT PRIMARY KEY,
      editors TEXT NOT NULL,
      copied_from_areas TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      url_name TEXT,
      creator_id TEXT,
      created_at TEXT,
      updated_at TEXT,
      is_zero_gravity BOOLEAN,
      has_floating_dust BOOLEAN,
      is_copyable BOOLEAN,
      is_excluded BOOLEAN NOT NULL DEFAULT false,
      rename_count INTEGER NOT NULL DEFAULT 0,
      copied_count INTEGER NOT NULL DEFAULT 0,
      is_favorited BOOLEAN NOT NULL DEFAULT false
    );

    CREATE INDEX IF NOT EXISTS idx_area_metadata_name ON area_metadata(name);
    CREATE INDEX IF NOT EXISTS idx_area_metadata_url_name ON area_metadata(url_name);
    CREATE INDEX IF NOT EXISTS idx_area_metadata_creator ON area_metadata(creator_id);
    CREATE INDEX IF NOT EXISTS idx_area_info_metadata_name ON area_info_metadata(name);
    CREATE INDEX IF NOT EXISTS idx_area_info_metadata_url_name ON area_info_metadata(url_name);
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

export function createAreaInfoOperations(db: Database): AreaInfoMetadataOperations {
  return {
    insert: (params) => {
      const validatedParams = AreaInfoMetadataSchema.parse(params);
      const stmt = db.prepare(`
        INSERT INTO area_info_metadata (
          id, editors, copied_from_areas, name, description, url_name,
          creator_id, created_at, updated_at, is_zero_gravity,
          has_floating_dust, is_copyable, is_excluded,
          rename_count, copied_count, is_favorited
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        validatedParams.id,
        JSON.stringify(validatedParams.editors),
        JSON.stringify(validatedParams.copiedFromAreas),
        validatedParams.name,
        validatedParams.description || null,
        validatedParams.urlName || null,
        validatedParams.creatorId || null,
        validatedParams.createdAt || null,
        validatedParams.updatedAt || null,
        validatedParams.isZeroGravity === true ? 1 : null,
        validatedParams.hasFloatingDust === true ? 1 : null,
        validatedParams.isCopyable === true ? 1 : null,
        validatedParams.isExcluded ? 1 : 0,
        validatedParams.renameCount,
        validatedParams.copiedCount,
        validatedParams.isFavorited ? 1 : 0
      );
    },

    update: (params) => {
      const validatedParams = AreaInfoMetadataSchema.parse(params);
      const stmt = db.prepare(`
        UPDATE area_info_metadata
        SET editors = ?,
            copied_from_areas = ?,
            name = ?,
            description = ?,
            url_name = ?,
            creator_id = ?,
            created_at = ?,
            updated_at = ?,
            is_zero_gravity = ?,
            has_floating_dust = ?,
            is_copyable = ?,
            is_excluded = ?,
            rename_count = ?,
            copied_count = ?,
            is_favorited = ?
        WHERE id = ?
      `);

      stmt.run(
        JSON.stringify(validatedParams.editors),
        JSON.stringify(validatedParams.copiedFromAreas),
        validatedParams.name,
        validatedParams.description || null,
        validatedParams.urlName || null,
        validatedParams.creatorId || null,
        validatedParams.createdAt || null,
        validatedParams.updatedAt || null,
        validatedParams.isZeroGravity === true ? 1 : null,
        validatedParams.hasFloatingDust === true ? 1 : null,
        validatedParams.isCopyable === true ? 1 : null,
        validatedParams.isExcluded ? 1 : 0,
        validatedParams.renameCount,
        validatedParams.copiedCount,
        validatedParams.isFavorited ? 1 : 0,
        validatedParams.id
      );
    },

    findById: (id) => {
      const stmt = db.prepare('SELECT * FROM area_info_metadata WHERE id = ?');
      const result = stmt.get(id) as any;
      if (!result) return undefined;

      // Parse JSON strings back to objects
      result.editors = JSON.parse(result.editors);
      result.copied_from_areas = JSON.parse(result.copied_from_areas);

      // Convert snake_case to camelCase
      const camelCaseResult = {
        id: result.id,
        editors: result.editors,
        copiedFromAreas: result.copied_from_areas,
        name: result.name,
        description: result.description,
        urlName: result.url_name,
        creatorId: result.creator_id,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        isZeroGravity: result.is_zero_gravity,
        hasFloatingDust: result.has_floating_dust,
        isCopyable: result.is_copyable,
        isExcluded: result.is_excluded,
        renameCount: result.rename_count,
        copiedCount: result.copied_count,
        isFavorited: result.is_favorited
      };

      return AreaInfoMetadataSchema.parse(camelCaseResult);
    },

    findByUrlName: (urlName) => {
      const stmt = db.prepare('SELECT * FROM area_info_metadata WHERE url_name = ?');
      const result = stmt.get(urlName) as any;
      if (!result) return undefined;

      // Parse JSON strings back to objects
      result.editors = JSON.parse(result.editors);
      result.copied_from_areas = JSON.parse(result.copied_from_areas);

      // Convert snake_case to camelCase
      const camelCaseResult = {
        id: result.id,
        editors: result.editors,
        copiedFromAreas: result.copied_from_areas,
        name: result.name,
        description: result.description,
        urlName: result.url_name,
        creatorId: result.creator_id,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        isZeroGravity: result.is_zero_gravity,
        hasFloatingDust: result.has_floating_dust,
        isCopyable: result.is_copyable,
        isExcluded: result.is_excluded,
        renameCount: result.rename_count,
        copiedCount: result.copied_count,
        isFavorited: result.is_favorited
      };

      return AreaInfoMetadataSchema.parse(camelCaseResult);
    },

    delete: (id) => {
      const stmt = db.prepare('DELETE FROM area_info_metadata WHERE id = ?');
      stmt.run(id);
    }
  };
}

export function loadAreaInfoFiles(db: Database) {
  const areaInfoOps = createAreaInfoOperations(db);
  const infoDir = path.join(process.cwd(), 'data', 'area', 'info');

  try {
    const files = fs.readdirSync(infoDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(infoDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const areaId = file.replace('.json', '');

        // Find owner from editors if creatorId is not present
        const owner = data.editors?.find((editor: any) => editor.isOwner);
        const creatorId = data.creatorId || owner?.id;

        const areaInfo: AreaInfoMetadata = {
          id: areaId,
          editors: data.editors.map((editor: any) => ({
            id: editor.id,
            name: editor.name,
            isOwner: editor.isOwner
          })),
          copiedFromAreas: data.copiedFromAreas?.map((area: any) => ({
            id: area.id,
            name: area.name
          })) || [],
          name: data.name,
          description: data.description,
          urlName: data.urlName || areaId, // Use areaId as fallback
          creatorId,
          createdAt: data.createdAt || new Date().toISOString(), // Use current time as fallback
          updatedAt: data.updatedAt || new Date().toISOString(), // Use current time as fallback
          isZeroGravity: data.isZeroGravity,
          hasFloatingDust: data.hasFloatingDust,
          isCopyable: data.isCopyable,
          isExcluded: data.isExcluded || false,
          renameCount: data.renameCount || 0,
          copiedCount: data.copiedCount || 0,
          isFavorited: data.isFavorited || false
        };

        // Validate and insert/update the area info
        try {
          const existing = areaInfoOps.findById(areaId);
          if (existing) {
            areaInfoOps.update(areaInfo);
          } else {
            areaInfoOps.insert(areaInfo);
          }
        } catch (e) {
          console.error(`Error validating/saving area info for ${areaId}:`, e);
          console.error('Data:', JSON.stringify(areaInfo, null, 2));
        }
      } catch (e) {
        console.error(`Error processing area info file ${file}:`, e);
      }
    }
  } catch (e) {
    console.error('Error reading area info directory:', e);
  }
}