import { Elysia, t } from 'elysia'
import * as path from "node:path"
import { personMetadataOps } from '../../db'
import friendsData from '../../mock/friends.json'
import { HoldGeometryRequest } from '../../types/geometry'

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
        const file = Bun.file(path.resolve("./data/person/info/", userId + ".json"))

        if (await file.exists()) {
          const text = await file.text()
          return Response.json(JSON.parse(text))
        }
        return { "isFriend": false, "isEditorHere": false, "isListEditorHere": false, "isOwnerHere": false, "isAreaLocked": false, "isOnline": false }
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