import { BoundStatement } from './bound-statement'
import { ResultRow } from './result-row'

export interface AsyncClient {
  executeVoid(statement: BoundStatement): Promise<void>
  execute<T extends ResultRow>(statement: BoundStatement): Promise<T[]>
}
