import { windowFunctions } from '../../codegen/src/__snapshots__/windowFunctions-sqlite.snap'
import * as fixtures from 'model/src/fixtures'
import { withTestClient } from './transactor'
import { db } from './db'

it('window functions', async () => {
  await withTestClient(async (client) => {
    db.exec(fixtures.windowFunctions.schemaSql)
    db.exec(`
    INSERT INTO sales (sale_id, product, sale_date, amount) VALUES
      (0, 'p', '2012-03-01', 3),
      (1, 'p', '2012-03-02', 3),
      (2, 'p', '2012-03-03', 3),
      (3, 'p', '2012-03-04', 3)
    `)
    expect(
      await windowFunctions(
        new Date('2012-03-02'),
        new Date('2012-03-03'),
        client,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "amount": 3,
          "cumulative_amount": 3,
          "prev_sale_amount": null,
          "product": "p",
          "sale_date": "2012-03-03",
        },
      ]
    `)
  })
})
