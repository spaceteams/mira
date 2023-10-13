import {
  createPrinter,
  createSourceFile,
  factory,
  NewLineKind,
  NodeFlags,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
} from 'typescript'

export function generateRaw(
  name: string,
  sql: string,
  dialect: string,
  useAsync?: boolean,
): string {
  const isAsync = useAsync ?? dialect === 'sqlite' ? false : true
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
    factory.createPropertyAssignment('name', factory.createStringLiteral(name)),
    factory.createShorthandPropertyAssignment('sql'),
    factory.createShorthandPropertyAssignment('values'),
  ])

  const body = factory.createBlock(
    [
      sqlVariable,
      factory.createReturnStatement(
        factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier('client'),
            'execute',
          ),
          undefined,
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
        factory.createTypeReferenceNode(isAsync ? 'AsyncClient' : 'Client'),
      ),
      factory.createParameterDeclaration(
        undefined,
        factory.createToken(SyntaxKind.DotDotDotToken),
        'values',
        undefined,
        factory.createArrayTypeNode(
          factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
        ),
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
          factory.createIdentifier(isAsync ? 'AsyncClient' : 'Client'),
        ),
      ]),
    ),
    factory.createStringLiteral('model'),
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
