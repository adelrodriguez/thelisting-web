import { StorageService } from "@prisma/client"

import { CLOUDFLARE_R2_PUBLIC_URL } from "~/config/env.server"

export function generateAssetUrl(
  service: StorageService,
  userId: string,
  filename: string,
) {
  switch (service) {
    case StorageService.R2:
      return `${CLOUDFLARE_R2_PUBLIC_URL}/${userId}/${filename}`
    default:
      throw new Error(`Unknown storage service: ${service}`)
  }
}
