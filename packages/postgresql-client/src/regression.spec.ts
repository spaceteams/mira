import { windowFunctions } from '../../codegen/src/__snapshots__/windowFunctions-postgresql.snap'
import { migrateAndCast } from '../../codegen/src/__snapshots__/migrateAndCast-postgresql.snap'
import * as fixtures from 'model/src/fixtures'
import { withTestClient } from './transactor'

it('window functions', async () => {
  await withTestClient(async (client) => {
    await client.runSql(fixtures.windowFunctions.schemaSql)
    await client.runSql(`
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

it('migrateAndCast', async () => {
  await withTestClient(async (client) => {
    await client.runSql(fixtures.migrateAndCast.schemaSql)
    await client.runSql(`
    INSERT INTO employees (employee_id, name, salary, rating) VALUES
      (0, 'name', 300, 1),
      (1, 'name', 400.1, 2),
      (2, 'name', 500.9, 3),
      (3, 'name', 800, 4)
    `)
    expect(await migrateAndCast(client)).toMatchInlineSnapshot(`
      [
        {
          "rating_text": "1.00",
          "salary_int": 300,
        },
        {
          "rating_text": "2.00",
          "salary_int": 400,
        },
        {
          "rating_text": "3.00",
          "salary_int": 501,
        },
        {
          "rating_text": "4.00",
          "salary_int": 800,
        },
      ]
    `)
  })
})
