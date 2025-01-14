import { Elysia, t } from 'elysia'
import { Database } from 'bun:sqlite'
import { PlacementMetadataOperations } from '../../db/placement'

export const createPlacementRoutes = (db: Database, placementOps: PlacementMetadataOperations) => {
  return new Elysia()
    .post(
      "/placement/info",
      ({ body: { areaId, placementId } }: { body: { areaId: string, placementId: string } }) => {
        const placementInfo = placementOps.findById(areaId, placementId)
        if (!placementInfo) {
          return new Response('Placement not found', { status: 404 })
        }
        return Response.json(placementInfo)
      },
      { body: t.Object({ areaId: t.String(), placementId: t.String() }) }
    )
}