import { query, getOne, execute } from '../lib/db.js'
import { uploadImage, deleteImage } from '../lib/appwrite.js'
import type { RowDataPacket } from 'mysql2/promise'
import type { Product, CreateProductDTO, UpdateProductDTO, ImageInput } from '../types.js'

type ProductRow = Product & RowDataPacket

// ─── Listar todos ─────────────────────────────────────────────────────────────
export async function getAllProducts(): Promise<Product[]> {
  return query<ProductRow>(
    'SELECT * FROM products WHERE active = 1 ORDER BY line, sort_order'
  )
}

// ─── Buscar por ID ────────────────────────────────────────────────────────────
export async function getProductById(id: number): Promise<Product | null> {
  return getOne<ProductRow>('SELECT * FROM products WHERE id = ?', [id])
}

// ─── Criar produto ────────────────────────────────────────────────────────────
export async function createProduct(
  dto: CreateProductDTO,
  imageInput?: ImageInput,
  imageFileName?: string
): Promise<number> {
  let image_url = dto.image_url ?? null

  if (imageInput) {
    image_url = await uploadImage(imageInput, 'products', imageFileName)
  }

  const result = await execute(
    `INSERT INTO products
      (name, line, code, ncm, cest, anvisa, distributor_price, price,
       image_url, discount_percentage, color, sort_order, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dto.name, dto.line, dto.code,
      dto.ncm || '', dto.cest || '', dto.anvisa || '',
      dto.distributor_price || '', dto.price || '0,00',
      image_url,
      dto.discount_percentage ?? null,
      dto.color ?? null,
      dto.sort_order ?? 0,
      dto.active ? 1 : 0,
    ]
  )

  return result.insertId
}

// ─── Atualizar produto ────────────────────────────────────────────────────────
export async function updateProduct(
  id: number,
  dto: UpdateProductDTO,
  imageInput?: ImageInput,
  imageFileName?: string
): Promise<boolean> {
  const existing = await getProductById(id)
  if (!existing) return false

  let image_url = dto.image_url ?? existing.image_url

  if (imageInput) {
    if (existing.image_url) {
      await deleteImage(existing.image_url, 'products').catch(() => {})
    }
    image_url = await uploadImage(imageInput, 'products', imageFileName)
  }

  const result = await execute(
    `UPDATE products SET
      name = ?, line = ?, code = ?, ncm = ?, cest = ?, anvisa = ?,
      distributor_price = ?, price = ?, image_url = ?,
      discount_percentage = ?, color = ?, sort_order = ?, active = ?,
      updated_at = NOW()
     WHERE id = ?`,
    [
      dto.name               ?? existing.name,
      dto.line               ?? existing.line,
      dto.code               ?? existing.code,
      dto.ncm                ?? existing.ncm,
      dto.cest               ?? existing.cest,
      dto.anvisa             ?? existing.anvisa,
      dto.distributor_price  ?? existing.distributor_price,
      dto.price              ?? existing.price,
      image_url,
      dto.discount_percentage !== undefined ? dto.discount_percentage : existing.discount_percentage,
      dto.color              !== undefined  ? dto.color               : existing.color,
      dto.sort_order         !== undefined  ? dto.sort_order          : existing.sort_order,
      dto.active             !== undefined  ? (dto.active ? 1 : 0)   : (existing.active ? 1 : 0),
      id,
    ]
  )

  return result.affectedRows > 0
}

// ─── Deletar produto ──────────────────────────────────────────────────────────
export async function deleteProduct(id: number): Promise<boolean> {
  const existing = await getProductById(id)
  if (!existing) return false

  if (existing.image_url) {
    await deleteImage(existing.image_url, 'products').catch(() => {})
  }

  const result = await execute('DELETE FROM products WHERE id = ?', [id])
  return result.affectedRows > 0
}