import { ColumnRef, From } from 'node-sql-parser'
import { parse } from '../parser'
import { safeArray } from '../safe-array'
import {
  DataType,
  DataTypeSchema,
  Dialect,
  Schema,
  TableSchema,
} from 'mira-core'

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

type AlterExpr =
  | { action: 'add'; column: ColumnRef; definition: DataDefinition }
  | { action: 'drop'; column: ColumnRef }

export function parseSchema(
  sql: string,
  dialect: Dialect,
  schema?: Schema | undefined,
): Schema {
  const ast = parse(sql, dialect)
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
        const table = tables.find(
          (t) => t.name === (node.table as unknown as From[])[0].table,
        )
        if (table === undefined) {
          throw new Error(`table ${node.table.table} could not be found`)
        }
        for (const expr of node.expr as AlterExpr[]) {
          switch (expr.action) {
            case 'add':
              {
                const name = expr.column.column
                table.columns[expr.column.column.toLowerCase()] = DataTypeSchema
                  .parse({
                    ...expr.definition,
                    type: expr.definition.dataType,
                  })
                table.columnNames.push(name)
              }
              break
            case 'drop':
              {
                table.columnNames = table.columnNames.filter(
                  (c) => c !== expr.column.column,
                )
                delete table.columns[expr.column.column]
              }
              break
          }
        }
        break
      }
      default: {
        throw new Error(`${node.type} is not supported`)
      }
    }
  }

  return { tables }
}
