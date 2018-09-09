
import {
  GraphQLEnumType,
  GraphQLFieldConfig,
  GraphQLID,
  GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
  GraphQLType,
} from 'graphql'
import { capitalize, pluralize, singularize } from 'inflection'
import {
  DataTypes,
  getModelAssociations,
  getModelAttributes,
  Instance,
  Model,
  ModelAttributes,
  sequelize,
  SequelizeAttributeType,
} from 'services/db'
import { toGraphQL } from './type-mapper'

import {
  isInputType,
} from './graphql-type-guards'

import * as guards from './sequelize-type-guards'
import { collectionGenerator } from './collections'
import {
  arrayConcat,
  listMapFn,
  listReducer,
  objectMapFn,
} from './utilities'

import {
  checkAllowNull,
  modelAttributeToGraphQLType,
  modelToName,
  RawModel,
} from './parse-sequelize-attributes'

const capitalizeWord = (str: string) =>
  str.substring(0, 1).toUpperCase() + str.substring(1)

const cache: Record<keyof typeof sequelize.models, any> = {}

export const buildModelQueries = <Attr, Inst extends Instance<Attr> & Attr>(model: RawModel<Attr, Inst>) => {
  return null
}

const toGraphQLList = <Result extends GraphQLType = GraphQLType>(type: GraphQLType): Result =>
  new GraphQLList(new GraphQLNonNull(type)) as any

interface FieldConfig {
  // description?: string
  type: GraphQLType
}
interface FieldConfigMap<Type> { key: string, value: Type }
type FieldGenerator<Type> = (key: string, list: boolean, description: string) => Type
const typeGenerator = <Result = FieldConfig>(
  type: GraphQLType,
  mapper: (fieldConfig: FieldConfig) => Result = fieldConfig => fieldConfig as any,
): FieldGenerator<FieldConfigMap<Result>> =>
  (key: string, list: boolean, description: string): FieldConfigMap<Result> => ({
    key,
    value: mapper({
      // description,
      type: list ? toGraphQLList(type) : type,
    }),
  })

const generateListFilters = <Type>(field: string, generator: FieldGenerator<Type>) => [
  generator(`${field}_in`, true, `${field}_in`),
  generator(`${field}_not_in`, true, `${field}_not_in`),
]

const generateArithmeticFilters = <Type>(field: string, generator: FieldGenerator<Type>) => [
  generator(`${field}`, false, `${field}`),
  generator(`${field}_not`, false, `${field}_not`),
  generator(`${field}_lt`, false, `${field}_lt`),
  generator(`${field}_lte`, false, `${field}_lte`),
  generator(`${field}_gt`, false, `${field}_gt`),
  generator(`${field}_gte`, false, `${field}_gte`),
]

const generateStringFilters = <Type>(field: string, generator: FieldGenerator<Type>) => [
  generator(`${field}`, false, `${field}`),
  generator(`${field}_contains`, false, `${field}_contains`),
  generator(`${field}_not_contains`, false, `${field}_not_contains`),
  generator(`${field}_starts_with`, false, `${field}_starts_with`),
  generator(`${field}_not_starts_with`, false, `${field}_not_starts_with`),
  generator(`${field}_ends_with`, false, `${field}_ends_with`),
  generator(`${field}_not_ends_with`, false, `${field}_not_ends_with`),
]

const filterColletion = collectionGenerator<GraphQLInputType>({})
const generateBasicFilterFields = <Attr, Inst extends Instance<Attr>>(
  model: RawModel<Attr, Inst>,
  attributes: ModelAttributes<Attr, Inst>,
) => {
  const attributeToGraphQLType = modelAttributeToGraphQLType(model)
  return arrayConcat(listMapFn(attributes)((key, attribute) => {
    const filters: Array<FieldConfigMap<GraphQLInputFieldConfig>> = []

    if(guards.isRange(attribute.type))
      return filters

    const graphqlType = attributeToGraphQLType(key, attribute)
    const { type } = attribute
    const generator = typeGenerator<GraphQLInputFieldConfig>(graphqlType.type)

    filters.push(generator(key, false, `${key} needs to equal this value`))

    if(guards.isDate(type)
    || guards.isNumericType(type)
    || guards.isUUID(type)
    ) filters.push(...generateArithmeticFilters(key, generator))

    if(guards.isStringType(type)
    ) filters.push(...generateStringFilters(key, generator))

    if(guards.isEnum(type)
    || guards.isDate(type)
    || guards.isNumericType(type)
    || guards.isUUID(type)
    ) filters.push(...generateListFilters(key, generator))

    return filters
  }))
}

