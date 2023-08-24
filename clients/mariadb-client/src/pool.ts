import { createPool } from 'mariadb'

export const pool = createPool({
  host: process.env.MARIADB_HOST,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  connectionLimit: 5,
})
