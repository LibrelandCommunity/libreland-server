import { join } from "path";
import { Application, Router } from "oak";
import { AreaInfoSchema } from "./lib/schemas.ts";

const HOSTNAME_API = "app.anyland.com"
const HOSTNAME_CDN_THINGDEFS = "d6ccx151yatz6.cloudfront.net"
const HOSTNAME_CDN_AREABUNDLES = "d26e4xubm8adxu.cloudfront.net"

// TODO validate env
const HOST = Deno.env.get("HOST")
const PORT_API = parseInt(Deno.env.get("PORT_API") || "3000")
const PORT_CDN_THINGDEFS = parseInt(Deno.env.get("PORT_CDN_THINGDEFS") || "3001")
const PORT_CDN_AREABUNDLES = parseInt(Deno.env.get("PORT_CDN_AREABUNDLES") || "3002")
const PORT_CDN_UGCIMAGES = parseInt(Deno.env.get("PORT_CDN_UGCIMAGES") || "3003")

const generateObjectId_ = (timestamp: number, machineId: number, processId: number, counter: number) => {
    const hexTimestamp = Math.floor(timestamp / 1000).toString(16).padStart(8, '0');
    const hexMachineId = machineId.toString(16).padStart(6, '0');
    const hexProcessId = processId.toString(16).padStart(4, '0');
    const hexCounter = counter.toString(16).padStart(6, '0');

    return hexTimestamp + hexMachineId + hexProcessId + hexCounter;
}

let objIdCounter = 0;
const generateObjectId = () => generateObjectId_(Date.now(), 0, 0, objIdCounter++)

const areaIndex: { name: string, description?: string, id: string, playerCount: number }[] = [];
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

const searchArea = (term: string) => {
    return areaIndex.filter(a => a.name.includes(term))
}
const findAreaByUrlName = (areaUrlName: string) => {
    return areaByUrlName.get(areaUrlName)
}

// Create API router
const router = new Router();

// Logging middleware
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

// Start API server
app.listen({ port: PORT_API });
console.log(`🦊 API server is running on port ${PORT_API}...`);

// Create and start area bundles server
const appAreaBundles = new Application();
const routerAreaBundles = new Router();

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

// Create and start thing definitions server
const appThingDefs = new Application();
const routerThingDefs = new Router();

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

// Create and start UGC images server
const appUgcImages = new Application();
const routerUgcImages = new Router();

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
