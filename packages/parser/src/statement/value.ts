export type Variable = {
  type: 'var'
  name: number
}
export type Origin = {
  type: 'origin'
}
export type SingleQuoteString = {
  type: 'single_quote_string'
  value: string
}
export type Value = Variable | Origin | SingleQuoteString
