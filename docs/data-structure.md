# Data Directory Structure

The data directory contains archived content from Anyland, organized into several subdirectories based on content type. Each subdirectory serves a specific purpose and contains files in JSON format.

## Directory Overview

```
data/
├── thing/              # Thing (object) data
│   ├── def/           # Thing definitions
│   ├── info/          # Thing metadata
│   └── tags/          # Thing tags
├── area/              # Area (world) data
│   ├── info/          # Area information
│   ├── load/          # Area load data
│   ├── bundle/        # Area asset bundles
│   └── subareas/      # Subarea listings
├── placement/         # Placement data
│   └── info/          # Placement information
├── person/            # User data
│   ├── info/          # User information
│   ├── gift/          # Received gifts
│   ├── topby/         # Top creations
│   └── areasearch/    # Created areas
├── forum/             # Forum data
│   ├── forum/         # Forum information
│   └── thread/        # Forum threads
└── libreland.db       # SQLite database
```

## Directory Contents

### `/data/thing/`
Contains information about Anyland things (objects/items)

- **def/** - Thing definitions in JSON format
  - Format: `{thingId}.json`
  - Contains the raw thing data including geometry, materials, and nested thing references
  - See [Thing Format](./thing-format.md) for detailed structure

- **info/** - Metadata about things
  - Format: `{thingId}.json`
  - Contains creator info, creation date, and other metadata

- **tags/** - Thing tags and categorization
  - Format: `{thingId}.json`
  - Contains user-applied tags and the users who applied them

### `/data/area/`
Contains information about Anyland areas (worlds)

- **info/** - Basic area information
  - Format: `{areaId}.json`
  - Contains area name, description, editors, and parent area references

- **load/** - Area load data
  - Format: `{areaId}.json`
  - Contains full area data including placements and configurations

- **bundle/** - Area asset bundles
  - Format: `{areaId}/{areaKey}.json`
  - Contains area resources and assets

- **subareas/** - Subarea listings
  - Format: `{areaId}.json`
  - Lists all subareas contained within an area

### `/data/placement/`
Contains information about placed things within areas

- **info/{areaId}/{placementId}.json**
  - Contains placement data including position, rotation, and placer information
  - References both the area and the placed thing

### `/data/person/`
Contains user-related information

- **info/** - Basic user information
  - Format: `{userId}.json`

- **gift/** - Received gifts
  - Format: `{userId}.json`
  - Lists gifts received including sender and thing references

- **topby/** - Top creations
  - Format: `{userId}.json`
  - Lists most popular things created by the user

- **areasearch/** - Areas created by user
  - Format: `{userId}.json`
  - Lists areas created by the user

### `/data/forum/`
Contains forum-related content

- **forum/** - Forum information
  - Format: `{forumId}.json`

- **thread/** - Forum threads
  - Format: `{threadId}.json`
  - Contains thread content, comments, and associated metadata