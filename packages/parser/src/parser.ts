import { AST, Parser } from 'node-sql-parser'
import { safeArray } from './safe-array'
import { Dialect } from '@lyra/core'

const parser = new Parser()
export function parse(sql: string, dialect: Dialect): AST[] {
  return safeArray(parser.astify(sql, { database: dialect }))
}
