import {
  DataType,
  DataTypeSchema,
  findColumnFromAliasesType,
  getAliasedTable,
  getTable,
  Schema,
  Statement,
  StatementColumn,
  StatementVariable,
  TableAlias,
  withStatement,
} from 'model'
import { AST, Column, ColumnRef, Select, With } from 'node-sql-parser'
import { safeArray } from '../safe-array'
import { parseWhere } from './parse-where'
import { parseNode } from './parse-node'
import { Variable } from './value'
import { Origin } from './value'
import {
  ExprList,
  extractVariables,
  isBinaryExpression,
  ValueList,
} from './binary-expression'

const isColumn = (v: unknown): v is Column =>
  typeof v === 'object' && v !== null && 'as' in v && 'expr' in v

function getFirstColumnRef(expr: Expression): ColumnRef | undefined {
  switch (expr.type) {
    case 'column_ref':
      return expr
    case 'binary_expr':
    case 'binary_expression':
      return getFirstColumnRef(expr.left) ?? getFirstColumnRef(expr.right)
    default:
      return undefined
  }
}
function getFirstLiteralDataType(expr: Expression): DataType | undefined {
  switch (expr.type) {
    case 'single_quote_string':
      return { type: 'TEXT' }
    case 'number':
      return { type: 'DECIMAL' }
    case 'binary_expr':
    case 'binary_expression':
      return (
        getFirstLiteralDataType(expr.left) ??
        getFirstLiteralDataType(expr.right)
      )
    default:
      return undefined
  }
}

function getFirstColumnRefFromValueList(
  values: ValueList,
): ColumnRef | undefined {
  for (const v of values) {
    if ('ast' in v) {
      continue
    } else if (v.type === 'column_ref') {
      return v
    }
  }
  return undefined
}

function getDataTypeOfWindowFunc(
  expr: WindowFunc,
  schema: Schema,
  aliases: TableAlias[],
): DataType | undefined {
  switch (expr.name) {
    case 'RANK':
      return { type: 'INTEGER' }
    case 'LEAD':
    case 'LAG': {
      const column = getFirstColumnRefFromValueList(expr.args.value)
      return column
        ? findColumnFromAliasesType(
            column.table,
            column.column,
            schema,
            aliases,
          )
        : { type: 'UNKNOWN' }
    }
    default:
      return undefined
  }
}

type WindowFunc = {
  type: 'window_func' | 'function'
  name: string
  args: ExprList
}
type Expression =
  | ColumnRef
  | Variable
  | Origin
  | WindowFunc
  | {
      type: 'aggr_func'
      name: string
      args: { expr: ColumnRef }
    }
  | {
      type: 'case'
      args: [{ result: Expression }]
    }
  | {
      type: 'cast'
      as?: string
      target: { dataType: string }
      expr: Expression
    }
  | {
      type: 'binary_expression' | 'binary_expr'
      left: Expression
      right: Expression
    }
  | { type: 'single_quote_string' }
  | { type: 'number' }

type From = {
  table?: string
  expr?: {
    ast: AST
  }
  as?: string
}
function parseFrom(
  froms: From[],
  schema: Schema,
): { aliases: TableAlias[]; schema: Schema; variables: StatementVariable[] } {
  const aliases: TableAlias[] = []
  const variables: StatementVariable[] = []
  let extendedSchema = schema
  for (let i = 0; i < froms.length; i++) {
    const from = froms[i]
    if (from.table !== undefined) {
      aliases.push({ table: from.table, as: from.as })
    } else if (from.expr !== undefined) {
      const subQuery = parseNode(from.expr.ast, extendedSchema)
      variables.push(...subQuery.variables)
      extendedSchema = withStatement(
        extendedSchema,
        from.as ?? `from${i}`,
        subQuery,
      )
      aliases.push({ table: from.as ?? `from${i}`, as: from.as })
    }
  }
  return { aliases, schema: extendedSchema, variables }
}

