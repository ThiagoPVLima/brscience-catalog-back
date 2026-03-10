import { Client, Storage, ID, InputFile } from 'node-appwrite'
import 'dotenv/config'
import type { BucketName, ImageInput } from '../types.js'

// ─── Validação de env ────────────────────────────────────────────────────────
const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  APPWRITE_BUCKET_PRODUCTS = 'products',
  APPWRITE_BUCKET_BANNERS  = 'banners',
} = process.env

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  throw new Error(
    '❌ Variáveis APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID e APPWRITE_API_KEY não encontradas no .env'
  )
}

// ─── Cliente Appwrite ────────────────────────────────────────────────────────
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY)

export const storage = new Storage(client)

// ─── Mapa de bucket name → bucket ID ─────────────────────────────────────────
const BUCKET_IDS: Record<BucketName, string> = {
  products: APPWRITE_BUCKET_PRODUCTS,
  banners:  APPWRITE_BUCKET_BANNERS,
}

// ─── Helpers internos ────────────────────────────────────────────────────────

/** Converte uma data URL base64 em Buffer + mime type */
function base64ToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string } {
  const [header, data] = dataUrl.split(',')
  const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/webp'
  return { buffer: Buffer.from(data, 'base64'), mimeType }
}

/** Extrai extensão a partir de um mime type */
function extFromMime(mime: string): string {
  return mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'webp'
}

// ─── uploadImage ─────────────────────────────────────────────────────────────
/**
 * Faz upload de uma imagem para o Appwrite Storage e retorna a URL pública.
 *
 * @param input   Buffer | ReadStream | Blob | string (base64 data URL)
 * @param bucket  'products' | 'banners'
 * @param fileName  Nome opcional do arquivo (com extensão)
 */
export async function uploadImage(
  input: ImageInput,
  bucket: BucketName,
  fileName?: string
): Promise<string> {
  const bucketId = BUCKET_IDS[bucket]
  const fileId   = ID.unique()

  let inputFile: ReturnType<typeof InputFile.fromBuffer>

  if (typeof input === 'string') {
    // base64 data URL  →  Buffer
    const { buffer, mimeType } = base64ToBuffer(input)
    const name = fileName ?? `${Date.now()}.${extFromMime(mimeType)}`
    inputFile = InputFile.fromBuffer(buffer, name)

  } else if (Buffer.isBuffer(input)) {
    const name = fileName ?? `${Date.now()}.webp`
    inputFile = InputFile.fromBuffer(input, name)

  } else {
    // ReadStream ou Blob: node-appwrite aceita diretamente
    const name = fileName ?? `${Date.now()}.webp`
    inputFile = InputFile.fromBlob(input as Blob, name)
  }

  const { $id } = await storage.createFile(bucketId, fileId, inputFile)

  // URL pública (o bucket precisa ter permissão de leitura pública habilitada)
  const publicUrl =
    `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${$id}/view` +
    `?project=${APPWRITE_PROJECT_ID}`

  return publicUrl
}

/**
 * Deleta um arquivo do Appwrite Storage pela URL pública ou pelo fileId.
 */
export async function deleteImage(
  fileIdOrUrl: string,
  bucket: BucketName
): Promise<void> {
  const bucketId = BUCKET_IDS[bucket]

  // Extrai o fileId caso tenha passado a URL completa
  let fileId = fileIdOrUrl
  const match = fileIdOrUrl.match(/\/files\/([^/]+)\/view/)
  if (match) fileId = match[1]

  await storage.deleteFile(bucketId, fileId)
}
