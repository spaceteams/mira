import { BoundStatement, Client, ResultRow } from '@lyra/core'
import { all, run } from './db'

export class LyraSqliteClient implements Client {
  public constructor() {}

  static executeVoid(statement: BoundStatement): void {
    return new LyraSqliteClient().executeVoid(statement)
  }
  static execute<T extends ResultRow>(statement: BoundStatement): T[] {
    return new LyraSqliteClient().execute(statement)
  }

  executeVoid(statement: BoundStatement): void {
    run(statement, this.buildParams(statement))
  }
  execute<T extends ResultRow>(statement: BoundStatement): T[] {
    return all(statement, this.buildParams(statement)) as T[]
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
