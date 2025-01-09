import * as path from "node:path"
import { Elysia, t } from 'elysia'
import * as fs from "node:fs/promises";
import { AreaInfoSchema } from "./lib/schemas";

const HOSTNAME_API = "app.anyland.com"
const HOSTNAME_CDN_THINGDEFS = "d6ccx151yatz6.cloudfront.net"
const HOSTNAME_CDN_AREABUNDLES = "d26e4xubm8adxu.cloudfront.net"



// TODO validate env
const HOST = process.env.HOST
const PORT_API = process.env.PORT_API
const PORT_CDN_THINGDEFS = process.env.PORT_CDN_THINGDEFS
const PORT_CDN_AREABUNDLES = process.env.PORT_CDN_AREABUNDLES
const PORT_CDN_UGCIMAGES = process.env.PORT_CDN_UGCIMAGES





const generateObjectId_ = (timestamp: number, machineId: number, processId: number, counter: number) => {
    const hexTimestamp = Math.floor(timestamp / 1000).toString(16).padStart(8, '0');
    const hexMachineId = machineId.toString(16).padStart(6, '0');
    const hexProcessId = processId.toString(16).padStart(4, '0');
    const hexCounter = counter.toString(16).padStart(6, '0');

    return hexTimestamp + hexMachineId + hexProcessId + hexCounter;
}


let objIdCounter = 0;
const generateObjectId = () => generateObjectId_(Date.now(), 0, 0, objIdCounter++)


const areaIndex: {name: string, description?: string, id: string, playerCount: number }[] = [];
const areaByUrlName = new Map<string, string>()
const files = await fs.readdir("./data/area/info");

