import {
  simple,
  joinAndAggregate,
  subquery,
  conditionalStatement,
  cte,
  Fixture,
} from 'model/src/fixtures'
import { generate } from './codegen'

const cases: [string, Fixture][] = [
  ['simple', simple],
  ['joinAndAggregate', joinAndAggregate],
  ['subquery', subquery],
  ['conditionalStatement', conditionalStatement],
  ['cte', cte],
]

describe('generation', () => {
  test.each(cases)('%s', (name, fixture) => {
    expect(generate(name, fixture.sql, fixture.statement)).toMatchFileSnapshot(
      `__snapshots__/${name}.snap.ts`,
    )
  })
})
