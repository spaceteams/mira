import {
  complexInsert,
  conditionalStatement,
  cte,
  Fixture,
  joinAndAggregate,
  multiParamDelete,
  multiParamInsert,
  multiParamUpdate,
  nestedSubqueryWithWindow,
  simple,
  subquery,
  windowFunctions,
} from 'model/src/fixtures'
import { parseSchema } from './schema'
import { parseStatement } from './statement'

const cases: [string, Fixture][] = [
  ['simple', simple],
  ['joinAndAggregate', joinAndAggregate],
  ['subquery', subquery],
  ['conditionalStatement', conditionalStatement],
  ['cte', cte],
  ['windowFunctions', windowFunctions],
  ['multiParamInsert', multiParamInsert],
  ['multiParamUpdate', multiParamUpdate],
  ['multiParamDelete', multiParamDelete],
  ['nestedSubqueryWithWindow', nestedSubqueryWithWindow],
  ['complexInsert', complexInsert],
]

describe('schema', () => {
  test.each(cases)('%s', (_name, fixture) => {
    const schema = parseSchema(fixture.schemaSql)
    expect(schema).toEqual(fixture.schema)
  })
})

describe('statement', () => {
  test.each(cases)('%s', (_name, fixture) => {
    const schema = parseSchema(fixture.schemaSql)
    expect(parseStatement(fixture.sql, schema)).toEqual(fixture.statement)
  })
})
