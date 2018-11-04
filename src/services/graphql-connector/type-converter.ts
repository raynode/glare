import { GraphQLType } from 'graphql'
import { AnyModel, BaseField } from './model'

export type TypeConverter<Types, Models> = (
  type: BaseField<Types, Models>,
  getModel: (name: Models) => AnyModel<Types, Models>,
) => GraphQLType
