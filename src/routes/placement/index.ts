import { Elysia, t } from 'elysia'
import * as path from "node:path"

export const createPlacementRoutes = () => {
  return new Elysia()
    .post(
      "/placement/info",
      async ({ body: { areaId, placementId } }: { body: { areaId: string, placementId: string } }) => {
        const file = Bun.file(path.resolve("./data/placement/info/", areaId, placementId + ".json"))
        const text = await file.text()
        return Response.json(JSON.parse(text))
      },
      { body: t.Object({ areaId: t.String(), placementId: t.String() }) }
    )
}