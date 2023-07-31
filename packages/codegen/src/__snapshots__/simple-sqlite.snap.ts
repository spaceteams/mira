import { Client } from "sqlite-client";
export function simple(whereAgeGt: number, client?: Client) {
    const sql = `SELECT name FROM employees WHERE age > $1;`;
    return (client || Client).execute<{
        name: string;
    }>({ sql, values: [whereAgeGt] as const });
}
