import { Client } from "postgresql-client";
export function migrateAndCast(client?: Client) {
    const sql = `
  select
    CAST(salary AS int) salary_int,
    rating::text rating_text
  from employees
  `;
    return (client || Client).execute<{
        salary_int: number;
        rating_text: string;
    }>({ name: "migrateAndCast", sql, values: [] as const });
}
