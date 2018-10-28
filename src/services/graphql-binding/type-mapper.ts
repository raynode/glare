import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLType,
} from 'graphql'

import { RenameTypes } from 'apollo-server'

import { capitalize } from 'inflection'
import * as _ from 'lodash'
import { DataTypes, DataTypeScalar, RangeSubTypes } from 'services/db'
import { DateType } from './types/date-type'
import { JSONType } from './types/json-type'
import { UploadType } from './types/upload-type'

import { objects } from './collections'
import * as guards from './sequelize-type-guards'
// Map of special characters
const specialCharsMap = new Map([
  ['¼', 'frac14'],
  ['½', 'frac12'],
  ['¾', 'frac34'],
])

const sanitizeEnumValue = (value: string) => {
  return value
    .trim()
    .replace(/([^_a-zA-Z0-9])/g, (_, p) => specialCharsMap.get(p) || ' ')
    .split(' ')
    .map((v, i) => i ? _.upperFirst(v) : v)
    .join('')
    .replace(/(^\d)/, '_$1')
}

export const toGraphQLScalar = (sequelizeType: DataTypeScalar): GraphQLScalarType => {
  if(guards.isBoolean(sequelizeType))
    return GraphQLBoolean

  if(guards.isFloatType(sequelizeType))
    return GraphQLFloat

  if(guards.isDateType(sequelizeType))
    return DateType

  if(guards.isStringType(sequelizeType))
    return GraphQLString

  if(guards.isUUID(sequelizeType))
    return GraphQLID

  if(guards.isIntegerType(sequelizeType))
    return GraphQLInt

  console.log(sequelizeType)
  throw new Error('Unkown Scalar Type found')
}

export const rangeSubTypeToGraphQL = (subtype: RangeSubTypes) => {
  switch(subtype.toLowerCase()) {
    case 'integer':
      return GraphQLInt
    case 'bigint':
      return GraphQLString
    case 'decimal':
      return GraphQLString
    case 'dateonly':
      return DateType
    case 'date':
      return DateType
    case 'datenotz':
      return DateType
    case 'blob':
      return UploadType
    default:
      throw new Error(`Unkown subtype: ${subtype}`)
  }
}

export const toGraphQL = (sequelizeType: DataTypes): GraphQLType => {

  if(!guards.isAbstract(sequelizeType)) {
    console.log(sequelizeType)
    throw new Error('Input is not of type abstract-sequelize-type')
  }

  if(guards.isScalarType(sequelizeType))
    return toGraphQLScalar(sequelizeType)

  if(guards.isArray(sequelizeType))
    return new GraphQLList(toGraphQL(sequelizeType.type))

  if(guards.isEnum(sequelizeType))
    return new GraphQLEnumType({
      name: 'tempEnumName',
      values: _(sequelizeType.values)
        .mapKeys(sanitizeEnumValue)
        .mapValues(value => ({ value }))
        .value(),
    })

  if(guards.isVirtual(sequelizeType))
    return sequelizeType.returnType
    ? toGraphQL(sequelizeType.returnType)
    : GraphQLString

  if(guards.isJson(sequelizeType))
    return JSONType

  if(guards.isBlob(sequelizeType))
    return UploadType

  if(guards.isRange(sequelizeType)) {
    const SubType = rangeSubTypeToGraphQL(sequelizeType._subtype)
    const name = `${capitalize(sequelizeType._subtype)}RangeType`
    return objects.handle(name, new GraphQLObjectType({
      name,
      fields: {
        includeLowerBound: { type: GraphQLBoolean },
        includeUpperBound: { type: GraphQLBoolean },
        lowerBound: { type: SubType },
        upperBound: { type: SubType },
      },
    }))
  }

  console.log(sequelizeType)
  throw new Error(`Unable to convert ${sequelizeType.key}::${sequelizeType.toSql()} to a GraphQL type`)
}
