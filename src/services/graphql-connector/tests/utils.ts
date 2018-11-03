import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLType,
  isType,
  printSchema,
} from 'graphql'
import { modelCreator } from '../model'
import { BaseSchema } from '../model-initializer'

export type Types = 'int' | 'string'
export type Models = 'Sample' | 'Other'

export { printSchema }

export const createSchema = ({ queryFields, mutationFields }: BaseSchema) =>
  new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queryFields,
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationFields,
    }),
  })

export const createSDL = (schema: BaseSchema) => printSchema(createSchema(schema))
