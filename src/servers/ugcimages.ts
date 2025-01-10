/**
 * User Generated Content Images Server
 * Serves user uploaded/generated images
 */

import * as path from "node:path"
import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { config } from '../config/server'
import { logUnimplementedRequest } from '../utils/request-logger'

const NOT_FOUND_HTML = "<html><head><title>404 Not Found</title></head><body><h1>Not Found</h1></body></html>"

export const createUGCImagesServer = () => {
  const app = new Elysia()
    .use(swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: 'UGC Images API',
          version: '1.0.0',
          description: 'API for serving user generated content images'
        },
        tags: [
          { name: 'ugc-images', description: 'User generated content image endpoints' }
        ]
      }
    }))
    .get(
      "/ugc/:part1/:part2/",
      async ({ params: { part1, part2 }, request }: { params: { part1: string, part2: string }, request: Request }) => {
        const filename = path.join("../archiver/images/", `${part1}_${part2}.png`)
        const file = Bun.file(filename)

        if (await file.exists()) {
          try {
            return file
          } catch (e) {
            console.error("error reading image file", filename, e)
            return new Response(NOT_FOUND_HTML, { status: 404 })
          }
        }
        console.error("client asked for an ugc image not on disk!!", part1, part2, filename)

        // Log unimplemented request
        await logUnimplementedRequest({
          server: "UGCIMAGES",
          method: request.method,
          url: request.url,
          timestamp: new Date().toISOString(),
          headers: Object.fromEntries(request.headers.entries()),
          params: { part1, part2 }
        })

        return new Response(NOT_FOUND_HTML, { status: 404 })
      },
      {
        detail: {
          tags: ['ugc-images'],
          description: 'Get user generated content image by path parts',
          params: t.Object({
            part1: t.String({ description: 'First part of the image path' }),
            part2: t.String({ description: 'Second part of the image path' })
          })
        }
      }
    )
    .all("*", async ({ request }) => {
      // Log any unhandled routes
      await logUnimplementedRequest({
        server: "UGCIMAGES",
        method: request.method,
        url: request.url,
        timestamp: new Date().toISOString(),
        headers: Object.fromEntries(request.headers.entries())
      })
      return new Response(NOT_FOUND_HTML, { status: 404 })
    })
    .onRequest(({ request }) => {
      console.info(JSON.stringify({
        server: "UGCIMAGES",
        ts: new Date().toISOString(),
        ip: request.headers.get('X-Real-Ip'),
        ua: request.headers.get("User-Agent"),
        method: request.method,
        url: request.url,
      }))
    })
    .onError(({ code, error }) => {
      console.info("error in middleware!", code, error && 'message' in error ? error.message : String(error))
    })
    .listen({
      hostname: config.HOST,
      port: config.PORT_CDN_UGCIMAGES,
    })

  console.log(`🐷 UGC Images: http://${app.server?.hostname}:${app.server?.port}/swagger`)
  return app
}