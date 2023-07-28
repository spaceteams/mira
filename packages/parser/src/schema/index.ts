import { ColumnRef } from 'node-sql-parser'
import { parse } from '../parser'
import { safeArray } from '../safe-array'
import { DataType, DataTypeSchema, Schema, TableSchema } from 'model'

type DataDefinition = {
  dataType: string
}
type ColumnDefinition = {
  column: ColumnRef
  definition: DataDefinition
  resource: 'column'
}

const isColumnDefinition = (v: unknown): v is ColumnDefinition =>
  typeof v === 'object' &&
  v !== null &&
  'resource' in v &&
  v.resource === 'column'

export function parseSchema(sql: string): Schema {
  const ast = parse(sql)
  const tables: TableSchema[] = []

  for (const node of safeArray(ast)) {
    switch (node.type) {
      case 'create': {
        const columns: Record<string, DataType> = {}
        const columnNames: string[] = []
        for (const definition of node.create_definitions ?? []) {
          if (isColumnDefinition(definition)) {
            const name = definition.column.column
            columns[name.toLowerCase()] = DataTypeSchema.parse({
              ...definition.definition,
              type: definition.definition.dataType,
            })
            columnNames.push(name)
          }
        }
        const tableName = node.table?.[0].table
        if (tableName !== undefined) {
          tables.push({
            name: tableName,
            columnNames,
            columns,
          })
        }
        break
      }
      case 'alter': {
        throw new Error('alter is not supported yet')
      }
      default: {
        throw new Error(`${node.type} is not supported`)
      }
    }
  }

  return { tables }
}
