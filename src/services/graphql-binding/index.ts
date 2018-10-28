
import { convertAttributeToField } from './convert-attribute-to-field'
import { generateModelArgsParser } from './generate-model-args-parser'
import { generateModelAssociationFields } from './generate-model-association-fields'
import {
  AttributeModifiers,
  createFieldsGenerator,
  createFilterModifier,
  mapToGraphQLInputFieldConfigMap,
  removeDescriptionModifier,
  removeInvisibleAttributes,
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

import { create } from 'services/logger'

import { collectionGenerator, enums as enumTypes } from './collections'

const inputTypes = collectionGenerator<GraphQLInputObjectType>({})
const outputTypes = collectionGenerator<GraphQLObjectType>({})

const baseLog = create('graphql-binding')

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
  ], [ removeInvisibleAttributes, removeDescriptionModifier ])
  model.createFields = fieldsGenerator([
    AttributeModifiers.requiredAttributeModifier,
  ], [
    removeInvisibleAttributes,
    removeDescriptionModifier,
    AttributeModifiers.removeNotUpdateableModifier,
    createFilterModifier(({ name }) => !/id|createdAt|updatedAt/.test(name)),
  ])
  model.updateFields = mapToGraphQLInputFieldConfigMap(fieldsGenerator([
  ], [ removeInvisibleAttributes, removeDescriptionModifier ]))
  model.filterFields = fieldsGenerator([
    AttributeModifiers.listAttributeTypeModifier,
    AttributeModifiers.stringAttributeModifier,
    AttributeModifiers.listAttributeModifier,
    AttributeModifiers.arithmeticAttributeModifier,
  ], [ removeInvisibleAttributes, removeDescriptionModifier ])

  model.type = new GraphQLObjectType({
    name: model.name,
    fields: () => model.fields as GraphQLFieldConfigMap<any, any>,
  })
  model.outputTypes = {
    list: outputTypes.ifn(model.fieldNames.list, () => toGraphQLList(model.type, true)),
    model: outputTypes.ifn(model.fieldNames.model, () => model.type),
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
  model.createType = new GraphQLInputObjectType({
    name: model.names.createData,
    fields: () => model.createFields as GraphQLInputFieldConfigMap,
  })
  model.listType = toGraphQLList(model.type, true)
  return model
}

// hier werden die Associazionen zu den fields etc hinzugefügt!
export const addModelToFields = (model: Model, initialModelData: (model: Model) => Model) =>
  ({ as, single, target, field, allowNull = true }: Association) => {
    // tslint:disable-next-line
    console.log(`============> Adding ${model.name}.${as} = ${single ? target.name : `[${target.name}!]`}${allowNull ? '' : '!'}`)
    const targetModel = initialModelData(target)
    const type = single ? targetModel.type : targetModel.listType
    const findModel = new GraphQLInputObjectType({
      name: `${model.name}${targetModel.names.filters}`,
      fields: () => targetModel.filterFields as GraphQLInputFieldConfigMap,
    })
    model.createFields[as] = {
      type: allowNull ? findModel : nonNullGraphQL(findModel),
    }
    model.updateFields[as] = {
      type: allowNull ? findModel : nonNullGraphQL(findModel),
    }
    const selectionResolver = async filter => {
      if(!filter || !Object.keys(filter).length) return single
        ? null
        : []
      const result = single
        ? await targetModel.methods.findOne(filter, null, null, null)
        : await targetModel.methods.findMany(filter, null, null, null)
      if(!result) return single
        ? null
        : []
      // always return the relevant id / ids
      return single
       ? result.id
       : result.map(res => res.id)
    }
    model.assocResolvers.push(async data => ({
      ...data,
      [field]: await selectionResolver(data[as]),
    }))
    model.fields[as] = {
      type,
      // args: { where: targetModel.where },
      resolve: async (instance, args) => {
        const fn = `get${capitalize(as)}`
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
    const baseModelLog = baseLog.create(model.name)
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
      const where = argsParser(args.where)
      return model.methods.findOne(where, null, 0, 100)
    }

    const findManyResolver = async (_, args): Promise<Array<Instance<Attr>>> => {
      const where = argsParser(args.where)
      return model.methods.findMany(where, null, 0, 100)
    }

    memo.queryFields[model.names.findOne] = {
      type: model.outputTypes.model,
      args: { where: { type: nonNullGraphQL(whereFilter) }, order },
      resolve: findOneResolver,
    }

    const findManyLog = baseModelLog.create('find-many')
    memo.queryFields[model.names.findMany] = {
      type: model.outputTypes.list,
      args: { where, order, page },
      resolve: async (_, args) => {
        findManyLog(`find all: ${model.name}s`, args)
        const where = argsParser(args.where)
        findManyLog(where)
        const data = await model.methods.findMany(where, null, 0, 100)
        findManyLog(data.length)
        return data
      },
    }

    memo.mutationFields[model.names.createOne] = {
      type: model.outputTypes.model,
      args: { data: { type: nonNullGraphQL(model.createType) } },
      resolve: async (_, args) => {
        console.log(args)
        const data = await model.assocResolvers.reduce(async (data, resolver) => resolver(await data), args.data)
        console.log(data)
        return model.methods.createOne(data)
      },
    }

    const updateOneLog = baseModelLog.create('update-one')
    memo.mutationFields[model.names.updateOne] = {
      type: model.outputTypes.model,
      args: {
        where: { type: nonNullGraphQL(whereFilter)},
        data: { type: nonNullGraphQL(model.inputTypes.update) },
      },
      resolve: async (_, args) => {
        const instance = await findOneResolver(_, args)
        const data = await model.assocResolvers.reduce(async (data, resolver) => resolver(await data), args.data)
        await instance.update(data)
        return instance
      },
    }
    memo.mutationFields[model.names.deleteMany] = {
      type: model.outputTypes.list,
      args: {
        where: { type: nonNullGraphQL(whereFilter)},
      },
      resolve: async (_, args) => {
        const instances = await findManyResolver(_, args)
        await Promise.all(instances.map(instance => instance.destroy()))
        return instances
      },
    }

    return memo
  }, {
    queryFields: {},
    mutationFields: {},
  })

  return bindings
}
