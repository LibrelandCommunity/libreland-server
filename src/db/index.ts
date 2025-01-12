import { Database } from 'bun:sqlite';
import * as path from 'node:path';
import { initializeAreaTables, createAreaOperations, AreaMetadata, AreaMetadataOperations } from './area';
import { initializeUserTables, createUserOperations, UserMetadataOperations } from './user';

// Initialize database with optimized settings
const db = new Database(path.join(process.cwd(), 'data', 'libreland.db'));

// Performance and durability settings
db.exec('PRAGMA journal_mode = WAL'); // Write-Ahead Logging for better concurrency
db.exec('PRAGMA synchronous = NORMAL'); // Sync less often for better performance while maintaining safety
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA cache_size = -64000'); // 64MB cache
db.exec('PRAGMA page_size = 4096'); // Optimal page size for most SSDs
db.exec('PRAGMA temp_store = MEMORY'); // Store temp tables and indices in memory
db.exec('PRAGMA mmap_size = 30000000000'); // 30GB memory map
db.exec('PRAGMA busy_timeout = 5000'); // Wait up to 5s when the database is busy

// Initialize all tables
initializeAreaTables(db);
initializeUserTables(db);

// Create operations
export const areaMetadataOps = createAreaOperations(db);
export const userMetadataOps = createUserOperations(db);

// Re-export types
export type { AreaMetadata, AreaMetadataOperations };
export type { UserMetadataOperations };

// Export database instance for other operations
export const getDb = () => db;