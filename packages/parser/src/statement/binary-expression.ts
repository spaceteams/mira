import { AST, ColumnRef } from 'node-sql-parser'
import { Origin, Value, Variable } from './value'
import {
  DataType,
  findColumnFromAliasesType,
  Schema,
  StatementColumn,
  StatementVariable,
  TableAlias,
} from 'model'
import { parseNode } from './parse-node'
import { capitalize } from './capitalize'

function operatorStringify(operator: string): string {
  switch (operator) {
    case 'BETWEEN':
      return 'Between'
    case '+':
      return 'Plus'
    case '-':
      return 'Minus'
    case '*':
      return 'Mul'
    case '/':
      return 'Div'
    case '<=':
      return 'Lte'
    case '<':
      return 'Lt'
    case '=':
      return 'Eq'
    case '>':
      return 'Gt'
    case '>=':
      return 'Gte'
  }
  return ''
}
export type ValueList = [{ ast: AST }] | (Value | ColumnRef)[]
export type ExprList = { type: 'expr_list'; value: ValueList }
type BinaryExpressionBranch = ColumnRef | Value | BinaryExpression | ExprList
export type BinaryExpression = {
  type: 'binary_expr'
  operator: string
  left: BinaryExpressionBranch
  right: BinaryExpressionBranch
}
export const isBinaryExpression = (v: unknown): v is BinaryExpression =>
  typeof v === 'object' && v !== null && 'type' in v && v.type === 'binary_expr'

function buildVariable(
  operator: string,
  column: ColumnRef,
  variable: Variable | Origin,
  schema: Schema,
  aliases: TableAlias[],
  columns: StatementColumn[],
  prefix: string,
  offset: number,
): StatementVariable {
  let columnType: DataType | undefined
  if (column.table === null) {
    columnType = columns.find((c) => c.name === column.column)?.dataType
  }
  if (columnType === undefined) {
    columnType = findColumnFromAliasesType(
      column.table,
      column.column,
      schema,
      aliases,
    )
  }
  return {
    position: variable.type === 'origin' ? offset : variable.name - 1,
    name: capitalize(
      `${prefix}${prefix.length > 0 ? '_' : ''}${
        column.column
      }${operatorStringify(operator)}`,
    ),
    dataType: columnType ?? {
      type: 'UNKNOWN',
    },
  }
}
function getFirstColumnRef(
  expr: BinaryExpressionBranch,
): ColumnRef | undefined {
  switch (expr.type) {
    case 'column_ref':
      return expr
    case 'binary_expr':
      return getFirstColumnRef(expr.left) ?? getFirstColumnRef(expr.right)
    default:
      return undefined
  }
}
export function extractVariablesFromValueList(
  operator: string,
  values: ValueList,
  column: ColumnRef,
  schema: Schema,
  aliases: TableAlias[],
  columns: StatementColumn[],
  prefix: string,
  offset: number,
) {
  const variables: StatementVariable[] = []
  for (const v of values) {
    if ('ast' in v) {
      const statement = parseNode(v.ast, schema)
      variables.push(
        ...statement.variables.map((v) => ({
          ...v,
          position: v.position + offset,
        })),
      )
    } else if (v.type === 'var' || v.type === 'origin') {
      variables.push(
        buildVariable(
          operator,
          column,
          v,
          schema,
          aliases,
          columns,
          prefix,
          offset,
        ),
      )
    }
  }
  return variables
}
export function extractVariables(
  expr: BinaryExpression,
  schema: Schema,
  aliases: TableAlias[],
  columns: StatementColumn[],
  prefix: string,
  offset: number,
): StatementVariable[] {
  if (expr.left.type === 'binary_expr' && expr.right.type === 'binary_expr') {
    const l = extractVariables(
      expr.left,
      schema,
      aliases,
      columns,
      prefix,
      offset,
    )
    return [
      ...l,
      ...extractVariables(
        expr.right,
        schema,
        aliases,
        columns,
        prefix,
        offset + l.length,
      ),
    ]
  }
  if (
    expr.left.type === 'column_ref' &&
    (expr.right.type === 'var' || expr.right.type === 'origin')
  ) {
    return [
      buildVariable(
        expr.operator,
        expr.left,
        expr.right,
        schema,
        aliases,
        columns,
        prefix,
        offset,
      ),
    ]
  }

  if (
    expr.right.type === 'column_ref' &&
    (expr.left.type === 'var' || expr.left.type === 'origin')
  ) {
    return [
      buildVariable(
        expr.operator,
        expr.right,
        expr.left,
        schema,
        aliases,
        columns,
        prefix,
        offset,
      ),
    ]
  }

  if (expr.right.type === 'expr_list') {
    const column = getFirstColumnRef(expr.left)
    if (column) {
      return extractVariablesFromValueList(
        expr.operator,
        expr.right.value,
        column,
        schema,
        aliases,
        columns,
        prefix,
        offset,
      )
    }
  }
  if (expr.left.type === 'expr_list') {
    const column = getFirstColumnRef(expr.right)
    if (column) {
      return extractVariablesFromValueList(
        expr.operator,
        expr.left.value,
        column,
        schema,
        aliases,
        columns,
        prefix,
        offset,
      )
    }
  }
  return []
}
