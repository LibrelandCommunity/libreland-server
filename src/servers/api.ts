/**
 * Main API Server
 * Handles authentication, area management, and other core functionality
 */

import * as path from "node:path"
import * as fs from "node:fs/promises"
import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { AreaInfoSchema } from "../types/area"
import { config } from '../config/server'
import { AreaIndexEntry, AreaList, AreaListArea } from '../types/area'
import { HoldGeometryRequest } from '../types/geometry'
import { generateObjectId } from '../utils/id'
import { logUnimplementedRequest } from '../utils/request-logger'
import _areaListData from '../data/mock/area-list.json'
import friendsData from '../data/mock/friends.json'
import forumsData from '../data/mock/forums.json'
import { areaMetadataOps, userMetadataOps, AreaMetadata } from '../db'

type PartialAreaList = Omit<AreaList, 'featured'>
const areaListData = _areaListData as PartialAreaList

interface DatabaseError extends Error {
    code?: string;
}

export const createAPIServer = () => {
    // Load area data
    console.log("Loading areas into database...")
    const loadAreas = async () => {
        const files = await fs.readdir("./data/area/info")

        for (const filename of files) {
            const file = Bun.file(path.join("./data/area/info", filename))
            if (!await file.exists()) continue

            const text = await file.text()
            const areaInfo = await AreaInfoSchema.parseAsync(JSON.parse(text))
            const areaId = path.parse(filename).name
            const areaUrlName = areaInfo.name.replace(/[^-_a-z0-9]/g, "")

            try {
                areaMetadataOps.insert({
                    id: areaId,
                    name: areaInfo.name,
                    description: areaInfo.description || "",
                    urlName: areaUrlName,
                    creatorId: undefined,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    isPrivate: false,
                    playerCount: 0
                })
            } catch (e) {
                const error = e as DatabaseError
                // Area likely already exists, update it instead
                if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                    areaMetadataOps.update({
                        id: areaId,
                        name: areaInfo.name,
                        description: areaInfo.description || "",
                        urlName: areaUrlName,
                        creatorId: undefined,
                        updatedAt: Date.now(),
                        isPrivate: false,
                        playerCount: 0
                    })
                } else {
                    console.error("Error inserting area:", error)
                }
            }
        }
    }

    const searchArea = (term: string): AreaIndexEntry[] => {
        return areaMetadataOps.search(term, 50).map(row => ({
            id: row.id,
            name: row.name,
            description: row.description || '',
            playerCount: row.playerCount || 0
        }))
    }

    const findAreaByUrlName = (areaUrlName: string): string | undefined => {
        const result = areaMetadataOps.findByUrlName(areaUrlName)
        return result?.id
    }

    // Call loadAreas on startup
    loadAreas().catch(console.error)

    // Hold geometry storage
    // TODO: Implement proper storage solution
    const holdGeoMap: Record<string, any> = {}

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
        .post('/auth/start', async ({ cookie: { s }, request, body }: { cookie: { s: any }, request: Request, body: any }) => {
            try {
                const username = body.ast.split("|")[0]
                const password = body.ast.split("|")[1]

                // First check if user exists
                let user = userMetadataOps.findByUsername(username);

                const newUserData = {
                    username,
                    password,
                    is_findable: true,
                    age: 2226,
                    age_secs: 192371963,
                    is_soft_banned: false,
                    show_flag_warning: false,
                    area_count: 1,
                    thing_tag_count: 1,
                    all_things_clonable: true,
                    has_edit_tools: true,
                    has_edit_tools_permanently: true,
                    edit_tools_expiry_date: '9999-12-31T23:59:59.999Z',
                    is_in_edit_tools_trial: true,
                    was_edit_tools_trial_activated: true,
                    custom_search_words: '',
                    attachments: '{"0":{"Tid":"58a983128ca4690c104b6404","P":{"x":0,"y":0,"z":-1.4901161193847656e-7},"R":{"x":0,"y":0,"z":0}},"2":{"Tid":"58965e04569548a0132feb5e","P":{"x":-0.07462535798549652,"y":0.17594149708747864,"z":0.13412480056285858},"R":{"x":87.7847671508789,"y":73.62593841552734,"z":99.06474304199219}},"6":{"Tid":"58a25965b5fa68ae13841fb7","P":{"x":-0.03214322030544281,"y":-0.028440749272704124,"z":-0.3240281939506531},"R":{"x":306.4596862792969,"y":87.87753295898438,"z":94.79550170898438}},"7":{"Tid":"58965dfd9e2733c413d68d05","P":{"x":0.0267937108874321,"y":-0.03752899169921875,"z":-0.14691570401191711},"R":{"x":337.77911376953125,"y":263.3216857910156,"z":78.18708038330078}}}',
                    achievements: [30, 7, 19, 4, 20, 11, 10, 5, 9, 17, 13, 12, 16, 37, 34, 35, 44, 31, 15, 27, 28]
                }

                // If no existing user, create one
                if (!user) {
                    try {
                        user = await userMetadataOps.insert(newUserData);
                    } catch (e) {
                        console.error("Error creating user:", e);
                        return new Response("Error processing auth start request", { status: 500 });
                    }
                }

                // Set session cookie with user ID and username
                s.value = JSON.stringify({
                    id: user.id,
                    username: user.username
                });
                s.httpOnly = true;

                console.log("Logged in user", user.username);

                return {
                    vMaj: 188,
                    vMinSrv: 1,
                    personId: user.id,
                    homeAreaId: '5773cf9fbdee942c18292f08', // sunbeach
                    screenName: user.username,
                    statusText: 'exploring around (my id: ' + user.id + ')',
                    isFindable: user.is_findable,
                    age: user.age,
                    ageSecs: user.age_secs,
                    attachments: user.attachments,
                    isSoftBanned: Boolean(user.is_soft_banned),
                    showFlagWarning: Boolean(user.show_flag_warning),
                    flagTags: [],
                    areaCount: user.area_count,
                    thingTagCount: user.thing_tag_count,
                    allThingsClonable: Boolean(user.all_things_clonable),
                    achievements: user.achievements,
                    hasEditTools: Boolean(user.has_edit_tools),
                    hasEditToolsPermanently: Boolean(user.has_edit_tools_permanently),
                    editToolsExpiryDate: user.edit_tools_expiry_date,
                    isInEditToolsTrial: Boolean(user.is_in_edit_tools_trial),
                    wasEditToolsTrialEverActivated: Boolean(user.was_edit_tools_trial_activated),
                    customSearchWords: user.custom_search_words
                }
            } catch (e) {
                console.error("Error processing auth start request:", e)
                return new Response("Error processing auth start request", { status: 500 })
            }
        })
        .post("/p", () => ({ "vMaj": 188, "vMinSrv": 1 }))
        .post(
            "/area/load",
            async ({ body: { areaId, areaUrlName } }: { body: { areaId: string, areaUrlName: string } }) => {
                if (areaId) {
                    const file = Bun.file(path.resolve("./data/area/load/", areaId + ".json"))
                    if (await file.exists()) {
                        const text = await file.text()
                        return Response.json(JSON.parse(text))
                    }
                    console.error("couldn't find area", areaId, "on disk?")
                    return Response.json({ "ok": false, "_reasonDenied": "Private", "serveTime": 13 }, { status: 200 })
                }
                else if (areaUrlName) {
                    const areaId = findAreaByUrlName(areaUrlName)
                    console.log("client asked to load", areaUrlName, " - found", areaId)

                    if (areaId) {
                        const file = Bun.file(path.resolve("./data/area/load/" + areaId + ".json"))
                        const text = await file.text()
                        return Response.json(JSON.parse(text))
                    }
                    return Response.json({ "ok": false, "_reasonDenied": "Private", "serveTime": 13 }, { status: 200 })
                }

                console.error("client asked for neither an areaId or an areaUrlName?")
                return Response.json({ "ok": false, "_reasonDenied": "Private", "serveTime": 13 }, { status: 200 })
            },
            { body: t.Object({ areaId: t.Optional(t.String()), areaUrlName: t.Optional(t.String()), isPrivate: t.String() }) }
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
                    const file = Bun.file(path.resolve("./data/person/areasearch/", byCreatorId + ".json"))

                    if (await file.exists()) {
                        const text = await file.text()
                        return Response.json(JSON.parse(text))
                    }
                    return { areas: [], ownPrivateAreas: [] }
                }

                const matchingAreas = searchArea(term)
                return {
                    areas: matchingAreas,
                    ownPrivateAreas: []
                }
            },
            { body: t.Object({ term: t.String(), byCreatorId: t.Optional(t.String()) }) }
        )
        .post(
            "/placement/info",
            async ({ body: { areaId, placementId } }: { body: { areaId: string, placementId: string } }) => {
                const file = Bun.file(path.resolve("./data/placement/info/", areaId, placementId + ".json"))
                const text = await file.text()
                return Response.json(JSON.parse(text))
            },
            { body: t.Object({ areaId: t.String(), placementId: t.String() }) }
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
        .get("/inventory/:page",
            () => {
                return { "inventoryItems": null }
            },
        )
        .post("/thing/topby",
            async ({ body: { id } }: { body: { id: string } }) => {
                const file = Bun.file(path.resolve("./data/person/topby/", id + ".json"))

                if (await file.exists()) {
                    const text = await file.text()
                    const diskData = JSON.parse(text)
                    return { ids: diskData.ids.slice(0, 4) }
                }
                return { ids: [] }
            },
            { body: t.Object({ id: t.String(), limit: t.String() }) }
        )
        .get("/thing/info/:thingId",
            async ({ params: { thingId } }: { params: { thingId: string } }) => {
                const file = Bun.file(path.resolve("./data/thing/info/", thingId + ".json"))
                const text = await file.text()
                return Response.json(JSON.parse(text))
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
        .post(
            "/gift/getreceived",
            async ({ body: { userId } }: { body: { userId: string } }) => {
                const file = Bun.file(path.resolve("./data/person/gift/", userId + ".json"))
                const text = await file.text()
                return Response.json(JSON.parse(text))
            },
            { body: t.Object({ userId: t.String() }) }
        )
        .get("/forum/favorites",
            () => forumsData
        )
        .get("/forum/forum/:id", async ({ params: { id } }: { params: { id: string } }) => {
            const file = Bun.file(path.resolve("./data/forum/forum/", id + ".json"))
            const text = await file.text()
            return Response.json(JSON.parse(text))
        })
        .get("/forum/thread/:id", async ({ params: { id } }: { params: { id: string } }) => {
            const file = Bun.file(path.resolve("./data/forum/thread/", id + ".json"))
            const text = await file.text()
            return Response.json(JSON.parse(text))
        })
        .post(
            "/forum/forumid",
            ({ body: { forumName } }: { body: { forumName: string } }) => {
                return { ok: true, forumId: "629158392f5bde05e84386d0" } // canned boardtown
            },
            { body: t.Object({ forumName: t.String() }) }
        )
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
            console.log(error)
        })
        .listen({
            hostname: config.HOST,
            port: config.PORT_API,
        })

    console.log(`🦊 API server: http://${app.server?.hostname}:${app.server?.port}/swagger`)
    return app
}
