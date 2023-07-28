import { ClientBase } from "pg";
import { execute } from "transactor";
export function complexInsert(salaryMul: number, whereDepartmentEq: string, client?: ClientBase) {
    const sql = `
  INSERT INTO bonuses (employee_id, bonus)
  SELECT employee_id, salary * $1 AS bonus_amount
  FROM employees
  WHERE department = $2;
  `;
    return execute({ sql, values: [salaryMul, whereDepartmentEq] as const }, client);
}
