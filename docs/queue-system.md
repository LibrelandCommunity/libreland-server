# Queue System

The Libreland server uses NSQ for queue management to handle the archival of content from Anyland. This document describes the queue system and how it processes different types of content.

## Queue Overview

The system uses several NSQ queues to manage different types of content:

- `al_things`: Thing processing
- `al_players`: User data processing
- `al_areas`: Area processing
- `al_placements`: Placement processing
- `al_threads`: Forum thread processing

## Queue Configuration

The NSQ system requires the following environment variables:
- `ANYLAND_COOKIE`: Authentication cookie for Anyland API access
- `NSQD_HOST`: NSQ daemon host address
- Default NSQ port: 4150

## Queue Handlers

### Thing Processing (`al_things`)
Handles:
- Thing definitions
- Thing metadata
- Thing tags
- Nested thing references

```typescript
mkQueueReader("al_things", "archiver", async (id, msg) => {
  await downloadItemDefAndCrawlForNestedIds(id);
  await downloadItemInfo(id);
  msg.finish();
});
```

### Player Processing (`al_players`)
Handles:
- User information
- Gift history
- Top creations
- Created areas

```typescript
mkQueueReader("al_players", "personinfo", async (id, msg) => {
  await downloadPersonInfo(id);
  msg.finish();
});
```

### Area Processing (`al_areas`)
Handles:
- Area information
- Area load data
- Area bundles
- Subarea relationships

```typescript
mkQueueReader("al_areas", "area_info", async (id, msg) => {
  await downloadAreaInfo(id);
  msg.finish();
});
```

### Placement Processing (`al_placements`)
Handles:
- Placement information within areas
- Position and rotation data
- Placer information

```typescript
// Special handling for placements as they require both areaId and placementId
const [areaId, placementId] = body.split(',');
await downloadPlacementInfo({ areaId, placementId });
```

### Thread Processing (`al_threads`)
Handles:
- Forum threads
- Comments
- Content references

```typescript
mkQueueReader("al_threads", "threads", async (id, msg) => {
  await downloadThread(id);
  msg.finish();
});
```

## Queue Writers

The system includes writer functions to enqueue new items:

```typescript
const {
  enqueueThing,
  enqueuePlayer,
  enqueueArea,
  enqueueForum,
  enqueueThread,
  enqueuePlacement
} = await mkWriter(NSQD_HOST, NSQD_PORT);
```

## Content Processing Flow

1. Content is discovered through API requests
2. Referenced content is identified
3. New content is enqueued using writer functions
4. Queue handlers process the content
5. Content is saved to appropriate directories
6. Additional references are discovered and enqueued

## Error Handling

- Failed requests are requeued up to 10 times
- Errors are logged for debugging
- Queue state is maintained across server restarts

## Rate Limiting

Different content types have different rate limits:
- Thing definitions: 700ms
- Thing info: 1000ms
- Area info: 2000ms
- Placement info: 3000ms
- Thread info: 2000ms