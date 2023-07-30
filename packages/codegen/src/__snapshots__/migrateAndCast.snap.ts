import { ClientBase } from "pg";
import { execute } from "transactor";
export function migrateAndCast(client?: ClientBase) {
    const sql = `
  select
    CAST(salary AS int) salary_int,
    rating::text rating_text
  from employees
  `;
    return execute<{
        salary_int: number;
        rating_text: string;
    }>({ sql, values: [] as const }, client);
}
