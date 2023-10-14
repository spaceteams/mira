import { AsyncClient } from "mira-core";
export function failed_Sql(client: AsyncClient, ...values: unknown[]) {
    const sql = `what a mess!`;
    return client.execute({ name: "failed-Sql", sql, values });
}
