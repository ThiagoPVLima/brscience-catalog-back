import { query, getOne, execute } from '../lib/db.js'
import { uploadImage, deleteImage } from '../lib/appwrite.js'
import type { RowDataPacket } from 'mysql2/promise'
import type { Banner, CreateBannerDTO, ImageInput } from '../types.js'

type BannerRow = Banner & RowDataPacket

export async function getAllBanners(): Promise<Banner[]> {
  return query<BannerRow>('SELECT * FROM banners ORDER BY `order` ASC, id ASC')
}

export async function getBannerById(id: number): Promise<Banner | null> {
  return getOne<BannerRow>('SELECT * FROM banners WHERE id = ?', [id])
}

export async function createBanner(
  dto: Omit<CreateBannerDTO, 'image_url' | 'mobile_image_url'>,
  imageInput: ImageInput,
  imageFileName?: string,
  mobileImageInput?: ImageInput,
  mobileImageFileName?: string
): Promise<number> {
  const imageUrl = await uploadImage(imageInput, 'banners', imageFileName)

  let mobileUrl: string | null = null
  if (mobileImageInput) {
    mobileUrl = await uploadImage(mobileImageInput, 'banners', mobileImageFileName)
  }

  const result = await execute(
    'INSERT INTO banners (title, image_url, mobile_image_url, link, `order`, active) VALUES (?, ?, ?, ?, ?, ?)',
    [dto.title, imageUrl, mobileUrl, dto.link ?? null, dto.order ?? 0, dto.active ? 1 : 0]
  )

  return result.insertId
}

export async function updateBanner(
  id: number,
  dto: Partial<Omit<CreateBannerDTO, 'image_url' | 'mobile_image_url'>> & { image_url?: string; mobile_image_url?: string | null },
  imageInput?: ImageInput,
  imageFileName?: string,
  mobileImageInput?: ImageInput,
  mobileImageFileName?: string
): Promise<boolean> {
  const existing = await getBannerById(id)
  if (!existing) return false

  let image_url = dto.image_url ?? existing.image_url
  let mobile_image_url: string | null = dto.mobile_image_url !== undefined ? dto.mobile_image_url : existing.mobile_image_url

  if (imageInput) {
    if (existing.image_url) {
      await deleteImage(existing.image_url, 'banners').catch(() => {})
    }
    image_url = await uploadImage(imageInput, 'banners', imageFileName)
  }

  if (mobileImageInput) {
    mobile_image_url = await uploadImage(mobileImageInput, 'banners', mobileImageFileName)
  }

  const result = await execute(
    'UPDATE banners SET title=?, image_url=?, mobile_image_url=?, link=?, `order`=?, active=? WHERE id=?',
    [
      dto.title ?? existing.title,
      image_url,
      mobile_image_url,
      dto.link !== undefined ? (dto.link || null) : existing.link,
      dto.order !== undefined ? dto.order : existing.order,
      dto.active !== undefined ? (dto.active ? 1 : 0) : (existing.active ? 1 : 0),
      id
    ]
  )

  return result.affectedRows > 0
}

export async function deleteBanner(id: number): Promise<boolean> {
  const existing = await getBannerById(id)
  if (!existing) return false

  await deleteImage(existing.image_url, 'banners').catch(() => {})

  const result = await execute('DELETE FROM banners WHERE id = ?', [id])
  return result.affectedRows > 0
}
