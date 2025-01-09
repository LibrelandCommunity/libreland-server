import { mkWriter } from './lib/nsq'
import { mkApiReqs } from './lib/api';
import { AreaInfoSchema, AreaSearchSchema, ForumForumSchema, PersonGiftsReceived, SubareaListSchema, ThreadsSchema } from './lib/schemas';
import { z } from 'zod';
import { isMongoId } from './lib/utils';


if (!process.env.ANYLAND_COOKIE) throw "no cookie in env"
if (!process.env.NSQD_HOST) throw "no cookie in env"

const DEFAULT_AREAID = "5b6686c83204100709bb4be4";
const NSQD_HOST = process.env.NSQD_HOST;
const NSQD_PORT = 4150;

const { sendNetRequest, enqueueThing, enqueuePlayer, enqueueArea, enqueueForum, enqueueThread } = await mkWriter(NSQD_HOST, NSQD_PORT);
//const api = await mkApiReqs(sendNetRequest);

const USER_ID_PHILIPP = "5773b5232da36d2d18b870fb";
const FORUM_ID_UPDATES = "5846f556b09fa5d709e5f6fe";
const THREAD_ID = "5a6cd2fccaa74f8613047dd1";
const AREA_ID_BUILDTOWN = "57f67019817496af5268f719";
//api.post("manual test", "/area/getsubareas", `areaId=${AREA_ID_BUILDTOWN}`).then(res => res.json()).then(SubareaListSchema.parseAsync).then(console.log).catch(console.error)
//api.post("manual test", "/area/info", `areaId=${AREA_ID_BUILDTOWN}`).then(res => res.json()).then(AreaInfoSchema.parseAsync).then(console.log).catch(console.error)
//api.post("manual test", "/area/search", `term=&byCreatorId=${USER_ID_PHILIPP}`).then(res => res.json()).then(AreaSearchSchema.parseAsync).then(console.log).catch(console.error)
//api.get("manual test", "/forum/thread/" + THREAD_ID).then(res => res.json()).then(ThreadsSchema.parseAsync).then(console.log).catch(console.error)
//api.get("manual test", "/forum/forum/" + FORUM_ID_UPDATES).then(res => res.json()).then(ForumForumSchema.parseAsync).then(console.log).catch(console.error)
//api.post("manual test", "/gift/getreceived", `userId=${USER_ID_PHILIPP}`).then(res => res.json()).then(PersonGiftsReceived.parseAsync).then(console.log).catch(console.error)
//api.post("manual test", "/thing/topby", `id=${USER_ID_PHILIPP}&limit=0`).then(res => res.json()).then(console.log).catch(console.error)
//api.get("manual test", "/sl/tdef/5a9fcb52f744157c9de0b557").then(res => res.json()).then(console.log).catch(console.error)
api.get("manual test", "/forum/favorites").then(res => res.json()).then(console.log).catch(console.error)
//api.post("manual test", "/area/lists", `subsetsize=-1&setsize=1`).then(res => res.json()).then(console.log).catch(console.error)
//api.post("manual test", "/area/lists", `subsetsize=-1&setsize=1`).then(res => res.json()).then(console.log).catch(console.error)
//api.post("manual test", "/thing/gettags", `thingId=5a9fcb52f744157c9de0b557`).then(res => res.json()).then(console.log).catch(console.error)
//api.post("manual test", "/forum/search", `searchTerm=e`).then(res => res.json()).then(console.log).catch(console.error)
