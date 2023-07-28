import { Schema, Statement, StatementVariable, TableAlias } from 'model'
import { Delete } from 'node-sql-parser'
import { parseWhere } from './parse-where'

export function parseDelete(node: Delete, schema: Schema): Statement {
  const aliases = (node.table ?? []) as TableAlias[]

  const variables: StatementVariable[] = []
  variables.push(...parseWhere(node.where, schema, aliases, []))

  return {
    columns: [],
    variables,
  }
}
