import { AsyncClient, BoundStatement, ResultRow } from 'model'
import { Connection } from 'mariadb'
import { pool } from './pool'

export class LyraMariadbClient implements AsyncClient {
  public constructor(private client: Pick<Connection, 'query'>) {}

  static executeVoid(statement: BoundStatement): Promise<void> {
    return new LyraMariadbClient(pool).executeVoid(statement)
  }
  static execute<T extends ResultRow>(statement: BoundStatement): Promise<T[]> {
    return new LyraMariadbClient(pool).execute(statement)
  }

  async executeVoid(statement: BoundStatement): Promise<void> {
    await this.client.query(statement.sql, statement.values)
  }
  async execute<T extends ResultRow>(statement: BoundStatement): Promise<T[]> {
    return await this.client.query<T[]>(statement.sql, statement.values)
  }

  runSql<T extends ResultRow>(
    sql: string,
    ...values: readonly unknown[]
  ): Promise<T[]> {
    return this.execute({ values, sql })
  }
}
