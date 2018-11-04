import { AnyModel, ExtendedModel, Model } from './model'
import { defaultNamingStrategy, NamingStrategy } from './naming-strategy'
import { TypeConverter } from './type-converter'
import { RecordOf } from './utils'

import { ListType, NodeType, PageInputType, PageType } from './generic-types'

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

export interface GeneratorConfiguration<Types, Models> extends PartialGeneratorConfiguration<Types, Models> {
  namingStrategy: NamingStrategy
  typeConverter: TypeConverter<Types, Models>
}
export interface PartialGeneratorConfiguration<Types, Models> {
  namingStrategy?: NamingStrategy
  typeConverter: TypeConverter<Types, Models>
}

export interface BaseSchema {
  queryFields: any
  mutationFields?: any
  subscriptionFields?: any
}

export type BaseSchemaGenerator<Types, Models> = (models: ModelList<Types, Models>) => BaseSchema

export const createModelRecord = <Types, Models extends string>(
  partialConfiguration: PartialGeneratorConfiguration<Types, Models>,
): BaseSchemaGenerator<Types, Models> => {
  const configuration: GeneratorConfiguration<Types, Models> = {
    namingStrategy: defaultNamingStrategy,
    ...partialConfiguration,
  }
  return models => {
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
          name: names.fields.findOne,
          interfaces: [NodeType],
          fields: () => model.dataTypes.type,
        })
        const list = new GraphQLObjectType({
          name: names.fields.findMany,
          interfaces: [ListType],
          fields: () => ({
            nodes: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(type))) },
            page: { type: new GraphQLNonNull(PageType) },
          }),
        })

        model.types = {
          type,
          list,
          create: new GraphQLInputObjectType({
            name: names.fields.create,
            fields: () => dummyFields,
          }),
          update: new GraphQLInputObjectType({
            name: names.fields.update,
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

      model.dataTypes = {
        type: model.fields.reduce((dataFields, field) => {
          const type = configuration.typeConverter(field, modelName => record[modelName])
          dataFields[field.name] = { type: field.nonNull ? new GraphQLNonNull(type) : type }
          return dataFields
        }, {}),
      }
    })
    // 3. generator queries, mutations & subscriptions
    const queryFields = modelNames.reduce((queryFields, name) => {
      const model = record[name]

      const names = defaultNamingStrategy(name)

      queryFields[names.fields.findOne] = {
        type: model.types.type,
        // args: { where: { type: nonNullGraphQL(whereFilter) }, order },
        resolve: () => null,
      }

      queryFields[names.fields.findMany] = {
        type: model.types.list,
        // args: { where: { type: nonNullGraphQL(whereFilter) }, order },
        resolve: () => null,
      }

      return queryFields
    }, {})

    const mutationFields = modelNames.reduce((mutationFields, name) => {
      const model = record[name]

      const names = defaultNamingStrategy(name)

      mutationFields[names.fields.create] = {
        type: model.types.type,
        // args: { where: { type: nonNullGraphQL(whereFilter) }, order },
        resolve: () => null,
      }

      mutationFields[names.fields.update] = {
        type: model.types.type,
        // args: { where: { type: nonNullGraphQL(whereFilter) }, order },
        resolve: () => null,
      }

      mutationFields[names.fields.delete] = {
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
}
