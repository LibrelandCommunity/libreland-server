/**
 * Thing Definitions Server
 * Serves object/thing definitions used in the game world
 */

import * as path from "node:path"
import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { config } from '../config/server'

export const createThingDefsServer = () => {
  const app = new Elysia()
    .use(swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: 'Thing Definitions API',
          version: '1.0.0',
          description: 'API for serving object/thing definitions used in the game world'
        },
        tags: [
          { name: 'thing-definitions', description: 'Thing definition endpoints' }
        ]
      }
    }))
    .get(
      "/:thingId",
      async ({ params: { thingId } }) => {
        const file = Bun.file(path.resolve("./data/thing/def/", thingId + ".json"))
        if (await file.exists()) {
          try {
            const text = await file.text()
            return Response.json(JSON.parse(text))
          } catch (e) {
            console.error("unable to read thingdef json?", thingId, e)
            return Response.json("", { status: 200 })
          }
        }
        console.error("client asked for a thingdef not on disk!!", thingId)
        return Response.json("", { status: 200 })
      },
      {
        detail: {
          tags: ['thing-definitions'],
          description: 'Get thing definition by ID',
          params: t.Object({
            thingId: t.String({ description: 'The ID of the thing/object' })
          })
        }
      }
    )
    .onRequest(({ request }) => {
      console.info(JSON.stringify({
        server: "THINGDEFS",
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
    .listen({
      hostname: config.HOST,
      port: config.PORT_CDN_THINGDEFS,
    })

  console.log(`🦊 ThingDefs server is running on port ${app.server?.port}...`)
  return app
}