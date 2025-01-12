import { z } from 'zod';

// SQLite stores booleans as integers (0 or 1)
export const sqliteBoolean = z.union([z.literal(0), z.literal(1)]);

// Type for SQLite boolean values
export type SqliteBoolean = 0 | 1;