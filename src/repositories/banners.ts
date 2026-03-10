import { query, getOne, execute } from '../lib/db.js'
import { uploadImage, deleteImage } from '../lib/appwrite.js'
import type { RowDataPacket } from 'mysql2/promise'
import type { Banner, CreateBannerDTO, ImageInput } from '../types.js'

type BannerRow = Banner & RowDataPacket

export async function getAllBanners(): Promise<Banner[]> {
  return query<BannerRow>('SELECT * FROM banners WHERE active = 1 ORDER BY id ASC')
}

export async function getBannerById(id: number): Promise<Banner | null> {
  return getOne<BannerRow>('SELECT * FROM banners WHERE id = ?', [id])
}

export async function createBanner(
  dto: Omit<CreateBannerDTO, 'image_url'>,
  imageInput: ImageInput,
  imageFileName?: string
): Promise<number> {
  const imageUrl = await uploadImage(imageInput, 'banners', imageFileName)

  const result = await execute(
    'INSERT INTO banners (title, image_url, link, active) VALUES (?, ?, ?, ?)',
    [dto.title, imageUrl, dto.link ?? null, dto.active ? 1 : 0]
  )

  return result.insertId
}

export async function deleteBanner(id: number): Promise<boolean> {
  const existing = await getBannerById(id)
  if (!existing) return false

  await deleteImage(existing.image_url, 'banners').catch(() => {})

  const result = await execute('DELETE FROM banners WHERE id = ?', [id])
  return result.affectedRows > 0
}
