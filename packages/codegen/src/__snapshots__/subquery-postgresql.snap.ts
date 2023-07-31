import { Client } from "postgresql-client";
export function subquery(whereGradeGt: number, client?: Client) {
    const sql = `
    SELECT name, major FROM students
    WHERE student_id IN (
        SELECT student_id FROM grades WHERE grade > $1
    );
  `;
    return (client || Client).execute<{
        name: string;
        major: string;
    }>({ sql, values: [whereGradeGt] as const });
}
