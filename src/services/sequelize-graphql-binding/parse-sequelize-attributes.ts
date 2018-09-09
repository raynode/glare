
import {
  GraphQLEnumType,
  GraphQLFieldConfig,
  GraphQLID,
  GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLType,
} from 'graphql'
import { capitalize, singularize } from 'inflection'

import {
  DataTypes,
  getModelAttributes,
  Instance,
  Model,
  sequelize,
  SequelizeAttributeType,
} from 'services/db'

import { enums } from './collections'
import { toGraphQL } from './type-mapper'

export interface RawModel<Attr, Inst extends Instance<Attr>> extends Model<Inst & Attr, Attr> {
  rawAttributes: any
  associations: Record<string, string>
  attributes: any
}

export const modelToName = <Attr, Inst extends Instance<Attr>>(model: Model<Inst & Attr, Attr>) =>
  capitalize(singularize(model.name))

export const checkAllowNull = <Attr, Inst extends Instance<Attr>>(
  attribute: SequelizeAttributeType<Attr, Inst>,
  fieldConfig: { type: GraphQLType },
) => {
  if (attribute.allowNull === false || attribute.primaryKey === true)
    fieldConfig.type = new GraphQLNonNull(fieldConfig.type)
  return fieldConfig
}

export interface AttributeGraphQLType {
  type: GraphQLType
  description?: string
}
export const modelAttributeToGraphQLType = <Attr, Inst extends Instance<Attr>>(
  model: Model<Inst & Attr, Attr>,
) => (
  key: string,
  attribute: SequelizeAttributeType<Attr, Inst>,
) => {

  const result: AttributeGraphQLType = {
    type: toGraphQL(attribute.type),
  }

  if (result.type instanceof GraphQLEnumType) {
    const name = modelToName(model)
    const typeName = `${name}${capitalize(key)}EnumType`
    result.type = enums.handle(typeName, result.type)
  }

  if (typeof attribute.comment === 'string')
    result.description = attribute.comment

  return result
}
