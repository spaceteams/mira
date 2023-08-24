import { Client } from "model";
export function joinAndAggregate(client: Client, whereQuantityGt: number) {
    const sql = `
    SELECT o.product, SUM(od.price) AS total_price
    FROM orders o
    JOIN order_details od ON o.order_id = od.order_id
    WHERE o.quantity > $1
    GROUP BY o.product;
`;
    return client.execute<{
        product: string;
        total_price: number;
    }>({ name: "joinAndAggregate", sql, values: [whereQuantityGt] as const });
}
