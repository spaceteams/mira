import { Client } from "postgresql-client";
export function joinAndAggregate(whereQuantityGt: number, client?: Client) {
    const sql = `
    SELECT o.product, SUM(od.price) AS total_price
    FROM orders o
    JOIN order_details od ON o.order_id = od.order_id
    WHERE o.quantity > $1
    GROUP BY o.product;
`;
    return (client || Client).execute<{
        product: string;
        total_price: number;
    }>({ name: "joinAndAggregate", sql, values: [whereQuantityGt] as const });
}
