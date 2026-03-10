import mysql, { type Pool, type RowDataPacket, type ResultSetHeader } from 'mysql2/promise'
import 'dotenv/config'

// ─── Validação de env ────────────────────────────────────────────────────────
const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD = '',
  DB_NAME,
} = process.env

if (!DB_HOST || !DB_USER || !DB_NAME) {
  throw new Error('❌ Variáveis DB_HOST, DB_USER e DB_NAME não encontradas no .env')
}

// ─── Pool de conexões ────────────────────────────────────────────────────────
export const pool: Pool = mysql.createPool({
  host:               DB_HOST,
  port:               Number(DB_PORT) || 3306,
  user:               DB_USER,
  password:           DB_PASSWORD,
  database:           DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           'Z',        // UTC
  charset:            'utf8mb4',
})

// ─── Helpers tipados ─────────────────────────────────────────────────────────

/**
 * Executa uma query SELECT e retorna um array tipado.
 * Uso: const rows = await query<Product>('SELECT * FROM products')
 */
export async function query<T extends RowDataPacket>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const [rows] = await pool.execute<T[]>(sql, params)
  return rows
}

/**
 * Retorna a primeira linha ou null.
 * Uso: const product = await getOne<Product>('SELECT * FROM products WHERE id = ?', [1])
 */
export async function getOne<T extends RowDataPacket>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

/**
 * Executa INSERT / UPDATE / DELETE e retorna o ResultSetHeader.
 * Uso: const result = await execute('INSERT INTO products ...', [...])
 *      result.insertId, result.affectedRows
 */
export async function execute(
  sql: string,
  params: unknown[] = []
): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params)
  return result
}

/**
 * Verifica conexão no boot da aplicação.
 */
export async function testConnection(): Promise<void> {
  try {
    await pool.query('SELECT 1')
    console.log('✅ MySQL conectado com sucesso!')
  } catch (err) {
    console.error('❌ Falha ao conectar no MySQL:', (err as Error).message)
    throw err
  }
}
