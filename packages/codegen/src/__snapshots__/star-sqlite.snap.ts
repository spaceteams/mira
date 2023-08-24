import { Client } from "model";
export function star(client: Client) {
    const sql = `SELECT * FROM orders`;
    return client.execute<{
        order_id: number;
        product: string;
        quantity: number;
    }>({ name: "star", sql, values: [] as const });
}
