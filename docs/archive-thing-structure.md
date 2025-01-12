# Archive Thing Data Structure

## Thing Directory Structure
Location: `data/thing/`

### Subdirectories
The thing data is split across three subdirectories:
- `def/` - Thing definitions containing geometry and material data
- `info/` - Thing metadata and statistics
- `tags/` - User-applied tags and categorization

## Definition Directory
Location: `data/thing/def/`

### File Naming Convention
Files are named using the thing's ID: `{thingId}.json`

### File Content Structure
The file contains a JSON object with the thing's geometric and material properties:

```json
{
  "n": "{name}",
  "v": "{version}",
  "a": "{attributes}",
  "p": [
    {
      "b": "{blockType}",
      "s": [
        {
          "p": "[x,y,z]",
          "r": "[rx,ry,rz]",
          "s": "[sx,sy,sz]",
          "c": "[r,g,b]"
        }
      ]
    }
  ]
}
```

### Field Descriptions
#### Root Object
- `n`: Display name of the thing
- `v`: Version number of the thing format
- `a`: Array of attribute flags
- `p`: Array of parts that make up the thing

#### Part Object
- `b`: Block type identifier
- `s`: Array of shapes within the part

#### Shape Object
- `p`: Position coordinates [x,y,z]
- `r`: Rotation angles [rx,ry,rz]
- `s`: Scale factors [sx,sy,sz]
- `c`: RGB color values [r,g,b] in range 0-1

## Info Directory
Location: `data/thing/info/`

### File Naming Convention
Files are named using the thing's ID: `{thingId}.json`

### File Content Structure
The file contains a JSON object with thing metadata:

```json
{
  "name": "{name}",
  "creatorId": "{creatorId}",
  "creatorName": "{creatorName}",
  "createdDaysAgo": "{daysAgo}",
  "collectedCount": "{collections}",
  "placedCount": "{placements}",
  "clonedFromId": "{originalThingId}",
  "allCreatorsThingsClonable": "{clonable}",
  "isUnlisted": "{unlisted}"
}
```

### Field Descriptions
- `name`: Display name of the thing
- `creatorId`: Unique identifier of the thing's creator
- `creatorName`: Display name of the thing's creator
- `createdDaysAgo`: Number of days since creation
- `collectedCount`: Number of times the thing has been collected
- `placedCount`: Number of times the thing has been placed
- `clonedFromId`: ID of the original thing if this is a clone
- `allCreatorsThingsClonable`: Boolean indicating if all things by creator are clonable
- `isUnlisted`: Boolean indicating if the thing is hidden from listings

## Tags Directory
Location: `data/thing/tags/`

### File Naming Convention
Files are named using the thing's ID: `{thingId}.json`

### File Content Structure
The file contains a JSON object with an array of tags:

```json
{
  "tags": [
    {
      "tag": "{tagName}",
      "userId": "{userId}",
      "userName": "{userName}"
    }
  ]
}
```

### Field Descriptions
#### Tag Object
- `tag`: The tag text
- `userId`: ID of the user who applied the tag
- `userName`: Display name of the user who applied the tag