export function parseSelect(
  node: Select,
  schema: Schema,
  tableHint?: string,
): Statement {
  const columns: StatementColumn[] = []

  const from = parseFrom((node.from ?? []) as From[], schema)
  const variables = from.variables
  const aliases = from.aliases
  let extendedSchema = from.schema

  const ctes = node.with as unknown as With[]
  for (const cte of ctes ?? []) {
    const stmt = cte.stmt as unknown as AST | { ast: AST }
    const statement = parseNode('ast' in stmt ? stmt.ast : stmt, schema)
    const name =
      typeof cte.name === 'string'
        ? cte.name
        : (cte.name as unknown as { value: string }).value
    extendedSchema = withStatement(extendedSchema, name, statement)
  }
  for (const column of safeArray(node.columns)) {
    if (column === '*') {
      for (const alias of aliases) {
        const table = getTable(alias.table, schema)
        if (table) {
          for (const name of table.columnNames) {
            columns.push({
              name,
              dataType: table.columns[name],
            })
          }
        }
      }
    } else if (isColumn(column)) {
      const expr = column.expr as Expression
      switch (expr.type) {
        case 'column_ref': {
          if (expr.column === '*' && expr.table !== null) {
            const table = getAliasedTable(expr.table, schema, aliases)
            if (table) {
              for (const name of table.columnNames) {
                columns.push({
                  name,
                  dataType: table.columns[name],
                })
              }
            }
          } else {
            columns.push({
              name: column.as ?? expr.column,
              dataType: findColumnFromAliasesType(
                expr.table,
                expr.column,
                extendedSchema,
                aliases,
              ) ?? {
                type: 'UNKNOWN',
              },
            })
          }
          break
        }
        case 'function':
        case 'window_func': {
          const dataType = getDataTypeOfWindowFunc(
            expr,
            extendedSchema,
            aliases,
          )
          columns.push({
            name: column.as,
            dataType: dataType ?? {
              type: 'UNKNOWN',
            },
          })
          break
        }
        case 'aggr_func': {
          columns.push({
            name: column.as ?? expr.args.expr.column,
            dataType: findColumnFromAliasesType(
              expr.args.expr.table,
              expr.args.expr.column,
              extendedSchema,
              aliases,
            ) ?? {
              type: 'UNKNOWN',
            },
          })
          break
        }
        case 'case': {
          let ref: ColumnRef | undefined = undefined
          for (const arg of expr.args) {
            const r = getFirstColumnRef(arg.result)
            if (r !== undefined) {
              ref = r
              break
            }
          }
          if (ref !== undefined) {
            columns.push({
              name: column.as ?? ref?.column,
              dataType: findColumnFromAliasesType(
                ref?.table,
                ref?.column,
                extendedSchema,
                aliases,
              ) ?? {
                type: 'UNKNOWN',
              },
            })
          } else {
            let literalType: DataType | undefined = undefined
            for (const arg of expr.args) {
              const t = getFirstLiteralDataType(arg.result)
              if (t !== undefined) {
                literalType = t
                break
              }
            }
            columns.push({
              name: column.as,
              dataType: literalType ?? {
                type: 'UNKNOWN',
              },
            })
          }
          break
        }
        case 'cast': {
          columns.push({
            name: expr.as ?? column.as,
            dataType: DataTypeSchema.parse({
              ...expr.target,
              type: expr.target.dataType,
            }),
          })
        }
      }
    }
  }

  for (const column of safeArray(node.columns)) {
    if (isColumn(column)) {
      const expr = column.expr as Expression
      if (isBinaryExpression(expr)) {
        variables.push(
          ...extractVariables(
            expr,
            extendedSchema,
            aliases,
            columns,
            '',
            variables.length,
          ),
        )
      }
    }
  }
  variables.push(
    ...parseWhere(
      node.where,
      extendedSchema,
      aliases,
      columns,
      variables.length,
    ),
  )

  return {
    columns,
    variables,
  }
}
