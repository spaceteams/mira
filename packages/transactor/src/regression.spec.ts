import { windowFunctions as callWindow } from '../../codegen/src/__snapshots__/windowFunctions.snap'
import { windowFunctions } from 'model/src/fixtures'
import { withTestClient } from './transactor'

it('window functions', async () => {
  await withTestClient(async (client) => {
    await client.query(windowFunctions.schemaSql)
    await client.query(`
    INSERT INTO sales (sale_id, product, sale_date, amount) VALUES
      (0, 'p', '2012-03-01', 3),
      (1, 'p', '2012-03-02', 3),
      (2, 'p', '2012-03-03', 3),
      (3, 'p', '2012-03-04', 3)
    `)
    expect(
      await callWindow(new Date('2012-03-02'), new Date('2012-03-03'), client),
    ).toMatchInlineSnapshot(`
      [
        {
          "amount": "3",
          "cumulative_amount": "3",
          "prev_sale_amount": null,
          "product": "p",
          "sale_date": 2012-03-01T23:00:00.000Z,
        },
        {
          "amount": "3",
          "cumulative_amount": "6",
          "prev_sale_amount": "3",
          "product": "p",
          "sale_date": 2012-03-02T23:00:00.000Z,
        },
      ]
    `)
  })
})
