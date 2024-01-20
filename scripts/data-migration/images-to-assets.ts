/* eslint-disable no-console */
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { PrismaClient, StorageService } from "@prisma/client"
import fs from "node:fs"
import path from "node:path"
import { pipeline } from "node:stream/promises"
import { v4 as uuid } from "uuid"

import {
  STORAGE_ACCESS_KEY,
  STORAGE_BUCKET,
  STORAGE_SECRET,
} from "~/config/env.server"
import { CLOUDFLARE_R2_ENDPOINT } from "~/config/vars"
import { generateAssetUrl } from "~/utils/asset.server"

async function main() {
  const prisma = new PrismaClient()

  // Get all the images
  const images = await prisma.image.findMany()

  console.log(`Found ${images.length} images`)

  const dir = path.join(__dirname, "../tmp")

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  for (const [index, image] of images.entries()) {
    const filePath = path.join(dir, `${image.filename}.jpg`)
    const response = await fetch(
      `https://imagedelivery.net/wHwwAqNxbuESOwdHNE6NsQ/${image.id}/display`,
    )

    if (!response.ok || !response.body) {
      console.error(`Failed to fetch image ${image.id}`)
      continue
    }

    console.log(`Writing image number ${index + 1}: ${filePath}`)

    // Download them to a tmp folder
    // @ts-expect-error stream is not a valid type
    await pipeline(response.body, fs.createWriteStream(filePath))

    // Upload them to S3
    const s3 = new S3Client({
      credentials: {
        accessKeyId: STORAGE_ACCESS_KEY,
        secretAccessKey: STORAGE_SECRET,
      },
      endpoint: CLOUDFLARE_R2_ENDPOINT,
      region: "auto",
    })

    const file = await fs.readFileSync(filePath)
    const filename = uuid()

    const putObjectCommand = new PutObjectCommand({
      Body: file,
      Bucket: STORAGE_BUCKET,
      Key: `${image.userId}/${filename}`,
    })

    await s3.send(putObjectCommand)

    // https://732eec593123238570cf86954790559a.r2.cloudflarestorage.com/thelisting-assets-dev/756f1ffb-7dc9-40e9-b6e0-abf36dc02c76/Grace_Homero_IVN_285.jpg

    // Create an asset for each image
    const asset = await prisma.asset.create({
      data: {
        bucket: STORAGE_BUCKET,
        filename,
        mimeType: "image/jpeg",
        name: image.filename,
        ownerId: image.userId,
        service: StorageService.R2,
        size: file.byteLength,
        url: `${CLOUDFLARE_R2_ENDPOINT}/${STORAGE_BUCKET}/${image.userId}/${filename}`,
      },
    })

    const [listingsWithCoverImages, listingsWithThankYouImages] =
      await Promise.all([
        prisma.listing.findMany({
          where: {
            coverImage: image.id,
          },
        }),
        prisma.listing.findMany({
          where: {
            thankYouImage: image.id,
          },
        }),
      ])

    await Promise.all([
      // Update the listings that have the image as a cover image
      prisma.listing.updateMany({
        data: {
          coverImage: generateAssetUrl(
            asset.service,
            asset.ownerId,
            asset.filename,
          ),
        },
        where: {
          id: {
            in: listingsWithCoverImages.map((listing) => listing.id),
          },
        },
      }),

      // Update the listing that have the image as a thank you image
      prisma.listing.updateMany({
        data: {
          thankYouImage: generateAssetUrl(
            asset.service,
            asset.ownerId,
            asset.filename,
          ),
        },
        where: {
          id: {
            in: listingsWithThankYouImages.map((listing) => listing.id),
          },
        },
      }),
    ])
  }

  await prisma.$disconnect()
}

void main()
