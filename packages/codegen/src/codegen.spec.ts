import { allRegressionCases } from 'model/src/fixtures'
import { generate } from './codegen'

describe('generation', () => {
  test.each(allRegressionCases)('%s', (name, fixture) => {
    expect(generate(name, fixture.sql, fixture.statement)).toMatchFileSnapshot(
      `__snapshots__/${name}.snap.ts`,
    )
  })
})
