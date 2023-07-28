import { ClientBase } from "pg";
import { execute } from "transactor";
export function conditionalStatement(whereSalaryGt: number, client?: ClientBase) {
    const sql = `
        SELECT name,
        CASE
            WHEN department = 'HR' THEN salary * 1.1
            WHEN department = 'Engineering' THEN salary * 1.2
            ELSE salary
        END AS adjusted_salary
        FROM employees WHERE salary > $1;
    `;
    return execute<{
        name: string;
        adjusted_salary: number;
    }>({ sql, values: [whereSalaryGt] as const }, client);
}
