import { makeExecutableSchema } from 'graphql-tools'

import { eventFieldDefinition } from 'graph/event'
import { scalarTypes } from 'graph/scalars'

import { builder } from 'graph/builder'
export { builder }

import initializeGame from './types/game'
import initializeLink from './types/link'
import initializeUser from './types/user'

import initializeFindPuzzle from './types/games/find-puzzle'

export const getSchema = () => {
  initializeUser(builder)
  initializeLink(builder)

  const build = builder.createBuild()

  eventFieldDefinition(build)
  scalarTypes(build)
  initializeGame(build)
  initializeFindPuzzle(build)

  const { resolvers, typeDefs } = build.toTypeDefs()

  console.log(typeDefs)

  return makeExecutableSchema({
    resolvers,
    typeDefs,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
  })
}
