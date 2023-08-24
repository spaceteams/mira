import { AsyncClient } from "model";
export function simple(client: AsyncClient, whereAgeGt: number) {
    const sql = `SELECT name FROM employees WHERE age > $1;`;
    return client.execute<{
        name: string;
    }>({ name: "simple", sql, values: [whereAgeGt] as const });
}
