/**
 * Main API Server
 * Handles authentication, area management, and other core functionality
 */

import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { config } from '../config/server'
import { logUnimplementedRequest } from '../utils/request-logger'
import { createAuthRoutes } from '../routes/auth'
import { createAreaRoutes } from '../routes/area'
import { createPersonRoutes } from '../routes/person'
import { createThingRoutes } from '../routes/thing'
import { createForumRoutes } from '../routes/forum'
import { createPlacementRoutes } from '../routes/placement'
import { createGiftRoutes } from '../routes/gift'
import { getDb, placementMetadataOps } from '../db'

export const createAPIServer = () => {
    const app = new Elysia()
        .use(swagger({
            documentation: {
                info: {
                    title: 'Libreland API',
                    version: '1.0.0',
                    description: 'API for the Libreland virtual world server'
                },
                tags: [
                    { name: 'auth', description: 'Authentication endpoints' },
                    { name: 'area', description: 'Area management endpoints' },
                    { name: 'person', description: 'User management endpoints' },
                    { name: 'placement', description: 'Placement management endpoints' }
                ]
            }
        }))
        .use(createAuthRoutes())
        .use(createAreaRoutes())
        .use(createPersonRoutes())
        .use(createThingRoutes())
        .use(createForumRoutes())
        .use(createPlacementRoutes(getDb(), placementMetadataOps))
        .use(createGiftRoutes())
        .all("*", async ({ request }) => {
            // Parse body based on content type
            let bodyData;
            const contentType = request.headers.get('content-type');
            if (request.method !== 'GET' && request.body) {
                if (contentType?.includes('application/json')) {
                    bodyData = await request.clone().json().catch(() => undefined);
                } else if (contentType?.includes('application/x-www-form-urlencoded')) {
                    const formData = await request.clone().formData().catch(() => undefined);
                    if (formData) {
                        bodyData = Object.fromEntries(formData);
                    }
                }
            }

            // Log any unhandled routes
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
            return new Response("Not found", { status: 404 })
        })
        .onRequest(({ request }) => {
            console.info(JSON.stringify({
                ts: new Date().toISOString(),
                ip: request.headers.get('X-Real-Ip'),
                ua: request.headers.get("User-Agent"),
                method: request.method,
                url: request.url,
            }))
        })
        .onError(({ code, error, request }) => {
            console.info("error in middleware!", request.url, code)
            console.error(error)
        })
        .listen({
            hostname: config.HOST,
            port: config.PORT_API,
        })

    console.log(`🦊 API server: http://${app.server?.hostname}:${app.server?.port}/swagger`)
    return app
}
