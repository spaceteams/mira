import { pool } from './pool'
import { Client } from './client'

export async function withTransaction(
  run: (client: Client) => Promise<void> | void,
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await run(new Client(client))
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export async function withTestClient(
  run: (client: Client) => Promise<void> | void,
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await run(new Client(client))
  } finally {
    await client.query('ROLLBACK')
    client.release()
  }
}
