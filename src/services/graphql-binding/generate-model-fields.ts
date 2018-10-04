
import {
  GraphQLInputFieldConfig,
  GraphQLInputFieldConfigMap,
  GraphQLInputType,
  isInputType,
} from 'graphql'

import {
  Attribute,
  BaseField,
  BuildConfiguration,
  Field,
  Model,
} from './types'

import {
  nonNullGraphQL,
  toGraphQLList,
} from './utilities'

import {
  Dictionary,
  filter,
  forEach,
  mapValues,
  pickBy,
  reduce,
} from 'lodash'

interface FieldGroup {
  name: string
  field: BaseField
  attribute: Attribute
}

export const mapToGraphQLInputFieldConfigMap = (fields: Dictionary<BaseField>): GraphQLInputFieldConfigMap =>
  // filter all not input types, cast to any as typescript does not recognize this
  pickBy(fields, field => isInputType(field.type)) as any

export type AttributeModifier = (field: FieldGroup, config: BuildConfiguration) => Dictionary<FieldGroup>
export type FieldsModifier = (fields: Dictionary<FieldGroup>, config: BuildConfiguration) => Dictionary<FieldGroup>

export type FieldsMapper = (groups: Dictionary<FieldGroup>) => Dictionary<FieldGroup>
export type FieldGroupUpdater = (group: FieldGroup, name: string) => Dictionary<FieldGroup>
export type FieldGroupsUpdater = (groups: Dictionary<FieldGroup>, name: string, group: FieldGroup) =>
  Dictionary<FieldGroup>

const groupsToFields = (groups: Dictionary<FieldGroup>): Dictionary<BaseField> =>
  mapValues(groups, group => group.field)

const createGroupGenerator = (model: Model, config: BuildConfiguration) => (attribute: Attribute, name: string) => ({
  name,
  attribute,
  field: config.attributeGraphQLMapper(name, attribute, model, config),
})

export const attributeModifiersToFieldsModifier = (attributeModifiers: AttributeModifier[]): FieldsModifier =>
  (fields, config) => reduce(fields, (fields: Dictionary<FieldGroup>, field) =>
    attributeModifiers.reduce((fields, attributeModifier) => ({
      ...fields,
      ...attributeModifier(field, config),
    }), fields), fields)

export const attributeModifiersToFieldsModifierX = (attributeModifiers: AttributeModifier[]): FieldsModifier =>
  (fields, config) =>
    reduce(attributeModifiers, (fields, attributeModifier) =>
      reduce(fields, (fields, field) => ({ ...fields, ...attributeModifier(field, config) }), {})
    , fields)

export const toFieldDictonary = (field: FieldGroup) => ({ [field.name]: field })
export const toFieldDictonaryWithNameDesc = ({ attribute, field }: FieldGroup, name: string, description: string) =>
  toFieldDictonary({
    attribute,
    field: { ...field, description },
    name,
  })

export const allAttributes: AttributeModifier = ({ attribute, field, name }) => toFieldDictonary({
  name,
  attribute,
  field,
})

export const fieldGenerator = (fields: Dictionary<FieldGroup>, config: BuildConfiguration) =>
  (attributeModifiers: AttributeModifier[] = [], fieldsModifiers: FieldsModifier[] = []) =>
    groupsToFields(reduce(
      // walk through the modifiers
      [attributeModifiersToFieldsModifier(attributeModifiers), ...fieldsModifiers],
      // apply each
      (groups, modifier) => modifier(groups, config),
      // for a copy of all the fields
      { ...fields },
    ))

export const createFieldsGenerator = (model: Model, config: BuildConfiguration) =>
  fieldGenerator(mapValues(model.attributes, createGroupGenerator(model, config)), config)

export const toListFieldGroup = (field: FieldGroup): FieldGroup =>
  ({ ...field, field: {...field.field, type: toGraphQLList(field.field.type)} })

export const requiredAttributeModifier: AttributeModifier = ({ attribute, field, name }) => toFieldDictonary({
  name,
  attribute,
  field: attribute.allowNull ? field : { ...field, type: nonNullGraphQL(field.type) },
})

export const listAttributeTypeModifier: AttributeModifier = ({ attribute, field, name }, config) => toFieldDictonary({
  name,
  attribute,
  field: config.isListAttribute(attribute.type) ? { ...field, type: toGraphQLList(field.type) } : field,
})

export const stringAttributeModifier: AttributeModifier = (field, config) =>
  !config.isStringAttribute(field.attribute.type) ? toFieldDictonary(field) : {
    ...toFieldDictonaryWithNameDesc(field, `${field.name}_contains`, `${field.name} contains this part`),
    ...toFieldDictonaryWithNameDesc(field, `${field.name}_starts_with`, `${field.name} starts with this part`),
    ...toFieldDictonaryWithNameDesc(field, `${field.name}_ends_with`, `${field.name} ends with this part`),
  }

export const listAttributeModifier: AttributeModifier = (field, config) =>
  !config.isListAttribute(field.attribute.type) ? toFieldDictonary(field) : {
    ...toFieldDictonaryWithNameDesc(
      toListFieldGroup(field), `${field.name}_in`, `${field.name} is found in this list`,
    ),
    ...toFieldDictonaryWithNameDesc(
      toListFieldGroup(field), `${field.name}_not_in`, `${field.name} is not found in this list`,
    ),
  }

export const arithmeticAttributeModifier: AttributeModifier = (field, config) =>
  !config.isArithmeticAttribute(field.attribute.type) ? toFieldDictonary(field) : {
    ...toFieldDictonaryWithNameDesc(field, `${field.name}_not`, `${field.name} is not this value`),
    ...toFieldDictonaryWithNameDesc(field, `${field.name}_lt`, `${field.name} is less than this value`),
    ...toFieldDictonaryWithNameDesc(field, `${field.name}_lte`, `${field.name} is less or equal than this value`),
    ...toFieldDictonaryWithNameDesc(field, `${field.name}_gt`, `${field.name} is greater than this value`),
    ...toFieldDictonaryWithNameDesc(field, `${field.name}_gte`, `${field.name} is greater or equal than this value`),
  }

const filterFields = (fields: Dictionary<FieldGroup>, fieldFilter: (field: FieldGroup) => boolean) => {
  const result: Dictionary<FieldGroup> = {}
  filter(fields, fieldFilter).forEach(field => result[field.name] = field)
  return result
}

export const createFilterModifier = (fieldFilter: (field: FieldGroup) => boolean): FieldsModifier =>
  fields => filterFields(fields, fieldFilter)

export const orderAttributeModifier: AttributeModifier = (field, config) => toFieldDictonary(field)

export const removeDescriptionAttributeModifier: AttributeModifier = field => {
  delete field.field.description
  return toFieldDictonary(field)
}

export const removeInvisibleAttributes: FieldsModifier = fields =>
  filterFields(fields, ({ attribute }) =>
    attribute.hasOwnProperty('visible') ? attribute.visible : true)

export const removeDescriptionModifier: FieldsModifier = (fields, config) => {
  forEach(fields, field => removeDescriptionAttributeModifier(field, config))
  return fields
}

export const removeNotUpdateableModifier: FieldsModifier = fields =>
  filterFields(fields, ({ attribute }) => attribute.hasOwnProperty('allowUpdate') ? attribute.allowUpdate : true)

export const AttributeModifiers = {
  allAttributes,
  arithmeticAttributeModifier,
  listAttributeModifier,
  listAttributeTypeModifier,
  removeDescriptionAttributeModifier,
  removeNotUpdateableModifier,
  requiredAttributeModifier,
  stringAttributeModifier,
}
