import {
  findColumnFromAliasesType,
  Schema,
  Statement,
  StatementVariable,
  TableAlias,
} from 'model'
import { Update } from 'node-sql-parser'
import { parseWhere } from './parse-where'
import { Value } from './value'
import { BinaryExpression, extractVariables } from './binary-expression'

export function parseUpdate(node: Update, schema: Schema): Statement {
  const aliases = (node.table ?? []) as TableAlias[]
  const variables: StatementVariable[] = []
  for (const set of node.set) {
    const value = set.value as Value | BinaryExpression
    if (value.type === 'origin' || value.type === 'var') {
      const columnType = findColumnFromAliasesType(
        set.table,
        set.column,
        schema,
        aliases,
      ) ?? {
        type: 'UNKNOWN',
      }
      variables.push({
        position: value.type === 'var' ? value.name - 1 : variables.length,
        name: set.column,
        dataType: columnType,
      })
    } else if (value.type === 'binary_expr') {
      variables.push(
        ...extractVariables(
          value,
          schema,
          aliases,
          [],
          'set',
          variables.length,
        ),
      )
    }
  }

  variables.push(
    ...parseWhere(node.where, schema, aliases, [], variables.length),
  )

  return {
    columns: [],
    variables,
  }
}
