import { Client } from "mira-core";
export function simple(client: Client, whereAgeGt: number) {
    const sql = `SELECT name FROM employees WHERE age > $1;`;
    return client.execute<{
        name: string;
    }>({ name: "simple", sql, values: [whereAgeGt] as const });
}
