import { allRegressionCases } from '@lyra/core/src/fixtures'
import { generate } from './generate'

test.each(allRegressionCases)('%s', (name, fixture) => {
  for (const dialect of fixture.dialects) {
    expect(
      generate(name, fixture.sql, fixture.statement, dialect),
    ).toMatchFileSnapshot(`__snapshots__/${name}-${dialect}.snap.ts`)
  }
})
