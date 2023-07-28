import { DataType, Statement } from 'model'
import {
  KeywordTypeSyntaxKind,
  PropertySignature,
  TypeElement,
  TypeNode,
} from 'typescript'
import {
  factory,
  createSourceFile,
  ScriptTarget,
  ScriptKind,
  createPrinter,
  NewLineKind,
  SyntaxKind,
  NodeFlags,
} from 'typescript'

function dataTypeToTsType(dataType: DataType): TypeNode {
  switch (dataType.type) {
    case 'SERIAL':
    case 'INTEGER':
    case 'DECIMAL':
    case 'INT':
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

export function generate(
  name: string,
  sql: string,
  statement: Statement,
): string {
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

  const boundStatement = factory.createObjectLiteralExpression([
    factory.createShorthandPropertyAssignment('sql'),
    factory.createPropertyAssignment(
      'values',
      factory.createAsExpression(
        factory.createArrayLiteralExpression(
          statement.variables.map((v) => factory.createIdentifier(v.name)),
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

  const body = factory.createBlock(
    [
      sqlVariable,
      factory.createReturnStatement(
        factory.createCallExpression(
          factory.createIdentifier('execute'),
          [objectLiteral],
          [boundStatement, factory.createIdentifier('client')],
        ),
      ),
    ],
    true,
  )
  const variables = [...statement.variables].sort(
    (a, b) => a.position - b.position,
  )
  const mainFunc = factory.createFunctionDeclaration(
    [factory.createToken(SyntaxKind.ExportKeyword)],
    undefined,
    name.replace('-', '_'),
    [],
    [
      ...variables.map(({ name, dataType }) =>
        factory.createParameterDeclaration(
          undefined,
          undefined,
          name,
          undefined,
          dataTypeToTsType(dataType),
        ),
      ),
      factory.createParameterDeclaration(
        undefined,
        undefined,
        'client',
        undefined,
        factory.createTypeReferenceNode('ClientBase'),
      ),
    ],
    undefined,
    body,
  )

  const pgImport = factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(
          false,
          undefined,
          factory.createIdentifier('ClientBase'),
        ),
      ]),
    ),
    factory.createStringLiteral('pg'),
  )
  const transactorImport = factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(
          false,
          undefined,
          factory.createIdentifier('execute'),
        ),
      ]),
    ),
    factory.createStringLiteral('transactor'),
  )

  const file = factory.updateSourceFile(
    createSourceFile(
      `${name}.ts`,
      '',
      ScriptTarget.ESNext,
      false,
      ScriptKind.TS,
    ),
    [pgImport, transactorImport, mainFunc],
  )

  const printer = createPrinter({ newLine: NewLineKind.LineFeed })
  return printer.printFile(file)
}
