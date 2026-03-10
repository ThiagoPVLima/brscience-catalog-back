import express from "express"
import cors from "cors"
import multer from "multer"

import { uploadImage } from "./uploadImage.js"
import { createProduct, getProducts, deleteProduct } from "./productService.js"

const app = express()
const upload = multer({ dest: "uploads/" })

app.use(cors())
app.use(express.json())

// ─────────────────────────────
// Criar produto
// ─────────────────────────────

app.post("/products", upload.single("image"), async (req, res) => {

  try {

    const { name, price } = req.body

    if (!req.file) {
      return res.status(400).json({ error: "Imagem obrigatória" })
    }

    const imageUrl = await uploadImage(
      req.file.path,
      process.env.APPWRITE_BUCKET_ID
    )

    const product = await createProduct(name, imageUrl, price)

    res.json(product)

  } catch (error) {

    console.error(error)
    res.status(500).json({ error: error.message })

  }

})


// ─────────────────────────────
// Listar produtos
// ─────────────────────────────

app.get("/products", async (req, res) => {

  try {

    const products = await getProducts()
    res.json(products)

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

})


// ─────────────────────────────
// Deletar produto
// ─────────────────────────────

app.delete("/products/:id", async (req, res) => {

  try {

    const result = await deleteProduct(req.params.id)
    res.json(result)

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

})


// ─────────────────────────────

const PORT = 3000

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`)
})