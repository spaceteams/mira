import {
  DataType,
  findColumnFromAliasesType,
  Schema,
  Statement,
  StatementColumn,
  StatementVariable,
  TableAlias,
  withCTE,
} from 'model'
import { AST, Column, ColumnRef, Select, With } from 'node-sql-parser'
import { safeArray } from '../safe-array'
import { parseWhere } from './parse-where'
import { parseNode } from './parse-node'
import { Variable } from './value'
import { Origin } from './value'
import { extractVariables, isBinaryExpression } from './binary-expression'

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

function getDataTypeOfWindowFunc(expr: WindowFunc): DataType | undefined {
  switch (expr.name) {
    case 'RANK':
      return { type: 'INTEGER' }
    default:
      return undefined
  }
}

type WindowFunc = {
  type: 'window_func'
  name: string
}
type Expression =
  | ColumnRef
  | Variable
  | Origin
  | {
      type: 'window_func'
      name: string
    }
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
      type: 'binary_expression' | 'binary_expr'
      left: Expression
      right: Expression
    }
  | { type: 'single_quote_string' }
  | { type: 'number' }

export function parseSelect(node: Select, schema: Schema): Statement {
  const columns: StatementColumn[] = []

  const aliases = (node.from ?? []) as TableAlias[]

  let schemaWithCTEs = schema
  const ctes = node.with as unknown as With[]
  for (const cte of ctes ?? []) {
    const statement = parseNode(cte.stmt as unknown as AST, schema)
    const name =
      typeof cte.name === 'string'
        ? cte.name
        : (cte.name as unknown as { value: string }).value
    schemaWithCTEs = withCTE(schemaWithCTEs, name, statement)
  }
  for (const column of safeArray(node.columns)) {
    if (isColumn(column)) {
      const expr = column.expr as Expression
      switch (expr.type) {
        case 'column_ref': {
          columns.push({
            name: column.as ?? expr.column,
            dataType: findColumnFromAliasesType(
              expr.table,
              expr.column,
              schemaWithCTEs,
              aliases,
            ) ?? {
              type: 'UNKNOWN',
            },
          })
          break
        }
        case 'window_func': {
          const dataType = getDataTypeOfWindowFunc(expr)
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
              schemaWithCTEs,
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
                schemaWithCTEs,
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
      }
    }
  }

  const variables: StatementVariable[] = []

  for (const column of safeArray(node.columns)) {
    if (isColumn(column)) {
      const expr = column.expr as Expression
      if (isBinaryExpression(expr)) {
        variables.push(
          ...extractVariables(expr, schema, aliases, '', variables.length),
        )
      }
    }
  }
  variables.push(
    ...parseWhere(node.where, schemaWithCTEs, aliases, variables.length),
  )

  return {
    columns,
    variables,
  }
}
