import { AnyModel, Model } from './model'
import { RecordOf } from './utils'

import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLType,
} from 'graphql'

export type ModelList<Types, Models> = Array<AnyModel<Types, Models>>

export type Mutations = 'create' | 'update' | 'delete'
export type Queries = 'findOne' | 'findMany'

export type Names = Mutations | Queries
export type Fields = keyof ModelFields

export interface ModelFields {
  type: GraphQLObjectType
  list: GraphQLObjectType
  create: GraphQLInputObjectType
  update: GraphQLInputObjectType
}

export interface ExtendedModel<Types, Models> extends AnyModel<Types, Models> {
  mutationTypes: Record<Mutations, GraphQLInputObjectType>
  queryTypes: Record<Queries, GraphQLObjectType>
  types: ModelFields
  target?: any
}

export interface BaseSchema {
  queryFields: any
  mutationFields?: any
  subscriptionFields?: any
}

// this part needs to be extracted and a configuration needs to be implemented
import { capitalize, pluralize, singularize } from 'inflection'
export const defaultNamingStrategy = (name: string): Record<Names, string> => ({
  create: `create${singularize(name)}`,
  delete: `delete${pluralize(name)}`,
  findMany: `${pluralize(name)}`,
  findOne: `${singularize(name)}`,
  update: `update${singularize(name)}`,
})

export const PageInputType = new GraphQLInputObjectType({
  name: 'PageInput',
  fields: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
  },
})
export const PageType = new GraphQLObjectType({
  name: 'Page',
  fields: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
  },
})
export const NodeType = new GraphQLInterfaceType({
  name: 'Node',
  fields: {
    id: { type: GraphQLID },
  },
})
export const ListType = new GraphQLInterfaceType({
  name: 'List',
  fields: {
    nodes: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NodeType))) },
    page: { type: new GraphQLNonNull(PageType) },
  },
})

export const createModelRecord = <Types, Models>(models: ModelList<Types, Models>): BaseSchema => {
  // 1. initialize all models
  const record: Record<string, ExtendedModel<Types, Models>> = models.reduce(
    (record, model: ExtendedModel<Types, Models>) => {
      const name: string = model.name as any
      record[name] = model

      const names = defaultNamingStrategy(name)

      const dummyFields = {
        dummy: {
          type: GraphQLInt,
        },
      }

      const type = new GraphQLObjectType({
        name: names.findOne,
        fields: () => dummyFields,
      })
      const list = new GraphQLObjectType({
        name: names.findMany,
        fields: () => ({
          nodes: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(type))) },
          page: { type: new GraphQLNonNull(PageType) },
        }),
      })

      model.types = {
        type,
        list,
        create: new GraphQLInputObjectType({
          name: names.create,
          fields: () => dummyFields,
        }),
        update: new GraphQLInputObjectType({
          name: names.update,
          fields: () => dummyFields,
        }),
      }

      return record
    },
    {},
  )

  const modelNames = Object.keys(record)
  // 2. create field lists
  modelNames.forEach(name => {
    const model = record[name]
  })
  // 3. generator queries, mutations & subscriptions
  const queryFields = modelNames.reduce((queryFields, name) => {
    const model = record[name]

    const names = defaultNamingStrategy(name)

    queryFields[names.findOne] = {
      type: model.types.type,
      // args: { where: { type: nonNullGraphQL(whereFilter) }, order },
      resolve: () => null,
    }

    queryFields[names.findMany] = {
      type: model.types.list,
      // args: { where: { type: nonNullGraphQL(whereFilter) }, order },
      resolve: () => null,
    }

    return queryFields
  }, {})

  const mutationFields = modelNames.reduce((mutationFields, name) => {
    const model = record[name]

    const names = defaultNamingStrategy(name)

    mutationFields[names.create] = {
      type: model.types.type,
      // args: { where: { type: nonNullGraphQL(whereFilter) }, order },
      resolve: () => null,
    }

    mutationFields[names.update] = {
      type: model.types.type,
      // args: { where: { type: nonNullGraphQL(whereFilter) }, order },
      resolve: () => null,
    }

    mutationFields[names.delete] = {
      type: model.types.list,
      // args: { where: { type: nonNullGraphQL(whereFilter) }, order },
      resolve: () => null,
    }

    return mutationFields
  }, {})

  return {
    queryFields,
    mutationFields,
  }
}
