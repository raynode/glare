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

import { basicFilterMapper } from '../generate-model-args-parser'
import { isLinkType, isListType, isScalarType } from '../guards'
import { buildGraphQL } from '../index'
import {
  BaseModel,
  BuildConfiguration,
  LinkTypeMapper,
  ListTypeMapper,
  Model,
  ScalarTypeMapper,
  TypeModelMapper,
} from '../types'
import { DateType } from '../types/date-type'

export { printSchema }

export type TestType = 'boolean' | 'float' | 'date' | 'string' | 'id' | 'int' | 'model'

export const scalarTypeMapper: ScalarTypeMapper<TestType> = (_, type) => {
  if (type === 'boolean') return GraphQLBoolean
  if (type === 'float') return GraphQLFloat
  if (type === 'date') return DateType
  if (type === 'string') return GraphQLString
  if (type === 'id') return GraphQLID
  if (type === 'int') return GraphQLInt
  throw new Error(`unhandled type: ${_}:${type}`)
}

export const listTypeMapper: ListTypeMapper<TestType> = (_, type) =>
  new GraphQLList(new GraphQLNonNull(isType(type) ? type : scalarTypeMapper('scalar', type)))

export const linkTypeMapper: LinkTypeMapper = (link, { type }) =>
  link === 'linkSingle' ? type : listTypeMapper('list', type)

export const typeModelMapper: TypeModelMapper<TestType> = (type, dataType) => {
  console.log(type, dataType)
  if (isScalarType(type)) return scalarTypeMapper(type, dataType as TestType)

  if (isListType(type)) return listTypeMapper(type, dataType as TestType | GraphQLType)

  return linkTypeMapper(type, dataType as Model)
}

export const createSchema = ({ queryFields, mutationFields }) =>
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

export const modelsToSchema = (models: BaseModel[], config?: Partial<BuildConfiguration>) =>
  createSchema(
    buildGraphQL(models, {
      typeModelMapper,
      filterMapper: (modifier, field, value) => value, // only support equals!
      ...config,
    }),
  )

export const modelsToSDL = (models: BaseModel[]) => printSchema(modelsToSchema(models))
