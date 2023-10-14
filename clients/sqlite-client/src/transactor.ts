import { exec } from './db'
import { MiraSqliteClient } from './mira-sqlite-client'

export async function withTransaction(
  run: (client: MiraSqliteClient) => Promise<void> | void,
) {
  try {
    exec('BEGIN')
    await run(new MiraSqliteClient())
    exec('COMMIT')
  } catch (e) {
    exec('ROLLBACK')
    throw e
  }
}

export async function withTestClient(
  run: (client: MiraSqliteClient) => Promise<void> | void,
) {
  try {
    exec('BEGIN')
    await run(new MiraSqliteClient())
  } finally {
    exec('ROLLBACK')
  }
}
