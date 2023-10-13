import { Client } from "@lyra/core";
export function subquery(client: Client, whereGradeGt: number) {
    const sql = `
    SELECT name, major FROM students
    WHERE student_id IN (
        SELECT student_id FROM grades WHERE grade > $1
    );
  `;
    return client.execute<{
        name: string;
        major: string;
    }>({ name: "subquery", sql, values: [whereGradeGt] as const });
}
