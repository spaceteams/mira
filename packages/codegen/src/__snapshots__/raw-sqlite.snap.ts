import { Client } from "sqlite-client";
export function failed_Sql(values: unknown[], client?: Client) {
    const sql = `what a mess!`;
    return (client || Client).execute({ name: "failed-Sql", sql, values });
}
