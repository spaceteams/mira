import { ClientBase } from "pg";
import { execute } from "transactor";
export function migrateAndCast(client?: ClientBase) {
    const sql = `
  select CAST(salary AS int) salary_int from employees
  `;
    return execute<{
        salary_int: number;
    }>({ sql, values: [] as const }, client);
}
