import { pool } from './pool'
import { MiraPostgresClient } from './mira-postgres-client'

export async function withTransaction(
  run: (client: MiraPostgresClient) => Promise<void> | void,
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await run(new MiraPostgresClient(client))
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export async function withTestClient(
  run: (client: MiraPostgresClient) => Promise<void> | void,
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await run(new MiraPostgresClient(client))
  } finally {
    await client.query('ROLLBACK')
    client.release()
  }
}
