import { Schema, Statement, StatementVariable, TableAlias } from '@lyra/core'
import { Delete } from 'node-sql-parser'
import { parseWhere } from './parse-where'

export function parseDelete(
  node: Delete,
  schema: Schema,
  _tableHint?: string,
): Statement {
  const aliases = (node.table ?? []) as TableAlias[]

  const variables: StatementVariable[] = []
  variables.push(...parseWhere(node.where, schema, aliases, []))

  return {
    columns: [],
    variables,
  }
}
