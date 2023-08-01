import { Client } from "sqlite-client";
export function star(client?: Client) {
    const sql = `SELECT * FROM orders`;
    return (client || Client).execute<{
        order_id: number;
        product: string;
        quantity: number;
    }>({ name: "star", sql, values: [] as const });
}
