import { allRegressionCases } from 'model/src/fixtures'
import { parseSchema } from './schema'
import { parseStatement } from './statement'

describe('schema', () => {
  test.each(allRegressionCases)('%s', (_name, fixture) => {
    const schema = parseSchema(fixture.schemaSql)
    expect(schema).toEqual(fixture.schema)
  })
})

describe('statement', () => {
  test.each(allRegressionCases)('%s', (_name, fixture) => {
    const schema = parseSchema(fixture.schemaSql)
    expect(parseStatement(fixture.sql, schema)).toEqual(fixture.statement)
  })
})
