import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
