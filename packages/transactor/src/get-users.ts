import { ClientBase } from 'pg'
import { execute } from './execute'

export function get_users(id: number, email: string, client: ClientBase) {
  const sql = `select id, '2', name from "users"`
  return execute<{ id: number }>({ sql, values: [email, id] }, client)
}
