import { z } from "zod"

import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_IMAGES_ACCOUNT_HASH,
  CLOUDFLARE_IMAGES_API_TOKEN,
} from "~/config/env.server"
import { isDevelopment } from "~/config/vars"
import { logger } from "~/utils/log"

const UploadImageToCloudflareResponseSchema = z.object({
  errors: z.array(
    z.object({
      code: z.string(),
      message: z.string(),
    })
  ),
  messages: z.array(
    z.object({
      code: z.string(),
      message: z.string(),
    })
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
  imageName?: string
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
      }
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
  } catch (err) {
    logger.error("Error uploading image to Cloudflare", { err })
    throw err
  }
}

export const CLOUDFLARE_IMAGE_VARIANTS = {
  Public: "public",
} as const
export type CloudflareImageVariant =
  (typeof CLOUDFLARE_IMAGE_VARIANTS)[keyof typeof CLOUDFLARE_IMAGE_VARIANTS]

export function generateCloudflareImageUrl(
  imageId: string,
  variant: CloudflareImageVariant = "public"
) {
  if (isDevelopment) {
    return `https://imagedelivery.net/${CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${imageId}/${variant}`
  }

  return `https://giftthelisting.com/cdn-cgi/imagedelivery/${CLOUDFLARE_ACCOUNT_ID}/${imageId}`
}
