import { exec } from './db'
import { LyraSqliteClient } from './lyra-sqlite-client'

export async function withTransaction(
  run: (client: LyraSqliteClient) => Promise<void> | void,
) {
  try {
    exec('BEGIN')
    await run(new LyraSqliteClient())
    exec('COMMIT')
  } catch (e) {
    exec('ROLLBACK')
    throw e
  }
}

export async function withTestClient(
  run: (client: LyraSqliteClient) => Promise<void> | void,
) {
  try {
    exec('BEGIN')
    await run(new LyraSqliteClient())
  } finally {
    exec('ROLLBACK')
  }
}
