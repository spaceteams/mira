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

export function parseSchema(sql: string, schema?: Schema | undefined): Schema {
  const ast = parse(sql)
  let tables: TableSchema[] = [...(schema?.tables ?? [])]

  for (const node of safeArray(ast)) {
    switch (node.type) {
      case 'create': {
        const tableName = node.table?.[0].table
        if (tableName === undefined) {
          throw new Error('table name missing')
        }
        tables = tables.filter((t) => t.name !== tableName)

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
