import { createClient } from '@libsql/client'
import dotenv from 'dotenv'

dotenv.config()

export const turso = createClient({
  url: process.env.TURSO_URL as string,
  authToken: process.env.TURSO_TOKEN as string
})
