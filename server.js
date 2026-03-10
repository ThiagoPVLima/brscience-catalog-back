import 'dotenv/config'
import express from 'express'
import cors    from 'cors'
import multer  from 'multer'

import { getAllProductLines, getProductLineByName, createProductLine, updateProductLine, deleteProductLine } from './src/repositories/productLines.js'
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from './src/repositories/products.js'
import { getAllBanners, getBannerById, createBanner, deleteBanner } from './src/repositories/banners.js'
import { getAllVendedores, getVendedorById, createVendedor, updateVendedor, deleteVendedor } from './src/repositories/vendedores.js'

const app    = express()
const upload = multer({ storage: multer.memoryStorage() })

app.use(cors())
app.use(express.json())

// ══════════════════════════════════════════════════════════════════
//  PRODUCT LINES
// ══════════════════════════════════════════════════════════════════

app.get('/product-lines', async (req, res) => {
  try {
    res.json(await getAllProductLines())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/product-lines', upload.single('image'), async (req, res) => {
  try {
    const { name, color } = req.body
    if (!name) return res.status(400).json({ error: 'name é obrigatório' })
    const imageInput    = req.file ? req.file.buffer : (req.body.image_url || undefined)
    const imageFileName = req.file ? req.file.originalname : undefined
    await createProductLine(name, color, imageInput, imageFileName)
    res.status(201).json(await getProductLineByName(name))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/product-lines/:name', upload.single('image'), async (req, res) => {
  try {
    const oldName       = decodeURIComponent(req.params.name)
    const { name, color } = req.body
    const imageInput    = req.file ? req.file.buffer : (req.body.image_url || undefined)
    const imageFileName = req.file ? req.file.originalname : undefined
    const ok = await updateProductLine(oldName, name ?? oldName, color, imageInput, imageFileName)
    if (!ok) return res.status(404).json({ error: 'Linha não encontrada' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/product-lines/:name', async (req, res) => {
  try {
    const ok = await deleteProductLine(decodeURIComponent(req.params.name))
    if (!ok) return res.status(404).json({ error: 'Linha não encontrada' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ══════════════════════════════════════════════════════════════════
//  PRODUCTS
// ══════════════════════════════════════════════════════════════════

app.get('/products', async (req, res) => {
  try {
    res.json(await getAllProducts())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/products/:id', async (req, res) => {
  try {
    const product = await getProductById(Number(req.params.id))
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, line, code, ncm, cest, anvisa,
            distributor_price, price, discount_percentage, color, sort_order } = req.body
    if (!name || !line || !code)
      return res.status(400).json({ error: 'name, line e code são obrigatórios' })

    const imageInput    = req.file ? req.file.buffer : (req.body.image_url || undefined)
    const imageFileName = req.file ? req.file.originalname : undefined

    const id = await createProduct(
      {
        name, line, code,
        ncm:                ncm || '',
        cest:               cest || '',
        anvisa:             anvisa || '',
        distributor_price:  distributor_price || '',
        price:              price || '0,00',
        image_url:          req.file ? null : (req.body.image_url || ''),
        discount_percentage: discount_percentage ? Number(discount_percentage) : null,
        color:              color || null,
        sort_order:         sort_order ? Number(sort_order) : 0,
        active:             true,
      },
      imageInput,
      imageFileName
    )
    res.status(201).json(await getProductById(id))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const id   = Number(req.params.id)
    const body = req.body
    const imageInput    = req.file ? req.file.buffer : (body.image_url || undefined)
    const imageFileName = req.file ? req.file.originalname : undefined

    const dto = {}
    if (body.name               !== undefined) dto.name               = body.name
    if (body.line               !== undefined) dto.line               = body.line
    if (body.code               !== undefined) dto.code               = body.code
    if (body.ncm                !== undefined) dto.ncm                = body.ncm
    if (body.cest               !== undefined) dto.cest               = body.cest
    if (body.anvisa             !== undefined) dto.anvisa             = body.anvisa
    if (body.distributor_price  !== undefined) dto.distributor_price  = body.distributor_price
    if (body.price              !== undefined) dto.price              = body.price
    if (body.discount_percentage !== undefined)
      dto.discount_percentage = body.discount_percentage !== '' ? Number(body.discount_percentage) : null
    if (body.color              !== undefined) dto.color              = body.color || null
    if (body.sort_order         !== undefined) dto.sort_order         = Number(body.sort_order)
    if (body.active             !== undefined) dto.active             = body.active !== 'false'

    const ok = await updateProduct(id, dto, imageInput, imageFileName)
    if (!ok) return res.status(404).json({ error: 'Produto não encontrado' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/products/:id', async (req, res) => {
  try {
    const ok = await deleteProduct(Number(req.params.id))
    if (!ok) return res.status(404).json({ error: 'Produto não encontrado' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ══════════════════════════════════════════════════════════════════
//  BANNERS
// ══════════════════════════════════════════════════════════════════

app.get('/banners', async (req, res) => {
  try {
    res.json(await getAllBanners())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/banners', upload.fields([
  { name: 'image',       maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, link, order, active } = req.body
    if (!title) return res.status(400).json({ error: 'title é obrigatório' })

    const files = req.files
    const { uploadImage } = await import('./src/lib/appwrite.js')
    const { execute }     = await import('./src/lib/db.js')

    const imageInput = files?.image?.[0]?.buffer ?? req.body.image_url
    const imageName  = files?.image?.[0]?.originalname

    const imageUrl = typeof imageInput === 'string' && imageInput.startsWith('http')
      ? imageInput
      : await uploadImage(imageInput, 'banners', imageName)

    let mobileUrl = null
    if (files?.mobileImage?.[0]) {
      mobileUrl = await uploadImage(files.mobileImage[0].buffer, 'banners', files.mobileImage[0].originalname)
    } else if (req.body.mobile_image_url) {
      mobileUrl = req.body.mobile_image_url
    }

    const result = await execute(
      'INSERT INTO banners (title, image_url, mobile_image_url, link, `order`, active) VALUES (?, ?, ?, ?, ?, ?)',
      [title, imageUrl, mobileUrl, link || null, order ?? 0, active === 'false' ? 0 : 1]
    )
    res.status(201).json(await getBannerById(result.insertId))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/banners/:id', upload.fields([
  { name: 'image',       maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const id     = Number(req.params.id)
    const banner = await getBannerById(id)
    if (!banner) return res.status(404).json({ error: 'Banner não encontrado' })

    const files = req.files
    const body  = req.body
    const { uploadImage } = await import('./src/lib/appwrite.js')
    const { execute }     = await import('./src/lib/db.js')

    let image_url        = banner.image_url
    let mobile_image_url = banner.mobile_image_url ?? null

    if (files?.image?.[0]) {
      image_url = await uploadImage(files.image[0].buffer, 'banners', files.image[0].originalname)
    } else if (body.image_url) {
      image_url = body.image_url
    }

    if (files?.mobileImage?.[0]) {
      mobile_image_url = await uploadImage(files.mobileImage[0].buffer, 'banners', files.mobileImage[0].originalname)
    } else if (body.mobile_image_url !== undefined) {
      mobile_image_url = body.mobile_image_url || null
    }

    await execute(
      'UPDATE banners SET title=?, image_url=?, mobile_image_url=?, link=?, `order`=?, active=? WHERE id=?',
      [
        body.title  ?? banner.title,
        image_url,
        mobile_image_url,
        body.link !== undefined ? (body.link || null) : banner.link,
        body.order  !== undefined ? Number(body.order)  : banner.order,
        body.active !== undefined ? (body.active !== 'false' ? 1 : 0) : (banner.active ? 1 : 0),
        id
      ]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/banners/:id', async (req, res) => {
  try {
    const ok = await deleteBanner(Number(req.params.id))
    if (!ok) return res.status(404).json({ error: 'Banner não encontrado' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ══════════════════════════════════════════════════════════════════
//  VENDEDORES
// ══════════════════════════════════════════════════════════════════

app.get('/vendedores', async (req, res) => {
  try {
    res.json(await getAllVendedores())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/vendedores', upload.single('avatar'), async (req, res) => {
  try {
    const { nome, whatsapp } = req.body
    if (!nome || !whatsapp) return res.status(400).json({ error: 'nome e whatsapp são obrigatórios' })
    const imageInput    = req.file ? req.file.buffer : (req.body.avatar_url || undefined)
    const imageFileName = req.file ? req.file.originalname : undefined
    const id = await createVendedor(nome, whatsapp, imageInput, imageFileName)
    res.status(201).json(await getVendedorById(id))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/vendedores/:id', upload.single('avatar'), async (req, res) => {
  try {
    const id   = Number(req.params.id)
    const { nome, whatsapp } = req.body
    const imageInput    = req.file ? req.file.buffer : (req.body.avatar_url || undefined)
    const imageFileName = req.file ? req.file.originalname : undefined
    const ok = await updateVendedor(id, nome, whatsapp, imageInput, imageFileName)
    if (!ok) return res.status(404).json({ error: 'Vendedor não encontrado' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/vendedores/:id', async (req, res) => {
  try {
    const ok = await deleteVendedor(Number(req.params.id))
    if (!ok) return res.status(404).json({ error: 'Vendedor não encontrado' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`)
})


