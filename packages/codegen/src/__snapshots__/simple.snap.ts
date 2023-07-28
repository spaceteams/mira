import { ClientBase } from "pg";
import { execute } from "transactor";
export function simple(where_age: number, client: ClientBase) {
    const sql = `SELECT name FROM employees WHERE age > $1;`;
    return execute<{
        name: string;
    }>({ sql, values: [where_age] as const }, client);
}
