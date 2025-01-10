# API Endpoints

This document describes the API endpoints that the Libreland server implements to recreate the original Anyland server functionality.

## Authentication

### POST `/auth/start`
Initiates a user session.

**Response:**
```json
{
    "vMaj": 188,
    "vMinSrv": 1,
    "personId": "generated_id",
    "homeAreaId": "5773cf9fbdee942c18292f08",
    "screenName": "singleplayer explorer",
    "statusText": "exploring around",
    "isFindable": true,
    "age": 2226,
    "ageSecs": 192371963,
    "attachments": "...",
    "isSoftBanned": false,
    "showFlagWarning": false,
    "flagTags": [],
    "areaCount": 1,
    "thingTagCount": 1,
    "allThingsClonable": true,
    "achievements": [],
    "hasEditTools": true,
    "hasEditToolsPermanently": false,
    "editToolsExpiryDate": "2024-01-30T15:26:27.720Z",
    "isInEditToolsTrial": true,
    "wasEditToolsTrialEverActivated": true,
    "customSearchWords": ""
}
```

## Areas

### POST `/area/load`
Loads an area by ID or URL name.

**Request:**
```json
{
    "areaId": "string",
    "areaUrlName": "string",
    "isPrivate": "string"
}
```

**Response:**
```json
{
    "ok": true,
    "areaId": "5d983611288c857ffcc86370",
    "areaName": "areaname",
    "areaKey": "rr5d98ec853554fc7fe60076f2",
    "areaCreatorId": "5a923c5bff4ade85133a430a",
    "isPrivate": true,
    "isZeroGravity": false,
    "hasFloatingDust": false,
    "isCopyable": false,
    "onlyOwnerSetsLocks": false,
    "isExcluded": false,
    "environmentChangersJSON": "{\"environmentChangers\":[]}",
    "requestorIsEditor": true,
    "requestorIsListEditor": false,
    "requestorIsOwner": true,
    "placements": [
        {
            "Id": "placement_id",
            "Tid": "thing_id",
            "P": {"x": 0, "y": 0, "z": 0},
            "R": {"x": 0, "y": 0, "z": 0}
        }
    ],
    "serveTime": 32
}
```

### POST `/area/info`
Gets information about an area.

**Request:**
```json
{
    "areaId": "string"
}
```

**Response:**
```json
{
    "editors": [
        {
            "id": "user_id",
            "name": "username",
            "isOwner": true
        }
    ],
    "listEditors": [],
    "copiedFromAreas": [],
    "name": "area_name",
    "creationDate": "2018-02-25T04:32:27.364Z",
    "totalVisitors": 134,
    "isZeroGravity": false,
    "hasFloatingDust": false,
    "isCopyable": false,
    "onlyOwnerSetsLocks": true,
    "isExcluded": true,
    "renameCount": 1,
    "copiedCount": 0,
    "isFavorited": false
}
```

### POST `/area/getsubareas`
Gets subareas of an area.

**Request:**
```json
{
    "areaId": "string"
}
```

### POST `/area/lists`
Gets lists of areas (visited, popular, etc.).

**Request:**
```json
{
    "subsetsize": "string",
    "setsize": "string"
}
```

### POST `/area/search`
Searches for areas.

**Request:**
```json
{
    "term": "string",
    "byCreatorId": "string"
}
```

## Placements

### POST `/placement/info`
Gets information about a placed thing.

**Request:**
```json
{
    "areaId": "string",
    "placementId": "string"
}
```

**Response:**
```json
{
    "placerId": "user_id",
    "copiedVia": "area_id"
}
```

### POST `/placement/new`
Creates a new placement in an area.

**Request:**
```json
{
    "areaId": "string",
    "thingId": "string",
    "position": {"x": 0, "y": 0, "z": 0},
    "rotation": {"x": 0, "y": 0, "z": 0}
}
```

### POST `/placement/update`
Updates an existing placement.

**Request:**
```json
{
    "areaId": "string",
    "placementId": "string",
    "position": {"x": 0, "y": 0, "z": 0},
    "rotation": {"x": 0, "y": 0, "z": 0}
}
```

### POST `/placement/delete`
Deletes a placement.

**Request:**
```json
{
    "areaId": "string",
    "placementId": "string"
}
```

## People

### GET `/person/friendsbystr`
Gets friend information.

### POST `/person/info`
Gets information about a person.

**Request:**
```json
{
    "areaId": "string",
    "userId": "string"
}
```

### POST `/person/infobasic`
Gets basic information about a person.

**Request:**
```json
{
    "areaId": "string",
    "userId": "string"
}
```

### POST `/person/getholdgeometry`
Gets hold geometry for a thing.

**Request:**
```json
{
    "thingId": "string",
    "geometry": "object"
}
```

### POST `/person/registerhold`
Registers hold geometry for a thing.

**Request:**
```json
{
    "thingId": "string",
    "geometry": "object"
}
```

## Things

### POST `/thing`
Creates a new thing.

