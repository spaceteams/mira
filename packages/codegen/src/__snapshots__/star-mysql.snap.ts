import { AsyncClient } from "model";
export function star(client: AsyncClient) {
    const sql = `SELECT * FROM orders`;
    return client.execute<{
        order_id: number;
        product: string;
        quantity: number;
    }>({ name: "star", sql, values: [] as const });
}
