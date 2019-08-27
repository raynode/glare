import { Build, createSchemaBuilder, SchemaBuilder } from 'gram'
import { GraphQLContext } from 'services/graphql-context'
import { pubsub } from 'services/pubsub'
export type SchemaContext = 'admin' | 'user'

export type GQLBuild = Build<SchemaContext, GraphQLContext>
export type GQLSchemaBuilder = SchemaBuilder<SchemaContext, GraphQLContext>
export const builder = createSchemaBuilder<SchemaContext, GraphQLContext>()
builder.setPubSub(pubsub)
