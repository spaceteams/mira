import { Fixture, allRegressionCases } from 'model/src/fixtures'
import { parseSchema } from './schema'
import { parseStatement } from './statement'
import { Dialect } from 'model'

const allTestsWithDialect = allRegressionCases.flatMap(
  ([name, fixture]) =>
    fixture.dialects.map((dialect) => [name, dialect, fixture]) as [
      string,
      Dialect,
      Fixture,
    ][],
)

describe('schema', () => {
  test.each(allTestsWithDialect)('%s %s', (_name, dialect, fixture) => {
    const schema = parseSchema(fixture.schemaSql, dialect)
    expect(schema).toEqual(fixture.schema)
  })
})

describe('statement', () => {
  test.each(allTestsWithDialect)('%s %s', (_name, dialect, fixture) => {
    const schema = parseSchema(fixture.schemaSql, dialect)
    expect(parseStatement(fixture.sql, dialect, schema)).toEqual(
      fixture.statement,
    )
  })
})
