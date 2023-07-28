import { ClientBase } from "pg";
import { execute } from "transactor";
export function star(client?: ClientBase) {
    const sql = `SELECT * FROM orders`;
    return execute<{
        order_id: number;
        product: string;
        quantity: number;
    }>({ sql, values: [] as const }, client);
}
