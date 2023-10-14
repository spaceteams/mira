import { AsyncClient } from "mira-core";
export function migrateAndCast(client: AsyncClient) {
    const sql = `
  select
    CAST(salary AS int) salary_int,
    rating::text rating_text
  from employees
  `;
    return client.execute<{
        salary_int: number;
        rating_text: string;
    }>({ name: "migrateAndCast", sql, values: [] as const });
}
