import { GQLBuild, GQLSchemaBuilder } from 'graph/builder'

import { Links } from 'db/models'
import { createService } from 'graph/base-service'

export const linkBuilder = (builder: GQLSchemaBuilder) => {
  const link = builder.model('Link', createService(Links))
  link.attr('datetime', 'DateTime')
  link.attr('title', 'String')
  link.attr('url', 'String!')
  link.attr('content', 'String')
  link.attr('tags', '[String!]!')
}

export default linkBuilder
