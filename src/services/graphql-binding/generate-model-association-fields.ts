import { convertAttributeToField } from './convert-attribute-to-field'
import { BuildConfiguration, Field, FieldFactory, ListItem, Model } from './types'
import { arrayConcat, listMapFn, toGraphQLList } from './utilities'
import { generateModelFields } from './generate-model-fields'
import { GraphQLType } from 'graphql'
import { each, filter, map } from 'lodash'

export const toListItem = <Type>(value: Type, name: string) => ({ name, value })

export const generateModelAssociationFields = (model: Model, models: Model[], config: BuildConfiguration) => {
  const availableModels: Record<string, Model> = {}
  each(models, model => (availableModels[model.name] = model))

  return map(model.associations, (association, name) => name).filter(name => !!availableModels[name])
}
