import { query, getOne, execute } from '../lib/db.js'
import { uploadImage } from '../lib/appwrite.js'
import type { RowDataPacket } from 'mysql2/promise'
import type { ImageInput } from '../types.js'

export interface Vendedor {
    id: number
    nome: string
    whatsapp: string
    avatar_url: string | null
    created_at: Date
}

type VendedorRow = Vendedor & RowDataPacket

// ─── Listar todos ─────────────────────────────────────────────────────────────
export async function getAllVendedores(): Promise<Vendedor[]> {
    return query<VendedorRow>('SELECT * FROM vendedores ORDER BY nome')
}

// ─── Buscar por ID ────────────────────────────────────────────────────────────
export async function getVendedorById(id: number): Promise<Vendedor | null> {
    return getOne<VendedorRow>('SELECT * FROM vendedores WHERE id = ?', [id])
}

// ─── Criar vendedor ───────────────────────────────────────────────────────────
export async function createVendedor(
    nome: string,
    whatsapp: string,
    imageInput?: ImageInput,
    imageFileName?: string
): Promise<number> {
    let avatar_url: string | null = null

    if (imageInput) {
        avatar_url = await uploadImage(imageInput, 'products', imageFileName)
    }

    const result = await execute(
        'INSERT INTO vendedores (nome, whatsapp, avatar_url) VALUES (?, ?, ?)',
        [nome, whatsapp, avatar_url]
    )

    return result.insertId
}

// ─── Atualizar vendedor ───────────────────────────────────────────────────────
export async function updateVendedor(
    id: number,
    nome: string,
    whatsapp: string,
    imageInput?: ImageInput,
    imageFileName?: string
): Promise<boolean> {
    const existing = await getVendedorById(id)
    if (!existing) return false

    let avatar_url = existing.avatar_url

    if (imageInput) {
        avatar_url = await uploadImage(imageInput, 'products', imageFileName)
    }

    const result = await execute(
        'UPDATE vendedores SET nome = ?, whatsapp = ?, avatar_url = ? WHERE id = ?',
        [nome ?? existing.nome, whatsapp ?? existing.whatsapp, avatar_url, id]
    )

    return result.affectedRows > 0
}

// ─── Deletar vendedor ─────────────────────────────────────────────────────────
export async function deleteVendedor(id: number): Promise<boolean> {
    const result = await execute('DELETE FROM vendedores WHERE id = ?', [id])
    return result.affectedRows > 0
}