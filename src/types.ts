// ─── Buckets disponíveis no Appwrite Storage ─────────────────────────────────
export type BucketName = 'products' | 'banners'

// ─── Input aceito pelo uploadImage ───────────────────────────────────────────
export type ImageInput = Buffer | NodeJS.ReadableStream | Blob | string // string = base64 data URL

// ─── Produto ──────────────────────────────────────────────────────────────────
export interface Product {
  id: number
  name: string
  line: string
  code: string
  ncm: string
  cest: string
  anvisa: string
  distributor_price: string
  price: string
  image_url: string | null
  discount_percentage: number | null
  color: string | null
  sort_order: number
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
  mobile_image_url: string | null
  link: string | null
  order: number
  active: boolean
  created_at: Date
}

export type CreateBannerDTO = Omit<Banner, 'id' | 'created_at'>