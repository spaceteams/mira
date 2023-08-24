import { pool } from './pool'
import { LyraPostgresClient } from './lyra-postgres-client'

export async function withTransaction(
  run: (client: LyraPostgresClient) => Promise<void> | void,
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await run(new LyraPostgresClient(client))
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export async function withTestClient(
  run: (client: LyraPostgresClient) => Promise<void> | void,
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await run(new LyraPostgresClient(client))
  } finally {
    await client.query('ROLLBACK')
    client.release()
  }
}
