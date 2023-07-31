import { BoundStatement } from 'model'
import { db } from './db'

export class Client {
  public constructor() {}

  static executeVoid<T>(statement: BoundStatement): Promise<void> {
    return new Client().executeVoid(statement)
  }
  static execute<T>(statement: BoundStatement): Promise<T[]> {
    return new Client().execute(statement)
  }

  executeVoid(statement: BoundStatement): Promise<void> {
    const prepared = db.prepare(statement.sql)
    prepared.run(this.buildParams(statement))
    return Promise.resolve()
  }
  execute<T>(statement: BoundStatement): Promise<T[]> {
    const prepared = db.prepare(statement.sql)
    return Promise.resolve(prepared.all(this.buildParams(statement)) as T[])
  }

  private buildParams(statement: BoundStatement) {
    const params: Record<string, unknown> = {}
    for (let i = 0; i < statement.values.length; i++) {
      const value = statement.values[i]
      if (value instanceof Date) {
        params[i + 1] = value.toISOString()
      } else {
        params[i + 1] = value
      }
    }
    return params
  }
}
