import { Elysia, t } from 'elysia'
import * as path from "node:path"
import { personMetadataOps, areaInfoMetadataOps, userMetadataOps } from '../../db'
import friendsData from '../../mock/friends.json'
import { HoldGeometryRequest } from '../../types/geometry'
import { Editor } from '../../types/area'
import { UserSession } from '../../types/user'

// Hold geometry storage
// TODO: Implement proper storage solution
const holdGeoMap: Record<string, any> = {}

export const createPersonRoutes = () => {
  return new Elysia()
    .get("person/registerusagemode",
      async ({ query: { inDesktopMode } }) => {
        return { ok: true }
      },
      {
        query: t.Object({
          inDesktopMode: t.String()
        })
      }
    )
    .get("person/friendsbystr",
      async ({ cookie: { s } }) => {
        try {
          // Get user ID from session
          if (!s.value) {
            console.error("No session found");
            return new Response("Unauthorized", { status: 401 });
          }

          const session = JSON.parse(s.value) as UserSession;
          if (!session?.id) {
            console.error("Invalid session:", session);
            return new Response("Unauthorized", { status: 401 });
          }

          // Get user's person ID from user metadata
          const user = userMetadataOps.findById(session.id);
          if (!user?.person_id) {
            console.error("No person ID found for user:", session.id);
            return new Response("User not found", { status: 404 });
          }

          const friends = personMetadataOps.getFriendsByStrength(user.person_id);

          const formattedFriends = friends.map(f => ({
            lastActivityOn: f.last_activity_on || new Date().toISOString(),
            statusText: f.status_text || "",
            screenName: f.screen_name,
            id: f.id,
            isOnline: f.isOnline,
            strength: f.strength
          }));

          const response = {
            online: {
              friends: formattedFriends.filter(f => f.isOnline)
            },
            offline: {
              friends: formattedFriends.filter(f => !f.isOnline)
            }
          };
          return response;
        } catch (e) {
          console.error("Error getting friends:", e);
          return new Response("Error getting friends", { status: 500 });
        }
      }
    )
    .post("person/addfriend",
      async ({ cookie: { s }, body: { id } }) => {
        try {
          // Get user ID from session
          if (!s.value) {
            return new Response("Unauthorized", { status: 401 });
          }

          const session = JSON.parse(s.value) as UserSession;
          if (!session?.id) {
            return new Response("Unauthorized", { status: 401 });
          }

          // Get user's person ID from user metadata
          const user = userMetadataOps.findById(session.id);
          if (!user?.person_id) {
            return new Response("User not found", { status: 404 });
          }

          // Add friend relationship
          personMetadataOps.insertFriend(user.person_id, id);

          return { ok: true };
        } catch (e) {
          console.error("Error adding friend:", e);
          return new Response("Error adding friend", { status: 500 });
        }
      },
      {
        body: t.Object({
          id: t.String()
        })
      }
    )
    .post("person/removefriend",
      async ({ cookie: { s }, body: { id } }) => {
        try {
          // Get user ID from session
          if (!s.value) {
            return new Response("Unauthorized", { status: 401 });
          }

          const session = JSON.parse(s.value) as UserSession;
          if (!session?.id) {
            return new Response("Unauthorized", { status: 401 });
          }

          // Get user's person ID from user metadata
          const user = userMetadataOps.findById(session.id);
          if (!user?.person_id) {
            return new Response("User not found", { status: 404 });
          }

          // Remove friend relationship
          personMetadataOps.removeFriend(user.person_id, id);

          return { ok: true };
        } catch (e) {
          console.error("Error removing friend:", e);
          return new Response("Error removing friend", { status: 500 });
        }
      },
      {
        body: t.Object({
          id: t.String()
        })
      }
    )
    .post("person/info",
      async ({ cookie: { s }, body: { areaId, userId } }) => {
        try {
          // Look up person in database
          const person = personMetadataOps.findById(userId);

          // Look up area info to check editor status
          const areaInfo = areaInfoMetadataOps.findById(areaId);

          // Default editor flags
          let isEditorHere = false;
          let isListEditorHere = false;
          let isOwnerHere = false;
          let isAreaLocked = false;

          // Check editor status if area exists
          if (areaInfo) {
            // Check if person is an editor
            const editor = areaInfo.editors.find((e: Editor) => e.id === userId);
            if (editor) {
              isEditorHere = true;
              isOwnerHere = editor.isOwner || false;
            }

            // TODO: Implement list editors and area lock status
            // For now these will remain false
          }

          // Get current user's person ID from session
          let isFriend = false;
          if (s.value) {
            const session = JSON.parse(s.value) as UserSession;
            if (session?.id) {
              const currentUser = userMetadataOps.findById(session.id);
              if (currentUser?.person_id) {
                isFriend = personMetadataOps.isFriend(currentUser.person_id, userId);
              }
            }
          }

          // If person exists, return full info
          if (person) {
            return {
              id: person.id,
              screenName: person.screen_name,
              age: person.age || 0,
              statusText: person.status_text || "",
              isFindable: Boolean(person.is_findable),
              isBanned: Boolean(person.is_banned),
              lastActivityOn: person.last_activity_on || new Date().toISOString(),
              isFriend,
              isEditorHere,
              isListEditorHere,
              isOwnerHere,
              isAreaLocked,
              isOnline: false // TODO: Implement online status tracking
            }
          }

          // Return minimal info for non-existent users
          return {
            isFriend,
            isEditorHere,
            isListEditorHere,
            isOwnerHere,
            isAreaLocked,
            isOnline: false
          }
        } catch (e) {
          console.error("Error getting person info:", e);
          return new Response("Error getting person info", { status: 500 });
        }
      },
      {
        body: t.Object({
          areaId: t.String(),
          userId: t.String()
        })
      }
    )
    .post("/person/infobasic",
      async ({ body: { areaId, userId } }: { body: { areaId: string, userId: string } }) => {
        return { "isEditorHere": false }
      },
      { body: t.Object({ areaId: t.String(), userId: t.String() }) }
    )
    .post("/person/getholdgeometry",
      async ({ body }: { body: HoldGeometryRequest }) => {
        return holdGeoMap[body.thingId] || {}
      },
      {
        body: t.Object({
          thingId: t.String(),
          geometry: t.Optional(t.Any())
        })
      }
    )
    .post("/person/registerhold",
      async ({ body }: { body: HoldGeometryRequest }) => {
        if (body.thingId && body.geometry) {
          holdGeoMap[body.thingId] = body.geometry
        }
        return { ok: true }
      },
      {
        body: t.Object({
          thingId: t.String(),
          geometry: t.Any()
        })
      }
    )
    .post("/person/getflag",
      async ({ body: { id } }: { body: { id: string } }) => {
        return { isFlagged: false }
      },
      { body: t.Object({ id: t.String() }) }
    )
}