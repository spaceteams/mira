import { ClientBase } from 'pg'
import { execute } from 'transactor'
export function cte(whereRankNumLte: number, client: ClientBase) {
  const sql = `
    WITH ranked_orders AS (
        SELECT product, order_date, quantity,
            RANK() OVER (PARTITION BY product ORDER BY order_date) AS rank_num
        FROM orders
    )
    SELECT product, order_date, quantity
    FROM ranked_orders
    WHERE rank_num <= $1;
    `
  return execute<{
    product: string
    order_date: Date
    quantity: number
  }>({ sql, values: [whereRankNumLte] as const }, client)
}
