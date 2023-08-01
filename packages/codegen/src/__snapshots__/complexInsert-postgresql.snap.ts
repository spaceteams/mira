import { Client } from "postgresql-client";
export function complexInsert(salaryMul: number, whereDepartmentEq: string, client?: Client) {
    const sql = `
  INSERT INTO bonuses (employee_id, bonus)
  SELECT employee_id, salary * $1 AS bonus_amount
  FROM employees
  WHERE department = $2;
  `;
    return (client || Client).executeVoid({ name: "complexInsert", sql, values: [salaryMul, whereDepartmentEq] as const });
}
