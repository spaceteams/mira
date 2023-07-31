import { BoundStatement } from 'model'
import { ClientBase, QueryResultRow } from 'pg'
import { pool } from './pool'

export class Client {
  public constructor(private client: Pick<ClientBase, 'query'>) {}
  static executeVoid(statement: BoundStatement): Promise<void> {
    return new Client(pool).executeVoid(statement)
  }
  static execute<T extends QueryResultRow>(
    statement: BoundStatement,
  ): Promise<T[]> {
    return new Client(pool).execute(statement)
  }

  async executeVoid(statement: BoundStatement): Promise<void> {
    await this.runSql(statement.sql, ...statement.values)
  }
  execute<T extends QueryResultRow>(statement: BoundStatement): Promise<T[]> {
    return this.runSql(statement.sql, ...statement.values)
  }

  async runSql<T extends QueryResultRow>(
    sql: string,
    ...params: readonly unknown[]
  ): Promise<T[]> {
    const response = await this.client.query<T>(sql, params as unknown[])
    return response.rows
  }
}
