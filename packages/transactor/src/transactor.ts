import { PoolClient } from 'pg'
import { pool } from './pool'

export async function withTransaction(
  run: (client: PoolClient) => Promise<void> | void,
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await run(client)
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export async function withTestClient(
  run: (client: PoolClient) => Promise<void> | void,
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await run(client)
  } finally {
    await client.query('ROLLBACK')
    client.release()
  }
}
