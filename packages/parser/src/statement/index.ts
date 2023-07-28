import { Schema, Statement } from 'model'
import { parse } from '../parser'
import { parseNode } from './parse-node'

export function parseStatement(sql: string, schema: Schema): Statement {
  const ast = parse(sql)
  if (ast.length > 1) {
    throw new Error('more than one statement')
  }
  return parseNode(ast[0], schema)
}
