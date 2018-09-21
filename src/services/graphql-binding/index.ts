
import { convertAttributeToField } from './convert-attribute-to-field'
import { generateModelArgsParser } from './generate-model-args-parser'
import { generateModelAssociationFields } from './generate-model-association-fields'
import {
  AttributeModifiers,
  createFieldsGenerator,
  createFilterModifier,
  mapToGraphQLInputFieldConfigMap,
  removeDescriptionModifier,
} from './generate-model-fields'
import * as guards from './sequelize-type-guards'
import { toGraphQL } from './type-mapper'
import { Association, BuildConfiguration, Field, ListItem, Model, ThunkField } from './types'
import { listReducer, nonNullGraphQL, toGraphQLList } from './utilities'

import {
  Dictionary,
  each,
  filter,
  flatten,
  keyBy,
  map,
  mapValues,
  some,
} from 'lodash'

import {
  GraphQLEnumType,
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLInputField,
  GraphQLInputFieldConfig,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLType,
  isInputType,
  isOutputType,
} from 'graphql'

import { collectionGenerator, enums as enumTypes } from './collections'
const inputTypes = collectionGenerator<GraphQLInputObjectType>({})
const outputTypes = collectionGenerator<GraphQLObjectType>({})

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
  if(model.initialized)
    return model
  console.log('===> ', model.name)
  model.initialized = true
  // model.fields = generateModelFields(model, configuration)
  // model.createFields = generateModelFields(model, configuration)

  const fieldsGenerator = createFieldsGenerator(model, configuration)

  /* model fields:
    .- output-type: attributes(required), associations()
    .- input-find: attributes(stringFilter, listFilter, arithmeticFilter)
    .- enum-order: attributes(orderFilter)
    .- mtn-create(where: find, order, page):
        .- create-input: attributes(required), associations(asFilter, required)
    .- mtn-delete(where: find, order, page):
    .- mtn-find(where: find, order, page):
    .- input-page: limit=number offset=number
    .- mtn-update(where: find, order, page):
        .- update-input: attributes(), associations(asFilter)
  */

  model.inputTypes = {
    create: inputTypes.ifn(model.fieldNames.create,
      () => new GraphQLInputObjectType({ name: model.fieldNames.create, fields: () => null })),
    page: inputTypes.ifn(model.fieldNames.page,
      () => new GraphQLInputObjectType({ name: model.fieldNames.page, fields: {
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
      } })),
    update: inputTypes.ifn(model.fieldNames.update,
      () => new GraphQLInputObjectType({
        name: model.fieldNames.update,
        fields: () => model.updateFields,
      })),
  }

  model.fields = fieldsGenerator([
    AttributeModifiers.requiredAttributeModifier,
  ], [ removeDescriptionModifier ])
  model.createFields = fieldsGenerator([
    AttributeModifiers.requiredAttributeModifier,
  ], [
    removeDescriptionModifier,
    AttributeModifiers.removeNotUpdateableModifier,
    createFilterModifier(({ name }) => !/createdAt|updatedAt/.test(name)),
  ])
  model.updateFields = mapToGraphQLInputFieldConfigMap(fieldsGenerator([
  ], [ removeDescriptionModifier ]))
  model.filterFields = fieldsGenerator([
    AttributeModifiers.listAttributeTypeModifier,
    AttributeModifiers.stringAttributeModifier,
    AttributeModifiers.listAttributeModifier,
    AttributeModifiers.arithmeticAttributeModifier,
  ], [ removeDescriptionModifier ])

  const type = new GraphQLObjectType({
    name: model.name,
    fields: () => model.fields as GraphQLFieldConfigMap<any, any>,
  })
  model.outputTypes = {
    list: outputTypes.ifn(model.fieldNames.list, () => toGraphQLList(type, true)),
    model: outputTypes.ifn(model.fieldNames.model, () => type),
  }

  const buildOrderEnum = (model: Model) => {
    const values = mapValues(
      keyBy(flatten(map(model.fields, (_, field) => [`${field}_ASC`, `${field}_DESC`]))),
      value => ({ value }),
    )
    return new GraphQLEnumType({
      name: model.fieldNames.order,
      values,
    })
  }

  model.enumTypes = {
    order: enumTypes.ifn(model.fieldNames.order, () => buildOrderEnum(model)),
  }

  model.type = type
  model.createType = new GraphQLInputObjectType({
    name: model.names.createData,
    fields: () => {
      console.log('CREATE:', model.createFields)
      return model.createFields as GraphQLInputFieldConfigMap
    },
  })
  model.listType = toGraphQLList(model.type, true)
  model.where = {
    type: new GraphQLInputObjectType({
      name: model.names.filters,
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

    const whereFilter = new GraphQLInputObjectType({
      name: model.names.filters,
      fields: () => model.filterFields as GraphQLInputFieldConfigMap,
    })
    const where: any = { type: whereFilter }
    const order: any = { type: model.enumTypes.order }
    const page: any = { type: model.inputTypes.page }

    /* model fields:
      .- output-type: attributes(required), associations()
      .- input-find: attributes(stringFilter, listFilter, arithmeticFilter)
      .- enum-order: attributes(orderFilter)
      .- mtn-create(where: find, order, page):
          .- create-input: attributes(required), associations(asFilter, required)
      .- mtn-delete(where: find, order, page):
      .- mtn-find(where: find, order, page):
      .- input-page: limit=number offset=number
      .- mtn-update(where: find, order, page):
          .- update-input: attributes(), associations(asFilter)
    */

    const findOneResolver = async (_, args): Promise<Instance<Attr>> => {
      console.log(`find: ${model.name}`, args)
      const where = argsParser(args.where)
      console.log(where)
      return model.methods.findOne(where, null, 0, 100)
      // console.log(data)
      // return data
    }

    memo.queryFields[model.names.findOne] = {
      type: model.outputTypes.model,
      args: { where: { type: nonNullGraphQL(whereFilter) }, order },
      resolve: findOneResolver,
    }

    memo.queryFields[model.names.findMany] = {
      type: model.outputTypes.list,
      args: { where, order, page },
      resolve: async (_, args) => {
        console.log(`find all: ${model.name}s`, args)
        const where = argsParser(args.where)
        console.log(where)
        const data = await model.methods.findMany(where, null, 0, 100)
        console.log(data.length)
        return data
      },
    }


    memo.mutationFields[model.names.createOne] = {
      type: model.outputTypes.model,
      args: { data: { type: nonNullGraphQL(model.createType) } },
      resolve: (_, args) => {
        console.log('create ' + model.name)
        console.log(args)
        return null
      },
    }

    memo.mutationFields[model.names.updateOne] = {
      type: model.outputTypes.model,
      args: {
        where: { type: nonNullGraphQL(whereFilter)},
        data: { type: nonNullGraphQL(model.inputTypes.update) },
      },
      resolve: async (_, args) => {
        const instance = await findOneResolver(_, args)
        console.log('update ', model.name, '-with:', args.data)
        await instance.update(args.data)
        console.log('update ', instance.get('name'))
        return instance
      },
    }
    // memo.mutationFields[model.names.deleteMany] = {
    //   type: model.outputTypes.list,
    //   args: { where: model.where },
    // }

    return memo
  }, {
    queryFields: {},
    mutationFields: {},
  })

  return bindings
}
