import { Database } from 'bun:sqlite';
import { ThingDef, ThingInfo, ThingTag, ThingDefSchema, ThingInfoSchema, ThingTagSchema } from '../types/item';
import * as path from 'node:path';
import * as fs from 'node:fs';

export interface ThingMetadataOperations {
  insertDef: (params: ThingDef) => void;
  updateDef: (params: ThingDef) => void;
  findDefById: (id: string) => ThingDef | undefined;
  deleteDef: (id: string) => void;

  insertInfo: (params: ThingInfo) => void;
  updateInfo: (params: ThingInfo) => void;
  findInfoById: (id: string) => ThingInfo | undefined;
  deleteInfo: (id: string) => void;

  insertTag: (params: ThingTag) => void;
  updateTag: (params: ThingTag) => void;
  findTagById: (id: string) => ThingTag | undefined;
  deleteTag: (id: string) => void;

  search: (term: string, limit: number) => ThingInfo[];
}

export function initializeThingTables(db: Database) {
  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS thing_def (
      id TEXT PRIMARY KEY,
      name TEXT,
      version TEXT,
      attributes TEXT NOT NULL,
      parts TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS thing_info (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      creator_name TEXT,
      created_days_ago INTEGER NOT NULL,
      collected_count INTEGER NOT NULL DEFAULT 0,
      placed_count INTEGER NOT NULL DEFAULT 0,
      cloned_from_id TEXT,
      all_creators_things_clonable BOOLEAN NOT NULL DEFAULT false,
      is_unlisted BOOLEAN NOT NULL DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS thing_tag (
      id TEXT PRIMARY KEY,
      tags TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_thing_def_name ON thing_def(name);
    CREATE INDEX IF NOT EXISTS idx_thing_info_name ON thing_info(name);
    CREATE INDEX IF NOT EXISTS idx_thing_info_creator ON thing_info(creator_id);
  `);
}

export function createThingOperations(db: Database): ThingMetadataOperations {
  return {
    insertDef: (params) => {
      const validatedParams = ThingDefSchema.parse(params);
      const stmt = db.prepare(`
        INSERT INTO thing_def (id, name, version, attributes, parts)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        validatedParams.id,
        validatedParams.name || null,
        validatedParams.version || null,
        JSON.stringify(validatedParams.attributes || []),
        JSON.stringify(validatedParams.parts)
      );
    },

    updateDef: (params) => {
      const validatedParams = ThingDefSchema.parse(params);
      const stmt = db.prepare(`
        UPDATE thing_def
        SET name = ?,
            version = ?,
            attributes = ?,
            parts = ?
        WHERE id = ?
      `);
      stmt.run(
        validatedParams.name || null,
        validatedParams.version || null,
        JSON.stringify(validatedParams.attributes || []),
        JSON.stringify(validatedParams.parts),
        validatedParams.id
      );
    },

    findDefById: (id) => {
      const stmt = db.prepare('SELECT * FROM thing_def WHERE id = ?');
      const result = stmt.get(id) as any;
      if (!result) return undefined;

      return ThingDefSchema.parse({
        id: result.id,
        name: result.name,
        version: result.version,
        attributes: JSON.parse(result.attributes),
        parts: JSON.parse(result.parts)
      });
    },

    deleteDef: (id) => {
      const stmt = db.prepare('DELETE FROM thing_def WHERE id = ?');
      stmt.run(id);
    },

    insertInfo: (params) => {
      const validatedParams = ThingInfoSchema.parse(params);
      const stmt = db.prepare(`
        INSERT INTO thing_info (
          id, name, creator_id, creator_name, created_days_ago,
          collected_count, placed_count, cloned_from_id,
          all_creators_things_clonable, is_unlisted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        validatedParams.id,
        validatedParams.name,
        validatedParams.creatorId,
        validatedParams.creatorName,
        validatedParams.createdDaysAgo,
        validatedParams.collectedCount,
        validatedParams.placedCount,
        validatedParams.clonedFromId || null,
        validatedParams.allCreatorsThingsClonable ? 1 : 0,
        validatedParams.isUnlisted ? 1 : 0
      );
    },

    updateInfo: (params) => {
      const validatedParams = ThingInfoSchema.parse(params);
      const stmt = db.prepare(`
        UPDATE thing_info
        SET name = ?,
            creator_id = ?,
            creator_name = ?,
            created_days_ago = ?,
            collected_count = ?,
            placed_count = ?,
            cloned_from_id = ?,
            all_creators_things_clonable = ?,
            is_unlisted = ?
        WHERE id = ?
      `);
      stmt.run(
        validatedParams.name,
        validatedParams.creatorId,
        validatedParams.creatorName,
        validatedParams.createdDaysAgo,
        validatedParams.collectedCount,
        validatedParams.placedCount,
        validatedParams.clonedFromId || null,
        validatedParams.allCreatorsThingsClonable ? 1 : 0,
        validatedParams.isUnlisted ? 1 : 0,
        validatedParams.id
      );
    },

    findInfoById: (id) => {
      const stmt = db.prepare('SELECT * FROM thing_info WHERE id = ?');
      const result = stmt.get(id) as any;
      if (!result) return undefined;

      return ThingInfoSchema.parse({
        id: result.id,
        name: result.name,
        creatorId: result.creator_id,
        creatorName: result.creator_name,
        createdDaysAgo: result.created_days_ago,
        collectedCount: result.collected_count,
        placedCount: result.placed_count,
        clonedFromId: result.cloned_from_id,
        allCreatorsThingsClonable: Boolean(result.all_creators_things_clonable),
        isUnlisted: Boolean(result.is_unlisted)
      });
    },

    deleteInfo: (id) => {
      const stmt = db.prepare('DELETE FROM thing_info WHERE id = ?');
      stmt.run(id);
    },

    insertTag: (params) => {
      const validatedParams = ThingTagSchema.parse(params);
      const stmt = db.prepare(`
        INSERT INTO thing_tag (id, tags)
        VALUES (?, ?)
      `);
      stmt.run(
        validatedParams.id,
        JSON.stringify(validatedParams.tags)
      );
    },

    updateTag: (params) => {
      const validatedParams = ThingTagSchema.parse(params);
      const stmt = db.prepare(`
        UPDATE thing_tag
        SET tags = ?
        WHERE id = ?
      `);
      stmt.run(
        JSON.stringify(validatedParams.tags),
        validatedParams.id
      );
    },

    findTagById: (id) => {
      const stmt = db.prepare('SELECT * FROM thing_tag WHERE id = ?');
      const result = stmt.get(id) as any;
      if (!result) return undefined;

      return ThingTagSchema.parse({
        id: result.id,
        tags: JSON.parse(result.tags)
      });
    },

    deleteTag: (id) => {
      const stmt = db.prepare('DELETE FROM thing_tag WHERE id = ?');
      stmt.run(id);
    },

    search: (term, limit) => {
      const stmt = db.prepare(`
        SELECT * FROM thing_info
        WHERE name LIKE ?
        AND (is_unlisted = false OR is_unlisted IS NULL)
        ORDER BY collected_count DESC
        LIMIT ?
      `);
      const results = stmt.all(`%${term}%`, limit) as any[];
      return results.map(result => ThingInfoSchema.parse({
        id: result.id,
        name: result.name,
        creatorId: result.creator_id,
        creatorName: result.creator_name,
        createdDaysAgo: result.created_days_ago,
        collectedCount: result.collected_count,
        placedCount: result.placed_count,
        clonedFromId: result.cloned_from_id,
        allCreatorsThingsClonable: Boolean(result.all_creators_things_clonable),
        isUnlisted: Boolean(result.is_unlisted)
      }));
    }
  };
}

export function loadThingFiles(db: Database) {
  const thingOps = createThingOperations(db);
  const thingDir = path.join(process.cwd(), 'data', 'thing');

  // Load thing definitions
  const defDir = path.join(thingDir, 'def');
  try {
    const files = fs.readdirSync(defDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(defDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (!content || content.trim() === '') {
          continue;
        }

        const data = JSON.parse(content);
        const missingFields = [];
        if (!data.p) missingFields.push('p (parts)');

        if (missingFields.length > 0) {
          console.error(`Thing definition ${file} missing fields: ${missingFields.join(', ')}`);
          console.error('Data:', JSON.stringify(data, null, 2));
          continue;
        }

        const thingId = file.replace('.json', '');

        const thingDef: ThingDef = {
          id: thingId,
          name: data.n || "Thing",
          version: data.v?.toString(),
          attributes: data.a?.map(String) || [],
          parts: data.p.map((part: any) => ({
            blockType: String(part.b),
            shapes: part.s.map((shape: any) => ({
              position: shape.p,
              rotation: shape.r,
              scale: shape.s,
              color: shape.c
            }))
          }))
        };

        try {
          const existing = thingOps.findDefById(thingId);
          if (existing) {
            thingOps.updateDef(thingDef);
          } else {
            thingOps.insertDef(thingDef);
          }
        } catch (e) {
          console.error(`Error validating/saving thing def for ${thingId}:`, e);
        }
      } catch (e) {
        console.error(`Error processing thing def file ${file}:`, e);
      }
    }
  } catch (e) {
    console.error('Error reading thing def directory:', e);
  }

  // Load thing info
  const infoDir = path.join(thingDir, 'info');
  try {
    const files = fs.readdirSync(infoDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(infoDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (!content || content.trim() === '') {
          continue;
        }

        const data = JSON.parse(content);
        if (!data) {
          continue;
        }

        const thingId = file.replace('.json', '');

        const thingInfo: ThingInfo = {
          id: thingId,
          name: data.name,
          creatorId: data.creatorId,
          creatorName: data.creatorName || null,
          createdDaysAgo: data.createdDaysAgo || 0,
          collectedCount: data.collectedCount || 0,
          placedCount: data.placedCount || 0,
          clonedFromId: data.clonedFromId || null,
          allCreatorsThingsClonable: data.allCreatorsThingsClonable || false,
          isUnlisted: data.isUnlisted || false
        };

        try {
          const existing = thingOps.findInfoById(thingId);
          if (existing) {
            thingOps.updateInfo(thingInfo);
          } else {
            thingOps.insertInfo(thingInfo);
          }
        } catch (e) {
          console.error(`Error validating/saving thing info for ${thingId}:`, e);
        }
      } catch (e) {
        console.error(`Error processing thing info file ${file}:`, e);
      }
    }
  } catch (e) {
    console.error('Error reading thing info directory:', e);
  }

  // Load thing tags
  const tagsDir = path.join(thingDir, 'tags');
  try {
    const files = fs.readdirSync(tagsDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(tagsDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const thingId = file.replace('.json', '');

        const thingTags: ThingTag = {
          id: thingId,
          tags: data.tags.map((tag: any) => ({
            tag: tag.tag,
            userId: tag.userId || "unknown",
            userName: tag.userName || "Unknown User"
          }))
        };

        try {
          const existing = thingOps.findTagById(thingId);
          if (existing) {
            thingOps.updateTag(thingTags);
          } else {
            thingOps.insertTag(thingTags);
          }
        } catch (e) {
          console.error(`Error validating/saving thing tags for ${thingId}:`, e);
        }
      } catch (e) {
        console.error(`Error processing thing tags file ${file}:`, e);
      }
    }
  } catch (e) {
    console.error('Error reading thing tags directory:', e);
  }
}