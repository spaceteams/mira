import Database, { Statement } from 'better-sqlite3'
import { BoundStatement } from 'mira-core'

const db = new Database(process.env.SQLITE_FILE ?? ':memory:', {})

export const preparedStatementsCache: Record<string, Statement> = {}

function prepare(statement: BoundStatement) {
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

export function exec(sql: string) {
  db.exec(sql)
}

export function run(
  statement: BoundStatement,
  params: Record<string, unknown>,
) {
  const stmt = prepare(statement)
  stmt.run(params)
}
export function all(
  statement: BoundStatement,
  params: Record<string, unknown>,
) {
  const stmt = prepare(statement)
  return stmt.all(params)
}
