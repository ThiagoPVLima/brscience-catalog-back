import 'dotenv/config'
import { testConnection } from './lib/db.js'
import { getAllProducts, createProduct, updateProduct, deleteProduct } from './repositories/products.js'
import { getAllBanners, createBanner } from './repositories/banners.js'
import fs from 'node:fs'
import path from 'node:path'

async function main() {
  // ── 1. Verifica conexão com o banco ─────────────────────────────────────────
  await testConnection()

  // ── 2. Criar produto com imagem via Buffer ───────────────────────────────────
  // const buffer = fs.readFileSync(path.resolve('exemplo.jpg'))
  // const newId = await createProduct(
  //   { name: 'Produto Teste', description: 'Descrição', price: 99.90, active: true },
  //   buffer,
  //   'produto-teste.jpg'
  // )
  // console.log('Produto criado, ID:', newId)

  // ── 3. Criar produto com imagem via base64 ────────────────────────────────────
  // const base64 = 'data:image/jpeg;base64,/9j/4AAQ...'
  // const newId2 = await createProduct(
  //   { name: 'Produto Base64', price: 49.90, active: true },
  //   base64
  // )

  // ── 4. Listar produtos ────────────────────────────────────────────────────────
  const products = await getAllProducts()
  console.log('Produtos:', products)

  // ── 5. Atualizar produto ──────────────────────────────────────────────────────
  // await updateProduct(1, { price: 79.90 })

  // ── 6. Deletar produto (remove imagem do Appwrite também) ─────────────────────
  // await deleteProduct(1)

  // ── 7. Banners ────────────────────────────────────────────────────────────────
  const banners = await getAllBanners()
  console.log('Banners:', banners)

  // ── 8. Criar banner ───────────────────────────────────────────────────────────
  // const bannerBuffer = fs.readFileSync(path.resolve('banner.jpg'))
  // const bannerId = await createBanner(
  //   { title: 'Promoção', link: 'https://exemplo.com', active: true },
  //   bannerBuffer,
  //   'banner-promo.jpg'
  // )
  // console.log('Banner criado, ID:', bannerId)
}

main().catch(console.error)
