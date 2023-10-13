import { AsyncClient } from "@lyra/core";
export function conditionalStatement(client: AsyncClient, whereSalaryGt: number) {
    const sql = `
        SELECT name,
        CASE
            WHEN department = 'HR' THEN salary * 1.1
            WHEN department = 'Engineering' THEN salary * 1.2
            ELSE salary
        END AS adjusted_salary
        FROM employees WHERE salary > $1;
    `;
    return client.execute<{
        name: string;
        adjusted_salary: number;
    }>({ name: "conditionalStatement", sql, values: [whereSalaryGt] as const });
}