const generateBasicFilters = <Attr, Inst extends Instance<Attr>>(
  model: RawModel<Attr, Inst>,
  attributes: ModelAttributes<Attr, Inst>,
) => {
  const name = `${modelToName(model)}Filter`
  if(filterColletion.has(name))
    return filterColletion.get(name)

  const filterType = new GraphQLInputObjectType({ name, fields: () => filterFields })
  const filterTypeList = toGraphQLList<GraphQLInputType>(filterType)
  const fields: Array<FieldConfigMap<GraphQLInputFieldConfig>> = [{
      key: 'AND',
      value: {
        description: 'Logical AND on all given filters.',
        type: filterTypeList,
      },
    }, {
      key: 'OR',
      value: {
        description: 'Logical OR on all given filters.',
        type: filterTypeList,
      },
    },
    ...generateBasicFilterFields(model, attributes),
  ]

  const filterFields = listReducer(fields)(val => val)
  return filterColletion.add(name, filterType)
}

const generateAssociationFilter = <Attr, Inst extends Instance<Attr>>(
  model: RawModel<Attr, Inst>,
  associations: Array<RawModel<any, any>>,
) => {
  const name = `${modelToName(model)}AssociationFilter`
  // if(filterColletion.has(name))
  //   return filterColletion.get(name)

  console.log('checking ' + name)
  const association = associations[0]
  console.log('Model: ', association)
  const fields = [
    ...generateBasicFilterFields(model, getModelAttributes(model)),
    ...generateBasicFilterFields(association, getModelAttributes(association)),
  ]
  const filterType = generateBasicFilterFields(association, getModelAttributes(association))

  return filterType
  // const filterFields = listReducer(fields)(val => val)
  // return filterColletion.add(name, filterType)
}

const allowsUpdates = <Attr, Inst extends Instance<Attr> & Attr>(
  attribute: SequelizeAttributeType<Attr, Inst>,
) => attribute.allowUpdates !== undefined ? attribute.allowUpdates : true

export const bindingGenerator = (options: any = {}) => {
  return <Attr, Inst extends Instance<Attr> & Attr>(rawModel: Model<Attr, Inst>) => {
    const model: RawModel<Attr, Inst> = rawModel as any
    const name = modelToName(model)

    const attributes = getModelAttributes(model)
    const attributeToGraphQLType = modelAttributeToGraphQLType(model)

    const fields = objectMapFn(attributes)((property, attribute) => {
      const fieldConfig = attributeToGraphQLType(property, attribute)
      return checkAllowNull(attribute, fieldConfig) as GraphQLFieldConfig<any, any>
    })

    const exclude = [
      'id', 'createdat', 'updatedat',
      ...listMapFn(attributes)((property, attribute) => !allowsUpdates(attribute) ? property.toLowerCase() : null),
    ].filter(value => value)

    const updatableAttributes = listMapFn(attributes)((key, property) => ({ key, property }))
    .filter(({ key }) => !exclude.includes(key.toLowerCase()))

    const updatableFields = listReducer(updatableAttributes)(({ key, property }) => ({
      key,
      value: attributeToGraphQLType(key, property) as GraphQLInputFieldConfig,
    }))

    const type = new GraphQLObjectType({ name, fields })
    const where = false
    ? { type: generateBasicFilters(model, attributes) }
    : { type: GraphQLString }
    const update = { type: new GraphQLInputObjectType({ name: `update${name}`, fields: updatableFields }) }
    const many = new GraphQLList(type)

    const associations = getModelAssociations(model)

    const associatedModelnames = Object.keys(associations)
      .map(association => capitalize(singularize(association)))
      .slice(0, 1)
    const availableModels = (model as any).sequelize.models

    const enhancedFilter = generateBasicFilters(model, { name: attributes.name })
    let f: GraphQLInputType = null
    associatedModelnames.map(name => {
      const associatedFilter = generateAssociationFilter(model, availableModels[name])
      const type =
        listReducer(associatedFilter)(val => val)
      // const x: Record<string, GraphQLInputFieldConfig> = {
      //   [name]: { type },
      // }
      f = new GraphQLInputObjectType({
        name: 'SomeNode',
        fields: type,
      })
      console.log('FILTER:', f)

      console.log(enhancedFilter)
    })
    console.log(associatedModelnames)
    // console.log((model as any).sequelize.models)

    const w = { type: f }
    const queryFields = {
      [`${name}`]: { type, args: { where: w }},
      [`${pluralize(name)}`]: { type: many, args: { where }},
    }

    const mutationFields = {
      [`create${name}`]: { type, args: {  }},
      [`update${name}`]: { type, args: { where, update }},
      [`delete${pluralize(name)}`]: { type: many, args: { where }},
    }

    const events = {
      created: `created${name}`,
      updated: `updated${name}`,
      deleted: `deleted${name}`,
    }

    const subsciptionFields = {}

    return {
      type,
      where,
      queryFields,
      mutationFields,
    }
  }
}
