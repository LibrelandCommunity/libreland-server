# ArchiveArea Data Structure

## Bundle Directory
Location: `data/area/bundle/`

### Directory Structure
Each area has its own directory named using the area's ID: `{areaId}/`

### File Naming Convention
Files are named using a unique bundle key: `{bundleKey}.json`

### File Content Structure
The file contains a JSON object with a `thingDefinitions` array containing the thing definitions:

```json
{
  "thingDefinitions": [
    {
      "id": "{thingId}",
      "def": "{thingDef}",
      "serveTime": "{serveTime}"
    }
  ]
}
```

Each thing definition contains:
- `id`: Unique identifier for the thing
- `def`: Definition of the thing
- `serveTime`: How long it took to serve the thing


## Info Directory
Location: `data/area/info/`

### File Naming Convention
Files are named using the area's ID: `{areaId}.json`

### File Content Structure
The file contains a JSON object with area metadata and permissions:

```json
{
  "editors": [
    {
      "id": "{userId}",
      "name": "{userName}",
      "isOwner": "{isOwner}"
    }
  ],
  "copiedFromAreas": [
    {
      "id": "{areaId}",
      "name": "{areaName}"
    }
  ],
  "name": "{areaName}",
  "description": "{areaDescription}",
  "urlName": "{areaUrlName}",
  "creatorId": "{creatorId}",
  "createdAt": "{createdAt}",
  "updatedAt": "{updatedAt}",
  "isZeroGravity": "{isZeroGravity}",
  "hasFloatingDust": "{hasFloatingDust}",
  "isCopyable": "{isCopyable}",
  "isExcluded": "{isExcluded}",
  "renameCount": "{renameCount}",
  "copiedCount": "{copiedCount}",
  "isFavorited": "{isFavorited}"
}
```

### Field Descriptions
#### Editor Object
- `id`: Unique identifier of the editor
- `name`: Display name of the editor
- `isOwner`: Boolean indicating if this editor is the area owner

#### CopiedFromArea Object
- `id`: Unique identifier of the source area
- `name`: Name of the source area

#### Area Properties
- `name`: Display name of the area
- `description`: Text description of the area
- `urlName`: URL-friendly version of the area name
- `creatorId`: Unique identifier of the area creator
- `createdAt`: Timestamp of area creation
- `updatedAt`: Timestamp of last update
- `isZeroGravity`: Boolean indicating if gravity is disabled
- `hasFloatingDust`: Boolean indicating if area has floating dust particles
- `isCopyable`: Boolean indicating if area can be copied
- `isExcluded`: Boolean indicating if area is excluded from listings
- `renameCount`: Number of times the area has been renamed
- `copiedCount`: Number of times the area has been copied
- `isFavorited`: Boolean indicating if area is favorited

## Load Directory
Location: `data/area/load/`

### File Naming Convention
Files are named using the area's ID: `{areaId}.json`

### File Content Structure
The file contains a JSON object with area load information, permissions, and placements:

```json
{
  "ok": "{boolean}",
  "areaId": "{areaId}",
  "areaName": "{areaName}",
  "areaKey": "{areaKey}",
  "areaCreatorId": "{creatorId}",
  "isPrivate": "{boolean}",
  "isZeroGravity": "{boolean}",
  "hasFloatingDust": "{boolean}",
  "isCopyable": "{boolean}",
  "onlyOwnerSetsLocks": "{boolean}",
  "isExcluded": "{boolean}",
  "environmentChangersJSON": "{environmentChangersData}",
  "requestorIsEditor": "{boolean}",
  "requestorIsListEditor": "{boolean}",
  "requestorIsOwner": "{boolean}",
  "placements": [
    {
      "Id": "{placementId}",
      "Tid": "{thingId}",
      "P": {
        "x": "{number}",
        "y": "{number}",
        "z": "{number}"
      },
      "R": {
        "x": "{number}",
        "y": "{number}",
        "z": "{number}"
      }
    }
  ],
  "serveTime": "{number}"
}
```

### Field Descriptions
#### Area Properties
- `ok`: Boolean indicating if the area loaded successfully
- `areaId`: Unique identifier of the area
- `areaName`: Display name of the area
- `areaKey`: Unique key for the area
- `areaCreatorId`: Unique identifier of the area creator
- `isPrivate`: Boolean indicating if area is private
- `isZeroGravity`: Boolean indicating if gravity is disabled
- `hasFloatingDust`: Boolean indicating if area has floating dust particles
- `isCopyable`: Boolean indicating if area can be copied
- `onlyOwnerSetsLocks`: Boolean indicating if only owner can set locks
- `isExcluded`: Boolean indicating if area is excluded from listings
- `environmentChangersJSON`: JSON string containing environment changer data
- `serveTime`: Time taken to serve the area data in milliseconds

#### Permission Properties
- `requestorIsEditor`: Boolean indicating if requestor has editor permissions
- `requestorIsListEditor`: Boolean indicating if requestor has list editor permissions
- `requestorIsOwner`: Boolean indicating if requestor is the owner

#### Placement Object
- `Id`: Unique identifier for the placement
- `Tid`: Thing identifier being placed
- `P`: Position object containing x, y, z coordinates
- `R`: Rotation object containing x, y, z rotation values


## Subareas Directory
Location: `data/area/subareas/`

### File Naming Convention
Files are named using the parent area's ID: `{Parent areaId}.json`

### File Content Structure
The file contains a JSON object with a `subAreas` array containing the subarea definitions:

```json
{
  "subAreas": [
    {
      "id": "12348e3a2da36d2d18b81234",
      "name": "Subarea 1"
    }
  ]
}
```

Each subarea object contains:
- `id`: Unique identifier for the subarea
- `name`: Display name of the subarea


