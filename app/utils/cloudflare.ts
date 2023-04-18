import { CLOUDFLARE_IMAGES_ACCOUNT_HASH } from "~/config/consts"

export function generateCloudflareImageUrl(
  imageId: string,
  variant: "display" | "public" | "thumbnail" = "public"
) {
  return `https://giftthelisting.com/cdn-cgi/imagedelivery/${CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${imageId}/${variant}`
}
