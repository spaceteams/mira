import { PoolClient } from 'pg'
import { pool } from './pool'

export async function transact(
  runTransaction: (client: PoolClient) => Promise<void>,
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await runTransaction(client)
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
