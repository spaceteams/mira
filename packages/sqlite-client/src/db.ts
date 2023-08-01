import Database, { Statement } from 'better-sqlite3'
import { BoundStatement } from 'model'

export const db = new Database(process.env.SQLITE_FILE ?? ':memory:', {})

export const preparedStatementsCache: Record<string, Statement> = {}

export function prepare(statement: BoundStatement) {
  const { name, sql } = statement
  if (name !== undefined && name in preparedStatementsCache) {
    return preparedStatementsCache[name]
  }
  const s = db.prepare(sql)
  if (name !== undefined) {
    preparedStatementsCache[name] = s
  }
  return s
}
