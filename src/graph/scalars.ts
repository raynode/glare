import { Build } from 'gram'
import * as GraphQLJSON from 'graphql-type-json'

export const scalarTypes = <BuildMode, Context>(build: Build<BuildMode, Context>) => {
  build.addType('JSON', {
    parseLiteral: GraphQLJSON.GraphQLJSONObject.parseLiteral as any,
    parseValue: GraphQLJSON.GraphQLJSONObject.parseValue as any,
    serialize: GraphQLJSON.GraphQLJSONObject.serialize as any,
  })
}
