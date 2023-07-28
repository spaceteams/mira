import { AST, Parser } from 'node-sql-parser'
import { safeArray } from './safe-array'

const parser = new Parser()
export function parse(sql: string): AST[] {
  return safeArray(parser.astify(sql, { database: 'postgresql' }))
}
