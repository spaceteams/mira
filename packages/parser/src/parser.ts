import { AST, Parser } from 'node-sql-parser'
import { safeArray } from './safe-array'

const parser = new Parser()
export function parse(
  sql: string,
  dialect: 'postgresql' | 'sqlite' = 'postgresql',
): AST[] {
  return safeArray(parser.astify(sql, { database: dialect }))
}
