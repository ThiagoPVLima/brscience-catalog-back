import { query, getOne, execute } from '../lib/db.js'
import { uploadImage, deleteImage } from '../lib/appwrite.js'
import type { RowDataPacket } from 'mysql2/promise'
import type { Product, CreateProductDTO, UpdateProductDTO, ImageInput } from '../types.js'

type ProductRow = Product & RowDataPacket

// ─── Listar todos ─────────────────────────────────────────────────────────────
export async function getAllProducts(): Promise<Product[]> {
  return query<ProductRow>(
    'SELECT * FROM products WHERE active = 1 ORDER BY created_at DESC'
  )
}

// ─── Buscar por ID ────────────────────────────────────────────────────────────
export async function getProductById(id: number): Promise<Product | null> {
  return getOne<ProductRow>('SELECT * FROM products WHERE id = ?', [id])
}

// ─── Criar produto (com upload de imagem opcional) ────────────────────────────
export async function createProduct(
  dto: CreateProductDTO,
  imageInput?: ImageInput,
  imageFileName?: string
): Promise<number> {
  let imageUrl = dto.image_url ?? null

  if (imageInput) {
    imageUrl = await uploadImage(imageInput, 'products', imageFileName)
  }

  const result = await execute(
    `INSERT INTO products (name, description, price, image_url, category_id, active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [dto.name, dto.description ?? null, dto.price, imageUrl, dto.category_id ?? null, dto.active ? 1 : 0]
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

  let imageUrl = dto.image_url ?? existing.image_url

  if (imageInput) {
    // Remove imagem antiga do Appwrite antes de fazer upload da nova
    if (existing.image_url) {
      await deleteImage(existing.image_url, 'products').catch(() => {
        // ignora erro se o arquivo já não existir
      })
    }
    imageUrl = await uploadImage(imageInput, 'products', imageFileName)
  }

  const result = await execute(
    `UPDATE products
     SET name = ?, description = ?, price = ?, image_url = ?, category_id = ?, active = ?,
         updated_at = NOW()
     WHERE id = ?`,
    [
      dto.name        ?? existing.name,
      dto.description ?? existing.description,
      dto.price       ?? existing.price,
      imageUrl,
      dto.category_id ?? existing.category_id,
      (dto.active     ?? existing.active) ? 1 : 0,
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