### POST `/thing/topby`
Gets top things by a user.

**Request:**
```json
{
    "id": "string",
    "limit": "string"
}
```

**Response:**
```json
{
    "ids": [
        "thing_id1",
        "thing_id2",
        "thing_id3"
    ]
}
```

### GET `/thing/info/:thingId`
Gets information about a thing.

**Response:**
```json
{
    "name": "thing_name",
    "creatorId": "user_id",
    "creatorName": "username",
    "createdDaysAgo": 1888,
    "collectedCount": 25,
    "placedCount": 16,
    "clonedFromId": "original_thing_id",
    "allCreatorsThingsClonable": false,
    "isUnlisted": false
}
```

### GET `/thing/sl/tdef/:thingId`
Gets thing definition data. See [Thing Format](./thing-format.md) for response structure.

### POST `/thing/gettags`
Gets tags for a thing.

**Request:**
```json
{
    "thingId": "string"
}
```

### POST `/thing/getflag`
Gets flag status for a thing.

**Request:**
```json
{
    "id": "string"
}
```

**Response:**
```json
{
    "isFlagged": false
}
```

## Gifts

### POST `/gift/getreceived`
Gets gifts received by a user.

**Request:**
```json
{
    "userId": "string"
}
```

## Forums

### GET `/forum/favorites`
Gets favorite forums.

**Response:**
```json
{
    "forums": [
        {
            "name": "forum_name",
            "description": "forum_description",
            "threadCount": 344,
            "latestCommentDate": "2023-09-30T19:47:02.573Z",
            "id": "forum_id",
            "user_isModerator": false,
            "user_hasFavorited": true
        }
    ]
}
```

### GET `/forum/forum/:id`
Gets forum information.

**Response:**
```json
{
    "name": "forum_name",
    "description": "forum_description",
    "creatorId": "user_id",
    "creatorName": "username",
    "threadCount": 344,
    "latestCommentDate": "2023-09-30T19:47:02.573Z",
    "protectionLevel": 0,
    "creationDate": "2016-12-06T16:31:52.285Z",
    "dialogThingId": "thing_id",
    "dialogColor": "255,255,255",
    "latestCommentText": "comment_text",
    "latestCommentUserId": "user_id",
    "latestCommentUserName": "username",
    "id": "forum_id",
    "user_isModerator": false,
    "user_hasFavorited": true,
    "threads": [
        {
            "title": "thread_title",
            "creatorId": "user_id",
            "creatorName": "username",
            "commentCount": 21,
            "latestCommentDate": "2023-07-28T23:32:12.581Z"
        }
    ]
}
```

### GET `/forum/thread/:id`
Gets thread information.

**Response:**
```json
{
    "ok": true,
    "forum": {
        "name": "forum_name",
        "description": "forum_description",
        "creatorId": "user_id",
        "creatorName": "username",
        "threadCount": 344,
        "latestCommentDate": "2023-09-30T19:47:02.573Z",
        "protectionLevel": 0,
        "creationDate": "2016-12-06T16:31:52.285Z",
        "dialogThingId": "thing_id",
        "dialogColor": "255,255,255",
        "id": "forum_id",
        "user_isModerator": false,
        "user_hasFavorited": true
    },
    "thread": {
        "forumId": "forum_id",
        "title": "thread_title",
        "creatorId": "user_id",
        "creatorName": "username",
        "latestCommentDate": "2023-07-28T23:32:12.581Z",
        "commentCount": 21,
        "comments": [
            {
                "date": "2023-07-28T23:32:12.581Z",
                "userId": "user_id",
                "userName": "username",
                "text": "comment_text",
                "likes": ["user_id1", "user_id2"],
                "thingId": "thing_id"
            }
        ]
    }
}
```

### POST `/forum/forumid`
Gets forum ID by name.

**Request:**
```json
{
    "forumName": "string"
}
```

**Response:**
```json
{
    "ok": true,
    "forumId": "forum_id"
}
```

### POST `/forum/comment/add`
Adds a comment to a forum thread.

**Request:**
```json
{
    "forumId": "string",
    "threadId": "string",
    "text": "string",
    "thingId": "string"
}
```

**Response:**
```json
{
    "ok": true
}
```

## Version Check

### POST `/p`
Checks server version.

**Response:**
```json
{
    "vMaj": 188,
    "vMinSrv": 1
}
```

## Response Formats

Most endpoints return JSON responses. Common response fields include:

- `ok`: Boolean indicating success
- `_reasonDenied`: String explaining why a request was denied
- `serveTime`: Number indicating processing time

## Error Handling

The API handles errors with appropriate HTTP status codes and JSON responses containing error details. Common error scenarios include:

- Invalid authentication
- Missing or invalid parameters
- Resource not found
- Permission denied
- Rate limiting

## Rate Limiting

The server implements rate limiting on certain endpoints to prevent abuse. Rate limits vary by endpoint and are enforced through the queue system described in [Queue System](./queue-system.md).