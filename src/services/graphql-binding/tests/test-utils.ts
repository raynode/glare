import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLType,
  printSchema,
} from 'graphql'

import { buildGraphQL } from '../index'
import { Model } from '../types'
import { DateType } from '../types/date-type'

export { printSchema }

export type TestType = 'boolean' | 'float' | 'date' | 'string' | 'id' | 'int'
export const typeMapper = (type: TestType): GraphQLType => {
  if (type === 'boolean') return GraphQLBoolean
  if (type === 'float') return GraphQLFloat
  if (type === 'date') return DateType
  if (type === 'string') return GraphQLString
  if (type === 'id') return GraphQLID
  if (type === 'int') return GraphQLInt
  throw new Error('unkown type!')
}

export const createSchema = ({ queryFields, mutationFields }) => {
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queryFields,
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationFields,
    }),
  })
}

export const modelsToSDL = (models: Model[]) =>
  printSchema(
    createSchema(
      buildGraphQL(models, {
        typeModelMapper: typeMapper,
      }),
    ),
  )
