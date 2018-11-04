import { GraphQLType } from 'graphql'

export type TypeConverter<Types> = (type: Types) => GraphQLType
