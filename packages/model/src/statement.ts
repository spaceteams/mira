import { DataType } from './data-type'

export type StatementColumn = {
  name: string
  dataType: DataType
}
export type StatementVariable = {
  position: number
  name: string
  dataType: DataType
}
export type Statement = {
  columns: StatementColumn[]
  variables: StatementVariable[]
}
