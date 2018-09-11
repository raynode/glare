
import { convertAttributeToField } from './convert-attribute-to-field'
import { generateModelArgsParser } from './generate-model-args-parser'
import { generateModelAssociationFields } from './generate-model-association-fields'
import { generateModelFields, generateModelFilters } from './generate-model-fields'
import * as guards from './sequelize-type-guards'
import { toGraphQL } from './type-mapper'
import { Association, BuildConfiguration, Field, ListItem, Model, ThunkField } from './types'
import { listReducer, toGraphQLList } from './utilities'

import {
  Dictionary,
  each,
  filter,
  keyBy,
  map,
  mapValues,
  some,
} from 'lodash'

import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfig,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLType,
  isInputType,
  isOutputType,
} from 'graphql'

const defaultBuildConfiguration: Partial<BuildConfiguration> = {
  attributeGraphQLMapper: convertAttributeToField,
  isAttributeVisible: type =>
      !guards.isRange(type),
  isArithmeticAttribute: type =>
       guards.isDate(type)
    || guards.isNumericType(type)
    || guards.isUUID(type),
  isStringAttribute: type =>
       guards.isStringType(type),
  isListAttribute: type =>
       guards.isEnum(type)
    || guards.isDate(type)
    || guards.isNumericType(type)
    || guards.isUUID(type),
  isManyAssociation: () => false,
  isSingleAssociation: () => false,
  typeModelMapper: toGraphQL,
}

import { capitalize, pluralize, singularize } from 'inflection'
import { Instance, Model as SeqModel } from 'services/db'

interface Binding {
  queryFields: Record<string, GraphQLFieldConfig<any, any>>
  mutationFields: Record<string, GraphQLFieldConfig<any, any>>
}

// export const modelFilterName = (model: Model) => `${model.name}Filter`

const isField = (field: Field | ThunkField): field is Field => !!(field as any).type

export const fieldResolver = (
  name: string,
  fields: Dictionary<Field | ThunkField>,
  filter: (val: any) => boolean,
  error: string,
) => (): Dictionary<Field> => {
  const mappedFields = mapValues(fields, field => isField(field) ? field : field())
  if(some(mappedFields, field => isInputType(field)))
    throw new Error(error)
  return mappedFields
}

export const createInputObject = (name: string, fields: Dictionary<Field | ThunkField >) =>
  new GraphQLInputObjectType({
    name,
    fields: fieldResolver(name, fields, isInputType, 'Fields did include a non-input field!') as any,
  })

export const createOutputObject = (name: string, fields: Dictionary<Field | ThunkField>) =>
  new GraphQLObjectType({
    name,
    fields: fieldResolver(name, fields, isOutputType, 'Fields did include a non-output field!') as any,
  })

export const generateInitialModelData = (configuration: BuildConfiguration) => (model: Model) => {
  console.log('===> ', model.name)
  if(model.initialized)
    return model
  model.initialized = true
  model.fields = generateModelFields(model, configuration)
  model.filterFields = generateModelFilters(model, configuration)

  model.type = new GraphQLObjectType({
    name: model.name,
    fields: () => model.fields as GraphQLFieldConfigMap<any, any>,
  })
  model.listType = toGraphQLList(model.type, true)
  model.where = {
    type: new GraphQLInputObjectType({
      name: `${model.name}Filter`,
      fields: () => model.filterFields as GraphQLInputFieldConfigMap,
    }),
  }
  return model
}

export const addModelToFields = (model: Model, initialModelData: (model: Model) => Model) =>
  (association: Association) => {
    const targetModel = initialModelData(association.target)
    model.fields[association.as] = {
      type: association.single ? targetModel.type : targetModel.listType,
      // args: { where: targetModel.where },
      resolve: async (instance, args) => {
        const fn = `get${capitalize(association.as)}`
        if(!instance[fn])
          throw new Error(`Problems with ${model.name}:${targetModel.name}`)
        return instance[fn]()
      },
    }
  }

export const buildGraphQL = (models: Model[], config?: BuildConfiguration) => {
  const configuration = { ...defaultBuildConfiguration, ...config }
  const initialModelData = generateInitialModelData(configuration)
  models.forEach(initialModelData)
  models.forEach(model => map(model.associations, addModelToFields(model, initialModelData)))

  const bindings = models.reduce((memo: Binding, model) => {
    const argsParser = generateModelArgsParser(config, model)

    memo.queryFields[`${model.name}`] = {
      type: model.type,
      args: { where: model.where },
      resolve: async (_, args) => {
        console.log(`find: ${model.name}`, args)
        const where = argsParser(args.where)
        console.log(where)
        const data = await model.findOne(where, null, 0, 100)
        console.log(data)
        return data
      },
    }
    // memo.queryFields[`${model.name}`] = { type, args: { where } }
    memo.queryFields[`${pluralize(model.name)}`] = {
      type: model.listType,
      args: { where: model.where },
      resolve: async (_, args) => {
        console.log(`find all: ${model.name}s`, args)
        const where = argsParser(args.where)
        console.log(where)
        const data = await model.findMany(where, null, 0, 100)
        console.log(data.length)
        return data
      },
    }

    memo.mutationFields[`create${model.name}`] = { type: model.type, args: { where: model.where }}
    memo.mutationFields[`update${model.name}`] = { type: model.type, args: { where: model.where }}
    memo.mutationFields[`delete${pluralize(model.name)}`] = { type: model.listType, args: { where: model.where }}

    return memo
  }, {
    queryFields: {},
    mutationFields: {},
  })

    // listReducer(attributeFields)(val => val)
  console.log('------- === === === === Filters:')
  console.log(bindings)
  console.log('------- === === === === -------')
  return bindings
}
