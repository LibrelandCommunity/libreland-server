import { Database } from 'bun:sqlite';
import { PlacementInfo, PlacementInfoSchema } from '../types/item';
import * as path from 'node:path';
import * as fs from 'node:fs';

export interface PlacementMetadataOperations {
  insert: (areaId: string, placementId: string, params: PlacementInfo) => void;
  findById: (areaId: string, placementId: string) => PlacementInfo | undefined;
  findByAreaId: (areaId: string) => PlacementInfo[];
  delete: (areaId: string, placementId: string) => void;
}

export function initializePlacementTables(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS placement_metadata (
      area_id TEXT NOT NULL,
      placement_id TEXT NOT NULL,
      placer_id TEXT NOT NULL,
      placer_name TEXT,
      placed_days_ago INTEGER NOT NULL,
      copied_via TEXT,
      PRIMARY KEY(area_id, placement_id)
    );

    CREATE INDEX IF NOT EXISTS idx_placement_metadata_area_id ON placement_metadata(area_id);
    CREATE INDEX IF NOT EXISTS idx_placement_metadata_placer_id ON placement_metadata(placer_id);
  `);
}

export function createPlacementOperations(db: Database): PlacementMetadataOperations {
  return {
    insert: (areaId, placementId, params) => {
      const validatedParams = PlacementInfoSchema.parse(params);
      const stmt = db.prepare(`
        INSERT INTO placement_metadata (
          area_id, placement_id, placer_id, placer_name, placed_days_ago, copied_via
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        areaId,
        placementId,
        validatedParams.placerId,
        validatedParams.placerName,
        validatedParams.placedDaysAgo,
        validatedParams.copiedVia || null
      );
    },

    findById: (areaId, placementId) => {
      const stmt = db.prepare('SELECT * FROM placement_metadata WHERE area_id = ? AND placement_id = ?');
      const result = stmt.get(areaId, placementId) as any;
      if (!result) return undefined;

      // Convert snake_case to camelCase
      const camelCaseResult = {
        placerId: result.placer_id,
        placerName: result.placer_name,
        placedDaysAgo: result.placed_days_ago,
        copiedVia: result.copied_via
      };

      return PlacementInfoSchema.parse(camelCaseResult);
    },

    findByAreaId: (areaId) => {
      const stmt = db.prepare('SELECT * FROM placement_metadata WHERE area_id = ?');
      const results = stmt.all(areaId) as any[];

      return results.map(result => {
        // Convert snake_case to camelCase
        const camelCaseResult = {
          placerId: result.placer_id,
          placerName: result.placer_name,
          placedDaysAgo: result.placed_days_ago,
          copiedVia: result.copied_via
        };

        return PlacementInfoSchema.parse(camelCaseResult);
      });
    },

    delete: (areaId, placementId) => {
      const stmt = db.prepare('DELETE FROM placement_metadata WHERE area_id = ? AND placement_id = ?');
      stmt.run(areaId, placementId);
    }
  };
}

export function loadPlacementFiles(db: Database) {
  const placementOps = createPlacementOperations(db);
  const placementDir = path.join(process.cwd(), 'data', 'placement', 'info');

  try {
    // Read area directories
    const areaDirs = fs.readdirSync(placementDir);
    for (const areaId of areaDirs) {
      const areaPath = path.join(placementDir, areaId);
      if (!fs.statSync(areaPath).isDirectory()) continue;

      try {
        // Read placement files in area directory
        const files = fs.readdirSync(areaPath);
        for (const file of files) {
          if (!file.endsWith('.json')) continue;

          const filePath = path.join(areaPath, file);
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);
            const placementId = file.replace('.json', '');

            try {
              placementOps.insert(areaId, placementId, {
                placerId: data.placerId,
                placerName: data.placerName,
                placedDaysAgo: data.placedDaysAgo,
                copiedVia: data.copiedVia
              });
            } catch (e) {
              console.error(`Error inserting placement ${placementId} in area ${areaId}:`, e);
            }
          } catch (e) {
            console.error(`Error processing placement file ${file}:`, e);
          }
        }
      } catch (e) {
        console.error(`Error reading placements for area ${areaId}:`, e);
      }
    }
  } catch (e) {
    console.error('Error reading placement directory:', e);
  }
}