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
    factory.createShorthandPropertyAssignment('values'),
  ])

  const body = factory.createBlock(
    [
      sqlVariable,
      factory.createReturnStatement(
        factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createParenthesizedExpression(
              factory.createLogicalOr(
                factory.createIdentifier('client'),
                factory.createIdentifier('Client'),
              ),
            ),
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
        'values',
        undefined,
        factory.createArrayTypeNode(
          factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
        ),
      ),
      factory.createParameterDeclaration(
        undefined,
        undefined,
        'client',
        factory.createToken(SyntaxKind.QuestionToken),
        factory.createTypeReferenceNode('Client'),
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
          factory.createIdentifier('Client'),
        ),
      ]),
    ),
    factory.createStringLiteral(`${dialect}-client`),
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
