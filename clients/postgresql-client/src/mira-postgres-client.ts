import { AsyncClient, BoundStatement, ResultRow } from 'mira-core'
import { ClientBase } from 'pg'
import { pool } from './pool'

export class MiraPostgresClient implements AsyncClient {
  public constructor(private client: Pick<ClientBase, 'query'>) {}
  static executeVoid(statement: BoundStatement): Promise<void> {
    return new MiraPostgresClient(pool).executeVoid(statement)
  }
  static execute<T extends ResultRow>(statement: BoundStatement): Promise<T[]> {
    return new MiraPostgresClient(pool).execute(statement)
  }

  async executeVoid(statement: BoundStatement): Promise<void> {
    await this.client.query({
      name: statement.name,
      text: statement.sql,
      values: statement.values as unknown[],
    })
  }
  async execute<T extends ResultRow>(statement: BoundStatement): Promise<T[]> {
    const response = await this.client.query<T>({
      name: statement.name,
      text: statement.sql,
      values: statement.values as unknown[],
    })
    return response.rows
  }

  runSql<T extends ResultRow>(
    sql: string,
    ...values: readonly unknown[]
  ): Promise<T[]> {
    return this.execute({ values, sql })
  }
}
