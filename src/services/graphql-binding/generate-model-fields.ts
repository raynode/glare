
import { convertAttributeToField } from './convert-attribute-to-field'
import {
  Attribute,
  BaseField,
  BuildConfiguration,
  Field,
  FieldFactory,
  ListItem,
  Model,
} from './types'
import { arrayConcat, listMapFn, toGraphQLList } from './utilities'

import { GraphQLType } from 'graphql'
import { collectionGenerator } from './collections'

import { Dictionary, flatMap, keyBy, mapValues, reduce } from 'lodash'

export interface AttributeFlags {
  filters: boolean
}

const paddedAttributeGraphQLMapper = (model: Model, config: BuildConfiguration) =>
  (attribute: Attribute, name: string) => config.attributeGraphQLMapper(name, attribute, model, config)

const createAttributeMapper = (model: Model, config: BuildConfiguration, flags: AttributeFlags) =>
  (fields: Dictionary<BaseField>, attribute: Attribute, name: string) => {
    const { type } = attribute

    if(!config.isAttributeVisible(type))
      return fields

    const field = config.attributeGraphQLMapper(name, attribute, model, config)

    // add the basic type
    fields[name] = field

    // add filter fields?
    if(flags.filters) {
      // add all extras for arithmetic filter
      if(config.isArithmeticAttribute(type))
        Object.assign(fields, generateArithmeticFilters(name, field))
      // add all extras for string filter
      if(config.isStringAttribute(type))
        Object.assign(fields, generateStringFilters(name, field))
      // add all extras for list filter
      if(config.isListAttribute(type))
        Object.assign(fields, generateListFilters(name, { type: toGraphQLList(field.type) }))
    }
    return fields
  }

// const cache = collectionGenerator<Array<ListItem<Field>>>({})
export const generateModelFields = (model: Model, config: BuildConfiguration): Dictionary<BaseField> =>
  reduce(model.attributes, createAttributeMapper(model, config, {
    filters: false,
  }), {})

export const generateModelFilters = (model: Model, config: BuildConfiguration): Dictionary<BaseField> =>
  reduce(model.attributes, createAttributeMapper(model, config, {
    filters: true,
  }), {})

const WITH_DESC = false

const generateListFilters = <Type>(field: string, type: BaseField) => ({
  [`${field}_in`]: { ...type, description: WITH_DESC && `${field} is found in this list` },
  [`${field}_not_in`]: { ...type, description: WITH_DESC && `${field} is not found in this list` },
})

const generateArithmeticFilters = <Type>(field: string, type: BaseField) => ({
  [`${field}_not`]: { ...type, description: WITH_DESC && `${field} is not this value` },
  [`${field}_lt`]: { ...type, description: WITH_DESC && `${field} is less than this value` },
  [`${field}_lte`]: { ...type, description: WITH_DESC && `${field} is less or equal than this value` },
  [`${field}_gt`]: { ...type, description: WITH_DESC && `${field} is greater than this value` },
  [`${field}_gte`]: { ...type, description: WITH_DESC && `${field} is greater or equal than this value` },
})

const generateStringFilters = <Type>(field: string, type: BaseField) => ({
  [`${field}_contains`]: { ...type, description: WITH_DESC && `${field} contains this part` },
  // [`${field}_not_contains`]: { ...type, description: WITH_DESC && `${field} does not contain this part` },
  [`${field}_starts_with`]: { ...type, description: WITH_DESC && `${field} starts with this part` },
  // [`${field}_not_starts_with`]: { ...type, description: WITH_DESC && `${field} does not start with this part` },
  [`${field}_ends_with`]: { ...type, description: WITH_DESC && `${field} ends with this part` },
  // [`${field}_not_ends_with`]: { ...type, description: WITH_DESC && `${field} does not end with this part` },
})
