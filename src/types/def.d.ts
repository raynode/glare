
import { GraphQLFieldResolver } from 'graphql'
import { Context } from 'services/context'

export type Resolvers<Source> = Record<string, GraphQLFieldResolver<Source, Context>>

export interface BaseBlock<Source> {
  name: string
  Mutation?: Resolvers<Source>
  Query?: Resolvers<Source>
  Subscription?: any
  Resolver?: Record<string, Resolvers<Source>>
  typeDefs: string[]
}

export interface Block<Source> {
  name: string
  Mutation?: Resolvers<Source>
  Query?: Resolvers<Source>
  Subscription?: any
  Resolver?: Resolvers<Source>
}

interface TypeDef<Source> extends Block<Source> {
  typeDefs: string
  joins?: Array<Block<any>>
}
