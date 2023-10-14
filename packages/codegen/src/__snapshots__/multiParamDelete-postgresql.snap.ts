import { AsyncClient } from "mira-core";
export function multiParamDelete(client: AsyncClient, whereOrderDateLt: Date, whereStatusEq: string) {
    const sql = `DELETE FROM orders WHERE order_date < $1 AND status = $2;`;
    return client.executeVoid({ name: "multiParamDelete", sql, values: [whereOrderDateLt, whereStatusEq] as const });
}
