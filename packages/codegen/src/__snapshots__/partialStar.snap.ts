import { ClientBase } from "pg";
import { execute } from "transactor";
export function partialStar(client?: ClientBase) {
    const sql = `SELECT o.* FROM orders o JOIN order_details od ON o.order_id = od.order_id`;
    return execute<{
        order_id: number;
        product: string;
        quantity: number;
    }>({ sql, values: [] as const }, client);
}
