import { Schema, StatementColumn, StatementVariable, TableAlias } from 'model'
import { extractVariables, isBinaryExpression } from './binary-expression'

export function parseWhere(
  where: unknown,
  schema: Schema,
  aliases: TableAlias[],
  columns: StatementColumn[],
  offset = 0,
): StatementVariable[] {
  if (isBinaryExpression(where)) {
    return extractVariables(where, schema, aliases, columns, 'where', offset)
  }
  return []
}
