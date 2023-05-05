import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { z } from "zod"
import { zx } from "zodix"

export async function loader({ params, context }: LoaderArgs) {
  const db = context.db
  const { image: id } = zx.parseParams(params, { image: z.string() })

  const image = await db.image.findFirst({
    where: { id },
  })

  if (!image) {
    throw json(
      { message: "Image not found" },
      { status: StatusCodes.NOT_FOUND, statusText: ReasonPhrases.NOT_FOUND }
    )
  }

  return json(image)
}
