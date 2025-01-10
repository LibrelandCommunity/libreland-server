/**
 * Area Bundles Server
 * Handles serving area data bundles for the game world
 */

import * as path from "node:path"
import { Elysia } from 'elysia'
import { config } from '../config/server'

export const createAreaBundlesServer = () => {
  const app = new Elysia()
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
      console.info("error in middleware!", code, error.message)
    })
    .get(
      "/:areaId/:areaKey",
      async ({ params: { areaId, areaKey } }) => {
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
        return new Response("Area bundle not found", { status: 404 })
      }
    )
    .listen({
      hostname: config.HOST,
      port: config.PORT_CDN_AREABUNDLES
    })

  console.log(`🦊 AreaBundles server is running on port ${app.server?.port}...`)
  return app
}