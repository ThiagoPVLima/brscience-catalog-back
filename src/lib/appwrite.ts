import { Client, Storage, ID } from 'node-appwrite'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import type { BucketName, ImageInput } from '../types.js'
import { InputFile } from 'node-appwrite/file'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({
  path: path.resolve(__dirname, '../../dist/.env'),
})

const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  APPWRITE_BUCKET_PRODUCTS = 'products',
  APPWRITE_BUCKET_BANNERS = 'banners',
} = process.env

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  throw new Error(
    '❌ Variáveis APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID e APPWRITE_API_KEY não encontradas no .env'
  )
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY)

export const storage = new Storage(client)

const BUCKET_IDS: Record<BucketName, string> = {
  products: APPWRITE_BUCKET_PRODUCTS,
  banners: APPWRITE_BUCKET_BANNERS,
}

function base64ToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string } {
  const [header, data] = dataUrl.split(',')
  const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/webp'
  return { buffer: Buffer.from(data, 'base64'), mimeType }
}

function extFromMime(mime: string): string {
  return mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'webp'
}

export async function uploadImage(
  input: ImageInput,
  bucket: BucketName,
  fileName?: string
): Promise<string> {
  const bucketId = BUCKET_IDS[bucket]
  const fileId = ID.unique()

  let inputFile: InputFile
  let name = fileName ?? `${Date.now()}.webp`

  if (typeof input === 'string') {
    const { buffer, mimeType } = base64ToBuffer(input)
    name = fileName ?? `${Date.now()}.${extFromMime(mimeType)}`
    inputFile = InputFile.fromBuffer(buffer, name)
  } else if (Buffer.isBuffer(input)) {
    inputFile = InputFile.fromBuffer(input, name)
  } else {
    throw new Error('❌ Tipo de arquivo não suportado no Node. Use Buffer ou base64.')
  }

  const file = await storage.createFile(
    bucketId,
    fileId,
    inputFile as unknown as File
  )

  return `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${file.$id}/view?project=${APPWRITE_PROJECT_ID}`
}

export async function deleteImage(
  fileIdOrUrl: string,
  bucket: BucketName
): Promise<void> {
  const bucketId = BUCKET_IDS[bucket]

  let fileId = fileIdOrUrl
  const match = fileIdOrUrl.match(/\/files\/([^/]+)\/view/)
  if (match) fileId = match[1]

  await storage.deleteFile(bucketId, fileId)
}