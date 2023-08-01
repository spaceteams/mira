import { Client } from "postgresql-client";
export function multiParamDelete(whereOrderDateLt: Date, whereStatusEq: string, client?: Client) {
    const sql = `DELETE FROM orders WHERE order_date < $1 AND status = $2;`;
    return (client || Client).executeVoid({ name: "multiParamDelete", sql, values: [whereOrderDateLt, whereStatusEq] as const });
}
