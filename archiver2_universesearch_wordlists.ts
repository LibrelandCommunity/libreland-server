import fs from 'node:fs';
import path from 'node:path';
import { d } from './lib/utils';
import { mkWriter } from './lib/nsq'
import { mkApiReqs } from './lib/api';
import { ThingSearchSchema } from './lib/schemas';


if (!process.env.ANYLAND_COOKIE) throw "no cookie in env"
if (!process.env.NSQD_HOST) throw "no cookie in env"

const NSQD_HOST = process.env.NSQD_HOST;
const NSQD_PORT = 4150;

const { sendNetRequest, enqueueThing, enqueuePlayer, enqueueArea, enqueueForum, enqueueThread } = await mkWriter(NSQD_HOST, NSQD_PORT);
const api = await mkApiReqs(sendNetRequest);


function stripNewline(str: string) {
  if (str.endsWith('\r') || str.endsWith('\n')) {
      return str.slice(0, -1);
  }
  return str;
}


const searchAndEnqueue = async (term: string) => {
  console.log("Searching universe with", term);
  const body = await api.post("archiver2_universesearch_wordlist", "/thing/search", `term=${term}`).then(res => res.json()).then(ThingSearchSchema.parseAsync)
  console.log("Searching universe with", term, "results:", body.thingIds.length);

  for (const id of body.thingIds) {
    enqueueThing(id)
  }

  await Bun.sleep(500);
}


// Start by doing a search for every letter in the alphabet
/*
const alphanumeric = ' -_abcdefghijklmnopqrstuvwxyz0123456789';
for (let i = 0; i < alphanumeric.length; i++) {
  const char = alphanumeric[i]
  await searchAndEnqueue(char);

  await Bun.sleep(1500);
}
*/


// Now iterate through every file in the wordlists directory
const WORDLIST_DIR = "../archiver/wordlists/";
const files_ = fs.readdirSync(WORDLIST_DIR);
files_.sort();

console.log(JSON.stringify(files_, null, 2))

// Manually-ordered files and commenting the ones we went through already
const files = [
  //"wordlist-twoletters.txt",
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

        // universe search is lowercase only but case-sensitive?
        await searchAndEnqueue(lineClean);
      }
    }
  } catch(e) {
    console.log("error processing wordlist file", filename, e)
  }
}