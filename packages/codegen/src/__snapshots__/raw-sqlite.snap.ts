import { Client } from "@lyra/core";
export function failed_Sql(client: Client, ...values: unknown[]) {
    const sql = `what a mess!`;
    return client.execute({ name: "failed-Sql", sql, values });
}
