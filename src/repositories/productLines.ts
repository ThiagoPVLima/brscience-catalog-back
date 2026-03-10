import { query, getOne, execute } from '../lib/db.js'
import { uploadImage } from '../lib/appwrite.js'
import type { RowDataPacket } from 'mysql2/promise'
import type { ImageInput } from '../types.js'

export interface ProductLine {
    id: number
    name: string
    color: string
    image_url: string | null
    created_at: Date
}

type ProductLineRow = ProductLine & RowDataPacket

// ─── Listar todas ─────────────────────────────────────────────────────────────
export async function getAllProductLines(): Promise<ProductLine[]> {
    return query<ProductLineRow>('SELECT * FROM product_lines ORDER BY name')
}

// ─── Buscar por nome ───────────────────────────────────────────────────────────
export async function getProductLineByName(name: string): Promise<ProductLine | null> {
    return getOne<ProductLineRow>('SELECT * FROM product_lines WHERE name = ?', [name])
}

// ─── Criar linha ───────────────────────────────────────────────────────────────
export async function createProductLine(
    name: string,
    color: string,
    imageInput?: ImageInput,
    imageFileName?: string
): Promise<number> {
    let image_url: string | null = null

    if (imageInput) {
        image_url = await uploadImage(imageInput, 'products', imageFileName)
    }

    const result = await execute(
        'INSERT INTO product_lines (name, color, image_url) VALUES (?, ?, ?)',
        [name, color || '#3b82f6', image_url]
    )

    return result.insertId
}

// ─── Atualizar linha ───────────────────────────────────────────────────────────
export async function updateProductLine(
    oldName: string,
    name: string,
    color: string,
    imageInput?: ImageInput,
    imageFileName?: string
): Promise<boolean> {
    const existing = await getProductLineByName(oldName)
    if (!existing) return false

    let image_url = existing.image_url

    if (imageInput) {
        image_url = await uploadImage(imageInput, 'products', imageFileName)
    }

    const result = await execute(
        'UPDATE product_lines SET name = ?, color = ?, image_url = ? WHERE name = ?',
        [name ?? oldName, color ?? existing.color, image_url, oldName]
    )

    return result.affectedRows > 0
}

// ─── Deletar linha ─────────────────────────────────────────────────────────────
export async function deleteProductLine(name: string): Promise<boolean> {
    const result = await execute('DELETE FROM product_lines WHERE name = ?', [name])
    return result.affectedRows > 0
}