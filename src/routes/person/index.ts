import { Elysia, t } from 'elysia'
import * as path from "node:path"
import { personMetadataOps, areaInfoMetadataOps } from '../../db'
import friendsData from '../../mock/friends.json'
import { HoldGeometryRequest } from '../../types/geometry'
import { Editor } from '../../types/area'

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
      () => friendsData
    )
    .post("person/info",
      async ({ body: { areaId, userId } }: { body: { areaId: string, userId: string } }) => {
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
            isFriend: false, // TODO: Implement friend system
            isEditorHere,
            isListEditorHere,
            isOwnerHere,
            isAreaLocked,
            isOnline: false // TODO: Implement online status tracking
          }
        }

        // Return minimal info for non-existent users
        return {
          isFriend: false,
          isEditorHere,
          isListEditorHere,
          isOwnerHere,
          isAreaLocked,
          isOnline: false
        }
      },
      { body: t.Object({ areaId: t.String(), userId: t.String() }) }
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