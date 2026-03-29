import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'

import { getOne } from './lib/db.js'

import { testConnection } from './lib/db.js'

import {
  getAllProductLines,
  getProductLineByName,
  createProductLine,
  updateProductLine,
  deleteProductLine,
  ProductLine
} from './repositories/productLines.js'

import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from './repositories/products.js'

import {
  getAllBanners,
  getBannerById,
  deleteBanner
} from './repositories/banners.js'

import {
  getAllVendedores,
  getVendedorById,
  createVendedor,
  updateVendedor,
  deleteVendedor,
  Vendedor
} from './repositories/vendedores.js'
import { Product } from './types.js'
import { Banner } from './types.js'

async function main() {

  // ───────────────────────────────────────────────
  // TESTA CONEXÃO COM BANCO
  // ───────────────────────────────────────────────

  await testConnection()

  const app = express()
  const upload = multer({ storage: multer.memoryStorage() })

  app.use(cors())
  app.use(express.json())

  // ═══════════════════════════════════════════════
// AUTH LOGIN
// ═══════════════════════════════════════════════

app.post('/login', async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    const user = await getOne<any>(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.json({ success: true, user });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

  // ═══════════════════════════════════════════════
  // PRODUCT LINES
  // ═══════════════════════════════════════════════

  app.get('/product-lines', async (req: any, res: any) => {
    try {
      res.json(await getAllProductLines())
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/product-lines', upload.single('image'), async (req: any, res: any) => {
    try {

      const { name, color } = req.body

      if (!name)
        return res.status(400).json({ error: 'name é obrigatório' })

      const imageInput =
        req.file ? req.file.buffer : (req.body.image_url || undefined)

      const imageFileName =
        req.file ? req.file.originalname : undefined

      await createProductLine(name, color, imageInput, imageFileName)

      res.status(201).json(await getProductLineByName(name))

    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  app.put('/product-lines/:name', upload.single('image'), async (req: any, res: any) => {
    try {

      const oldName = decodeURIComponent(req.params.name)
      const { name, color } = req.body

      const imageInput =
        req.file ? req.file.buffer : (req.body.image_url || undefined)

      const imageFileName =
        req.file ? req.file.originalname : undefined

      const ok = await updateProductLine(
        oldName,
        name ?? oldName,
        color,
        imageInput,
        imageFileName
      )

      if (!ok)
        return res.status(404).json({ error: 'Linha não encontrada' })

      res.json({ success: true })

    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  app.delete('/product-lines/:name', async (req: any, res: any) => {
    try {

      const ok = await deleteProductLine(
        decodeURIComponent(req.params.name)
      )

      if (!ok)
        return res.status(404).json({ error: 'Linha não encontrada' })

      res.json({ success: true })

    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // ═══════════════════════════════════════════════
  // PRODUCTS
  // ═══════════════════════════════════════════════

  app.get('/products', async (req: any, res: any) => {
    try {
      res.json(await getAllProducts())
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/products/:id', async (req: any, res:any) => {
    try {

      const product = await getProductById(Number(req.params.id))

      if (!product)
        return res.status(404).json({ error: 'Produto não encontrado' })

      res.json(product)

    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/products', upload.single('image'), async (req: any, res: any) => {
    try {

      const {
        name,
        line,
        code,
        ncm,
        cest,
        anvisa,
        distributor_price,
        price,
        discount_percentage,
        color,
        sort_order
      } = req.body

      if (!name || !line || !code)
        return res.status(400).json({
          error: 'name, line e code são obrigatórios'
        })

      const imageInput =
        req.file ? req.file.buffer : (req.body.image_url || undefined)

      const imageFileName =
        req.file ? req.file.originalname : undefined

      const id = await createProduct(
        {
          name,
          line,
          code,
          ncm: ncm || '',
          cest: cest || '',
          anvisa: anvisa || '',
          distributor_price: distributor_price || '',
          price: price || '0,00',
          image_url: req.file ? null : (req.body.image_url || ''),
          discount_percentage:
            discount_percentage
              ? Number(discount_percentage)
              : null,
          color: color || null,
          sort_order: sort_order ? Number(sort_order) : 0,
          active: true
        },
        imageInput,
        imageFileName
      )

      res.status(201).json(await getProductById(id))

    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  app.delete('/products/:id', async (req: any, res: any) => {
    try {

      const ok = await deleteProduct(Number(req.params.id))

      if (!ok)
        return res.status(404).json({ error: 'Produto não encontrado' })

      res.json({ success: true })

    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // ═══════════════════════════════════════════════
  // BANNERS
  // ═══════════════════════════════════════════════

  app.get('/banners', async (req: any, res: any) => {
    try {
      res.json(await getAllBanners())
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  app.delete('/banners/:id', async (req: any, res: any) => {
    try {

      const ok = await deleteBanner(Number(req.params.id))

      if (!ok)
        return res.status(404).json({ error: 'Banner não encontrado' })

      res.json({ success: true })

    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // ═══════════════════════════════════════════════
  // VENDEDORES
  // ═══════════════════════════════════════════════

  app.get('/vendedores', async (req: any, res: any) => {
    try {
      res.json(await getAllVendedores())
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/vendedores', upload.single('avatar'), async (req: any, res: any) => {
    try {

      const { nome, whatsapp } = req.body

      if (!nome || !whatsapp)
        return res.status(400).json({
          error: 'nome e whatsapp são obrigatórios'
        })

      const imageInput =
        req.file ? req.file.buffer : (req.body.avatar_url || undefined)

      const imageFileName =
        req.file ? req.file.originalname : undefined

      const id = await createVendedor(
        nome,
        whatsapp,
        imageInput,
        imageFileName
      )

      res.status(201).json(await getVendedorById(id))

    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // ───────────────────────────────────────────────
  // START SERVER
  // ───────────────────────────────────────────────

  const PORT = process.env.PORT || 3000

  app.listen(PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${PORT}`)
  })
}

main().catch(console.error)