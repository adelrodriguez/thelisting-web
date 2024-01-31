import type { PutObjectCommandInput } from "@aws-sdk/client-s3"
import { S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import type { UploadHandler } from "@remix-run/node"
import { writeAsyncIterableToWritable } from "@remix-run/node"
import { PassThrough } from "stream"

import {
  STORAGE_ACCESS_KEY,
  STORAGE_BUCKET,
  STORAGE_SECRET,
} from "~/config/env.server"
import { CLOUDFLARE_R2_ENDPOINT } from "~/config/vars"
import { parseFilename } from "~/utils/file"

const uploadStream = ({
  ContentDisposition,
  ContentType,
  Key,
}: Pick<
  PutObjectCommandInput,
  "Key" | "ContentDisposition" | "ContentType"
>) => {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: STORAGE_ACCESS_KEY,
      secretAccessKey: STORAGE_SECRET,
    },
    endpoint: CLOUDFLARE_R2_ENDPOINT,
    region: "auto",
  })
  const pass = new PassThrough()

  return {
    promise: new Upload({
      client: s3,
      params: {
        Body: pass,
        Bucket: STORAGE_BUCKET,
        ContentDisposition,
        ContentType,
        Key,
      },
    }).done(),
    writeStream: pass,
  }
}

export function createS3UploadHandler({
  contentDisposition,
  contentType,
  key,
}: {
  key?: string
  contentDisposition?: PutObjectCommandInput["ContentDisposition"]
  contentType?: PutObjectCommandInput["ContentType"]
} = {}): UploadHandler {
  return async ({ data, filename, name }) => {
    if (name !== "file") {
      return undefined
    }

    if (!filename) throw new Error("No filename provided")

    const stream = uploadStream({
      ContentDisposition: contentDisposition,
      ContentType: contentType,
      Key: key || parseFilename(filename),
    })

    await writeAsyncIterableToWritable(data, stream.writeStream)
    const file = await stream.promise

    const uploadedFileLocation = file.Location

    return uploadedFileLocation
  }
}
