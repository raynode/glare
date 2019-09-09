import { makeExecutableSchema } from 'graphql-tools'

import { eventFieldDefinition } from 'graph/event'
import { scalarTypes } from 'graph/scalars'

import { builder } from 'graph/builder'
export { builder }

import { gameBuild, gameBuilder } from './types/game'
import linkBuilder from './types/link'
import { memoryBuild } from './types/memory'
import userBuilder, { userBuild } from './types/user'

import initializeFindPuzzle from './types/games/find-puzzle'

const builders = [userBuilder, linkBuilder, gameBuilder]
const buildInitializers = [eventFieldDefinition, scalarTypes, gameBuild, initializeFindPuzzle, userBuild, memoryBuild]

export const getSchema = () => {
  builders.forEach(fn => fn(builder))

  const build = builder.createBuild()
  buildInitializers.forEach(fn => fn(build))

  const { resolvers, typeDefs } = build.toTypeDefs()

  // console.log(build.getState())
  console.log(build.toTypeDefs().typeDefs)

  return makeExecutableSchema({
    resolvers,
    typeDefs,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
  })
}
