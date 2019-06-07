import { createSchemaBuilder } from 'gram'

export type SchemaContext = 'admin' | 'user'

export const builder = createSchemaBuilder<SchemaContext>()
