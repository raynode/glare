import { GraphQLType } from 'graphql'
import { AnyModel, BaseField, ExtendedModel } from './model'

export type TypeConverter<Types, Models> = (
  type: BaseField<Types, Models>,
  getModel: (name: Models) => ExtendedModel<Types, Models>,
) => GraphQLType

export const applyTypeConverter = <Types, Models>(
  typeConverter: TypeConverter<Types, Models>,
  getModel: (name: Models) => ExtendedModel<Types, Models>,
) => {
  return (field: Types) => {
    const type = typeConverter(field, getModel)
  }
}
