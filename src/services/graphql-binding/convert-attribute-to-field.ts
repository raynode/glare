
import { GraphQLEnumType } from 'graphql'
import { capitalize } from 'inflection'

import { enums } from './collections'
import { toGraphQL } from './type-mapper'
import { Attribute, BaseField, BuildConfiguration, Model } from './types'

export const convertAttributeToField =
  (key: string, attribute: Attribute, model: Model, config: BuildConfiguration) => {
    const result: BaseField = {
      type: config.typeModelMapper(attribute.type),
    }

    if (result.type instanceof GraphQLEnumType) {
      const name = model.name
      const typeName = `${name}${capitalize(key)}EnumType`
      result.type = enums.handle(typeName, result.type)
    }

    if (typeof attribute.comment === 'string')
      result.description = attribute.comment

    return result
  }
