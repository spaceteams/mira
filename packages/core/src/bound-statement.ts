export type BoundStatement = {
  name?: string
  sql: string
  values: readonly unknown[]
}
