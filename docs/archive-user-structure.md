# Archive User Data Structure

## Info Directory
Location: `data/user/info/`

### File Naming Convention
Files are named using the user's ID: `{userId}.json`

### File Content Structure
The file contains a JSON object with user metadata and permissions:

```json
{
  "id": "{userId}",
  "screenName": "{screenName}",
  "age": "{age}",
  "statusText": "{statusText}",
  "isFindable": "{isFindable}",
  "isBanned": "{isBanned}",
  "lastActivityOn": "{lastActivityOn}",
  "isFriend": "{isFriend}",
  "isEditorHere": "{isEditorHere}",
  "isListEditorHere": "{isListEditorHere}",
  "isOwnerHere": "{isOwnerHere}",
  "isAreaLocked": "{isAreaLocked}",
  "isOnline": "{isOnline}"
}
```

### Field Descriptions
#### Required Fields
- `isFriend`: Boolean indicating if user is a friend
- `isEditorHere`: Boolean indicating if user has editor permissions in current area
- `isListEditorHere`: Boolean indicating if user has list editor permissions in current area
- `isOwnerHere`: Boolean indicating if user is owner of current area
- `isAreaLocked`: Boolean indicating if area is locked for this user
- `isOnline`: Boolean indicating if user is currently online

#### Optional Fields
- `id`: Unique identifier of the user
- `screenName`: Display name of the user
- `age`: User's age
- `statusText`: User's status message
- `isFindable`: Boolean indicating if user can be found in searches
- `isBanned`: Boolean indicating if user is banned
- `lastActivityOn`: Timestamp of user's last activity

### Minimal Structure
Some files may only contain the required fields. These typically represent guest users who have not registered an account:
```json
{
  "isFriend": false,
  "isEditorHere": false,
  "isListEditorHere": false,
  "isOwnerHere": false,
  "isAreaLocked": false,
  "isOnline": false
}
```

## Gift Directory
Location: `data/user/gift/`

### File Naming Convention
Files are named using the user's ID: `{userId}.json`

### File Content Structure
The file contains a JSON object with an array of gifts received by the user:

```json
{
  "gifts": [
    {
      "id": "{giftId}",
      "thingId": "{thingId}",
      "rotationX": "{rotationX}",
      "rotationY": "{rotationY}",
      "rotationZ": "{rotationZ}",
      "positionX": "{positionX}",
      "positionY": "{positionY}",
      "positionZ": "{positionZ}",
      "dateSent": "{dateSent}",
      "senderId": "{senderId}",
      "senderName": "{senderName}",
      "wasSeenByReceiver": "{wasSeenByReceiver}",
      "isPrivate": "{isPrivate}"
    }
  ]
}
```

### Field Descriptions
#### Gift Object
- `id`: Unique identifier for the gift
- `thingId`: Identifier of the gifted thing/item
- `rotationX`: X-axis rotation of the gift
- `rotationY`: Y-axis rotation of the gift
- `rotationZ`: Z-axis rotation of the gift
- `positionX`: X-axis position of the gift
- `positionY`: Y-axis position of the gift
- `positionZ`: Z-axis position of the gift
- `dateSent`: Timestamp when the gift was sent
- `senderId`: Unique identifier of the gift sender
- `senderName`: Display name of the gift sender
- `wasSeenByReceiver`: Boolean indicating if the gift has been viewed
- `isPrivate`: Boolean indicating if the gift is private

## Area Search Directory
Location: `data/user/areasearch/`

### File Naming Convention
Files are named using the user's ID: `{userId}.json`

### File Content Structure
The file contains a JSON object with arrays of areas created by or private to the user:

```json
{
  "areas": [
    {
      "name": "{areaName}",
      "id": "{areaId}",
      "playerCount": "{playerCount}"
    }
  ],
  "ownPrivateAreas": []
}
```

### Field Descriptions
#### Top-Level Fields
- `areas`: Array of objects representing public areas created by the user
- `ownPrivateAreas`: Array of objects representing private areas created by the user (same structure as `areas`)

#### Area Object
- `name`: Display name of the area
- `id`: Unique identifier of the area
- `playerCount`: Number of players currently in the area

## TopBy Directory
Location: `data/user/topby/`

### File Naming Convention
Files are named using the user's ID: `{userId}.json`

### File Content Structure
The file contains a JSON object with an array of the user's most used or favorite things:

```json
{
  "ids": [
    "{thingId}",
    "{thingId}"
  ]
}
```

### Field Descriptions
#### Top-Level Fields
- `ids`: Array of thing identifiers representing the user's most frequently used or favorite items

#### Thing Identifier
- Each `thingId` in the array is a unique identifier referencing a specific thing/item in the system
- The array is ordered by usage frequency or preference (most used/favorite items first)