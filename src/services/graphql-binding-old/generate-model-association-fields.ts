import { GraphQLType } from 'graphql'
import { each, filter, map } from 'lodash'

import { convertAttributeToField } from './convert-attribute-to-field'
import { generateModelFields } from './generate-model-fields'
import { BuildConfiguration, Field, FieldFactory, ListItem, Model } from './types'
import { arrayConcat, listMapFn, toGraphQLList } from './utilities'

export const toListItem = <Type>(value: Type, name: string) => ({ name, value })

export const generateModelAssociationFields = (model: Model, models: Model[], config: BuildConfiguration) => {
  const availableModels: Record<string, Model> = {}
  each(models, model => (availableModels[model.name] = model))

  return map(model.associations, (association, name) => name).filter(name => !!availableModels[name])
}
