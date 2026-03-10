import { storage, ID } from "./appwriteClient.js"
import fs from "fs"
import path from "path"

export async function uploadImage(fileOrBase64, bucketId) {

  let buffer
  let ext = "webp"

  if (typeof fileOrBase64 === "string") {

    // base64
    const base64Data = fileOrBase64.split(";base64,").pop()
    buffer = Buffer.from(base64Data, "base64")

  } else {

    // file path
    buffer = fs.readFileSync(fileOrBase64)
    ext = path.extname(fileOrBase64).replace(".", "")

  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const tempPath = `/tmp/${fileName}`
  fs.writeFileSync(tempPath, buffer)

  const file = await storage.createFile(
    bucketId,
    ID.unique(),
    fs.createReadStream(tempPath)
  )

  fs.unlinkSync(tempPath)

  return `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${file.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`
}