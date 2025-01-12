import { Elysia, t } from 'elysia'
import * as path from "node:path"

export const createGiftRoutes = () => {
  return new Elysia()
    .post(
      "/gift/getreceived",
      async ({ body: { userId } }: { body: { userId: string } }) => {
        const file = Bun.file(path.resolve("./data/person/gift/", userId + ".json"))
        const text = await file.text()
        return Response.json(JSON.parse(text))
      },
      { body: t.Object({ userId: t.String() }) }
    )
}