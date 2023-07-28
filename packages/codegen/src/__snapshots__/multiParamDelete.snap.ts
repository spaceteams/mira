import { ClientBase } from "pg";
import { execute } from "transactor";
export function multiParamDelete(whereOrderDateLt: Date, whereStatusEq: string, client: ClientBase) {
    const sql = `DELETE FROM orders WHERE order_date < $1 AND status = $2;`;
    return execute<{}>({ sql, values: [whereOrderDateLt, whereStatusEq] as const }, client);
}
