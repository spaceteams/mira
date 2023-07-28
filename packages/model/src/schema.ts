import { DataType } from './data-type'
import { Statement } from './statement'

export type TableSchema = {
  name: string
  columnNames: string[]
  columns: Record<string, DataType>
}
export type Schema = {
  tables: TableSchema[]
}
export function withStatement(
  schema: Schema,
  name: string,
  statement: Statement,
): Schema {
  const columns: Record<string, DataType> = {}
  const columnNames: string[] = []
  for (const column of statement.columns) {
    columns[column.name] = column.dataType
    columnNames.push(column.name)
  }
  return {
    tables: [
      ...schema.tables,
      {
        name,
        columnNames,
        columns,
      },
    ],
  }
}

const nameEquals = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

export function getTable(
  tableName: string,
  schema: Schema,
): TableSchema | undefined {
  return schema.tables.find((t) => nameEquals(t.name, tableName))
}
export function getAliasedTable(
  tableName: string,
  schema: Schema,
  aliases: TableAlias[],
): TableSchema | undefined {
  const name = aliases.find((a) => a.as === tableName)?.table ?? tableName
  return getTable(name, schema)
}
export function getColumnType(
  tableName: string,
  columnName: string,
  schema: Schema,
): DataType | undefined {
  return getTable(tableName, schema)?.columns[columnName.toLocaleLowerCase()]
}

export type TableAlias = {
  table: string
  as?: string
}

export function findColumnFromAliasesType(
  tableName: string | null | undefined,
  columnName: string,
  schema: Schema,
  aliases: TableAlias[],
) {
  const exactMatch = aliases.find(
    (from) => from.as === tableName || from.table === tableName,
  )
  const candidates = exactMatch ? [exactMatch] : aliases
  for (const alias of candidates) {
    const t = getColumnType(alias.table, columnName, schema)
    if (t !== undefined) {
      return t
    }
  }
  return undefined
}
