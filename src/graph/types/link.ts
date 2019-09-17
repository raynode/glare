import { GQLBuild, GQLSchemaBuilder } from 'graph/builder'
import { GraphQLBoolean, GraphQLEnumType, GraphQLList, GraphQLString } from 'graphql'

import { Links } from 'db/models'
import { createService } from 'graph/base-service'

export const linkBuilder = (builder: GQLSchemaBuilder) => {
  const link = builder.model('Link', createService(Links))
  link.attr('datetime', builder.getScalar('DateTime'))
  link.attr('title', GraphQLString)
  link.attr('url', GraphQLString)
  link.attr('content', GraphQLString)
  link.attr('tags', GraphQLList(GraphQLString))
}

export default linkBuilder
