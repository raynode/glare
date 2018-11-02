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
import { capitalize, pluralize, singularize } from 'inflection'
import { Dictionary, each, filter, flatten, keyBy, map, mapValues, some } from 'lodash'
import { Instance, Model as SeqModel } from 'services/db'
import { create } from 'services/logger'

import { collectionGenerator, enums as enumTypes } from './collections'
import { convertAttributeToField } from './convert-attribute-to-field'
import { sequelizeMethodMapper } from './convert-to-model'
import { generateModelArgsParser, sequelizeFilterMapper } from './generate-model-args-parser'
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
import { Association, BaseModel, BuildConfiguration, Field, ListItem, Model, ThunkField } from './types'
import { listReducer, nonNullGraphQL, toGraphQLList } from './utilities'
const inputTypes = collectionGenerator<GraphQLInputObjectType>({})
const outputTypes = collectionGenerator<GraphQLObjectType>({})

const baseLog = create('graphql-binding')

const defaultBuildConfiguration: BuildConfiguration = {
  attributeGraphQLMapper: convertAttributeToField,
  isAttributeVisible: type => !guards.isRange(type),
  isArithmeticAttribute: type => guards.isDate(type) || guards.isNumericType(type) || guards.isUUID(type),
  isStringAttribute: type => guards.isStringType(type),
  isListAttribute: type =>
    guards.isEnum(type) || guards.isDate(type) || guards.isNumericType(type) || guards.isUUID(type),
  isManyAssociation: () => false,
  isSingleAssociation: () => false,
  typeModelMapper: toGraphQL,
  filterMapper: sequelizeFilterMapper,
  methodMapper: sequelizeMethodMapper,
}

interface Binding {
  queryFields: Record<string, GraphQLFieldConfig<any, any>>
  mutationFields: Record<string, GraphQLFieldConfig<any, any>>
}

export const isModel = <T>(model: BaseModel<T> | Model<T>): model is Model<T> => model.hasOwnProperty('initialized')

export const generateInitialModelData = <Type>(configuration: BuildConfiguration) => (
  baseModel: BaseModel<Type> | Model<Type>,
): Model<Type> => {
  if (isModel(baseModel)) return baseModel
  // evil... DO NOT DO THIS!
  const model: any = baseModel
  baseLog('===> ', model.name)
  model.initialized = true
  if (!model.methods) model.methods = configuration.methodMapper(model)
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
    create: inputTypes.ifn(
      model.fieldNames.create,
      () => new GraphQLInputObjectType({ name: model.fieldNames.create, fields: () => null }),
    ),
    page: inputTypes.ifn(
      model.fieldNames.page,
      () =>
        new GraphQLInputObjectType({
          name: model.fieldNames.page,
          fields: {
            limit: { type: GraphQLInt },
            offset: { type: GraphQLInt },
          },
        }),
    ),
    update: inputTypes.ifn(
      model.fieldNames.update,
      () =>
        new GraphQLInputObjectType({
          name: model.fieldNames.update,
          fields: () => model.updateFields,
        }),
    ),
  }

  model.fields = fieldsGenerator(
    [AttributeModifiers.requiredAttributeModifier],
    [removeInvisibleAttributes, removeDescriptionModifier],
  )
  model.createFields = fieldsGenerator(
    [AttributeModifiers.requiredAttributeModifier],
    [
      removeInvisibleAttributes,
      removeDescriptionModifier,
      AttributeModifiers.removeNotUpdateableModifier,
      createFilterModifier(({ name }) => !/id|createdAt|updatedAt/.test(name)),
    ],
  )
  model.updateFields = mapToGraphQLInputFieldConfigMap(
    fieldsGenerator([], [removeInvisibleAttributes, removeDescriptionModifier]),
  )
  model.filterFields = fieldsGenerator(
    [
      AttributeModifiers.listAttributeTypeModifier,
      AttributeModifiers.stringAttributeModifier,
      AttributeModifiers.listAttributeModifier,
      AttributeModifiers.arithmeticAttributeModifier,
    ],
    [removeInvisibleAttributes, removeDescriptionModifier],
  )

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
    name: model.fieldNames.create,
    fields: () => model.createFields as GraphQLInputFieldConfigMap,
  })
  model.listType = toGraphQLList(model.type, true)
  return model
}

