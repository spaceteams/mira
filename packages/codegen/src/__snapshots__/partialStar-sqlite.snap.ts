import { Client } from "mira-core";
export function partialStar(client: Client) {
    const sql = `SELECT o.* FROM orders o JOIN order_details od ON o.order_id = od.order_id`;
    return client.execute<{
        order_id: number;
        product: string;
        quantity: number;
    }>({ name: "partialStar", sql, values: [] as const });
}
