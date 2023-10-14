import { pool } from './pool'
import { MiraMariadbClient } from './mira-mariadb-client'

export async function withTransaction(
  run: (client: MiraMariadbClient) => Promise<void> | void,
) {
  const conn = await pool.getConnection()

  try {
    await conn.query('BEGIN')
    await run(new MiraMariadbClient(conn))
    await conn.query('COMMIT')
  } catch (e) {
    await conn.query('ROLLBACK')
    throw e
  } finally {
    conn.release()
  }
}

export async function withTestClient(
  run: (client: MiraMariadbClient) => Promise<void> | void,
) {
  const conn = await pool.getConnection()

  try {
    await conn.query('BEGIN')
    await run(new MiraMariadbClient(conn))
  } finally {
    await conn.query('ROLLBACK')
    conn.release()
  }
}