// hier werden die Associazionen zu den fields etc hinzugefügt!
export const addModelToFields = (model: Model, initialModelData: (model: Model) => Model) => ({
  as,
  single,
  target,
  field = as,
  allowNull = true,
}: Association) => {
  // tslint:disable-next-line
  baseLog(
    `============> Adding ${model.name}.${as} = ${single ? target.name : `[${target.name}!]`}${allowNull ? '' : '!'}`,
  )
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
    baseLog('selection-resolver:', model.name, as, targetModel.name, single, filter)
    if (!filter || !Object.keys(filter).length) return single ? null : []
    const where = targetModel.filterParser(filter)
    console.log(where)
    const result = single
      ? await targetModel.methods.findOne(where, null, null, null)
      : await targetModel.methods.findMany(where, null, null, null)
    console.log(result)
    if (!result) return single ? null : []
    console.log('id:', single ? result.id : result.map(res => res.id))
    // always return the relevant id / ids
    return single ? result.id : result.map(res => res.id)
  }
  model.assocResolvers.push(async data => {
    baseLog('resolveAssoc', model.name, targetModel.name, as, field)
    return {
      ...data,
      [field]: await selectionResolver(data[as]),
    }
  })
  model.fields[as] = {
    type,
    // args: { where: targetModel.where },
    resolve: async (instance, args) => {
      const fn = `get${capitalize(as)}`
      baseLog(fn, args, single)
      if (!instance[fn]) throw new Error(`Problems with ${model.name}:${targetModel.name}`)
      return instance[fn]()
    },
  }
}

export const buildGraphQL = (baseModels: BaseModel[], config?: Partial<BuildConfiguration>) => {
  const configuration: BuildConfiguration = { ...defaultBuildConfiguration, ...config }
  const initialModelData = generateInitialModelData(configuration)
  const models = baseModels.map(initialModelData)
  models.forEach(model => map(model.associations, addModelToFields(model, initialModelData)))

  const bindings = models.reduce(
    (memo: Binding, model) => {
      const baseModelLog = baseLog.create(model.name)
      model.filterParser = generateModelArgsParser(configuration, model)

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

      const findOneResolver = async (_, args) => {
        if (!args.where || !Object.keys(args.where).length) throw new Error('findOne needs a where selector!')
        const where = model.filterParser(args.where)
        return model.methods.findOne(where, null, 0, 100)
      }

      const findManyResolver = async (_, args) => {
        const where = model.filterParser(args.where)
        return model.methods.findMany(where, null, 0, 100)
      }

      memo.queryFields[model.names.findOne] = {
        type: model.outputTypes.model,
        args: { where: { type: nonNullGraphQL(whereFilter) }, order },
        resolve: findOneResolver,
      }

      memo.queryFields[model.names.findMany] = {
        type: model.outputTypes.list,
        args: { where, order, page },
        resolve: findManyResolver,
      }

      memo.mutationFields[model.names.createOne] = {
        type: model.outputTypes.model,
        args: { data: { type: nonNullGraphQL(model.createType) } },
        resolve: async (_, args) => {
          const data = await model.assocResolvers.reduce(async (data, resolver) => resolver(await data), args.data)
          return model.methods.createOne(data)
        },
      }

      memo.mutationFields[model.names.updateOne] = {
        type: model.outputTypes.model,
        args: {
          where: { type: nonNullGraphQL(whereFilter) },
          data: { type: nonNullGraphQL(model.inputTypes.update) },
        },
        resolve: async (_, args) => {
          // console.log(args)
          // const instance = await findOneResolver(_, args)
          // console.log('assocResolvers', model.assocResolvers)
          // console.log('associations', model.associations)
          // const data = await model.assocResolvers.reduce(async (data, resolver) => resolver(await data), args.data)

          // await instance.update(data)
          // return instance
          return model.methods.update(model.filterParser(args.where), args.order, args.offset, args.data)
        },
      }
      memo.mutationFields[model.names.deleteMany] = {
        type: model.outputTypes.list,
        args: {
          where: { type: nonNullGraphQL(whereFilter) },
        },
        resolve: async (_, args) => {
          return model.methods.deleteMany(model.filterParser(args.where), args.order, args.offset, args.limit)
          // const instances = await findManyResolver(_, args)
          // await Promise.all(instances.map(instance => instance.destroy()))
          // return instances
        },
      }

      return memo
    },
    {
      queryFields: {},
      mutationFields: {},
    },
  )

  return bindings
}
