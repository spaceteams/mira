import { ClientBase } from "pg";
import { execute } from "transactor";
export function joinAndAggregate(where_quantity: number, client: ClientBase) {
    const sql = `
    SELECT o.product, SUM(od.price) AS total_price
    FROM orders o
    JOIN order_details od ON o.order_id = od.order_id
    WHERE o.quantity > $1
    GROUP BY o.product;
`;
    return execute<{
        product: string;
        total_price: number;
    }>({ sql, values: [where_quantity] as const }, client);
}
