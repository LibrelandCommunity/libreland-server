import { Elysia, t } from 'elysia'
import * as path from "node:path"
import forumsData from '../../mock/forums.json'

export const createForumRoutes = () => {
  return new Elysia()
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
}