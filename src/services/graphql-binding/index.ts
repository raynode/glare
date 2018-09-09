
import { convertAttributeToField } from './convert-attribute-to-field'
import { generateModelAssociationFields } from './generate-model-association-fields'
import { generateModelFields, generateModelFilters } from './generate-model-fields'
import * as guards from './sequelize-type-guards'
import { toGraphQL } from './type-mapper'
import { BuildConfiguration, Field, ListItem, Model, ThunkField } from './types'
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

// const createLinkFieldFactory = (modelTypes: Dictionary<Field>) => (name: string, field: string) => ({
//   [name]: () => modelTypes[field],
// })

// const createModelTypesReducer = (linkFieldFactory: (name: string, field: string) => Dictionary<ThunkField>) =>
//   (state: Dictionary<ThunkField>, modelName: string) => ({
//     ...state,
//     ...linkFieldFactory(modelName, modelName),
//   })

// const getAssociationFields = (associations: string[], modelTypes: Dictionary<GraphQLObjectType>) => {
//   const x = createLinkFieldFactory(modelTypes as any)
//   const r = createModelTypesReducer(createLinkFieldFactory(modelTypes as any))
//   const xy: Dictionary<ThunkField> = associations.reduce((memo: Dictionary<ThunkField>, modelName) => ({
//     ...memo,
//     ...x(modelName, modelName),
//   }), {})
//   const res = mapValues(keyBy(associations.map(modelName => ({
//     key: modelName,
//     type: () => modelTypes[modelName],
//   })), 'key'), 'type')
//   console.log(res)
//   console.log(xy)
//   return xy
// }

export const buildGraphQL = (models: Model[], config?: BuildConfiguration) => {
  const configuration = { ...defaultBuildConfiguration, ...config }
  // const fields: Dictionary<Dictionary<Dictionary<any>>> = {}
  // const filters: Dictionary<Dictionary<Field>> = {}
  // const modelTypes: Dictionary<any> = {}
  // const linkFieldFactory = createLinkFieldFactory(modelTypes)

  // models.forEach(model => {
  //   fields[model.name] = {
  //     basic: generateModelFields(model, configuration),
  //   }
  // })

  // models.forEach(model => {
  //   fields[model.name].withAssociations = {
  //     ...fields[model.name].basic,
  //     ...getAssociationFields(generateModelAssociationFields(model, models, configuration), modelTypes),
  //   }
  //   fields[model.name].extended = {
  //     ...fields[model.name].basic,
  //     ...linkFieldFactory('AND', `${model.name}Filter`),
  //   }
  // })

  const bindings = models.reduce((memo: Binding, model) => {

    const fields = generateModelFields(model, configuration)
    const filterFields = generateModelFilters(model, configuration)

    // const filterType = new GraphQLObjectType({ name: model.name, fields: () => fields })
    // const filterTypeList = toGraphQLList<GraphQLInputType>(filterType)
    // const inputFieldConfig = {
    //   AND: { type: filterTypeList },
    //   OR: { type: filterTypeList },
    // }

    const type = new GraphQLObjectType({
      name: model.name,
      fields: () => fields as GraphQLFieldConfigMap<any, any>,
    })
    // const listType = toGraphQLList(type)
    // const where = { type: createInputObject(`${model.name}Filter`, fields)}
    // const update = {}

    // modelTypes[`${model.name}Basic`] = type
    // modelTypes[`${model.name}Filter`] = type
    // modelTypes[`${model.name}`] = { type, args: { where } }
    const where = new GraphQLInputObjectType({
      name: `${model.name}Filter`,
      fields: () => filterFields as GraphQLInputFieldConfigMap,
    })
    // const order = undefined
    memo.queryFields[`${model.name}`] = { type, args: { where: { type: where } }}
    // memo.queryFields[`${model.name}`] = { type, args: { where } }
    // memo.queryFields[`${pluralize(name)}`] = { type: new GraphQLNonNull(listType), args: { where }}

    // memo.mutationFields[`update${model.name}`] = { type }
    //   // [`delete${pluralize(name)}`]: { type: many, args: { where }}

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
