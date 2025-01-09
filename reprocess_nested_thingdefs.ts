import fs from 'node:fs/promises';
import path from 'node:path';
import { findNestedIdsInThing } from './lib/utils';
import { mkWriter } from './lib/nsq'


if (!process.env.ANYLAND_COOKIE) throw "no cookie in env"
if (!process.env.NSQD_HOST) throw "no cookie in env"

const NSQD_HOST = process.env.NSQD_HOST;
const NSQD_PORT = 4150;

const { enqueueThing } = await mkWriter(NSQD_HOST, NSQD_PORT);



const DIR = "./data/thing/def/";
const files = await fs.readdir(DIR);


for (let i = 0; i <= files.length; i++) {
  const filename = files[i];
  console.log(i, "/", files.length, filename);

  try {
    const file = Bun.file(path.join(DIR, filename));
    const content = await file.json();

    findNestedIdsInThing(content, (id) => enqueueThing(id))
  } catch(e) {
    console.log("error processing file", filename, e)
  }
}
