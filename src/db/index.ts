import { Database } from 'bun:sqlite';
import * as path from 'node:path';
import { initializeAreaTables, createAreaOperations, createAreaInfoOperations, loadAreaInfoFiles, AreaMetadata, AreaMetadataOperations, AreaInfoMetadataOperations } from './area';
import { initializeUserTables, createUserOperations, UserMetadataOperations } from './user';
import { initializePersonTables, createPersonOperations, PersonMetadataOperations } from './person';
import { PersonMetadata } from '../types/person-db';
import { SqliteBoolean } from '../types/db';
import * as fs from 'fs';

// Check if database exists
const dbPath = path.join(process.cwd(), 'data', 'libreland.db');
const isNewDatabase = !fs.existsSync(dbPath);

// Initialize database with optimized settings
const db = new Database(dbPath);

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
initializePersonTables(db);

// Create operations
export const areaMetadataOps = createAreaOperations(db);
export const areaInfoMetadataOps = createAreaInfoOperations(db);
export const userMetadataOps = createUserOperations(db);
export const personMetadataOps = createPersonOperations(db);

// Only load data if this is a new database
if (isNewDatabase) {
  // Load data from files
  console.log('Populating database with archive data, please be patient this may take a few minutes...');

  // Load area data
  console.log('Loading area info files...');
  loadAreaInfoFiles(db);

  // Load area metadata from load files
  console.log('Loading area metadata from load files...');
  const loadAreaMetadata = () => {
    const loadDir = path.join(process.cwd(), 'data', 'area', 'load');
    try {
      const files = fs.readdirSync(loadDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(loadDir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          const areaId = file.replace('.json', '');

          if (data.ok) {
            // Create a unique URL name by appending a number if needed
            let baseUrlName = data.areaName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            let urlName = baseUrlName;
            let counter = 1;

            while (true) {
              const existing = areaMetadataOps.findByUrlName(urlName);
              if (!existing || existing.id === areaId) {
                break;
              }
              urlName = `${baseUrlName}-${counter}`;
              counter++;
            }

            const areaMetadata: AreaMetadata = {
              id: areaId,
              name: data.areaName,
              urlName,
              creatorId: data.areaCreatorId,
              isPrivate: data.isPrivate,
              playerCount: 0
            };

            const existing = areaMetadataOps.findById(areaId);
            if (existing) {
              areaMetadataOps.update(areaMetadata);
            } else {
              areaMetadataOps.insert(areaMetadata);
            }
          }
        } catch (e) {
          console.error(`Error processing area load file ${file}:`, e);
        }
      }
    } catch (e) {
      console.error('Error reading area load directory:', e);
    }
  };

  // Load person data
  console.log('Loading person data...');
  const loadPersonData = () => {
    const personDir = path.join(process.cwd(), 'data', 'person');

    // Load person info
    const infoDir = path.join(personDir, 'info');
    try {
      const files = fs.readdirSync(infoDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(infoDir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          const personId = file.replace('.json', '');

          // Generate a unique screen name
          let baseScreenName = data.screenName || `User_${personId.slice(0, 8)}`;
          let screenName = baseScreenName;
          let counter = 1;

          // Keep trying until we find a unique screen name
          while (true) {
            const existing = personMetadataOps.findByScreenName(screenName);
            if (!existing) {
              break;
            }
            screenName = `${baseScreenName}_${counter}`;
            counter++;
          }

          // Set default values for required fields if they're missing
          const personMetadata: PersonMetadata = {
            id: personId,
            screen_name: screenName,
            age: data.age || 0,
            status_text: data.statusText || '',
            is_findable: data.isFindable === true ? 1 : 0,
            is_banned: data.isBanned === true ? 1 : 0,
            last_activity_on: data.lastActivityOn || new Date().toISOString()
          };

          const existing = personMetadataOps.findById(personId);
          if (!existing) {
            try {
              personMetadataOps.insert(personMetadata);
            } catch (e) {
              console.error(`Error inserting person ${personId}:`, e);
            }
          }
        } catch (e) {
          console.error(`Error processing person info file ${file}:`, e);
        }
      }
    } catch (e) {
      console.error('Error reading person info directory:', e);
    }

    // Load person gifts
    const giftDir = path.join(personDir, 'gift');
    try {
      const files = fs.readdirSync(giftDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(giftDir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          const personId = file.replace('.json', '');

          // Ensure we have an array of gifts
          const gifts = Array.isArray(data) ? data : (data.gifts || []);

          for (const gift of gifts) {
            try {
              // Skip if gift is missing required data
              if (!gift || !gift.id || !gift.thingId) {
                console.error(`Skipping invalid gift for person ${personId}, missing required fields:`, gift);
                continue;
              }

              personMetadataOps.insertGift({
                id: gift.id,
                personId,
                thingId: gift.thingId,
                rotationX: Number(gift.rotationX || 0),
                rotationY: Number(gift.rotationY || 0),
                rotationZ: Number(gift.rotationZ || 0),
                positionX: Number(gift.positionX || 0),
                positionY: Number(gift.positionY || 0),
                positionZ: Number(gift.positionZ || 0),
                dateSent: gift.dateSent || new Date().toISOString(),
                senderId: gift.senderId || '',
                senderName: gift.senderName || '',
                wasSeenByReceiver: gift.wasSeenByReceiver ? 1 : 0,
                isPrivate: gift.isPrivate ? 1 : 0
              });
            } catch (e) {
              console.error(`Error inserting gift for person ${personId}:`, e);
            }
          }
        } catch (e) {
          console.error(`Error processing person gift file ${file}:`, e);
        }
      }
    } catch (e) {
      console.error('Error reading person gift directory:', e);
    }

    // Load person areas
    const areaSearchDir = path.join(personDir, 'areasearch');
    try {
      const files = fs.readdirSync(areaSearchDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(areaSearchDir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          const personId = file.replace('.json', '');

          // Process public areas
          for (const area of data.areas) {
            try {
              personMetadataOps.insertArea({
                personId,
                areaId: area.id,
                areaName: area.name,
                playerCount: area.playerCount || 0,
                isPrivate: 0
              });
            } catch (e) {
              console.error(`Error inserting public area for person ${personId}:`, e);
            }
          }

          // Process private areas
          for (const area of data.ownPrivateAreas) {
            try {
              personMetadataOps.insertArea({
                personId,
                areaId: area.id,
                areaName: area.name,
                playerCount: area.playerCount || 0,
                isPrivate: 1
              });
            } catch (e) {
              console.error(`Error inserting private area for person ${personId}:`, e);
            }
          }
        } catch (e) {
          console.error(`Error processing person areasearch file ${file}:`, e);
        }
      }
    } catch (e) {
      console.error('Error reading person areasearch directory:', e);
    }

    // Load person topby
    const topbyDir = path.join(personDir, 'topby');
    try {
      const files = fs.readdirSync(topbyDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(topbyDir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          const personId = file.replace('.json', '');

          data.ids.forEach((thingId: string, index: number) => {
            try {
              personMetadataOps.insertTopBy(personId, thingId, index);
            } catch (e) {
              console.error(`Error inserting topby for person ${personId}:`, e);
            }
          });
        } catch (e) {
          console.error(`Error processing person topby file ${file}:`, e);
        }
      }
    } catch (e) {
      console.error('Error reading person topby directory:', e);
    }
  };

  // Load user data
  console.log('Loading user data...');
  const loadUserData = async () => {
    const personDir = path.join(process.cwd(), 'data', 'person');
    const infoDir = path.join(personDir, 'info');

    try {
      const files = fs.readdirSync(infoDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(infoDir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          const userId = file.replace('.json', '');

          // Skip if no username
          if (!data.username) {
            // console.log(`Skipping user ${userId} - no username found`);
            continue;
          }

          // Create a basic password for imported users
          const defaultPassword = 'imported_user_' + userId;

          try {
            await userMetadataOps.insert({
              username: data.username,
              password: defaultPassword,
              person_id: userId, // Use the person ID as the user ID
              is_findable: Number(Boolean(data.isFindable)) as SqliteBoolean,
              age: data.age || 0,
              age_secs: data.ageSecs || 0,
              is_soft_banned: Number(Boolean(data.isSoftBanned)) as SqliteBoolean,
              show_flag_warning: Number(Boolean(data.showFlagWarning)) as SqliteBoolean,
              area_count: data.areaCount || 0,
              thing_tag_count: data.thingTagCount || 0,
              all_things_clonable: Number(Boolean(data.allThingsClonable)) as SqliteBoolean,
              has_edit_tools: Number(Boolean(data.hasEditTools)) as SqliteBoolean,
              has_edit_tools_permanently: Number(Boolean(data.hasEditToolsPermanently)) as SqliteBoolean,
              edit_tools_expiry_date: data.editToolsExpiryDate || '9999-12-31T23:59:59.999Z',
              is_in_edit_tools_trial: Number(Boolean(data.isInEditToolsTrial)) as SqliteBoolean,
              was_edit_tools_trial_activated: Number(Boolean(data.wasEditToolsTrialActivated)) as SqliteBoolean,
              custom_search_words: data.customSearchWords || '',
              attachments: data.attachments || '{}',
              achievements: data.achievements || [],
              status_text: data.statusText || ''
            });
          } catch (e) {
            console.error(`Error inserting user ${userId}:`, e);
          }
        } catch (e) {
          console.error(`Error processing user info file ${file}:`, e);
        }
      }
    } catch (e) {
      console.error('Error reading person info directory:', e);
    }
  };

  // Load area metadata from load files
  loadAreaMetadata();
  loadPersonData();
  await loadUserData();
}

// Re-export types
export type { AreaMetadata, AreaMetadataOperations, AreaInfoMetadataOperations };
export type { UserMetadataOperations };
export type { PersonMetadata, PersonMetadataOperations };

// Export database instance for other operations
export const getDb = () => db;