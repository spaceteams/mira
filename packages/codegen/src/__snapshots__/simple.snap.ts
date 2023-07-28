import { ClientBase } from "pg";
import { execute } from "transactor";
export function simple(whereAgeGt: number, client?: ClientBase) {
    const sql = `SELECT name FROM employees WHERE age > $1;`;
    return execute<{
        name: string;
    }>({ sql, values: [whereAgeGt] as const }, client);
}
