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

export interface AreaBundleMetadata {
  id: string;
  areaId: string;
  bundleKey: string;
  thingDefinitions: Array<{
    id: string;
    def: string;
    serveTime: number;
  }>;
}

export interface SubareaMetadata {
  id: string;
  parentAreaId: string;
  name: string;
  description?: string;
}

export interface AreaInfoMetadataOperations {
  insert: (params: AreaInfoMetadata) => void;
  update: (params: AreaInfoMetadata) => void;
  findById: (id: string) => AreaInfoMetadata | undefined;
  findByUrlName: (urlName: string) => AreaInfoMetadata | undefined;
  delete: (id: string) => void;
}

export interface AreaBundleMetadataOperations {
  insert: (params: AreaBundleMetadata) => void;
  update: (params: AreaBundleMetadata) => void;
  findById: (id: string) => AreaBundleMetadata | undefined;
  findByAreaId: (areaId: string) => AreaBundleMetadata[];
  delete: (id: string) => void;
}

export interface SubareaMetadataOperations {
  insert: (params: SubareaMetadata) => void;
  update: (params: SubareaMetadata) => void;
  findById: (id: string) => SubareaMetadata | undefined;
  findByParentAreaId: (parentAreaId: string) => SubareaMetadata[];
  delete: (id: string) => void;
}

export interface AreaInfoMetadataOperations {
  insert: (params: AreaInfoMetadata) => void;
  update: (params: AreaInfoMetadata) => void;
  findById: (id: string) => AreaInfoMetadata | undefined;
  findByUrlName: (urlName: string) => AreaInfoMetadata | undefined;
  delete: (id: string) => void;
}

export interface AreaLoadData {
  id: string;
  areaId: string;
  rawData: string;
}

export interface AreaLoadDataOperations {
  insert: (params: AreaLoadData) => void;
  update: (params: AreaLoadData) => void;
  findById: (id: string) => AreaLoadData | undefined;
  findByAreaId: (areaId: string) => AreaLoadData | undefined;
  delete: (id: string) => void;
}

export interface AreaMetadataOperations {
  insert: (params: AreaMetadata) => void;
  update: (params: AreaMetadata) => void;
  findById: (id: string) => AreaMetadata | undefined;
  findByUrlName: (urlName: string) => AreaMetadata | undefined;
  search: (term: string, limit: number) => { areas: AreaMetadata[]; ownPrivateAreas: AreaMetadata[] };
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

