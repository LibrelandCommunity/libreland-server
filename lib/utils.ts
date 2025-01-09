import * as fs from "node:fs/promises"
import * as path from "node:path"

const objectIdRegExp = /^[0-9a-fA-F]{24}$/;
export const isMongoId = (str: string) => objectIdRegExp.test(str);

export function headersToObject(headers: any) {
  const object = {};
  for (const [key, value] of headers) {
    // @ts-ignore
    object[key] = value;
  }
  return object;
}


export const d = () => new Date().toISOString();


// Abstracts the generic boilerplate for doing an API call, handling errors, writing to file
// Only use for things that gets written to disk! Not for generic API abstractions.
export const mkQuery_ = <T>(
  ctx: string,
  getFilePath: (id: T) => string,
  query: (id: T) => Promise<Response>,
  onResOk: (id: T, res: Response, bodyTxt: string) => void | Promise<void>,
  throwOnBadRes: boolean,
  sleepAfterQuery: number,
) => async (id: T) => {
  const filepath = getFilePath(id);

  const file = Bun.file(filepath)
  await fs.mkdir(path.dirname(filepath), { recursive: true })

  if (await file.exists()) {
    console.info(d(), ctx, "file already exists for", id, "skipping")
    return;
  }

  const res = await query(id)
  const bodyTxt = await res.text();

  if (res.ok) {
    try {
      await onResOk(id, res, bodyTxt)
      await Bun.write(file, bodyTxt)
    } catch(e) {
      console.error(d(), ctx, "res handler error!", id, '""""', bodyTxt, '""""')
      console.error(e);
      throw "check logs";
    }
  }
  else {
    console.warn(d(), ctx, "bad response", res.status, '""""', bodyTxt, '""""')
    if (throwOnBadRes) throw "check logs";
  }

  await Bun.sleep(sleepAfterQuery)
}

export const mkQuery = mkQuery_<string>;

export const findNestedIdsInThing = (obj: unknown, onMongoId: (id: string) => void) => {
  if (obj == null) return;

  if (typeof obj === 'object') {
    for (const key in obj) {
      // @ts-ignore
      const val = obj[key];

      // send any string that looks like a mongoId to the work queue
      if (typeof val === "string" && isMongoId(val)) {
        console.debug("Found id", val, "at prop", key)
        onMongoId(val)
      }

      // Recurse on objects (this includes arrays)
      if (typeof val === 'object') {
        findNestedIdsInThing(val, onMongoId);
      }
    }
  }
}
