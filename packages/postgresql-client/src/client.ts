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
    await this.client.query({
      name: statement.name,
      text: statement.sql,
      values: statement.values as unknown[],
    })
  }
  async execute<T extends QueryResultRow>(
    statement: BoundStatement,
  ): Promise<T[]> {
    const response = await this.client.query<T>({
      name: statement.name,
      text: statement.sql,
      values: statement.values as unknown[],
    })
    return response.rows
  }

  runSql<T extends QueryResultRow>(
    sql: string,
    ...values: readonly unknown[]
  ): Promise<T[]> {
    return this.execute({ values, sql })
  }
}
