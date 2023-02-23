import { CLOUDFLARE_IMAGES_ACCOUNT_HASH } from "~/config/consts"

export const CLOUDFLARE_IMAGE_VARIANTS = {
  Display: "display",
  Public: "public",
  Thumbnail: "thumbnail",
} as const
export type CloudflareImageVariant =
  (typeof CLOUDFLARE_IMAGE_VARIANTS)[keyof typeof CLOUDFLARE_IMAGE_VARIANTS]

export function generateCloudflareImageUrl(
  imageId: string,
  variant: CloudflareImageVariant = CLOUDFLARE_IMAGE_VARIANTS.Public
) {
  return `https://giftthelisting.com/cdn-cgi/imagedelivery/${CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${imageId}/${variant}`
}
