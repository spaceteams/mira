import { generateRaw } from './generateRaw'

describe('generateRaw', () => {
  test.each(['postgresql', 'sqlite'])('%s', (dialect) => {
    expect(
      generateRaw('failed-Sql', 'what a mess!', dialect),
    ).toMatchFileSnapshot(`__snapshots__/raw-${dialect}.snap.ts`)
  })
})
