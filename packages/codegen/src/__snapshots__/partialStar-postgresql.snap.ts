import { Client } from "postgresql-client";
export function partialStar(client?: Client) {
    const sql = `SELECT o.* FROM orders o JOIN order_details od ON o.order_id = od.order_id`;
    return (client || Client).execute<{
        order_id: number;
        product: string;
        quantity: number;
    }>({ sql, values: [] as const });
}