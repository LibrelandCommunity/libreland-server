/**
 * Game server implementation for Anyland server emulation.
 * This server provides API endpoints and CDN functionality for area bundles,
 * thing definitions, and user-generated content images.
 * @module game-server
 */

import { join } from "path";
import { Application, Router } from "oak";
import { AreaInfoSchema } from "./lib/schemas.ts";

/** API hostname for the main application server */
const HOSTNAME_API = "app.anyland.com"
/** CDN hostname for thing definitions */
const HOSTNAME_CDN_THINGDEFS = "d6ccx151yatz6.cloudfront.net"
/** CDN hostname for area bundles */
const HOSTNAME_CDN_AREABUNDLES = "d26e4xubm8adxu.cloudfront.net"

// TODO validate env
/** Host configuration from environment */
const HOST = Deno.env.get("HOST")
/** API server port */
const PORT_API = parseInt(Deno.env.get("PORT_API") || "3000")
/** Thing definitions CDN server port */
const PORT_CDN_THINGDEFS = parseInt(Deno.env.get("PORT_CDN_THINGDEFS") || "3001")
/** Area bundles CDN server port */
const PORT_CDN_AREABUNDLES = parseInt(Deno.env.get("PORT_CDN_AREABUNDLES") || "3002")
/** User-generated content images CDN server port */
const PORT_CDN_UGCIMAGES = parseInt(Deno.env.get("PORT_CDN_UGCIMAGES") || "3003")

/**
 * Generates a MongoDB-style ObjectId
 * @param timestamp - Unix timestamp in milliseconds
 * @param machineId - Identifier for the machine generating the ID
 * @param processId - Process identifier
 * @param counter - Increment counter for uniqueness
 * @returns A 24-character hexadecimal ID string
 */
const generateObjectId_ = (timestamp: number, machineId: number, processId: number, counter: number) => {
    const hexTimestamp = Math.floor(timestamp / 1000).toString(16).padStart(8, '0');
    const hexMachineId = machineId.toString(16).padStart(6, '0');
    const hexProcessId = processId.toString(16).padStart(4, '0');
    const hexCounter = counter.toString(16).padStart(6, '0');

    return hexTimestamp + hexMachineId + hexProcessId + hexCounter;
}

/** Counter for generating unique ObjectIds */
let objIdCounter = 0;
/**
 * Generates a new ObjectId using current timestamp and incremental counter
 * @returns A unique 24-character hexadecimal ID string
 */
const generateObjectId = () => generateObjectId_(Date.now(), 0, 0, objIdCounter++)

/** Array storing area information including name, description, ID, and player count */
const areaIndex: { name: string, description?: string, id: string, playerCount: number }[] = [];
/** Map of URL-friendly area names to their corresponding IDs */
const areaByUrlName = new Map<string, string>()
const files = Array.from(Deno.readDirSync("./data/area/info"));

console.log("building area index...")
for (const file of files) {
    if (!file.isFile) continue;

    const fileContent = await Deno.readTextFile(join("./data/area/info", file.name));
    const areaInfo = await AreaInfoSchema.parseAsync(JSON.parse(fileContent));
    const areaId = file.name.split('.')[0];
    const areaUrlName = areaInfo.name.replace(/[^-_a-z0-9]/g, "")

    areaByUrlName.set(areaUrlName, areaId);
    areaIndex.push({
        name: areaInfo.name,
        description: areaInfo.description,
        id: areaId,
        playerCount: 0,
    });
}
console.log("done")

/**
 * Searches for areas matching the given search term
 * @param term - Search term to match against area names
 * @returns Array of matching area information
 */
const searchArea = (term: string) => {
    return areaIndex.filter(a => a.name.includes(term))
}

/**
 * Finds an area ID by its URL-friendly name
 * @param areaUrlName - URL-friendly area name
 * @returns Area ID if found, undefined otherwise
 */
const findAreaByUrlName = (areaUrlName: string) => {
    return areaByUrlName.get(areaUrlName)
}

// Create API router
const router = new Router();

/**
 * Logging middleware that logs request information
 * @param ctx - Request context
 * @param next - Next middleware function
 */
const loggerMiddleware = async (ctx: any, next: () => Promise<void>) => {
    console.info(JSON.stringify({
        ts: new Date().toISOString(),
        ip: ctx.request.headers.get('X-Real-Ip'),
        ua: ctx.request.headers.get("User-Agent"),
        method: ctx.request.method,
        url: ctx.request.url,
    }));
    try {
        await next();
    } catch (err) {
        console.error("Error in middleware!", ctx.request.url);
        console.error(err);
        throw err;
    }
};

