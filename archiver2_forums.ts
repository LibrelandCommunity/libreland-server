import { d, mkQuery } from './lib/utils';
import { mkWriter } from './lib/nsq'
import { mkApiReqs } from './lib/api';
import { ForumForumSchema, ForumListSchema, } from './lib/schemas';
import * as path from "node:path";


if (!process.env.ANYLAND_COOKIE) throw "no cookie in env"
if (!process.env.NSQD_HOST) throw "no cookie in env"

const NSQD_HOST = process.env.NSQD_HOST;
const NSQD_PORT = 4150;

const { sendNetRequest, enqueueThing, enqueuePlayer, enqueueArea, enqueueForum, enqueueThread } = await mkWriter(NSQD_HOST, NSQD_PORT);
const api = await mkApiReqs(sendNetRequest);





//////////////////////////////
//////////////////////////////


function stripNewline(str: string) {
  if (str.endsWith('\r') || str.endsWith('\n')) {
      return str.slice(0, -1);
  }
  return str;
}

const downloadForum = mkQuery(
  "downloadForum",
  (id) => "data/forum/forum/" + id + ".json",
  (id) => api.get( "downloadForum", "/forum/forum/" + id),
  async (id, res, bodyTxt) => {
      const bodyJson = ForumForumSchema.parse(JSON.parse(bodyTxt))
      enqueueForum(id)
      enqueuePlayer(bodyJson.forum.creatorId)
      if (bodyJson.forum.dialogThingId) enqueueThing(bodyJson.forum.dialogThingId)

      for (const thread of bodyJson.threads) {
        console.log("enqueueing thread", thread.id)
        enqueueThread(thread.id)
      }

      await Bun.sleep(1500);
  },
  true,
  3000
);

api.bumpToken();
setInterval(api.bumpToken, 30000);


const searchAndEnqueue = async (term: string) => {
  const body = await api.post("findAllForums_wordlist", "/forum/search", `searchTerm=${term}`).then(res => res.json()).then(ForumListSchema.parseAsync)

  for (const forum of body.forums) {
    console.log(d(), "downloading", forum.id, forum.name, forum.description, forum.threadCount, forum.latestCommentDate)
    await downloadForum(forum.id)
  }

}



/*
const favforums = await api.get("download default fav boards", "/forum/favorites").then(res => res.json()).then(ForumListSchema.parseAsync)
for (const forum of favforums.forums) {
  console.log(d(), "downloading", forum.id, forum.name, forum.description, forum.threadCount, forum.latestCommentDate)
  await downloadForum(forum.id)
}



const alphanumeric = '-_abcdefghijklmnopqrstuvwxyz0123456789';
for (let i = 0; i < alphanumeric.length; i++) {
  const char = alphanumeric[i]
  console.log("Finding forums with", char);
  searchAndEnqueue(char);

  await Bun.sleep(1500);
}

*/



// Now iterate through every file in the wordlists directory
const WORDLIST_DIR = "../archiver/wordlists/";

// Manually-ordered files and commenting the ones we went through already
const files = [
  "wordlist-twoletters.txt",
  "wordlist-threeletters.txt",
  "wordlist-fourletters.txt",
  "wordlist-google.txt",
  "wordlist.txt",
  "wordlist-2-dashes.txt",
  "wordlist-2.txt",
  "wordlist-LLN.txt",
  "wordlist-LNL.txt",
  "wordlist-LNN.txt",
  "wordlist-NLL.txt",
  "wordlist-NLN.txt",
  "wordlist-NNL.txt",
  "wordlist-dash-double.txt",
  "wordlist-dash-triple.txt",
  "wordlist-numbers.txt",
]

for (let i = 0; i <= files.length; i++) {
  const filename = files[i];
  console.log("wordlist", i, "/", files.length, filename);

  try {
    const file = Bun.file(path.join(WORDLIST_DIR, filename));
    const content = await file.text();
    const lines = content.split('\n');

    for (let j = 0; j <= lines.length; j++) {
      const line = lines[j];
      if (line) {
        const lineClean = stripNewline(line).toLowerCase()
        console.log(`line ${j}/${lines.length}: "${lineClean}"`);

        await searchAndEnqueue(lineClean)
        await Bun.sleep(500)
      }
    }
  } catch(e) {
    console.log("error processing wordlist file", filename, e)
    await Bun.sleep(500)
  }
}


