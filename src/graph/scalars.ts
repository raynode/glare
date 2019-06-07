import { SchemaBuilder } from 'gram'
import * as GraphQLJSONObject from 'graphql-type-json'

export default <Context, QueryContext>(builder: SchemaBuilder<Context, QueryContext>) =>
  builder.setScalar('JSON', GraphQLJSONObject as any)
