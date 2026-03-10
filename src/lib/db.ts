import mysql, {
  type Pool,
  type RowDataPacket,
  type ResultSetHeader
} from 'mysql2/promise'
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

// ─── Pool ────────────────────────────────────────────────────────────────────
export const pool: Pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT) || 3306,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
  charset: 'utf8mb4',
})

// tipo aceito pelo mysql
type SQLParams = (string | number | boolean | null)[]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export async function query<T extends RowDataPacket>(
  sql: string,
  params: SQLParams = []
): Promise<T[]> {
  const [rows] = await pool.execute<T[]>(sql, params)
  return rows
}

export async function getOne<T extends RowDataPacket>(
  sql: string,
  params: SQLParams = []
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

export async function execute(
  sql: string,
  params: SQLParams = []
): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params)
  return result
}

export async function testConnection(): Promise<void> {
  try {
    await pool.query('SELECT 1')
    console.log('✅ MySQL conectado com sucesso!')
  } catch (err) {
    console.error('❌ Falha ao conectar no MySQL:', (err as Error).message)
    throw err
  }
}