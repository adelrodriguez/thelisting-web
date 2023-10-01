import { z } from "zod"

import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_IMAGES_API_TOKEN,
} from "~/config/env.server"
import logger from "~/helpers/logger.server"
import Sentry from "~/services/sentry"

const UploadImageToCloudflareResponseSchema = z.object({
  errors: z.array(
    z.object({
      code: z.string(),
      message: z.string(),
    }),
  ),
  messages: z.array(
    z.object({
      code: z.string(),
      message: z.string(),
    }),
  ),
  result: z.object({
    filename: z.string(),
    id: z.string(),
    requireSignedURLs: z.boolean(),
    uploaded: z.string(),
  }),
  success: z.boolean(),
})

export async function uploadImageToCloudflare(
  data: AsyncIterable<Uint8Array>,
  imageName?: string,
) {
  const chunks = []

  for await (const chunk of data) {
    chunks.push(chunk)
  }

  const blob = new Blob(chunks, { type: "application/octet-stream" })

  const formData = new FormData()

  formData.append("file", blob, imageName)

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        body: formData,
        headers: { Authorization: `Bearer ${CLOUDFLARE_IMAGES_API_TOKEN}` },
        method: "POST",
      },
    )

    if (res.status !== 200 && res.status !== 409) {
      throw new Error("HTTP " + res.status + " : " + (await res.text()))
    }

    if (res.status === 409) {
      // 409: image already exists, imported by a previous run
      logger.info("Image already exists", { imageName })
    }

    const result = await res.json()

    return UploadImageToCloudflareResponseSchema.parse(result)
  } catch (error) {
    Sentry.captureException(error)

    logger.error("Error uploading image to Cloudflare", { error })

    throw error
  }
}
