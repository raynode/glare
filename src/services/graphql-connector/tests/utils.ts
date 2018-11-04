import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLType,
  isType,
  printSchema,
} from 'graphql'
import { BaseSchema } from '../base-schema-generator'
import { isAssociationField, isAttributeField } from '../model'
import { TypeConverter } from '../type-converter'

export { printSchema }

export type Types = 'int' | 'string'
export type Models = 'Sample' | 'Other'

export const attributeType = (type: Types) =>
  ({
    int: GraphQLInt,
    string: GraphQLString,
  }[type])

export const basicTypeConverter: TypeConverter<Types, Models> = (field, getModel) => {
  console.log('type', field)
  if (isAttributeField(field)) {
    const type = attributeType(field.type)
    return field.list ? new GraphQLList(new GraphQLNonNull(type)) : type
  }
  if (isAssociationField(field)) {
    const model = getModel(field.model)
    return field.list ? model.types.list : model.types.type
  }
  throw new Error('unknown field type')
}

export const createSchema = ({ queryFields, mutationFields }: BaseSchema) =>
  new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queryFields,
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationFields,
    }),
  })

export const createSDL = (schema: BaseSchema) => printSchema(createSchema(schema))
