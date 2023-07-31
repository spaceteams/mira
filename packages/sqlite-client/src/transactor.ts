import { db } from './db'
import { Client } from './client'

export async function withTransaction(
  run: (client: Client) => Promise<void> | void,
) {
  try {
    db.exec('BEGIN')
    await run(new Client())
    db.exec('COMMIT')
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}

export async function withTestClient(
  run: (client: Client) => Promise<void> | void,
) {
  try {
    db.exec('BEGIN')
    await run(new Client())
  } finally {
    db.exec('ROLLBACK')
  }
}
