import { pool } from './pool'
import { LyraMariadbClient } from './lyra-mariadb-client'

export async function withTransaction(
  run: (client: LyraMariadbClient) => Promise<void> | void,
) {
  const conn = await pool.getConnection()

  try {
    await conn.query('BEGIN')
    await run(new LyraMariadbClient(conn))
    await conn.query('COMMIT')
  } catch (e) {
    await conn.query('ROLLBACK')
    throw e
  } finally {
    conn.release()
  }
}

export async function withTestClient(
  run: (client: LyraMariadbClient) => Promise<void> | void,
) {
  const conn = await pool.getConnection()

  try {
    await conn.query('BEGIN')
    await run(new LyraMariadbClient(conn))
  } finally {
    await conn.query('ROLLBACK')
    conn.release()
  }
}
