import { BoundStatement } from 'model'
import { ClientBase, QueryResultRow } from 'pg'

export async function execute<T extends QueryResultRow>(
  statement: BoundStatement,
  client: ClientBase,
): Promise<T[]> {
  const response = await client.query<T>(
    statement.sql,
    statement.values as unknown[],
  )
  return response.rows
}
