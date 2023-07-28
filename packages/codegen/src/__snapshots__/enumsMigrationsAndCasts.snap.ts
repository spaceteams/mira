import { ClientBase } from 'pg'
import { execute } from 'transactor'
export function enumsMigrationsAndCasts(
  salaryMul: number,
  whereDepartmentEq: string,
  client: ClientBase,
) {
  const sql = `
  SELECT gender FROM employees WHERE gender = $1
  `
  return execute(
    { sql, values: [salaryMul, whereDepartmentEq] as const },
    client,
  )
}
