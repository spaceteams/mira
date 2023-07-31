import { allRegressionCases } from 'model/src/fixtures'
import { generate } from './generateStatement'

describe('generate', () => {
  test.each(allRegressionCases)('%s', (name, fixture) => {
    for (const dialect of fixture.dialects) {
      expect(
        generate(name, fixture.sql, fixture.statement, dialect),
      ).toMatchFileSnapshot(`__snapshots__/${name}-${dialect}.snap.ts`)
    }
  })
})
