import { Elysia, t } from 'elysia'
import * as path from "node:path"
import { personMetadataOps, thingMetadataOps } from '../../db'
import { logUnimplementedRequest } from '../../utils/request-logger'

export const createThingRoutes = () => {
  return new Elysia()
    .post("/thing", async ({ request }) => {
      console.log("user asked to create a thing")

      // Parse body based on content type
      let bodyData;
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        bodyData = await request.clone().json().catch(() => undefined);
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await request.clone().formData().catch(() => undefined);
        if (formData) {
          bodyData = Object.fromEntries(formData);
        }
      }

      // Log unimplemented request
      await logUnimplementedRequest({
        server: "API",
        method: request.method,
        url: request.url,
        timestamp: new Date().toISOString(),
        headers: Object.fromEntries(request.headers.entries()),
        body: bodyData,
        params: {
          query: Object.fromEntries(new URL(request.url).searchParams.entries()),
          body: bodyData
        }
      })

      return new Response("Not implemented", { status: 500 })
    })
    .get("/inventory/:page",
      () => {
        return { "inventoryItems": null }
      },
    )
    .post("/thing/topby",
      async ({ body: { id } }: { body: { id: string } }) => {
        const thingIds = personMetadataOps.getTopBy(id)
        return { ids: thingIds.slice(0, 4) }
      },
      { body: t.Object({ id: t.String(), limit: t.String() }) }
    )
    .get("/thing/info/:thingId",
      async ({ params: { thingId } }: { params: { thingId: string } }) => {
        let thingInfo;
        try {
          thingInfo = thingMetadataOps.findInfoById(thingId)
        } catch (error) {
          console.error("Error fetching thing info:", error)
          return new Response("Internal server error", { status: 500 })
        }

        if (!thingInfo) {
          return new Response("Thing not found", { status: 404 })
        }

        // Convert null clonedFromId to empty string for API compatibility
        const response = {
          ...thingInfo,
          clonedFromId: thingInfo.clonedFromId === null ? "" : thingInfo.clonedFromId
        }

        return Response.json(response)
      }
    )
    .get("/thing/sl/tdef/:thingId",
      async ({ params: { thingId } }: { params: { thingId: string } }) => {
        const file = Bun.file(path.resolve("./data/thing/def/", thingId + ".json"))
        const text = await file.text()
        return Response.json(JSON.parse(text))
      }
    )
    .post(
      "/thing/gettags",
      async ({ body: { thingId } }: { body: { thingId: string } }) => {
        const file = Bun.file(path.resolve("./data/thing/tags/", thingId + ".json"))
        const text = await file.text()
        return Response.json(JSON.parse(text))
      },
      { body: t.Object({ thingId: t.String() }) }
    )
    .post(
      "/thing/getflag",
      () => ({ isFlagged: false }),
      { body: t.Object({ id: t.String() }) }
    )
}