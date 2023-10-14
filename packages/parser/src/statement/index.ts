import { Dialect, Schema, Statement } from 'mira-core'
import { parse } from '../parser'
import { parseNode } from './parse-node'

export function parseStatement(
  sql: string,
  dialect: Dialect,
  schema: Schema,
): Statement {
  const ast = parse(sql, dialect)
  if (ast.length > 1) {
    throw new Error('more than one statement')
  }
  return parseNode(ast[0], schema)
}
