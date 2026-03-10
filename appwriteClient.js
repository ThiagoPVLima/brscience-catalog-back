import { Client, Storage, ID } from "node-appwrite"
import dotenv from "dotenv"

dotenv.config()

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

export const storage = new Storage(client)
export { ID }