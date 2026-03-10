// ─── Buckets disponíveis no Appwrite Storage ─────────────────────────────────
export type BucketName = 'products' | 'banners'

// ─── Input aceito pelo uploadImage ───────────────────────────────────────────
export type ImageInput = Buffer | NodeJS.ReadableStream | Blob | string // string = base64 data URL

// ─── Produto ──────────────────────────────────────────────────────────────────
export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: number | null
  active: boolean
  created_at: Date
  updated_at: Date
}

export type CreateProductDTO = Omit<Product, 'id' | 'created_at' | 'updated_at'>
export type UpdateProductDTO = Partial<CreateProductDTO>

// ─── Banner ───────────────────────────────────────────────────────────────────
export interface Banner {
  id: number
  title: string
  image_url: string
  link: string | null
  active: boolean
  created_at: Date
}

export type CreateBannerDTO = Omit<Banner, 'id' | 'created_at'>
