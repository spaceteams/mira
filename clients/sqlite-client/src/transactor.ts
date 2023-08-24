import { db } from './db'
import { LyraSqliteClient } from './lyra-sqlite-client'

export async function withTransaction(
  run: (client: LyraSqliteClient) => Promise<void> | void,
) {
  try {
    db.exec('BEGIN')
    await run(new LyraSqliteClient())
    db.exec('COMMIT')
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}

export async function withTestClient(
  run: (client: LyraSqliteClient) => Promise<void> | void,
) {
  try {
    db.exec('BEGIN')
    await run(new LyraSqliteClient())
  } finally {
    db.exec('ROLLBACK')
  }
}
