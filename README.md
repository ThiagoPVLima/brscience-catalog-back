# brscience-catalog-back

Backend TypeScript para catálogo de produtos — **Appwrite Storage** (imagens) + **MySQL** (dados).

---

## Stack

| Camada    | Tecnologia          |
|-----------|---------------------|
| Linguagem | TypeScript 5        |
| Banco     | MySQL 8 via mysql2  |
| Storage   | Appwrite (Node SDK) |
| Runtime   | Node.js 18+         |

---

## Setup

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

### 3. Criar as tabelas no MySQL
```bash
mysql -u root -p brscience_catalog < migrations/001_init.sql
```

### 4. Rodar em desenvolvimento
```bash
npm run dev
```

### 5. Build para produção
```bash
npm run build
npm start
```

---

## Estrutura

```
src/
├── lib/
│   ├── appwrite.ts        # Client Appwrite + uploadImage + deleteImage
│   └── db.ts              # Pool MySQL + query / getOne / execute
├── repositories/
│   ├── products.ts        # CRUD de produtos (DB + Storage integrado)
│   └── banners.ts         # CRUD de banners
├── types.ts               # Interfaces e DTOs
└── index.ts               # Entrypoint / exemplos de uso
migrations/
└── 001_init.sql           # Schema inicial (categories, products, banners)
```

---

## uploadImage — inputs aceitos

```ts
import { uploadImage } from './src/lib/appwrite.js'

// Buffer (leitura de arquivo local)
const buffer = fs.readFileSync('./foto.jpg')
await uploadImage(buffer, 'products', 'foto.jpg')

// base64 data URL (vindo do frontend)
await uploadImage('data:image/jpeg;base64,...', 'products')

// ReadStream
await uploadImage(fs.createReadStream('./foto.jpg'), 'products')

// Blob
await uploadImage(someBlob, 'banners', 'banner.png')
```

---

## Configuração no painel do Appwrite

1. Crie um projeto no [Appwrite Cloud](https://cloud.appwrite.io)
2. Vá em **Storage → Create Bucket**
3. Crie dois buckets: `products` e `banners`
4. Em cada bucket, em **Permissions**, adicione **role:all → read** para torná-los públicos
5. Gere uma **Server API Key** em **Overview → API Keys** com escopo `storage.write`
