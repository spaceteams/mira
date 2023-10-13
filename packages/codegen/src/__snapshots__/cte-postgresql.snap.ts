import { AsyncClient } from "@lyra/core";
export function cte(client: AsyncClient, whereRankNumLte: number) {
    const sql = `
    WITH ranked_orders AS (
        SELECT product, order_date, quantity,
            RANK() OVER (PARTITION BY product ORDER BY order_date) AS rank_num
        FROM orders
    )
    SELECT product, order_date, quantity
    FROM ranked_orders
    WHERE rank_num <= $1;
    `;
    return client.execute<{
        product: string;
        order_date: Date;
        quantity: number;
    }>({ name: "cte", sql, values: [whereRankNumLte] as const });
}