// Routes
router
    /**
     * Authentication endpoint to start a session
     * Returns player information and session details
     */
    .post('/auth/start', async (ctx) => {
        // TODO: Implement cookie handling
        ctx.response.body = {
            vMaj: 188,
            vMinSrv: 1,
            personId: generateObjectId(),
            homeAreaId: '5773cf9fbdee942c18292f08',
            screenName: 'singleplayer explorer',
            statusText: 'exploring around',
            isFindable: true,
            age: 2226,
            ageSecs: 192371963,
            attachments: '{}',
            isSoftBanned: false,
            showFlagWarning: false,
            flagTags: [],
            areaCount: 1,
            thingTagCount: 1,
            allThingsClonable: true,
            achievements: [],
            hasEditTools: true,
            hasEditToolsPermanently: false,
            editToolsExpiryDate: '2024-01-30T15:26:27.720Z',
            isInEditToolsTrial: true,
            wasEditToolsTrialEverActivated: true,
            customSearchWords: ''
        };
    })
    /**
     * Area loading endpoint
     * Loads area data by ID or URL-friendly name
     */
    .post('/area/load', async (ctx) => {
        const body = await ctx.request.body().value;
        const { areaId, areaUrlName } = body;

        if (areaId) {
            try {
                const content = await Deno.readTextFile(join("./data/area/load/", areaId + ".json"));
                ctx.response.body = JSON.parse(content);
            } catch {
                console.error("couldn't find area", areaId, "on disk?");
                ctx.response.body = { ok: false, _reasonDenied: "Private", serveTime: 13 };
            }
        } else if (areaUrlName) {
            const foundAreaId = findAreaByUrlName(areaUrlName);
            console.log("client asked to load", areaUrlName, " - found", foundAreaId);

            if (foundAreaId) {
                try {
                    const content = await Deno.readTextFile(join("./data/area/load/", foundAreaId + ".json"));
                    ctx.response.body = JSON.parse(content);
                } catch {
                    ctx.response.body = { ok: false, _reasonDenied: "Private", serveTime: 13 };
                }
            } else {
                ctx.response.body = { ok: false, _reasonDenied: "Private", serveTime: 13 };
            }
        } else {
            console.error("client asked for neither an areaId or an areaUrlName?");
            ctx.response.body = { ok: false, _reasonDenied: "Private", serveTime: 13 };
        }
    })
    /**
     * Area search endpoint
     * Searches areas by term or creator ID
     */
    .post('/area/search', async (ctx) => {
        const { term, byCreatorId } = await ctx.request.body().value;

        if (byCreatorId) {
            try {
                const content = await Deno.readTextFile(join("./data/person/areasearch/", byCreatorId + ".json"));
                ctx.response.body = JSON.parse(content);
            } catch {
                ctx.response.body = { areas: [], ownPrivateAreas: [] };
            }
        } else {
            const matchingAreas = searchArea(term);
            ctx.response.body = {
                areas: matchingAreas,
                ownPrivateAreas: []
            };
        }
    });

// Create the main API application
const app = new Application();
app.use(loggerMiddleware);
app.use(router.routes());
app.use(router.allowedMethods());

// Start the servers
console.log("Starting servers...");

/**
 * Main API server instance
 * Handles authentication, area loading, and search functionality
 */
app.listen({ port: PORT_API });
console.log(`🦊 API server is running on port ${PORT_API}...`);

/**
 * Area bundles server instance
 * Serves area bundle data for game world loading
 */
const appAreaBundles = new Application();
const routerAreaBundles = new Router();

/**
 * Area bundle retrieval endpoint
 * @param areaId - Unique identifier for the area
 * @param areaKey - Key for the specific bundle within the area
 * @returns JSON bundle data or 404 if not found
 */
routerAreaBundles.get('/:areaId/:areaKey', async (ctx) => {
    const { areaId, areaKey } = ctx.params;
    try {
        const content = await Deno.readTextFile(join("./data/area/bundle/", areaId, areaKey + ".json"));
        ctx.response.body = JSON.parse(content);
    } catch {
        ctx.response.status = 404;
        ctx.response.body = "Area bundle not found";
    }
});

appAreaBundles.use(loggerMiddleware);
appAreaBundles.use(routerAreaBundles.routes());
appAreaBundles.use(routerAreaBundles.allowedMethods());

appAreaBundles.listen({ port: PORT_CDN_AREABUNDLES });
console.log(`🦊 AreaBundles server is running on port ${PORT_CDN_AREABUNDLES}...`);

/**
 * Thing definitions server instance
 * Serves object/thing definitions for game assets
 */
const appThingDefs = new Application();
const routerThingDefs = new Router();

/**
 * Thing definition retrieval endpoint
 * @param thingId - Unique identifier for the thing/object
 * @returns JSON thing definition or empty string if not found
 */
routerThingDefs.get('/:thingId', async (ctx) => {
    const { thingId } = ctx.params;
    try {
        const content = await Deno.readTextFile(join("./data/thing/def/", thingId + ".json"));
        ctx.response.body = JSON.parse(content);
    } catch {
        console.error("client asked for a thingdef not on disk!!", thingId);
        ctx.response.body = "";
    }
});

appThingDefs.use(loggerMiddleware);
appThingDefs.use(routerThingDefs.routes());
appThingDefs.use(routerThingDefs.allowedMethods());

appThingDefs.listen({ port: PORT_CDN_THINGDEFS });
console.log(`🦊 ThingDefs server is running on port ${PORT_CDN_THINGDEFS}...`);

/**
 * User-generated content images server instance
 * Serves user-uploaded images and content
 */
const appUgcImages = new Application();
const routerUgcImages = new Router();

/**
 * UGC image retrieval endpoint
 * @param part1 - First part of the image identifier
 * @param part2 - Second part of the image identifier
 * @returns PNG image data or 404 HTML if not found
 */
routerUgcImages.get('/:part1/:part2', async (ctx) => {
    const { part1, part2 } = ctx.params;
    try {
        const content = await Deno.readTextFile(join("../archiver/images/", `${part1}_${part2}.png`));
        ctx.response.body = JSON.parse(content);
    } catch {
        ctx.response.status = 404;
        ctx.response.body = "<html><head><title>404 Not Found</title></head><body><h1>Not Found</h1></body></html>";
    }
});

appUgcImages.use(loggerMiddleware);
appUgcImages.use(routerUgcImages.routes());
appUgcImages.use(routerUgcImages.allowedMethods());

appUgcImages.listen({ port: PORT_CDN_UGCIMAGES });
console.log(`🦊 UGC Images server is running on port ${PORT_CDN_UGCIMAGES}...`);
