# Archive Forum Data Structure

## Forum Directory
Location: `data/forum/forum/`

### File Naming Convention
Files are named using the forum's ID: `{forumId}.json`

### File Content Structure
The file contains a JSON object with forum metadata and an array of threads:

```json
{
  "ok": true,
  "forum": {
    "name": "{name}",
    "description": "{description}",
    "creatorId": "{creatorId}",
    "creatorName": "{creatorName}",
    "threadCount": "{threadCount}",
    "latestCommentDate": "{latestCommentDate}",
    "protectionLevel": "{protectionLevel}",
    "creationDate": "{creationDate}",
    "dialogThingId": "{dialogThingId}",
    "dialogColor": "{dialogColor}",
    "latestCommentText": "{latestCommentText}",
    "latestCommentUserId": "{latestCommentUserId}",
    "latestCommentUserName": "{latestCommentUserName}",
    "user_isModerator": "{user_isModerator}",
    "user_hasFavorited": "{user_hasFavorited}"
  },
  "threads": [
    {
      "forumId": "{forumId}",
      "title": "{title}",
      "creatorId": "{creatorId}",
      "creatorName": "{creatorName}",
      "latestCommentDate": "{latestCommentDate}",
      "commentCount": "{commentCount}",
      "isLocked": "{isLocked}",
      "isSticky": "{isSticky}",
      "creationDate": "{creationDate}",
      "latestCommentUserId": "{latestCommentUserId}",
      "latestCommentUserName": "{latestCommentUserName}",
      "latestCommentText": "{latestCommentText}",
      "id": "{threadId}"
    }
  ],
  "stickies": []
}
```

### Field Descriptions
#### Forum Object
- `name`: Display name of the forum
- `description`: Description of the forum's purpose
- `creatorId`: Unique identifier of the forum creator
- `creatorName`: Display name of the forum creator
- `threadCount`: Number of threads in the forum
- `latestCommentDate`: Timestamp of the most recent comment
- `protectionLevel`: Integer indicating the forum's protection level
- `creationDate`: Timestamp when the forum was created
- `dialogThingId`: Associated dialog thing identifier
- `dialogColor`: RGB color value for the forum's dialog
- `latestCommentText`: Text of the most recent comment
- `latestCommentUserId`: User ID of the most recent commenter
- `latestCommentUserName`: Display name of the most recent commenter
- `user_isModerator`: Boolean indicating if current user is a moderator
- `user_hasFavorited`: Boolean indicating if current user has favorited the forum

#### Thread Object
- `forumId`: ID of the parent forum
- `title`: Title of the thread
- `creatorId`: Unique identifier of the thread creator
- `creatorName`: Display name of the thread creator
- `latestCommentDate`: Timestamp of the most recent comment
- `commentCount`: Number of comments in the thread
- `isLocked`: Boolean indicating if the thread is locked
- `isSticky`: Boolean indicating if the thread is pinned
- `creationDate`: Timestamp when the thread was created
- `latestCommentUserId`: User ID of the most recent commenter
- `latestCommentUserName`: Display name of the most recent commenter
- `latestCommentText`: Text of the most recent comment
- `id`: Unique identifier of the thread

## Thread Directory
Location: `data/forum/thread/`

### File Naming Convention
Files are named using the thread's ID: `{threadId}.json`

### File Content Structure
The file contains a JSON object with thread metadata and an array of comments:

```json
{
  "ok": true,
  "forum": {
    // Same structure as forum object above
  },
  "thread": {
    "forumId": "{forumId}",
    "title": "{title}",
    "creatorId": "{creatorId}",
    "creatorName": "{creatorName}",
    "latestCommentDate": "{latestCommentDate}",
    "commentCount": "{commentCount}",
    "comments": [
      {
        "date": "{date}",
        "userId": "{userId}",
        "userName": "{userName}",
        "text": "{text}",
        "likes": ["{userId}"],
        "oldestLikes": [
          {
            "id": "{userId}",
            "n": "{userName}"
          }
        ],
        "newestLikes": [],
        "totalLikes": "{totalLikes}",
        "lastEditedDate": "{lastEditedDate}"
      }
    ],
    "isLocked": "{isLocked}",
    "isSticky": "{isSticky}",
    "creationDate": "{creationDate}",
    "latestCommentUserId": "{latestCommentUserId}",
    "latestCommentUserName": "{latestCommentUserName}",
    "latestCommentText": "{latestCommentText}",
    "id": "{threadId}"
  }
}
```

### Field Descriptions
#### Comment Object
- `date`: Timestamp when the comment was created
- `userId`: Unique identifier of the comment author
- `userName`: Display name of the comment author
- `text`: Content of the comment
- `likes`: Array of user IDs who liked the comment
- `oldestLikes`: Array of oldest likes with user ID and name
- `newestLikes`: Array of newest likes with user ID and name
- `totalLikes`: Total number of likes on the comment
- `lastEditedDate`: Timestamp of the last edit (optional)
