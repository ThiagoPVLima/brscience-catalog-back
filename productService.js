import { db } from "./mysql.js"

export async function createProduct(name, imageUrl, price) {

  const [result] = await db.execute(
    "INSERT INTO products (name, image, price) VALUES (?, ?, ?)",
    [name, imageUrl, price]
  )

  return {
    id: result.insertId,
    name,
    image: imageUrl,
    price
  }
}

export async function getProducts() {

  const [rows] = await db.execute(
    "SELECT id, name, image, price FROM products ORDER BY id DESC"
  )

  return rows
}

export async function deleteProduct(id) {

  await db.execute(
    "DELETE FROM products WHERE id = ?",
    [id]
  )

  return { success: true }
}