# Archive Placement Data Structure

## Placement Directory
Location: `data/placement/info/`

### File Naming Convention
Files are organized in subdirectories by area ID and named using the placement's ID: `{areaId}/{placementId}.json`

### File Content Structure
The file contains a JSON object with placement metadata:

```json
{
  "placerId": "{placerId}",         // Unique identifier of the user who placed the thing
  "placerName": "{placerName}",     // Display name of the user who placed the thing
  "placedDaysAgo": "{daysAgo}"      // Number of days since the thing was placed
}
```

### Field Descriptions
- `placerId`: Unique identifier of the user who placed the thing in the area
- `placerName`: Display name of the user who placed the thing (can be null for system/anonymous placements)
- `placedDaysAgo`: Integer representing the number of days since the thing was placed in the area

### Directory Structure
As shown in the data structure documentation, placements are stored in:
```
data/
└── placement/
    └── info/           # Placement information
        └── {areaId}/   # Organized by area ID
            └── {placementId}.json
```

Each placement file contains metadata about a specific instance of a thing placed within an area. The file path structure (`{areaId}/{placementId}`) creates a relationship between the area and the things placed within it.
