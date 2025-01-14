import { Elysia, t } from 'elysia'
import * as path from "node:path"
import { areaMetadataOps, personMetadataOps, userMetadataOps, areaLoadDataOps, areaInfoMetadataOps } from '../../db'
import _areaListData from '../../mock/area-list.json'
import type { BunFile } from 'bun'

type PartialAreaList = Omit<typeof _areaListData, 'featured'>
const areaListData = _areaListData as PartialAreaList

const searchArea = (term: string) => {
  const searchResults = areaMetadataOps.search(term, 50)
  return {
    areas: searchResults.areas.map(area => ({
      id: area.id,
      name: area.name,
      description: area.description,
      playerCount: area.playerCount || 0
    })),
    ownPrivateAreas: searchResults.ownPrivateAreas.map(area => ({
      id: area.id,
      name: area.name,
      description: area.description,
      playerCount: area.playerCount || 0
    }))
  }
}

const formatUrlName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

const findAreaByUrlName = (areaUrlName: string): string | undefined => {
  const formattedUrlName = formatUrlName(areaUrlName)

  // Try area_info_metadata first
  const infoResult = areaInfoMetadataOps.findByUrlName(formattedUrlName)
  if (infoResult) return infoResult.id

  // Fall back to area_metadata
  const metaResult = areaMetadataOps.findByUrlName(formattedUrlName)
  return metaResult?.id
}

export const createAreaRoutes = () => {
  return new Elysia()
    .post(
      "/area/load",
      async ({ body: { areaId, areaUrlName, isPrivate } }: { body: { areaId?: string, areaUrlName?: string, isPrivate: string } }) => {
        let targetAreaId = areaId

        if (!targetAreaId && areaUrlName) {
          const formattedUrlName = formatUrlName(areaUrlName)
          // Try area_info_metadata first
          const infoArea = areaInfoMetadataOps.findByUrlName(formattedUrlName)
          if (infoArea) {
            targetAreaId = infoArea.id
            console.log("client asked to load", areaUrlName, " - found in info metadata:", targetAreaId)
          } else {
            // Fall back to area_metadata
            const metaArea = areaMetadataOps.findByUrlName(formattedUrlName)
            if (metaArea) {
              targetAreaId = metaArea.id
              console.log("client asked to load", areaUrlName, " - found in area metadata:", targetAreaId)
            }
          }
        }

        if (targetAreaId) {
          const areaLoadData = areaLoadDataOps.findByAreaId(targetAreaId)
          if (areaLoadData) {
            return Response.json(JSON.parse(areaLoadData.rawData))
          }
          console.error("couldn't find area", targetAreaId, "in database")
        } else if (areaUrlName) {
          console.error("couldn't find area with urlName", areaUrlName, "in database")
        } else {
          console.error("client asked for neither an areaId or an areaUrlName")
        }

        return Response.json({ "ok": false, "_reasonDenied": "Private", "serveTime": 13 }, { status: 200 })
      },
      {
        body: t.Object({
          areaId: t.Optional(t.String()),
          areaUrlName: t.Optional(t.String()),
          isPrivate: t.String()
        })
      }
    )
    .post(
      "/area/info",
      async ({ body: { areaId } }: { body: { areaId: string } }) => {
        const file = Bun.file(path.resolve("./data/area/info/", areaId + ".json"))
        const text = await file.text()
        return Response.json(JSON.parse(text))
      },
      { body: t.Object({ areaId: t.String() }) }
    )
    .post(
      "/area/getsubareas",
      async ({ body: { areaId } }: { body: { areaId: string } }) => {
        const file = Bun.file(path.resolve("./data/area/subareas/", areaId + ".json"))
        if (await file.exists()) {
          const text = await file.text()
          return Response.json(JSON.parse(text))
        }
        return { subAreas: [] }
      },
      { body: t.Object({ areaId: t.String() }) }
    )
    .post(
      "/area/lists",
      ({ body: { subsetsize, setsize } }: { body: { subsetsize: string, setsize: string } }) => {
        // Limit the number of areas returned based on parameters
        const subset = parseInt(subsetsize) || 30
        const total = parseInt(setsize) || 300

        const limitedData = {
          ...areaListData,
          visited: areaListData.visited?.slice(0, subset) || [],
          popular: areaListData.popular?.slice(0, total) || []
        }
        return limitedData
      },
      { body: t.Object({ subsetsize: t.String(), setsize: t.String() }) }
    )
    .post(
      "/area/search",
      async ({ body: { term, byCreatorId } }: { body: { term: string, byCreatorId: string } }) => {
        if (byCreatorId) {
          // First check if this is a user ID and get their person_id if it exists
          const user = userMetadataOps.findById(byCreatorId);

          // If not a user, check if it's a person ID directly
          const person = personMetadataOps.findById(byCreatorId);

          // Use user's person_id if it exists, otherwise use the ID directly if it's a valid person
          const searchId = user?.person_id || (person ? byCreatorId : undefined);

          if (!searchId) {
            return { areas: [], ownPrivateAreas: [] };
          }

          // Get areas created by this person
          const areas = personMetadataOps.getAreas(searchId);

          if (!areas.length) {
            return { areas: [], ownPrivateAreas: [] };
          }

          const result = {
            areas: areas.filter(a => !a.isPrivate).map(a => ({
              id: a.areaId,
              name: a.areaName,
              playerCount: a.playerCount
            })),
            ownPrivateAreas: areas.filter(a => a.isPrivate).map(a => ({
              id: a.areaId,
              name: a.areaName,
              playerCount: a.playerCount
            }))
          };
          return result;
        }

        const searchResults = searchArea(term)
        return searchResults // Return the complete object with both areas and ownPrivateAreas
      },
      { body: t.Object({ term: t.String(), byCreatorId: t.Optional(t.String()) }) }
    )
}