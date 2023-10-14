import { AST, Parser } from 'node-sql-parser'
import { safeArray } from './safe-array'
import { Dialect } from 'mira-core'

const parser = new Parser()
export function parse(sql: string, dialect: Dialect): AST[] {
  return safeArray(parser.astify(sql, { database: dialect }))
}
