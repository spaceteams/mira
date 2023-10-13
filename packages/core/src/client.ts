import { BoundStatement } from './bound-statement'
import { ResultRow } from './result-row'

export interface Client {
  executeVoid(statement: BoundStatement): void
  execute<T extends ResultRow>(statement: BoundStatement): T[]
}