    CREATE TABLE IF NOT EXISTS area_bundle_metadata (
      id TEXT PRIMARY KEY,
      area_id TEXT NOT NULL,
      bundle_key TEXT NOT NULL,
      thing_definitions TEXT NOT NULL,
      raw_data TEXT NOT NULL,
      FOREIGN KEY(area_id) REFERENCES area_metadata(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS area_load_data (
      id TEXT PRIMARY KEY,
      area_id TEXT NOT NULL,
      raw_data TEXT NOT NULL,
      FOREIGN KEY(area_id) REFERENCES area_metadata(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS subarea_metadata (
      id TEXT PRIMARY KEY,
      parent_area_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY(parent_area_id) REFERENCES area_metadata(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_area_metadata_name ON area_metadata(name);
    CREATE INDEX IF NOT EXISTS idx_area_metadata_url_name ON area_metadata(url_name);
    CREATE INDEX IF NOT EXISTS idx_area_metadata_creator ON area_metadata(creator_id);
    CREATE INDEX IF NOT EXISTS idx_area_info_metadata_name ON area_info_metadata(name);
    CREATE INDEX IF NOT EXISTS idx_area_info_metadata_url_name ON area_info_metadata(url_name);
    CREATE INDEX IF NOT EXISTS idx_area_bundle_metadata_area_id ON area_bundle_metadata(area_id);
    CREATE INDEX IF NOT EXISTS idx_area_load_data_area_id ON area_load_data(area_id);
    CREATE INDEX IF NOT EXISTS idx_subarea_metadata_parent_area_id ON subarea_metadata(parent_area_id);
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
        SELECT i.id, i.name, i.description, COALESCE(m.url_name, i.url_name) as url_name,
               COALESCE(m.creator_id, i.creator_id) as creator_id,
               COALESCE(m.created_at, i.created_at) as created_at,
               COALESCE(m.updated_at, i.updated_at) as updated_at,
               COALESCE(m.is_private, false) as is_private,
               COALESCE(m.player_count, 0) as player_count,
               i.editors
        FROM area_info_metadata i
        LEFT JOIN area_metadata m ON i.id = m.id
        WHERE (i.name LIKE ? OR i.description LIKE ?)
        ORDER BY COALESCE(m.player_count, 0) DESC
        LIMIT ?
      `);
      const searchTerm = `%${term}%`;
      const rawResults = stmt.all(searchTerm, searchTerm, limit) as Array<{
        id: string;
        name: string;
        description: string | null;
        url_name: string;
        creator_id: string | null;
        created_at: number | null;
        updated_at: number | null;
        is_private: boolean;
        player_count: number;
        editors: string;
      }>;

      // Split results into public and private owned areas
      const publicAreas: AreaMetadata[] = [];
      const ownPrivateAreas: AreaMetadata[] = [];

      for (const raw of rawResults) {
        const editors = JSON.parse(raw.editors || '[]');
        const isOwner = editors.some((editor: any) => editor.isOwner);
        const isNonOwnerEditor = editors.some((editor: any) => !editor.isOwner);

        const area: AreaMetadata = {
          id: raw.id,
          name: raw.name,
          description: raw.description || undefined,
          urlName: raw.url_name,
          creatorId: raw.creator_id || undefined,
          createdAt: raw.created_at || undefined,
          updatedAt: raw.updated_at || undefined,
          isPrivate: raw.is_private,
          playerCount: raw.player_count
        };

        if (raw.is_private) {
          if (isOwner || isNonOwnerEditor) {
            ownPrivateAreas.push(area);
          }
          // Skip private areas where we're neither owner nor editor
        } else {
          publicAreas.push(area);
        }
      }

      return {
        areas: publicAreas,
        ownPrivateAreas
      };
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

export function createAreaBundleOperations(db: Database): AreaBundleMetadataOperations {
  return {
    insert: (params) => {
      const stmt = db.prepare(`
        INSERT INTO area_bundle_metadata (id, area_id, bundle_key, thing_definitions, raw_data)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        params.id,
        params.areaId,
        params.bundleKey,
        JSON.stringify(params.thingDefinitions),
        JSON.stringify(params)
      );
    },

    update: (params) => {
      const stmt = db.prepare(`
        UPDATE area_bundle_metadata
        SET area_id = ?,
            bundle_key = ?,
            thing_definitions = ?,
            raw_data = ?
        WHERE id = ?
      `);
      stmt.run(
        params.areaId,
        params.bundleKey,
        JSON.stringify(params.thingDefinitions),
        JSON.stringify(params),
        params.id
      );
    },

    findById: (id) => {
      const stmt = db.prepare('SELECT * FROM area_bundle_metadata WHERE id = ?');
      const result = stmt.get(id) as any;
      if (!result) return undefined;

      return {
        id: result.id,
        areaId: result.area_id,
        bundleKey: result.bundle_key,
        thingDefinitions: JSON.parse(result.thing_definitions)
      };
    },

    findByAreaId: (areaId) => {
      const stmt = db.prepare('SELECT * FROM area_bundle_metadata WHERE area_id = ?');
      const results = stmt.all(areaId) as any[];
      return results.map(result => ({
        id: result.id,
        areaId: result.area_id,
        bundleKey: result.bundle_key,
        thingDefinitions: JSON.parse(result.thing_definitions)
      }));
    },

    delete: (id) => {
      const stmt = db.prepare('DELETE FROM area_bundle_metadata WHERE id = ?');
      stmt.run(id);
    }
  };
}

export function createSubareaOperations(db: Database): SubareaMetadataOperations {
  return {
    insert: (params) => {
      const stmt = db.prepare(`
        INSERT INTO subarea_metadata (id, parent_area_id, name, description)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(
        params.id,
        params.parentAreaId,
        params.name,
        params.description || null
      );
    },

    update: (params) => {
      const stmt = db.prepare(`
        UPDATE subarea_metadata
        SET parent_area_id = ?,
            name = ?,
            description = ?
        WHERE id = ?
      `);
      stmt.run(
        params.parentAreaId,
        params.name,
        params.description || null,
        params.id
      );
    },

    findById: (id) => {
      const stmt = db.prepare('SELECT * FROM subarea_metadata WHERE id = ?');
      const result = stmt.get(id) as any;
      if (!result) return undefined;

      return {
        id: result.id,
        parentAreaId: result.parent_area_id,
        name: result.name,
        description: result.description
      };
    },

    findByParentAreaId: (parentAreaId) => {
      const stmt = db.prepare('SELECT * FROM subarea_metadata WHERE parent_area_id = ?');
      const results = stmt.all(parentAreaId) as any[];
      return results.map(result => ({
        id: result.id,
        parentAreaId: result.parent_area_id,
        name: result.name,
        description: result.description
      }));
    },

    delete: (id) => {
      const stmt = db.prepare('DELETE FROM subarea_metadata WHERE id = ?');
      stmt.run(id);
    }
  };
}

export function createAreaLoadDataOperations(db: Database): AreaLoadDataOperations {
  return {
    insert: (params) => {
      const stmt = db.prepare(`
        INSERT INTO area_load_data (id, area_id, raw_data)
        VALUES (?, ?, ?)
      `);
      stmt.run(
        params.id,
        params.areaId,
        params.rawData
      );
    },

    update: (params) => {
      const stmt = db.prepare(`
        UPDATE area_load_data
        SET area_id = ?,
            raw_data = ?
        WHERE id = ?
      `);
      stmt.run(
        params.areaId,
        params.rawData,
        params.id
      );
    },

    findById: (id) => {
      const stmt = db.prepare('SELECT * FROM area_load_data WHERE id = ?');
      const result = stmt.get(id) as any;
      if (!result) return undefined;

      return {
        id: result.id,
        areaId: result.area_id,
        rawData: result.raw_data
      };
    },

    findByAreaId: (areaId) => {
      const stmt = db.prepare('SELECT * FROM area_load_data WHERE area_id = ?');
      const result = stmt.get(areaId) as any;
      if (!result) return undefined;

      return {
        id: result.id,
        areaId: result.area_id,
        rawData: result.raw_data
      };
    },

    delete: (id) => {
      const stmt = db.prepare('DELETE FROM area_load_data WHERE id = ?');
      stmt.run(id);
    }
  };
}

export function loadAreaInfoFiles(db: Database) {
  const areaInfoOps = createAreaInfoOperations(db);
  const areaOps = createAreaOperations(db);
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

        // Create a unique URL name by appending a number if needed
        let baseUrlName = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let urlName = baseUrlName;
        let counter = 1;

        while (true) {
          const existing = areaInfoOps.findByUrlName(urlName);
          if (!existing || existing.id === areaId) {
            break;
          }
          urlName = `${baseUrlName}-${counter}`;
          counter++;
        }

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
          urlName: urlName,
          creatorId,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          isZeroGravity: data.isZeroGravity,
          hasFloatingDust: data.hasFloatingDust,
          isCopyable: data.isCopyable,
          isExcluded: data.isExcluded || false,
          renameCount: data.renameCount || 0,
          copiedCount: data.copiedCount || 0,
          isFavorited: data.isFavorited || false
        };

        // Also create area metadata entry
        const areaMetadata: AreaMetadata = {
          id: areaId,
          name: data.name,
          description: data.description,
          urlName: urlName,
          creatorId,
          createdAt: data.createdAt ? new Date(data.createdAt).getTime() : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt).getTime() : undefined,
          isPrivate: false, // Default to false, will be updated from load file if needed
          playerCount: 0
        };

        // Validate and insert/update the area info
        try {
          const existingInfo = areaInfoOps.findById(areaId);
          if (existingInfo) {
            areaInfoOps.update(areaInfo);
          } else {
            areaInfoOps.insert(areaInfo);
          }

          // Insert/update area metadata
          const existingArea = areaOps.findById(areaId);
          if (existingArea) {
            areaOps.update(areaMetadata);
          } else {
            areaOps.insert(areaMetadata);
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

export function loadAreaBundleFiles(db: Database) {
  const bundleOps = createAreaBundleOperations(db);
  const bundleDir = path.join(process.cwd(), 'data', 'area', 'bundle');

  try {
    // Read area directories
    const areaDirs = fs.readdirSync(bundleDir);
    for (const areaId of areaDirs) {
      const areaPath = path.join(bundleDir, areaId);
      if (!fs.statSync(areaPath).isDirectory()) continue;

      try {
        // Read bundle files in area directory
        const files = fs.readdirSync(areaPath);
        for (const file of files) {
          if (!file.endsWith('.json')) continue;

          const filePath = path.join(areaPath, file);
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);
            const bundleKey = file.replace('.json', '');
            const bundleId = `${areaId}_${bundleKey}`;

            try {
              const bundle: AreaBundleMetadata = {
                id: bundleId,
                areaId,
                bundleKey,
                thingDefinitions: data.thingDefinitions.map((def: any) => ({
                  id: def.id,
                  def: def.def,
                  serveTime: def.serveTime || 0
                }))
              };

              // Store both the processed bundle and the raw data
              const stmt = db.prepare(`
                INSERT OR REPLACE INTO area_bundle_metadata (id, area_id, bundle_key, thing_definitions, raw_data)
                VALUES (?, ?, ?, ?, ?)
              `);
              stmt.run(
                bundleId,
                areaId,
                bundleKey,
                JSON.stringify(bundle.thingDefinitions),
                content // Store the original JSON content
              );
            } catch (e) {
              console.error(`Error inserting/updating bundle ${bundleId}:`, e);
            }
          } catch (e) {
            console.error(`Error processing bundle file ${file}:`, e);
          }
        }
      } catch (e) {
        console.error(`Error reading bundles for area ${areaId}:`, e);
      }
    }
  } catch (e) {
    console.error('Error reading bundle directory:', e);
  }
}

export function loadAreaSubareaFiles(db: Database) {
  const subareaOps = createSubareaOperations(db);
  const areaOps = createAreaOperations(db);
  const subareaDir = path.join(process.cwd(), 'data', 'area', 'subareas');

  try {
    const files = fs.readdirSync(subareaDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(subareaDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const parentAreaId = file.replace('.json', '');

        // Skip if parent area doesn't exist
        if (!areaOps.findById(parentAreaId)) {
          console.warn(`Skipping subareas for non-existent area ${parentAreaId}`);
          continue;
        }

        // Process each subarea
        for (const subarea of data.subAreas || []) {
          try {
            const subareaMetadata: SubareaMetadata = {
              id: subarea.id,
              parentAreaId,
              name: subarea.name,
              description: subarea.description
            };

            const existing = subareaOps.findById(subarea.id);
            if (existing) {
              subareaOps.update(subareaMetadata);
            } else {
              subareaOps.insert(subareaMetadata);
            }
          } catch (e) {
            console.error(`Error inserting/updating subarea ${subarea.id} for area ${parentAreaId}:`, e);
          }
        }
      } catch (e) {
        console.error(`Error processing subarea file ${file}:`, e);
      }
    }
  } catch (e) {
    console.error('Error reading subarea directory:', e);
  }
}

export function loadAreaLoadFiles(db: Database) {
  const loadDataOps = createAreaLoadDataOperations(db);
  const loadDir = path.join(process.cwd(), 'data', 'area', 'load');

  try {
    const files = fs.readdirSync(loadDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(loadDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const areaId = file.replace('.json', '');

        try {
          const loadData: AreaLoadData = {
            id: areaId,
            areaId,
            rawData: content
          };

          const existing = loadDataOps.findById(areaId);
          if (existing) {
            loadDataOps.update(loadData);
          } else {
            loadDataOps.insert(loadData);
          }
        } catch (e) {
          console.error(`Error inserting/updating load data for area ${areaId}:`, e);
        }
      } catch (e) {
        console.error(`Error processing area load file ${file}:`, e);
      }
    }
  } catch (e) {
    console.error('Error reading area load directory:', e);
  }
}