console.log("building area index...")
for (let i = 0; i <= files.length; i++) {
    const filename = files[i];

    const file = Bun.file(path.join("./data/area/info", filename))

    if (!await file.exists()) continue;

    const areaInfo = await file.json().then(AreaInfoSchema.parseAsync)
    const areaId = path.parse(filename).name
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


const app = new Elysia()
    .onRequest(({ request }) => {
        console.info(JSON.stringify({
            ts: new Date().toISOString(),
            ip: request.headers.get('X-Real-Ip'),
            ua: request.headers.get("User-Agent"),
            method: request.method,
            url: request.url,
        }));
    })
    .onError(({ code, error, request}) => {
        console.info("error in middleware!", request.url, code);
        console.log(error);
    })
    .onTransform(( { request, path, body, params }) => {
        console.log(request.method, path, { body, params })
    })
    .post('/auth/start', ({ cookie: { s } }) => {
        // I'm setting a hardcoded cookie here because this is read-only so I don't care about user sessions,
        // but we can very easily save a player session here. We just need to be given an account token of sorts (or keep the session forever).
        // The client only looks for a `set-cookie` on `s`.
        s.value = "s%3AtbpGGrOdcHy1REgxa1gnD-npvGihWmBT.XynxEe6TsRGW8qif%2BxS2KQC9ryX%2F44CdhQKSNL0hsZc";
        s.httpOnly = true;

        const playerId = generateObjectId()

        return {
            vMaj: 188,
            vMinSrv: 1,
            personId:   playerId,
            homeAreaId: '5773cf9fbdee942c18292f08', // sunbeach
            screenName: 'singleplayer explorer',
            statusText: 'exploring around (my id: ' + playerId + ')',
            isFindable: true,
            age: 2226,
            ageSecs: 192371963,
            attachments: '{"0":{"Tid":"58a983128ca4690c104b6404","P":{"x":0,"y":0,"z":-1.4901161193847656e-7},"R":{"x":0,"y":0,"z":0}},"2":{"Tid":"58965e04569548a0132feb5e","P":{"x":-0.07462535798549652,"y":0.17594149708747864,"z":0.13412480056285858},"R":{"x":87.7847671508789,"y":73.62593841552734,"z":99.06474304199219}},"6":{"Tid":"58a25965b5fa68ae13841fb7","P":{"x":-0.03214322030544281,"y":-0.028440749272704124,"z":-0.3240281939506531},"R":{"x":306.4596862792969,"y":87.87753295898438,"z":94.79550170898438}},"7":{"Tid":"58965dfd9e2733c413d68d05","P":{"x":0.0267937108874321,"y":-0.03752899169921875,"z":-0.14691570401191711},"R":{"x":337.77911376953125,"y":263.3216857910156,"z":78.18708038330078}}}',
            isSoftBanned: false,
            showFlagWarning: false,
            flagTags: [],
            areaCount: 1,
            thingTagCount: 1,
            allThingsClonable: true,
            achievements: [
                30, 7, 19, 4, 20, 11, 10,
                5, 9, 17, 13, 12, 16, 37,
                34, 35, 44, 31, 15, 27, 28
            ],
            hasEditTools: true,
            hasEditToolsPermanently: false,
            editToolsExpiryDate: '2024-01-30T15:26:27.720Z',
            isInEditToolsTrial: true,
            wasEditToolsTrialEverActivated: true,
            customSearchWords: ''
        }
    })
    .post( "/p", () => ({ "vMaj": 188, "vMinSrv": 1 }) )
    .post(
        "/area/load",
        async ({ body: { areaId, areaUrlName } }) => {
            if (areaId) {
                const file = Bun.file(path.resolve("./data/area/load/", areaId + ".json"))
                if (await file.exists()) {
                    return await file.json()
                }
                else {
                    console.error("couldn't find area", areaId, "on disk?")
                    return Response.json({ "ok": false, "_reasonDenied": "Private", "serveTime": 13 }, { status: 200 })
                }
            }
            else if (areaUrlName) {
                const areaId = findAreaByUrlName(areaUrlName)
                console.log("client asked to load", areaUrlName, " - found", areaId);

                if (areaId) {
                    console.error("couldn't find area", areaUrlName, "in our index?")
                    return await Bun.file(path.resolve("./data/area/load/" + areaId + ".json")).json()
                }
                else {
                    return Response.json({ "ok": false, "_reasonDenied": "Private", "serveTime": 13 }, { status: 200 })
                }
            }

            console.error("client asked for neither an areaId or an areaUrlName?")
            // Yeah that seems to be the default response, and yeah it returns a 200 OK
            return Response.json({ "ok": false, "_reasonDenied": "Private", "serveTime": 13 }, { status: 200 })
        },
        { body: t.Object({ areaId: t.Optional(t.String()), areaUrlName: t.Optional(t.String()), isPrivate: t.String() }) }
    )
    .post(
        "/area/info",
        ({body: { areaId }}) => Bun.file(path.resolve("./data/area/info/", areaId + ".json")).json(),
        { body: t.Object({ areaId: t.String() }) }
    )
    .post(
        "/area/getsubareas",
        async ({body: { areaId }}) => {
            const file = Bun.file(path.resolve("./data/area/subareas/", areaId + ".json"))
            if (await file.exists()) {
                return await file.json()
            }
            else {
                return { subAreas: [] }
            }
        },
        { body: t.Object({ areaId: t.String() }) }
    )
    .post(
        "/area/lists",
        ({}) => {
            return canned_areaList;
        }
    )
    .post(
        "/area/search",
        async ({body: { term, byCreatorId }}) => {
            if (byCreatorId) {
                const file = Bun.file(path.resolve("./data/person/areasearch/", byCreatorId + ".json"))

                if (await file.exists()) {
                    return await file.json()
                }
                else {
                    return { areas: [], ownPrivateAreas: [] }
                }
            }
            else {
                const matchingAreas = searchArea(term);

                return {
                    areas: matchingAreas,
                    ownPrivateAreas: []
                }
            }

        },
        { body: t.Object({ term: t.String(), byCreatorId: t.Optional(t.String()) }) }
    )
    .post(
        "/placement/info",
        ({body: { areaId, placementId }}) => Bun.file(path.resolve("./data/placement/info/", areaId, placementId + ".json")).json(),
        { body: t.Object({ areaId: t.String(), placementId: t.String() }) }
    )
    .get("person/friendsbystr",
        () => canned_friendsbystr
    )
    .post("person/info",
        async ({ body: { areaId, userId } }) => {
            const file = Bun.file(path.resolve("./data/person/info/", userId + ".json"))

            if (await file.exists()) {
                return await file.json()
            }
            else {
                return { "isFriend": false, "isEditorHere": false, "isListEditorHere": false, "isOwnerHere": false, "isAreaLocked": false, "isOnline": false }
            }
        },
        { body: t.Object({ areaId: t.String(), userId: t.String() }) }
    )
    .post("/person/infobasic",
        async ({ body: { areaId, userId } }) => {
            return { "isEditorHere": false}
        },
        { body: t.Object({ areaId: t.String(), userId: t.String() }) }
    )
    .get("/inventory/:page",
        () => {
            return { "inventoryItems": null }
        },
    )
    .post("/thing", async ({ body }) => {
        console.log("user asked to create a thing", body)
        return new Response("Not implemented", { status: 500 })
    },
    {
        body: t.Unknown()
    })
    .post("/thing/topby",
        async ({ body: { id } }) => {
            const file = Bun.file(path.resolve("./data/person/topby/", id + ".json"))

            if (await file.exists()) {
                const diskData = await file.json()
                return { ids: diskData.ids.slice(0, 4) }
            }
            else {
                return { ids: [] }
            }
        },
        { body: t.Object({ id: t.String(), limit: t.String() }) }
    )
    .get("/thing/info/:thingId",
        ({params: { thingId }}) => Bun.file(path.resolve("./data/thing/info/", thingId + ".json")).json(),
    )
    .get("/thing/sl/tdef/:thingId",
        ({params: { thingId }}) => Bun.file(path.resolve("./data/thing/def/", thingId + ".json")).json(),
    )
    .post(
        "/thing/gettags",
        ({body: { thingId }}) => Bun.file(path.resolve("./data/thing/tags/", thingId + ".json")).json(),
        { body: t.Object({ thingId: t.String() }) }
    )
    .post(
        "/thing/getflag",
        ({}) => ({ isFlagged: false }),
        { body: t.Object({ id: t.String() }) }
    )
    .post(
        "/gift/getreceived",
        ({body: { userId }}) => Bun.file(path.resolve("./data/person/gift/", userId + ".json")),
        { body: t.Object({ userId: t.String() }) }
    )
    .get("/forum/favorites",
        () => {
            return canned_forums_favorites
        }
    )
    .get("/forum/forum/:id", ({params: { id }}) => Bun.file(path.resolve("./data/forum/forum/", id + ".json")).json() )
    .get("/forum/thread/:id", ({params: { id }}) => Bun.file(path.resolve("./data/forum/thread/", id + ".json")).json() )
	.listen({
        hostname: HOST,
        port: PORT_API,
    })

console.log(`🦊 API server is running at on port ${app.server?.port}...`)








const app_areaBundles = new Elysia()
    .onRequest(({ request }) => {
        console.info(JSON.stringify({
            server: "AREABUNDLES",
            ts: new Date().toISOString(),
            ip: request.headers.get('X-Real-Ip'),
            ua: request.headers.get("User-Agent"),
            method: request.method,
            url: request.url,
        }));
    })
    .onError(({ code, error }) => {
        console.info("error in middleware!", code, error.message);
    })
    .get(
        "/:areaId/:areaKey", // TODO: areaKeys all seem to start with "rr"
        async ({ params: { areaId, areaKey } }) => {
            const file = Bun.file(path.resolve("./data/area/bundle/", areaId, areaKey + ".json"));

            if (await file.exists()) {
                return await file.json()
            }
            else {
                return new Response("Area bundle not found", { status: 404 })
            }
        },
    )
	.listen({
        hostname: HOST,
        port: PORT_CDN_AREABUNDLES
    })
;
console.log(`🦊 AreaBundles server is running at on port ${app_areaBundles.server?.port}...`)


const app_thingDefs = new Elysia()
    .onRequest(({ request }) => {
        console.info(JSON.stringify({
            server: "THINGDEFS",
            ts: new Date().toISOString(),
            ip: request.headers.get('X-Real-Ip'),
            ua: request.headers.get("User-Agent"),
            method: request.method,
            url: request.url,
        }));
    })
    .onError(({ code, error }) => {
        console.info("error in middleware!", code, error.message);
    })
    .get(
        "/:thingId",
        async ({ params: { thingId } }) => {
            const file = Bun.file(path.resolve("./data/thing/def/", thingId + ".json"));
            if (await file.exists()) {
                try {
                    return await file.json();

                }
                catch (e) {
                    return Response.json("", { status: 200 })
                }
            }
            else {
                console.error("client asked for a thingdef not on disk!!", thingId)
                //return new Response("Thingdef not found", { status: 404 })
                return Response.json("", { status: 200 })
            }

        }
    )
	.listen({
        hostname: HOST,
        port: PORT_CDN_THINGDEFS,
    })
;
console.log(`🦊 ThingDefs server is running at on port ${app_thingDefs.server?.port}...`)



const app_ugcImages = new Elysia()
    .onRequest(({ request }) => {
        console.info(JSON.stringify({
            server: "UGCIMAGES",
            ts: new Date().toISOString(),
            ip: request.headers.get('X-Real-Ip'),
            ua: request.headers.get("User-Agent"),
            method: request.method,
            url: request.url,
        }));
    })
    .onError(({ code, error }) => {
        console.info("error in middleware!", code, error.message);
    })
    .get(
        "/:part1/:part2/",
        async ({ params: { part1, part2 } }) => {
            const file = Bun.file(path.resolve("../archiver/images/", `${part1}_${part2}.png`));

            if (await file.exists()) {
                try {
                    return await file.json();
                }
                catch (e) {
                    return new Response("<html><head><title>404 Not Found</title></head><body><h1>Not Found</h1></body></html>", { status: 404 })
                }
            }
            else {
                console.error("client asked for an ugc image not on disk!!", part1, part2)
                return new Response("<html><head><title>404 Not Found</title></head><body><h1>Not Found</h1></body></html>", { status: 404 })
            }

        }
    )
	.listen({
        hostname: HOST,
        port: PORT_CDN_UGCIMAGES,
    })
;
console.log(`🦊 ugcImages server is running at on port ${app_ugcImages.server?.port}...`)










// canned data goes here

const canned_areaList = {
    "visited": [
        { "id": "58181d33160c0d921301ea5f", "name": "nightclub raves-parties-fun", "description": "rave, party, meet and chat with new people, play music, and have fun on stage as the dj!!!", "playerCount": 0 }, { "id": "5debf46f94e24b0625f09a21", "name": "mol4yn's home", "playerCount": 0 },
        { "id": "6345eb6dea96ba05dd2de915", "name": "bloodangelofwar's home", "playerCount": 0 },
        { "id": "5875bb2d64af5e8f13bd4c72", "name": "h4ck3r c3ntr4l", "playerCount": 0 },
        { "id": "577610d2bdee942c18292f22", "name": "bluecastle", "description": "a medieval castle in a nature setting, with bow game", "playerCount": 0 },
        { "id": "5e1050c8614b36062d5e0fa3", "name": "past competitions", "playerCount": 0 },
        { "id": "57f8540e026a89c21319cd6f", "name": "sparky inc", "playerCount": 0 },
        { "id": "583d8e2428ea7b72133ae5ee", "name": "974 ile de la reunion", "playerCount": 0 },
        { "id": "5c97927c0a4c314e0a6d8fcf", "name": "the best troller for ever's home", "playerCount": 0 },
        { "id": "59c864b6dae5a6941f9941a4", "name": "angrylittledeadgirl's home", "playerCount": 0 },
        { "id": "58d04f0507f8e21e105c70e3", "name": "the pet shop", "playerCount": 0 },
        { "id": "58b2fe6148625b9613320bb1", "name": "spiders apartment", "playerCount": 0 },
        { "id": "57e27359406966d70fc7c694", "name": "target range", "description": "play a game of target practice!", "playerCount": 0 },
        { "id": "5b763bfe3a1362760154f13e", "name": "vr vr board game", "playerCount": 0 },
        { "id": "5b815fe42f0ce47ae2901db8", "name": "coruscant", "playerCount": 0 },
        { "id": "5eaa2a0309f82b7b2456bbe0", "name": "haunted woods trails 4 - ravenswich", "description": "haunted, halloween, scary, dark, victorian, horror, frights, lovecraft", "playerCount": 0 },
        { "id": "57f8e735bc75113c12ba8c45", "name": "weapon collection", "description": "gallery one", "playerCount": 0 },
        { "id": "58a1ecd55c0ebbd513686d5a", "name": "hyrule adventure map", "description": "welcome to hyrule an adventure of fun and monster slaying", "playerCount": 0 },
        { "id": "57b1a5403a204055538212e3", "name": "central cinema", "description": "watch movies on a cinema screen, relax and chill", "playerCount": 0 }
    ],
    "created": [ ],
    "totalOnline": 0,
    "totalAreas": 44182,
    "totalPublicAreas": 32948,
    "totalSearchablePublicAreas": 32835,
    "popular": [
        { "name": "buildtown", "description": "welcome to this area to help with your first building tries and chat! a place to find friends, too.", "id": "57f67019817496af5268f719", "playerCount": 0 },
        { "name": "the future", "description": "space", "id": "58158ca9b5cfcb54137342db", "playerCount": 0 },
        { "name": "nightclub raves-parties-fun", "description": "rave, party, meet and chat with new people, play music, and have fun on stage as the dj!!!", "id": "58181d33160c0d921301ea5f", "playerCount": 0 },
        { "name": "bluecastle", "description": "a medieval castle in a nature setting, with bow game", "id": "577610d2bdee942c18292f22", "playerCount": 0 },
        { "name": "fazzi's home", "description": "fazzis apartment. alley, city, urban. shops. ", "id": "5871a13c6d204d1110ee0e07", "playerCount": 0 },
        { "name": "anywhere", "description": "a hub world to other worlds", "id": "57f850ae668fbacd13637778", "playerCount": 0 },
        { "name": "vault 112 - entrance", "description": "vault 112 entrance and wasteland!", "id": "589269cab37feaae13bf02f5", "playerCount": 0 },
        { "name": "body shop", "description": "free to use heads, bodies, arms. many accessories and clonables. fazzis.", "id": "58e36deffb5e0bb113a068bc", "playerCount": 0 },
        { "name": "central cinema", "description": "watch movies on a cinema screen, relax and chill", "id": "57b1a5403a204055538212e3", "playerCount": 0 },
        { "name": "haunted woods trails", "description": "a haunted trail of frights for halloween, with haunted house", "id": "5973d74703f844a4138903ae", "playerCount": 0 },
        { "name": "noobzone", "id": "57fb13b223bde029116f91ed", "playerCount": 0 },
        { "name": "the underground", "description": "labyrinth, caves, catacombs, dungeon, puzzle, adventure", "id": "58c5afab54ad76a01374fbd0", "playerCount": 0 }, { "name": "bar whirl", "description": "relax and chat! with video screen to play music, and a stage for entertainment and games", "id": "5778c9f454ed9032183cd348", "playerCount": 0 },
        { "name": "overworld", "description": "a world of worlds", "id": "5810f5b56af01ae90f753f8e", "playerCount": 0 },
        { "name": "mrleadfellow's home", "description": "houseparty", "id": "57fef2577f96509e1cc5342d", "playerCount": 0 },
        { "name": "lunopolis", "description": "adventure, rpg, equips, avatars, weapons, bosses, new player tutorials. fun, art!", "id": "5833c783806faf7213ebdcb4", "playerCount": 0 },
        { "name": "welcome-town", "id": "58037a75e0f5aa4e139143b3", "playerCount": 0 },
        { "name": "hypercub3", "description": "escape puzzle game...eventually", "id": "5987169874ed51eb494633f5", "playerCount": 0 },
        { "name": "dataspace", "id": "5c469ae6231fb132b7b1d25c", "playerCount": 0 },
        { "name": "vault 112 - interior", "description": "the interior of vault 112", "id": "5ab190cc82515d254e2c6050", "playerCount": 0 },
        { "name": "stretching room", "description": "spooky fun with the haunted mansion stetching room.", "id": "59b19637f45aa620104ef3de", "playerCount": 0 },
        { "name": "rustybot's home", "description": "a nature park at the heart of the rusty prime system", "id": "5bb6693c236557585f156459", "playerCount": 0 },
        { "name": "electronics", "description": "electrweather", "id": "57f6929bf6412bed1388c8b5", "playerCount": 0 },
        { "name": "a fox place", "description": "still work in progress.  -waranto the fox", "id": "5800d5b6c4a3ed6113da50d8", "playerCount": 0 },
        { "name": "sunbeach", "description": "relax and enjoy the sun! chat to the sound of waves and campfire", "id": "5773cf9fbdee942c18292f08", "playerCount": 0 },
        { "name": "fazzis island", "id": "587b448611054fae258933de", "playerCount": 0 },
        { "name": "heads n more", "description": "find heads and bodies, including desktop bodies", "id": "577d064d54ed9032183cd360", "playerCount": 0 },
        { "name": "jinx mansion", "description": "hangout house probably not haunted... much.", "id": "58291608f83d7a125f4aa898", "playerCount": 0 },
        { "name": "inside the tardis", "description": "its bigger on the inside", "id": "5805c37fc49961cf28d6aae2", "playerCount": 0 },
        { "name": "church of philipp", "description": "praise philipp!", "id": "589df93de1e50591133c2d0f", "playerCount": 0 }
    ],
    "popular_rnd": [
        { "name": "music hall", "id": "577678662da36d2d18b87125", "playerCount": 0 },
        { "name": "space tennis", "id": "5854ccb19a68103f1da79974", "playerCount": 0 },
        { "name": "mount salvation", "id": "5ad3bc37da19370ff4b68b36", "playerCount": 0 },
        { "name": "louis' workshop", "id": "5a99be436a694a0071ba0bf1", "playerCount": 0 },
        { "name": "experiments", "id": "58f97d73aea6392a104f650e", "playerCount": 0 },
        { "name": "stretching room", "description": "spooky fun with the haunted mansion stetching room.", "id": "59b19637f45aa620104ef3de", "playerCount": 0 },
        { "name": "desert tour", "description": "a simulation of a driving car.", "id": "5818b67374b6a3511336cf96", "playerCount": 0 },
        { "name": "redacted", "id": "587a4d3250243a5314e471fd", "playerCount": 0 },
        { "name": "venn diagrams", "id": "5898ea6434bdeb0e101ccbbe", "playerCount": 0 },
        { "name": "pvp arena", "id": "5844380f89f186eb1300a29e", "playerCount": 0 },
        { "name": "construction platform", "description": "a floating island to build on. delete your stuff before you leave.", "id": "5a874677c1023ed60f4117bd", "playerCount": 0 },
        { "name": "tower of infinity", "description": "death is coming for you", "id": "592784a02faaf6de139d7359", "playerCount": 0 },
        { "name": "fazzi's home", "description": "fazzis apartment. alley, city, urban. shops. ", "id": "5871a13c6d204d1110ee0e07", "playerCount": 0 },
        { "name": "the fortress", "description": "crimson's building tower above an ocean", "id": "5ccf7fa6a397673aa0965eea", "playerCount": 0 },
        { "name": "alterspace", "id": "597b15a1e5085fcd1342ef44", "playerCount": 0 },
        { "name": "mrleadfellow's home", "description": "houseparty", "id": "57fef2577f96509e1cc5342d", "playerCount": 0 },
        { "name": "space craft", "description": "work in progress", "id": "5c2f9e8c8436ee6f7daa6f4a", "playerCount": 0 },
        { "name": "newcomers", "id": "5b6f1758a28b7c74d11efc36", "playerCount": 0 },
        { "name": "the varga", "description": "the wildhunt dropship", "id": "589f9e1135aab8a413e9f4c0", "playerCount": 0 },
        { "name": "nightclub raves-parties-fun", "description": "rave, party, meet and chat with new people, play music, and have fun on stage as the dj!!!", "id": "58181d33160c0d921301ea5f", "playerCount": 0 },
        { "name": "fantasytest", "id": "588a867569b2d89713de6a2e", "playerCount": 0 },
        { "name": "wwe arena", "description": "work in progress", "id": "587278fddf57f4161805b985", "playerCount": 0 },
        { "name": "atticuskirk's home", "id": "592b919246d5c023103f16f8", "playerCount": 0 },
        { "name": "farm town", "id": "57fc3d1ed3cd9ce413772ccd", "playerCount": 0 },
        { "name": "claritys workshop", "id": "59e505c83ee0352e109335a0", "playerCount": 0 },
        { "name": "fazzis island", "id": "587b448611054fae258933de", "playerCount": 0 },
        { "name": "the bukkits home", "description": "the home of the bukkit", "id": "59ce8f892df64b1f2f1f38dd", "playerCount": 0 },
        { "name": "soda's spaceship", "id": "5cb143f1fb0ce72671539eb3", "playerCount": 0 },
        { "name": "gills broom closet", "id": "58d9a8cf5bb4e5fc2c0d4f0b", "playerCount": 0 },
        { "name": "black mesa", "id": "58a202e5b6b22189725e07e4", "playerCount": 0 },
        { "name": "alpine resort", "description": "relaxing hidaway", "id": "581bb08d07da8c6e5246caf3", "playerCount": 0 },
        { "name": "the abyss", "id": "59cebd14050b6ec61368135c", "playerCount": 0 },
        { "name": "nebulacn's home", "description": "nebula", "id": "57f8c8c34f6a7c6a15b3cbe7", "playerCount": 0 },
        { "name": "inside the tardis", "description": "its bigger on the inside", "id": "5805c37fc49961cf28d6aae2", "playerCount": 0 },
        { "name": "5 eme etage", "id": "58621f940156365c24f9bb3d", "playerCount": 0 }
    ],
    "newest": [
        { "name": "chill hour", "id": "658e368ceef71c05ae83a00d", "playerCount": 0 },
        { "name": "precipice of the doomed", "id": "6586520b97ab191580aedbaf", "playerCount": 0 },
        { "name": "delco & jinx warehouse", "description": "our inventory warehouse for the archive", "id": "65850611baa2b214c0065430", "playerCount": 0 },
        { "name": "pspace's home", "id": "657b08d535ac821583ea129d", "playerCount": 0 },
        { "name": "wix area", "id": "6578b85b5f4a7c05b2806677", "playerCount": 0 },
        { "name": "specworld", "id": "6574d048a5f43d14c216f63a", "playerCount": 0 },
        { "name": "vrvoyager's home", "id": "6572711406a08a158941619d", "playerCount": 0 },
        { "name": "toast's campsite", "id": "656cd727087f3205bdc5d7de", "playerCount": 0 },
        { "name": "the spectral room", "id": "6566bae6baa2b214c00653a7", "playerCount": 0 },
        { "name": "squiddles man's home", "id": "65635062212f9805c1e28354", "playerCount": 0 },
        { "name": "crestfallen", "id": "6562bcfaf728b5158137cef3", "playerCount": 0 },
        { "name": "chase shift's home", "id": "6548b27db68307529e02e0c5", "playerCount": 0 },
        { "name": "kittythebuilder's home", "id": "64e8ebfad1c51905d0df3296", "playerCount": 0 },
        { "name": "home 3446", "id": "64dd07d6f612c5266ca5ebd2", "playerCount": 0 },
        { "name": "sky's home", "id": "64dc4b06ad0a5926627a91df", "playerCount": 0 },
        { "name": "da king zone", "id": "64af99db3de4af05cdaa8636", "playerCount": 0 },
        { "name": "skineline9's home", "id": "64a5244f6dded147216a03a1", "playerCount": 0 },
        { "name": "road trip", "id": "649f8fdc3ae8af4720437665", "playerCount": 0 },
        { "name": "abel niga", "id": "64740a68ad0a5926627a8f73", "playerCount": 0 },
        { "name": "strglsses4's home", "id": "64583d2dad0a5926627a8f18", "playerCount": 0 },
        { "name": "andy's abode", "id": "6452399857775d05cbef9aaf", "playerCount": 0 },
        { "name": "vrmove561 23 1's home", "id": "644a5259e3b32576a3b7c3e3", "playerCount": 0 },
        { "name": "bloxland2", "id": "6439ae15de864005cac5cc02", "playerCount": 0 },
        { "name": "bloxland", "id": "64396a7e3cd4bf7e717ff3ec", "playerCount": 0 },
        { "name": "my castle 564", "id": "6438dab50cc2955eef0ddc02", "playerCount": 0 },
        { "name": "gordiy001's home", "id": "6429ddff583c177e70d25bbd", "playerCount": 0 },
        { "name": "raver's home", "id": "640b97c221481f05d9a914c9", "playerCount": 0 },
        { "name": "breon was here's home", "id": "63f9903c9c719a3d2f111a0a", "playerCount": 0 },
        { "name": "lucas's builds", "description": "all of my random builds", "id": "63e3bfd97a49dd5635df3582", "playerCount": 0 },
        { "name": "apelo's home", "id": "6394b14a63ab250464a536d5", "playerCount": 0 }
    ],
    "popularNew": [
        { "name": "chill hour", "id": "658e368ceef71c05ae83a00d", "playerCount": 0 }
    ],
    "popularNew_rnd": [
        { "name": "chill hour", "id": "658e368ceef71c05ae83a00d", "playerCount": 0 }
    ],
    "lively": [],
    "favorite": [],
    "mostFavorited": [
        { "name": "buildtown", "description": "welcome to this area to help with your first building tries and chat! a place to find friends, too.", "id": "57f67019817496af5268f719", "playerCount": 0 },
        { "name": "the future", "description": "space", "id": "58158ca9b5cfcb54137342db", "playerCount": 0 },
        { "name": "nightclub raves-parties-fun", "description": "rave, party, meet and chat with new people, play music, and have fun on stage as the dj!!!", "id": "58181d33160c0d921301ea5f", "playerCount": 0 },
        { "name": "fazzi's home", "description": "fazzis apartment. alley, city, urban. shops. ", "id": "5871a13c6d204d1110ee0e07", "playerCount": 0 },
        { "name": "vault 112 - entrance", "description": "vault 112 entrance and wasteland!", "id": "589269cab37feaae13bf02f5", "playerCount": 0 },
        { "name": "body shop", "description": "free to use heads, bodies, arms. many accessories and clonables. fazzis.", "id": "58e36deffb5e0bb113a068bc", "playerCount": 0 },
        { "name": "time keys", "description": "time machine transportation", "id": "5971bf1943c229ef3003f9fa", "playerCount": 0 },
        { "name": "any-land elevator", "id": "5a066f7f7319a6bc135d5ff4", "playerCount": 0 },
        { "name": "-ping me-", "description": "a place to ask your friends to ping you. (ping them and they'll ping you)", "id": "5add11ccec262303241d8883", "playerCount": 0 }
    ]
}

const canned_friendsbystr = {
    "online": {
        "friends": []
    },
    "offline": {
        "friends": [
            {
                "lastActivityOn": "2023-11-30T19:07:20.576Z",
                "screenName": "philipp",
                "statusText": "great meeting all of you! [board: philbox] ...",
                "id": "5773b5232da36d2d18b870fb",
                "isOnline": false,
                "strength": null
            }
        ]
    }
}

const canned_forums_favorites = {
    "forums": [
        {
            "name": "help",
            "description": "for all your anyland questions",
            "creatorId": "5773b5232da36d2d18b870fb",
            "creatorName": "philipp",
            "threadCount": 346,
            "latestCommentDate": "2023-12-21T09:35:12.880Z",
            "protectionLevel": 0,
            "creationDate": "2016-12-06T16:31:52.285Z",
            "dialogThingId": "58481eb85a0dc5b20d48e6f8",
            "dialogColor": "255,255,255",
            "latestCommentText": "this is epic!",
            "latestCommentUserId": "622d80e81ee78204797e0e4e",
            "latestCommentUserName": "Captain Crunch",
            "id": "5846f540e8593a971395c0aa"
        },
        {
            "name": "events",
            "description": "find and post dates for your events... parties, games, celebrations, anything!",
            "creatorId": "5773b5232da36d2d18b870fb",
            "creatorName": "philipp",
            "threadCount": 60,
            "latestCommentDate": "2023-10-08T20:42:08.929Z",
            "protectionLevel": 0,
            "creationDate": "2016-12-06T16:42:27.699Z",
            "dialogThingId": "5848394801371c5c136a9ea3",
            "dialogColor": "100,194,226",
            "latestCommentText": "penis fuck",
            "latestCommentUserId": "6003833e11e60605a2d7cb15",
            "latestCommentUserName": "Sheep",
            "id": "5846f54d5a84a62410ce2e66"
        },
        {
            "name": "updates",
            "description": "find out what's new with anylad. feature announcements and bug fix info. thanks all!",
            "creatorId": "5773b5232da36d2d18b870fb",
            "creatorName": "philipp",
            "threadCount": 426,
            "latestCommentDate": "2023-12-13T00:16:12.269Z",
            "protectionLevel": 1,
            "creationDate": "2016-12-06T15:17:21.186Z",
            "dialogThingId": "58483a3b5a0dc5b20d48e6fe",
            "dialogColor": "75,226,187",
            "latestCommentText": "im gonna miss it for sure",
            "latestCommentUserId": "57fa1a9a062bfb6013e320e9",
            "latestCommentUserName": "cet cherinyakov",
            "id": "5846f556b09fa5d709e5f6fe"
        },
        {
            "name": "showcase",
            "description": "",
            "creatorId": "5773b5232da36d2d18b870fb",
            "creatorName": "philipp",
            "threadCount": 217,
            "latestCommentDate": "2023-10-12T18:37:22.004Z",
            "protectionLevel": 0,
            "creationDate": "2016-12-06T15:17:21.186Z",
            "dialogThingId": "58483d2d6243c7d410fc910f",
            "dialogColor": "223,226,125",
            "latestCommentText": "i'm amaze!",
            "latestCommentUserId": "5eeeb2edcb300544abacc984",
            "latestCommentUserName": "johnny nu",
            "id": "5846f567b09fa5d709e5f6ff"
        },
        {
            "name": "suggestions",
            "description": "got a new feature idea for anyland, or anything that could be improved?",
            "creatorId": "5773b5232da36d2d18b870fb",
            "creatorName": "philipp",
            "threadCount": 347,
            "latestCommentDate": "2021-08-29T06:33:04.655Z",
            "protectionLevel": 0,
            "creationDate": "2016-12-06T16:42:28.538Z",
            "dialogThingId": "58483e01076bf93b0e75f839",
            "dialogColor": "198,163,88",
            "latestCommentText": "i wonder if the game can actually handle that many script lines.",
            "latestCommentUserId": "5d9690a7288c857ffcc8623e",
            "latestCommentUserName": "flarn2006",
            "id": "5846f571c966811d10993e1e"
        },
        {
            "name": "hangout",
            "description": "a board to relax and discuss all kinds of miscellaneous topics. welcome!",
            "creatorId": "5773b5232da36d2d18b870fb",
            "creatorName": "philipp",
            "threadCount": 48,
            "latestCommentDate": "2023-10-03T03:45:06.027Z",
            "protectionLevel": 0,
            "creationDate": "2016-12-06T16:42:27.699Z",
            "dialogThingId": "58483fff5a7d56f91469903f",
            "dialogColor": "198,143,132",
            "latestCommentText": "hewoo mr obama?",
            "latestCommentUserId": "5f911606fe99c863186d3030",
            "latestCommentUserName": "alizard",
            "id": "5846f5785a84a62410ce2e67"
        },
        {
            "name": "quests",
            "description": "a board to post your adventures and quests!",
            "creatorId": "5773b5232da36d2d18b870fb",
            "creatorName": "philipp ai",
            "threadCount": 30,
            "latestCommentDate": "2023-12-13T12:19:04.618Z",
            "protectionLevel": 0,
            "creationDate": "2019-01-19T15:46:36.529Z",
            "latestCommentText": "✓ achieved",
            "latestCommentUserId": "5af09cf138f35155f103bd92",
            "latestCommentUserName": "Yoofaloof",
            "dialogColor": "84,255,255",
            "dialogThingId": "5c45b3f2dbdb1d61cf7f18b9",
            "id": "5c43465c9e61d1567d9c69bd"
        }
    ]
}
