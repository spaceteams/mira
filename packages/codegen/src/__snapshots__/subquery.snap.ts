import { ClientBase } from 'pg'
import { execute } from 'transactor'
export function subquery(whereGradeGt: number, client: ClientBase) {
  const sql = `
    SELECT name, major FROM students
    WHERE student_id IN (
        SELECT student_id FROM grades WHERE grade > $1
    );
  `
  return execute<{
    name: string
    major: string
  }>({ sql, values: [whereGradeGt] as const }, client)
}
