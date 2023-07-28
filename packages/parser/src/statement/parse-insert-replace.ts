import {
  getColumnType,
  getTable,
  Schema,
  Statement,
  StatementVariable,
} from 'model'
import { Insert_Replace } from 'node-sql-parser'
import { Value } from './value'
import { parseSelect } from './parse-select'

function extractFromValues(
  node: Insert_Replace,
  schema: Schema,
  values: Value[],
) {
  const variables: StatementVariable[] = []
  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    if (value.type === 'origin' || value.type === 'var') {
      const tableName = node.table[0].table
      if (typeof tableName !== 'string') {
        throw Error('could not find table name')
      }
      const tableDefinition = getTable(tableName, schema)
      if (tableDefinition === undefined) {
        throw Error('could not find table')
      }
      const column = node.columns
        ? node.columns[i]
        : tableDefinition.columnNames[i]

      const columnType = getColumnType(tableName, column, schema)

      variables.push({
        position: value.type === 'var' ? value.name - 1 : i,
        name: column,
        dataType: columnType ?? { type: 'UNKNOWN' },
      })
    }
  }
  return variables
}

export function parseInsertReplace(
  node: Insert_Replace,
  schema: Schema,
): Statement {
  let variables: StatementVariable[] = []
  if (Array.isArray(node.values)) {
    variables = extractFromValues(node, schema, node.values[0].value)
  } else {
    const statement = parseSelect(node.values, schema)
    variables = statement.variables
  }
  return {
    columns: [],
    variables,
  }
}
