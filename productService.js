import { db } from "./mysql.js";

// ─── CRIAR PRODUTO (Dinâmico para qualquer linha) ─────────────────────────────
export async function createProduct(dto) {
  // Usamos as chaves do DTO para bater com as colunas do seu MySQL
  const [result] = await db.execute(
    `INSERT INTO products 
     (name, line, code, ncm, cest, anvisa, price, distributor_price, image_url, discount_percentage, color, active) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dto.name,
      dto.line, // Aqui entra a "Linha" (ex: Detox, Professional)
      dto.code,
      dto.ncm || "",
      dto.cest || "",
      dto.anvisa || "",
      dto.price || "0,00",
      dto.distributorPrice || "",
      dto.image_url || null,
      dto.discountPercentage || 0,
      dto.color || null,
      1, // active por padrão
    ],
  );

  return { id: result.insertId, ...dto };
}

// ─── LISTAR TODOS (Organizado por Linha) ──────────────────────────────────────
export async function getProducts() {
  // Buscamos tudo e ordenamos por linha para o seu catálogo ficar bonito
  const [rows] = await db.execute(
    "SELECT * FROM products ORDER BY line ASC, name ASC",
  );
  return rows;
}

// ─── DELETAR (O ponto crítico) ────────────────────────────────────────────────
export async function deleteProduct(id) {
  // IMPORTANTE: O 'id' que vem do Front as vezes é String, convertemos para Number
  const numericId = Number(id);

  if (isNaN(numericId)) {
    throw new Error("ID inválido fornecido para exclusão");
  }

  const [result] = await db.execute("DELETE FROM products WHERE id = ?", [
    numericId,
  ]);

  // Se o banco retornar 0 linhas afetadas, o ID não existe lá
  if (result.affectedRows === 0) {
    return {
      success: false,
      error: "Produto não encontrado no banco de dados",
    };
  }

  return { success: true };
}
