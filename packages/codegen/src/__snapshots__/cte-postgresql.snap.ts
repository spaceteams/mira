import { Client } from "postgresql-client";
export function cte(whereRankNumLte: number, client?: Client) {
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
    return (client || Client).execute<{
        product: string;
        order_date: Date;
        quantity: number;
    }>({ name: "cte", sql, values: [whereRankNumLte] as const });
}
