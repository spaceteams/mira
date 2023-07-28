import z from 'zod'

export const DataTypeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('INTEGER') }),
  z.object({ type: z.literal('INT') }),
  z.object({ type: z.literal('DECIMAL') }),
  z.object({ type: z.literal('DATE') }),
  z.object({ type: z.literal('SERIAL') }),
  z.object({ type: z.literal('TEXT') }),
  z.object({ type: z.literal('VARCHAR'), length: z.number() }),
  z.object({ type: z.literal('UNKNOWN') }),
])

export type DataType = z.infer<typeof DataTypeSchema>
