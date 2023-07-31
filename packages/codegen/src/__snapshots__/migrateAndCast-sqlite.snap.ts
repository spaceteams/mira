import { Client } from 'sqlite-client'
export function migrateAndCast(client?: Client) {
  const sql = `
  select
  salary salary_int,
    rating rating_text
  from employees
  `
  return (client || Client).execute<{
    salary_int: number
    rating_text: string
  }>({ sql, values: [] as const })
}
