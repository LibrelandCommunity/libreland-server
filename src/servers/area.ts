/**
 * Area Bundles Server
 * Handles serving area data bundles for the game world
 */

import * as path from "node:path"
import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { config } from '../config/server'
import { logUnimplementedRequest } from '../utils/request-logger'

export const createAreaBundlesServer = () => {
  const app = new Elysia()
    .use(swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: 'Area Bundles API',
          version: '1.0.0',
          description: 'API for serving area data bundles for the game world'
        },
        tags: [
          { name: 'area-bundles', description: 'Area bundle data endpoints' }
        ]
      }
    }))
    .get(
      "/:areaId/:areaKey",
      async ({ params: { areaId, areaKey }, request }: { params: { areaId: string, areaKey: string }, request: Request }) => {
        const file = Bun.file(path.resolve("./data/area/bundle/", areaId, areaKey + ".json"))

        if (await file.exists()) {
          try {
            const text = await file.text()
            return Response.json(JSON.parse(text))
          } catch (e) {
            console.error("Error reading area bundle:", e)
            return new Response("Error reading area bundle", { status: 500 })
          }
        }

        // Log unimplemented request
        await logUnimplementedRequest({
          server: "AREABUNDLES",
          method: request.method,
          url: request.url,
          timestamp: new Date().toISOString(),
          headers: Object.fromEntries(request.headers.entries()),
          params: { areaId, areaKey }
        })

        return new Response("Area bundle not found", { status: 404 })
      },
      {
        detail: {
          tags: ['area-bundles'],
          description: 'Get area bundle data by area ID and key',
          params: t.Object({
            areaId: t.String({ description: 'The ID of the area' }),
            areaKey: t.String({ description: 'The key of the area bundle' })
          })
        }
      }
    )
    .all("*", async ({ request }) => {
      // Log any unhandled routes
      await logUnimplementedRequest({
        server: "AREABUNDLES",
        method: request.method,
        url: request.url,
        timestamp: new Date().toISOString(),
        headers: Object.fromEntries(request.headers.entries())
      })
      return new Response("Not found", { status: 404 })
    })
    .onRequest(({ request }) => {
      console.info(JSON.stringify({
        server: "AREABUNDLES",
        ts: new Date().toISOString(),
        ip: request.headers.get('X-Real-Ip'),
        ua: request.headers.get("User-Agent"),
        method: request.method,
        url: request.url,
      }))
    })
    .onError(({ code, error }) => {
      console.info("error in middleware!", code, error?.toString())
    })
    .listen({
      hostname: config.HOST,
      port: config.PORT_CDN_AREABUNDLES
    })

  console.log(`🐸 AreaBundles server is running at on port ${app.server?.port}...`)
  return app
}