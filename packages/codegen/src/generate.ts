import { DataType, Statement, StatementVariable } from 'mira-core'
import {
  createPrinter,
  createSourceFile,
  factory,
  KeywordTypeSyntaxKind,
  NewLineKind,
  NodeFlags,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  TypeElement,
  TypeNode,
} from 'typescript'

function dataTypeToTsType(dataType: DataType): TypeNode {
  switch (dataType.type) {
    case 'INTEGER':
    case 'INT':
    case 'DECIMAL':
    case 'SERIAL':
    case 'NUMERIC':
      return factory.createKeywordTypeNode(SyntaxKind.NumberKeyword)
    case 'TEXT':
    case 'VARCHAR':
      return factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
    case 'DATE':
      return factory.createTypeReferenceNode('Date')
    case 'UNKNOWN':
      return factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword)
  }
}

function normalizeVariables(
  variables: StatementVariable[],
): StatementVariable[] {
  const result: StatementVariable[] = []

  const sortedVariables = [...variables].sort((a, b) => a.position - b.position)

  const byName: Record<string, StatementVariable[]> = {}
  for (const variable of sortedVariables) {
    if (byName[variable.name] === undefined) {
      byName[variable.name] = []
    }
    byName[variable.name].push(variable)
  }

  for (const v of Object.values(byName)) {
    if (v.length === 1) {
      result.push(v[0])
    } else {
      for (let i = 0; i < v.length; i++) {
        const variable = v[i]
        result.push({
          position: variable.position,
          name: `${variable.name}${i + 1}`,
          dataType: variable.dataType,
        })
      }
    }
  }

  result.sort((a, b) => a.position - b.position)
  return result
}

export function generate(
  name: string,
  sql: string,
  statement: Statement,
  dialect: string,
  useAsync?: boolean,
): string {
  const isAsync = useAsync ?? dialect === 'sqlite' ? false : true
  const variables = normalizeVariables(statement.variables)

  const sqlVariable = factory.createVariableStatement(
    undefined,
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          'sql',
          undefined,
          undefined,
          factory.createNoSubstitutionTemplateLiteral(sql, sql),
        ),
      ],
      NodeFlags.Const,
    ),
  )
  const executeVariant = statement.columns.length === 0
    ? 'executeVoid'
    : 'execute'

  const boundStatement = factory.createObjectLiteralExpression([
    factory.createPropertyAssignment('name', factory.createStringLiteral(name)),
    factory.createShorthandPropertyAssignment('sql'),
    factory.createPropertyAssignment(
      'values',
      factory.createAsExpression(
        factory.createArrayLiteralExpression(
          variables.map((v) => factory.createIdentifier(v.name)),
        ),
        factory.createKeywordTypeNode(
          SyntaxKind.ConstKeyword as KeywordTypeSyntaxKind,
        ),
      ),
    ),
  ])
  const objectLiteral = factory.createTypeLiteralNode(
    statement.columns.map(
      (v) =>
        factory.createPropertyDeclaration(
          undefined,
          v.name,
          undefined,
          dataTypeToTsType(v.dataType),
          undefined,
        ),
      // FIXME: get rid of this
    ) as unknown as TypeElement[],
  )

  const clientType = isAsync ? 'AsyncClient' : 'Client'

  const body = factory.createBlock(
    [
      sqlVariable,
      factory.createReturnStatement(
        factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier('client'),
            executeVariant,
          ),
          statement.columns.length > 0 ? [objectLiteral] : undefined,
          [boundStatement],
        ),
      ),
    ],
    true,
  )
  const mainFunc = factory.createFunctionDeclaration(
    [factory.createToken(SyntaxKind.ExportKeyword)],
    undefined,
    name.replace('-', '_'),
    [],
    [
      factory.createParameterDeclaration(
        undefined,
        undefined,
        'client',
        undefined,
        factory.createTypeReferenceNode(clientType),
      ),
      ...variables.map(({ name, dataType }) =>
        factory.createParameterDeclaration(
          undefined,
          undefined,
          name,
          undefined,
          dataTypeToTsType(dataType),
        )
      ),
    ],
    undefined,
    body,
  )

  const clientImport = factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(
          false,
          undefined,
          factory.createIdentifier(clientType),
        ),
      ]),
    ),
    factory.createStringLiteral('mira-core'),
  )

  const file = factory.updateSourceFile(
    createSourceFile(
      `${name}.ts`,
      '',
      ScriptTarget.ESNext,
      false,
      ScriptKind.TS,
    ),
    [clientImport, mainFunc],
  )

  const printer = createPrinter({ newLine: NewLineKind.LineFeed })
  return printer.printFile(file)
}
